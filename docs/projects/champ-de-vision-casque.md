# Chantier : simuler le champ de vision du casque pour juger ce qui reste dans la vue

**Statut** : cadré le 2026-11-01.
**Risque** : HIGH
**Maturité** : prêt

<!-- scope
files:
  - app/src/xr/fov.ts
  - app/src/xr/fov.test.ts
  - app/e2e/champ-de-vision.test.ts
  - docs/contracts.md
  - docs/architecture.md
  - docs/intentions/*
  - app/AGENTS.md
  - .drwil/ia-first.json
-->

## 1. Besoin

À l'essai au Quest 3 du chantier `panneau-discret` (2026-11-01), l'heure du panneau d'infos est hors de la vue. Aucun test ne
connaît le champ de vision du casque : le panneau a été posé à 40° sur le côté, 1,1 m devant et 0,35 m sous les yeux sans
que rien ne vérifie que son texte reste visible. Ce chantier donne à l'agent un outil pour juger, sans casque, si un objet
posé dans la scène reste dans la vue, afin qu'il règle lui-même une place sur cette simulation. Il ne corrige pas le panneau :
c'est `docs/projects/panneau-heure-hors-vue.md`, qui vient après.

## Critères d'acceptation

- Pour un champ de vision cible du Quest 3 (valeurs et marge déclarées en un seul endroit, sourcées), un calcul de
  projection dit si un point ou un rectangle posé dans la scène est dans la vue d'une tête donnée (position, cap, inclinaison),
  marge comprise ; il est juste sur des cas synthétiques aux bornes (juste dedans, juste dehors, tête tournée, tête inclinée)
  — `APP-004`
- Le Quest 3 émulé (IWER) rejoue la marche avec le masque de champ de vision de la cible, et une capture du rendu masqué est
  publiée par la CI, comme les captures des parcours existants — `QUA-020`

## Contrats créés

- `APP-004` — le champ de vision du casque est simulé : un calcul de projection juge qu'un point ou un rectangle de la scène est
  dans la vue, marge comprise ; la cible et la marge sont déclarées en un seul endroit (app/src/xr/fov.ts) et sourcées.
  **Origin** : champ-de-vision-casque — « un calcul de projection dit si un objet reste dans la vue ». Test nommé par l'ID,
  contrôle propre déclaré dans `.drwil/ia-first.json`, comme `app-001`.

## Contrats modifiés

- `QUA-020` — ajout d'un chemin e2e : la marche rejouée avec le masque de champ de vision (cible du Quest 3), capture publiée.
  Les chemins existants ne changent pas (même nature de changement que l'ajout du chemin 15 du chantier `panneau-discret`).

## 2. Hors périmètre

- Corriger la place du panneau : `docs/projects/panneau-heure-hors-vue.md` (l'assertion sur le vrai panneau y est écrite,
  vue échouer, puis corrigée, comme l'impose la recette de correction de défaut).
- Aucune assertion sur le panneau réel dans ce chantier : elle échouerait aujourd'hui et ferait rougir la CI.
- La distorsion des lentilles, la netteté des bords et l'ajustement du casque sur le visage : un écran plat ne les simule pas.
  C'est le rôle de la marge, et du jugement humain d'`APP-001` au casque.
- Modifier `app/src/xr/pose.ts` ou `app/src/xr/hud-panel.ts`.

## 3. Contraintes

- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Le module fov.ts est pur (aucune dépendance au navigateur) : il se teste en Vitest, et sert aussi à l'e2e.
- Le masque d'IWER (`visibilityMask`, IWER 2.7, node_modules/iwer/lib/device/XRVisibilityMask.d.ts) sert à la capture. La
  config `metaQuest3` d'IWER n'en définit pas ; seul le preset des lunettes Meta en porte un (37°, 37°, 25°, 43°), qui n'est pas
  celui du Quest 3 : ne pas le réutiliser tel quel.
- Aucune dépendance ajoutée, aucun appel réseau.

## 4. Décisions

- 2026-11-01, demande du demandeur (essai au casque) : simuler un écran plat à la taille du champ de vision du casque, puis
  régler le panneau sur cette simulation.
- 2026-11-01, hypothèse de cadrage (pas une décision de produit), à vérifier par l'agent au lot 1 : champ de vision du Quest 3
  d'environ 110° en horizontal et 96° en vertical (annoncé par Meta, de mémoire, non vérifié au cadrage), et une marge qui
  ne compte que 80 % de ces demi-angles comme « dans la vue » (le centre du champ est plus net que ses bords). L'agent cite la
  source dans fov.ts et dans `docs/architecture.md` ; s'il n'en trouve pas de fiable, il garde ces valeurs en les disant
  hypothèses et le signale au rapport, sans en inventer d'autres.
- Contrats concernés : `APP-001` (le panneau est son point 5), `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : les valeurs de champ de vision sont une hypothèse de cadrage à sourcer, voir 4)*

## 6. Lots

- **Lot 1 — source et module** [AI] : sourcer le champ de vision du Quest 3, écrire app/src/xr/fov.ts (cible, marge,
  projection d'un point et d'un rectangle pour une pose de tête) et ses tests sur cas synthétiques. Sortie : Vitest vert,
  couverture à 100 %.
- **Lot 2 — masque IWER et capture** [AI] : app/e2e/champ-de-vision.test.ts, la marche rejouée avec le masque de la cible,
  capture publiée. Sortie : e2e vert, capture lue.
- **Lot 3 — contrat et doc** [AI] : `APP-004` (avec son contrôle dans `.drwil/ia-first.json`), `QUA-020`, architecture, notice
  de l'agent. Sortie : `run-checks` vert.

## 7. Reprise

- **Dernier état** (2026-11-01) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche docs/fiches-champ-de-vision.
- **Prochaine étape** : [AI] lot 1. À faire avant `panneau-heure-hors-vue`.
