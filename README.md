<div align="center">
  <img src="docs/images/logo.png" alt="Logo WendiGame" width="120" height="120">
  <h1>WendiGame 🐺</h1>
  <p><b>Le jeu du Loup-Garou, réinventé pour ton téléphone et tes soirées entre amis.</b></p>
</div>

---

## 🏕️ C'est quoi WendiGame ?

**WendiGame** est un jeu de déduction et de survie à rôles cachés. Imaginez le célèbre jeu du "Loup-Garou de Thiercelieux", mais sans avoir besoin de cartes en carton ou de quelqu'un qui sacrifie sa soirée pour faire le "Maître du Jeu". 

L'application s'occupe de tout et s'adapte à vous :
* **Vous êtes tous dans le même salon ?** Sortez vos téléphones. L'application distribue les rôles en secret, synchronise la tombée de la nuit sur tous les écrans en même temps, et compte les votes pour vous.
* **Vous jouez chacun chez vous sur PC ?** Mettez un casque. Le jeu intègre un système vocal "spatialisé" : vous entendrez les autres joueurs comme s'ils étaient vraiment assis autour de vous.

### Comment on joue ?
1. **Les Villageois** doivent débusquer les monstres qui se cachent parmi eux et voter pour les éliminer pendant la journée.
2. **Les Wendigos** (les monstres) se réveillent la nuit pour dévorer un villageois en secret.
3. D'autres rôles spéciaux (comme la Voyante) ont des pouvoirs uniques pour aider leur camp.

---

## 🚀 Comment lancer le jeu chez toi (De A à Z)

Tu veux faire tourner le jeu sur ton propre ordinateur pour tester ? Pas de panique, suis ce guide étape par étape. C'est comme une recette de cuisine !

### Étape 1 : Les outils nécessaires (Les ingrédients)
Avant de commencer, ton ordinateur a besoin de deux logiciels gratuits pour comprendre le code du jeu :
1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** : C'est le moteur qui va faire tourner les serveurs du jeu de manière isolée. Télécharge-le, installe-le et lance-le.
2. **[Nix](https://nixos.org/download.html)** : C'est une boîte à outils magique qui va installer automatiquement tout le reste pour toi (Go, Node.js, etc.) sans rien casser sur ton ordinateur.

> ⚠️ **Petite note pour les utilisateurs de Windows :**
> La boîte magique Nix ne comprend que le langage "Linux". Pas d'inquiétude ! Il te suffit d'installer un petit traducteur officiel appelé WSL. 
> Cherche le programme **PowerShell** sur ton ordi, fais un clic droit pour l'ouvrir "en tant qu'administrateur", tape `wsl --install`, appuie sur Entrée, puis redémarre ton ordinateur. Tu es maintenant prêt !

### Étape 2 : Récupérer le jeu
Ouvre ton **Terminal** (ou Invite de commandes) et copie-colle ceci pour télécharger le dossier du jeu sur ton ordinateur :
```bash
git clone 
cd WendiGame
```

### Étape 3 : Activer la boîte à outils
Maintenant que tu es dans le dossier du jeu, dis à Nix de préparer tes outils. Dans ton terminal, tape :
```bash
nix develop
```
*(Patiente un peu la première fois, il télécharge ce dont il a besoin).*

### Étape 4 : Les clés secrètes
Le jeu a besoin de fichiers de configuration (qu'on appelle variables d'environnement) pour que ses différents morceaux communiquent entre eux. On a préparé des fichiers "exemples" qu'il suffit de copier :

Tape ces deux commandes pour créer tes propres fichiers `.env` :
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Étape 5 : Allumer le moteur !
Tout est prêt. Déplace-toi dans le dossier du serveur et lance la commande magique de démarrage :
```bash
cd backend
task up
```
*(Docker va se mettre en route. Tu vas voir beaucoup de texte défiler, c'est normal : il construit le serveur, la base de données et le système vocal).*

### 🎉 Étape 6 : Jouer !
Une fois que le terminal s'arrête de défiler frénétiquement :
1. Ouvre ton navigateur internet (Chrome, Firefox, Safari...).
2. Va à l'adresse suivante : **`http://localhost:5173`**
3. Crée-toi un compte, clique sur **"Create Game"**, et amuse-toi !

> **Pour tout éteindre quand tu as fini :** 
> Retourne dans ton terminal et tape `task down`.

---

## 🧠 Pour les curieux (Sous le capot)

Si tu es un développeur et que tu te demandes comment ça marche :
* **Backend :** Écrit en **Go** pur avec le framework réseau Gorilla WebSockets. Il agit comme un chef d'orchestre autoritaire (State Machine).
* **Frontend :** Une interface ultra-réactive codée en **React / TypeScript**, stylisée avec Tailwind CSS.
* **Base de données :** **PostgreSQL** pour sauvegarder les joueurs et **Valkey/Redis** pour gérer les salons d'attente instantanés.

---

**Créé avec ❤️ et beaucoup de café par Billy Hallé.**  
*Merci à Gabriel et Antony pour avoir enduré les premiers crash-tests du serveur.*
```