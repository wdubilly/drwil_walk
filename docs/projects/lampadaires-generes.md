# Chantier : des lampadaires produits par règle le long des rues

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/lampadaires-generes.md`

<!-- scope
files:
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/src/render/*
  - app/src/ui/*
  - app/e2e/*
  - .drwil/ia-first.json
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
-->

## 1. Besoin

Les quatre quartiers ne portent aucun lampadaire et n'en porteront jamais par extraction : `highway=street_lamp` était déjà
demandé le 2026-10-31 et OpenStreetMap n'en contient aucun à Pune ni à Doha sur ces emprises. Une rue sans le moindre mât
paraît vide. Il faut donc les produire par règle, sans jamais faire passer l'inventé pour du réel.

## Critères d'acceptation

- Les lampadaires produits suivent les rues, avec un intervalle qui dépend de la classe de voie (`highway`) et non d'une
  constante unique — `APP-012`
- L'espacement n'est jamais mécaniquement régulier : un écart tiré d'une graine stable le fait varier — `APP-012`
- Le même quartier donne toujours les mêmes lampadaires, promenade après promenade (graine dérivée de l'identifiant de la
  voie) — `APP-012`
- Aucun lampadaire ne tombe dans une emprise de bâtiment, sur un trottoir trop étroit, ni à moins de 2 m d'un autre objet —
  `APP-012`
- Les objets issus d'OpenStreetMap sont posés les premiers et ne sont jamais écartés au profit d'un objet produit —
  `APP-012`
- Chaque objet porte sa provenance (`source`), et un relevé dit combien viennent d'OpenStreetMap et combien sont produits —
  `APP-003`
- Les lampadaires produits ont leur propre plafond, réglé par profil graphique, distinct de celui du mobilier — `APP-006`
- Un réglage éteint les lampadaires produits et ne laisse que le mobilier réel ; ils sont visibles par défaut — `APP-012`
- Les lampadaires s'effacent comme le reste de la ville tête baissée — `APP-001`
- Les images par seconde avant et après sur un vrai Quest 3 [human] — `APP-001`

## Contrats modifiés

- `APP-012` (nouveau) : le mobilier produit par règle — placement, reproductibilité, priorité du réel, provenance.

## 2. Hors périmètre

- **Un lampadaire qui éclaire réellement** (une source lumineuse par mât) : bien plus coûteux qu'un objet posé, cela relève
  de `docs/intentions/rendu-eclairage-ambiance.md`.
- Produire par règle des poubelles ou des panneaux : à décider plus tard, après cette première règle.
- La réextraction des quartiers (`docs/projects/extraction-mobilier.md`).

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Budgets provisoires du casque (`docs/projects/rendu-lod-cellules.md`) : 150 appels de rendu et 500 000 triangles par
  image. Le modèle de lampadaire pèse **72 triangles** et le mobilier est fusionné en un seul maillage : 300 lampadaires
  coûtent environ 21 600 triangles et **aucun appel de rendu supplémentaire**. Ces chiffres sont calculés, pas mesurés au
  casque.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).

## 4. Décisions

- 2026-11-03 : stratégie de placement retenue — intervalle par classe de rue (voie passante 25-30 m, rue de quartier
  35-40 m, ruelle 15-20 m), écart de ±20 % tiré d'une graine dérivée de l'identifiant de la voie, côté de rue choisi par
  tronçon et non objet par objet, trois refus (bâtiment, trottoir trop étroit, objet à moins de 2 m).
- 2026-11-03 : **plafond séparé des objets produits, réglé par profil graphique**, pour que le mobilier d'OpenStreetMap ne
  soit jamais évincé par du mobilier inventé.
- 2026-11-03 : lampadaires produits **visibles par défaut**, avec **un réglage pour les éteindre**.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — provenance** [AI] : champ `source` sur `Prop`, relevé OpenStreetMap contre produit, contrat `APP-012` écrit.
  Sortie : tests verts.
- **Lot 2 — placement** [AI] : intervalle par classe de rue, écart tiré d'une graine, côté par tronçon, les trois refus.
  Sortie : tests verts.
- **Lot 3 — plafond et réglage** [AI] : plafond par profil, réglage d'extinction, e2e, documentation. Sortie : CI verte.
- **Lot 4 — jugement au casque** [human] : densité, hauteur et crédibilité en marchant, images par seconde. Reporté à la
  séance groupée (`docs/intentions/seance-casque-parcours.md`).

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : lot 1, la provenance des objets.
