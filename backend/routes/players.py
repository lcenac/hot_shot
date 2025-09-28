from fastapi import APIRouter
from nba_api.stats.static import players
from cache import cache

router = APIRouter()

@router.get("/players")
def get_players(name: str = None):
    # Check cache
    key = f"players:{name}" if name else "players:all"
    if key in cache:
        return cache[key]

    all_players = players.get_players()  # list of dicts with player info
    
    if name:
        filtered = [p for p in all_players if name.lower() in p["full_name"].lower()]
    else:
        filtered = all_players

    cache[key] = filtered
    return filtered
