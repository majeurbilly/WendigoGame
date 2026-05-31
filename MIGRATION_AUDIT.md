# Audit de migration — Authentik + observabilité (WendigoGame)

Document de suivi technique. Dernière mise à jour : **Ticket 5 (OIDC frontend React)**.

---

## Ticket 5 — Flux OIDC (frontend React)

- **Dépendances** : `react-oidc-context`, `oidc-client-ts`.
- **Config** : `VITE_AUTHENTIK_URL` → `authority` ; `VITE_AUTHENTIK_CLIENT_ID` → `client_id` ; `redirect_uri` = origine du frontend + `import.meta.env.BASE_URL` (`src/auth/oidcUserManager.ts`).
- **`AuthProvider`** : enveloppe l’app dans `App.tsx` avec `userManager` singleton partagé avec Axios.
- **`LoginPage`** : `useAuth().signinRedirect()` ; redirection si déjà authentifié.
- **Axios** : intercepteur async → `oidcUserManager.getUser()` → en-tête `Authorization`.
- **Zustand** : plus de `localStorage` pour le jeton ; `syncFromOidc` charge le profil via `getMeAPI` ; `token` en store = miroir du access token pour les hooks existants (WebSocket : TODO dédié).
- **Logout** : `signoutRedirect()` (Dashboard) + `post_logout_redirect_uri` → `/login`.

---

## Ticket 4 — Validation JWT via JWKS (Authentik, backend Go)

- **Dépendances** : `github.com/golang-jwt/jwt/v5`, `github.com/MicahParks/keyfunc/v2` (JWKS mis en cache + rafraîchissement en arrière-plan).
- **Configuration** : `AUTHENTIK_JWKS_URL` (défaut code `http://localhost:9000/application/o/wendigo/jwks/`) ; Compose injecte `http://authentik-server:9000/application/o/wendigo/jwks/` pour le service `backend`.
- **`internal/auth/jwks.go`** : `TokenParser`, `NewTokenParser`, `SubjectFromAccessToken` → revendique **`sub`** après vérification de signature (RS/ES/PS256). `Close()` arrête le refresh JWKS.
- **Tests** : `WENDIGO_AUTH_TEST_MODE=1` → pas d’appel JWKS ; `MustTestAccessToken` (alg `none`) inchangé pour les tests d’intégration. `TestMain` dans `api_test` et `cmd/server`.
- **API** : `Config.AccessTokenParser` ; `NewRouter` complète un parser `nil` ; `cmd/server` instancie le parser et `defer Close()`. `AuthMiddleware` valide via JWKS (hors mode test). `auth.SubjectUUIDFromOIDCSub` : `sub` doit être un UUID jusqu’à mapping Authentik ↔ `users.id`.

---

## Ticket 3 — Nettoyage auth frontend (React)

- **Pages** : suppression de `RegisterPage.tsx` et de la route `/register` ; `LoginPage` sans formulaire email/mot de passe.
- **Connexion** : bouton unique **« ENTRER DANS LE CONSEIL »** (`VoxelButton`) ; depuis le **Ticket 5** : `useAuth().signinRedirect()` (OIDC) au lieu d’une redirection manuelle.
- **API** : `loginAPI` / `registerAPI` supprimés de `api/auth.ts` ; **`getMeAPI`** et **`getApiErrorMessage`** conservés.
- **Store** : plus d’appels login/register ; **Ticket 5** : session OIDC + `syncFromOidc` (plus de persistance token maison dans `localStorage`).
- **Types** : `src/vite-env.d.ts` pour `VITE_AUTHENTIK_URL` ; `frontend/.env.example` documenté.
- **E2E Playwright** : scénarios d’inscription **désactivés** (`test.describe.skip` / `test.skip`) jusqu’à réécriture OIDC.

---

- **Endpoints** : `POST /auth/register` et `POST /auth/login` supprimés ; `GET /auth/me` conservé (derrière `AuthMiddleware`).
- **Stockage** : champ `password_hash` retiré du modèle `User` et des `SELECT` / logique `UserStore` ; plus de `CreateUser` / `GetUserByEmail` / bcrypt. *(Aucune migration SQL livrée : la colonne peut encore exister en base ; les tests d’intégration insèrent une valeur littérale `legacy-placeholder` pour respecter le DDL actuel.)*
- **Lobby** : `POST /lobbies` exige un en-tête `Authorization: Bearer …` valide (parse côté serveur) ; plus de création anonyme.
- **WebSocket** : `GET /ws` exige `token=…` ; plus de fallback `player_id` ni création d’UUID invité.
- **JWT** : validation des access tokens via **JWKS Authentik** (`keyfunc` + cache) ; méthodes de signature RS/ES/PS ; extraction de `sub` puis contrainte UUID applicative (`SubjectUUIDFromOIDCSub`) jusqu’à table de liaison OIDC.

---

## Dépannage : Docker Hub (`toomanyrequests`, « too many failed login attempts »)

Ce message vient du **registre** (souvent après trop de pulls anonymes ou de mauvaises tentatives `docker login`), pas d’une erreur dans le fichier Compose.

