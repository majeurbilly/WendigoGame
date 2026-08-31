{
  description = "WendigoGame reproducible dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            go
            nodejs_20
            pnpm
            typescript
            docker
            docker-compose
            go-task
            gnumake
            skopeo
            curl
            jq
            wget
            bind.dnsutils
            prometheus
            pulumi
            pulumiPackages.pulumi-nodejs
          ];

          shellHook = ''
            export PULUMI_CONFIG_PASSPHRASE="''${PULUMI_CONFIG_PASSPHRASE:-}"

            # Important: in flake-based shells, `toString ./.` resolves to a /nix/store path (read-only).
            # Compute paths at runtime from the user's current checkout instead.
            _repo="$(pwd)"
            if [ -f "$_repo/package.json" ] && [ -d "$_repo/sdks" ] && [ ! -f "$_repo/docker-compose.yml" ]; then
              _repo="$(cd "$_repo/.." && pwd)"
            fi
            _infra="$_repo/infrastructure"
            export PULUMI_BACKEND_URL="file://$_infra"

            if [ ! -d "$_infra/node_modules" ]; then
              echo "Installing infrastructure npm dependencies..."
              (cd "$_infra" && pnpm install --ignore-scripts 2>/dev/null || npm install --silent)
            fi

            _sdk="$_infra/sdks/authentik"
            if [ ! -f "$_sdk/bin/package.json" ]; then
              echo "Building Authentik SDK..."
              (cd "$_sdk" && { [ -d node_modules ] || npm install --ignore-scripts; } && node scripts/postinstall.js)
            fi
            _ak_bin=$(find "$_infra/node_modules" -path '*/@pulumi/authentik/bin' -type d 2>/dev/null | head -1)
            if [ -n "$_ak_bin" ] && [ ! -f "$_ak_bin/package.json" ] && [ -d "$_sdk/bin" ]; then
              mkdir -p "$_ak_bin"
              cp -a "$_sdk/bin/." "$_ak_bin/"
            fi

            if [ ! -f "$_infra/.pulumi/stacks/wendigo-authentik/dev.json" ]; then
              echo "Initializing Pulumi dev stack..."
              (cd "$_infra" && pulumi stack init dev --non-interactive 2>/dev/null)
            fi

            _ak_url=$(cd "$_infra" && pulumi config get authentik:url 2>/dev/null || echo "http://localhost:9000")
            _ak_token=$(cd "$_infra" && pulumi config get authentik:token 2>/dev/null || echo "")

            _token_ok=false
            if [ -n "$_ak_token" ]; then
              _code=$(curl -sf -o /dev/null -w "%{http_code}" \
                -H "Authorization: Bearer $_ak_token" \
                "$_ak_url/api/v3/core/users/me/" 2>/dev/null)
              [ "$_code" = "200" ] && _token_ok=true
            fi

            if [ "$_token_ok" = "false" ]; then
              echo "Authentik token missing or invalid — starting services..."

              _bootstrap_pw=$(cd "$_infra" && pulumi config get wendigo:authentikBootstrapPassword 2>/dev/null || echo "")
              AUTHENTIK_BOOTSTRAP_PASSWORD="$_bootstrap_pw" \
                docker compose -f "$_repo/docker-compose.yml" up -d \
                  authentik-postgresql authentik-redis authentik-server authentik-worker \
                  >/dev/null 2>&1

              echo "Waiting for Authentik to be ready..."
              _tries=0
              until curl -sf -o /dev/null "$_ak_url/-/health/live/" 2>/dev/null; do
                _tries=$((_tries + 1))
                if [ "$_tries" -ge 60 ]; then
                  echo "Authentik did not become ready in time — token not set."
                  break
                fi
                sleep 2
              done

              if curl -sf -o /dev/null "$_ak_url/-/health/live/" 2>/dev/null; then
                _new_token=$(docker compose -f "$_repo/docker-compose.yml" exec -T authentik-worker \
                  ak shell -c "
from authentik.core.models import Token, TokenIntents, User
admin = User.objects.get(username='akadmin')
t, _ = Token.objects.get_or_create(
    identifier='pulumi-deploy',
    defaults=dict(user=admin, intent=TokenIntents.INTENT_API),
)
print('TOKEN:', t.key)
" 2>/dev/null | grep "^TOKEN:" | cut -d' ' -f2)

                if [ -n "$_new_token" ]; then
                  (cd "$_infra" && pulumi config set --secret authentik:token "$_new_token" 2>/dev/null)
                  echo "Authentik API token set."
                else
                  echo "Could not retrieve token — run: docker compose exec authentik-worker ak shell"
                fi
              fi
            fi
          '';
        };
      });
}
