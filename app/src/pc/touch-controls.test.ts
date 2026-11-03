import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import type { PcAction } from "./keys.ts";
import { renderTouchControls } from "./touch-controls.ts";

describe("boutons à l'écran", () => {
  it("APP-007: chaque bouton déclenche l'action du clavier correspondante", () => {
    const doc = new Window().document as unknown as Document;
    const actions: PcAction[] = [];
    const controls = renderTouchControls(doc, doc.body, (a) => actions.push(a));
    const names = ["Moins vite", "Pause ou reprise", "Plus vite", "Recaler", "Quitter"];
    const buttons = [...controls.element.querySelectorAll("button")];
    expect(buttons.map((b) => b.textContent)).toEqual(names);
    for (const b of buttons) b.click();
    expect(actions).toEqual(["slower", "pause", "faster", "recalibrate", "quit"]);
  });

  it("APP-007: le groupe se retire de la page", () => {
    const doc = new Window().document as unknown as Document;
    const controls = renderTouchControls(doc, doc.body, () => undefined);
    expect(doc.querySelector(".touch-controls")).not.toBeNull();
    controls.remove();
    expect(doc.querySelector(".touch-controls")).toBeNull();
  });
});
