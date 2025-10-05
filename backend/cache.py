from cachetools import TTLCache
from collections import deque
# Cache with max 100 items and 5 minutes TTL

player_list_cache = TTLCache(maxsize=200, ttl=3600)  # last season rosters
player_stats_cache = TTLCache(maxsize=200, ttl=3600)  # per player
player_game_cache = TTLCache(maxsize=200, ttl=3600)  # last 10 games per player
streak_cache = TTLCache(maxsize=200, ttl=3600)    
