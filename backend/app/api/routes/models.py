from fastapi import APIRouter
from app.database.session import SessionLocal
from app.database.models import ModelRegistry

router = APIRouter(prefix="/api/models", tags=["Model Registry"])

@router.get("")
def list_models():
    db = SessionLocal()
    try:
        models = db.query(ModelRegistry).order_by(ModelRegistry.created_at.desc()).all()
        return [
            {
                "model_id": m.model_id,
                "name": m.name,
                "model_type": m.model_type,
                "target": m.target,
                "horizon": m.horizon,
                "status": m.status,
                "metrics": m.metrics,
                "created_at": m.created_at.isoformat() if m.created_at else ""
            }
            for m in models
        ]
    finally:
        db.close()
