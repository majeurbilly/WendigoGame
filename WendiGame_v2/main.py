# =============================================================================
# 🎮 WENDIGAME v2 - SERVEUR PRINCIPAL
# =============================================================================
# Ce fichier est le CŒUR de notre application de jeu multijoueur
# Il fait 3 choses principales :
# 1. Crée une API web (comme un site web mais pour les programmes)
# 2. Gère les connexions en temps réel (WebSockets)
# 3. Organise les joueurs dans des "lobbies" (salles de jeu)
# =============================================================================

# =============================================================================
# 📦 IMPORTS - LES OUTILS QU'ON UTILISE
# =============================================================================
# FastAPI = le framework pour créer notre API web
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
# CORS = permet aux navigateurs web d'accéder à notre API
from fastapi.middleware.cors import CORSMiddleware
# StaticFiles = pour servir des fichiers (CSS, images, etc.)
# asynccontextmanager = pour gérer le démarrage/arrêt de l'app
from contextlib import asynccontextmanager
# json = pour convertir les données en format JSON
import json
# logging = pour afficher des messages de debug
import logging
# typing = pour définir les types de données
# datetime = pour gérer les dates et heures
from datetime import datetime
# uvicorn = le serveur qui fait tourner notre application
import uvicorn

from connection_manager import ConnectionManager

# =============================================================================
# 📝 CONFIGURATION DES LOGS (MESSAGES DE DEBUG)
# =============================================================================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =============================================================================
# 🌐 CRÉATION DU GESTIONNAIRE GLOBAL
# =============================================================================
# On crée UNE SEULE instance du gestionnaire pour toute l'application
# C'est comme avoir un seul "gestionnaire de salle" pour tout le serveur
manager = ConnectionManager()

# =============================================================================
# 🚀 GESTION DU DÉMARRAGE/ARRÊT DU SERVEUR
# =============================================================================
# Cette fonction s'exécute quand le serveur démarre et quand il s'arrête
@asynccontextmanager
async def lifespan(_app: FastAPI):
    """
    Cycle de vie du serveur :
    - Au démarrage : on initialise tout
    - Pendant le fonctionnement : le serveur tourne
    - À l'arrêt : on nettoie tout
    """
    # Code exécuté au DÉMARRAGE du serveur
    logger.info("🚀 Démarrage du serveur WendiGame Python")
    # Ici on pourrait initialiser une base de données, un cache, etc.
    yield  # Le serveur fonctionne ici## CTRL-C
    # Code exécuté à l'ARRÊT du serveur
    logger.info("🛑 Arrêt du serveur WendiGame Python")
    # Ici on pourrait fermer les connexions, sauvegarder des données, etc.

# =============================================================================
# 🏗️ CRÉATION DE L'APPLICATION WEB
# =============================================================================
# On crée notre application web avec FastAPI
app = FastAPI(
    title="WendiGame API",                    # Nom de l'API
    description="API Python pour le jeu WendiGame avec WebSockets",  # Description
    version="2.0.0",                         # Version
    lifespan=lifespan                        # Gestionnaire de cycle de vie
)

# =============================================================================
# 🌍 CONFIGURATION CORS - AUTORISER LES CONNEXIONS
# =============================================================================
# CORS = "Cross-Origin Resource Sharing"
# C'est comme donner une "autorisation" aux navigateurs web
# pour qu'ils puissent accéder à notre API
app.add_middleware(
    CORSMiddleware,
    # Domaines autorisés (où notre frontend peut tourner)
    allow_origins=[
        "http://localhost:3000",  # React par défaut
        "http://localhost:5173"   # Vite par défaut
    ],
    # Autoriser les cookies et l'authentification
    allow_credentials=True,
    # Autoriser toutes les méthodes HTTP (GET, POST, PUT, DELETE)
    allow_methods=["*"],
    # Autoriser tous les en-têtes HTTP
    allow_headers=["*"],
)

# =============================================================================
# 📊 MODÈLES DE DONNÉES - LA STRUCTURE DES INFORMATIONS
# =============================================================================
# Ces classes définissent "à quoi ressemblent" nos données
# C'est comme des "moules" pour nos informations
from pydantic import BaseModel
from typing import Optional

