# 🐺 Wendigo Game - Jeu de Loup-Garou Évolué & Immersif

## 📖 Description du Jeu

**Wendigo Game** est un jeu de loup-garou (werewolf) **hybride présentiel-numérique** où **tous les joueurs ont des pouvoirs uniques**. Contrairement au jeu classique, il n'y a **pas de villageois** - chaque participant a un rôle spécial avec des capacités distinctes.

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
- **📱 Système de vibration séquentielle** : Réveil aléatoire des joueurs la nuit
- **🪑 Système de sélection de chaises** : Interface numérique pour valider la position physique

**Résultat :** Le meilleur des deux mondes - la richesse sociale du jeu de table avec la précision et l'organisation du numérique !

### 🎯 Concept Principal
- **Deux équipes** : Les **Méchants** (Loups) vs Les **Villageois** (Défenseurs)
- **Tous les joueurs ont des pouvoirs** : Pas de rôles passifs
- **29 rôles uniques** : 23 Villageois + 6 Loups avec des capacités distinctes
- **Jeu d'équipe stratégique** : Communication et coordination essentielles
- **Équilibrage complexe** : Chaque rôle a ses forces et faiblesses

## 🏗️ Architecture du Projet

### 🚨 **ATTENTION : Frontend Réinitialisé - Migration vers Flutter**

**Le frontend a été complètement réinitialisé** - tous les fichiers sont vides (0 bytes). Après analyse approfondie, nous avons décidé de **migrer vers Flutter** pour une meilleure expérience mobile avec vibration native et notifications push.

### **État Actuel du Frontend**

```
frontend/
├── shared/                    # Code partagé entre mobile et web
│   ├── components/           # Tous les composants sont VIDES (0 bytes)
│   ├── types/                # Types Dart VIDES
│   ├── utils/                # Utilitaires VIDES
│   └── constants/            # Constantes VIDES
├── mobile/                    # Application Flutter
│   ├── src/                  # Dossiers vides
│   ├── main.dart             # 0 bytes
│   └── pubspec.yaml          # 0 bytes
├── web/                       # Version web Flutter
│   ├── src/                  # Dossiers vides
│   ├── main.dart             # 0 bytes
│   └── pubspec.yaml          # 0 bytes
└── pubspec.yaml               # 0 bytes
```

### **Approche Prévue : Flutter Unifié (Mobile + Web)**

**Objectif** : Créer une solution unifiée qui couvre à la fois les applications mobiles (Android + iOS) et le web avec une seule base de code.

#### **🎯 Avantages de Flutter Unifié :**

**1. Codebase Unique :**
- **Un seul codebase** pour développer les composants de jeu
- **Partage de code** entre mobile et web (95% de code commun)
- **Développement centralisé** : Une seule équipe, une seule base de code

**2. Écosystème Riche :**
- **Flutter Web** compile automatiquement vers HTML/CSS/JS
- **Flutter** gère Android, iOS et Web avec le même projet
- **Libraries compatibles** : Material Design, Cupertino, packages Flutter

**3. Expérience Native :**
- **API Vibration** native pour le système de réveil séquentiel
- **Notifications push** natives pour les alertes importantes
- **Performance native** : Rendu direct sur le GPU
- **Interface fluide** : 60 FPS sur toutes les plateformes

**4. Stratégie de Déploiement :**
- **Objectif immédiat** : Site web accessible via URL (95% du besoin couvert)
- **Objectif long terme** : Applications App Store/Play Store pour immersion totale
- **Progression naturelle** : Du web vers le mobile natif

### **Versions Existantes**
- **v1** : Java Spring Boot + React (complexe)
- **v2** : Python FastAPI + WebSockets (intermédiaire)
- **v3** : **Flutter Unifié (Mobile + Web)** (nouvelle approche unifiée) - **EN COURS DE RECONSTRUCTION**

### **Structure Prévue (Après Reconstruction)**
```
WendiGame/
├── backend/              # API .NET Core (inchangée)
├── shared/               # Code partagé entre mobile et web
│   ├── components/       # Composants Flutter communs
│   ├── types/            # Types Dart partagés
│   └── utils/            # Utilitaires communs
├── mobile/               # Application Flutter
│   ├── src/
│   │   ├── screens/      # Écrans de l'application
│   │   ├── navigation/   # Navigation mobile
│   │   └── services/     # Services et API
│   ├── main.dart         # Point d'entrée mobile
│   └── pubspec.yaml      # Dépendances Flutter
├── web/                  # Version web avec Flutter Web
│   ├── src/
│   │   ├── pages/        # Pages web spécifiques
│   │   └── services/     # Services adaptés au web
│   ├── main.dart         # Point d'entrée web
│   └── pubspec.yaml      # Dépendances Flutter Web
└── shared/               # Code partagé entre mobile et web
    ├── components/       # Composants communs
    ├── types/            # Types Dart partagés
    └── utils/            # Utilitaires communs
```

## 🚀 **Instructions de Reconstruction du Frontend Flutter**

### **Étape 1 : Initialisation du Projet Flutter**

```bash
# Naviguer vers le dossier frontend
cd frontend

# Initialiser le projet Flutter principal
flutter create --platforms=android,ios,web wendigo_game

# Naviguer dans le projet créé
cd wendigo_game

# Vérifier que Flutter est configuré
flutter doctor
```

### **Étape 2 : Configuration Flutter**

Le fichier `pubspec.yaml` est automatiquement créé avec la configuration Flutter :

```yaml
name: wendigo_game
description: "Wendigo Game - Jeu de Loup-Garou Évolué & Immersif"
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2
  # Dépendances pour le jeu
  web_socket_channel: ^2.4.0
  http: ^1.1.0
  shared_preferences: ^2.2.0
  vibration: ^1.8.0
  flutter_local_notifications: ^16.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
```

### **Étape 3 : Configuration Flutter**

Le fichier `android/app/src/main/AndroidManifest.xml` est configuré pour les permissions :

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Permissions pour vibration et notifications -->
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <application
        android:label="Wendigo Game"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <!-- Configuration de l'application -->
    </application>
</manifest>
```

### **Étape 4 : Reconstruction des Composants Flutter**

#### **4.1 Composants Communs (`shared/components/common/`)**

**Button.dart** - Bouton réutilisable avec variantes :
```dart
import 'package:flutter/material.dart';

enum ButtonVariant { primary, secondary, danger, success, ghost }
enum ButtonSize { sm, md, lg }

class GameButton extends StatelessWidget {
  final ButtonVariant variant;
  final ButtonSize size;
  final VoidCallback onPressed;
  final bool disabled;
  final Widget child;
  final ButtonStyle? style;

  const GameButton({
    super.key,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.md,
    required this.onPressed,
    this.disabled = false,
    required this.child,
    this.style,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: disabled ? null : onPressed,
      style: _getButtonStyle(),
      child: child,
    );
  }

