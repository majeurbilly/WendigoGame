# Observabilité

## État actuel

**Loki, Grafana et Promtail ont été retirés** du dépôt (saturation RAM / OOM kernel panics sur le nœud k3s homelab).

Conservé éventuellement :

- `deploy/prometheus/prometheus.yml` + `infrastructure/assets/prometheus/` — scrape Prometheus (métriques backend `/metrics`), hors stack Loki/Grafana.

## Impacts

| Composant | Impact |
|-----------|--------|
| `deploy/grafana/` | Supprimé |
| `deploy/promtail/` | Supprimé (push vers Loki inutile) |
| Pulumi `grafana:*` / `lokiUrl` | Retiré de `config.ts`, `docker-env.ts`, `Pulumi.dev.yaml` |
| Runtime k3s | Aucun manifeste Loki/Grafana dans `deploy/k8s/` — si des pods existent encore sur le cluster, les supprimer manuellement (`kubectl delete …`) |
