from cachetools import TTLCache
from collections import deque

# Existing caches
player_list_cache = TTLCache(maxsize=200, ttl=3600)   
player_stats_cache = TTLCache(maxsize=200, ttl=3600)
player_game_cache = TTLCache(maxsize=200, ttl=3600)
streak_cache = TTLCache(maxsize=50, ttl=18000)
