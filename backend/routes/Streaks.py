from fastapi import APIRouter, HTTPException, Query
from py_ball.league import League
from py_ball.player import Player
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Tuple
from dataclasses import dataclass

from cache import player_list_cache, player_stats_cache, streak_cache

router = APIRouter()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://www.nba.com/",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.nba.com"
}

CURRENT_SEASON = "2025-26"
BATCH_SIZE = 50

@dataclass
class Thresholds:
    hot_fg_min: float = 50.0
    cold_fg_max: float = 40.0
    hot_3fg_min: float = 40.0
    cold_3fg_max: float = 30.0
    min_attempts: int = 5
    min_3p_attempts: float = 1.0


@dataclass
class PlayerStats:
    player_id: int
    name: str
    team: str
    games_played: int
    fg_pct: float
    fg3_pct: float
    fgm: int
    fga: int
    fg3m: int
    fg3a: int


def calculate_percentage(made: int, attempted: int) -> float:
    return round((made / attempted) * 100, 1) if attempted else 0.0


def extract_game_stats(rows: List, headers: List, games: int) -> Optional[Tuple]:
    required_fields = ["FGM", "FGA", "FG3M", "FG3A", "MATCHUP", "GAME_DATE"]
    try:
        indices = {field: headers.index(field) for field in required_fields}
    except ValueError:
        return None

    recent_games = [r for r in rows[:games] if r[indices["FGA"]] and r[indices["FGA"]] > 0]
    
    if len(recent_games) < min(5, games):
        return None

    totals = {
        "fgm": sum(r[indices["FGM"]] or 0 for r in recent_games),
        "fga": sum(r[indices["FGA"]] or 0 for r in recent_games),
        "fg3m": sum(r[indices["FG3M"]] or 0 for r in recent_games),
        "fg3a": sum(r[indices["FG3A"]] or 0 for r in recent_games),
    }

    return totals, len(recent_games)


async def fetch_player_stats(pid: int, name: str, team: str, games: int) -> Optional[Dict]:
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

        result_sets = player.api_resp.get("resultSets", [])
        if not result_sets:
            return None

        rows = result_sets[0].get("rowSet", [])
        headers = result_sets[0].get("headers", [])

        if not rows or not headers:
            return None

        game_data = extract_game_stats(rows, headers, games)
        if not game_data:
            return None

        totals, games_played = game_data

        result = {
            "player_id": pid,
            "name": name,
            "team": team,
            "games_played": games_played,
            "fg_pct": calculate_percentage(totals["fgm"], totals["fga"]),
            "fg3_pct": calculate_percentage(totals["fg3m"], totals["fg3a"]),
            **totals
        }

        player_stats_cache[cache_key] = result
        return result

    except Exception as e:
        print(f"Error fetching stats for {name}: {str(e)}")
        return None


async def get_active_players() -> Tuple[List, List]:
    roster_cache_key = f"player_list_{CURRENT_SEASON}"
    
    if roster_cache_key in player_list_cache:
        print("[CACHE] Using cached player list")
        return player_list_cache[roster_cache_key]

    print("[FETCH] Fetching fresh player list...")
    league = League(
        headers=HEADERS,
        endpoint="commonallplayers",
        current_season="1",
        season=CURRENT_SEASON
    )
    
    result_sets = league.api_resp.get("resultSets", [])
    if not result_sets:
        raise HTTPException(status_code=500, detail="No players returned")

    players_rows = result_sets[0].get("rowSet", [])
    headers = result_sets[0].get("headers", [])
    
    player_list_cache[roster_cache_key] = (players_rows, headers)
    return players_rows, headers


async def fetch_players_in_batches(active_players: List, headers: List, games: int) -> List[Dict]:
    pid_idx = headers.index("PERSON_ID")
    name_idx = headers.index("DISPLAY_FIRST_LAST")
    team_idx = headers.index("TEAM_ABBREVIATION")

    all_results = []
    
    for i in range(0, len(active_players), BATCH_SIZE):
        batch = active_players[i:i+BATCH_SIZE]
        print(f"[INFO] Processing batch {i//BATCH_SIZE + 1}/{(len(active_players)-1)//BATCH_SIZE + 1}")
        
        tasks = [
            fetch_player_stats(row[pid_idx], row[name_idx], row[team_idx], games)
            for row in batch
        ]
        batch_results = await asyncio.gather(*tasks)
        all_results.extend(batch_results)
        
        if i + BATCH_SIZE < len(active_players):
            await asyncio.sleep(0.1)
    
    return all_results


def filter_qualified_players(players: List[Dict], thresholds: Thresholds) -> List[Dict]:
    return [
        p for p in players 
        if p and p["fga"] >= (thresholds.min_attempts * p["games_played"])
    ]


