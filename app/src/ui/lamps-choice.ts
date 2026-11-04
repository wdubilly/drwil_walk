// Le réglage d'accueil des lampadaires produits par règle (APP-013) : coché par défaut, décoché il ne reste que le mobilier réel.
// La scène relit la case dans la page au moment de se construire : le réglage ne passe par aucune autre couche, et rien n'est gardé.
export const GENERATED_LAMPS_LABEL = "Lampadaires produits par règle (décocher : seul le mobilier réel)";
const FIELD_ID = "lampadaires-produits";

export function renderLampsChoice(doc: Document): HTMLLabelElement {
  const input = Object.assign(doc.createElement("input"), { type: "checkbox", checked: true, id: FIELD_ID });
  const wrapper = doc.createElement("label");
  wrapper.append(`${GENERATED_LAMPS_LABEL} `, input);
  return wrapper;
}

/** Vrai tant que la case n'est pas décochée (une page sans accueil, comme les tests de la scène, garde les lampadaires). */
export const generatedLampsOn = (doc: Document): boolean => (doc.getElementById(FIELD_ID) as HTMLInputElement | null)?.checked !== false;
