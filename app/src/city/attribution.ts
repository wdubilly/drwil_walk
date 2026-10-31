// La mention OpenStreetMap dans le casque (APP-003) : un panneau dans la scène, car la page n'est pas
// visible en réalité mixte. Elle s'efface avec la ville (APP-001) : sans ville, il n'y a plus de données à créditer.
import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import { OSM_ATTRIBUTION } from "./licence.ts";

const WIDTH_PX = 512;
const HEIGHT_PX = 64;

/** Panneau posé devant l'utilisateur, un peu sous l'horizon, hors de la zone du tapis. */
export function createAttributionLabel(doc: Document): Mesh {
  const canvas = doc.createElement("canvas");
  canvas.width = WIDTH_PX;
  canvas.height = HEIGHT_PX;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D indisponible : la mention OpenStreetMap ne peut pas être dessinée.");
  context.fillStyle = "#10141c";
  context.fillRect(0, 0, WIDTH_PX, HEIGHT_PX);
  context.fillStyle = "#f2f5fa";
  context.font = "32px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(OSM_ATTRIBUTION, WIDTH_PX / 2, HEIGHT_PX / 2);
  const label = new Mesh(new PlaneGeometry(1.2, 0.15), new MeshBasicMaterial({ map: new CanvasTexture(canvas) }));
  label.name = "attribution-osm";
  label.position.set(0, 1.0, -2.5);
  return label;
}
