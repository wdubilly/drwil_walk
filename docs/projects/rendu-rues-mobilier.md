# Chantier : des rues, trottoirs et mobilier urbain crédibles

**Statut** : en cours depuis le 2026-11-03 (branche `workstream/rendu-rues-mobilier`), lots 1 à 4 faits.
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
- Rien de ce mobilier ne masque le réel visible : tête baissée, la ville s'efface [human] — `APP-001`
- La marche se rejoue sur les quatre itinéraires avec le mobilier, sans erreur WebGL — `QUA-020`
- Le mobilier est posé à hauteur d'homme, aux dimensions réelles, et tourné dans l'axe de sa rue — `APP-009`

Le jugement de crédibilité au casque sort des tests : il est porté par `docs/intentions/essai-casque-mobilier-urbain.md`.

## Contrats modifiés

- **APP-009** (nouveau, 2026-11-03) : mobilier urbain et marquages au sol posés d'après les balises OpenStreetMap, aux
  dimensions réelles, plafonnés et réglés par le profil ; les critères d'acceptation ci-dessus le citaient déjà. Le parcours
  et la sécurité ne changent pas (APP-001, APP-002 inchangés) ; APP-006 gagne le réglage `markings` et QUA-020 le chemin 24.

## 2. Hors périmètre

- Les façades (`docs/projects/journal.md`) et l'éclairage des lampadaires comme source de lumière
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

- **Lot 1 — lecture des balises** [AI] : fait le 2026-11-03. Relevé des quatre extraits figés (`app/data/`) :
  | Extrait | arbres | bancs | lampadaires | poubelles | panneaux | passages (`footway=crossing`) | trottoirs tracés (`footway=sidewalk`) | voies `sidewalk` |
  |---|---|---|---|---|---|---|---|---|
  | Souq Waqif | 155 | 19 | 0 | 0 | 0 | 31 | 0 | 0 |
  | Pune Vieille ville | 285 | 0 | 0 | 0 | 0 | 18 | 40 | 0 |
  | Doha Corniche | 513 | 8 | 0 | 0 | 0 | 104 | 18 | 8 (`right`) |
  | Pune FC Road | 105 | 0 | 0 | 0 | 0 | 30 | 69 | 1 (`left`) |
  Manques écrits, non contournés : **aucun lampadaire** dans les quatre extraits, et ni poubelle ni panneau (ces deux balises
  n'étaient pas demandées à Overpass avant ce chantier ; le code les lit désormais, les données attendent une nouvelle
  extraction, hors périmètre : `docs/intentions/extraction-mobilier-manquant.md`).
- **Lot 2 — lampadaires et bancs** [AI] : fait le 2026-11-03 (`app/src/city/furniture.ts` : lampadaire, banc, poubelle et
  panneau produits par code, aux dimensions réelles, posés au sol et tournés dans l'axe de la rue ; plafond de 400 pièces,
  maillage unique). Tests verts.
- **Lot 3 — passages, bordures, marquages** [AI] : fait le 2026-11-03 (`app/src/city/markings.ts` : bordures des trottoirs et
  lignes d'arrêt des passages, lues des balises de voie ; les passages piétons restent dans `app/src/city/walkways.ts`).
  Couverture de la couche à 100 %.
- **Lot 4 — profils, e2e et doc** [AI] : fait le 2026-11-03 (réglage `markings` par profil, e2e `app/e2e/mobilier-urbain.test.ts`
  chemin 24, contrat `APP-009` et contrôle `app-009`, docs `docs/features.md`, `docs/guide-utilisateur.md`,
  `docs/architecture.md`, `app/AGENTS.md`, `README.md`).

## 7. Reprise

- **Dernier état** (2026-11-03) : lots 1 à 4 faits ; contrôles locaux verts (Vitest, couverture 100 %, typage, lint, e2e du
  chemin 24 rejoué dans Chromium) ; reste les deux points [human] (glTF remarquable, rendu au casque), devenus des intentions.
- **Travail non commité** : aucun.
- **Prochaine étape** : [human] juger le mobilier au casque (`docs/intentions/essai-casque-mobilier-urbain.md`).
