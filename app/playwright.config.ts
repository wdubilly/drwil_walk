// e2e des chemins critiques (QUA-020) : Playwright sur Chromium, casque Quest 3 émulé par IWER
// (injecté par les tests eux-mêmes, jamais livré dans l'application).
import { defineConfig, devices } from "@playwright/test";

export const E2E_PORT = 5174;
const baseURL = `https://localhost:${String(E2E_PORT)}`;

export default defineConfig({
  testDir: "e2e",
  // Les e2e ne sont jamais des tests unitaires : Vitest ne lit que src/ et la racine.
  testMatch: "**/*.test.ts",
  forbidOnly: true,
  workers: 1,
  reporter: "list",
  // Traces et captures d'échec hors de la couche (dist/ de la racine, ignoré par Git), comme le build.
  outputDir: "../dist/e2e-results",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    // Le serveur de dev sert un certificat auto-signé (WebXR exige HTTPS).
    ignoreHTTPSErrors: true,
    // WebGL logiciel : la CI n'a pas de GPU, three.js a quand même besoin d'un contexte.
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
  webServer: {
    command: `npx vite --port ${String(E2E_PORT)} --strictPort`,
    url: baseURL,
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    // Une clé FICTIVE : le rendu Google est proposé aux e2e, qui servent eux-mêmes les tuiles (google-3d.test.ts) ; elle prime
    // sur toute vraie clé de .env.local, qui ne part donc jamais dans un test (SEC-007).
    // De même pour la clé Routes (itinéraire libre : routage et géocodage servis par itineraire-libre.test.ts).
    env: { VITE_GOOGLE_MAPS_API_KEY: "cle-factice-e2e", VITE_GOOGLE_ROUTES_API_KEY: "cle-routes-factice-e2e" },
    timeout: 60_000,
  },
});
