import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import { createAttributionLabel } from "./attribution.ts";
import { withCanvasContext } from "./canvas-double.ts";

function docWithContext(context: object | null): Document {
  return withCanvasContext(new Window().document as unknown as Document, context);
}

describe("mention OpenStreetMap dans le casque", () => {
  it("APP-003: dessine la mention sur un panneau placé devant l'utilisateur", () => {
    const context = { fillRect: vi.fn(), fillText: vi.fn() };
    const label = createAttributionLabel(docWithContext(context));
    expect(context.fillText).toHaveBeenCalledWith("© contributeurs OpenStreetMap", 256, 32);
    expect(label.name).toBe("attribution-osm");
    expect(label.position.z).toBeLessThan(0);
  });

  it("dit pourquoi la mention ne peut pas être dessinée", () => {
    expect(() => createAttributionLabel(docWithContext(null))).toThrow("Canvas 2D indisponible");
  });
});
