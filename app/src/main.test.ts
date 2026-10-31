import { Window } from "happy-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

function pageWithApp(withApp: boolean): Document {
  const doc = new Window().document as unknown as Document;
  if (withApp) {
    const app = doc.createElement("main");
    app.id = "app";
    doc.body.append(app);
  }
  return doc;
}

describe("point d'entrée", () => {
  it("affiche l'accueil dans l'élément #app au chargement", async () => {
    const doc = pageWithApp(true);
    vi.stubGlobal("document", doc);
    vi.stubGlobal("navigator", { xr: undefined });
    await import("./main.ts");
    expect(doc.querySelector("#app button.enter")?.textContent).toBe("Entrer en réalité mixte");
  });

  it("signale une page sans élément #app au lieu de rester muette", async () => {
    vi.stubGlobal("document", pageWithApp(true));
    vi.stubGlobal("navigator", { xr: undefined });
    const { mount } = await import("./main.ts");
    expect(() => {
      mount(pageWithApp(false), undefined, undefined);
    }).toThrow("élément #app introuvable");
  });
});
