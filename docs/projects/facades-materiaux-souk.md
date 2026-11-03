# Chantier : les matériaux locaux du souk, d'après des photos de rue

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/identite-visuelle-quartiers.md`

<!-- scope
files:
  - app/scripts/panoramax*.ts
  - app/scripts/materials*.ts
  - app/src/city/material*.ts
  - app/src/city/facades.ts
  - app/src/city/facades.test.ts
  - app/src/ui/render-choice.ts
  - app/src/ui/render-choice.test.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/assets/materials/*
  - app/assets/PROVENANCE.md
  - app/e2e/materiaux-souk.test.ts
  - app/package.json
  - app/package-lock.json
  - app/src/city/souq.ts
  - app/src/city/souq.test.ts
  - app/src/xr/experience.ts
  - app/src/pc/enter-pc.ts
  - .drwil/ia-first.json
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/preuves/materiaux-souk.md
  - docs/intentions/*
-->

## 1. Besoin

Les façades du souk sont des couleurs par sommet sans texture : elles ne rendent ni l'enduit ocre, ni la pierre, ni le bois
du quartier. Le demandeur veut retrouver l'**identité visuelle locale** (couleurs, matériaux, aspect de surface), sans
reproduire chaque bâtiment, en s'appuyant sur des photos de rue géolocalisées comme références. Ce chantier est le
prototype, limité à Souq Waqif, à valider avant toute généralisation aux autres quartiers.

## Critères d'acceptation

- L'inventaire Panoramax du souk (photos à moins de 30 m du tracé : identifiant, position, cap, date, auteur, licence, URL)
  est publié dans la preuve du chantier, couverture réelle dite ; repli sur Mapillary si Panoramax ne suffit pas, sans
  jeton dans le dépôt — `SEC-007`
- Les couleurs dominantes des façades sont tirées des photos par un script de préparation (hors casque), relues par le
  demandeur [human] — `APP-012`
- La bibliothèque de matériaux du souk (enduit, pierre, bois…) est faite de textures PBR **CC0** recolorées d'après ces
  couleurs, embarquées avec leur provenance (`app/assets/PROVENANCE.md`) ; aucun appel réseau pendant la marche — `APP-012`
- Le rendu « matériaux locaux » se choisit à l'accueil pour le souk seulement ; les autres itinéraires et le rendu par
  défaut restent inchangés — `APP-012`
- Le code est **générique** : scripts et rendu prennent l'itinéraire en paramètre, la bibliothèque de matériaux est une
  donnée par quartier ; étendre à un autre quartier = ses données et son activation, sans code propre au souk — `APP-012`
- Les matériaux varient de façon déterministe (teinte, échelle, usure) pour éviter la répétition entre voisins, sur les
  familles de façades existantes — `APP-008`
- Tête baissée, la ville texturée s'efface comme le reste (opacité 0 %) — `APP-001`
- Textures compressées pour le Quest 3, dans un budget mesuré par le diagnostic de rendu ; le profil « performance » les
  retire — `APP-006`
- Le rendu jugé sur un vrai Quest 3 avant généralisation [human] — `APP-012`

## Contrats modifiés

*(aucun ; `APP-012` est créé par ce chantier, origine : facades-materiaux-souk — « Le rendu matériaux locaux se choisit à
l'accueil pour le souk seulement »)*

## 2. Hors périmètre

- Les trois autres quartiers et le rendu par défaut : après validation du prototype par le demandeur.
- Les palettes par région (`docs/projects/facades-regions.md`), qui pourront ensuite reprendre ces couleurs.
- Plaquer des photos sur les bâtiments, reproduire un bâtiment précis, afficher des photos pendant la marche.
- Ajouter des balises aux extraits figés de `app/data/` (`APP-003`).
- Les monuments glTF (`docs/intentions/facades-textures-monuments.md`).

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Réseau (Panoramax, Mapillary) uniquement dans les scripts de préparation, jamais dans le casque.
- Seules des textures CC0 entrent dans le dépôt ; les photos ne sont citées que par lien et identifiant, avec auteur et
  licence.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`), e2e du nouveau chemin (`QUA-020`).

## 4. Décisions

- 2026-11-03 : priorité **P2**, avant `facades-regions`.
- 2026-11-03 : la décision « façades sans texture » est **levée pour ce prototype**.
- 2026-11-03 : textures **CC0 recolorées** d'après les photos, pas d'échantillons découpés dans les photos.
- 2026-11-03 : Panoramax d'abord, **Mapillary en secours** (jeton du demandeur, jamais dans le dépôt).
- 2026-11-03 : couleurs relevées par un **script de préparation**, relu par le demandeur.
- 2026-11-03 : prototype sous forme d'une **option de rendu choisie à l'accueil**, souk seulement.
- 2026-11-03 : prototype sur le souk, mais **développement générique** (paramétré par itinéraire, comme `CITIES`) : seules
  les données et l'activation sont propres au souk.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — inventaire** [AI] : script Panoramax (repli Mapillary), relevé publié dans la preuve. Sortie : couverture dite.
- **Lot 2 — couleurs et bibliothèque** [AI] : couleurs dominantes, textures CC0 choisies, recolorées, compressées, avec
  provenance. Sortie : tests verts, relecture des couleurs par le demandeur [human].
- **Lot 3 — rendu** [AI] : option à l'accueil, matériaux sur les familles de façades, variation, effacement tête baissée,
  profil « performance ». Sortie : tests et e2e verts, budget mesuré.
- **Lot 4 — jugement au casque** [human] : séance groupée (`docs/intentions/seance-casque-parcours.md`).

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : lot 1, l'inventaire.
