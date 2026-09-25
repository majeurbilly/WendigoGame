{
  description = "WendigoGame reproducible dev environment (Go + React + Pulumi + k3s tooling)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        # Outils locaux uniquement. Runtime = k3s ; déploiement = GitHub Actions (ci-cd.yml).
        # Frontend engines: Node >= 22.19 ; backend go.mod: Go 1.25.
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            go
            nodejs_22
            pnpm
            typescript
            docker
            go-task
            gnumake
            kubectl
            kubernetesustomize
            skopeo
            curl
            jq
            wget
            bind.dnsutils
            pulumi
            pulumiPackages.pulumi-nodejs
          ];

          shellHook = ''
            export PULUMI_CONFIG_PASSPHRASE="''${PULUMI_CONFIG_PASSPHRASE:-}"

            _repo="$(pwd)"
            if [ -f "$_repo/package.json" ] && [ -d "$_repo/sdks" ] && [ ! -d "$_repo/deploy/k8s" ]; then
              _repo="$(cd "$_repo/.." && pwd)"
            fi
            _infra="$_repo/infrastructure"
            _pulumi_state="''${PULUMI_STATE_DIR:-$HOME/.pulumi-wendigo}"
            mkdir -p "$_pulumi_state"
            export PULUMI_BACKEND_URL="file://$_pulumi_state"

            if [ -d "$_infra" ] && [ ! -d "$_infra/node_modules" ]; then
              echo "Installing infrastructure npm dependencies..."
              (cd "$_infra" && pnpm install --ignore-scripts 2>/dev/null || npm install --silent)
            fi

            _sdk="$_infra/sdks/authentik"
            if [ -d "$_sdk" ] && [ ! -f "$_sdk/bin/package.json" ]; then
              echo "Building Authentik SDK..."
              (cd "$_sdk" && { [ -d node_modules ] || npm install --ignore-scripts; } && node scripts/postinstall.js)
            fi
            _ak_bin=$(find "$_infra/node_modules" -path '*/@pulumi/authentik/bin' -type d 2>/dev/null | head -1)
            if [ -n "$_ak_bin" ] && [ ! -f "$_ak_bin/package.json" ] && [ -d "$_sdk/bin" ]; then
              mkdir -p "$_ak_bin"
              cp -a "$_sdk/bin/." "$_ak_bin/"
            fi

            echo "WendigoGame shell — Node $(node -v), Go $(go env GOVERSION) — runtime = k3s (push CI/CD)"
          '';
        };
      }
    );
}
