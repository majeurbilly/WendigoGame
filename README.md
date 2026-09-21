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

## 🚀 Comment lancer (CI/CD Push / k3s)

L’orchestration Docker Compose et ArgoCD ont été retirées. Le runtime cible est un cluster **k3s** déployé en **push** par GitHub Actions.

1. **Pipeline** : push sur `main` → `.github/workflows/ci-cd.yml`
   - Lint/Test + Build/Push GHCR sur `ubuntu-latest`
   - Deploy sur runner **`self-hosted`** (`kustomize edit set image` + `kubectl apply -k deploy/k8s`)
2. **Dev local applicatif** (sans cluster) :
   ```bash
   nix develop
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cd backend && task run    # API Go (nécessite Postgres/Redis joignables)
   ```

Détails : `docs/gitops.md`, `docs/deploy-ci.md`.

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