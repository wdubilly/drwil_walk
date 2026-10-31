// Assemblage de l'expérience : accueil → session immersive-ar → marche sur l'itinéraire choisi.
// Le rendu three.js est injecté (classe du renderer) : les tests le remplacent par une doublure.
import type { WebGLRenderer } from "three";
import { createAttributionLabel } from "../city/attribution.ts";
import { cityFor } from "../city/cities.ts";
import { createTripPlanner } from "../city/free-route.ts";
import { createSouqScene, placeOnRoute, setCityOpacity } from "../city/souq.ts";
import type { Souq } from "../city/souq-data.ts";
import { FREE_ITINERARY_ID } from "../route/itineraries.ts";
import { pointAt } from "../route/path.ts";
import type { Providers } from "../route/providers.ts";
import { ARRIVAL_TEXT } from "../route/walk.ts";
import { headPitchDownDeg } from "../safety/visibility.ts";
import { renderHome, type HomeView } from "../ui/home.ts";
import { chooseRendering, type GoogleConfig } from "./google-mode.ts";
import { renderWalkPanel } from "../ui/panel.ts";
import { initialWalkState, nextWalkState } from "./frame.ts";
import { rightThumbstickY } from "./joystick.ts";
import { REFERENCE_SPACE, SESSION_MODE, requestMixedRealitySession, type XrSystemLike } from "./session.ts";

export type RendererLike = Pick<WebGLRenderer, "xr" | "setAnimationLoop" | "render" | "domElement" | "dispose">;
export type RendererClass = new (parameters: { antialias: boolean; alpha: boolean }) => RendererLike;

export interface ExperienceDeps {
  document: Document;
  root: HTMLElement;
  xr: XrSystemLike | undefined;
  Renderer: RendererClass;
  /** La clé Google et la fabrique de tuiles (injectée : les tests ne rappellent jamais Google). */
  google: GoogleConfig;
  /** Les services de routage, d'adresses et le réseau de l'itinéraire libre (injectés : les tests n'appellent jamais un service réel). */
  routes: Providers;
}

export const ACTIVE_STATUS = `Réalité mixte active (${SESSION_MODE})`;
export const ENDED_STATUS = "Session terminée : vous pouvez y revenir.";

/** Monte l'accueil ; le bouton ouvre la session et lance la marche. */
export function startExperience(deps: ExperienceDeps): HomeView {
  const planner = createTripPlanner(deps.routes);
  const home = renderHome(deps.document, deps.root, planner);
  home.onEnter(() => {
    void enter(deps, home);
  });
  return home;
}

/** La ville de l'itinéraire choisi ; un trajet libre non préparé est une erreur dite, pas une marche dans le vide (QUA-002). */
function chosenCity(home: HomeView): Souq {
  const id = home.readRouteId();
  if (id !== FREE_ITINERARY_ID) return cityFor(id);
  const trip = home.readTrip();
  if (!trip) throw new Error("Itinéraire libre : posez un départ et une arrivée, puis calculez le trajet.");
  return trip.souq;
}

async function enter(deps: ExperienceDeps, home: HomeView): Promise<void> {
  home.setEntering(true);
  home.showStatus("Ouverture de la réalité mixte…");
  try {
    // La ville d'abord : sans elle, aucune session n'est ouverte pour rien.
    const souq = chosenCity(home);
    const session = await requestMixedRealitySession(deps.xr);
    await walk(deps, home, session, souq);
  } catch (error) {
    // L'échec se lit sur la page (QUA-002) et le bouton redevient utilisable.
    home.setEntering(false);
    home.showStatus(error instanceof Error ? error.message : String(error));
  }
}

async function walk(deps: ExperienceDeps, home: HomeView, session: XRSession, souq: Souq): Promise<void> {
  // La scène d'abord : si elle ne se construit pas, aucun renderer ni canevas n'est laissé derrière.
  const souqScene = createSouqScene(deps.document, souq);
  const { scene, camera, world, city, buildingCount } = souqScene;
  // Le message d'arrivée d'un trajet libre, dans le casque : il s'efface avec la ville (APP-001).
  const arrival = createAttributionLabel(deps.document, ARRIVAL_TEXT, { name: "arrivee", y: 1.4 });
  arrival.mesh.visible = false;
  world.add(arrival.mesh);
  home.showNotice("");
  const mode = chooseRendering({
    wanted: home.readRendering(),
    config: deps.google,
    souq,
    scene: souqScene,
    notice: home.showNotice,
  });
  const renderer = new deps.Renderer({ antialias: true, alpha: true });
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType(REFERENCE_SPACE);
  deps.root.append(renderer.domElement);
  const panel = renderWalkPanel(deps.document, deps.root);
  const globalOpacityPct = home.readOpacityPct();
  let state = initialWalkState(home.readSpeedKmh(), globalOpacityPct);
  // La boucle est posée avant la session : three.js arrête alors sa boucle de page au démarrage
  // de la session, sinon les deux tourneraient ensemble.
  renderer.setAnimationLoop((timeMs: number, frame?: XRFrame) => {
    // Une image hors session (boucle de la page) n'a pas de pose : rien à marcher ni à rendre.
    if (!frame) return;
    const space = renderer.xr.getReferenceSpace();
    const pose = space ? frame.getViewerPose(space) : undefined;
    state = nextWalkState(state, {
      timeMs,
      axisY: rightThumbstickY(session.inputSources),
      pitchDownDeg: pose ? headPitchDownDeg(pose.transform.orientation) : null,
      globalOpacityPct,
      // Un trajet libre s'arrête à l'arrivée ; une boucle reprend au départ (APP-002).
      endM: souq.route.loop ? undefined : souq.route.lengthM,
    });
    arrival.mesh.visible = state.arrived;
    placeOnRoute(city, souq.route, state.distanceM);
    setCityOpacity(world, state.cityOpacity);
    mode.update(camera, renderer.xr.getCamera());
    panel.update({
      ...state,
      position: pointAt(souq.route, state.distanceM),
      buildingCount,
      rendering: mode.rendering(),
      tileCount: mode.tileCount(),
      attribution: mode.attribution(),
    });
    renderer.render(scene, camera);
  });
  const stop = () => {
    renderer.setAnimationLoop(null);
    renderer.domElement.remove();
    renderer.dispose();
    panel.remove();
    mode.dispose();
  };
  try {
    await renderer.xr.setSession(session);
  } catch (error) {
    // Rien ne doit rester de la marche (boucle, canevas) si la session ne démarre pas.
    stop();
    throw error;
  }
  home.showStatus(ACTIVE_STATUS);
  session.addEventListener("end", () => {
    stop();
    home.setEntering(false);
    home.showStatus(ENDED_STATUS);
  });
}
