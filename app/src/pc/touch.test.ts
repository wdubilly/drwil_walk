import { describe, expect, it } from "vitest";
import { NO_DRAG, touchEnd, touchMove, touchStart } from "./touch.ts";

describe("glisser au doigt", () => {
  it("APP-007: le déplacement du doigt est rendu depuis le dernier point", () => {
    const drag = touchStart(NO_DRAG, 1, 100, 50);
    const first = touchMove(drag, 1, 90, 60);
    expect([first.dx, first.dy]).toEqual([-10, 10]);
    expect([touchMove(first.drag, 1, 95, 60).dx, touchMove(first.drag, 1, 95, 60).dy]).toEqual([5, 0]);
  });

  it("APP-007: relâcher le doigt arrête le mouvement du regard", () => {
    const drag = touchEnd(touchStart(NO_DRAG, 1, 0, 0), 1);
    expect(drag).toBe(NO_DRAG);
    expect(touchMove(drag, 1, 40, 40)).toEqual({ drag: NO_DRAG, dx: 0, dy: 0 });
  });

  it("APP-007: un second doigt est ignoré et ne coupe pas le premier", () => {
    const drag = touchStart(NO_DRAG, 1, 0, 0);
    expect(touchStart(drag, 2, 50, 50)).toBe(drag);
    expect(touchMove(drag, 2, 80, 80)).toEqual({ drag, dx: 0, dy: 0 });
    expect(touchEnd(drag, 2)).toBe(drag);
  });
});
