import os
import pandas as pd
import numpy as np
import joblib
from app.models.schemas import PredictionRequest
from app.core.logging import logger

mens_model = None
womens_model = None
MENS_MODEL_PATH = "ao_mens_head_to_head_predictor.pkl"
WOMENS_MODEL_PATH = "ao_womens_head_to_head_predictor.pkl"

def load_models():
    global mens_model, womens_model
    try:
        if os.path.exists(MENS_MODEL_PATH) and os.path.exists(WOMENS_MODEL_PATH):
            mens_model = joblib.load(MENS_MODEL_PATH)
            womens_model = joblib.load(WOMENS_MODEL_PATH)
            logger.info(f"Model loaded successfully from {MENS_MODEL_PATH}")
            logger.info(f"Model loaded successfully from {WOMENS_MODEL_PATH}")
        else:
            logger.warning(f"Model file {MENS_MODEL_PATH} or {WOMENS_MODEL_PATH} not found. Please train the models first.")
    except Exception as e:
        logger.error(f"Error loading models: {e}")

def get_mens_model():
    return mens_model

def get_womens_model():
    return womens_model

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