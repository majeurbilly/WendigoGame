#!/usr/bin/env python3
"""
Script d'initialisation de la base de données Wendigo
Crée toutes les tables et initialise les données de base
"""

import sys
import os

# Ajouter le répertoire parent au path pour importer les modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base
from app.models import *  # Importe tous les modèles
from data.initial_data import main as init_data

def init_database():
    """Initialise la base de données"""
    print("🗄️  Création des tables de la base de données...")
    
    # Créer toutes les tables
    Base.metadata.create_all(bind=engine)
    
    print("✅ Tables créées avec succès")
    
    # Initialiser les données
    print("📊 Initialisation des données...")
    init_data()
    
    print("🎉 Base de données initialisée avec succès !")

if __name__ == "__main__":
    init_database()
