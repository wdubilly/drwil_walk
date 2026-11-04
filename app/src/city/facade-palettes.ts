// Les palettes de détails des façades (APP-008), un jeu par région : les familles décrivent des types de bâtiment valables
// partout, la palette porte la couleur locale. Une région sans jeu propre (Provence, région inconnue) garde le jeu de base.
import type { FamilyId, Region } from "./facade-family.ts";

/** Une palette de détails : liserés, volets, portes et rambardes ; les murs gardent la teinte d'OpenStreetMap ou de la ville. */
export interface DetailPalette {
  trim: number;
  glass: number;
  shutters: readonly number[];
  doors: readonly number[];
  accent: number;
}

export type PaletteSet = Record<FamilyId, readonly DetailPalette[]>;

/** Trois palettes par famille : le quartier en choisit une, ses voisins la partagent. */
export const PALETTES_PER_FAMILY = 3;

/** Le jeu de base : celui de la Provence et le repli d'une région inconnue (les teintes d'avant les régions). */
export const PALETTES: PaletteSet = {
  provencale: [
    { trim: 0xf1e8d4, glass: 0x35434d, shutters: [0x6f8f9a, 0x8a9a6a, 0x5d7f8f], doors: [0x7a5a3a, 0x4f6f7a, 0x6a4a2a], accent: 0x3b3b3b },
    { trim: 0xe9dcc0, glass: 0x33414b, shutters: [0x7d9a8c, 0xa08b5c, 0x6b8a98], doors: [0x5a4630, 0x6d7f5a, 0x7a3b2a], accent: 0x2f3a34 },
    { trim: 0xf4ecdc, glass: 0x384650, shutters: [0x8aa0b0, 0x9b7a5a, 0x7b9a7a], doors: [0x4a5a6a, 0x7a5a3a, 0x5a3a2a], accent: 0x404040 },
  ],
  village: [
    { trim: 0xeee6d6, glass: 0x34424c, shutters: [0x8b4a3a, 0x3f5f7a, 0x5a6a4a], doors: [0x5a3a22, 0x3a4a5a, 0x7a2f26], accent: 0x444444 },
    { trim: 0xd9d0bd, glass: 0x303e48, shutters: [0x4a6a5a, 0x7a5a3a, 0x6a3f3f], doors: [0x3a2a1a, 0x5a6a3a, 0x6a4a2a], accent: 0x3a3a3a },
    { trim: 0xf2ede0, glass: 0x384650, shutters: [0x5a5f7a, 0x8a6a3a, 0x4a5f5a], doors: [0x6a2f2a, 0x4a3a2a, 0x2f4a5a], accent: 0x4a4a4a },
  ],
  ancien: [
    { trim: 0xc9b99a, glass: 0x2f3a42, shutters: [0x5a3a2a, 0x4a4a3a, 0x6a4a3a], doors: [0x3a2616, 0x4a3020, 0x2e2418], accent: 0x6a5a4a },
    { trim: 0xb8a888, glass: 0x2c363e, shutters: [0x4a2f22, 0x5a4a3a, 0x3f3a2f], doors: [0x2e1c10, 0x45301c, 0x3a2a1c], accent: 0x5a4a3a },
    { trim: 0xd2c2a2, glass: 0x303a42, shutters: [0x6a3a2a, 0x3a3a2a, 0x5a3f2a], doors: [0x3a2412, 0x2a1c12, 0x4a3422], accent: 0x6f5f4f },
  ],
  recent: [
    { trim: 0xdfe3e6, glass: 0x4a6a80, shutters: [0x8a9aa6, 0x6a7a86, 0x9aa6ae], doors: [0x3a4a56, 0x5a6a76, 0x2f3a44], accent: 0x55636e },
    { trim: 0xc9ced2, glass: 0x3f5f78, shutters: [0x7a8a96, 0x5a6a76, 0x8a96a0], doors: [0x2f3f4a, 0x4a5a66, 0x3a464f], accent: 0x4a5760 },
    { trim: 0xe8e2d6, glass: 0x466c82, shutters: [0x9a9a8a, 0x7a7a6a, 0x8a8a7a], doors: [0x6a3f2a, 0x3f4f5a, 0x4a3a2a], accent: 0x5f6a70 },
  ],
};

