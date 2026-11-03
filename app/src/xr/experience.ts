// Assemblage de l'expérience : accueil → session immersive-ar → marche sur l'itinéraire choisi.
// Le rendu three.js est injecté (classe du renderer) : les tests le remplacent par une doublure.
import type { WebGLRenderer } from "three";
import { createAttributionLabel } from "../city/attribution.ts";
import { createTripPlanner } from "../city/free-route.ts";
import type { TreePack } from "../city/tree-pack.ts";
import { createSouqScene, setCityOpacity } from "../city/souq.ts";
import { startAmbience } from "./ambience.ts";
import type { Souq } from "../city/souq-data.ts";
import type { Providers } from "../route/providers.ts";
import { DEFAULT_WEIGHT_KG, type WeightStorage } from "../route/stats.ts";
import { ARRIVAL_TEXT } from "../route/walk.ts";
import { enterPc } from "../pc/enter-pc.ts";
import { chosenCity } from "./city-choice.ts";
import { placeOf, walkDashboard } from "./dashboard.ts";
import { createJunctions } from "./junctions.ts";
import { createZoneControl } from "./zone-control.ts";
import { detectProfile } from "../render/capabilities.ts";
import { sceneOptionsOf, settingsOf } from "../render/profiles.ts";
import { createVignette } from "./vignette.ts";
import { headPitchDownDeg } from "../safety/visibility.ts";
import { renderHome, type HomeView } from "../ui/home.ts";
import { chooseRendering, type GoogleConfig } from "./google-mode.ts";
import { renderWalkPanel } from "../ui/panel.ts";
import { initialWalkState, nextWalkState } from "./frame.ts";
import { rightButtons } from "./buttons.ts";
import { createDiagnosticsUi } from "./diagnostics-report.ts";
import { createHudPanel } from "./hud-panel.ts";
import { createMinimap } from "./minimap.ts";
import { rightThumbstickY } from "./joystick.ts";
import { NO_CALIBRATION, calibrationFrom, type HeadPose } from "./pose.ts";
import { preloadTrees, withTreeNotice, type TreeLoad } from "./trees-load.ts";
import { REFERENCE_SPACE, SESSION_MODE, requestMixedRealitySession, type XrSystemLike } from "./session.ts";

export type RendererLike = Pick<WebGLRenderer, "xr" | "setAnimationLoop" | "render" | "domElement" | "dispose" | "localClippingEnabled" | "setSize" | "setPixelRatio" | "info">;
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
  /** Le `localStorage` où la zone tapis et le poids sont gardés (absent : la boîte par défaut et la valeur moyenne, rien de gardé). */
  storage?: WeightStorage | undefined;
  /** L'horloge du tableau de bord (absente : l'heure du casque) ; injectée pour que les tests fixent l'heure. */
  now?: (() => Date) | undefined;
  /** Le chargement des arbres du pack Quaternius (absent : l'arbre procédural, sans message). */
  trees?: (() => Promise<TreePack>) | undefined;
}

export const ACTIVE_STATUS = `Réalité mixte active (${SESSION_MODE})`;
export const ENDED_STATUS = "Session terminée : vous pouvez y revenir.";

/** Monte l'accueil ; le bouton ouvre la session et lance la marche. */
export function startExperience(deps: ExperienceDeps): HomeView {
  const planner = createTripPlanner(deps.routes);
  const home = renderHome(deps.document, deps.root, planner, deps.storage);
  void detectProfile({ xr: deps.xr, document: deps.document }).then((profile) => { home.proposeProfile(profile); });
  const trees = preloadTrees(deps.trees);
  home.onEnter(() => { void enter(deps, home, trees); });
  home.onEnterPc(() => { void enterPc(deps, home, trees); });
  return home;
}

async function enter(deps: ExperienceDeps, home: HomeView, trees: Promise<TreeLoad>): Promise<void> {
  home.setEntering(true);
  home.showStatus("Ouverture de la réalité mixte…");
  try {
    // La ville d'abord : sans elle, aucune session n'est ouverte pour rien.
    const souq = chosenCity(home);
    const session = await requestMixedRealitySession(deps.xr);
    await walk(deps, home, session, souq, await trees);
  } catch (error) {
    // L'échec se lit sur la page (QUA-002) et le bouton redevient utilisable.
    home.setEntering(false);
    home.showStatus(error instanceof Error ? error.message : String(error));
  }
}

