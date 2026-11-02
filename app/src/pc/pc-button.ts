// Le bouton « Version PC » de l'accueil : un bouton distinct de celui du casque, pour qu'on ne prenne jamais l'un pour l'autre (APP-001).
export const PC_LABEL = "Version PC";

export function renderPcButton(doc: Document): HTMLButtonElement {
  const button = doc.createElement("button");
  button.type = "button";
  button.textContent = PC_LABEL;
  button.className = "enter-pc";
  button.title = "Marcher dans la page, sans casque : clavier et souris";
  return button;
}
