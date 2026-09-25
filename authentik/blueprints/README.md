# Blueprints Authentik — obsolètes

Le provisioning OIDC Wendigo est désormais **100 % Pulumi** :

- Module : `infrastructure/src/authentik/oidc-app.ts`
- Ressources : `authentik.ProviderOauth2` + `authentik.Application` (+ flows)
- Entrée : `infrastructure/index.ts` (après Helm Release)

L’ancien fichier `wendigo-oidc.yaml` a été **supprimé** (étape 6 migration Full K8s).
Ne plus monter de ConfigMap blueprint pour OIDC dans le chart Helm.
