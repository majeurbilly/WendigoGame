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
   - Pouvoir : Connaît l'identité des autres loups mais ne peut pas voter avec eux.

3. **Warlord** - Chef de guerre *old*
   - Ne fait pas partie du groupe des Loups mais gagne avec eux. Peut une fois par partie protéger un Loup d'une attaque, et connaît l'identité des Loups.

4. **Sbire** - Serviteur loyal *new*
   - Pouvoir : Ne fait pas partie du groupe des loups mais gagne avec eux. Peut une fois par partie protéger un loup d'une attaque.

5. **Marchand de Sable** - Maître des rêves *new*
   - Pouvoir : Peut endormir un joueur par nuit, l'empêchant d'utiliser son pouvoir.

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
   - Une fois mort, peut s'exprimer à voix haute la première nuit suivant sa mort pour semer la confusion.

7. **Coroner** - Expert médico-légal *old*
   - Pouvoir : Une fois par partie, lorsqu'un joueur meurt, il peut déterminer si la mort a été causée par un Méchant ou un Villageois.

8. **Psychopompe** - Guide des âmes *old*
   - Pouvoir : Une fois par partie, peut prendre aléatoirement le pouvoir d'un joueur mort et l'utiliser pendant la nuit suivante.

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
    - Pouvoir : Peut défier un joueur en duel (la nuit). Si c'est un loup, le loup meurt. S'il échoue, il tuera un villageois.

19. **Curieux** - Investigateur *erreur*
    - Pouvoir : Peut une fois par partie obtenir directement le rôle exact d'un joueur.

20. **Médium** - Communique avec les morts *old*
    - Pouvoir : Peut poser une question à un joueur mort, qui doit répondre du mieux possible à sa connaissance.

21. **Ancien** - Sage du village *old*
    - Pouvoir : Connaît au début de la partie le nombre exact de joueurs Méchants vivants, et perd cette information une fois mort.

22. **Garde du Corps** - Protecteur personnel *new*
    - Pouvoir : Peut protéger un joueur contre toute attaque une fois par partie.

23. **Shérif** - Gardien de la loi *new*
    - Pouvoir : Peut désigner un joueur par jour et le mettre en prison (ne vote pas, ne joue pas la nuit).

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

#### **La boucle de base**
```
Tant qu'il reste des loups ET des villageois → Le jeu continue
Sinon → Fin de Partie
```

#### **Phase Jour (Social) - 10 minutes**
Les joueurs discutent librement, échangent des informations et préparent leurs accusations. C'est le moment de la stratégie d'équipe et des premières suspicions.

#### **Phase Soir (Accusations Dynamiques)**
**Système de vote d'accusation :**
- **Vote d'accusation** : Chaque joueur vote pour qui il veut voir sur le bûcher
- **Affichage en temps réel** : Les votes s'accumulent et sont visibles par tous
- **Bûcher automatique** : Le joueur le plus voté monte automatiquement sur le bûcher
- **Défense** : Le joueur accusé a **1 minute** pour se défendre devant tout le village
- **Vote de condamnation** : Après la défense, tous les joueurs votent pour **tuer** ou **épargner**
- **Historique des votes** : Tous les votes sont conservés et affichés dans un historique accessible
- **Boucle continue** : Le processus recommence tant qu'il y a des votes d'accusation

**Avantages de ce système :**
- **Dynamisme constant** : Pas de temps mort, les accusations peuvent être multiples
- **Stratégie collective** : Les joueurs doivent coordonner leurs votes
- **Tension dramatique** : Le bûcher se remplit progressivement
- **Justice équitable** : Chaque accusé a sa chance de se défendre
- **Transparence totale** : Tous les votes sont visibles et traçables

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
- **Vote d'accusation en temps réel** : Interface intuitive pour voter contre un joueur
- **Affichage des votes** : Compteur visible pour chaque joueur accusé
- **Bûcher automatique** : Le joueur le plus voté monte automatiquement
- **Zone de défense** : Interface dédiée pour la défense de l'accusé
- **Vote de condamnation** : Système de vote final (tuer/épargner)
- **Historique complet** : Tous les votes conservés et accessibles
- **Boucle continue** : Processus qui recommence tant qu'il y a des accusations