/** Italie : travertin et ocres, volets verts, portes de noyer, rambardes de fer sombre. */
const ITALIE: PaletteSet = {
  ...PALETTES,
  village: [
    { trim: 0xe8dcc2, glass: 0x33404a, shutters: [0x4f6b3a, 0x5f7a45, 0x3f5a32], doors: [0x5a3a22, 0x6b4428, 0x4a2e1a], accent: 0x2e2a26 },
    { trim: 0xdcc8a0, glass: 0x313e48, shutters: [0x6a7a3f, 0x4a6a4a, 0x8a5a2e], doors: [0x4f3420, 0x6a3f24, 0x3f2a18], accent: 0x332c26 },
    { trim: 0xefe2c8, glass: 0x36434d, shutters: [0x55704a, 0x7a6a3a, 0x46603a], doors: [0x62402a, 0x503222, 0x704a2e], accent: 0x2a2a2a },
  ],
  ancien: [
    { trim: 0xd8c9a6, glass: 0x2e3940, shutters: [0x4a5a32, 0x6a4a2a, 0x3f4f2e], doors: [0x3f2814, 0x4f3218, 0x342210], accent: 0x8a6a42 },
    { trim: 0xcbb68c, glass: 0x2b353c, shutters: [0x5a4a2a, 0x405232, 0x6a3a22], doors: [0x2e1e10, 0x4a2c16, 0x3a2614], accent: 0x7a5a36 },
    { trim: 0xe0d2b2, glass: 0x303a41, shutters: [0x52603a, 0x704826, 0x4a5a3a], doors: [0x3a2412, 0x52361e, 0x2a1a0e], accent: 0x94704a },
  ],
  recent: [
    { trim: 0xe6dccb, glass: 0x4a6478, shutters: [0xb0703f, 0x9a8a6a, 0xc0905a], doors: [0x4a3a2a, 0x5a4a3a, 0x3a3028], accent: 0x6a5a4a },
    { trim: 0xd6c6a6, glass: 0x405a70, shutters: [0xa0603a, 0x8a7a5a, 0xb88a5a], doors: [0x3a2e24, 0x52402e, 0x2e2620], accent: 0x5a4a3c },
    { trim: 0xeee4d2, glass: 0x48667c, shutters: [0xc07a46, 0xa8946e, 0x9a6a40], doors: [0x5a4232, 0x423428, 0x6a4a34], accent: 0x705e4c },
  ],
};

/** Caucase (Erevan, Tbilissi) : tuf rose et basalte sombre, bois sculpté brun. */
const CAUCASE: PaletteSet = {
  ...PALETTES,
  village: [
    { trim: 0xcf9f8c, glass: 0x323c44, shutters: [0x6a4632, 0x5a3a2c, 0x7a5236], doors: [0x4a2e22, 0x5a3626, 0x3a2418], accent: 0x3a3436 },
    { trim: 0xc48e7e, glass: 0x303a42, shutters: [0x5e4030, 0x744c34, 0x52382a], doors: [0x42281c, 0x60382a, 0x34201a], accent: 0x403a3c },
    { trim: 0xd9ad9a, glass: 0x343e46, shutters: [0x704a36, 0x60402e, 0x825a3c], doors: [0x502e22, 0x3e261c, 0x683e2c], accent: 0x363032 },
  ],
  ancien: [
    { trim: 0xb88070, glass: 0x2c343a, shutters: [0x4e3226, 0x5e3a2a, 0x40281e], doors: [0x34201a, 0x442a1e, 0x2a1a14], accent: 0x3e3a3c },
    { trim: 0xa87264, glass: 0x2a3238, shutters: [0x462c22, 0x58362a, 0x3a241c], doors: [0x2e1c16, 0x3e261c, 0x241612], accent: 0x34302f },
    { trim: 0xc58c7a, glass: 0x2e363c, shutters: [0x56362a, 0x664032, 0x482e22], doors: [0x3a221a, 0x4c2e22, 0x2c1a14], accent: 0x484244 },
  ],
  recent: [
    { trim: 0xd8b4a6, glass: 0x48606e, shutters: [0x8a7a76, 0x6e6260, 0x9a8884], doors: [0x3a3234, 0x4e4446, 0x2e2828], accent: 0x5a5254 },
    { trim: 0xcaa294, glass: 0x405866, shutters: [0x7e6e6a, 0x645856, 0x8e7c78], doors: [0x342c2e, 0x463c3e, 0x282222], accent: 0x504849 },
    { trim: 0xe2c0b2, glass: 0x4a6472, shutters: [0x94827e, 0x766a68, 0xa48e8a], doors: [0x40383a, 0x54484a, 0x322a2c], accent: 0x625a5c },
  ],
};

