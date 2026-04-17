{
  description = "WendiGame development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
    in
    flake-utils.lib.eachSystem supportedSystems (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            go_1_22
            nodejs_20
            livekit-cli
            docker-compose
            gcc
          ];

          CGO_ENABLED = "1";

          shellHook = ''
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
