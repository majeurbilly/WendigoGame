{
  description = "WendiGame development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" ] (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            go
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
            echo "Go version:   $(go version)"
            echo "Node version: $(node --version)"
            echo
          '';
        };
      });
}