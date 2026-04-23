# WendiGame 🐺

## Description
**WendiGame** est un jeu de survie coopératif et de déduction sociale conçu pour s'adapter à ta façon de jouer. Que tu sois entouré d'amis dans un salon ou connecté avec eux à l'autre bout du monde, l'application garantit une immersion totale :

* **En présentiel :** L'application agit comme un compagnon intelligent qui automatise les phases de jeu complexes, gère les rôles secrets et synchronise les votes sur les téléphones de chaque joueur en temps réel.
* **En ligne :** Le projet recrée l'ambiance d'une soirée autour d'une table grâce à un système d'audio spatialisé où la voix des autres joueurs dépend de leur position dans l'environnement virtuel.

## Architecture & Technologies
Chaque choix technique a été fait pour soutenir ces deux piliers :

* **Synchronisation Ultra-Fluide (Go & WebSockets) :** Essentiel pour le présentiel afin que tous les joueurs voient le passage du jour à la nuit sur leur téléphone à la milliseconde près.
* **Audio Spatialisé (LiveKit) :** Le cœur de l'immersion pour les parties en ligne, permettant de situer ses alliés (ou ses ennemis) à l'oreille.
* **Gestion des Lobbys (Valkey) :** Permet de créer et rejoindre instantanément une partie, que ce soit via un code QR dans une pièce ou une invitation en ligne.
* **Infrastructure Hybride (Docker & Hetzner) :** Garantit que les serveurs sont toujours disponibles pour une partie improvisée, tout en restant une solution légère et économique.

## Structure du projet
```text
.
├── backend/
│   ├── cmd/server/       # Point d'entrée (Initialisation du serveur)
│   ├── internal/api/     # Logique des rôles et des votes
│   ├── Dockerfile        # Image optimisée pour le déploiement
│   ├── docker-compose.yml# Orchestration App + Valkey + LiveKit
│   └── Taskfile.yml      # Commandes de démarrage rapide (go-task)
├── .github/workflows/    # Tests automatiques et CI/CD
└── flake.nix             # Environnement de développement figé
```

## Installation et démarrage

### 1. Prérequis
* [Nix](https://nixos.org/download.html) (Support des Flakes activé ; le shell inclut Go, Node, **go-task**, Docker Compose, etc.).
* [Docker](https://www.docker.com/) et Docker-Compose.

### 2. Lancement rapide
Activez l'environnement, puis depuis le dossier `backend`, lancez la stack avec **Task** :
```bash
nix develop
cd backend
task up
```

Les tâches disponibles : `task --list` (ex. `task run`, `task test`, `task down`, `task logs` pour suivre Valkey).

## Stratégie de Veille
Le projet utilise une veille automatisée pour surveiller la sécurité des protocoles WebRTC et les performances du moteur Go, assurant ainsi une stabilité maximale pour les joueurs, peu importe leur mode de connexion.

---
Développé par **Billy Hallé**.