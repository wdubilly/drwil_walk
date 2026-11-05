// Le réglage d'accueil des lampadaires produits par règle (APP-013) : coché par défaut, décoché il ne reste que le mobilier réel.
// La scène relit la case dans la page au moment de se construire : le réglage ne passe par aucune autre couche, et rien n'est gardé.
export const GENERATED_LAMPS_LABEL = "Lampadaires produits par règle (décocher : seul le mobilier réel)";
// La case des lanternes allumées la nuit (APP-011) suit la même règle : cochée par défaut, relue par la scène, jamais gardée.
export const STREET_LIGHTS_LABEL = "Lampadaires allumés la nuit";
const FIELD_ID = "lampadaires-produits";
const LIT_ID = "lampadaires-allumes";

function checkbox(doc: Document, label: string, id: string): HTMLLabelElement {
  const input = Object.assign(doc.createElement("input"), { type: "checkbox", checked: true, id });
  const wrapper = doc.createElement("label");
  wrapper.append(`${label} `, input);
  return wrapper;
}

export const renderLampsChoice = (doc: Document): HTMLLabelElement => checkbox(doc, GENERATED_LAMPS_LABEL, FIELD_ID);
export const renderStreetLightsChoice = (doc: Document): HTMLLabelElement => checkbox(doc, STREET_LIGHTS_LABEL, LIT_ID);
/** Les deux cases des lampadaires, dans l'ordre de l'accueil. */
export const renderLampsChoices = (doc: Document): HTMLLabelElement[] => [renderLampsChoice(doc), renderStreetLightsChoice(doc)];

/** Vrai tant que la case n'est pas décochée (une page sans accueil, comme les tests de la scène, garde les lampadaires). */
const checkedOrAbsent = (doc: Document, id: string): boolean => (doc.getElementById(id) as HTMLInputElement | null)?.checked !== false;
export const generatedLampsOn = (doc: Document): boolean => checkedOrAbsent(doc, FIELD_ID);
/** Vrai tant que la case des lanternes n'est pas décochée. */
export const streetLightsOn = (doc: Document): boolean => checkedOrAbsent(doc, LIT_ID);
