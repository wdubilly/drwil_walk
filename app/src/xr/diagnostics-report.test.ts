import { Window } from "happy-dom";
import { Scene } from "three";
import { describe, expect, it, vi } from "vitest";
import pkg from "../../package.json" with { type: "json" };
import { buildReport, createDiagnosticsUi, reportFileName, saveReport } from "./diagnostics-report.ts";
import type { Measures } from "./diagnostics.ts";

const meta = { target: "pc" as const, city: "Doha Souq Waqif", date: new Date("2026-11-02T10:05:07.123Z") };
const measures: Measures = { fps: 72, frameMeanMs: 13.9, frameWorstMs: 20, calls: 12, triangles: null, objects: 40, geometries: 7, textures: 3, windowFrames: 60 };

function setup() {
  const win = new Window();
  const doc = win.document as unknown as Document;
  const clicked: { href: string; download: string }[] = [];
  const created: Blob[] = [];
  const url = win.URL as unknown as { createObjectURL: (b: Blob) => string; revokeObjectURL: (u: string) => void };
  url.createObjectURL = (blob) => {
    created.push(blob);
    return "blob:test";
  };
  url.revokeObjectURL = vi.fn();
  doc.addEventListener("click", (event) => {
    const link = event.target as HTMLAnchorElement;
    if (link.download) {
      event.preventDefault();
      clicked.push({ href: link.href, download: link.download });
    }
  });
  return { win, doc, clicked, created, url };
}

describe("consignation des mesures", () => {
  it("APP-002: le fichier porte cible, ville, version, date, valeurs et fenêtre ; une valeur illisible reste nulle", () => {
    expect(buildReport(meta, measures)).toEqual({
      schema: 1, target: "pc", city: "Doha Souq Waqif", version: pkg.version, date: "2026-11-02T10:05:07.123Z", window: { frames: 60 },
      measures: { fps: 72, frameMeanMs: 13.9, frameWorstMs: 20, calls: 12, triangles: null, objects: 40, geometries: 7, textures: 3 },
    });
    expect(reportFileName(meta)).toBe("mesures-rendu-pc-2026-11-02T10-05-07-123Z.json");
  });

  it("APP-002: le téléchargement écrit un fichier JSON sans rien envoyer", async () => {
    const t = setup();
    const message = saveReport(t.doc, meta, measures);
    expect(message).toBe("Mesures enregistrées : mesures-rendu-pc-2026-11-02T10-05-07-123Z.json");
    expect(t.clicked).toEqual([{ href: "blob:test", download: "mesures-rendu-pc-2026-11-02T10-05-07-123Z.json" }]);
    expect(JSON.parse(await t.created[0]?.text() as string)).toMatchObject({ city: "Doha Souq Waqif", measures: { fps: 72 } });
    expect(t.doc.querySelector("a")).toBeNull();
  });

  it("QUA-002: un téléchargement impossible est dit, la marche continue", () => {
    const t = setup();
    t.url.createObjectURL = () => {
      throw new Error("refusé");
    };
    expect(saveReport(t.doc, meta, measures)).toBe("Les mesures n'ont pas pu être enregistrées (refusé) : la marche continue.");
    t.url.createObjectURL = () => {
      throw "texte" as unknown as Error;
    };
    expect(saveReport(t.doc, meta, measures)).toContain("(texte)");
  });
});

describe("bloc du diagnostic sur la page", () => {
  const ui = () => {
    const t = setup();
    const renderer = { info: { render: { calls: 5, triangles: 99 }, memory: { geometries: 1, textures: 2 } } };
    const u = createDiagnosticsUi({ doc: t.doc, target: "casque", city: "Pune FC Road", now: () => meta.date, renderer, scene: new Scene() });
    t.doc.body.append(u.element);
    const button = (name: string) => [...u.element.querySelectorAll("button")].find((b) => b.textContent === name) as HTMLButtonElement;
    return { ...t, u, button };
  };

  it("APP-002: masqué par défaut, le bouton l'affiche et le masque avec ses valeurs", () => {
    const { u, button } = ui();
    expect(u.update(0)).toBeUndefined();
    expect(u.element.querySelector("dd")).toBeNull();
    expect(button("Diagnostic de rendu").getAttribute("aria-pressed")).toBe("false");
    button("Diagnostic de rendu").click();
    expect(u.update(10)).toBe("100 i/s · 10,0 ms · 5 appels · 99 tri");
    expect(u.element.querySelector("[data-field='calls']")?.textContent).toBe("5");
    expect(u.element.querySelector("[data-field='fps']")?.textContent).toBe("100,0 i/s");
    expect(button("Diagnostic de rendu").getAttribute("aria-pressed")).toBe("true");
    expect(u.update(30)).toContain("67 i/s");
    expect(u.element.querySelectorAll("dd")).toHaveLength(8);
    u.toggle();
    expect(u.update(40)).toBeUndefined();
    expect(u.element.querySelector("div")?.hidden).toBe(true);
  });

  it("APP-002: « Enregistrer les mesures » télécharge le fichier et le dit ; l'échec aussi", async () => {
    const t = ui();
    t.u.update(0);
    t.u.update(20);
    t.button("Enregistrer les mesures").click();
    expect(t.u.element.querySelector("p")?.textContent).toBe("Mesures enregistrées : mesures-rendu-casque-2026-11-02T10-05-07-123Z.json");
    expect(JSON.parse(await t.created[0]?.text() as string)).toMatchObject({ target: "casque", city: "Pune FC Road", window: { frames: 1 }, measures: { fps: 50, calls: 5 } });
    t.url.createObjectURL = () => {
      throw new Error("refusé");
    };
    t.button("Enregistrer les mesures").click();
    expect(t.u.element.querySelector("p")?.textContent).toContain("n'ont pas pu être enregistrées");
  });
});