  ButtonStyle _getButtonStyle() {
    Color backgroundColor;
    Color textColor;
    
    switch (variant) {
      case ButtonVariant.primary:
        backgroundColor = const Color(0xFFDC2626);
        textColor = Colors.white;
        break;
      case ButtonVariant.secondary:
        backgroundColor = const Color(0xFF475569);
        textColor = Colors.white;
        break;
      case ButtonVariant.danger:
        backgroundColor = const Color(0xFFDC2626);
        textColor = Colors.white;
        break;
      case ButtonVariant.success:
        backgroundColor = const Color(0xFF16A34A);
        textColor = Colors.white;
        break;
      case ButtonVariant.ghost:
        backgroundColor = Colors.transparent;
        textColor = const Color(0xFF64748B);
        break;
    }

    return ElevatedButton.styleFrom(
      backgroundColor: backgroundColor,
      foregroundColor: textColor,
      padding: _getPadding(),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: variant == ButtonVariant.ghost 
          ? const BorderSide(color: Color(0xFF64748B)) 
          : BorderSide.none,
      ),
    );
  }

  EdgeInsets _getPadding() {
    switch (size) {
      case ButtonSize.sm:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 8);
      case ButtonSize.md:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 12);
      case ButtonSize.lg:
        return const EdgeInsets.symmetric(horizontal: 32, vertical: 16);
    }
  }
}
```

#### **4.2 Autres Composants Communs**
- **Card.dart** - Conteneur avec variantes (elevated, flat, interactive)
- **Modal.dart** - Popup modal réutilisable
- **Input.dart** - Champs de saisie stylisés
- **Badge.dart** - Badges et étiquettes

#### **4.2 Types Dart (`shared/types/index.dart`)**

```dart
// Types de base du jeu
class Player {
  final String id;
  final String name;
  final Role role;
  final bool isAlive;
  final bool isReady;
  final int? selectedChair;
  final Team team;
  final String color;

  const Player({
    required this.id,
    required this.name,
    required this.role,
    required this.isAlive,
    required this.isReady,
    this.selectedChair,
    required this.team,
    required this.color,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      id: json['id'],
      name: json['name'],
      role: Role.fromJson(json['role']),
      isAlive: json['isAlive'],
      isReady: json['isReady'],
      selectedChair: json['selectedChair'],
      team: Team.values.firstWhere((e) => e.name == json['team']),
      color: json['color'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role': role.toJson(),
      'isAlive': isAlive,
      'isReady': isReady,
      'selectedChair': selectedChair,
      'team': team.name,
      'color': color,
    };
  }
}

enum Team { village, wolves }

class Role {
  final String id;
  final String name;
  final String description;
  final Team team;
  final String power;
  final bool isActive;

  const Role({
    required this.id,
    required this.name,
    required this.description,
    required this.team,
    required this.power,
    required this.isActive,
  });

  factory Role.fromJson(Map<String, dynamic> json) {
    return Role(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      team: Team.values.firstWhere((e) => e.name == json['team']),
      power: json['power'],
      isActive: json['isActive'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'team': team.name,
      'power': power,
      'isActive': isActive,
    };
  }
}

class Game {
  final String id;
  final GameStatus status;
  final GamePhase phase;
  final int timeRemaining;
  final int totalTime;
  final List<Player> players;
  final Player? currentPlayer;
  final int? selectedChair;
  final int round;
  final int maxRounds;

  const Game({
    required this.id,
    required this.status,
    required this.phase,
    required this.timeRemaining,
    required this.totalTime,
    required this.players,
    this.currentPlayer,
    this.selectedChair,
    required this.round,
    required this.maxRounds,
  });

  factory Game.fromJson(Map<String, dynamic> json) {
    return Game(
      id: json['id'],
      status: GameStatus.values.firstWhere((e) => e.name == json['status']),
      phase: GamePhase.values.firstWhere((e) => e.name == json['phase']),
      timeRemaining: json['timeRemaining'],
      totalTime: json['totalTime'],
      players: (json['players'] as List).map((p) => Player.fromJson(p)).toList(),
      currentPlayer: json['currentPlayer'] != null 
        ? Player.fromJson(json['currentPlayer']) 
        : null,
      selectedChair: json['selectedChair'],
      round: json['round'],
      maxRounds: json['maxRounds'],
    );
  }
}

enum GameStatus { waiting, playing, finished }
enum GamePhase { day, night }
```

### **Étape 5 : Configuration des Applications Flutter**

#### **5.1 Application Mobile (`mobile/`)**

**pubspec.yaml** :
```yaml
name: wendigo_game_mobile
description: "Wendigo Game Mobile - Jeu de Loup-Garou Évolué"
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2
  
  # Navigation
  go_router: ^12.0.0
  
  # Gestion d'état
  provider: ^6.1.0
  
  # API et WebSocket
  http: ^1.1.0
  web_socket_channel: ^2.4.0
  
  # Stockage local
  shared_preferences: ^2.2.0
  
  # APIs natives
  vibration: ^1.8.0
  flutter_local_notifications: ^16.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
```

#### **5.2 Application Web (`web/`)**

**pubspec.yaml** :
```yaml
name: wendigo_game_web
description: "Wendigo Game Web - Version Web du Jeu de Loup-Garou"
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2
  
  # Navigation
  go_router: ^12.0.0
  
  # Gestion d'état
  provider: ^6.1.0
  
  # API et WebSocket
  http: ^1.1.0
  web_socket_channel: ^2.4.0
  
