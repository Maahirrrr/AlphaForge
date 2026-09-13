from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.research_service import ResearchService

router = APIRouter(prefix="/api/research", tags=["Research & ML"])
research_service = ResearchService()

class TrainRequest(BaseModel):
    symbol: str = "AAPL"
    target_horizon: str = "5d"
    task: str = "regression"
    n_estimators: int = 100
    max_depth: int = 4
    learning_rate: float = 0.03

@router.post("/train")
def train_model(req: TrainRequest):
    try:
        res = research_service.train_model(
            symbol=req.symbol,
            target_horizon=req.target_horizon,
            task=req.task,
            n_estimators=req.n_estimators,
            max_depth=req.max_depth,
            learning_rate=req.learning_rate
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/explain")
def explain_prediction(symbol: str = "AAPL"):
    try:
        return research_service.explain_latest(symbol)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
