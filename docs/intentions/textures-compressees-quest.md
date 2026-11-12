# Intention : compresser les textures des matériaux locaux pour le Quest 3 (KTX2 / Basis)

**Statut** : proposée le 2026-11-04 (limite du chantier facades-materiaux-souk) ; traitée le 2026-11-12 par `gen-05` (KTX2 ETC1S 512 px, transcodeur servi avec la page) ; reste le jugement au casque.

## Besoin

Réduire la mémoire graphique et le temps de chargement des matériaux locaux au casque, pour pouvoir en ajouter (plus de
matériaux, d'autres quartiers) sans quitter les 72 images par seconde (`APP-012`, `APP-006`).

## Existant

Lu le 2026-11-04 : les textures sont des JPEG 256 × 256 px embarqués en base64, décompressés en mémoire graphique
(≈ 1,05 Mo pour le souk, plafond de 4 Mo, `app/src/city/material-library.ts`) ; aucun chargeur KTX2 dans l'application,
et un chargeur KTX2 de three.js demande un transcodeur (fichier WebAssembly) servi avec la page.

## Questions à trancher

- [decision] Le gain justifie-t-il un transcodeur embarqué de plus (poids de la page) ? À mesurer d'abord au casque.
- Quelle taille de texture (256, 512 px) rend bien à hauteur d'homme ?
