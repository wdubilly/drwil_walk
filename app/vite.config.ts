import { readFileSync } from "node:fs";
import basicSsl from "@vitejs/plugin-basic-ssl";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

const BASIS_DIR = new URL("node_modules/three/examples/jsm/libs/basis/", import.meta.url);
const BASIS_FILES = { "basis_transcoder.js": "text/javascript", "basis_transcoder.wasm": "application/wasm" } as const;

/**
 * Le transcodeur KTX2 (JavaScript et WebAssembly de three.js, ~0,5 Mo) est servi avec la page, sous `/basis/`, en
 * développement comme dans le build : le casque n'appelle aucun autre serveur pendant la marche (APP-012).
 */
export const basisTranscoder = (): Plugin => ({
  name: "drwil-transcodeur-ktx2",
  configureServer(server) {
    server.middlewares.use("/basis/", (req, res, next) => {
      const name = (req.url ?? "").slice(1) as keyof typeof BASIS_FILES;
      if (!Object.hasOwn(BASIS_FILES, name)) {
        next();
        return;
      }
      res.setHeader("Content-Type", BASIS_FILES[name]);
      res.end(readFileSync(new URL(name, BASIS_DIR)));
    });
  },
  generateBundle() {
    for (const name of Object.keys(BASIS_FILES)) this.emitFile({ type: "asset", fileName: `basis/${name}`, source: readFileSync(new URL(name, BASIS_DIR)) });
  },
});

export default defineConfig({
  // WebXR n'est servi qu'en contexte sécurisé : HTTPS (certificat auto-signé) et écoute sur le
  // réseau local, pour ouvrir la page depuis le navigateur du Quest 3.
  plugins: [basicSsl(), basisTranscoder()],
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
