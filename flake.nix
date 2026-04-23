{
  description = "WendiGame development environment";


  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nixpkgs-go124.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, nixpkgs-go124, flake-utils }:
    flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ] (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
        pkgsGo124 = import nixpkgs-go124 {
          inherit system;
          config.allowUnfree = true;
        };
        golangci-lint-pinned = pkgsGo124.buildGo124Module rec {
          pname = "golangci-lint";
          version = "1.64.5";
          src = pkgsGo124.fetchFromGitHub {
            owner = "golangci";
            repo = "golangci-lint";
            rev = "v${version}";
            hash = "sha256-PRI82Ia2R2GH9xV/UZvfXTmCrfsxvHfysXuAek/4a+0=";
          };
          vendorHash = "sha256-oCaVXjflmOMUDEDynbnUwA9KOPNDcEwI4WqOi2KoCG4=";
          subPackages = [ "cmd/golangci-lint" ];
          nativeBuildInputs = [ pkgsGo124.installShellFiles ];
          ldflags = [
            "-s"
            "-X main.version=${version}"
            "-X main.commit=v${version}"
            "-X main.date=19700101-00:00:00"
          ];
          postInstall = ''
            for shell in bash zsh fish; do
              HOME=$TMPDIR $out/bin/golangci-lint completion $shell > golangci-lint.$shell
              installShellCompletion golangci-lint.$shell
            done
          '';
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            pkgsGo124.go_1_24
            golangci-lint-pinned
            go-task
            nodejs_20
            livekit-cli
            docker-compose
            gcc
          ];

          CGO_ENABLED = "1";

          shellHook = ''
            export PS1="\[\033[1;32m\](WendiGame-Dev) \[\033[0m\]\u@\h:\w\$ "

            echo
            echo "=============================================="
            echo "   WendiGame Dev environment loaded"
            echo "=============================================="
            echo "Go version:          $(go version)"
            echo "golangci-lint:       $(golangci-lint version)"
            echo "Node version:        $(node --version)"
            echo
          '';
        };
      });
}
