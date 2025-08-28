# 🐺 WendiGame - Jeu de Loup-Garou Évolué

## 📖 Description du Jeu

**WendiGame** est un jeu de loup-garou (werewolf) **hybride présentiel-numérique** où **tous les joueurs ont des pouvoirs uniques**. Contrairement au jeu classique, il n'y a **pas de villageois** - chaque participant a un rôle spécial avec des capacités distinctes.

**🎯 Concept Unique :** 8 à 29 personnes se réunissent **physiquement dans la même pièce**, ouvrent leurs navigateurs sur la même URL, et jouent ensemble en utilisant la technologie comme support au jeu social traditionnel.

### 🌟 **Pourquoi ce Concept Hybride ?**

**Avantages du Présentiel :**
- **Communication naturelle** : Discussions en face à face, langage corporel, expressions
- **Ambiance immersive** : Tension palpable, rires partagés, émotions collectives
- **Stratégie sociale** : Observation directe des comportements et réactions

**Avantages du Numérique :**
- **Gestion automatique** : Phases, timers, résolution des pouvoirs
- **Interface claire** : Affichage des rôles, chat structuré, votes organisés
- **Équilibrage parfait** : Attribution automatique des rôles selon le nombre de joueurs

**Résultat :** Le meilleur des deux mondes - la richesse sociale du jeu de table avec la précision et l'organisation du numérique !

### 🎯 Concept Principal
- **Deux équipes** : Les **Méchants** (Loups) vs Les **Villageois** (Défenseurs)
- **Tous les joueurs ont des pouvoirs** : Pas de rôles passifs
- **29 rôles uniques** : 23 Villageois + 6 Loups avec des capacités distinctes
- **Jeu d'équipe stratégique** : Communication et coordination essentielles
- **Équilibrage complexe** : Chaque rôle a ses forces et faiblesses

## 🏗️ Architecture du Projet

### Versions Existantes
- **v1** : Java Spring Boot + React (complexe)
- **v2** : Python FastAPI + WebSockets (intermédiaire)
- **v3** : **Version simplifiée** (objectif)

### Structure Actuelle
```
WendiGame/
├── WendiGame/          # v1 - Java Spring Boot
├── WendiGame_v2/       # v2 - Python FastAPI
├── FastAPIProject/     # Projet FastAPI séparé
└── README.md          # Ce fichier
```

## 🎮 Système de Jeu

### 👥 Rôles et Équipes

#### 🐺 **Équipe des Méchants (Loups)**
1. **Skinwalker** - Loup métamorphe *old*
   - Pouvoir : Peut voter avec les autres loups pour tuer un joueur la nuit.


2. **Bouc Émissaire** - Loup sacrifié *old*
   - Pouvoir : Connaît l’identité des autres loups mais ne peut pas voter avec eux.


3. **Warlord** - Chef de guerre *old*
   - Ne fait pas partie du groupe des Loups mais gagne avec eux. Peut une fois par partie protéger un Loup d’une attaque, et connaît l’identité des Loups.


4. **Sbire** - Serviteur loyal *new*
   - Pouvoir : Ne fait pas partie du groupe des loups mais gagne avec eux. Peut une fois par partie protéger un loup d’une attaque.


5. **Marchand de Sable** - Maître des rêves *new*
   - Pouvoir : Peut endormir un joueur par nuit, l’empêchant d’utiliser son pouvoir.


6. **Pestiféré** - Loup maudit *old*
   - Pouvoir : Sa morsure contamine : si sa cible decide de ne pas ce suicidé, elle devient infectée et rejoint les loups au bout de 2 nuits.


#### 🛡️ **Équipe des Villageois (Défenseurs)**
1. **Voyante** - Détective *old*
   - Pouvoir : Peut révéler l'identité d'un joueur et la connaitre

2. **Épouvantail** - Protecteur des champs *old*
   - Pouvoir : Peut protéger un joueur chaque nuit contre une attaque.


3. **Corbeau** - Messager nocturne *old*
   - Pouvoir : Peut désigner un joueur chaque nuit ; ce joueur reçoit un vote supplémentaire automatique au prochain conseil.


4. **Renard** - Chasseur rusé *old*
   - Pouvoir : Peut flairer 3 joueurs au cours de la partie pour savoir si un loup est parmi eux.


5. **Rêveur** - Voyant des songes *old*
   - Chaque nuit, peut voir quel joueur est désigné par les Loups comme cible.


