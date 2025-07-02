from app.main import app
from app.models.ml_models import get_mens_model, get_womens_model

@app.get("/health", tags=["General"])
async def health_check():
    mens_model = get_mens_model()
    womens_model = get_womens_model()
    return {
        "status": "healthy", 
        "service": "AOFever ML API",
        "model_loaded": mens_model and womens_model is not None
    }