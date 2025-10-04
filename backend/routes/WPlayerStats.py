# backend/routes/WPlayerStats.py
from fastapi import APIRouter, HTTPException
import requests

router = APIRouter()

WNBA_PLAYER_STATS_URL = "https://stats.nba.com/stats/playercareerstats"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://www.wnba.com/",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.wnba.com"
}

@router.get("/{player_id}")
def get_wnba_player_stats(player_id: int):
    """
    Fetch WNBA player stats for a given player_id.
    Returns the most recent season totals.
    """
    try:
        params = {
            "PlayerID": player_id,
            "PerMode": "PerGame",
            "LeagueID": "10"  # WNBA league ID
        }

        response = requests.get(WNBA_PLAYER_STATS_URL, headers=HEADERS, params=params, timeout=15)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch WNBA player stats")

        data = response.json()
        result_sets = data.get("resultSets", [])

        # We care about "SeasonTotalsRegularSeason"
        season_stats = None
        for rs in result_sets:
            if rs.get("name") == "SeasonTotalsRegularSeason":
                headers = rs.get("headers", [])
                rows = rs.get("rowSet", [])
                if rows:
                    season_stats = dict(zip(headers, rows[-1]))  # last season
                break

        if not season_stats:
            return {"success": False, "error": "No stats found for this player"}

        # Filter down to key stats
        filtered = {
            "season": season_stats.get("SEASON_ID"),
            "team": season_stats.get("TEAM_ABBREVIATION"),
            "PTS": season_stats.get("PTS"),
            "REB": season_stats.get("REB"),
            "AST": season_stats.get("AST"),
            "FG_PCT": season_stats.get("FG_PCT"),
        }

        return {"success": True, "stats": filtered}

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request error: {e}")
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"JSON parsing error: {e}")