6. **Poltergeist** - Esprit perturbateur *old*
   - Une fois mort, peut s’exprimer à voix haute la première nuit suivant sa mort pour semer la confusion.


7. **Coroner** - Expert médico-légal *old*
   - Pouvoir : Une fois par partie, lorsqu’un joueur meurt, il peut déterminer si la mort a été causée par un Méchant ou un Villageois.


8. **Psychopompe** - Guide des âmes *old*
   - Pouvoir : Une fois par partie, peut prendre aléatoirement le pouvoir d’un joueur mort et l’utiliser pendant la nuit suivante.


9. **Ensorceleuse** - Magicienne de charme *erreur*
   - Pouvoir : Peut hanter un joueur chaque nuit, ce qui empêche son pouvoir de fonctionner.


10. **Sorcière** - Guérisseuse *old*
    - Pouvoir : Au début de la partie, choisit Potion de protection (devient Villageois) ou Poison (devient Méchant).

11. **Chaperon** - Protectrice des innocents *old*
    - Pouvoir : Ne peut pas mourir tant que le Chasseur est en vie. Si le Chasseur meurt, elle perd cette immunité.
 

12. **Chasseur** - Combattant principal *old*
    - Pouvoir : Quand il est tué (par les loups ou par vote), il peut immédiatement abattre un joueur de son choix.

13. **Jumeaux** - Duo inséparable *old*
    - Pouvoir : Les deux connaissent leur identité mutuelle dès le début.
 

14. **Insomniaque** - Veilleur nocturne *old*
    - Pouvoir : Peut espionner un joueur chaque nuit pour savoir si cette personne a utilisé son pouvoir (active) ou non (inactive). Insensible aux pouvoirs qui endorment (ex. Marchand de sable)
 

15. **Courtisane** - Séductrice *old*
    - Pouvoir : Chaque nuit, peut dormir chez un joueur voisin ; si ce joueur est un Loup elle meurt, sinon elle est protégée si les Loups la ciblent.
 

16. **Salvateur** - Sauveur de l'humanité *old* 
    - Pouvoir : Une fois par partie, peut ramener un joueur à la vie.
 

17. **Avocat du Diable** - Défenseur controversé *new*
    - Pouvoir : Peut choisir un joueur par jour et annuler les votes contre lui. Si le joueur protégé est un loup, il meurt lui-même à la place.
 

18. **Guerrier** - Combattant d'élite *new*
    - Pouvoir : Peut défier un joueur en duel (la nuit). Si c’est un loup, le loup meurt. S’il échoue, il tuera un villageois.
 

19. **Curieux** - Investigateur *erreur*
    - Pouvoir : Peut une fois par partie obtenir directement le rôle exact d’un joueur.
 

20. **Médium** - Communique avec les morts *old*
    - Pouvoir : Peut poser une question à un joueur mort, qui doit répondre du mieux possible à sa connaissance.


21. **Ancien** - Sage du village *old*
    - Pouvoir : Connaît au début de la partie le nombre exact de joueurs Méchants vivants, et perd cette information une fois mort.

22. **Garde du Corps** - Protecteur personnel *new*
    - Pouvoir : Peut protéger un joueur contre toute attaque une fois par partie.
 

23. **Shérif** - Gardien de la loi *new*
    - Pouvoir : Peut désigner un joueur par jour et le mettre en prison (ne vote pas, ne joue pas la nuit).
 

### 🌙 Comment se déroule une partie

Une partie de WendiGame suit une boucle précise qui transforme le jeu classique en véritable drame social.

#### **Phase Pré-Jeu : Connexion et Lobby**

**🏠 Préparation de la Session**
- **Réunion physique** : 8 à 29 joueurs se réunissent dans la même pièce
- **Connexion simultanée** : Chacun ouvre son navigateur et tape l'URL du jeu
- **Équipement** : Ordinateurs portables, tablettes ou smartphones (WiFi requis)

**1. Authentification**
- **Connexion** : Le joueur se connecte avec son compte existant
- **Création de compte** : Ou crée un nouveau compte s'il n'en a pas
- **Profil** : Accès à son historique de parties et statistiques

**2. Accès aux Lobbys**
- **Liste des lobbys** : Affichage de tous les lobbys disponibles
- **Création de lobby** : Chaque joueur peut créer son propre lobby
- **Paramètres du lobby** : Définition du nombre min/max de joueurs
- **Rejoindre un lobby** : Possibilité de rejoindre n'importe quel lobby ouvert

