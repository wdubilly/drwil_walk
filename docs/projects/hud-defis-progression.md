# Chantier : les défis de distance et l'objectif annuel

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/hud-casque.md`

<!-- scope
files:
  - app/src/route/challenges.ts
  - app/src/route/challenges.test.ts
  - app/src/route/progress.ts
  - app/src/route/progress.test.ts
  - app/src/xr/*
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
  - app/src/main.ts
  - app/src/main.test.ts
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

Dans la maquette, un défi longue distance (« Vidauban → Paris », 312 km parcourus sur 612 km restants) et d'autres défis
(Paris → Moscou, tour du monde) s'additionnent séance après séance, avec un objectif annuel de 1 000 km. Le demandeur veut
des défis qui ne sont qu'une **distance cumulée**, gardée en local, sans tracé ni mini-globe.

## Critères d'acceptation

- Un défi est une distance totale nommée ; la distance marchée à chaque séance s'ajoute à sa progression — `APP-002`
- La progression et l'objectif annuel sont gardés dans le navigateur du Quest (`localStorage`), relus au lancement
  suivant ; aucun compte, aucun serveur — `SEC-007`
- Le tableau de bord montre le défi en cours (parcouru, restant) et l'objectif annuel — `APP-002`
- Une progression illisible ou aberrante est remise à zéro en le disant, sans bloquer la marche — `QUA-002`
- L'utilisateur peut choisir un défi à l'accueil et remettre une progression à zéro — `QUA-002`
- Ces affichages suivent le fondu tête baissée et restent hors de la zone tapis [humain] — `APP-001`
- La progression d'une séance à l'autre est rejouée de bout en bout dans le Quest 3 émulé — `QUA-020`

## Contrats modifiés

*(aucun : le cumul s'ajoute sans changer le parcours)*

## 2. Hors périmètre

- Un tracé réel des défis et un mini-globe : choix du demandeur du 2026-10-31, distance seule.
- Un partage ou une synchronisation de la progression, des comptes.
- Le dénivelé et les calories : `docs/projects/hud-tableau-de-bord.md`.

## 3. Contraintes

- Dépend de `hud-tableau-de-bord` (l'endroit d'affichage).
- La distance cumulée est une donnée de pratique, locale ; elle ne quitte jamais le Quest (`SEC-007`).
- Fichiers de 200 lignes au plus, couverture à 100 % sans exclusion, e2e vert en CI (`QUA-001`, `QUA-004`, `QUA-020`).

## 4. Décisions

- 2026-10-31, décision humaine du demandeur : défis en distance cumulée seulement, progression locale.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : la liste des défis et leurs
  distances, les clés de stockage, le moment où la distance est comptée (en continu ou à la fin de la séance).
- Contrats concernés : `APP-001`, `APP-002`, `SEC-007`, `QUA-001`, `QUA-002`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — défis et progression, en logique pure** [AI] : liste, cumul, lecture sûre du stockage. Sortie : tests verts.
- **Lot 2 — choix et affichage** [AI] : choix à l'accueil, défi et objectif dans le tableau de bord. Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : e2e, docs. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : juger sur le Quest 3.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/commandes-panneau`.
- **Prochaine étape** : [AI] lot 1, après `hud-tableau-de-bord`.
