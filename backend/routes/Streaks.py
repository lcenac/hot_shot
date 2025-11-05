from fastapi import APIRouter, HTTPException, Query
from py_ball.league import League
from py_ball.player import Player
import asyncio
from datetime import datetime

# ✅ Import pre-defined caches
from cache import player_list_cache, player_stats_cache, player_game_cache, streak_cache

router = APIRouter()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://www.nba.com/",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.nba.com"
}

# ✅ Current season configuration
CURRENT_SEASON = "2025-26"


# --- Fetch single player stats ---
async def fetch_player_stats(pid: int, name: str, team: str, games: int) -> dict:
    """Fetch last N game logs for a single player, with per-player caching."""
    cache_key = f"player_stats_{pid}_{games}_{CURRENT_SEASON}"

    if cache_key in player_stats_cache:
        return player_stats_cache[cache_key]

    try:
        player = Player(
            headers=HEADERS,
            player_id=str(pid),
            season=CURRENT_SEASON,
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

        # ✅ Get required stat indices
        try:
            fgm_idx = headers.index("FGM")
            fga_idx = headers.index("FGA")
            fg3m_idx = headers.index("FG3M")
            fg3a_idx = headers.index("FG3A")
            matchup_idx = headers.index("MATCHUP")
            game_date_idx = headers.index("GAME_DATE")
        except ValueError:
            return None

        # ✅ Only use games where player actually played (has attempts)
        recent = [r for r in rows[:games] if r[fga_idx] and r[fga_idx] > 0]
        
        # ✅ Require minimum games played
        if len(recent) < min(5, games):
            return None

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
            "games_played": len(recent),
            "fg_pct": fg_pct,
            "fg3_pct": fg3_pct,
            "fgm": total_fgm,
            "fga": total_fga,
            "fg3m": total_3m,
            "fg3a": total_3a
        }

        player_stats_cache[cache_key] = result
        return result

    except Exception as e:
        print(f"Error fetching stats for {name}: {str(e)}")
        return None


# --- Main endpoint: hot/cold streaks ---
@router.get("/")
async def get_streaks(
    games: int = Query(10, ge=1, le=82, description="Number of games to analyze (10, 15, or 20 recommended)"),
    limit: int = Query(0, description="Limit number of players processed (0 = all players)"),
    min_attempts: int = Query(5, description="Minimum FG attempts per game to qualify")
):
    """Fetch hot/cold streaks concurrently for players, with caching."""
    cache_key = f"streaks_{games}_{limit}_{CURRENT_SEASON}"

    # ✅ Return cached result if available
    if cache_key in streak_cache:
        print("[CACHE] Using cached streak results")
        return streak_cache[cache_key]

    try:
        # 1️⃣ Get all active players — use cached roster if available
        roster_cache_key = f"player_list_{CURRENT_SEASON}"
        if roster_cache_key in player_list_cache:
            players_rows, headers = player_list_cache[roster_cache_key]
            print("[CACHE] Using cached player list")
        else:
            print("[FETCH] Fetching fresh player list...")
            league = League(
                headers=HEADERS, 
                endpoint="commonallplayers", 
                current_season="1", 
                season=CURRENT_SEASON
            )
            resp = league.api_resp
            result_sets = resp.get("resultSets", [])
            if not result_sets:
                raise HTTPException(status_code=500, detail="No players returned")

            players_rows = result_sets[0].get("rowSet", [])
            headers = result_sets[0].get("headers", [])
            player_list_cache[roster_cache_key] = (players_rows, headers)

        pid_idx = headers.index("PERSON_ID")
        name_idx = headers.index("DISPLAY_FIRST_LAST")
        team_idx = headers.index("TEAM_ABBREVIATION")

        # ✅ Filter out players without teams (free agents)
        active_players = [row for row in players_rows if row[team_idx]]

        if limit > 0:
            active_players = active_players[:limit]

        print(f"[INFO] Processing {len(active_players)} players...")

        # 2️⃣ Fetch all players concurrently
        tasks = [
            fetch_player_stats(row[pid_idx], row[name_idx], row[team_idx], games)
            for row in active_players
        ]
        streak_data = await asyncio.gather(*tasks)

        # 3️⃣ Filter out invalid results and apply minimum attempts filter
        streak_data = [
            p for p in streak_data 
            if p and p["fga"] >= (min_attempts * p["games_played"])
        ]

        if not streak_data:
            raise HTTPException(status_code=404, detail="No player streaks collected")

        # 4️⃣ Compute hot and cold streaks
        hot_fg = sorted(streak_data, key=lambda x: x["fg_pct"], reverse=True)[:10]
        cold_fg = sorted(streak_data, key=lambda x: x["fg_pct"])[:10]
        
        # ✅ Filter for 3PT shooters (at least 2 attempts per game)
        three_point_shooters = [p for p in streak_data if p["fg3a"] >= (2 * p["games_played"])]
        hot_3p = sorted(three_point_shooters, key=lambda x: x["fg3_pct"], reverse=True)[:10]
        cold_3p = sorted(three_point_shooters, key=lambda x: x["fg3_pct"])[:10]

        result = {
            "success": True,
            "season": CURRENT_SEASON,
            "games": games,
            "players_analyzed": len(streak_data),
            "hot_fg_streaks": hot_fg,
            "cold_fg_streaks": cold_fg,
            "hot_3p_streaks": hot_3p,
            "cold_3p_streaks": cold_3p,
            "last_updated": datetime.utcnow().isoformat()
        }

        # ✅ Cache final streak result
        streak_cache[cache_key] = result
        print("[CACHE] Cached new streak results")

        return result

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Additional endpoint for multiple game spans ---
@router.get("/multi-span")
async def get_multi_span_streaks(
    limit: int = Query(0, description="Limit number of players processed (0 = all players)")
):
    """Fetch streaks for 10, 15, and 20 game spans at once."""
    
    try:
        results = {}
        for game_span in [10, 15, 20]:
            result = await get_streaks(games=game_span, limit=limit)
            results[f"{game_span}_games"] = result
        
        return {
            "success": True,
            "season": CURRENT_SEASON,
            "spans": results,
            "last_updated": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))