from fastapi import APIRouter, HTTPException, Query
from py_ball.league import League
from py_ball.player import Player
import asyncio

# ✅ Import pre-defined caches
from backend.cache import player_list_cache, player_stats_cache, player_game_cache, streak_cache

router = APIRouter()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://www.nba.com/",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.nba.com"
}


# --- Fetch single player stats ---
async def fetch_player_stats(pid: int, name: str, team: str, games: int) -> dict:
    """Fetch last N game logs for a single player, with per-player caching."""
    cache_key = f"player_stats_{pid}_{games}"

    if cache_key in player_stats_cache:
        return player_stats_cache[cache_key]

    try:
        player = Player(
            headers=HEADERS,
            player_id=str(pid),
            season="2024-25",
            endpoint="playergamelog",
            season_type="Regular Season",
            per_mode="Totals"
        )

        logs = player.api_resp.get("resultSets", [])
        if not logs:
            return None

        rows = logs[0].get("rowSet", [])
        headers = logs[0].get("headers", [])

        if not rows or not headers:
            return None

        try:
            fgm_idx = headers.index("FGM")
            fga_idx = headers.index("FGA")
            fg3m_idx = headers.index("FG3M")
            fg3a_idx = headers.index("FG3A")
        except ValueError:
            return None

        recent = rows[:games]
        total_fgm = sum([r[fgm_idx] or 0 for r in recent])
        total_fga = sum([r[fga_idx] or 0 for r in recent])
        total_3m = sum([r[fg3m_idx] or 0 for r in recent])
        total_3a = sum([r[fg3a_idx] or 0 for r in recent])

        fg_pct = round((total_fgm / total_fga) * 100, 1) if total_fga else 0
        fg3_pct = round((total_3m / total_3a) * 100, 1) if total_3a else 0

        result = {
            "player_id": pid,
            "name": name,
            "team": team,
            "fg_pct": fg_pct,
            "fg3_pct": fg3_pct
        }

        player_stats_cache[cache_key] = result
        return result

    except Exception:
        return None


# --- Main endpoint: hot/cold streaks ---
@router.get("/")
async def get_streaks(
    games: int = Query(10, ge=1, le=82),
    limit: int = Query(10, description="Limit number of players processed")
):
    """Fetch hot/cold streaks concurrently for players, with caching."""
    cache_key = f"streaks_{games}_{limit}"

    # ✅ Return cached result if available
    if cache_key in streak_cache:
        print("✅ Using cached streak results")
        return streak_cache[cache_key]

    try:
        # 1️⃣ Get all active players — use cached roster if available
        if "player_list" in player_list_cache:
            players_rows, headers = player_list_cache["player_list"]
        else:
            league = League(headers=HEADERS, endpoint="commonallplayers", current_season="1", season="2024-25")
            resp = league.api_resp
            result_sets = resp.get("resultSets", [])
            if not result_sets:
                raise HTTPException(status_code=500, detail="No players returned")

            players_rows = result_sets[0].get("rowSet", [])
            headers = result_sets[0].get("headers", [])
            player_list_cache["player_list"] = (players_rows, headers)

        pid_idx = headers.index("PERSON_ID")
        name_idx = headers.index("DISPLAY_FIRST_LAST")
        team_idx = headers.index("TEAM_ABBREVIATION")

        if limit > 0:
            players_rows = players_rows[:limit]

        # 2️⃣ Fetch all players concurrently
        tasks = [
            fetch_player_stats(row[pid_idx], row[name_idx], row[team_idx], games)
            for row in players_rows
        ]
        streak_data = await asyncio.gather(*tasks)

        # 3️⃣ Filter out invalid results
        streak_data = [p for p in streak_data if p]

        if not streak_data:
            raise HTTPException(status_code=404, detail="No player streaks collected")

        # 4️⃣ Compute hot and cold streaks
        hot = sorted(streak_data, key=lambda x: x["fg_pct"], reverse=True)[:10]
        cold = sorted(streak_data, key=lambda x: x["fg_pct"])[:10]

        result = {
            "success": True,
            "games": games,
            "hot_streaks": hot,
            "cold_streaks": cold
        }

        # ✅ Cache final streak result for 5 hours
        streak_cache[cache_key] = result
        print("♻️ Cached new streak results")

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
