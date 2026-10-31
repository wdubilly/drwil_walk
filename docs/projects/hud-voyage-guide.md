# Chantier : le voyage guidé par étapes

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/hud-casque.md`

<!-- scope
files:
  - app/scripts/osm-tags.ts
  - app/scripts/extract-souq.ts
  - app/data/*
  - app/src/route/stages.ts
  - app/src/route/stages.test.ts
  - app/src/route/itineraries.ts
  - app/src/route/itineraries.test.ts
  - app/src/city/cities.ts
  - app/src/city/cities.test.ts
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

Dans la maquette, « Voyage guidé » enchaîne les étapes d'un itinéraire et le tableau de bord annonce la prochaine étape
(« Cotignac, prochaine étape : Brignoles, 12 km »). Le demandeur veut des étapes tirées des **lieux nommés d'OpenStreetMap**
le long du tracé de chaque itinéraire figé.

## Critères d'acceptation

- Les étapes d'un itinéraire sont des lieux nommés de l'extrait OpenStreetMap, situés le long du tracé et ordonnés selon la
  marche — `APP-003`
- Un voyage guidé se choisit à l'accueil ; il est désactivé par défaut, la marche actuelle ne change pas — `APP-002`
- Le tableau de bord annonce l'étape courante et la prochaine, avec la distance restante jusqu'à elle — `APP-002`
- Un itinéraire sans lieu nommé exploitable le dit à l'accueil et la marche se fait sans étapes, jamais d'étape inventée —
  `QUA-002`
- L'annonce suit le fondu tête baissée et reste hors de la zone tapis [humain] — `APP-001`
- Le voyage guidé est rejoué de bout en bout dans le Quest 3 émulé, sur un itinéraire figé — `QUA-020`

## Contrats modifiés

*(aucun : les étapes ne changent pas le parcours)*

## 2. Hors périmètre

- Étapes écrites à la main : le demandeur a choisi les lieux d'OpenStreetMap (2026-10-31).
- Les étapes du trajet libre et des défis.
- Un guidage vocal.

## 3. Contraintes

- Dépend de `hud-tableau-de-bord` (où l'annonce s'affiche).
- La qualité des étapes dépend des lieux nommés d'OpenStreetMap : un extrait pauvre donne peu d'étapes. Les quatre extraits
  sont relus ; relancer l'extraction pour garder les balises `name` et le type de lieu.
- Aucun appel réseau dans le casque (`APP-003`).
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : étapes tirées d'OpenStreetMap ; le voyage guidé enchaîne les étapes d'un
  itinéraire.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : quels types de lieux comptent
  (musée, place, monument, tour), nombre maximal d'étapes, distance maximale au tracé, texte de l'annonce.
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `QUA-002`, `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — lieux et étapes** [AI] : conserver les lieux nommés, en tirer les étapes le long du tracé. Sortie : tests verts,
  extraits relus.
- **Lot 2 — choix et annonce** [AI] : option à l'accueil, annonce dans le tableau de bord. Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : e2e, docs. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : juger la pertinence des étapes sur chaque itinéraire.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/commandes-panneau`.
- **Prochaine étape** : [AI] lot 1, après `hud-tableau-de-bord`.
