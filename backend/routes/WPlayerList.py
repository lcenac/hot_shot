from fastapi import APIRouter, HTTPException
import requests
from cache import player_list_cache # optional caching

router = APIRouter()

WNBA_PLAYERS_URL = "https://stats.nba.com/stats/commonallplayers"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://www.nba.com/wnba/",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.nba.com"
}

@router.get("/")
def get_wnba_players(is_only_current_season: int = 1, season: str = "2025"):
    """
    Fetch all WNBA players for the given season.
    """
    # Check cache first
    cache_key = f"players_{season}_{is_only_current_season}"
    if cache_key in player_list_cache:
        return player_list_cache[cache_key]

    params = {
        "IsOnlyCurrentSeason": is_only_current_season,
        "LeagueID": "10",  # WNBA league ID
        "Season": season
    }
    

    try:
        response = requests.get(WNBA_PLAYERS_URL, headers=HEADERS, params=params, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch WNBA players")

        data = response.json()
        players_data = data.get("resultSets", [])[0]  # "resultSets" contains the player info

        headers = players_data.get("headers", [])
        rows = players_data.get("rowSet", [])

        # Convert rows to list of dicts
        players_list = [dict(zip(headers, row)) for row in rows]

        # Cache the result
        player_list_cache[cache_key] = players_list

        return players_list

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request error: {e}")
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"JSON parsing error: {e}")
# from fastapi import APIRouter, HTTPException
# import requests
# from cache import cache  # optional caching

# router = APIRouter()

# WNBA_PLAYERS_URL = "https://wehoop.sportsdataverse.org/api/wnba_commonallplayers"
# HEADERS = {
#     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
#     "Accept": "application/json",
#     "Origin": "https://www.nba.com"
# }

# @router.get("/")
# def get_wnba_players(is_only_current_season: int = 1, season: str = "2025"):
#     """
#     Fetch all WNBA players for the given season.
#     """
#     # Check cache first
#     cache_key = f"players_{season}_{is_only_current_season}"
#     if cache_key in cache:
#         return cache[cache_key]

#     params = {
#         "IsOnlyCurrentSeason": is_only_current_season,
#         "LeagueID": "10",  # WNBA league ID
#         "Season": season
#     }

#     try:
#         response = requests.get(WNBA_PLAYERS_URL, headers=HEADERS, params=params, timeout=10)
#         if response.status_code != 200:
#             raise HTTPException(status_code=response.status_code, detail="Failed to fetch WNBA players")

#         data = response.json()
#         players_data = data.get("resultSets", [])[0]  # "resultSets" contains the player info

#         headers = players_data.get("headers", [])
#         rows = players_data.get("rowSet", [])

#         # Convert rows to list of dicts
#         players_list = [dict(zip(headers, row)) for row in rows]

#         # Cache the result
#         cache[cache_key] = players_list

#         return players_list

#     except requests.RequestException as e:
#         raise HTTPException(status_code=500, detail=f"Request error: {e}")
#     except ValueError as e:
#         raise HTTPException(status_code=500, detail=f"JSON parsing error: {e}")
