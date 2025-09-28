from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import schedule

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schedule.router, prefix="/api/schedule", tags=["schedule"])

@app.get("/")
def root():
    return {"message": "Hot Shot API is running!"}