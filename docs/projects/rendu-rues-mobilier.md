# Chantier : des rues, trottoirs et mobilier urbain crédibles

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/rendu-rues-mobilier.md`

<!-- scope
files:
  - app/scripts/osm-tags.ts
  - app/scripts/extract-souq.ts
  - app/data/*
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/src/render/*
  - app/e2e/*
  - .drwil/ia-first.json
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
  - README.md
-->

## 1. Besoin

Du mobilier urbain crédible à hauteur d'homme, posé là où les données le disent : lampadaires et bancs d'abord, puis
poubelles et panneaux, avec des marquages au sol, des passages piétons et des bordures ensuite. Échelle crédible, raccords
propres, rien de flottant ni de posé au hasard.

## Critères d'acceptation

- Les lampadaires et les bancs sont posés d'après les balises OpenStreetMap des extraits, au sol, à l'échelle réelle ;
  aucun n'est inventé quand les données n'en portent pas — `APP-009`
- Le mobilier courant (bancs, poubelles, lampadaires, panneaux) est généré par code ; un élément particulier ou remarquable
  peut venir d'un modèle glTF CC0 dont la licence et la provenance sont documentées — `APP-003`
- Les passages piétons, bordures et marquages sont posés d'après les balises de voie des extraits ; une balise absente ne
  produit rien — `APP-009`
- Le mobilier se règle par le profil graphique (densité réduite en « performance ») et reste plafonné — `APP-009`
- Rien de ce mobilier ne masque le réel visible : tête baissée, la ville s'efface — `APP-001`
- La marche se rejoue sur les quatre itinéraires avec le mobilier, sans erreur WebGL — `QUA-020`
- La crédibilité du mobilier à hauteur d'homme sur un vrai Quest 3 [human] — `APP-009`

## Contrats modifiés

*(aucun : le mobilier enrichit la ville sans changer le parcours ni la sécurité)*

## 2. Hors périmètre

- Les façades (`docs/projects/rendu-facades-batiments.md`) et l'éclairage des lampadaires comme source de lumière
  (`docs/intentions/rendu-eclairage-ambiance.md`).
- Une nouvelle extraction des données : si les balises manquent, ce manque est écrit dans la fiche, pas contourné.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Tout modèle glTF documente sa licence et sa provenance (`app/src/city/licence.ts`, `APP-003`).
- Dépend des profils graphiques (`docs/projects/journal.md`).

## 4. Décisions

- 2026-11-03 : ordre des éléments : **lampadaires et bancs d'abord**, puis passages, bordures et marquages.
- 2026-11-03 : mobilier courant **généré par code** ; **glTF CC0** pour les éléments particuliers ou remarquables.

## 5. Points à trancher

- [human] Les éléments remarquables en glTF (lesquels, quelle source CC0).
- [human] Le rendu du mobilier sur un vrai Quest 3.

## 6. Lots

- **Lot 1 — lecture des balises** [AI] : inventorier les balises de mobilier et de voie des quatre extraits ; l'écrire dans la
  fiche. Sortie : relevé chiffré.
- **Lot 2 — lampadaires et bancs** [AI] : générés par code, plafonnés, posés au sol. Sortie : tests verts.
- **Lot 3 — passages, bordures, marquages** [AI] : d'après les balises. Sortie : tests verts, couverture 100 %.
- **Lot 4 — profils, e2e et doc** [AI] : réglage par profil, e2e, docs. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [AI] lot 1, après les profils graphiques.
