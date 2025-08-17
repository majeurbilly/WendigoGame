import logging
from typing import List, Dict
from starlette.websockets import WebSocket

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =============================================================================
# 🔌 GESTIONNAIRE DE CONNEXIONS - LE CERVEAU DES CONNEXIONS
# =============================================================================
# Cette classe est comme un "gestionnaire de salle" qui :
# - Garde une liste de tous les joueurs connectés
# - Les organise par "lobby" (salle de jeu)
# - Envoie des messages à tout le monde ou à des groupes spécifiques

class ConnectionManager:
    def __init__(self): # Construction de la classe
        self.active_connections: List[WebSocket] = []
        self.lobby_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, lobby_id: str = "default"):
        """
        Quand un nouveau joueur se connecte :
        1. On l'accepte dans notre serveur
        2. On l'ajoute à la liste générale
        3. On l'ajoute à sa salle spécifique
        """
        # Étape 1 : Accepter la connexion du joueur
        await websocket.accept()
        # Étape 2 : L'ajouter à la liste générale
        self.active_connections.append(websocket)

        # Étape 3 : L'ajouter à sa salle spécifique
        # Si la salle n'existe pas encore, on la crée
        if lobby_id not in self.lobby_connections:
            self.lobby_connections[lobby_id] = []
        # On ajoute le joueur à sa salle
        self.lobby_connections[lobby_id].append(websocket)

        # On affiche des messages pour savoir ce qui se passe
        logger.info(f"🔌 Nouveau joueur connecté dans la salle {lobby_id}")
        logger.info(f"📊 Total joueurs connectés: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, lobby_id: str = "default"):
        """
        Quand un joueur se déconnecte :
        1. On le retire de la liste générale
        2. On le retire de sa salle
        """
        # Retirer de la liste générale
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        # Retirer de sa salle spécifique
        if lobby_id in self.lobby_connections and websocket in self.lobby_connections[lobby_id]:
            self.lobby_connections[lobby_id].remove(websocket)

        # Messages de debug
        logger.info(f"🔌 Joueur déconnecté de la salle {lobby_id}")
        logger.info(f"📊 Total joueurs connectés: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """
        Envoyer un message à UN SEUL joueur spécifique
        (comme un message privé)
        """
        await websocket.send_text(message)

    async def broadcast_to_lobby(self, message: str, lobby_id: str = "default"):
        """
        Envoyer un message à TOUS les joueurs d'une salle
        (comme un message public dans la salle)
        """
        # Vérifier si la salle existe
        if lobby_id in self.lobby_connections:
            # Parcourir tous les joueurs de cette salle
            for connection in self.lobby_connections[lobby_id]:
                try:
                    # Envoyer le message à chaque joueur
                    await connection.send_text(message)
                except Exception as e:
                    # Si ça ne marche pas, on retire le joueur défaillant
                    logger.error(f"❌ Erreur envoi message: {e}")
                    self.disconnect(connection, lobby_id)
