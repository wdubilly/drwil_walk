import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cityFor } from "./cities.ts";
import { BENCH_BACK_M } from "./furniture.ts";
import { pushMarkings } from "./markings.ts";
import { buildFurniture } from "./props.ts";
import { newRibbons } from "./roads.ts";
import type { Prop } from "./souq-data.ts";
import type { Path } from "../route/path.ts";

const ITINERARIES = [
  { id: "doha-souq-waqif", file: "souq-waqif.json" },
  { id: "pune-vieille-ville", file: "pune-vieille-ville.json" },
  { id: "doha-corniche", file: "doha-corniche.json" },
  { id: "pune-fc-road", file: "pune-fc-road.json" },
];

/** Le haut du mobilier dessiné, 0 sans pièce. */
const topOf = (props: readonly Prop[], route: Path): number => {
  const geometry = buildFurniture(props, route).geometry;
  if (!geometry.hasAttribute("position")) return 0;
  geometry.computeBoundingBox();
  return geometry.boundingBox?.max.y ?? 0;
};

/** Rien ne dépasse la plus haute des pièces que l'extrait porte, chacune dessinée seule. */
const allowedTop = (props: readonly Prop[], route: Path): number =>
  Math.max(0, ...[...new Set(props.map((p) => p.kind))].map((kind) => topOf([{ kind, at: route.points[0] as Prop["at"] }], route)));

const read = (file: string): { features: { properties: { kind: string; footway?: string; sidewalk?: string } }[] } =>
  JSON.parse(readFileSync(new URL(`../../data/${file}`, import.meta.url), "utf8")) as ReturnType<typeof read>;

describe("mobilier et marquages des quatre itinéraires", () => {
  for (const { id, file } of ITINERARIES) {
    it(`APP-009: ${id}, le mobilier dessiné est celui des balises de l'extrait, rien n'est inventé`, () => {
      const kinds = new Set(read(file).features.map((f) => f.properties.kind));
      const city = cityFor(id);
      expect(city.props.every((p) => kinds.has(p.kind))).toBe(true);
      // Aucun extrait ne porte de lampadaire (relevé du 2026-11-03) : aucune pièce de 4,5 m n'est dessinée.
      expect(city.props.some((p) => p.kind === "lamp")).toBe(false);
      expect(topOf(city.props, city.route)).toBeLessThanOrEqual(allowedTop(city.props, city.route));
    });

    it(`APP-009: ${id}, une poubelle relevée dans l'extrait est dessinée à sa hauteur, sans faire échouer le relevé`, () => {
      const city = cityFor(id);
      const props: Prop[] = [...city.props, { kind: "bin", at: city.route.points[0] as Prop["at"] }];
      expect(topOf(props, city.route)).toBeGreaterThan(BENCH_BACK_M);
      expect(topOf(props, city.route)).toBeLessThanOrEqual(allowedTop(props, city.route));
    });

    it(`APP-009: ${id}, les marquages suivent les balises de voie, et rien sans balise`, () => {
      const city = cityFor(id);
      const tagged = city.roads.filter((r) => r.footway !== undefined || r.sidewalk !== undefined);
      expect(tagged.length).toBeGreaterThan(0);
      const marks = newRibbons();
      pushMarkings(marks, city.roads, city.route);
      expect(marks.positions.length).toBeGreaterThan(0);
      const bare = newRibbons();
      pushMarkings(bare, city.roads.map((r) => ({ highway: r.highway, points: r.points })), city.route);
      expect(bare.positions).toEqual([]);
    });
  }
});
