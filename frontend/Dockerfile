# syntax=docker/dockerfile:1

# ── builder ───────────────────────────────────────────────────────────────────
# Lingui 6 exige Node >= 22.19 (fs.globSync dans node:fs).

FROM node:22-alpine AS builder

WORKDIR /app

# Invalide uniquement quand les dépendances npm changent.
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Config outil de build : change rarement vs src/ → couche cache distincte.
COPY tsconfig.json tsconfig.app.json tsconfig.node.json \
    vite.config.ts lingui.config.ts postcss.config.js tailwind.config.js \
    components.json index.html ./
COPY public/ public/

# Code applicatif : invalide souvent ; ne refait pas npm ci si seul src/ bouge.
COPY src/ src/

# Build-time env Vite : invalide uniquement la couche build quand les ARG changent
# (ex. OIDC client id après pulumi up) — pas npm ci ni COPY src si identiques.
ARG VITE_API_URL=http://localhost:8080
ARG VITE_AUTHENTIK_URL=http://localhost:9000/application/o/wendigo/
ARG VITE_AUTHENTIK_CLIENT_ID=wendigo-dev
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_AUTHENTIK_URL=${VITE_AUTHENTIK_URL} \
    VITE_AUTHENTIK_CLIENT_ID=${VITE_AUTHENTIK_CLIENT_ID}

# Output : dist/. Invalide si src, config, deps ou ARG VITE_* changent.
RUN npm run build

# ── runner ────────────────────────────────────────────────────────────────────

FROM nginx:alpine AS runner

# Invalide si la config nginx change (sans rebuild npm).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Invalide quand dist/ du builder change.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
