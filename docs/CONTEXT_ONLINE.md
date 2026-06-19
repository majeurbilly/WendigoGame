# Contexte Architectural : WendigoGame - Online Lobby (Phase 1)

## Objectif Global
Créer un lobby multijoueur interactif en 2D pour la partie "Online" de WendigoGame. Pour ne pas brusquer le développement, l'implémentation est divisée en plusieurs phases. 
**Ce contexte concerne UNIQUEMENT la Phase 1 : Le Bac à Sable (Sandbox Local).** Aucune logique réseau (LiveKit/Go) ne doit être incluse pour le moment.

## Stack Technique
* Frontend : React
* Moteur 2D : HTML5 `<canvas>`
* Langage : TypeScript (ou JavaScript selon la configuration du projet)

## Règles Architecturales STRICTES (Ne pas déroger)

1. **Séparation React vs Canvas (Zéro `useState` pour la physique)**
   * Le rendu React et le rendu Canvas ont des cycles de vie différents.
   * Il est STRICTEMENT INTERDIT d'utiliser `useState` pour stocker la position (X, Y), la vélocité ou les inputs du joueur. Cela causerait des re-renders React à 60 FPS et détruirait les performances.
   * **Solution obligatoire :** Toute la donnée physique et l'état des contrôles doivent être stockés dans un objet mutable via `useRef` (ex: `gameStateRef.current`).

2. **La Boucle de Rendu (Game Loop)**
   * Utiliser `requestAnimationFrame` dans un `useEffect` pour gérer la boucle de jeu.
   * La boucle doit suivre l'ordre standard : 
     1. Mettre à jour la physique (Update).
     2. Nettoyer le canvas (Clear).
     3. Dessiner la frame (Draw).

## Spécifications de la Phase 1 (À implémenter)

### 1. Le Canvas et l'Environnement
* Un `<canvas>` qui prend une zone définie de l'écran.
* Un sol (floor) visuel dessiné en bas du canvas.
* Le joueur est représenté par un simple carré de couleur (placeholder pour les futurs skins).

### 2. Le Moteur Physique de base
* **Gravité :** Le carré tombe et s'arrête net lorsqu'il touche le sol.
* **Limites :** Le carré ne peut pas sortir du canvas par la gauche ou par la droite (collision avec les murs invisibles de l'écran).
* **Déplacement :** Le carré se déplace de gauche à droite de manière fluide (utilisation de vélocité ou de vitesse constante, au choix).

### 3. Les Contrôles (Inputs)
* **Clavier :** Écouteurs d'événements globaux (`keydown` / `keyup`) pour les flèches directionnelles (Gauche/Droite) ou A/D. Ces événements mettent à jour le `useRef` des inputs.
* **Interface Tactile (UI React) :** Par-dessus ou en dessous du canvas, inclure deux boutons HTML/React cliquables (Flèche Gauche, Flèche Droite). Ces boutons doivent simuler l'appui des touches en mettant à jour le même `useRef` (via les événements `onPointerDown` et `onPointerUp` pour supporter le mobile et la souris).

## Notes pour la génération de code
Génère un composant React propre, bien commenté, et prêt à être testé. Assure-toi que le nettoyage du `requestAnimationFrame` et des `eventListeners` est bien géré dans le `return` du `useEffect` pour éviter les fuites de mémoire.