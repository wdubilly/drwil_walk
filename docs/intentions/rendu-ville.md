# Intention : une ville moins austère dans le casque

**Statut** : proposée le 2026-10-31 ; traitée en partie le 2026-10-31 (chantier rendu-ville : voies, tons de bâtiments, palette par itinéraire, passthrough conservé) ; reste l'essai au casque et les deux décisions ci-dessous.

## Besoin

Premier retour sur un vrai Quest 3 (un ami du demandeur, 2026-10-31) : la ville s'affiche et défile, mais elle est
**d'une seule couleur orange, en formes plates**, « un peu comme les images de la page » ; il voit ses pieds, pas de
ciel, son bureau en fond. Le demandeur juge le rendu moche et veut quelque chose de plus lisible et de plus agréable
à parcourir.

## Existant

Lu le 2026-10-31 (`app/src/city/souq.ts`, `app/src/city/buildings.ts`, `app/src/city/souq-data.ts`) :

- Tous les bâtiments sont fusionnés en un seul maillage d'une seule teinte (`0xe3cfa5`), sur un sol plan d'une seule
  teinte (`0xb59b73`), éclairés par une lumière hémisphérique : aucun relief de teinte, aucune distinction visuelle.
- Les extraits OSM contiennent aussi les voies (`kind: "highway"`, avec leur classe), lues pour calculer les
  boucles mais **jamais dessinées**.
- Pas de fond de scène (`scene.background = null`) : le passthrough montre le réel. Le ciel absent et le bureau
  visible sont donc le comportement voulu (mode `immersive-ar`, `MISSION.md`), pas un défaut.
- Le fondu de sécurité (`APP-001`) agit sur l'opacité de tous les matériaux de la scène (`setCityOpacity`).

## Traité (chantier rendu-ville, hypothèses de l'agent à confirmer)

- Voies dessinées sur le sol, largeur selon la classe ; bâtiments en quatre tons déterministes ; palette par itinéraire ; pas de ciel (passthrough conservé). Jamais vu sur un vrai Quest 3 : teintes, largeurs et 72 images par seconde sont à juger au casque.

## Questions à trancher

- [decision] Garder le passthrough sans ciel virtuel (recommandé : un ciel ou un fond opaque cacherait le réel et
  affaiblirait `APP-001`), ou prévoir un ciel optionnel, désactivé par défaut ?
- [decision] La palette : tons terre par quartier, ou une palette par itinéraire (ocre pour le souk, brique pour
  Pune, gris-bleu pour la Corniche) ?
- [decision] Les types de bâtiments (église, mosquée, commerce) exigent de relancer les extractions Overpass pour
  conserver la balise `building` : le demandeur les veut-il, ou la variation de teinte suffit-elle ?
