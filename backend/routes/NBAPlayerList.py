# routes/NPlayers.py
from fastapi import APIRouter, HTTPException
import requests
from cache import player_list_cache  # import your shared cache instance

router = APIRouter()

NBA_PLAYERS_URL = "https://stats.nba.com/stats/commonallplayers"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://www.nba.com/",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.nba.com"
}


@router.get("/")
def get_nba_players(season: str = "2024"):
    """
    Fetch NBA players for a given season.
    Uses TTL cache to avoid hammering the NBA API.
    """
    cache_key = f"nba_players_{season}"

    # 1️⃣ Check if cached
    if cache_key in player_list_cache:
        return player_list_cache[cache_key]

    params = {
        "LeagueID": "00",  # NBA league ID
        "Season": season,
        "IsOnlyCurrentSeason": 1
    }

    try:
        response = requests.get(NBA_PLAYERS_URL, headers=HEADERS, params=params, timeout=15)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch NBA players")

        data = response.json()
        result_sets = data.get("resultSets", [])
        players = []

        for rs in result_sets:
            if rs.get("name") == "CommonAllPlayers":
                headers = rs.get("headers", [])
                rows = rs.get("rowSet", [])
                for row in rows:
                    player = dict(zip(headers, row))
                    players.append(player)
                break

        # 2️⃣ Cache the result for future calls
        player_list_cache[cache_key] = players

        return players

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request error: {e}")
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"JSON parsing error: {e}")
