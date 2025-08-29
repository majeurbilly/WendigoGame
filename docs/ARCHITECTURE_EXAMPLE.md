# 🏗️ Exemple d'Architecture FastAPI + React - Wendigo Game

## 📁 Structure du Projet

```
WendigoGame/
├── backend/                          # API FastAPI
│   ├── app/
│   │   ├── main.py                  # Application FastAPI
│   │   ├── core/
│   │   │   ├── config.py           # Configuration Pydantic
│   │   │   ├── database.py         # Configuration DB
│   │   │   └── security.py         # JWT et auth
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/      # Routes REST
│   │   │       ├── websocket/      # Routes WebSocket
│   │   │       └── dependencies.py # Dépendances FastAPI
│   │   ├── models/                  # Modèles SQLAlchemy
│   │   ├── schemas/                 # Schémas Pydantic
│   │   ├── services/                # Logique métier
│   │   └── middleware/              # Middleware personnalisé
│   ├── pyproject.toml              # Dépendances Python
│   ├── alembic.ini                 # Migrations DB
│   └── Dockerfile                  # Container backend
├── frontend/                        # Application React
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Composants de base
│   │   │   ├── game/               # Composants de jeu
│   │   │   ├── lobby/              # Composants de lobby
│   │   │   └── auth/               # Composants d'auth
│   │   ├── hooks/                  # Hooks personnalisés
│   │   ├── context/                # Context API
│   │   ├── services/               # Services API
│   │   ├── utils/                  # Utilitaires
│   │   ├── App.tsx                 # App principale
│   │   └── main.tsx                # Point d'entrée
│   ├── package.json                # Dépendances Node.js
│   ├── vite.config.ts              # Configuration Vite
│   └── Dockerfile                  # Container frontend
├── shared/                          # Code partagé
├── docker-compose.yml              # Environnement local
├── .github/                        # GitHub Actions
└── README.md                       # Documentation
```

## 🔧 Configuration Backend FastAPI

### `backend/pyproject.toml`
```toml
[project]
name = "wendigo-game-backend"
version = "0.1.0"
description = "Backend FastAPI pour Wendigo Game"

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.0"
uvicorn = {extras = ["standard"], version = "^0.24.0"}
websockets = "^12.0"
sqlalchemy = "^2.0.0"
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
alembic = "^1.13.0"
python-jose = {extras = ["cryptography"], version = "^3.3.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}
python-multipart = "^0.0.6"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
httpx = "^0.25.0"
```

### `backend/app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import engine
from app.models import Base

# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Wendigo Game API",
    description="API pour le jeu de loup-garou Wendigo",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS pour le frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes API
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Wendigo Game API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### `backend/app/core/config.py`
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Wendigo Game"
    
    # Base de données
    DATABASE_URL: str = "sqlite:///./wendigo_game.db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React dev
        "http://localhost:5173",  # Vite dev
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## ⚛️ Configuration Frontend React

### `frontend/package.json`
```json
{
  "name": "wendigo-game-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.6.0",
    "websocket": "^1.0.34"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

### `frontend/src/App.tsx`
```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import Lobby from './components/lobby/Lobby';
import Game from './components/game/Game';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/lobby/:id" element={
                <ProtectedRoute>
                  <Lobby />
                </ProtectedRoute>
              } />
              <Route path="/game/:id" element={
                <ProtectedRoute>
                  <Game />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
```

### `frontend/src/hooks/useWebSocket.ts`
```tsx
import { useEffect, useRef, useState } from 'react';

interface UseWebSocketProps {
  url: string;
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = ({
  url,
  onMessage,
  onOpen,
  onClose,
  onError
}: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage?.(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      onClose?.();
    };

    ws.onerror = (error) => {
      onError?.(error);
    };

    return () => {
      ws.close();
    };
  }, [url, onMessage, onOpen, onClose, onError]);

  const sendMessage = (message: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, sendMessage };
};
```

## 🐳 Configuration Docker

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/wendigo_game
    depends_on:
      - db
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev
    environment:
      - VITE_API_URL=http://localhost:8000

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=wendigo_game
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🚀 Démarrage Rapide

### 1. Cloner et configurer
```bash
git clone <repository>
cd WendigoGame

# Backend
cd backend
uv sync
uv run main.py

# Frontend (nouveau terminal)
cd frontend
npm install
npm run dev
```

### 2. Avec Docker
```bash
docker-compose up --build
```

### 3. Accès
- **Backend API** : http://localhost:8000
- **Frontend React** : http://localhost:3000
- **Documentation API** : http://localhost:8000/docs

## 📚 Avantages de cette Architecture

### **FastAPI Backend**
- ✅ **Performance** : ASGI ultra-rapide
- ✅ **Validation** : Pydantic pour la validation automatique
- ✅ **Documentation** : OpenAPI automatique
- ✅ **WebSockets** : Support natif
- ✅ **Type hints** : Python moderne avec types

### **React Frontend**
- ✅ **Performance** : Virtual DOM et optimisations
- ✅ **Écosystème** : Large communauté et librairies
- ✅ **TypeScript** : Typage statique pour la robustesse
- ✅ **Hooks** : Gestion d'état moderne
- ✅ **Responsive** : Mobile-first design

### **Architecture Globale**
- ✅ **Séparation** : Backend et frontend indépendants
- ✅ **Scalabilité** : Chaque partie peut évoluer séparément
- ✅ **Déploiement** : Docker pour la production
- ✅ **Tests** : Tests séparés backend/frontend
- ✅ **Maintenance** : Code organisé et maintenable
