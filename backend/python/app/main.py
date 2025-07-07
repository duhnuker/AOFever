import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging import logger
from contextlib import asynccontextmanager
from app.models.ml_models import load_models
from app.api.routes.predictions import router as predictions_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    
    yield
    
    logger.info("Application shutting down")

app = FastAPI(
    title="AOFever ML API", 
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(predictions_router)

@app.get("/")
async def root():
    return {"message": "AOFever ML API is running"}

if __name__ == "__main__":
    from uvicorn import run
    run(app, host="0.0.0.0", port=8000)