async function walk(deps: ExperienceDeps, home: HomeView, session: XRSession, souq: Souq, trees: TreeLoad): Promise<void> {
  // La scène d'abord : si elle ne se construit pas, aucun renderer ni canevas n'est laissé derrière.
  const settings = settingsOf(home.readProfile());
  const souqScene = createSouqScene(deps.document, souq, { ...sceneOptionsOf(settings), ...(trees.pack && { trees: trees.pack }), materials: home.readMaterials() });
  const { scene, camera, world, city, buildingCount } = souqScene;
  // Le message d'arrivée d'un trajet libre, dans le casque : il s'efface avec la ville (APP-001).
  const arrival = createAttributionLabel(deps.document, ARRIVAL_TEXT, { name: "arrivee", y: 1.4 });
  arrival.mesh.visible = false;
  world.add(arrival.mesh);
  home.showNotice(trees.notice);
  const mode = chooseRendering({
    wanted: home.readRendering(),
    config: deps.google,
    souq,
    scene: souqScene,
    notice: withTreeNotice(trees, home.showNotice),
  });
  const renderer = new deps.Renderer({ antialias: true, alpha: true });
  renderer.xr.enabled = true;
  renderer.xr.setFramebufferScaleFactor(settings.xrScale);
  // Nécessaire à la découpe de la zone tapis, portée par les matériaux (APP-001).
  renderer.localClippingEnabled = true;
  renderer.xr.setReferenceSpaceType(REFERENCE_SPACE);
  deps.root.append(renderer.domElement);
  const now = deps.now ?? (() => new Date());
  const diagnostics = createDiagnosticsUi({ doc: deps.document, target: "casque", city: placeOf(home.readRouteId()), now, renderer, scene });
  const panel = renderWalkPanel(deps.document, deps.root, false, diagnostics.element);
  // Le panneau d'infos et la minicarte du casque : dans la scène, hors de `world`, mais soumis au même fondu (APP-001).
  const hud = createHudPanel(deps.document);
  const minimap = createMinimap(deps.document, souq.route.points);
  scene.add(hud.mesh, minimap.mesh);
  // La zone tapis (découpe) et la vignette réelle (bords de l'image) : elles ne font que retirer du rendu (APP-001).
  // L'ambiance (APP-011) : lumière de l'heure réelle, brouillard plafonné au casque et éteint par défaut, sons coupés par défaut.
  const ambience = startAmbience({ scene, target: "casque", fog: settings.fog && home.readFog(), soundPct: home.readSoundPct(), now, window: deps.document.defaultView });
  deps.root.dataset["ambiance"] = ambience.summary;
  const zone = createZoneControl(deps.storage);
  const vignette = createVignette();
  const vignetteOn = home.readVignette();
  scene.add(vignette);
  const junctions = createJunctions(city, souq);
  const place = placeOf(home.readRouteId());
  // Le poids saisi à l'accueil, sinon la valeur moyenne : l'estimation de calories n'en demande jamais plus.
  const weightKg = home.readWeightKg() ?? DEFAULT_WEIGHT_KG;
  const panelSide = home.readPanelSide();
  let calibration = NO_CALIBRATION;
  const globalOpacityPct = home.readOpacityPct();
  let state = initialWalkState(home.readSpeedKmh(), globalOpacityPct);
  // La boucle est posée avant la session : three.js arrête alors sa boucle de page au démarrage
  // de la session, sinon les deux tourneraient ensemble.
  renderer.setAnimationLoop((timeMs: number, frame?: XRFrame) => {
    // Une image hors session (boucle de la page) n'a pas de pose : rien à marcher ni à rendre.
    if (!frame) return;
    const space = renderer.xr.getReferenceSpace();
    const pose = space ? frame.getViewerPose(space) : undefined;
    const head: HeadPose | undefined = pose?.transform;
    state = nextWalkState(state, {
      timeMs,
      axisY: rightThumbstickY(session.inputSources),
      buttons: rightButtons(session.inputSources),
      pitchDownDeg: pose ? headPitchDownDeg(pose.transform.orientation) : null,
      globalOpacityPct,
      weightKg,
      // Un trajet libre s'arrête à l'arrivée ; une boucle reprend au départ (APP-002).
      endM: souq.route.loop ? undefined : souq.route.lengthM,
    });
    // Bouton A : le parcours repart d'où l'on est, dans le sens où l'on regarde ; la distance ne bouge pas (APP-002).
    if (state.recalibrate && head) calibration = calibrationFrom(head);
    world.position.set(calibration.x, 0, calibration.z);
    world.rotation.y = calibration.yawRad;
    arrival.mesh.visible = state.arrived;
    // La ville suit le tracé d'origine, ou le réseau de voies une fois une autre rue choisie à un carrefour (APP-002).
    const walking = junctions.update({ distanceM: state.distanceM, frame, space, sources: session.inputSources, visible: state.cityOpacity > 0 });
    if (zone.update(timeMs, session.inputSources, head)) {
      home.showNotice("La zone tapis n'a pas pu être enregistrée : elle reste réglée pour cette séance.");
    }
    vignette.visible = vignetteOn;
    setCityOpacity(world, state.cityOpacity, zone.clip.planes);
    mode.update(camera, renderer.xr.getCamera());
    // L'heure est celle du casque.
    const dashboard = walkDashboard(souq.route, state, { place, weightKg, now, heading: walking.heading });
    const view = { show: state.showPanel, opacity: state.cityOpacity, pose: head, side: panelSide, zone: zone.zone() };
    hud.update({ ...state, ...dashboard, diagnostics: diagnostics.update(timeMs, session.inputSources) }, view);
    // La case du point, lue par l'e2e : la minicarte est dans la scène, pas dans la page.
    deps.root.dataset["minimap"] = minimap.update(walking.at, view);
    panel.update({
      ...state, ...dashboard, calibration, position: walking.at, buildingCount, zone: zone.zone(), vignette: vignetteOn,
      junction: { distanceM: walking.crossingM, choices: walking.choices, offRoute: walking.offRoute },
      rendering: mode.rendering(), tileCount: mode.tileCount(), attribution: mode.attribution(),
    });
    renderer.render(scene, camera);
  });
  const stop = () => {
    ambience.stop();
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
