# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_URL=http://localhost:8080
ARG VITE_LIVEKIT_URL=ws://localhost:7880
ARG VITE_AUTHENTIK_URL=
ARG VITE_AUTHENTIK_CLIENT_ID=
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_LIVEKIT_URL=${VITE_LIVEKIT_URL}
ENV VITE_AUTHENTIK_URL=${VITE_AUTHENTIK_URL}
ENV VITE_AUTHENTIK_CLIENT_ID=${VITE_AUTHENTIK_CLIENT_ID}

RUN pnpm build

FROM nginx:alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
