// Le réglage d'accueil de la ville vivante (APP-014) : décoché par défaut, coché il fait apparaître véhicules et piétons sur
// les itinéraires que liste le catalogue. La scène relit la case au moment de se construire ; rien n'est gardé.
export const TRAFFIC_LABEL = "Circulation et piétons";
const FIELD_ID = "circulation-pietons";

export function renderTrafficChoice(doc: Document): HTMLLabelElement {
  const input = Object.assign(doc.createElement("input"), { type: "checkbox", checked: false, id: FIELD_ID });
  const wrapper = doc.createElement("label");
  wrapper.append(`${TRAFFIC_LABEL} `, input);
  return wrapper;
}

/** Vrai seulement si la case est cochée : sans accueil (tests de la scène), aucun figurant. */
export const trafficOn = (doc: Document): boolean => (doc.getElementById(FIELD_ID) as HTMLInputElement | null)?.checked === true;
