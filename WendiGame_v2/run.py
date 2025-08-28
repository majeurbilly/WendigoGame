#!/usr/bin/env python3
"""
Script de démarrage du serveur WendiGame Python
Remplace le serveur Java/Spring Boot
"""

import uvicorn
import logging
import sys
from pathlib import Path



# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    #format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('wendigame.log')
    ]
)

logger = logging.getLogger(__name__)

def main():
    """Fonction principale de démarrage"""
    try:
        logger.info("Démarrage du serveur WendiGame Python...")
        logger.info("Migration depuis Java/Spring Boot vers Python/FastAPI")
        
        # Vérifier que tous les fichiers nécessaires existent
        required_files = ['main.py', 'models.py', 'services.py', 'controllers.py']
        missing_files = []
        
        for file in required_files:
            if not Path(file).exists():
                missing_files.append(file)
        
        if missing_files:
            logger.error(f"❌ Fichiers manquants: {', '.join(missing_files)}")
            logger.error("Assurez-vous d'être dans le bon répertoire")
            sys.exit(1)
        
        logger.info("Tous les fichiers requis sont présents")
        logger.info("Démarrage du serveur sur http://localhost:8000")
        logger.info("WebSockets disponibles sur ws://localhost:8000/ws")
        logger.info("Documentation API: http://localhost:8000/docs")
        
        # Démarrer le serveur
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
        
    except KeyboardInterrupt:
        logger.info("Arrêt du serveur demandé par l'utilisateur")
    except Exception as e:
        logger.error(f"Erreur fatale: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
