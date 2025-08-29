"""
Initialisation des données Wendigo
Script pour peupler la base de données avec les données initiales
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.team import Team
from app.models.role import Role


def create_teams():
    """Créer les équipes de base"""
    db = SessionLocal()
    
    try:
        # Vérifier si les équipes existent déjà
        existing_teams = db.query(Team).all()
        if existing_teams:
            print("✅ Les équipes existent déjà")
            return
        
        # Créer les équipes
        villager_team = Team(
            name="Villageois",
            description="Les habitants du village qui luttent contre les loups",
            color="#4CAF50"
        )
        
        wolf_team = Team(
            name="Loups",
            description="Les loups-garous qui se cachent parmi les villageois",
            color="#F44336"
        )
        
        db.add(villager_team)
        db.add(wolf_team)
        db.commit()
        
        print("✅ Équipes créées avec succès")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des équipes: {e}")
        db.rollback()
    finally:
        db.close()


def create_roles():
    """Créer tous les rôles du jeu"""
    db = SessionLocal()
    
    try:
        # Vérifier si les rôles existent déjà
        existing_roles = db.query(Role).all()
        if existing_roles:
            print("✅ Les rôles existent déjà")
            return
        
        # Récupérer les équipes
        villager_team = db.query(Team).filter(Team.name == "Villageois").first()
        wolf_team = db.query(Team).filter(Team.name == "Loups").first()
        
        if not villager_team or not wolf_team:
            print("❌ Les équipes doivent être créées en premier")
            return
        
        # Rôles Villageois
        villager_roles = [
            Role(name="Villageois", description="Un simple villageois sans pouvoir spécial", team_id=villager_team.id),
            Role(name="Voyante", description="Peut découvrir le rôle d'un joueur chaque nuit", team_id=villager_team.id),
            Role(name="Sorcière", description="Peut sauver ou tuer un joueur par nuit", team_id=villager_team.id),
            Role(name="Épouvantail", description="Peut protéger un joueur des attaques", team_id=villager_team.id),
            Role(name="Renard", description="Peut renifler pour détecter les loups à proximité", team_id=villager_team.id),
            Role(name="Guerrier", description="Peut défier un joueur en duel", team_id=villager_team.id),
            Role(name="Avocat du Diable", description="Peut protéger avec risque de mort", team_id=villager_team.id),
            Role(name="Médium", description="Peut communiquer avec les fantômes", team_id=villager_team.id),
            Role(name="Jumeau A", description="Jumeau avec communication privée", team_id=villager_team.id),
            Role(name="Jumeau B", description="Jumeau avec communication privée", team_id=villager_team.id),
            Role(name="Chaperon Rouge", description="Immunité permanente contre les attaques", team_id=villager_team.id),
            Role(name="Chasseur", description="Peut tuer après sa mort", team_id=villager_team.id),
            Role(name="Sirène", description="Peut charmer un joueur", team_id=villager_team.id),
            Role(name="Voleur", description="Peut agir sans être détecté", team_id=villager_team.id),
            Role(name="Marchand de Sable", description="Peut faire sauter une phase", team_id=villager_team.id),
        ]
        
        # Rôles Loups
        wolf_roles = [
            Role(name="Loup", description="Loup-garou classique avec vote unanime", team_id=wolf_team.id),
            Role(name="Loup Alpha", description="Chef des loups avec pouvoir renforcé", team_id=wolf_team.id),
            Role(name="Loup Omega", description="Loup solitaire avec pouvoirs spéciaux", team_id=wolf_team.id),
            Role(name="Loup Blanc", description="Loup qui peut se faire passer pour un villageois", team_id=wolf_team.id),
            Role(name="Loup Noir", description="Loup avec pouvoir de tuerie renforcé", team_id=wolf_team.id),
        ]
        
        # Rôles Neutres
        neutral_roles = [
            Role(name="Pestiféré", description="Contamine les autres joueurs", team_id=villager_team.id),
            Role(name="Poltergeist", description="Esprit qui peut communiquer secrètement", team_id=villager_team.id),
            Role(name="Bouffon", description="Gagne en mourant par vote", team_id=villager_team.id),
            Role(name="Cupidon", description="Lie deux joueurs par l'amour", team_id=villager_team.id),
            Role(name="Petite Fille", description="Peut espionner les loups", team_id=villager_team.id),
            Role(name="Salvateur", description="Peut sauver un joueur une fois", team_id=villager_team.id),
            Role(name="Ancien", description="Survit à la première attaque", team_id=villager_team.id),
            Role(name="Idiot du Village", description="Survit au lynchage", team_id=villager_team.id),
            Role(name="Corbeau", description="Peut maudire un joueur", team_id=villager_team.id),
        ]
        
        # Ajouter tous les rôles
        all_roles = villager_roles + wolf_roles + neutral_roles
        
        for role in all_roles:
            db.add(role)
        
        db.commit()
        print(f"✅ {len(all_roles)} rôles créés avec succès")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des rôles: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Fonction principale d'initialisation"""
    print("🚀 Initialisation des données Wendigo...")
    
    create_teams()
    create_roles()
    
    print("✅ Initialisation terminée !")


if __name__ == "__main__":
    main()
