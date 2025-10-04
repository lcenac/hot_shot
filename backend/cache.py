from cachetools import TTLCache

# Cache with max 100 items and 5 minutes TTL
cache = TTLCache(maxsize=100, ttl=300)
