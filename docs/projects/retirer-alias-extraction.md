# Chantier : retirer les alias d'extraction par ville

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/retirer-alias-extraction.md`

<!-- scope
files:
  - app/scripts/extract-pune.ts
  - app/scripts/extract-corniche.ts
  - app/scripts/extract-fc-road.ts
  - app/scripts/cities.ts
  - app/src/city/extract-pune.test.ts
  - app/src/city/extract-corniche.test.ts
  - app/src/city/extract-fc-road.test.ts
  - app/src/city/cities-extract.test.ts
  - app/AGENTS.md
  - docs/contracts.md
  - docs/architecture.md
  - docs/intentions/*
-->

## 1. Besoin

Depuis le chantier `extraction-generique`, `app/scripts/extract-pune.ts`, `app/scripts/extract-corniche.ts` et
`app/scripts/extract-fc-road.ts` ne sont que des alias de `app/scripts/cities.ts`. Ils ne survivent que parce que leurs
trois tests (`app/src/city/extract-*.test.ts`) les importent. Les retirer finit la généralisation : un seul test, paramétré
sur `CITIES`, vérifie chaque ville.

## Critères d'acceptation

- Les trois alias n'existent plus : toute ville s'extrait par `extractCity` et `CITIES`, sans fichier par ville — `APP-003`
- Un seul test paramétré sur `CITIES` remplace les trois tests par ville et garde leurs vérifications : requête Overpass
  construite sur l'emprise de la ville, identification (`User-Agent`) de la ville, repères de la ville dans l'emprise —
  `APP-003`
- Le test du souk (`app/src/city/extract-souq.test.ts`) reste tel quel, et les commandes `npm run extract*` fonctionnent comme avant —
  `APP-003`
- La couverture reste à 100 % sans aucune exclusion — `QUA-004`
- `app/AGENTS.md`, `docs/architecture.md` et le contrat `APP-003` ne citent plus les alias — `QUA-011`

## Contrats modifiés

- `APP-003` — ancien critère : sa **Source of truth** et ses **Tests** citent `app/scripts/extract-pune.ts`,
  `app/scripts/extract-corniche.ts`, `app/scripts/extract-fc-road.ts` et leurs trois tests — raison : ces fichiers sont
  retirés, `app/scripts/cities.ts` et le test paramétré les remplacent ; la règle elle-même ne change pas (approuvé le
  2026-11-03)

## 2. Hors périmètre

- Retirer `app/scripts/extract-souq.ts` : il porte la requête et la conversion en GeoJSON, il reste.
- Modifier la conversion, les emprises ou les extraits `app/data/*` : aucun extrait n'est réextrait.
- Ajouter une ville.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Vitest ne lit que `app/src/` et la racine : le test paramétré vit sous `app/src/city/`.
- Le test paramétré garde les repères de chaque ville, actuellement dans les trois tests : Pune (Shaniwar Wada, temple
  Dagdusheth), Corniche (Musée d'art islamique, tours de West Bay), FC Road (carrefour sud, extrémité nord).
- Couverture à 100 % (`QUA-004`), un fichier de code sous 200 lignes (`QUA-001`).
- `docs/projects/corniche-west-bay.md` et `docs/projects/socle-app.md` citent encore le script de la Corniche dans leur
  périmètre : à relire si l'un des deux est lancé avant celui-ci.

## 4. Décisions

- 2026-11-03 : un seul test paramétré sur `CITIES` remplace les trois tests par ville, sans perdre la vérification de
  l'emprise ; `APP-003` est mis à jour dans ce chantier (sources et tests), son critère ne change pas — approuvé par le
  demandeur.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — test paramétré** [AI] : un test sur `CITIES` (nouveau fichier sous `app/src/city/`), les trois tests par ville
  supprimés. Sortie : tests verts, couverture à 100 %.
- **Lot 2 — retrait des alias** [AI] : les trois fichiers supprimés, `APP-003`, `docs/architecture.md` et
  `app/AGENTS.md` mis à jour. Sortie : `run-checks` vert, `GOVERNANCE: PASS`.

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : lot 1, le test paramétré.
