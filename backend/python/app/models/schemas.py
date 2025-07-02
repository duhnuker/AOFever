from pydantic import BaseModel

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