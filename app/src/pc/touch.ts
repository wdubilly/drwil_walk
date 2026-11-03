// Le glisser d'un doigt sur la scène (APP-007) : un seul doigt à la fois oriente le regard, comme la souris. Logique pure, sans DOM.
export interface Drag {
  /** Le doigt qui glisse, ou null si aucun. */
  id: number | null;
  x: number;
  y: number;
}

export const NO_DRAG: Drag = { id: null, x: 0, y: 0 };

export interface DragStep {
  drag: Drag;
  /** Déplacement du doigt depuis le dernier point, en pixels (0 si ce doigt ne glisse pas). */
  dx: number;
  dy: number;
}

/** Un doigt se pose : il prend le regard s'il est le premier, un second doigt est ignoré. */
export function touchStart(drag: Drag, id: number, x: number, y: number): Drag {
  return drag.id === null ? { id, x, y } : drag;
}

/** Le doigt qui glisse se déplace : seul son mouvement tourne le regard. */
export function touchMove(drag: Drag, id: number, x: number, y: number): DragStep {
  if (drag.id !== id) return { drag, dx: 0, dy: 0 };
  return { drag: { id, x, y }, dx: x - drag.x, dy: y - drag.y };
}

/** Le doigt se relève (ou l'appui est annulé) : le mouvement du regard s'arrête net. */
export function touchEnd(drag: Drag, id: number): Drag {
  return drag.id === id ? NO_DRAG : drag;
}
