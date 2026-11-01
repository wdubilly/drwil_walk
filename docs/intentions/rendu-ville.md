# Intention : une ville moins austère dans le casque

**Statut** : proposée le 2026-10-31 ; traitée le 2026-10-31 par les chantiers rendu-ville (voies, tons de bâtiments, palette par itinéraire, passthrough conservé) et osm-enrichi (couleurs et matériaux d'OpenStreetMap, ombrage, arbres, mobilier).
**Reviewed on 2026-10-31** : le passthrough sans ciel virtuel est gardé, la palette est par itinéraire et le rendu enrichi est livré ; ne reste que la question des types de bâtiments et le jugement au casque.
**Repris le 2026-11-01** : l'ambiance cartoon (matériau toon, routes, arbres du pack Quaternius) est cadrée par `docs/projects/journal.md`.

**Livré partiellement le 2026-11-01** par le chantier ambiance-cartoon : matériau toon, voies bordées, fenêtres et contours en option sont posés, à juger au casque (`docs/intentions/essai-casque-ambiance-cartoon.md`) ; les arbres du pack attendent son téléchargement (`docs/intentions/telechargement-pack-quaternius.md`). Reste ici la question des types de bâtiments.

## Besoin

Premier retour sur un vrai Quest 3 (un ami du demandeur, 2026-10-31) : la ville s'affiche et défile, mais elle est
**d'une seule couleur orange, en formes plates** ; il voit ses pieds, pas de ciel, son bureau en fond. Le demandeur juge
le rendu moche et veut quelque chose de plus lisible et de plus agréable à parcourir.

## Existant

Lu le 2026-10-31 : voies dessinées sur le sol, bâtiments en tons déterministes, palette propre à chaque itinéraire,
couleurs et matériaux d'OpenStreetMap, ombrage vers le pied, arbres et mobilier (`app/src/city/`). Pas de fond de scène :
le passthrough montre le réel, c'est voulu (mode `immersive-ar`, `APP-001`). Jamais vu au casque : teintes, plafonds et
72 images par seconde sont à juger (`docs/intentions/essai-casque-osm-enrichi.md`).

## Questions à trancher

- Tranché le 2026-10-31 : passthrough sans ciel virtuel, palette par itinéraire.
- [decision] Les types de bâtiments (église, mosquée, commerce) exigent de relancer les extractions Overpass pour
  conserver la balise `building` : le demandeur les veut-il pour teinter par type, ou la variation de teinte actuelle
  suffit-elle ? À trancher après l'essai au casque.
