from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import WPlayerList, WPlayerStats, NBAPlayerList, NBAPlayerStats


app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
   allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(WPlayerList.router, prefix="/api/players", tags=["players"])
app.include_router(WPlayerStats.router, prefix="/api/player", tags=["player"]) 
app.include_router(NBAPlayerList.router, prefix="/api/NBAplayers", tags=["players"]) 
app.include_router(NBAPlayerStats.router, prefix="/api/NBAplayer", tags=["player"]) 
@app.get("/")
def root():
    return {"message": "Hot Shot API is running!"}

