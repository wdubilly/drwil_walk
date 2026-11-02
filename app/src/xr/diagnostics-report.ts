// Affichage du diagnostic de rendu sur la page et consignation de ses mesures dans un fichier JSON à comparer avant et après
// un changement. Rien n'est envoyé : le fichier est écrit par le navigateur (aucun appel réseau, aucune donnée personnelle, SEC-007).
import type { Object3D } from "three";
import pkg from "../../package.json" with { type: "json" };
import { createDiagnostics, diagnosticLine, diagnosticRows, type InfoSource, type Measures } from "./diagnostics.ts";

export type DiagnosticsTarget = "casque" | "pc";

export interface ReportMeta {
  target: DiagnosticsTarget;
  city: string;
  date: Date;
}

/** Le contenu du fichier : cible, ville, version, date, valeurs mesurées (une valeur illisible reste `null`) et leur fenêtre. */
export function buildReport(meta: ReportMeta, m: Measures) {
  return {
    schema: 1,
    target: meta.target,
    city: meta.city,
    version: pkg.version,
    date: meta.date.toISOString(),
    window: { frames: m.windowFrames },
    measures: {
      fps: m.fps,
      frameMeanMs: m.frameMeanMs,
      frameWorstMs: m.frameWorstMs,
      calls: m.calls,
      triangles: m.triangles,
      objects: m.objects,
      geometries: m.geometries,
      textures: m.textures,
    },
  };
}

/** Un nom triable par date, sans caractère interdit d'un nom de fichier. */
export const reportFileName = (meta: ReportMeta): string =>
  `mesures-rendu-${meta.target}-${meta.date.toISOString().replace(/[:.]/g, "-")}.json`;

/** Télécharge le rapport ; rend ce qui doit se lire à l'écran, succès comme échec (QUA-002). */
export function saveReport(doc: Document, meta: ReportMeta, m: Measures): string {
  const win = doc.defaultView as Window & typeof globalThis;
  const name = reportFileName(meta);
  try {
    const blob = new win.Blob([JSON.stringify(buildReport(meta, m), null, 2)], { type: "application/json" });
    const url = win.URL.createObjectURL(blob);
    const link = doc.createElement("a");
    link.href = url;
    link.download = name;
    doc.body.append(link);
    link.click();
    link.remove();
    win.URL.revokeObjectURL(url);
    return `Mesures enregistrées : ${name}`;
  } catch (error) {
    return `Les mesures n'ont pas pu être enregistrées (${error instanceof Error ? error.message : String(error)}) : la marche continue.`;
  }
}

export interface DiagnosticsUi {
  /** Le bloc à poser dans le panneau d'infos de la page. */
  element: HTMLElement;
  toggle(): void;
  /** À appeler à chaque image : compte l'image, met à jour le bloc, rend la ligne du casque (rien si masqué). */
  update(timeMs: number): string | undefined;
}

export interface DiagnosticsDeps {
  doc: Document;
  target: DiagnosticsTarget;
  city: string;
  now: () => Date;
  renderer: InfoSource;
  scene: Object3D;
}

export function createDiagnosticsUi({ doc, target, city, now, renderer, scene }: DiagnosticsDeps): DiagnosticsUi {
  const diagnostics = createDiagnostics();
  const element = doc.createElement("section");
  element.className = "diagnostics";
  element.setAttribute("aria-label", "Diagnostic de rendu");
  const toggleButton = doc.createElement("button");
  toggleButton.type = "button";
  toggleButton.textContent = "Diagnostic de rendu";
  const body = doc.createElement("div");
  body.hidden = true;
  const list = doc.createElement("dl");
  const save = doc.createElement("button");
  save.type = "button";
  save.textContent = "Enregistrer les mesures";
  const message = doc.createElement("p");
  message.setAttribute("aria-live", "polite");
  body.append(list, save);
  element.append(toggleButton, body, message);
  const values = new Map<string, HTMLElement>();
  const set = (el: HTMLElement, text: string): void => {
    if (el.textContent !== text) el.textContent = text;
  };
  toggleButton.addEventListener("click", () => {
    diagnostics.toggle();
  });
  save.addEventListener("click", () => {
    set(message, saveReport(doc, { target, city, date: now() }, diagnostics.sample(renderer, scene)));
  });
  return {
    element,
    toggle: () => {
      diagnostics.toggle();
    },
    update(timeMs) {
      diagnostics.tick(timeMs);
      const m = diagnostics.measure(renderer, scene);
      toggleButton.setAttribute("aria-pressed", String(m !== undefined));
      body.hidden = m === undefined;
      if (!m) return undefined;
      for (const row of diagnosticRows(m)) {
        let value = values.get(row.field);
        if (!value) {
          const term = doc.createElement("dt");
          term.textContent = row.label;
          value = doc.createElement("dd");
          value.dataset.field = row.field;
          list.append(term, value);
          values.set(row.field, value);
        }
        set(value, row.value);
      }
      return diagnosticLine(m);
    },
  };
}