class ChatMessage(BaseModel):
    """Un message de chat dans une salle"""
    sender: str                    # Qui envoie le message
    content: str                   # Le contenu du message
    timestamp: Optional[datetime] = None  # Quand le message a été envoyé
    lobby_id: str = "default"     # Dans quelle salle

class LobbyMessage(BaseModel):
    """Un message de système dans une salle (arrivée, départ, etc.)"""
    type: str                      # Type de message (chat, system, game)
    content: str                   # Contenu du message
    sender: str                    # Qui envoie
    lobby_id: str = "default"     # Dans quelle salle

class Joueur(BaseModel):
    """Un joueur du jeu"""
    id: Optional[int] = None      # Numéro unique du joueur
    username: str                  # Nom d'utilisateur
    email: str                     # Email
    is_online: bool = False       # Est-il connecté ?

# =============================================================================
# 🔗 INTÉGRATION DES ROUTES API
# =============================================================================
# On importe toutes les routes API définies dans controllers.py
# Ces routes gèrent les opérations CRUD (Créer, Lire, Modifier, Supprimer)
from controllers import api_router

# On ajoute ces routes à notre application
# Toutes les routes commençant par /api seront gérées ici
app.include_router(api_router)

# =============================================================================
# 🛣️ ROUTES DE BASE - LES PAGES PRINCIPALES
# =============================================================================

@app.get("/")
async def root():
    """
    Route racine - la page d'accueil de notre API
    Quand quelqu'un va sur http://localhost:8000/
    """
    return {"message": "Bienvenue sur l'API WendiGame Python !"}

@app.get("/health")
async def health_check():
    """
    Route de vérification - pour voir si le serveur fonctionne
    Quand quelqu'un va sur http://localhost:8000/health
    """
    return {
        "status": "healthy",                           # Le serveur va bien
        "timestamp": datetime.now(),                   # Date et heure actuelles
        "active_connections": len(manager.active_connections),  # Nombre de joueurs connectés
        "lobbies": list(manager.lobby_connections.keys())      # Liste des salles actives
    }

# =============================================================================
# 🔌 WEBSOCKETS - LA COMMUNICATION EN TEMPS RÉEL
# =============================================================================
# Les WebSockets permettent une communication bidirectionnelle
# C'est comme un "téléphone" entre le serveur et les clients
# Les messages arrivent instantanément !

