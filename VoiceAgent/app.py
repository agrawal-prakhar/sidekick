from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(title="Voice Agent API")

@app.get("/")
async def root():
    return {"message": "Voice Agent API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 