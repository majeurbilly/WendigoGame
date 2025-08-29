"""
Application principale Wendigo
Point d'entrée de l'API FastAPI
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.endpoints import games, users
from app.exceptions import WendigoException


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    # Créer les tables au démarrage
    Base.metadata.create_all(bind=engine)
    print("🚀 Application Wendigo démarrée")
    yield
    print("👋 Application Wendigo arrêtée")


# Créer l'application FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gestionnaire d'exceptions personnalisées
@app.exception_handler(WendigoException)
async def wendigo_exception_handler(request, exc: WendigoException):
    """Gestionnaire pour les exceptions Wendigo"""
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )


# Endpoints de base
@app.get("/")
async def root():
    """Point d'entrée de l'API"""
    return {
        "message": "Bienvenue dans l'API Wendigo Game !",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Vérification de l'état de l'API"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "database": "connected"
    }


# Inclure les routes API
app.include_router(
    games.router,
    prefix=f"{settings.API_V1_STR}/games",
    tags=["games"]
)

app.include_router(
    users.router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["users"]
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
