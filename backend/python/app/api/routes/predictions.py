from fastapi import HTTPException, APIRouter
from app.models.schemas import PredictionRequest, PredictionResponse
from app.models.ml_models import prepare_prediction_features
from app.core.logging import logger
from app.models.ml_models import get_mens_model, get_womens_model 

router = APIRouter()

@router.post("/predictmenswinner", response_model=PredictionResponse, tags=["Predictions"])
async def predict_mens_winner(request: PredictionRequest):
    mens_model = get_mens_model()
    if mens_model is None:
        raise HTTPException(
            status_code=503, 
            detail="ML model is not loaded. Please ensure the model file exists and restart the service."
        )
    
    try:
        # Prepare features for prediction
        prediction_data = prepare_prediction_features(request)
        
        # Make prediction
        prediction_proba = mens_model.predict_proba(prediction_data)[0]
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
    
@router.post("/predictwomenswinner", response_model=PredictionResponse, tags=["Predictions"])
async def predict_womens_winner(request: PredictionRequest):
    womens_model = get_womens_model()
    if womens_model is None:
        raise HTTPException(
            status_code=503, 
            detail="ML model is not loaded. Please ensure the model file exists and restart the service."
        )
    
    try:
        # Prepare features for prediction
        prediction_data = prepare_prediction_features(request)
        
        # Make prediction
        prediction_proba = womens_model.predict_proba(prediction_data)[0]
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