@app.websocket("/ws/{lobby_id}")
async def websocket_endpoint(websocket: WebSocket, lobby_id: str):
    """
    Endpoint WebSocket principal
    Permet aux joueurs de se connecter à une salle spécifique
    et d'échanger des messages en temps réel
    """
    # Étape 1 : Accepter la connexion du joueur
    await manager.connect(websocket, lobby_id)
    
    try:
        # Étape 2 : Boucle infinie pour recevoir les messages
        while True:
            # Attendre de recevoir un message du joueur
            data = await websocket.receive_text()
            
            try:
                # Étape 3 : Analyser le message reçu (format JSON)
                message_data = json.loads(data)
                # Déterminer le type de message
                message_type = message_data.get("type", "chat")
                
                # =============================================================
                # 💬 TRAITEMENT D'UN MESSAGE DE CHAT
                # =============================================================
                if message_type == "chat":
                    # Créer un objet message avec les données reçues
                    chat_message = ChatMessage(
                        sender=message_data.get("sender", "Anonyme"),  # Qui envoie
                        content=message_data.get("content", ""),       # Le message
                        lobby_id=lobby_id                             # Dans quelle salle
                    )
                    
                    # Ajouter l'heure d'envoi
                    chat_message.timestamp = datetime.now()
                    
                    # Préparer le message à envoyer à tous les joueurs
                    broadcast_message = {
                        "type": "chat",                               # Type de message
                        "sender": chat_message.sender,                # Expéditeur
                        "content": chat_message.content,              # Contenu
                        "timestamp": chat_message.timestamp.isoformat(),  # Heure
                        "lobby_id": lobby_id                          # Salle
                    }
                    
                    # Envoyer le message à TOUS les joueurs de la salle
                    await manager.broadcast_to_lobby(
                        json.dumps(broadcast_message),  # Convertir en JSON
                        lobby_id
                    )
                    
                    # Afficher un log pour le debug
                    logger.info(f"💬 Message de {chat_message.sender} dans la salle {lobby_id}: {chat_message.content}")
                
                # =============================================================
                # 👋 NOTIFICATION D'ARRIVÉE D'UN JOUEUR
                # =============================================================
                elif message_type == "join_lobby":
                    # Créer un message système pour annoncer l'arrivée
                    join_message = {
                        "type": "system",                             # Message système
                        "content": f"{message_data.get('sender', 'Un joueur')} a rejoint la salle",
                        "timestamp": datetime.now().isoformat(),      # Heure
                        "lobby_id": lobby_id                          # Salle
                    }
                    
                    # Envoyer la notification à tous les joueurs de la salle
                    await manager.broadcast_to_lobby(
                        json.dumps(join_message), 
                        lobby_id
                    )
                    
                    # Log de debug
                    logger.info(f"👋 {message_data.get('sender', 'Un joueur')} a rejoint la salle {lobby_id}")
                
                # =============================================================
                # 👋 NOTIFICATION DE DÉPART D'UN JOUEUR
                # =============================================================
                elif message_type == "leave_lobby":
                    # Créer un message système pour annoncer le départ
                    leave_message = {
                        "type": "system",                             # Message système
                        "content": f"{message_data.get('sender', 'Un joueur')} a quitté la salle",
                        "timestamp": datetime.now().isoformat(),      # Heure
                        "lobby_id": lobby_id                          # Salle
                    }
                    
                    # Envoyer la notification à tous les joueurs de la salle
                    await manager.broadcast_to_lobby(
                        json.dumps(leave_message), 
                        lobby_id
                    )
                    
                    # Log de debug
                    logger.info(f"👋 {message_data.get('sender', 'Un joueur')} a quitté la salle {lobby_id}")
                
            except json.JSONDecodeError:
                # =============================================================
                # ❌ GESTION DES ERREURS - MESSAGE JSON INVALIDE
                # =============================================================
                # Si le message reçu n'est pas un JSON valide
                logger.error(f"❌ Message JSON invalide reçu: {data}")
                # Envoyer un message d'erreur au joueur
                await manager.send_personal_message(
                    json.dumps({"error": "Format JSON invalide"}), 
                    websocket
                )
                
    except WebSocketDisconnect:
        # =============================================================
        # 🔌 GESTION DE LA DÉCONNEXION
        # =============================================================
        # Quand le joueur se déconnecte (ferme l'onglet, perte de connexion)
        manager.disconnect(websocket, lobby_id)
        logger.info(f"🔌 WebSocket déconnecté de la salle {lobby_id}")

# =============================================================================
# 🔌 WEBSOCKET SIMPLE - SANS SALLE SPÉCIFIQUE
# =============================================================================
# Endpoint alternatif pour une communication globale
# Tous les messages sont envoyés à tous les joueurs connectés
@app.websocket("/ws")
async def websocket_simple(websocket: WebSocket):
    """
    WebSocket simple pour la communication globale
    Tous les messages sont diffusés à tous les joueurs
    """
    # Connecter le joueur à la salle par défaut
    await manager.connect(websocket, "default")
    
    try:
        # Boucle infinie pour recevoir les messages
        while True:
            # Recevoir un message
            data = await websocket.receive_text()
            # L'envoyer à tous les joueurs de la salle par défaut
            await manager.broadcast_to_lobby(data, "default")
            
    except WebSocketDisconnect:
        # Gérer la déconnexion
        manager.disconnect(websocket, "default")

# =============================================================================
# 🚀 POINT D'ENTRÉE - DÉMARRAGE DU SERVEUR
# =============================================================================
# Ce bloc ne s'exécute QUE si on lance ce fichier directement
# (pas si on l'importe depuis un autre fichier)
if __name__ == "__main__":
    # Message de démarrage
    logger.info("🚀 Démarrage du serveur WendiGame...")
    
    # Lancer le serveur avec Uvicorn
    uvicorn.run(
        "main:app",           # Fichier et variable à lancer
        host="0.0.0.0",       # Écouter sur toutes les interfaces réseau
        port=8000,            # Port d'écoute
        reload=True,          # Recharger automatiquement si on modifie le code
        log_level="info"      # Niveau de détail des logs
    )
