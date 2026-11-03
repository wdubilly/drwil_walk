import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { createPcInput } from "./input.ts";
import { SENSITIVITY } from "./look.ts";

function setup() {
  const win = new Window();
  const doc = win.document as unknown as Document;
  const canvas = doc.createElement("canvas");
  doc.body.append(canvas);
  const input = createPcInput(doc, canvas);
  const pointer = (type: string, target: EventTarget, init: { id?: number; x?: number; y?: number; kind?: string }) => {
    const event = new win.Event(type, { bubbles: true });
    Object.assign(event, { pointerId: init.id ?? 1, clientX: init.x ?? 0, clientY: init.y ?? 0, pointerType: init.kind ?? "touch" });
    target.dispatchEvent(event as unknown as Event);
  };
  return { doc, canvas, input, pointer };
}

describe("commandes tactiles", () => {
  it("APP-007: glisser un doigt sur la scène tourne le regard comme la souris", () => {
    const t = setup();
    t.pointer("pointerdown", t.canvas, { x: 100, y: 100 });
    t.pointer("pointermove", t.doc, { x: 60, y: 120 });
    expect(t.input.look().yawRad).toBeCloseTo(40 * SENSITIVITY);
    expect(t.input.look().pitchRad).toBeCloseTo(-20 * SENSITIVITY);
  });

  it("APP-007: relâcher le doigt arrête le regard ; un déplacement sans doigt posé ne tourne rien", () => {
    const t = setup();
    t.pointer("pointermove", t.doc, { x: 10, y: 10 });
    t.pointer("pointerdown", t.canvas, { x: 0, y: 0 });
    t.pointer("pointerup", t.doc, {});
    t.pointer("pointermove", t.doc, { x: 200, y: 200 });
    t.pointer("pointerdown", t.canvas, { x: 0, y: 0 });
    t.pointer("pointercancel", t.doc, {});
    t.pointer("pointermove", t.doc, { x: 200, y: 200 });
    expect(t.input.look()).toEqual({ yawRad: 0, pitchRad: 0 });
  });

  it("APP-007: un pointeur souris n'est pas pris pour un doigt", () => {
    const t = setup();
    t.pointer("pointerdown", t.canvas, { kind: "mouse" });
    t.pointer("pointermove", t.doc, { x: 50, kind: "mouse" });
    expect(t.input.look().yawRad).toBe(0);
  });

  it("APP-007: une action poussée par un bouton est rendue une seule fois, comme une touche", () => {
    const t = setup();
    t.input.push("pause");
    t.input.push("faster");
    const taken = t.input.take();
    expect(taken.buttons.trigger).toBe(true);
    expect(taken.steps).toBe(1);
    expect(t.input.take().buttons.trigger).toBe(false);
  });

  it("APP-007: la sortie retire les écouteurs tactiles", () => {
    const t = setup();
    t.input.dispose();
    t.pointer("pointerdown", t.canvas, {});
    t.pointer("pointermove", t.doc, { x: 50 });
    expect(t.input.look().yawRad).toBe(0);
  });
});
