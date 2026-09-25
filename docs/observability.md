# Observabilité

## État actuel

**Loki, Grafana, Promtail et Prometheus ont été retirés** du dépôt (saturation RAM / OOM sur le nœud k3s homelab).

- Plus de manifests `deploy/prometheus/`
- Plus de assets / ressources Pulumi `infrastructure/assets/prometheus/` ni `PrometheusConfigResource`
- L’endpoint backend Go `/metrics` (`promhttp`) peut rester exposé pour un scrape externe futur ; aucun scraper n’est provisionné dans ce dépôt

## Impacts

| Composant | Impact |
|-----------|--------|
| `deploy/grafana/`, `deploy/promtail/`, `deploy/prometheus/` | Supprimés |
| Pulumi `prometheusUrl` / `prometheusConfigPath` / `PrometheusConfigResource` | Retiré de `config.ts`, `deploy.ts`, `index.full.ts` |
| `flake.nix` | Paquet `prometheus` retiré du `devShell` |
| Runtime k3s | Aucun manifeste d’observabilité dans `deploy/k8s/` — pods résiduels à supprimer manuellement si présents |
