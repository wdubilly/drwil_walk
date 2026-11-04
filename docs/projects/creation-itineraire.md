# Chantier : une commande unique pour créer un itinéraire, avec des photos de rue en inspiration

**Statut** : cadré le 2026-11-04.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/creation-itineraire-fiable.md`

<!-- scope
files:
  - app/scripts/*.ts
  - app/scripts/*.test.ts
  - app/package.json
  - app/data/*.json
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/assets/PROVENANCE.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - .drwil/ia-first.json
-->

## 1. Besoin

Ajouter une ville est aujourd'hui un travail à la main : une entrée dans `app/scripts/cities.ts`, un script npm par ville,
un tracé de boucle, puis la chaîne des matériaux lancée à part (et seulement pour le souk). Le demandeur veut une
**commande unique et répétable** : on donne un nom, une emprise et un départ/arrivée, et elle produit l'itinéraire complet,
sans code propre à la ville, avec des couleurs et des matériaux inspirés de photos de rue.

## Critères d'acceptation

- Une seule commande hors marche prend un nom, une emprise et un départ/arrivée, et écrit l'extrait, le tracé de boucle et
  la bibliothèque de matériaux de la ville ; aucun code, aucun script npm propre à la ville — `APP-003`
- Les quatre itinéraires existants sont **reproductibles** avec cette commande (ses entrées remplacent les entrées de
  `app/scripts/cities.ts` et les scripts `extract:*`) et leurs rendus restent inchangés — `APP-003`
- Chaque point du tracé de boucle produit est un sommet d'une voie de l'extrait (test existant, appliqué à toute ville) — `APP-002`
- Les photos viennent de Panoramax puis de Mapillary (jeton lu dans l'environnement, jamais écrit dans le dépôt) et des
  photos fournies par le demandeur ; la commande en tire les couleurs dominantes et les textures — `APP-012`, `SEC-007`
- Sans photo à moins de 30 m du tracé, la commande **élargit** la recherche aux quartiers voisins (jusqu'à 1 km du tracé), et le rapport dit pour chaque couleur d'où elle vient (photo, distance, auteur, licence) ; si rien ne se trouve
  même à 1 km, elle se replie sur la palette de la région et le dit — `APP-008`, `APP-012`
- Les textures embarquées sont CC0 ou recolorées, leur provenance écrite dans `app/assets/PROVENANCE.md` ; aucun appel
  réseau pendant la marche — `APP-012`, `APP-003`
- L'attribution OpenStreetMap couvre toute ville créée — `APP-003`
- Le plafond de poids de `app/data/` reste tenu par les tests existants (ce chantier ne les contourne pas) — `APP-003`
- Les couleurs et les matériaux sont jugés sur un vrai Quest 3, a posteriori [human] — `APP-001`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Créer Rome, Erevan et Paris : c'est `docs/projects/villes-itineraires.md`, qui passe **après** ce chantier.
- Une vérification de la commande sur ses propres sorties (poids, attribution) : les tests existants suffisent
  (décision du 2026-11-04).
- Une relecture des couleurs sur captures avant embarquement : décision du 2026-11-04, elles sont jugées après coup au
  casque.
- Toute évolution du rendu ; un trajet libre ou un GPX (`docs/projects/course-reelle-gpx.md`).

## 3. Contraintes

- L'extraction et les photos demandent un **accès réseau** (Overpass, Panoramax, Mapillary) : hors marche, jamais depuis
  l'application. Overpass est public : espacer les requêtes, ne pas les relancer en boucle.
- `MAPILLARY_TOKEN` vient de l'environnement ; aucun jeton dans le code, les logs, les commits ou la sortie — `SEC-007`.
- Les photos fournies par le demandeur sont lues sur le disque, hors dépôt ; seules leurs couleurs et textures dérivées
  sont embarquées.
- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).

## 4. Décisions

- 2026-11-04 : la création est **une commande hors marche**, pas une fonction de l'application.
- 2026-11-04 : photos de Panoramax puis Mapillary, **et** photos fournies par le demandeur.
- 2026-11-04 : on tire des photos les **couleurs et les matériaux**, comme pour le souk.
- 2026-11-04 : on bâtit la commande **avant** les trois villes, qui seront créées avec elle.
- 2026-11-04 : sans photo près du tracé, **repli sur les photos du quartier voisin** (jusqu'à 1 km du tracé), puis sur la palette
  de la région.
- 2026-11-04 : pas de relecture sur captures avant embarquement, pas de vérification propre à la commande.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — état des lieux** [AI] : relever ce qui est propre à une ville dans `app/scripts/cities.ts`, les scripts `extract:*`, les
  tracés de boucle et la chaîne `materials-*` ; mesurer la couverture photo des quatre quartiers à 30 m et à 1 km.
  Sortie : un relevé chiffré, une conception de la commande.
- **Lot 2 — extraction et tracé** [AI] : la commande produit extrait et boucle pour une ville décrite par ses données.
  Sortie : les quatre extraits reproduits à l'identique, tests verts.
- **Lot 3 — photos, couleurs, textures** [AI] : la commande lance la chaîne photos → couleurs → textures avec élargissement
  puis repli, et écrit le rapport de provenance. Sortie : bibliothèque de matériaux d'au moins un quartier, tests verts.
- **Lot 4 — remplacement et doc** [AI] : retirer les entrées et scripts propres à chaque ville, documenter la commande
  (`docs/architecture.md`, `docs/features.md`, `docs/guide-utilisateur.md`). Sortie : CI verte.
- **Lot 5 — jugement au casque** [human] : juger couleurs et matériaux, reporté à la séance groupée
  (`docs/intentions/seance-casque-parcours.md`).

## 7. Reprise

- **Dernier état** (2026-11-04) : lots 1 à 4 faits, tests verts à 100 % de couverture ; lot 5 (jugement au casque) à faire par l'humain.
- **Travail non commité** : aucun une fois le commit fait.
- **Prochaine étape** : essai réseau réel (`docs/intentions/essai-commande-creation-reseau.md`) et inscription d'une ville créée (`docs/intentions/inscrire-une-ville-creee.md`).
