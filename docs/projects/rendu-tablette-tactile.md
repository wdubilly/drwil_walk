# Chantier : la tablette et le tactile

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/rendu-tablette-tactile.md`

<!-- scope
files:
  - app/src/pc/touch.ts
  - app/src/pc/touch.test.ts
  - app/src/pc/touch-controls.ts
  - app/src/pc/touch-controls.test.ts
  - app/src/pc/input.ts
  - app/src/pc/input.test.ts
  - app/src/pc/enter-pc.ts
  - app/src/pc/look.ts
  - app/src/pc/look.test.ts
  - app/src/ui/home.css
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
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

Ouvrir l'application sur une tablette, dans un navigateur : la même marche que la version PC, commandée au toucher
(vitesse, pause, recalage, regard), avec une interface adaptée à la taille de l'écran. La tablette ne remplace pas le casque.

## Critères d'acceptation

- Sur un écran tactile, des boutons à l'écran règlent la vitesse, mettent en pause et recalent la marche, avec les mêmes
  calculs que la version PC — `APP-007`
- Glisser un doigt sur la scène oriente le regard, comme la souris ; relâcher le doigt arrête le mouvement du regard —
  `APP-007`
- L'accueil et le panneau d'infos restent lisibles et utilisables sur un petit écran (cibles tactiles assez grandes, rien de
  coupé) — `APP-007`
- Le tableau de bord s'affiche en surimpression à l'écran (HTML de la page), pas dans la scène — `APP-007`
- La version PC au clavier et à la souris marche comme avant — `APP-002`
- La marche tactile est rejouée de bout en bout dans un navigateur en émulation tactile — `QUA-020`
- L'essai sur une vraie tablette [human] — `APP-001`

## Contrats modifiés

- `APP-002` — ancien critère : « le rendu Google 3D, la minicarte, le panneau flottant, la manette de jeu, le tactile et le choix
  de la rue aux carrefours n'y existent pas » (version PC) — raison : le tactile (boutons à l'écran et glisser pour regarder)
  existe désormais sur la version PC ouverte sur tablette (approuvé le 2026-11-03)

## 2. Hors périmètre

- Pincer pour régler la vitesse et le regard au gyroscope : refusés par le demandeur (2026-11-03).
- Un appareil précis (iPad, Android) : l'e2e tourne en émulation tactile Chromium ; l'essai sur appareil est humain.
- La minicarte à l'écran si elle n'existe pas encore dans la page : voir `docs/intentions/carte-position-en-direct.md`.
- Le casque : aucune règle de la réalité mixte (fondu, zone tapis, vignette) ne change.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; sans passthrough, `APP-001` ne s'applique pas à la tablette, comme pour le PC.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`), un module pur a son test à côté
  (`QUA-006`).
- Texte à l'écran en français ; contraste conforme (`QUA-014`).

## 4. Décisions

- 2026-11-03 : gestes = **boutons à l'écran (vitesse, pause, recalage) + glisser pour regarder**.
- 2026-11-03 : **aucun appareil précis** visé ; essai humain à planifier.
- 2026-11-03 : minicarte et tableau de bord **en surimpression à l'écran** (HTML), pas dans la scène.

## 5. Points à trancher

- [human] L'essai sur une vraie tablette (appareil, navigateur) : à planifier.

## 6. Lots

- **Lot 1 — entrée tactile pure** [AI] : app/src/pc/touch.ts (à créer) convertit glisser et appuis en commandes de marche, avec ses tests.
  Critère de sortie : tests verts, couverture 100 %.
- **Lot 2 — boutons à l'écran et branchement** [AI] : app/src/pc/touch-controls.ts (à créer), branché sur `app/src/pc/input.ts` et
  `app/src/pc/enter-pc.ts`.
  Critère de sortie : le clavier et la souris marchent comme avant.
- **Lot 3 — interface petit écran** [AI] : accueil et panneau adaptés (`app/src/ui/home.css`, `app/src/ui/panel.ts`). Critère de sortie : e2e
  en émulation tactile.
- **Lot 4 — documentation et essai** [AI] : docs, contrat `APP-007`, intention d'essai sur tablette.

## 7. Reprise

- **Dernier état** (2026-11-03) : lots 1 à 4 faits ; boutons, glisser et interface petit écran livrés, e2e tactile (`app/e2e/tablette-tactile.test.ts`) ; `APP-007` créé, `APP-002` modifié.
- **Travail non commité** : voir `git status` (commit de clôture à faire).
- **Prochaine étape** : [human] l'essai sur une vraie tablette (`docs/intentions/essai-tablette-tactile.md`).
