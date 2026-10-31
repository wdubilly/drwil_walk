import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import { createAttributionLabel } from "./attribution.ts";
import { withCanvasContext } from "./canvas-double.ts";

function docWithContext(context: object | null): Document {
  return withCanvasContext(new Window().document as unknown as Document, context);
}

describe("mentions de données dans le casque", () => {
  it("APP-003: dessine la mention sur un panneau placé devant l'utilisateur", () => {
    const context = { fillRect: vi.fn(), fillText: vi.fn() };
    const { mesh } = createAttributionLabel(docWithContext(context));
    expect(context.fillText).toHaveBeenCalledWith("© contributeurs OpenStreetMap", 512, 64, 1000);
    expect(mesh.name).toBe("attribution");
    expect(mesh.position.z).toBeLessThan(0);
  });

  it("APP-003: redessine le panneau quand le texte change, entier et comprimé s'il est long", () => {
    const context = { fillRect: vi.fn(), fillText: vi.fn() };
    const label = createAttributionLabel(docWithContext(context), "© A");
    label.setText("© A · Google · Landsat / Copernicus");
    expect(context.fillText).toHaveBeenLastCalledWith("© A · Google · Landsat / Copernicus", 512, 64, 1000);
  });

  it("dit pourquoi la mention ne peut pas être dessinée", () => {
    expect(() => createAttributionLabel(docWithContext(null))).toThrow("Canvas 2D indisponible");
  });
});