- **`docker login`** sur [hub.docker.com](https://hub.docker.com) puis relancer les pulls.
- **`docker logout`** si des identifiants erronés bloquent l’IP, puis `docker login` avec les bons identifiants (ou pulls anonymes après délai).
- **Observabilité** : Prometheus + Loki + Grafana sont derrière le profil Compose **`observability`** (images Grafana/Loki uniquement sur Docker Hub). Stack jeu + Authentik sans ce profil : moins de dépendance à Hub ; LiveKit reste sur Hub (`livekit/livekit-server`).

---

## Décisions d’architecture (verrouillées)

| Sujet | Décision | Statut |
|--------|-----------|--------|
| Fichiers Docker Compose | **Un seul** `docker-compose.yml` à la racine du dépôt ; suppression de `backend/docker-compose.yml`. | **Résolu** (Ticket 1) |
| Identité / joueurs | **100 % Authentik (OIDC)** — pas de joueurs invités anonymes en cible produit. | **Résolu** (décision produit ; implémentation applicative à venir) |
| Secrets Compose | Variables d’environnement (fichier `.env` local, voir `.env.example`). | **En cours** (fichier `.env.example` fourni) |

---

## État actuel (après Ticket 1 — infra)

### Flake Nix (`flake.nix`)

- Shell de dev : Go, Node 20, pnpm, Docker, docker-compose, go-task, gnumake.
- **Ajouts Ticket 1 :** `skopeo`, `curl`, `jq`, `wget`, `bind.dnsutils` (dig, host, nslookup), `prometheus` (binaire + `promtool` pour valider les règles / usage local).
- Playwright : inchangé (libs Linux + `shellHook`).

### Docker Compose racine (`docker-compose.yml`)

Réseau unique **`wendigame_network`** (équivalent à l’ancienne source de vérité `backend/docker-compose.yml`).

| Service | Rôle | Ports hôte (défaut) |
|---------|------|---------------------|
| `db` | PostgreSQL **jeu** — image `public.ecr.aws/docker/library/postgres:15-alpine` | 5432 |
| `redis` | Valkey **jeu** — image `ghcr.io/valkey-io/valkey:8-alpine` (AOF, healthcheck) | 6379 |
| `livekit` | Serveur LiveKit `--dev` (`livekit/livekit-server`, Docker Hub) | 7880, 7881 tcp/udp |
| `backend` | API Go (`wendigame-backend:dev`, `depends_on` db healthy + redis healthy) | 8080 |
| `frontend` | Build Vite / nginx | 5173 → 80 |
| `authentik-postgresql` | PostgreSQL **dédié Authentik** — `public.ecr.aws/docker/library/postgres:16-alpine` | — |
| `authentik-redis` | Redis **dédié Authentik** — `public.ecr.aws/docker/library/redis:alpine` | — |
| `authentik-server` | UI / API Authentik | 9000, 9443 |
| `authentik-worker` | Worker Authentik (tâches async) | — |
| `prometheus` | Métriques — **profil `observability`**, image `quay.io/prometheus/prometheus` | 9090 |
| `loki` | Logs — **profil `observability`**, image Docker Hub `grafana/loki` | 3100 |
| `grafana` | Dashboards — **profil `observability`**, image Docker Hub `grafana/grafana` | 3000 |

**Profil Compose :** `docker compose up -d` démarre jeu + Authentik sans la pile observabilité. Pour tout activer : `docker compose --profile observability up -d` ou `COMPOSE_PROFILES=observability` dans `.env`.

Volumes nommés : données jeu (`postgres_data`, `valkey_data`), Authentik (`authentik_*`), observabilité (`prometheus_data`, `loki_data`, `grafana_data`).

Fichiers de config versionnés :

- `deploy/prometheus/prometheus.yml`
- `deploy/grafana/provisioning/datasources/datasources.yml`

### Validation

- `docker compose config` : **OK** (syntaxe et ports sans conflit sur la stack déclarée).

---

## Analyse d’écart (rappel — travail applicatif à venir)

Le code **React** et **Go** n’a pas été modifié dans le Ticket 1. Cibles ultérieures :

- Remplacer login/register maison et JWT HS256 applicatif par **flux OIDC Authentik** (PKCE ou BFF selon choix d’archi).
- Backend : valider les JWT **issuer Authentik** (JWKS) ou introspection ; mapper `sub` OIDC ↔ utilisateur métier en base.
- Client : retirer stockage `localStorage` du jeton applicatif actuel ; aligner CORS / URLs sur le reverse-proxy et Authentik.
- WebSocket : ne plus passer d’access token OIDC en query string brut ; prévoir **jeton d’accès court dédié** ou session côté serveur.
- **100 % Authentik :** retirer ou désactiver les chemins **sans JWT** sur `GET /ws` (mode `player_id` / UUID anonyme) et tout parcours « invité ».

---

## Plan d’intégration infra (suite)

- Brancher **Promtail** (ou driver logging Docker → Loki) pour étiqueter les logs des conteneurs `backend`, `frontend`, `authentik-*`, `db`, etc.
- Exposer **`GET /metrics`** sur le backend puis décommenter le job Prometheus dans `deploy/prometheus/prometheus.yml`.
- Sécuriser l’exposition de Grafana / Prometheus / Loki (réseau interne + SSO Authentik en frontal).
- En production : retirer les valeurs par défaut interpolées dans `docker-compose.yml` et imposer des secrets via `.env` / gestionnaire de secrets.

---

## Questions ouvertes (non bloquantes Ticket 1)

- Hébergement TLS (Traefik, Caddy, Nginx) et noms de domaine pour Authentik vs API jeu vs Grafana.
- Stratégie de **migration des comptes** existants (table de liaison `sub` Authentik ↔ `users.id`).