#### **Avantages du Système de Bûcher**
- **Engagement constant** : Pas de temps mort entre les accusations
- **Stratégie collective** : Les joueurs doivent coordonner leurs votes
- **Tension dramatique** : Le bûcher se remplit progressivement
- **Justice équitable** : Chaque accusé a sa chance de se défendre
- **Transparence totale** : Tous les votes sont visibles et traçables
- **Dynamisme social** : Les alliances se forment et se brisent rapidement

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

#### **Pendant la Phase Soir (Accusations Dynamiques)**
- **Votes d'accusation** : Interface numérique pour voter contre un joueur
- **Bûcher en temps réel** : Affichage des votes qui s'accumulent
- **Défense orale** : L'accusé se défend devant tout le village
- **Vote de condamnation** : Interface numérique pour tuer ou épargner
- **Historique des votes** : Tous les votes conservés et accessibles
- **Boucle continue** : Processus qui recommence tant qu'il y a des accusations

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

## 📱 Interface Frontend - Expérience Mobile-First

### 🎯 **Vue d'ensemble de l'Interface**

Wendigo Game est conçu comme une **application web responsive mobile-first** qui offre une expérience de jeu immersive et intuitive pour les joueurs de Loup-Garou. L'interface est optimisée pour les téléphones cellulaires via le navigateur, avec un design moderne et des animations fluides.

### 🚀 **Architecture de l'Interface**

#### **1. Page de Connexion**
- **Bouton de connexion** pour les utilisateurs existants
- **Bouton de création de compte** pour les nouveaux joueurs
- Design épuré et accueillant

#### **2. Système de Lobby**
- **Affichage des lobbys disponibles** avec statut (ouvert/fermé)
- **Création de lobby personnalisé** :
  - Définition du nombre minimum/maximum de joueurs
  - Paramètres de jeu configurables
- **Rejoindre n'importe quel lobby ouvert**
- **Remplissage progressif** du lobby en temps réel
- **Système de confirmation** : chaque joueur confirme qu'il est prêt
- **Vérification automatique** des conditions de début de partie
- **Redirection automatique** vers l'interface de partie

### 🎯 **Interface de Partie - Écran Principal**

#### **Header Épuré**
- **Logo du jeu** (coin supérieur gauche)
- **Menu hamburger discret** (≡) en haut à droite
- Design minimaliste et professionnel

#### **Zone Centrale - Cœur du Jeu**
- **Nom du joueur** affiché clairement
- **Phase actuelle** avec indicateur visuel :
  - 🌞 **Jour** (10:00) - Interface claire et lumineuse
  - 🌙 **Nuit** (30s) - Interface sombre et bleutée
- **Compteur de phase** :
  - Barre de progression visible
  - Chiffres en temps réel
  - Animation de décompte avec changement de couleur

#### **Boutons Principaux - Interface Mobile-First**
- **Zone Notes** : Accès aux notes personnelles sur les joueurs
- **Fiche Personnelle** : Informations du joueur (nom, rôle, équipe, couleur)
- **Règles du Jeu** : Guide complet et accessible
- **Bouton Action** : Utilisation des pouvoirs selon la phase
  - **Bloqué** : Pouvoir non disponible (affichage visuel)
  - **Actif** : Pouvoir utilisable
  - **Cooldown** : Pouvoir en recharge

#### **Système de Bûcher et Votes**
- **Bûcher d'accusation** : Affichage en temps réel des votes d'accusation
- **Vote d'accusation** : Interface pour voter contre un joueur
- **Défense** : Zone de défense pour le joueur sur le bûcher
- **Vote de condamnation** : Interface pour tuer ou épargner
- **Historique des votes** : Accès à tous les votes passés et présents

#### **Système de Chat Restreint**
- **Chat des vivants** : Désactivé pendant la partie (seulement en lobby)
- **Chat des loups** : Accessible uniquement aux loups pendant la phase Jour (1 message/jour, max 15 caractères)
- **Chat des fantômes** : Accessible uniquement aux joueurs morts (Fantômes)
- **Chat du médium** : Le Médium peut communiquer avec les Fantômes
- **Communication stratégique** : Les Fantômes peuvent discuter entre eux
- **Influence indirecte** : Les Fantômes peuvent observer et influencer les vivants

