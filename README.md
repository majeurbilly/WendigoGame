```
/wendigo-game/
│
├── main.py                   # Lance le serveur FastAPI
├── websocket_manager.py      # Gestion des connexions et des événements WebSocket
├── game_manager.py           # Logique du jeu : rôles, tours, votes
├── models/                   # Modèles Pydantic pour les données échangées
│   └── player.py
│   └── game_state.py
├── database/                 # Connexion DB (SQLite, PostgreSQL…)
│   └── actions_log.py
├── static/                   # Front-end ou fichiers client (HTML, JS)
└── templates/                # Pour Jinja si besoin d’un rendu côté serveur
```
