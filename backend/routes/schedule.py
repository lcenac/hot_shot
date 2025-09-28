from fastapi import APIRouter
import requests
from datetime import datetime
from cache import cache
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

API_KEY = os.getenv("SPORTRADAR_API_KEY")

router = APIRouter()

@router.get("/")
def get_todays_schedule():
    # Use cached data if available
    if "data" in cache:
        return cache["data"]

    # Get today's date
    today = datetime.today()
    year = today.year
    month = f"{today.month:02d}"
    day = f"{today.day:02d}"

    # Construct API URL
    API_URL = f"https://api.sportradar.com/wnba/trial/v8/en/games/{year}/{month}/{day}/schedule.json?api_key={API_KEY}"

    # Fetch data
    response = requests.get(API_URL)
    response.raise_for_status()
    data = response.json()

    # Cache data
    cache["data"] = data

    return data
