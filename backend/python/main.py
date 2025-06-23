from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import joblib
import numpy as np
from typing import Optional
import os
import logging
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

model = None
MODEL_PATH = "ao_head_to_head_predictor.pkl"

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            logger.info(f"Model loaded successfully from {MODEL_PATH}")
        else:
            logger.warning(f"Model file {MODEL_PATH} not found. Please train the model first.")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
    
    yield
    
    logger.info("Application shutting down")

app = FastAPI(
    title="AOFever ML API", 
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PlayerStats(BaseModel):
    rank: str
    points: str
    date: str

class PredictionRequest(BaseModel):
    player1: str
    player2: str
    surface: str
    round: str
    best_of: str
    player1Odds: str
    player2Odds: str
    player1Stats: PlayerStats
    player2Stats: PlayerStats

class PredictionResponse(BaseModel):
    winner: str
    confidence: float

def safe_float_conversion(value: str, default: float) -> float:
    try:
        return float(value) if value and value.strip() else default
    except (ValueError, TypeError):
        return default

def safe_int_conversion(value: str, default: int) -> int:
    try:
        return int(value) if value and value.strip() else default
    except (ValueError, TypeError):
        return default

def prepare_prediction_features(request: PredictionRequest) -> pd.DataFrame:
    player1_rank = safe_float_conversion(request.player1Stats.rank, 1000.0)
    player2_rank = safe_float_conversion(request.player2Stats.rank, 1000.0)
    player1_points = safe_float_conversion(request.player1Stats.points, 0.0)
    player2_points = safe_float_conversion(request.player2Stats.points, 0.0)
    player1_odds = safe_float_conversion(request.player1Odds, 1.5)
    player2_odds = safe_float_conversion(request.player2Odds, 1.5)
    best_of_int = safe_int_conversion(request.best_of, 5)
    
    rank_diff = player1_rank - player2_rank
    pts_diff = player1_points - player2_points
    odd_ratio_log = np.log(player1_odds / player2_odds) if player2_odds > 0 else 0.0
    
    return pd.DataFrame([{
        'Surface': request.surface,
        'Round': request.round,
        'Best of': best_of_int,
        'Rank_Diff': rank_diff,
        'Pts_Diff': pts_diff,
        'Odd_Ratio_Log': odd_ratio_log
    }])

@app.get("/")
async def root():
    return {"message": "AOFever ML API is running"}

@app.get("/health", tags=["General"])
async def health_check():
    return {
        "status": "healthy", 
        "service": "AOFever ML API",
        "model_loaded": model is not None
    }

@app.post("/predictmenswinner", response_model=PredictionResponse, tags=["Predictions"])
async def predict_mens_winner(request: PredictionRequest):
    if model is None:
        raise HTTPException(
            status_code=503, 
            detail="ML model is not loaded. Please ensure the model file exists and restart the service."
        )
    
    try:
        # Prepare features for prediction
        prediction_data = prepare_prediction_features(request)
        
        # Make prediction
        prediction_proba = model.predict_proba(prediction_data)[0]
        player1_win_probability = prediction_proba[1]
        player2_win_probability = prediction_proba[0]
        
        # Winner and confidence
        if player1_win_probability > player2_win_probability:
            winner = request.player1
            confidence = player1_win_probability
        else:
            winner = request.player2
            confidence = player2_win_probability
        
        logger.info(f"Prediction: {request.player1} vs {request.player2}")
        logger.info(f"Player1 win probability: {player1_win_probability:.3f}")
        logger.info(f"Player2 win probability: {player2_win_probability:.3f}")
        logger.info(f"Predicted winner: {winner} with confidence: {confidence:.3f}")
        
        return PredictionResponse(
            winner=winner,
            confidence=round(confidence, 3)
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error making prediction: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
