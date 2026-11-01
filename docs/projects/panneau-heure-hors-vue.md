# Chantier : corriger le panneau d'infos dont l'heure sort de la vue

**Statut** : cadré le 2026-11-01.
**Risque** : HIGH
**Maturité** : prêt

<!-- scope
files:
  - app/src/xr/pose.ts
  - app/src/xr/pose.test.ts
  - app/src/xr/hud-panel.ts
  - app/src/xr/hud-panel.test.ts
  - app/e2e/champ-de-vision.test.ts
  - app/e2e/panneau-discret.test.ts
  - docs/contracts.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/architecture.md
  - docs/intentions/*
  - app/AGENTS.md
  - .drwil/ia-first.json
-->

## 1. Besoin

Défaut révélé à l'essai au Quest 3 du chantier `panneau-discret` (2026-11-01) : « on voit que l'heure c'est hors vue ». Le panneau
est posé à 40° du regard côté choisi, 1,1 m devant et 0,35 m sous les yeux, et fait 0,5 m de large (`app/src/xr/pose.ts`). L'heure
est en haut à droite du panneau (`app/src/xr/hud-panel.ts`, texte aligné à droite). Hypothèse de cause, non mesurée : avec le
panneau à droite, son bord extérieur est à environ 53° du regard (40° + la demi-largeur vue de 1,1 m), plus environ 18° vers le
bas, donc au bord ou au-delà du champ de vision du Quest 3 ; l'heure, alignée à droite, y est. À gauche, l'heure serait au
bord intérieur, donc visible.

Ce chantier reproduit le défaut avec l'outil de `docs/projects/journal.md` (à livrer avant), le prouve, puis
règle la place et le contenu du panneau sur cette simulation, pour que tout son texte reste dans la vue des deux côtés.

## Critères d'acceptation

- Le panneau d'infos (ses quatre coins et chacune de ses cellules de texte, l'heure comprise) reste tout entier dans le champ de
  vision de la cible, marge comprise, côté droit comme côté gauche, pour une tête droite, tournée et inclinée dans les limites
  où le panneau est affiché ; le test a été vu échouer sur le code actuel (l'heure hors vue à droite) avant la correction
  — `APP-005`
- Le panneau reste hors de la zone tapis, fondu tête baissée, masqué par le bouton B et caché sans pose de la tête, comme avant
  [humain] — `APP-001`
- La lisibilité du texte, le confort de la place et l'heure bien visible sans tourner la tête sont jugés sur un vrai Quest 3
  [humain] — `APP-001`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec le masque de champ de vision, les deux côtés — `QUA-020`

## Contrats créés

- `APP-005` — le panneau d'infos du casque reste dans le champ de vision du casque, marge comprise, texte compris.
  **Origin** : panneau-heure-hors-vue — « tout le panneau, l'heure comprise, reste dans le champ de vision des deux côtés ».
  Test nommé par l'ID, contrôle propre déclaré dans `.drwil/ia-first.json`. Les critères automatiques citent `APP-005` et non
  `APP-001` : `APP-001` est attesté par un humain, et `drwil verify` rejette (« not-durable — APP-001 is attested by a human »)
  un critère testé par machine qui le cite (défaut de drwil à signaler, pas à contourner ici).

## Contrats modifiés

- `APP-001` — point (5) : « décalé de 40° sur le côté choisi » et « 0,35 m sous les yeux » sont les valeurs actuelles ; la
  correction peut les changer (et la place de l'heure dans le panneau), sans toucher au reste (fondu, zone tapis, fond sombre à
  70 %, 4,5:1, 5 m). Valeurs exactes décidées par l'agent avec `APP-005`. L'attestation d'`APP-001` sera à refaire par le
  demandeur après l'essai au casque (approuvé le 2026-11-01).
- `QUA-020` — le chemin 15 (côté du panneau) est rejoué avec le masque de champ de vision.

## 2. Hors périmètre

- L'outil de simulation lui-même : `docs/projects/journal.md`, livré avant ; ce chantier s'en sert sans le modifier
  (sauf pour y ajouter l'e2e du panneau, app/e2e/champ-de-vision.test.ts).
- Lisser le panneau (sa distance change par pas de 2 cm quand la tête bouge) et ses commandes :
  `docs/intentions/essai-casque-commandes-panneau.md`.
- Un autre contenu pour le panneau (allure, progression) : `docs/projects/tableau-allure-progression.md`, qui vient après.
- Le rendu de la ville, le fond du panneau, son opacité.

## 3. Contraintes

- Suivre la recette `docs/recipes/corriger-un-defaut.md` : le test d'`APP-005` sur le vrai panneau est écrit d'abord, vu
  échouer pour la bonne raison (l'heure hors vue à droite), noté au journal, puis la correction, au plus près de la cause
  (app/src/xr/pose.ts, app/src/xr/hud-panel.ts), sans autre changement dans le même commit.
- Les pistes de correction (angle moins grand, panneau plus petit ou plus près, heure à l'intérieur du panneau, texte
  recentré) sont à l'agent, qui garde celle que le test valide avec le moins de changement ; la zone tapis, le fondu tête baissée
  et le masquage par le bouton B ne régressent pas (`APP-001`).
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Rappel du coût : un seul commit de code, car chaque commit sur `app/**` relance les e2e.

## 4. Décisions

- 2026-11-01, demande du demandeur (essai au casque) : l'heure doit être visible ; régler le panneau sur la simulation du champ
  de vision plutôt qu'à l'essai, puis juger au casque.
- À lancer **après** `champ-de-vision-casque`, qui fournit la cible, la marge et la projection. Touche `app/src/xr/pose.ts` et
  app/src/xr/hud-panel.ts comme `tableau-allure-progression` et `carte-position-casque` : à lancer avant eux.
- Contrats concernés : `APP-001`, `APP-005`, `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : la modification d'`APP-001` est approuvée le 2026-11-01, voir « Contrats modifiés »)*

## 6. Lots

- **Lot 1 — reproduire** [AI] : écrire le test d'`APP-005` sur le vrai panneau (`app/src/xr/pose.test.ts`,
  app/src/xr/hud-panel.test.ts, app/e2e/champ-de-vision.test.ts), le voir échouer, noter l'échec et la cause mesurée (l'hypothèse du
  besoin se confirme ou non). Sortie : test rouge pour la bonne raison, noté.
- **Lot 2 — corriger** [AI] : régler la place et le contenu du panneau jusqu'à ce que le test passe, des deux côtés. Sortie :
  `run-checks` vert, un seul commit de code.
- **Lot 3 — contrats et doc** [AI] : `APP-005`, `APP-001` (point 5), `QUA-020`, docs/features.md, docs/guide-utilisateur.md,
  architecture, notice de l'agent. Sortie : `run-checks` vert.
- **Lot 4 — essai réel** [human] : juger l'heure, la lisibilité et le confort sur le Quest 3, puis `drwil attest APP-001`.

## 7. Reprise

- **Dernier état** (2026-11-01) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche docs/fiches-champ-de-vision.
- **Prochaine étape** : [AI] lot 1, une fois `champ-de-vision-casque` fusionné.