**3. Préparation de la Partie**
- **Attente des joueurs** : Le lobby se remplit progressivement
- **Bouton "Prêt"** : Chaque joueur confirme qu'il est prêt à jouer
- **Vérification des conditions** : Le système vérifie que le nombre de joueurs est dans la plage min/max
- **Démarrage automatique** : La partie commence dès que toutes les conditions sont remplies

**4. Transition vers le Jeu**
- **Sortie du lobby** : Tous les joueurs quittent automatiquement le lobby
- **Interface de jeu** : Redirection vers l'interface de partie
- **Attribution des rôles** : Distribution aléatoire des 29 rôles selon le nombre de joueurs

#### **La boucle de base**
```
Tant qu'il reste des loups ET des villageois → Le jeu continue
Sinon → Fin de Partie
```

#### **La boucle de base**
```
Tant qu'il reste des loups ET des villageois → Le jeu continue
Sinon → Fin de Partie
```

#### **Phase Jour (Social) - 10 minutes**
Les joueurs discutent librement, échangent des informations et préparent leurs accusations. C'est le moment de la stratégie d'équipe et des premières suspicions.

#### **Phase Soir (Sélection) - 1 minute**
Chaque joueur choisit officiellement ou non qui il veut accuser. 30 secondes. 
Un joueur peut recevoir plusieurs accusation 

#### **Phase Soir (Accusations)**
Pour chaque accusation :
- **L'accusateur parle 30 minutes** - Il présente ses preuves
- **L'accusé se défend 1 minutes** - Il donne sa version
- **Le village vote** - Décision collective

#### **Phase Nuit**
Le programme réveille chaque joueur individuellement et lui donne 30 secondes pour effectuer ses actions.
Les loups choisissent leur victime. 
Et apres chaque joueur utilise son pouvoir si il est encore en vie. 

##### voici l'ordre logique dans laquelle les roles jouent :

**1. Actions de Protection (Priorité 1)**
- Épouvantail - Protège sa cible
- Garde du Corps - Protection unique
- Warlord - Protection d'un loup
- Sbire - Protection d'un loup

**2. Actions de Contrôle (Priorité 2)**
- Marchand de Sable - Endort sa cible
- Ensorceleuse - Hante sa cible
- Shérif - Met en prison

**3. Actions d'Information (Priorité 3)**
- Voyante - Révèle l'identité
- Renard - Flaire les loups
- Rêveur - Voir la cible des loups
- Insomniaque - Espionne l'activité
- Curieux - Révèle le rôle exact

**4. Actions d'Attaque (Priorité 4)**
- Guerrier - Duel nocturne
- Courtisane - Dormir chez un voisin

**5. Actions de Support (Priorité 5)**
- Corbeau - Vote supplémentaire
- Psychopompe - Copie un pouvoir mort

**6. Actions des Loups (Priorité 6)**
- Skinwalker - Vote avec les loups
- Pestiféré - Contamination

**7. Actions de Résurrection (Priorité 7)**
- Salvateur - Ramène à la vie

**8. Actions Post-Mortem (Priorité 8)**
- Coroner - Analyse la cause de mort
- Poltergeist - Communication post-mortem

#### **Phase Réveil**
On annonce les morts de la nuit. Le village se réorganise avec les nouvelles informations.

### 🏠 **Système de Lobby Avancé**

#### **Fonctionnalités du Lobby**
- **Chat en temps réel** : Communication entre joueurs avant la partie
- **Liste des joueurs** : Affichage de tous les participants avec leur statut
- **Paramètres de partie** : Configuration du nombre min/max de joueurs
- **Règles personnalisées** : Options pour activer/désactiver certains rôles
- **Temps d'attente** : Compteur pour encourager les joueurs à se préparer

#### **Gestion des Rôles**
- **Distribution automatique** : Attribution aléatoire des rôles selon le nombre de joueurs
- **Équilibrage dynamique** : Ajustement automatique pour maintenir l'équilibre
- **Rôles optionnels** : Possibilité d'exclure certains rôles pour des parties plus simples
- **Variantes** : Différentes configurations selon le nombre de joueurs (8-29)

### 🎯 **Pourquoi ce système ?**

**Justice sociale** : Chaque accusation a sa défense. Pas de lynchage sans débat équitable.

**Stratégie profonde** : Le temps de préparation (10 min) + le temps de décision (1 min) + le temps de débat (30+1 min) créent des choix tactiques complexes.

**Engagement constant** : Pas de temps mort. Chaque phase a son importance et son rythme.

