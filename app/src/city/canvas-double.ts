// Doublure de test : happy-dom n'a pas de contexte canvas 2D. Aucun code de l'application ne l'importe.
const NO_OP_CONTEXT = { fillRect: () => undefined, fillText: () => undefined };

/** Fait rendre `context` (par défaut un contexte muet) aux canevas créés par `doc`. */
export function withCanvasContext(doc: Document, context: object | null = NO_OP_CONTEXT): Document {
  // Le prototype appartient à la fenêtre de ce document : les autres documents ne sont pas touchés.
  const prototype = Object.getPrototypeOf(doc.createElement("canvas")) as object;
  Object.defineProperty(prototype, "getContext", { value: () => context, configurable: true });
  return doc;
}