#### **Système d'Historique Complet de Partie**
- **Journal des événements** : Tous les coups, actions et événements sont enregistrés
- **Timeline interactive** : Navigation chronologique dans l'historique de la partie
- **Filtres intelligents** : Recherche par phase, joueur, type d'action ou résultat
- **Détails complets** : Chaque action avec son contexte, timing et impact
- **Statistiques en temps réel** : Compteurs de votes, actions réussies/échouées
- **Export de partie** : Possibilité de sauvegarder l'historique complet

### 🍔 **Menu Hamburger Complet**

#### **Navigation Principale**
- **Règles du jeu** : Guide complet et détaillé
- **Notes personnelles** : Système de prise de notes avancé
- **Fiches joueurs** : Profils détaillés de tous les participants
- **Historique de partie** : Timeline complète des événements et actions
- **Statistiques** : Métriques et compteurs en temps réel
- **Bouton pouvoir** : Accès rapide aux capacités
- **Déconnexion** : Sortie sécurisée du jeu

#### **Système de Notes Avancé**
- **Nom complet du joueur** sélectionné
- **Zone de notes personnelles** (champ texte libre)
- **Sélecteur de rôle suspecté** avec émojis :
  - 👨‍🌾 Villageois
  - 🧛 Loup-Garou
  - 🔮 Voyante
  - 🛡️ Garde
  - 🧪 Sorcière
  - Et autres rôles...
- **Sauvegarde automatique** des notes
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

## 🚀 Plan de Développement - Version 2 Actuelle

### 📋 **Étape 1 : Architecture de Base (1-2 semaines)**

#### 1.1 Structure du Projet
```
WendiGame_v2/
├── main.py               # Serveur principal
├── models.py             # Modèles de jeu
├── controllers.py        # Contrôleurs API
├── services.py           # Services de jeu
├── connection_manager.py # Gestion WebSockets
├── config.py             # Configuration
├── pyproject.toml        # Dépendances (uv)
├── uv.lock               # Verrouillage des versions
├── static/               # Frontend statique
│   ├── index.html        # Page principale
│   ├── css/
│   │   └── style.css     # Styles
│   └── js/
│       ├── main.js       # Logique client
│       └── lobby.js      # Gestion lobby
└── README.md
```

#### 1.2 Technologies Simplifiées
- **Backend** : Python + FastAPI + WebSockets
- **Frontend** : HTML/CSS/JavaScript vanilla (servi statiquement)
- **Gestion des dépendances** : uv + pyproject.toml (standard moderne)
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

### Gestion des Dépendances
- **uv** : Gestionnaire de paquets Python moderne et rapide (recommandé)
- **pyproject.toml** : Configuration moderne des dépendances (standard actuel)
- **pip** : Alternative classique (méthode legacy)

### Frontend
- **HTML5** : Structure
- **CSS3** : Styles et animations
- **JavaScript ES6+** : Logique client
- **WebSocket API** : Communication

### Outils de Développement
- **Git** : Versioning
- **uv** : Gestionnaire de paquets et environnements virtuels (recommandé)
- **pyproject.toml** : Configuration des dépendances (standard moderne)
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

## 🎯 Objectifs de la V2

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
cd WendiGame_v2

# Méthode moderne recommandée avec uv
uv sync
uv run main.py

# Ou avec uv directement (sans sync préalable)
uv run main.py

# Méthode legacy avec pip (non recommandée)
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
pip install fastapi uvicorn websockets
python main.py
```

### Test
```bash
# Ouvrir dans le navigateur
http://localhost:8000

# Avec uv (recommandé)
uv run main.py

# Ou avec port spécifique
uv run --port 8000 main.py
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

## 🔄 Flow de Jeu Complet

1. **Connexion** → Page d'accueil
2. **Lobby** → Création ou rejoindre
3. **Préparation** → Confirmation des joueurs
4. **Début de partie** → Redirection automatique
5. **Phase Jour** → Discussion et préparation des accusations
6. **Phase Soir (Bûcher)** → Votes d'accusation → Défense → Vote de condamnation
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

**Objectif final** : Créer un jeu de loup-garou moderne avec 29 rôles uniques, équilibré et amusant où chaque joueur a un rôle actif et des pouvoirs distincts, le tout orchestré par une interface mobile-first immersive avec une voix maîtresse automatisée ! 🎮✨🎙️

---

*Wendigo Game - Une expérience de Loup-Garou moderne, immersive et entièrement automatisée.*