**Dynamisme social** : Les accusations créent des alliances temporaires et révèlent des informations cachées.

**Équilibrage naturel** : Le système d'ordre de priorité garantit que les protections peuvent contrer les attaques.

### 🎭 **Expérience de Jeu Hybride**

#### **Pendant la Phase Jour (Social)**
- **Discussions physiques** : Les joueurs parlent, débattent et s'accusent en face à face
- **Interface numérique** : Utilisée pour afficher les informations, chronométrer les phases
- **Stratégie mixte** : Communication verbale + utilisation des outils numériques

#### **Pendant la Phase Soir (Accusations)**
- **Débats oraux** : L'accusateur et l'accusé s'expriment devant tout le monde
- **Vote numérique** : Interface claire pour voter et voir les résultats
- **Transparence** : Tout le monde voit qui accuse qui et pourquoi

#### **Pendant la Phase Nuit**
- **Silence physique** : Les joueurs ferment les yeux ou se détournent
- **Interface privée** : Chaque joueur utilise son écran pour ses actions
- **Gestion automatique** : Le système résout les conflits et applique les effets

#### **Avantages de cette Approche**
- **Social authentique** : Vraies interactions humaines, pas de messages tapés
- **Technologie utile** : Gestion des règles complexes sans maître de jeu
- **Accessibilité** : Même les joueurs moins technophiles peuvent participer
- **Flexibilité** : Possibilité de jouer avec ou sans certains aspects numériques

## 🚀 Plan de Développement - Version 3 Simplifiée

### 📋 **Étape 1 : Architecture de Base (1-2 semaines)**

#### 1.1 Structure du Projet
```
WendiGame_v3/
├── backend/
│   ├── main.py           # Serveur principal
│   ├── game/
│   │   ├── __init__.py
│   │   ├── models.py     # Modèles de jeu
│   │   ├── roles.py      # Définition des rôles
│   │   ├── game_logic.py # Logique de jeu
│   │   └── lobby.py      # Gestion des lobbies
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py     # Routes API
│   │   └── websocket.py  # WebSockets
│   └── config.py         # Configuration
├── frontend/
│   ├── index.html        # Page principale
│   ├── css/
│   │   └── style.css     # Styles
│   └── js/
│       ├── game.js       # Logique client
│       ├── lobby.js      # Gestion lobby
│       └── websocket.js  # Communication
└── README.md
```

#### 1.2 Technologies Simplifiées
- **Backend** : Python + FastAPI + WebSockets
- **Frontend** : HTML/CSS/JavaScript vanilla
- **Base de données** : Fichier JSON (pour commencer)
- **Déploiement** : Serveur local simple

### 📋 **Étape 2 : Modèles de Données (1 semaine)**

#### 2.1 Classes Principales
```python
# Joueur
class Player:
    id: str
    name: str
    role: Role
    is_alive: bool
    team: Team

# Rôle
class Role:
    name: str
    team: Team
    power: Power
    description: str

# Partie
class Game:
    id: str
    players: List[Player]
    phase: GamePhase
    current_turn: int
    winner: Team
```

#### 2.2 Système de Rôles
- Interface `Power` pour tous les pouvoirs
- Classes concrètes pour chaque rôle
- Système d'activation des pouvoirs

### 📋 **Étape 3 : Logique de Jeu (2-3 semaines)**

#### 3.1 Gestionnaire de Partie
```python
class GameManager:
    def start_game(self)
    def next_phase(self)
    def execute_powers(self)
    def check_win_conditions(self)
    def handle_vote(self)
```

#### 3.2 Système de Pouvoirs
- Interface commune pour tous les pouvoirs
- Résolution des conflits de pouvoirs
- Système de cooldown

#### 3.3 Phases de Jeu
- Automatisation des transitions
- Gestion des timers
- Notifications aux joueurs

### 📋 **Étape 4 : Interface Utilisateur (2 semaines)**

#### 4.1 Interface de Lobby
- Liste des joueurs
- Chat en temps réel
- Boutons de contrôle

#### 4.2 Interface de Jeu
- Affichage des phases
- Interface des pouvoirs
- Système de vote
- Chat de jeu

#### 4.3 Responsive Design
- Compatible mobile
- Interface intuitive
- Animations simples

### 📋 **Étape 5 : Communication Temps Réel (1 semaine)**

#### 5.1 WebSockets
- Connexions par lobby
- Messages de jeu
- Notifications système