  # Stockage web
  shared_preferences: ^2.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
```

## 📋 **Checklist de Reconstruction Flutter**

- [ ] **Initialisation** : `flutter create` dans `frontend/`
- [ ] **Dépendances principales** : Flutter SDK, packages essentiels
- [ ] **Configuration Flutter** : `pubspec.yaml` configuré
- [ ] **Configuration plateformes** : Android, iOS, Web
- [ ] **Composants communs** : Button, Card, Modal, Input, Badge
- [ ] **Types Dart** : Classes Player, Game, Lobby, etc.
- [ ] **Application mobile** : Navigation, écrans, services
- [ ] **Application web** : Routes, pages, services
- [ ] **APIs natives** : Vibration, notifications, stockage local
- [ ] **Tests** : Vérification du fonctionnement
- [ ] **Documentation** : Mise à jour des guides

## 🚨 **Prochaines Étapes**

1. **Exécuter les scripts de reconstruction Flutter**
2. **Vérifier que tous les composants Flutter fonctionnent**
3. **Tester sur mobile (Android/iOS) et web**
4. **Intégrer avec le backend .NET Core**
5. **Déployer la version web et mobile**
6. **Tester les APIs natives (vibration, notifications)**

## 🎮 Système de Jeu

### 👥 Rôles et Équipes

#### 🐺 **Équipe des Méchants (Loups)**
1. **Skinwalker** - Loup métamorphe *old*
   - Pouvoir : Peut voter avec les autres loups pour tuer un joueur la nuit.
   - Phase d'action : La nuit

2. **Bouc Émissaire** - Loup sacrifié *old*
   - Pouvoir : Connaît l'identité des autres loups mais ne peut pas voter avec eux.
   - Phase d'action : La nuit

3. **Warlord** - Chef de guerre *old*
   - Ne fait pas partie du groupe des Loups mais gagne avec eux. Ne connaît pas l'identité des Loups. Durant la phase de jour, peut cibler un joueur en inscrivant son nom et son rôle supposé. Si correct, le joueur ne se réveillera pas la nuit suivante. Si incorrect, perd définitivement son pouvoir.
   - Phase d'action : Le jour

4. **Sbire** - Serviteur loyal *new*
   - Pouvoir : Ne fait pas partie du groupe des loups mais gagne avec eux. Peut une fois par partie protéger un loup d'une attaque.
   - Phase d'action : La nuit

5. **Marchand de Sable** - Maître des rêves *new*
   - Pouvoir : Peut endormir le village et passé pardessus la phase d'accusation. Donc on passe de la phase de jour a la phase de nuit directement. Une fois activé durant la nuit le pouvoir sera actif au prochain tour.
   - Phase d'action : La nuit

6. **Pestiféré** - Loup maudit *old*
   - Pouvoir : Sa morsure contamine : si sa cible decide de ne pas ce suicidé, elle devient infectée et rejoint les loups au bout de 2 nuits.
   - Phase d'action : La nuit

#### 🛡️ **Équipe des Villageois (Défenseurs)**
1. **Voyante** - Détective *old*
   - Pouvoir : Peut révéler l'identité d'un joueur et la connaitre
   - Phase d'action : La nuit

2. **Épouvantail** - Protecteur des champs *old*
   - Pouvoir : Peut protéger une fois par partie les deux joueur assit a sa gauche et a sa droite contre une attaque.       
   - Phase d'action : La nuit


3. **Corbeau** - Messager nocturne *old*
   - Pouvoir : Peut désigner un joueur chaque nuit ; ce joueur reçoit un vote supplémentaire automatique au prochain conseil.
   - Phase d'action : La nuit


4. **Renard** - Chasseur rusé *old*
   - Pouvoir : Peut flairer les 3 joueurs a sa gauche 1 fois durant la partie pour savoir si un loup est parmi eux.
   - Phase d'action : La nuit


5. **Rêveur** - Voyant des songes *old*
   - Chaque nuit, peut voir quel joueur est désigné par les Loups comme cible.
   - Phase d'action : Le nuit

6. **Poltergeist** - Esprit perturbateur *old*
   - Il peut dessigner un joueur et ouvrir un chat privé avec cette personne tout le long de la partie, mais une fois mort.
   - Phase d'action : La jour

7. **Coroner** - Expert médico-légal *old*
   - Pouvoir : Une fois par partie, lorsqu'un joueur meurt, il peut déterminer si la mort a été causée par un Méchant ou un Villageois.
   - Phase d'action : La jour

8. **Psychopompe** - Guide des âmes *old*
   - Pouvoir : Une fois par partie, peut prendre aléatoirement le pouvoir d'un joueur mort et l'utiliser pendant la nuit suivante.
   - Phase d'action : La nuit

9. **Ensorceleuse** - Magicienne de charme *erreur*
   - Pouvoir : Peut hanter un joueur chaque nuit, ce qui empêche son pouvoir de fonctionner.
   - Phase d'action : La nuit

10. **Sorcière** - Guérisseuse *old*
    - Pouvoir : Au début de la partie, choisit Potion de protection (devient Villageois) ou Poison (devient Méchant).
    - Phase d'action : La nuit

11. **Chaperon** - Protectrice des innocents *old*
    - Pouvoir : Ne peut pas mourir tant que le Chasseur est en vie. Si le Chasseur meurt, elle perd cette immunité.
    - Phase d'action : Aucune

12. **Chasseur** - Combattant principal *old*
    - Pouvoir : Quand il est tué (par les loups ou par vote), il peut immédiatement abattre un joueur de son choix.
    - Phase d'action : A sa mort

13. **Jumeaux** - Duo inséparable *old*
    - Pouvoir : Les deux connaissent leur identité mutuelle dès le début. Et on un chat privé ensemble.
    - Phase d'action : Aucune

14. **Insomniaque** - Veilleur nocturne *old*
    - Pouvoir : Peut espionner un joueur chaque nuit pour savoir si cette personne a utilisé son pouvoir (active) ou non (inactive) durant cette nuit. Insensible aux pouvoirs qui endorment (ex. Marchand de sable)
    - Phase d'action : La nuit

15. **Courtisane** - Séductrice *old*
    - Pouvoir : Chaque nuit, peut dormir chez un joueur voisin ; si ce joueur est un Loup elle meurt, sinon elle est protégée si les Loups la ciblent.
    - Phase d'action : La nuit

16. **Salvateur** - Sauveur de l'humanité *old* 
    - Pouvoir : Une fois par partie, peut ramener un joueur à la vie.
    - Phase d'action : La nuit

17. **Avocat du Diable** - Défenseur controversé *new*
    - Pouvoir : Peut choisir un joueur par jour et annuler les votes contre lui. Si le joueur protégé est un loup, il meurt lui-même à la place.
    - Phase d'action : La nuit

18. **Guerrier** - Combattant d'élite *new*
    - Pouvoir : Peut défier un joueur en duel (la nuit). Si c'est un loup, le loup meurt. S'il échoue, il tuera un villageois et perdera son pouvoir. Si il reussit il retrouvera son pouvoir.
    - Phase d'action : La nuit

19. **Curieux** - Investigateur *erreur*
    - Pouvoir : Peut une fois par partie obtenir directement le rôle exact d'un joueur.
    - Phase d'action : Le jour

20. **Médium** - Communique avec les morts *old*
    - Pouvoir : Peut avoir acces au chat des fantome de facon anonyme. Les autres dans le chat ne seront pas qui est le joueur.
    - Phase d'action : Toute la partie

21. **Ancien** - Sage du village *old*
    - Pouvoir : Connaît au début de la partie le nombre exact de joueurs Méchants vivants, et perd cette information une fois mort.
    - Phase d'action : Le jour

22. **Garde du Corps** - Protecteur personnel *new*
    - Pouvoir : Peut protéger un joueur contre toute attaque une fois par partie.
    - Phase d'action : La nuit

23. **Shérif** - Gardien de la loi *new*
    - Pouvoir : Peut désigner un joueur par jour et le mettre en prison (ne vote pas, ne joue pas la nuit).
    - Phase d'action : La jour

#### 👻 **Rôle Post-Mortem - Fantôme**
**Fantôme** - Esprit du village *new*
- **Transformation automatique** : Tous les joueurs morts deviennent automatiquement des Fantômes
- **Conservation de l'équipe** : Le joueur reste dans son équipe d'origine (Méchant ou Villageois)
- **Accès au chat** : Seuls les Fantômes et le Médium peuvent utiliser le chat pendant la partie
- **Communication stratégique** : Les Fantômes peuvent discuter entre eux et avec le Médium
- **Influence indirecte** : Participation aux discussions pour influencer les joueurs vivants
- **Rôle unique** : Premier rôle qui se transforme automatiquement selon l'état du joueur

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
- **Système de chaises** : Les joueurs doivent sélectionner la chaise où ils sont physiquement assis

#### **La boucle de base**
```
Tant qu'il reste des loups ET des villageois → Le jeu continue
Sinon → Fin de Partie
```

#### **Phase Jour (Social) - 10 minutes**
**Système de Sélection de Chaises :**
- **Disposition physique** : Les chaises sont disposées en cercle dans la pièce
- **Nombre de chaises** : Exactement le même nombre que de joueurs vivants
- **Sélection de chaise** : Chaque joueur doit sélectionner la chaise où il est physiquement assis
- **Interface numérique** : Les chaises sont numérotées et affichées à l'écran
- **Sélection unique** : Un joueur ne peut sélectionner qu'une seule chaise à la fois
- **Timing de sélection** : Les chaises ne deviennent sélectionnables qu'à partir de 8 minutes de la phase Jour
- **Chaises exclusives** : Une fois qu'un joueur sélectionne une chaise, elle devient indisponible pour les autres joueurs
- **Défaut de sélection** : Si un joueur n'a pas sélectionné sa chaise dans les 2 dernières minutes, il est exclu de la phase d'accusation mais peut toujours être mis sur le bûcher

**Processus de Sélection :**
1. **Arrivée physique** : Les joueurs s'assoient sur les chaises disposées en cercle
2. **Connexion numérique** : Chaque joueur se connecte et rejoint le lobby
3. **Attente de sélection** : Les chaises ne sont pas encore sélectionnables (0-8 minutes)
4. **Ouverture de sélection** : À 8 minutes, les chaises deviennent sélectionnables
5. **Sélection de chaise** : Le joueur sélectionne le numéro de la chaise où il est assis
6. **Confirmation et verrouillage** : La sélection est validée, la chaise devient indisponible pour les autres
7. **Fin de sélection** : À 10 minutes, toutes les sélections sont définitives

**Conséquences de la Non-Sélection :**
- **Exclusion du vote d'accusation** : Le joueur ne peut pas voter pour accuser quelqu'un
- **Vulnérabilité au bûcher** : Il peut toujours être accusé et mis sur le bûcher par les autres
- **Participation limitée** : Il peut discuter mais pas participer activement aux accusations

**Avantages de ce Système :**
- **Lien physique-numérique** : Connexion directe entre l'espace physique et l'interface
- **Stratégie de placement** : Les joueurs peuvent choisir leur position stratégiquement
- **Gestion des absences** : Les chaises vides correspondent aux joueurs morts
- **Immersion renforcée** : L'espace physique devient partie intégrante du jeu
- **Course contre la montre** : Les 2 dernières minutes créent une tension stratégique
- **Choix irréversible** : Une fois sélectionnée, la chaise est verrouillée pour les autres
- **Coordination d'équipe** : Les joueurs doivent se coordonner pour ne pas se bloquer mutuellement

#### **Phase Soir (Conseil du Village)**
**Système de vote d'accusation :**
- **Phase du conseil** : Une seule accusation par phase jour
- **Vote d'accusation** : Tous les joueurs votent pour qui ils veulent voir sur le bûcher
- **Sélection du condamné** : Le joueur avec le plus de votes va plaider son innocence
- **Plaidoirie** : Le condamné a **1 minute** pour plaider son innocence devant tout le village
- **Vote de condamnation** : Après la plaidoirie, tous les joueurs votent pour **tuer** ou **épargner**
- **Fin de phase** : Après le vote de condamnation, la nuit tombe et les joueurs commettent leurs actions
- **Historique des votes** : Tous les votes sont conservés et affichés dans un historique accessible

**Avantages de ce système :**
- **Justice équitable** : Une seule accusation par jour, chaque accusé a sa chance de se défendre
- **Stratégie collective** : Les joueurs doivent coordonner leurs votes pour une seule accusation
- **Tension dramatique** : Le conseil du village devient un moment crucial et unique
- **Plaidoirie structurée** : 1 minute de défense pour chaque accusé
- **Transparence totale** : Tous les votes sont visibles et traçables
- **Transition claire** : Après le conseil, la nuit tombe automatiquement

#### **Phase Nuit - Système de Vibration Séquentielle**
**Réveil aléatoire des joueurs :**
- **Vibration séquentielle** : Chaque joueur reçoit une vibration un après l'autre de façon aléatoire
- **Réveil individuel** : Le téléphone du joueur vibré s'illumine et vibre
- **Temps d'action** : Le joueur a **15 secondes** pour réaliser son action
- **Bouton "Continuer"** : Si le joueur n'a pas d'action, un simple bouton "Continuer" s'affiche
- **Transition** : Après les 15 secondes, **5 secondes d'attente** avant le prochain joueur
- **Ordre aléatoire** : Tous les joueurs jouent leur action dans un ordre complètement aléatoire
- **Priorisation finale** : À la fin, le programme applique les actions selon l'ordre de priorité logique

#### **Phase Jour - Chat des Loups (Nouveau)**
**Communication limitée des loups :**
- **Chat exclusif** : Seuls les loups peuvent accéder au chat pendant la phase Jour
- **Un message par jour** : Chaque loup a droit à un seul message par phase Jour
- **Limite de caractères** : Maximum 15 caractères par message
- **Coordination stratégique** : Les loups doivent se coordonner pour voter unanimement
- **Vote unanime requis** : Tous les loups doivent voter pour la même victime pour tuer
- **Échec du meurtre** : Si les votes divergent, aucune victime n'est tuée

**Processus complet :**
1. **Vibration aléatoire** → Un joueur est réveillé
2. **Réveil et action** → 15 secondes pour agir ou cliquer "Continuer"
3. **Transition** → 5 secondes d'attente
4. **Prochain joueur** → Vibration du joueur suivant (ordre aléatoire)
5. **Répétition** → Jusqu'à ce que tous les joueurs aient joué
6. **Résolution** → Application des actions selon l'ordre de priorité

##### **Ordre de Priorité pour la Résolution des Actions :**
**1. Actions de Contrôle (Priorité 1)**
- Marchand de Sable - Endort sa cible
- Ensorceleuse - Hante sa cible
- Shérif - Met en prison

**2. Actions de Protection (Priorité 2)**
- Épouvantail - Protège sa cible
- Garde du Corps - Protection unique
- Warlord - Protection d'un loup
- Sbire - Protection d'un loup

**3. Actions d'Attaque (Priorité 3)**
- Guerrier - Duel nocturne
- Courtisane - Dormir chez un voisin

**4. Actions des Loups (Priorité 4)**
- **Vote unanime requis** : Tous les loups doivent voter pour la même victime
- **Coordination via chat** : Communication limitée (1 message/jour, max 15 caractères)
- **Échec si divergence** : Aucune victime tuée si les votes ne sont pas unanimes
- **Skinwalker** - Vote avec les loups (doit s'aligner avec la majorité)
- **Pestiféré** - Contamination (si la victime survit)

**5. Actions d'Information (Priorité 5)**
- Voyante - Révèle l'identité
- Renard - Flaire les loups
- Rêveur - Voir la cible des loups
- Insomniaque - Espionne l'activité
- Curieux - Révèle le rôle exact

**6. Actions de Support (Priorité 6)**
- Corbeau - Vote supplémentaire
- Psychopompe - Copie un pouvoir mort

**7. Actions de Résurrection (Priorité 7)**
- Salvateur - Ramène à la vie

**8. Actions Post-Mortem (Priorité 8)**
- Coroner - Analyse la cause de mort
- Poltergeist - Communication post-mortem

#### **Phase Réveil**
On annonce les morts de la nuit. Le village se réorganise avec les nouvelles informations.

### 🏠 **Système de Lobby Avancé**

### 🔥 **Système de Bûcher Dynamique**

### 👻 **Système de Fantômes et Chat Restreint**

### 🐺 **Système de Vote Unanime des Loups**

### 📚 **Système d'Historique Complet de Partie**

#### **Fonctionnalités de l'Historique**
- **Enregistrement automatique** : Tous les événements sont capturés en temps réel
- **Timeline interactive** : Navigation fluide dans l'historique chronologique
- **Filtres avancés** : Recherche et tri par multiples critères
- **Détails contextuels** : Chaque action avec son contexte complet
- **Statistiques dynamiques** : Compteurs et métriques en temps réel
- **Export flexible** : Sauvegarde et partage de l'historique complet

#### **Avantages de l'Historique Complet**
- **Transparence totale** : Tous les joueurs peuvent revoir ce qui s'est passé
- **Analyse stratégique** : Comprendre les décisions et leurs conséquences
- **Apprentissage** : Améliorer sa stratégie en analysant les parties passées
- **Justice équitable** : Vérifier que toutes les règles ont été respectées
- **Engagement continu** : Les joueurs restent impliqués même après la partie
- **Partage d'expérience** : Discuter des moments clés avec d'autres joueurs
- **Archivage** : Conserver l'histoire des parties mémorables
- **Débogage** : Identifier et corriger les problèmes techniques

#### **Fonctionnalités du Vote Unanime**
- **Coordination obligatoire** : Tous les loups doivent voter pour la même victime
- **Chat limité** : 1 message par jour, maximum 15 caractères
- **Communication stratégique** : Les loups doivent se coordonner efficacement
- **Vote unanime requis** : Aucun meurtre si les votes divergent
- **Échec du meurtre** : Si un seul loup vote différemment, la victime survit
- **Stratégie d'équipe** : Les loups doivent former une alliance cohérente

#### **Avantages du Système de Vote Unanime**
- **Stratégie profonde** : Les loups doivent vraiment se coordonner
- **Communication limitée** : Évite le spam et garde le jeu équilibré
- **Tension accrue** : Chaque vote compte et peut faire échouer le meurtre
- **Équilibrage naturel** : Rendre le meurtre plus difficile pour les loups
- **Alliance nécessaire** : Les loups doivent vraiment travailler ensemble
- **Suspense maintenu** : Le village ne sait jamais si un meurtre va réussir

#### **Fonctionnalités des Fantômes**
- **Transformation automatique** : Changement de rôle instantané à la mort
- **Conservation de l'équipe** : Maintien de l'allégeance d'origine
- **Accès exclusif au chat** : Seuls les Fantômes et le Médium peuvent chatter
- **Communication stratégique** : Discussions entre Fantômes et avec le Médium
- **Influence indirecte** : Participation aux débats sans pouvoir voter
- **Rôle post-mortem** : Premier système de transformation automatique de rôle

#### **Avantages du Système de Fantômes**
- **Engagement continu** : Les joueurs morts restent actifs dans la partie
- **Stratégie post-mortem** : Les Fantômes peuvent influencer les vivants
- **Communication restreinte** : Évite le spam et garde le chat organisé
- **Rôle du Médium renforcé** : Seul lien entre vivants et morts
- **Équilibrage maintenu** : Les morts ne peuvent pas voter ou agir directement
- **Immersion accrue** : Sentiment de "vie après la mort" dans le jeu

#### **Fonctionnalités du Bûcher**
- **Vote d'accusation unique** : Une seule accusation par phase jour
- **Affichage des votes** : Compteur visible pour chaque joueur accusé
- **Sélection du condamné** : Le joueur le plus voté va plaider son innocence
- **Zone de plaidoirie** : Interface dédiée pour la défense de l'accusé (1 minute)
- **Vote de condamnation** : Système de vote final (tuer/épargner)
- **Historique complet** : Tous les votes conservés et accessibles
- **Transition automatique** : Après le vote, la nuit tombe automatiquement

#### **Avantages du Système de Bûcher**
- **Justice équitable** : Une seule accusation par jour, chaque accusé a sa chance de se défendre
- **Stratégie collective** : Les joueurs doivent coordonner leurs votes pour une seule accusation
- **Tension dramatique** : Le conseil du village devient un moment crucial et unique
- **Plaidoirie structurée** : 1 minute de défense pour chaque accusé
- **Transparence totale** : Tous les votes sont visibles et traçables
- **Transition claire** : Après le conseil, la nuit tombe automatiquement

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
- **Chat des loups** : Communication limitée entre loups (1 message/jour, max 15 caractères)
- **Coordination secrète** : Les loups doivent se coordonner pour voter unanimement

#### **Pendant la Phase Soir (Conseil du Village)**
- **Vote d'accusation unique** : Interface numérique pour voter contre un joueur (une seule accusation par jour)
- **Sélection du condamné** : Le joueur le plus voté va plaider son innocence
- **Plaidoirie orale** : L'accusé se défend pendant 1 minute devant tout le village
- **Vote de condamnation** : Interface numérique pour tuer ou épargner
- **Historique des votes** : Tous les votes conservés et accessibles
- **Transition automatique** : Après le vote, la nuit tombe automatiquement

#### **Pendant la Phase Nuit**
- **Silence physique** : Les joueurs ferment les yeux et attendent leur vibration
- **Réveil aléatoire** : Chaque joueur est réveillé individuellement par vibration
- **Action privée** : 15 secondes pour agir ou cliquer "Continuer"
- **Gestion automatique** : Le système résout les conflits selon l'ordre de priorité

#### **Système de Fantômes**
- **Transformation automatique** : Changement de rôle à la mort
- **Chat restreint** : Seuls les Fantômes et le Médium peuvent communiquer
- **Influence indirecte** : Les Fantômes observent et influencent les vivants
- **Stratégie post-mortem** : Participation continue malgré la mort

#### **Avantages de cette Approche**
- **Social authentique** : Vraies interactions humaines, pas de messages tapés
- **Technologie utile** : Gestion des règles complexes sans maître de jeu
- **Accessibilité** : Même les joueurs moins technophiles peuvent participer
- **Flexibilité** : Possibilité de jouer avec ou sans certains aspects numériques
- **Historique complet** : Traçabilité totale de tous les événements de la partie
- **Analyse post-partie** : Possibilité de revoir et analyser les moments clés
- **Immersion physique** : L'espace et le placement deviennent partie intégrante du jeu
- **Stratégie spatiale** : Les joueurs peuvent choisir leur position pour des avantages tactiques
- **Tension temporelle** : Les 2 dernières minutes créent une course contre la montre stratégique
- **Coordination d'équipe** : Les joueurs doivent se coordonner pour ne pas se bloquer mutuellement

## 📱 Interface Frontend - Flutter Unifié

### 🎯 **Vue d'ensemble de l'Interface**

Wendigo Game est conçu comme une **application Flutter unifiée** qui s'adapte automatiquement aux plateformes mobile (Android + iOS) et web grâce à **Flutter Web**. Cette approche nous permet d'offrir une expérience de jeu immersive et intuitive sur tous les appareils.

### 🧩 **Architecture Flutter Unifiée**

Notre frontend utilise **Flutter** comme base commune, avec **Flutter Web** pour la compilation automatique vers HTML/CSS/JS. Cette approche nous permet de :

- **Développer une seule fois** les composants de jeu
- **Partager 95% du code** entre mobile et web
- **Maintenir la cohérence** visuelle sur toutes les plateformes
- **Optimiser les performances** natives sur mobile
- **Bénéficier des APIs natives** : vibration et notifications push

#### **Structure React Native Unifiée**
```
shared/                    # Code partagé entre mobile et web
├── components/
│   ├── common/           # Composants génériques React Native
│   │   ├── Button.tsx    # Bouton avec variantes (primary, secondary, danger, success, ghost)
│   │   ├── Card.tsx      # Conteneur avec variantes (elevated, flat, interactive)
│   │   ├── Modal.tsx     # Popup modal réutilisable
│   │   ├── Input.dart    # Champs de saisie stylisés
│   │   ├── Badge.dart    # Badges et étiquettes
│   │   └── index.dart    # Exports centralisés
│   ├── game/             # Composants spécifiques au jeu
│   │   ├── PhaseIndicator.dart  # Indicateur de phase jour/nuit
│   │   ├── PlayerCard.dart      # Carte de joueur avec rôles
│   │   ├── ChairSelector.dart   # Sélecteur de chaises en cercle
│   │   ├── VoteSystem.dart      # Système de vote et bûcher
│   │   ├── ChatSystem.dart      # Chat restreint (loups/fantômes)
│   │   └── index.dart    # Exports centralisés
│   ├── auth/             # Composants d'authentification
│   │   ├── LoginForm.dart # Formulaire de connexion
│   │   ├── RegisterForm.dart # Formulaire d'inscription
│   │   └── index.dart    # Exports centralisés
│   └── lobby/            # Composants de lobby
│       ├── LobbyList.dart # Liste des lobbys disponibles
│       ├── LobbyChat.dart # Chat de lobby
│       ├── PlayerList.dart # Liste des joueurs dans le lobby
│       └── index.dart    # Exports centralisés
├── types/                 # Types Dart partagés
├── utils/                 # Utilitaires communs
└── constants/             # Constantes partagées

mobile/                    # Application Flutter
├── lib/
│   ├── screens/          # Écrans spécifiques au mobile
│   ├── navigation/       # Navigation mobile (GoRouter)
│   └── services/         # Services adaptés au mobile
└── main.dart             # Point d'entrée mobile

web/                       # Version web avec Flutter Web
├── lib/
│   ├── pages/            # Pages web spécifiques
│   └── services/         # Services adaptés au web
└── main.dart             # Point d'entrée web
```

### 🚀 **Architecture de l'Interface avec Flutter**

#### **1. Page de Connexion - Composants Flutter**
- **`LoginForm`** : Formulaire de connexion avec validation
- **`RegisterForm`** : Formulaire d'inscription avec validation
- **`GameButton`** (variante primary) : Boutons d'action
- **`GameCard`** (variante elevated) : Conteneur du formulaire
- **`GameInput`** : Champs de saisie stylisés
- Design épuré et accueillant

#### **2. Système de Lobby - Composants Flutter**
- **`LobbyList`** : Affichage des lobbys disponibles avec statut (ouvert/fermé)
- **`LobbyChat`** : Chat en temps réel dans le lobby
- **`PlayerList`** : Liste des joueurs avec statut "Prêt"
- **`GameButton`** (variantes) : Créer lobby, rejoindre, confirmer prêt
- **`GameCard`** (variante interactive) : Cartes de lobby cliquables
- **`GameModal`** : Configuration des paramètres de lobby
- **`GameBadge`** : Indicateurs de statut (ouvert, fermé, plein)
- **Remplissage progressif** du lobby en temps réel
- **Système de confirmation** : chaque joueur confirme qu'il est prêt
- **Vérification automatique** des conditions de début de partie
- **Redirection automatique** vers l'interface de partie

### 🎯 **Interface de Partie - Écran Principal avec Flutter**

#### **Header Épuré - Composants Flutter**
- **Logo du jeu** (coin supérieur gauche)
- **Menu hamburger discret** (≡) en haut à droite avec **`GameModal`** pour le menu
- Design minimaliste et professionnel

#### **Zone Centrale - Cœur du Jeu - Composants Flutter**
- **`PlayerCard`** : Affichage du nom du joueur et informations personnelles
- **`PhaseIndicator`** : Phase actuelle avec indicateur visuel :
  - 🌞 **Jour** (10:00) - Interface claire et lumineuse
  - 🌙 **Nuit** (30s) - Interface sombre et bleutée
- **Compteur de phase** :
  - Barre de progression visible
  - Chiffres en temps réel
  - Animation de décompte avec changement de couleur

#### **Boutons Principaux - Interface Mobile-First - Composants Flutter**
- **`GameButton`** (variante ghost) : Zone Notes - Accès aux notes personnelles sur les joueurs
- **`GameButton`** (variante secondary) : Fiche Personnelle - Informations du joueur (nom, rôle, équipe, couleur)
- **`GameButton`** (variante secondary) : Règles du Jeu - Guide complet et accessible
- **`GameButton`** (variante primary/danger) : Bouton Action - Utilisation des pouvoirs selon la phase
  - **Bloqué** : Pouvoir non disponible (affichage visuel)
  - **Actif** : Pouvoir utilisable
  - **Cooldown** : Pouvoir en recharge

#### **Système de Sélection de Chaises - Composants Flutter**
- **`ChairSelector`** : Interface de chaises numérotées disposées en cercle
- **Sélection de chaise** : Interface pour choisir la chaise où le joueur est physiquement assis
- **Timing de sélection** : Les chaises ne deviennent sélectionnables qu'à partir de 8 minutes de la phase Jour
- **Chaises exclusives** : Une fois sélectionnée, une chaise devient indisponible pour les autres joueurs
- **Validation de sélection** : Confirmation visuelle de la chaise sélectionnée
- **Gestion des conflits** : Prévention de la sélection de la même chaise par plusieurs joueurs
- **Timer de sélection** : Compte à rebours des 2 dernières minutes pour finaliser la sélection
- **Indicateur de disponibilité** : Affichage visuel des chaises disponibles/occupées

#### **Système de Bûcher et Votes - Composants Flutter**
- **`VoteSystem`** : Bûcher d'accusation avec affichage en temps réel des votes
- **Vote d'accusation unique** : Interface pour voter contre un joueur (une seule accusation par jour)
- **Plaidoirie** : Zone de plaidoirie pour le joueur sur le bûcher (1 minute) avec **`GameModal`**
- **Vote de condamnation** : Interface pour tuer ou épargner avec **`GameButton`** (variantes primary/danger)
- **Historique des votes** : Accès à tous les votes passés et présents

#### **Système de Chat Restreint - Composants Flutter**
- **`ChatSystem`** : Gestion centralisée de tous les types de chat
- **Chat des vivants** : Désactivé pendant la partie (seulement en lobby)
- **Chat des loups** : Accessible uniquement aux loups pendant la phase Jour (1 message/jour, max 15 caractères)
- **Chat des fantômes** : Accessible uniquement aux joueurs morts (Fantômes)
- **Chat du médium** : Le Médium peut communiquer avec les Fantômes
- **Communication stratégique** : Les Fantômes peuvent discuter entre eux
- **Influence indirecte** : Les Fantômes peuvent observer et influencer les vivants

#### **Système d'Historique Complet de Partie - Composants Flutter**
- **`GameHistory`** : Journal des événements avec tous les coups, actions et événements enregistrés
- **Timeline interactive** : Navigation chronologique dans l'historique de la partie
- **Filtres intelligents** : Recherche par phase, joueur, type d'action ou résultat avec **`GameInput`** et **`GameBadge`**
- **Détails complets** : Chaque action avec son contexte, timing et impact
- **Statistiques en temps réel** : Compteurs de votes, actions réussies/échouées
- **Export de partie** : Possibilité de sauvegarder l'historique complet avec **`GameButton`** (variante secondary)

### 🍔 **Menu Hamburger Complet - Composants Flutter**

#### **Navigation Principale - Composants Flutter**
- **`GameModal`** : Conteneur principal du menu hamburger
- **`GameButton`** (variante ghost) : Règles du jeu - Guide complet et détaillé
- **`GameButton`** (variante ghost) : Notes personnelles - Système de prise de notes avancé
- **`GameButton`** (variante ghost) : Fiches joueurs - Profils détaillés de tous les participants
- **`GameButton`** (variante ghost) : Historique de partie - Timeline complète des événements et actions
- **`GameButton`** (variante ghost) : Statistiques - Métriques et compteurs en temps réel
- **`GameButton`** (variante primary) : Bouton pouvoir - Accès rapide aux capacités
- **`GameButton`** (variante danger) : Déconnexion - Sortie sécurisée du jeu

#### **Système de Notes Avancé - Composants Flutter**
- **`GameInput`** : Nom complet du joueur sélectionné
- **`GameInput`** (textarea) : Zone de notes personnelles (champ texte libre)
- **Sélecteur de rôle suspecté** avec émojis utilisant **`GameBadge`** :
  - 👨‍🌾 Villageois
  - 🧛 Loup-Garou
  - 🔮 Voyante
  - 🛡️ Garde
  - 🧪 Sorcière
  - Et autres rôles...
- **`GameButton`** (variante success) : Sauvegarde automatique des notes
- **Persistance** : les notes restent même si la phase change

## 📱 **Système de Vibration Séquentielle - Réveil Aléatoire des Joueurs**

### **Caractéristiques du Système de Vibration**
- **Vibration séquentielle** : Chaque joueur est réveillé un après l'autre de façon aléatoire
- **Réveil individuel** : Le téléphone du joueur vibré s'illumine et vibre
- **Temps d'action** : 15 secondes pour réaliser son action ou cliquer "Continuer"
- **Transition fluide** : 5 secondes d'attente entre chaque joueur
- **Ordre aléatoire** : Séquence complètement imprévisible pour tous les joueurs

### **Phases de Réveil Automatisées**
- **🌙 Début de nuit** : "La nuit tombe. Les joueurs ferment les yeux."
- **📱 Vibration aléatoire** : Un joueur est réveillé pour son tour
- **⏱️ Action** : 15 secondes pour agir ou cliquer "Continuer"
- **⏳ Transition** : 5 secondes d'attente
- **🔄 Prochain joueur** : Vibration du joueur suivant (ordre aléatoire)
- **🏁 Fin de nuit** : "La nuit se termine. Tout le monde se réveille."

### **Synchronisation Vibration + Interface**
- **Changements visuels** selon la phase :
  - Jour : Interface claire et lumineuse
  - Nuit : Interface sombre et bleutée
  - Réveil : Écran s'illumine avec vibration
  - Action : Interface d'action avec compte à rebours
- **Transitions fluides** entre les phases

### **🎯 Immersion et Tension**

#### **Expérience Nocturne Authentique**
- **Silence physique** : Les joueurs gardent les yeux fermés
- **Réveil individuel** : Chaque joueur vit son moment de tension personnel
- **Temps limité** : 15 secondes créent une pression authentique
- **Ordre imprévisible** : Personne ne sait quand son tour arrivera

#### **Effets Visuels et Haptiques**
- **Vibration haptique** : Sensation tactile de réveil
- **Écran qui s'illumine** : Transition visuelle claire
- **Compte à rebours** : Barre de progression visible
- **Interface d'action** : Boutons et options clairement affichés

### **📱 Responsive Design et Accessibilité**

#### **Mobile-First Design**
- **Tous les éléments** pensés pour mobile en premier
- **Adaptabilité** aux tablettes et grands écrans
- **Boutons larges** et facilement cliquables
- **Zones de texte scrollables** si nécessaire

#### **Accessibilité**
- **Infobulles** sur les icônes et boutons
- **Navigation intuitive** sans formation préalable
- **Feedback visuel** clair pour toutes les actions
- **Contraste optimal** pour la lisibilité

### **⚡ Fonctionnalités Techniques Avancées**

#### **Synchronisation Temps Réel**
- **WebSockets** pour la communication instantanée
- **Actions synchronisées** entre tous les joueurs
- **Phases et notes** mises à jour en temps réel
- **Pas de décalage** entre les appareils

#### **Persistance des Données**
- **Notes persistantes** même en cas de déconnexion
- **Sauvegarde automatique** des informations
- **Historique des parties** conservé
- **Progression sauvegardée** automatiquement

#### **Gestion Automatique du Jeu**
- **Aucun maître de jeu** nécessaire
- **Programme automatisé** pour toutes les phases
- **Timing précis** et respecté par tous
- **Règles appliquées** automatiquement

#### **Système de Reconnexion**
- **Déconnexion temporaire** : Le joueur peut quitter via le bouton de déconnexion
- **Reconnexion possible** : Retour dans la partie si :
  - Le lobby est encore actif
  - La partie est toujours en cours
  - Le joueur était présent au lancement de la partie
- **Continuité de jeu** : Le joueur reprend exactement où il en était
- **Pas de pénalité** : Aucune sanction pour les déconnexions temporaires

#### **Système d'Historique Complet de Partie**
- **Journal détaillé** : Enregistrement automatique de tous les événements
- **Timeline interactive** : Navigation chronologique avec filtres avancés
- **Types d'événements** :
  - **Actions des rôles** : Pouvoirs utilisés, cibles, résultats
  - **Votes et accusations** : Tous les votes avec leurs résultats
  - **Phases de jeu** : Transitions, timers, annonces
  - **Morts et transformations** : Changements d'état des joueurs
  - **Chats et communications** : Messages des loups et fantômes
- **Filtres intelligents** :
  - Par joueur (vivant/mort, rôle, équipe)
  - Par phase (Jour, Soir, Nuit, Réveil)
  - Par type d'action (vote, pouvoir, communication)
  - Par résultat (réussi/échoué, impact)
- **Statistiques en temps réel** :
  - Compteurs de votes par joueur
  - Actions réussies/échouées par rôle
  - Temps passé dans chaque phase
  - Historique des accusations et défenses
- **Export et partage** :
  - Sauvegarde de l'historique complet
  - Partage pour analyse post-partie
  - Format JSON/CSV pour traitement externe

### **🎯 Avantages du Système de Vibration Séquentielle**

#### **Pour les Joueurs**
- **Expérience immersive** et authentique
- **Tension nocturne réelle** avec réveil aléatoire
- **Temps d'action limité** qui crée de la pression
- **Interface intuitive** et accessible

#### **Pour l'Organisation**
- **Aucun animateur** requis
- **Parties fluides** et bien structurées
- **Gestion automatique** des phases
- **Expérience cohérente** à chaque partie

## 🚀 Plan de Développement - Flutter Unifié

### 📋 **Étape 1 : Architecture de Base (2-3 semaines)**

#### 1.1 Structure du Projet
```
WendiGame/
├── backend/              # API .NET Core (déjà existante)
├── shared/               # Code partagé entre mobile et web
│   ├── components/       # Composants Flutter communs
│   ├── types/            # Types Dart partagés
│   ├── utils/            # Utilitaires communs
│   └── constants/        # Constantes partagées
├── mobile/               # Application Flutter
│   ├── lib/
│   │   ├── screens/      # Écrans de l'application
│   │   ├── navigation/   # Navigation mobile
│   │   └── services/     # Services adaptés au mobile
│   ├── main.dart         # Point d'entrée mobile
│   └── pubspec.yaml      # Dépendances Flutter
├── web/                  # Version web avec Flutter Web
│   ├── lib/
│   │   ├── pages/        # Pages web spécifiques
│   │   └── services/     # Services adaptés au web
│   ├── main.dart         # Point d'entrée web
│   └── pubspec.yaml      # Dépendances Flutter Web
└── README.md
```

#### 1.2 Technologies Unifiées
- **Frontend** : React Native + React Native Web
- **Framework** : Expo pour le développement unifié
- **Gestion des dépendances** : npm/yarn avec workspaces
- **Base de données** : API .NET Core existante
- **Déploiement** : Expo pour mobile, Vercel/Netlify pour web

### 📋 **Étape 2 : Composants Partagés (2-3 semaines)**

#### 2.1 Composants de Base
```typescript
// Composants React Native partagés
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  onPress: () => void;
  children: React.ReactNode;
}

interface CardProps {
  variant: 'elevated' | 'flat' | 'interactive';
  children: React.ReactNode;
  onPress?: () => void;
}
```

#### 2.2 Composants de Jeu
- **PhaseIndicator** : Affichage des phases jour/nuit
- **PlayerCard** : Cartes des joueurs avec rôles
- **ChairSelector** : Sélecteur de chaises en cercle
- **VoteSystem** : Système de vote et bûcher
- **ChatSystem** : Chat restreint pour loups et fantômes

### 📋 **Étape 3 : Application Mobile (3-4 semaines)**

#### 3.1 Navigation Mobile
- **React Navigation** pour la navigation entre écrans
- **Stack Navigator** pour les écrans de jeu
- **Tab Navigator** pour les sections principales

#### 3.2 Écrans Spécifiques
- **LobbyScreen** : Gestion des lobbys
- **GameScreen** : Interface principale de jeu
- **RoleScreen** : Affichage des rôles et pouvoirs
- **ChatScreen** : Communication en temps réel

#### 3.3 Fonctionnalités Natives
- **API Vibration** pour le système de réveil séquentiel
- **Notifications push** pour les alertes importantes
- **Stockage local** pour les préférences utilisateur

### 📋 **Étape 4 : Version Web (2-3 semaines)**

#### 4.1 React Native Web
- **Configuration** de React Native Web
- **Adaptation** des composants pour le web
- **Optimisation** des performances web

#### 4.2 Pages Web Spécifiques
- **Page d'accueil** responsive
- **Interface de jeu** adaptée au navigateur
- **Gestion des événements** clavier/souris

#### 4.3 Déploiement Web
- **Build** de la version web
- **Déploiement** sur Vercel/Netlify
- **Tests** de compatibilité navigateur

### 📋 **Étape 5 : Intégration et Tests (2 semaines)**

#### 5.1 Tests Unifiés
- **Tests unitaires** des composants partagés
- **Tests d'intégration** mobile et web
- **Tests de compatibilité** cross-platform

#### 5.2 Optimisation
- **Performance** des composants React Native
- **Bundle size** de la version web
- **Gestion de la mémoire** sur mobile

### 📋 **Étape 6 : Déploiement et Publication (1-2 semaines)**

#### 6.1 Déploiement Web
- **Build** de production
- **Déploiement** sur plateforme cloud
- **Configuration** des domaines et SSL

#### 6.2 Publication Mobile
- **Build** des applications Android/iOS
- **Soumission** sur App Store/Play Store
- **Configuration** des métadonnées et descriptions

## 🛠️ Technologies Recommandées

### Backend (Inchangé)
- **.NET Core** : API robuste et performante
- **Entity Framework** : ORM pour la base de données
- **SignalR** : Communication temps réel
- **SQL Server** : Base de données relationnelle

### Frontend Unifié
- **Flutter** : Base commune pour mobile et web
- **Flutter Web** : Compilation automatique vers HTML/CSS/JS
- **Dart** : Langage moderne et performant
- **Material Design** : Interface cohérente et belle

### Gestion des Dépendances
- **pub** : Gestionnaire de paquets Dart/Flutter
- **Flutter CLI** : Outils de développement et build
- **Flutter Engine** : Moteur de rendu optimisé
- **Dart Compiler** : Compilation native et web

### Outils de Développement
- **Git** : Versioning
- **VS Code** : Éditeur avec extensions Flutter
- **Flutter Inspector** : Développement et debugging
- **Flutter DevTools** : Debugging avancé
- **Android Studio** : IDE complet avec plugin Flutter

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

## 🎯 Objectifs de la V3 - Flutter Unifié

### Unification
- **Codebase unique** : 95% de code partagé entre mobile et web
- **Développement centralisé** : Une seule équipe, une seule base de code
- **Cohérence visuelle** : Interface identique sur toutes les plateformes
- **APIs natives** : Vibration et notifications push sur mobile

### Fonctionnalité
- **Jeu complet** : Toutes les phases implémentées
- **29 rôles équilibrés** : Jeu équitable et varié
- **Interface native** : Expérience optimale sur mobile
- **Version web accessible** : Jeu jouable sur navigateur
- **Fonctionnalités mobiles** : Vibration séquentielle, notifications

### Extensibilité
- **Ajout de rôles** : Architecture modulaire pour 29+ rôles
- **Nouvelles phases** : Système flexible
- **Personnalisation** : Configuration simple
- **Équilibrage dynamique** : Ajustement automatique selon le nombre de joueurs
- **Nouvelles plateformes** : Facile d'ajout de nouvelles plateformes
- **APIs natives** : Intégration facile de nouvelles fonctionnalités mobiles

## 🚀 Démarrage Rapide

Voir le [README principal](../README.md) pour les instructions de démarrage.

## 🤝 Contribution

### Comment Contribuer
1. **Fork** le projet
2. **Créer** une branche feature
3. **Implémenter** les changements
4. **Tester** le code
5. **Soumettre** une pull request

### Standards de Code
- **Dart** : Dart Style Guide
- **Flutter** : Flutter Style Guide
- **Documentation** : DartDoc
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

## 🔄 Flow de Jeu Complet

1. **Connexion** → Page d'accueil
2. **Lobby** → Création ou rejoindre
3. **Préparation** → Confirmation des joueurs
4. **Début de partie** → Redirection automatique
5. **Phase Jour** → Discussion et préparation des accusations
6. **Phase Soir (Conseil du Village)** → Vote d'accusation unique → Plaidoirie (1 min) → Vote de condamnation → Nuit
7. **Phase Nuit** → Actions des rôles spéciaux
8. **Transformation en Fantôme** → Les joueurs morts deviennent des Fantômes avec accès au chat
9. **Répétition** → Tant qu'il reste des loups ET des villageois
10. **Fin de partie** → Déclaration du vainqueur

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

---

## 📞 Contact

Pour toute question ou suggestion concernant le projet WendiGame, n'hésitez pas à ouvrir une issue sur GitHub.

**Objectif final** : Créer un jeu de loup-garou moderne avec 29 rôles uniques, équilibré et amusant où chaque joueur a un rôle actif et des pouvoirs distincts, le tout orchestré par une interface Flutter unifiée immersive avec vibration native et notifications push ! 🎮✨🦋

---

*Wendigo Game - Une expérience de Loup-Garou moderne, immersive et entièrement automatisée avec Flutter.*
