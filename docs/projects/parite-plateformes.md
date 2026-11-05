# Chantier : la même ville et les mêmes options sur Quest, PC et tablette, garanties par un contrat

**Statut** : cadré le 2026-11-05.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/parite-plateformes.md`, `docs/intentions/generateur-ville-complet.md`

<!-- scope
files:
  - app/src/pc/*
  - app/src/pc/*.test.ts
  - app/src/xr/*
  - app/src/xr/*.test.ts
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/src/ui/*
  - app/e2e/*
  - app/AGENTS.md
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/recipes/*
  - docs/intentions/*
-->

## 1. Besoin

Les trois plateformes (Quest 3, PC, tablette) doivent afficher la **même ville** avec les **mêmes options de l'accueil**
(matériaux, lampadaires, ville vivante, arbres), et toute évolution doit valoir pour les trois (décision du demandeur,
2026-11-05). Rien ne le garantit aujourd'hui : les entrées sont distinctes (`app/src/xr/experience.ts`,
`app/src/pc/enter-pc.ts`) et aucun test ne compare ce que chacune lit de l'accueil.

## Constat de départ (lecture du 2026-11-05, à confirmer par le test)

- Matériaux, arbres, profil, brouillard et sons : lus par les deux entrées.
- Lampadaires et ville vivante : lus dans la case de l'accueil par `createSouqScene` (`app/src/city/souq.ts`), commune aux
  trois modes ; aucun écart apparent.
- Écart connu : le rendu Google 3D est indisponible sur PC et tablette (`PC_GOOGLE_NOTICE`), avec repli annoncé.
- Propres au casque : panneau d'infos, côté du panneau, opacité, vignette, passthrough.

## Critères d'acceptation

- Un **contrat `APP-015`** (« les trois plateformes montrent la même ville ») est ajouté à `docs/contracts.md`, avec la liste
  fermée de ce qui peut différer : commandes, passthrough (sécurité-visibilité), ciel, profils par défaut — `QUA-011`
- Un **test unique**, paramétré sur les trois modes (casque, PC, tablette), échoue quand une option de l'accueil qui agit sur
  la ville (matériaux, lampadaires produits, lampadaires allumés, ville vivante, arbres) n'atteint pas la scène d'un mode ;
  le test porte l'ID `APP-015` — `QUA-029`
- Le même test, pour une même ville et les mêmes options, vérifie que les trois scènes contiennent les mêmes éléments de ville
  (bâtiments, arbres, mobilier, lampadaires, figurants) — `APP-015`
- Une option qui n'atteint pas un mode est **corrigée** dans ce chantier ; l'écart du rendu Google 3D reste déclaré et testé
  comme exception (repli annoncé) — `APP-015`
- `APP-001` reste vérifié sur le casque, inchangé — `APP-001`
- La recette de chantier (`docs/recipes/`) et `app/AGENTS.md` disent : toute fonction d'accueil se vérifie sur les trois
  modes ; `docs/features.md` et `docs/architecture.md` listent ce qui est propre à chaque plateforme — `QUA-011`

## Contrats modifiés

- Nouveau : `APP-015`. Les contrats existants ne changent pas.

## 2. Hors périmètre

- Offrir le rendu Google 3D sur PC et tablette.
- Toute évolution du rendu, des commandes ou de la sécurité-visibilité.
- Le catalogue de promenades et les arbres comme moteur générique (intention du générateur).

## 3. Contraintes

- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Le test tourne sans transformation de Vite et sans casque réel (émulation WebXR, IWER, comme les e2e existants).
- Tout chantier touchant `app/` est HIGH.

## 4. Décisions

- 2026-11-05 : la règle est un **contrat testé** (pas seulement un critère de fiche).
- 2026-11-05 : seules différences admises : commandes, passthrough au casque, ciel, profils par défaut.
- 2026-11-05 : on pose la règle d'abord ; l'écart actuel est révélé par le test, puis corrigé.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — le contrat et son test** [AI] : `APP-015` dans `docs/contracts.md`, test paramétré sur les trois modes. Sortie :
  le test tourne et liste les écarts réels.
- **Lot 2 — correction des écarts** [AI] : chaque option qui n'atteint pas un mode est branchée. Sortie : test vert.
- **Lot 3 — docs et recette** [AI] : `app/AGENTS.md`, recette, `docs/features.md`, `docs/architecture.md`. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-05) : cadrage seul, aucun code écrit.
- **Travail non commité** : cette fiche et l'index.
- **Prochaine étape** : lot 1 une fois le chantier lancé par le demandeur.
