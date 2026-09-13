from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings
from app.core.logging import logger

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    connect_args = {}
    if "sqlite" in db_url:
        connect_args = {"check_same_thread": False}
    
    try:
        engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass
        return engine
    except Exception as e:
        logger.warning(f"Could not connect to database {db_url}: {e}. Falling back to SQLite.")
        sqlite_url = "sqlite:///./alphaforge.db"
        return create_engine(sqlite_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.database import models  # ensure models are imported
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully with all tables.")
