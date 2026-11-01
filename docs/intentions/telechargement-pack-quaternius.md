# Intention : obtenir le pack Quaternius « Stylized Nature MegaKit » (Standard) pour le chantier ambiance-cartoon

**Statut** : proposée le 2026-11-01, bloque le lot 1 de `docs/projects/ambiance-cartoon.md`.

## Besoin

Le lot 1 télécharge une seule fois le pack Standard (CC0) depuis le site de l'éditeur, relit sa licence et retient quelques
arbres. Les lots 2 et 3 (matériau toon, routes) n'en dépendent pas ; les lots 4 à 6 (arbres du pack, e2e, provenance) si.

## Existant

Lu le 2026-11-01 : la page `https://quaternius.com/packs/stylizednaturemegakit.html` annonce la version Standard gratuite
(CC0, glTF/FBX/OBJ, 40 arbres), mais son bouton « Download » ouvre la page itch.io
`https://quaternius.itch.io/stylized-nature-megakit` (script `Itch.attachBuyButton`). Cette page répond par une vérification
anti-robot Cloudflare (« Just a moment... ») à `curl` comme à un Chromium piloté : aucun fichier n'est récupérable sans un
navigateur manipulé par une personne. Contourner la vérification n'est pas permis ; aucune autre source n'a été utilisée
(`docs/projects/ambiance-cartoon.md`, section 3). Aucun fichier du pack n'est dans le dépôt.

## Questions à trancher

- [decision] Le demandeur télécharge-t-il lui-même l'archive glTF Standard depuis son navigateur, pour la déposer hors dépôt
  (par exemple dans `/tmp`) et laisser l'agent retenir et alléger les arbres, écrire la provenance (adresse, version, date,
  licence, fichiers) ?
- Tranché le 2026-11-01 : le chantier a commencé par les lots 2, 3 et 5 (sans pack) ; ils sont livrés. Reste la première
  question, qui bloque le lot 1 puis `docs/intentions/arbres-pack-quaternius.md` (lot 4) et
  `docs/intentions/e2e-doc-arbres-pack.md` (lot 6).
