import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, Vector3 } from "three";
import type { PreferenceStore } from "../ui/preferences.ts";
import { cyclePreference, PREFERENCE_ROWS, rowText, type PreferenceRow } from "../ui/walk-preferences.ts";
import type { Zone } from "../safety/zone.ts";
import { PANEL_HEIGHT_M, PANEL_WIDTH_M, panelPlacement, type HeadPose } from "./pose.ts";

const WIDTH = 640;
const HEIGHT = 320;
const FIRST_ROW = 56;
const ROW_HEIGHT = 30;

export function createPreferencePanel(doc: Document, store: PreferenceStore): {
  mesh: Mesh;
  update(frame: XRFrame, space: XRReferenceSpace | null, sources: XRInputSourceArray | readonly XRInputSource[], head: HeadPose | undefined, opacity: number, zone: Zone): boolean;
  dispose(): void;
} {
  const canvas = doc.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D indisponible : préférences non affichables.");
  const texture = new CanvasTexture(canvas);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  const mesh = new Mesh(new PlaneGeometry(PANEL_WIDTH_M, PANEL_HEIGHT_M), material);
  mesh.name = "preferences-marche";
  mesh.visible = false;
  let open = false;
  let heldOpen = false;
  let heldSelect = false;
  let lastDraw = "";
  return {
    mesh,
    update: (frame, space, sources, head, opacity, zone) => {
      const left = Array.from(sources).find((s) => s.handedness === "left");
      const right = Array.from(sources).find((s) => s.handedness === "right");
      const toggle = left?.gamepad?.buttons[0]?.pressed === true;
      const select = right?.gamepad?.buttons[1]?.pressed === true;
      if (toggle && !heldOpen) open = !open;
      heldOpen = toggle;
      const prefs = store.read();
      const at = head && panelPlacement(head, prefs.side, zone);
      mesh.visible = open && opacity > 0 && at !== undefined;
      material.opacity = opacity;
      let pointed = -1;
      if (at) {
        mesh.position.set(at.x, at.y, at.z);
        mesh.rotation.y = at.yawRad;
        mesh.scale.setScalar(at.scale);
        mesh.updateMatrixWorld(true);
        const pose = space && right && frame.getPose(right.targetRaySpace, space);
        if (pose && mesh.visible) {
          const origin = mesh.worldToLocal(new Vector3(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z));
          const direction = new Vector3(0, 0, -1).applyQuaternion(new Quaternion().copy(pose.transform.orientation));
          direction.transformDirection(mesh.matrixWorld.clone().invert());
          const t = -origin.z / direction.z;
          const hit = origin.clone().addScaledVector(direction, t);
          if (t >= 0 && Math.abs(hit.x) <= PANEL_WIDTH_M / 2 && Math.abs(hit.y) <= PANEL_HEIGHT_M / 2) {
            const y = (0.5 - hit.y / PANEL_HEIGHT_M) * HEIGHT;
            const row = Math.floor((y - FIRST_ROW) / ROW_HEIGHT);
            if (row >= 0 && row < PREFERENCE_ROWS.length) pointed = row;
          }
        }
      }
      if (pointed >= 0 && select && !heldSelect) cyclePreference(store, PREFERENCE_ROWS[pointed] as PreferenceRow);
      heldSelect = select;
      const texts = PREFERENCE_ROWS.map((row) => rowText(row, store.read()));
      const key = `${String(pointed)}\n${texts.join("\n")}`;
      if (key !== lastDraw) {
        lastDraw = key;
        context.globalCompositeOperation = "copy";
        context.fillStyle = "rgba(16,20,28,0.7)";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        context.globalCompositeOperation = "source-over";
        context.fillStyle = "#f2f5fa";
        context.font = "20px sans-serif";
        context.textAlign = "left";
        context.textBaseline = "middle";
        context.fillText("Préférences · gâchette gauche : fermer", 16, 20, WIDTH - 32);
        context.font = "18px sans-serif";
        texts.forEach((text, row) => {
          context.fillStyle = row === pointed ? "#63e6be" : "#f2f5fa";
          context.fillText(`${row === pointed ? "› " : ""}${text}`, 16, FIRST_ROW + row * ROW_HEIGHT + ROW_HEIGHT / 2, WIDTH - 32);
        });
        texture.needsUpdate = true;
      }
      return open;
    },
    dispose: () => { mesh.removeFromParent(); mesh.geometry.dispose(); material.dispose(); texture.dispose(); },
  };
}