/** France du Nord (Paris) : pierre de taille claire, zinc et ardoise, volets gris-bleu et portes vert sombre. */
const FRANCE_NORD: PaletteSet = {
  ...PALETTES,
  village: [
    { trim: 0xe6dfcf, glass: 0x34404a, shutters: [0x7c8a96, 0xa8b0b4, 0x5a6e78], doors: [0x24382e, 0x2a2e36, 0x5a2a24], accent: 0x3e464c },
    { trim: 0xdcd4c2, glass: 0x323e48, shutters: [0x8c98a2, 0x6a7a84, 0xb4b8b8], doors: [0x1e3228, 0x30343c, 0x4a2420], accent: 0x384046 },
    { trim: 0xece6d8, glass: 0x36424c, shutters: [0x96a2aa, 0x748490, 0x60727c], doors: [0x2a3e32, 0x262a32, 0x62302a], accent: 0x444c52 },
  ],
  ancien: [
    { trim: 0xddd3bc, glass: 0x2e3a42, shutters: [0x6e7c86, 0x8a949a, 0x56646e], doors: [0x1c2a24, 0x22262e, 0x3a2a20], accent: 0x6c767c },
    { trim: 0xd2c8b0, glass: 0x2c3840, shutters: [0x7a868e, 0x5e6c76, 0x949ca2], doors: [0x18261e, 0x2a2e36, 0x32241c], accent: 0x626c72 },
    { trim: 0xe4dbc6, glass: 0x303c44, shutters: [0x84909a, 0x68767e, 0x9ea6ac], doors: [0x20302a, 0x1e2228, 0x40302a], accent: 0x747e84 },
  ],
  recent: [
    { trim: 0xd4d6d4, glass: 0x4a6478, shutters: [0x7a8288, 0x5e666c, 0x969ca0], doors: [0x2a3036, 0x3a4248, 0x22282c], accent: 0x666e74 },
    { trim: 0xc4c8c8, glass: 0x425c70, shutters: [0x6e767c, 0x545c62, 0x8a9094], doors: [0x24292e, 0x343a40, 0x1e2226], accent: 0x5c646a },
    { trim: 0xe0e0dc, glass: 0x4c687c, shutters: [0x868e94, 0x6a7278, 0xa2a8ac], doors: [0x30363c, 0x404850, 0x262c30], accent: 0x70787e },
  ],
};

