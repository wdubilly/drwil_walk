// Les teintes que les balises OpenStreetMap donnent aux bâtiments (APP-003) : `#rrggbb` lu en nombre, matériau en ton.

/** Un `#rrggbb` de l'extrait en nombre ; rien s'il n'est pas lisible. */
export function parseHex(value: string): number | undefined {
  return /^#[0-9a-f]{6}$/i.test(value) ? parseInt(value.slice(1), 16) : undefined;
}

/** Le ton d'un matériau de construction courant ; un matériau inconnu ne teinte pas (ton de la palette). */
const MATERIAL_TONES: Record<string, number> = {
  brick: 0xa4513b, stone: 0xb9ad98, concrete: 0xa7a8a8, wood: 0x9a7448, glass: 0x9fc4d4, metal: 0x9aa3ab, plaster: 0xe2d8c3,
  mud: 0xb8956a, sandstone: 0xd2b48c, cement_block: 0xb2b2ac, steel: 0x8f99a3, tin: 0xa8afb5,
};

export const materialTone = (material: string | undefined): number | undefined => MATERIAL_TONES[material ?? ""];
