{
  description = "JS development environment";
  inputs.nixpkgs.url = "nixpkgs";
  outputs =
    { self, ... }@inputs:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        inputs.nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            inherit system;
            pkgs = import inputs.nixpkgs { inherit system; };
          }
        );
    in
    {
      devShells = forEachSupportedSystem (
        { pkgs, system }:
        {
          default = pkgs.mkShellNoCC {
            name = "js";
            packages = with pkgs; [
              nodejs
              typescript-language-server
            ];
            shellHook = ''
              [ -x /bin/zsh ] && { export SHELL=/bin/zsh; exec zsh; }
            '';
          };
        }
      );
      formatter = forEachSupportedSystem ({ pkgs, ... }: pkgs.nixfmt);
    };
}
