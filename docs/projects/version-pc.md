# Chantier : une version PC de l'appli, sans casque

**Statut** : cadré le 2026-11-01.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/poste-sans-casque.md`

<!-- scope
files:
  - app/src/pc/*
  - app/src/xr/*
  - app/src/main.ts
  - app/src/main.test.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/ui/home.css
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
  - app/e2e/*
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
  - README.md
-->

## 1. Besoin

Le demandeur veut **une version PC de l'appli**, utilisable sans casque. Aujourd'hui l'accueil s'ouvre dans un navigateur
de bureau, mais marcher exige une session WebXR `immersive-ar` ; sans WebXR, l'échec s'affiche et rien d'autre. La version PC
donne la même marche (même ville, même parcours, même vitesse) dans un canvas ordinaire de la page.

## Critères d'acceptation

- À l'accueil, un bouton « Version PC » lance la marche dans un canvas de la page, sans session WebXR : même ville, même
  parcours et même vitesse que dans le casque — `APP-002`
- La version PC se pilote au clavier et à la souris : pause et reprise, vitesse plus et moins dans la plage de 1 à 8 km/h,
  recalage du parcours, masquage du panneau, regard à la souris ; une pression ne déclenche qu'une action — `APP-002`
- Les itinéraires figés et le trajet libre marchent en version PC, le trajet libre s'arrête à l'arrivée en le disant — `APP-002`
- Un navigateur sans WebXR peut lancer la version PC : l'échec de la réalité mixte reste dit pour le bouton du casque, il ne
  bloque plus l'application — `QUA-002`
- Le bouton du casque continue d'ouvrir une session `immersive-ar` avec le fondu tête baissée, la zone tapis et la vignette ;
  la version PC n'ouvre jamais de session WebXR et ne les applique pas, faute de passthrough ni de tapis — `APP-001`
- Le parcours est rejoué de bout en bout dans Chromium en version PC, sans émulation WebXR — `QUA-020`

## Contrats modifiés

- `APP-001` — la règle est écrite « en réalité mixte » : elle précise que la version PC, sans passthrough ni tapis, n'est
  pas concernée, et que le casque garde tout inchangé (à approuver à la validation de cette fiche).
- `APP-002` — la marche suit le parcours aussi dans la version PC, au clavier et à la souris (à approuver à la validation de
  cette fiche).
- `QUA-020` — chemin e2e de la version PC, sans émulation WebXR.

## 2. Hors périmètre

- La minicarte (`docs/projects/carte-position-casque.md`), la manette de jeu, le tactile et le mobile.
- Le rendu Google 3D en version PC, le panneau d'infos flottant du casque (la page garde son panneau de marche) et le
  recalage à la manette.
- Un mode sécurité pour la version PC : elle n'a pas de tapis ni de réel à protéger, rien n'y remplace `APP-001`.

## 3. Contraintes

- `APP-001` ne régresse pas pour le casque : le chemin WebXR existant n'est pas modifié dans son comportement, et la version
  PC ne peut pas être prise pour lui (bouton distinct, aucun fondu ni zone appliqués par erreur).
- Réutiliser la ville, la marche et les itinéraires existants : pas de seconde copie de la logique du parcours (`APP-002`).
- Une seule couche, `app/`. Un canvas de la page rendu par three.js ; aucun changement de pile.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-11-01, décision humaine du demandeur : une version PC de l'appli, sans casque.
- 2026-11-01, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : les touches, la sensibilité de la
  souris, le point de vue, le découpage entre un nouveau dossier pc et `app/src/xr/`.
- À lancer après `panneau-discret` et `ambiance-cartoon` : tous touchent `app/src/main.ts` et la page d'accueil, jamais en
  même temps.
- Contrats concernés : `APP-001`, `APP-002`, `QUA-001`, `QUA-002`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : les commandes sont des choix techniques ; la minicarte et la manette de jeu sont reportées)*

## 6. Lots

- **Lot 1 — rendu et caméra** [AI] : le canvas de la page, la ville et le parcours, la caméra qui suit le parcours et le
  regard à la souris. Sortie : `run-checks` vert.
- **Lot 2 — commandes et accueil** [AI] : clavier, bouton « Version PC », échec WebXR non bloquant. Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : e2e en Chromium sans WebXR, docs, contrats à jour. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-01) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/retours-carte-poste`.
- **Prochaine étape** : [AI] lot 1.
