import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // WebXR n'est servi qu'en contexte sécurisé : HTTPS (certificat auto-signé) et écoute sur le
  // réseau local, pour ouvrir la page depuis le navigateur du Quest 3.
  plugins: [basicSsl()],
  server: { host: true },
  preview: { host: true },
  // Le build sort hors de la couche (dist/ de la racine, ignoré par Git) : c8 mesure avec --all
  // tout ce qui est sous app/, et un bundle généré y compterait comme du code non couvert.
  build: { outDir: "../dist/app", emptyOutDir: true },
  test: {
    // La couverture est mesurée par c8 autour de `npm test` (décision du demandeur, fiche
    // couverture-app). c8 lit la couverture V8 que Node écrit à la sortie de chaque processus :
    // - les tests tournent en threads, que Node termine proprement (un fork tué par signal
    //   n'écrit rien, et la couverture tomberait à 0 %) ;
    // - le code est importé par Node lui-même (retrait natif des types), sans la transformation
    //   de Vite : les positions mesurées restent celles du fichier .ts, ligne pour ligne.
    pool: "threads",
    experimental: { viteModuleRunner: false, nodeLoader: false },
    include: ["src/**/*.test.ts", "*.test.ts"],
  },
});
