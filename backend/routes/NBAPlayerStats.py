# backend/routes/NPlayerStats.py
from fastapi import APIRouter, HTTPException
import requests
from cache import player_stats_cache  # import your shared cache instance

router = APIRouter()

NBA_PLAYER_STATS_URL = "https://stats.nba.com/stats/playercareerstats"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://www.nba.com/",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.nba.com"
}


@router.get("/{player_id}")
def get_nba_player_stats(player_id: int):
    """
    Fetch NBA player stats for a given player_id.
    Returns the most recent season totals.
    """

  
    cache_key = f"nba_player_stats_{player_id}"
    if cache_key in player_stats_cache:
        return player_stats_cache[cache_key]

    try:
        params = {
            "PlayerID": player_id,
            "PerMode": "PerGame",
            "LeagueID": "00" 
        }

        response = requests.get(NBA_PLAYER_STATS_URL, headers=HEADERS, params=params, timeout=15)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch NBA player stats")

        data = response.json()
        result_sets = data.get("resultSets", [])

       
        season_stats = None
        for rs in result_sets:
            if rs.get("name") == "SeasonTotalsRegularSeason":
                headers = rs.get("headers", [])
                rows = rs.get("rowSet", [])
                if rows:
                    season_stats = dict(zip(headers, rows[-1]))
                break

        if not season_stats:
            result = {"success": False, "error": "No stats found for this player"}
        else:
            
            filtered = {
                "season": season_stats.get("SEASON_ID"),
                "team": season_stats.get("TEAM_ABBREVIATION"),
                "team_id": season_stats.get("TEAM_ID"), 
                "PTS": season_stats.get("PTS"),
                "REB": season_stats.get("REB"),
                "AST": season_stats.get("AST"),
                "FG_PCT": season_stats.get("FG_PCT"),
            }
            result = {"success": True, "stats": filtered}

        
        player_stats_cache[cache_key] = result

        return result

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request error: {e}")
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"JSON parsing error: {e}")


@router.get("/team-logo/{team_id}")
def get_team_logo(team_id: str, season: str):
   
    
 
    cache_key = f"team_logo_{team_id}_{season}"
    if cache_key in player_stats_cache:
        return player_stats_cache[cache_key]
    
 
    logo_url = f"https://cdn.nba.com/logos/nba/{team_id}/primary/L/logo.svg"
    
    result = {"success": True, "logo_url": logo_url}
    
 
    player_stats_cache[cache_key] = result
    
    return result