def get_streaks_by_category(
    players: List[Dict], 
    thresholds: Thresholds, 
    show_all: bool
) -> Dict:
    result_limit = None if show_all else 10
    
    hot_fg = sorted(
        [p for p in players if p["fg_pct"] >= thresholds.hot_fg_min],
        key=lambda x: x["fg_pct"],
        reverse=True
    )[:result_limit]
    
    cold_fg = sorted(
        [p for p in players if p["fg_pct"] <= thresholds.cold_fg_max],
        key=lambda x: x["fg_pct"]
    )[:result_limit]
    
    three_point_shooters = [
        p for p in players 
        if p["fg3a"] >= (thresholds.min_3p_attempts * p["games_played"])
    ]
    
    hot_3p = sorted(
        [p for p in three_point_shooters if p["fg3_pct"] >= thresholds.hot_3fg_min],
        key=lambda x: x["fg3_pct"],
        reverse=True
    )[:result_limit]
    
    cold_3p = sorted(
        [p for p in three_point_shooters if p["fg3_pct"] <= thresholds.cold_3fg_max],
        key=lambda x: x["fg3_pct"]
    )[:result_limit]
    
    return {
        "hot_fg_streaks": hot_fg,
        "cold_fg_streaks": cold_fg,
        "hot_3p_streaks": hot_3p,
        "cold_3p_streaks": cold_3p
    }


@router.get("/")
async def get_streaks(
    games: int = Query(10, ge=1, le=82),
    limit: int = Query(0),
    min_attempts: int = Query(5),
    min_3p_attempts: float = Query(1.0),
    hot_fg_min: float = Query(50.0),
    cold_fg_max: float = Query(40.0),
    hot_3fg_min: float = Query(40.0),
    cold_3fg_max: float = Query(30.0),
    use_cache: bool = Query(True),
    show_all: bool = Query(False)
):
    thresholds = Thresholds(
        hot_fg_min=hot_fg_min,
        cold_fg_max=cold_fg_max,
        hot_3fg_min=hot_3fg_min,
        cold_3fg_max=cold_3fg_max,
        min_attempts=min_attempts,
        min_3p_attempts=min_3p_attempts
    )
    
    cache_key = f"streaks_{games}_{limit}_{min_attempts}_{min_3p_attempts}_{hot_fg_min}_{cold_fg_max}_{hot_3fg_min}_{cold_3fg_max}_{show_all}_{CURRENT_SEASON}"

    if use_cache and cache_key in streak_cache:
        print("[CACHE HIT] Using cached streak results")
        return {**streak_cache[cache_key], "from_cache": True, "cache_key": cache_key}

    print(f"[CACHE MISS] Computing new results")

    try:
        players_rows, headers = await get_active_players()
        team_idx = headers.index("TEAM_ABBREVIATION")
        
        active_players = [row for row in players_rows if row[team_idx]]
        
        if limit > 0:
            active_players = active_players[:limit]
            print(f"[INFO] Limiting to {limit} players")
        else:
            print(f"[INFO] Processing all {len(active_players)} active players")

        all_player_stats = await fetch_players_in_batches(active_players, headers, games)
        qualified_players = filter_qualified_players(all_player_stats, thresholds)

        if not qualified_players:
            raise HTTPException(status_code=404, detail="No player streaks collected")

        streaks = get_streaks_by_category(qualified_players, thresholds, show_all)

        result = {
            "success": True,
            "season": CURRENT_SEASON,
            "games": games,
            "players_analyzed": len(qualified_players),
            "players_fetched": len(active_players),
            "from_cache": False,
            "show_all": show_all,
            "thresholds": {
                "hot_fg_min": hot_fg_min,
                "cold_fg_max": cold_fg_max,
                "hot_3fg_min": hot_3fg_min,
                "cold_3fg_max": cold_3fg_max,
                "min_3p_attempts": min_3p_attempts
            },
            **streaks,
            "last_updated": datetime.utcnow().isoformat()
        }

        streak_cache[cache_key] = result
        print("[CACHE] Cached new streak results")

        return result

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/multi-span")
async def get_multi_span_streaks(
    limit: int = Query(0),
    min_3p_attempts: float = Query(1.0),
    hot_fg_min: float = Query(50.0),
    cold_fg_max: float = Query(40.0),
    hot_3fg_min: float = Query(40.0),
    cold_3fg_max: float = Query(30.0)
):
    try:
        results = {}
        for game_span in [10, 15, 20]:
            result = await get_streaks(
                games=game_span,
                limit=limit,
                min_3p_attempts=min_3p_attempts,
                hot_fg_min=hot_fg_min,
                cold_fg_max=cold_fg_max,
                hot_3fg_min=hot_3fg_min,
                cold_3fg_max=cold_3fg_max
            )
            results[f"{game_span}_games"] = result

        return {
            "success": True,
            "season": CURRENT_SEASON,
            "spans": results,
            "last_updated": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))