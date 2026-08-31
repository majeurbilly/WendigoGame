# syntax=docker/dockerfile:1

# ── builder ───────────────────────────────────────────────────────────────────
# Chaque instruction est ordonnée du moins au plus volatile pour le cache BuildKit.

FROM golang:1.25-alpine AS builder

WORKDIR /app

# Invalide uniquement quand les dépendances module changent (go.mod / go.sum).
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Invalide à chaque changement de code applicatif (hors tests via .dockerignore).
COPY cmd/ cmd/
COPY internal/ internal/

# Output : binaire backend. Invalide si deps (couche précédente) ou sources changent.
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o /out/backend ./cmd/server

# ── runner ────────────────────────────────────────────────────────────────────
# Image finale : ne contient pas le toolchain Go → surface d'attaque réduite.

FROM alpine:3.21 AS runner

# Invalide si la version Alpine ou la liste des paquets système change.
RUN addgroup -S app && adduser -S app -G app \
    && apk add --no-cache ca-certificates

WORKDIR /app

# Invalide quand le binaire builder change (lié au code Go, pas aux deps seules).
COPY --from=builder /out/backend /app/backend

EXPOSE 8080

USER app

CMD ["./backend"]
