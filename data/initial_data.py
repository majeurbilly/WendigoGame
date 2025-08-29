"""
Script d'initialisation des données pour Wendigo Game
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.database import SessionLocal, create_tables
from app.models.team import Team
from app.models.role import Role
import uuid


def create_teams():
    """Créer les équipes de base"""
    teams_data = [
        {
            "name": "Villageois",
            "description": "Les défenseurs du village",
            "color": "#4CAF50"
        },
        {
            "name": "Loups",
            "description": "Les méchants qui veulent détruire le village",
            "color": "#F44336"
        }
    ]
    
    db = SessionLocal()
    try:
        for team_data in teams_data:
            existing_team = db.query(Team).filter(Team.name == team_data["name"]).first()
            if not existing_team:
                team = Team(**team_data)
                db.add(team)
                print(f"Équipe créée: {team.name}")
            else:
                print(f"Équipe existante: {existing_team.name}")
        
        db.commit()
        return db.query(Team).all()
    except Exception as e:
        db.rollback()
        print(f"Erreur lors de la création des équipes: {e}")
        raise
    finally:
        db.close()


def create_roles(teams):
    """Créer les 29 rôles uniques"""
    # Trouver les équipes
    villageois_team = next(team for team in teams if team.name == "Villageois")
    loups_team = next(team for team in teams if team.name == "Loups")
    
    roles_data = [
        # Équipe des Loups (6 rôles)
        {
            "name": "Skinwalker",
            "description": "Loup métamorphe",
            "power_description": "Peut voter avec les autres loups pour tuer un joueur la nuit",
            "team_id": loups_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "🐺",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Bouc Émissaire",
            "description": "Loup sacrifié",
            "power_description": "Connaît l'identité des autres loups mais ne peut pas voter avec eux",
            "team_id": loups_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 0,
            "emoji": "🐐",
            "difficulty": "EASY"
        },
        {
            "name": "Warlord",
            "description": "Chef de guerre",
            "power_description": "Peut une fois par partie protéger un Loup d'une attaque, et connaît l'identité des Loups",
            "team_id": loups_team.id,
            "phase_action": "DAY",
            "usage_limit": 1,
            "emoji": "⚔️",
            "difficulty": "HARD"
        },
        {
            "name": "Sbire",
            "description": "Serviteur loyal",
            "power_description": "Peut une fois par partie protéger un loup d'une attaque",
            "team_id": loups_team.id,
            "phase_action": "NONE",
            "usage_limit": 1,
            "emoji": "🦹",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Marchand de Sable",
            "description": "Maître des rêves",
            "power_description": "Peut endormir le village et passer par-dessus la phase d'accusation",
            "team_id": loups_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "😴",
            "difficulty": "HARD"
        },
        {
            "name": "Pestiféré",
            "description": "Loup maudit",
            "power_description": "Sa morsure contamine : si sa cible décide de ne pas se suicider, elle devient infectée et rejoint les loups au bout de 2 nuits",
            "team_id": loups_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "🦠",
            "difficulty": "HARD"
        },
        
        # Équipe des Villageois (23 rôles)
        {
            "name": "Voyante",
            "description": "Détective",
            "power_description": "Peut révéler l'identité d'un joueur et la connaître",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "🔮",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Épouvantail",
            "description": "Protecteur des champs",
            "power_description": "Peut protéger une fois par partie les deux joueurs assis à sa gauche et à sa droite contre une attaque",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "🌾",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Corbeau",
            "description": "Messager nocturne",
            "power_description": "Peut désigner un joueur chaque nuit ; ce joueur reçoit un vote supplémentaire automatique au prochain conseil",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "🦅",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Renard",
            "description": "Chasseur rusé",
            "power_description": "Peut flairer les 3 joueurs à sa gauche 1 fois durant la partie pour savoir si un loup est parmi eux",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "🦊",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Rêveur",
            "description": "Voyant des songes",
            "power_description": "Chaque nuit, peut voir quel joueur est désigné par les Loups comme cible",
            "team_id": villageois_team.id,
            "phase_action": "DAY",
            "usage_limit": 1,
            "emoji": "💭",
            "difficulty": "EASY"
        },
        {
            "name": "Poltergeist",
            "description": "Esprit perturbateur",
            "power_description": "Peut désigner un joueur et ouvrir un chat privé avec cette personne tout le long de la partie, mais une fois mort",
            "team_id": villageois_team.id,
            "phase_action": "DAY",
            "usage_limit": 1,
            "emoji": "👻",
            "difficulty": "HARD"
        },
        {
            "name": "Coroner",
            "description": "Expert médico-légal",
            "power_description": "Une fois par partie, lorsqu'un joueur meurt, il peut déterminer si la mort a été causée par un Méchant ou un Villageois",
            "team_id": villageois_team.id,
            "phase_action": "DAY",
            "usage_limit": 1,
            "emoji": "🔬",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Psychopompe",
            "description": "Guide des âmes",
            "power_description": "Une fois par partie, peut prendre aléatoirement le pouvoir d'un joueur mort et l'utiliser pendant la nuit suivante",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "⚰️",
            "difficulty": "HARD"
        },
        {
            "name": "Ensorceleuse",
            "description": "Magicienne de charme",
            "power_description": "Peut hanter un joueur chaque nuit, ce qui empêche son pouvoir de fonctionner",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "🧙‍♀️",
            "difficulty": "HARD"
        },
        {
            "name": "Sorcière",
            "description": "Guérisseuse",
            "power_description": "Au début de la partie, choisit Potion de protection (devient Villageois) ou Poison (devient Méchant)",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "🧪",
            "difficulty": "HARD"
        },
        {
            "name": "Chaperon",
            "description": "Protectrice des innocents",
            "power_description": "Ne peut pas mourir tant que le Chasseur est en vie. Si le Chasseur meurt, elle perd cette immunité",
            "team_id": villageois_team.id,
            "phase_action": "NONE",
            "usage_limit": 0,
            "emoji": "👧",
            "difficulty": "EASY"
        },
        {
            "name": "Chasseur",
            "description": "Combattant principal",
            "power_description": "Quand il est tué (par les loups ou par vote), il peut immédiatement abattre un joueur de son choix",
            "team_id": villageois_team.id,
            "phase_action": "DEATH",
            "usage_limit": 1,
            "emoji": "🏹",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Jumeaux",
            "description": "Duo inséparable",
            "power_description": "Les deux connaissent leur identité mutuelle dès le début et ont un chat privé ensemble",
            "team_id": villageois_team.id,
            "phase_action": "NONE",
            "usage_limit": 0,
            "emoji": "👥",
            "difficulty": "EASY"
        },
        {
            "name": "Insomniaque",
            "description": "Veilleur nocturne",
            "power_description": "Peut espionner un joueur chaque nuit pour savoir si cette personne a utilisé son pouvoir (active) ou non (inactive) durant cette nuit",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "👁️",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Courtisane",
            "description": "Séductrice",
            "power_description": "Chaque nuit, peut dormir chez un joueur voisin ; si ce joueur est un Loup elle meurt, sinon elle est protégée si les Loups la ciblent",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "💋",
            "difficulty": "HARD"
        },
        {
            "name": "Salvateur",
            "description": "Sauveur de l'humanité",
            "power_description": "Une fois par partie, peut ramener un joueur à la vie",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "💉",
            "difficulty": "HARD"
        },
        {
            "name": "Avocat du Diable",
            "description": "Défenseur controversé",
            "power_description": "Peut choisir un joueur par jour et annuler les votes contre lui. Si le joueur protégé est un loup, il meurt lui-même à la place",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "👨‍⚖️",
            "difficulty": "HARD"
        },
        {
            "name": "Guerrier",
            "description": "Combattant d'élite",
            "power_description": "Peut défier un joueur en duel (la nuit). Si c'est un loup, le loup meurt. S'il échoue, il tuera un villageois et perdera son pouvoir",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "🗡️",
            "difficulty": "HARD"
        },
        {
            "name": "Curieux",
            "description": "Investigateur",
            "power_description": "Peut une fois par partie obtenir directement le rôle exact d'un joueur",
            "team_id": villageois_team.id,
            "phase_action": "DAY",
            "usage_limit": 1,
            "emoji": "🔍",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Médium",
            "description": "Communique avec les morts",
            "power_description": "Peut avoir accès au chat des fantômes de façon anonyme",
            "team_id": villageois_team.id,
            "phase_action": "NONE",
            "usage_limit": 0,
            "emoji": "🔮",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Ancien",
            "description": "Sage du village",
            "power_description": "Connaît au début de la partie le nombre exact de joueurs Méchants vivants, et perd cette information une fois mort",
            "team_id": villageois_team.id,
            "phase_action": "NONE",
            "usage_limit": 0,
            "emoji": "👴",
            "difficulty": "EASY"
        },
        {
            "name": "Garde du Corps",
            "description": "Protecteur personnel",
            "power_description": "Peut protéger un joueur contre toute attaque une fois par partie",
            "team_id": villageois_team.id,
            "phase_action": "NIGHT",
            "usage_limit": 1,
            "emoji": "🛡️",
            "difficulty": "MEDIUM"
        },
        {
            "name": "Shérif",
            "description": "Gardien de la loi",
            "power_description": "Peut désigner un joueur par jour et le mettre en prison (ne vote pas, ne joue pas la nuit)",
            "team_id": villageois_team.id,
            "phase_action": "DAY",
            "usage_limit": 1,
            "emoji": "⭐",
            "difficulty": "MEDIUM"
        }
    ]
    
    db = SessionLocal()
    try:
        for role_data in roles_data:
            existing_role = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing_role:
                role = Role(**role_data)
                db.add(role)
                print(f"Rôle créé: {role.name}")
            else:
                print(f"Rôle existant: {existing_role.name}")
        
        db.commit()
        print(f"Total des rôles créés: {len(roles_data)}")
    except Exception as e:
        db.rollback()
        print(f"Erreur lors de la création des rôles: {e}")
        raise
    finally:
        db.close()


def main():
    """Fonction principale d'initialisation"""
    print("Initialisation de la base de données Wendigo Game...")
    
    # Créer les tables
    create_tables()
    print("Tables créées avec succès")
    
    # Créer les équipes
    print("\nCréation des équipes...")
    teams = create_teams()
    print(f"Équipes créées: {len(teams)}")
    
    # Créer les rôles
    print("\nCréation des rôles...")
    create_roles(teams)
    
    print("\nInitialisation terminée avec succès!")


if __name__ == "__main__":
    main()
