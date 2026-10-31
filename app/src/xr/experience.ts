// Assemblage de l'expérience : accueil → session immersive-ar → marche dans le souk.
// Le rendu three.js est injecté (classe du renderer) : les tests le remplacent par une doublure.
import type { WebGLRenderer } from "three";
import { createSouqScene, placeOnRoute, setCityOpacity } from "../city/souq.ts";
import { souqData } from "../city/souq-data.ts";
import { pointAt } from "../route/path.ts";
import { headPitchDownDeg } from "../safety/visibility.ts";
import { renderHome, type HomeView } from "../ui/home.ts";
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
}

export const ACTIVE_STATUS = `Réalité mixte active (${SESSION_MODE})`;
export const ENDED_STATUS = "Session terminée : vous pouvez y revenir.";

/** Monte l'accueil ; le bouton ouvre la session et lance la marche. */
export function startExperience(deps: ExperienceDeps): HomeView {
  const home = renderHome(deps.document, deps.root);
  home.onEnter(() => {
    void enter(deps, home);
  });
  return home;
}

async function enter(deps: ExperienceDeps, home: HomeView): Promise<void> {
  home.setEntering(true);
  home.showStatus("Ouverture de la réalité mixte…");
  try {
    const session = await requestMixedRealitySession(deps.xr);
    await walk(deps, home, session);
  } catch (error) {
    // L'échec se lit sur la page (QUA-002) et le bouton redevient utilisable.
    home.setEntering(false);
    home.showStatus(error instanceof Error ? error.message : String(error));
  }
}

async function walk(deps: ExperienceDeps, home: HomeView, session: XRSession): Promise<void> {
  // La scène d'abord : si elle ne se construit pas, aucun renderer ni canevas n'est laissé derrière.
  const souq = souqData();
  const { scene, camera, world, city, buildingCount } = createSouqScene(deps.document, souq);
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
    });
    placeOnRoute(city, souq.route, state.distanceM);
    setCityOpacity(world, state.cityOpacity);
    panel.update({ ...state, position: pointAt(souq.route, state.distanceM), buildingCount });
    renderer.render(scene, camera);
  });
  const stop = () => {
    renderer.setAnimationLoop(null);
    renderer.domElement.remove();
    renderer.dispose();
    panel.remove();
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