#### 5.2 Synchronisation
- État de jeu partagé
- Actions en temps réel
- Gestion des déconnexions

### 📋 **Étape 6 : Tests et Optimisation (1 semaine)**

#### 6.1 Tests
- Tests unitaires des rôles
- Tests d'intégration
- Tests de charge

#### 6.2 Optimisation
- Performance des WebSockets
- Optimisation du code
- Gestion de la mémoire

## 🛠️ Technologies Recommandées

### Backend
- **FastAPI** : API moderne et rapide
- **WebSockets** : Communication temps réel
- **Pydantic** : Validation des données
- **Uvicorn** : Serveur ASGI

### Frontend
- **HTML5** : Structure
- **CSS3** : Styles et animations
- **JavaScript ES6+** : Logique client
- **WebSocket API** : Communication

### Outils de Développement
- **Git** : Versioning
- **Python venv** : Environnement virtuel
- **VS Code** : Éditeur
- **Postman** : Tests API

## 📊 Métriques de Succès

### Fonctionnelles
- ✅ Jeu fonctionnel avec 8-29 joueurs
- ✅ 29 rôles uniques implémentés
- ✅ Communication temps réel
- ✅ Interface utilisable
- ✅ Équilibrage des rôles

### Techniques
- ✅ Code maintenable
- ✅ Documentation complète
- ✅ Tests de base
- ✅ Déploiement simple

## 🎯 Objectifs de la V3

### Simplicité
- **Code minimal** : Moins de 2000 lignes
- **Dépendances réduites** : Maximum 5 packages
- **Déploiement facile** : Un seul fichier à lancer

### Fonctionnalité
- **Jeu complet** : Toutes les phases implémentées
- **29 rôles équilibrés** : Jeu équitable et varié
- **Interface claire** : Facile à comprendre
- **Système de rôles modulaire** : Facile d'ajout de nouveaux rôles

### Extensibilité
- **Ajout de rôles** : Architecture modulaire pour 29+ rôles
- **Nouvelles phases** : Système flexible
- **Personnalisation** : Configuration simple
- **Équilibrage dynamique** : Ajustement automatique selon le nombre de joueurs

## 🚀 Démarrage Rapide

### Installation
```bash
# Cloner le projet
git clone <repository>
cd WendiGame_v3

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
pip install fastapi uvicorn websockets

# Lancer le serveur
python main.py
```

### Test
```bash
# Ouvrir dans le navigateur
http://localhost:8000
```

## 🤝 Contribution

### Comment Contribuer
1. **Fork** le projet
2. **Créer** une branche feature
3. **Implémenter** les changements
4. **Tester** le code
5. **Soumettre** une pull request

### Standards de Code
- **Python** : PEP 8
- **JavaScript** : ESLint
- **Documentation** : Docstrings
- **Tests** : Coverage > 80%

## 📝 Notes de Développement

### Priorités
1. **Fonctionnalité de base** avant beauté
2. **Stabilité** avant performance
3. **Simplicité** avant complexité

### Éviter
- ❌ Over-engineering
- ❌ Dépendances inutiles
- ❌ Interface complexe
- ❌ Code non documenté

### Favoriser
- ✅ Code simple et lisible
- ✅ Tests automatisés
- ✅ Documentation claire
- ✅ Interface intuitive

---

## 📞 Contact

Pour toute question ou suggestion concernant le projet WendiGame, n'hésitez pas à ouvrir une issue sur GitHub.

**Objectif final** : Créer un jeu de loup-garou moderne avec 29 rôles uniques, équilibré et amusant où chaque joueur a un rôle actif et des pouvoirs distincts ! 🎮✨

---

## 📝 **Guide de Complétion des Rôles**

Pour compléter les descriptions des rôles, remplacez les `[À compléter]` par :

### Format Suggéré pour Chaque Rôle :
```
- Pouvoir : Description claire et concise du pouvoir principal
- Capacité spéciale : Description de l'aptitude unique du rôle
```

### Exemples de Pouvoirs :
- **Attaque** : Tuer, blesser, neutraliser
- **Protection** : Sauvegarder, immuniser, soigner
- **Information** : Révéler, espionner, détecter
- **Manipulation** : Contrôler, influencer, transformer
- **Support** : Améliorer, assister, coordonner

### Exemples de Capacités Spéciales :
- **Passives** : Immunités, résistances, bonus
- **Actives** : Actions uniques, transformations
- **Conditionnelles** : Déclenchement sur événements
- **Limitées** : Usage unique, cooldown, conditions