/** Inde (Pune) : chaux blanche et liserés vifs, volets turquoise, safran et vert, portes de teck. */
const INDE: PaletteSet = {
  ...PALETTES,
  village: [
    { trim: 0xf4f0e6, glass: 0x2e4450, shutters: [0x2a8a8a, 0xd08a2a, 0x4a8a3a], doors: [0x5a3418, 0x2a6a7a, 0x7a2a2a], accent: 0x2a5a6a },
    { trim: 0xeae4d4, glass: 0x2c424e, shutters: [0x3a7a9a, 0xc0602a, 0x6a8a2a], doors: [0x4a2a14, 0x8a3a2a, 0x2a5a5a], accent: 0x6a2a3a },
    { trim: 0xf8f4ea, glass: 0x304652, shutters: [0x1e7a7a, 0xe0a030, 0x8a3a5a], doors: [0x62381a, 0x3a6a4a, 0x9a4a1a], accent: 0x3a4a7a },
  ],
  ancien: [
    { trim: 0xe0d0b0, glass: 0x2a3a42, shutters: [0x6a3a1a, 0x2a6a6a, 0x8a5a1a], doors: [0x4a2810, 0x5a3014, 0x3a200c], accent: 0x7a3a1a },
    { trim: 0xd4c098, glass: 0x283840, shutters: [0x5a3014, 0x3a6a5a, 0x7a4a14], doors: [0x3e220e, 0x52280e, 0x30180a], accent: 0x6a2e14 },
    { trim: 0xe8dabc, glass: 0x2c3c44, shutters: [0x7a4220, 0x2e7272, 0x9a6420], doors: [0x562e12, 0x48260e, 0x3a1e0a], accent: 0x8a4420 },
  ],
  recent: [
    { trim: 0xf0ece4, glass: 0x3a6a7a, shutters: [0x5a9aa0, 0xd0a060, 0x8ab070], doors: [0x2a4a5a, 0x6a3a2a, 0x3a5a3a], accent: 0x4a6a7a },
    { trim: 0xe4ddd0, glass: 0x34606e, shutters: [0x4a8a90, 0xc09050, 0x7aa060], doors: [0x24424e, 0x5a3224, 0x325232], accent: 0x40606e },
    { trim: 0xf6f2ea, glass: 0x3e7080, shutters: [0x68a6aa, 0xdcae6c, 0x96bc7c], doors: [0x305262, 0x744232, 0x406242], accent: 0x547480 },
  ],
};

/** Golfe (Doha) : enduits sable, bois sombre des moucharabiehs et des portes, liserés couleur de pierre de corail. */
const GOLFE: PaletteSet = {
  ...PALETTES,
  village: [
    { trim: 0xe8d6b0, glass: 0x3a4248, shutters: [0x6a4a2a, 0x7a5a36, 0x5a3e24], doors: [0x4a3018, 0x3a2614, 0x5e3c1e], accent: 0x8a6a46 },
    { trim: 0xdcc8a0, glass: 0x384046, shutters: [0x5e4226, 0x74522e, 0x4e3620], doors: [0x42290f, 0x34220e, 0x553618], accent: 0x7e6040 },
    { trim: 0xf0e2c2, glass: 0x3c444a, shutters: [0x765230, 0x82623c, 0x664628], doors: [0x52341a, 0x402a14, 0x684420], accent: 0x947250 },
  ],
  ancien: [
    { trim: 0xd6c09a, glass: 0x34393c, shutters: [0x543820, 0x644428, 0x46301a], doors: [0x3a2410, 0x2e1c0c, 0x4a2e14], accent: 0x9a7a52 },
    { trim: 0xcab28a, glass: 0x32373a, shutters: [0x4c321c, 0x5c3e24, 0x3e2a16], doors: [0x34200e, 0x28180a, 0x422a12], accent: 0x8e6e48 },
    { trim: 0xe0caa4, glass: 0x363b3e, shutters: [0x5c3e24, 0x6c4a2c, 0x4e341e], doors: [0x402812, 0x321e0e, 0x523418], accent: 0xa6845a },
  ],
  recent: [
    { trim: 0xeee6d6, glass: 0x3a6a86, shutters: [0xb0a08a, 0x968a76, 0xc4b6a0], doors: [0x5a4a3a, 0x3a3a3a, 0x6a5440], accent: 0x8a7e6c },
    { trim: 0xe2d8c4, glass: 0x34627c, shutters: [0xa49480, 0x8a7e6c, 0xb8aa94], doors: [0x504234, 0x343434, 0x604c3a], accent: 0x7e7262 },
    { trim: 0xf4eee2, glass: 0x407290, shutters: [0xbcac96, 0xa29680, 0xd0c2ac], doors: [0x645240, 0x404040, 0x745e48], accent: 0x968a78 },
  ],
};

const BY_REGION: Partial<Record<Region, PaletteSet>> = { italie: ITALIE, caucase: CAUCASE, "france-nord": FRANCE_NORD, inde: INDE, golfe: GOLFE };

/** Le jeu de palettes d'une région ; repli sur le jeu de base quand la région n'en a pas. */
export const palettesOf = (region: Region): PaletteSet => BY_REGION[region] ?? PALETTES;
