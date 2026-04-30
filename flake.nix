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
        playwrightLinuxLibs = with pkgs; [
          glib
          nss
          nspr
          dbus
          atk
          cups
          libdrm
          gtk3
          pango
          cairo
          alsa-lib
          mesa
          xorg.libX11
          xorg.libXcomposite
          xorg.libXdamage
          xorg.libXext
          xorg.libXfixes
          xorg.libXrandr
          xorg.libxcb
          libxkbcommon
          xorg.libXi
          xorg.libXrender
          xorg.libXtst
          xorg.libXcursor
          xorg.libXinerama
        ];
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            go
            nodejs_20
            pnpm
            docker
            docker-compose
            go-task
            gnumake
          ];

          shellHook = ''
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath playwrightLinuxLibs}:''${LD_LIBRARY_PATH:-}"
          '';
        };
      });
}
