import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { TRAFFIC_LABEL, renderTrafficChoice, trafficOn } from "./traffic-choice.ts";

describe("case de la ville vivante", () => {
  it("APP-014: la case « Circulation et piétons » est décochée par défaut ; cochée, la scène pose les figurants ; sans accueil, aucun", () => {
    const doc = new Window().document as unknown as Document;
    expect(trafficOn(doc)).toBe(false);
    const field = renderTrafficChoice(doc);
    doc.body.append(field);
    expect(field.textContent).toContain(TRAFFIC_LABEL);
    expect(trafficOn(doc)).toBe(false);
    (field.querySelector("input") as HTMLInputElement).checked = true;
    expect(trafficOn(doc)).toBe(true);
  });
});
