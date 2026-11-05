# Chantier : recentrer le produit sur le générateur d'itinéraire (accueil réduit, sans Google ni parcours libre)

**Statut** : cadré le 2026-11-05.
**Risque** : HIGH
**Maturité** : à affiner
**Intention** : `docs/intentions/recentrer-generateur-itineraire.md`, `docs/intentions/generateur-ville-complet.md`

<!-- scope
files:
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/src/route/*
  - app/src/route/*.test.ts
  - app/src/ui/*
  - app/src/ui/*.test.ts
  - app/src/xr/*
  - app/src/xr/*.test.ts
  - app/src/pc/*
  - app/src/pc/*.test.ts
  - app/src/render/*
  - app/src/render/*.test.ts
  - app/src/main.ts
  - app/scripts/*.ts
  - app/e2e/*
  - app/package.json
  - app/AGENTS.md
  - README.md
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/recipes/*
  - docs/intentions/*
-->

## 1. Besoin

Le produit se resserre sur un **générateur complet d'itinéraire** (décision du demandeur, 2026-11-05) : un accueil réduit à
l'itinéraire et à la vitesse, un seul rendu (OpenStreetMap), plus de parcours libre, plus de Google 3D (pas de licence). Les
préférences (qualité, piétons, circulation…) se règlent **pendant la marche** et se retiennent d'une marche à l'autre.

## Critères d'acceptation

- **Google 3D supprimé** : plus de code (`app/src/city/google-tiles.ts`, `app/src/xr/google-mode.ts`, choix de rendu de
  l'accueil, mention et crédit Google), plus de test ni de contrat qui le cite ; le rendu OpenStreetMap est le seul — `APP-003`
- **Parcours libre supprimé** : plus de recherche d'adresse ni de trajet libre (`app/src/ui/free-trip.ts`,
  `app/src/city/free-route.ts`, `app/src/route/geocoding.ts`, `app/src/route/routes-api.ts`, fournisseurs de trajets, e2e
  `itineraire-libre`), plus de clé ni de réseau à la marche ; la marche reste une boucle d'itinéraire — `APP-002`
- **Accueil réduit** : seuls l'itinéraire et la vitesse sont visibles ; poids, matériaux, lampadaires, ville vivante, arbres,
  brouillard, sons, côté et opacité du panneau, vignette n'y sont plus ; chacun prend sa valeur par défaut (le poids,
  `DEFAULT_WEIGHT_KG`) ou celle de la région, puis le dernier choix de l'utilisateur quand il est réglable en marche — `APP-006`, `APP-008`, `APP-011`, `APP-012`, `APP-013`, `APP-014`
- **Préférences en marche** : l'utilisateur règle pendant la marche, sur Quest, PC et tablette, sans la quitter, les
  préférences retenues (qualité, piétons, circulation, lampadaires, arbres, brouillard, sons) ; chaque choix devient son
  dernier choix, repris au départ de la marche suivante ; la première marche part des valeurs par défaut (qualité
  Équilibré) — `APP-006`, `APP-011`, `APP-013`, `APP-014`
- La **sécurité-visibilité ne bouge pas** : aucun niveau ni retrait d'option n'affecte le passthrough, et le changement de
  qualité en marche ne cache jamais le réel — `APP-001`
- Les e2e des chemins critiques sont **réécrits** pour le parcours réduit (sans Google ni parcours libre), pas supprimés — `QUA-011`
- Docs à jour : `README.md`, `app/AGENTS.md`, `docs/architecture.md`, `docs/features.md`, `docs/guide-utilisateur.md` ;
  `docs/contracts.md` : `APP-002` et `APP-003` perdent le trajet libre et Google, les contrats d'options de l'accueil sont relus
  — `QUA-011`

## Contrats modifiés

- `APP-002` (plus de trajet libre), `APP-003` (plus d'OpenStreetMap chargé pour un trajet, plus de mention Google), `APP-006`
  (profil réglé en marche et mémorisé), `APP-011`, `APP-012`, `APP-013`, `APP-014` (options sans case d'accueil).
- Les contrats de couverture e2e qui citent Google et le parcours libre sont réécrits.

## 2. Hors périmètre

- Le catalogue de promenades et la création « à la volée » (suites du générateur).
- La parité des plateformes (`docs/projects/parite-plateformes.md`) et l'inscription des villes : elles viennent après et
  partent de l'accueil réduit.
- Remettre un jour un parcours libre ou un rendu photoréaliste : autre intention.

## 3. Contraintes

- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`) : supprimer du code ne doit laisser
  ni test orphelin ni ligne non couverte.
- Retirer le code Google retire aussi les dépendances et mentions de licence devenues inutiles.
- Tout chantier touchant `app/` est HIGH ; `APP-001` reste testé.

## 4. Décisions

- 2026-11-05 : Google 3D est supprimé (code, tests, contrats).
- 2026-11-05 : le parcours libre est supprimé pour l'instant.
- 2026-11-05 : l'accueil ne garde que l'itinéraire et la vitesse.
- 2026-11-05 : les préférences se règlent en marche et le dernier choix est gardé pour la marche suivante (qualité
  Équilibré la première fois) ; pas de réglage avancé caché.
- 2026-11-05 : ce chantier passe avant la parité et l'inscription.

## 5. Points à trancher

- [decision] Les anciens réglages mémorisés (matériaux, brouillard, sons…) sont-ils ignorés ? (proposé : oui ; seul le profil
  mémorisé est repris.)
- [decision] Quelles préférences sont réglables en marche (proposé : qualité, piétons, circulation, lampadaires, arbres,
  brouillard, sons) ; matériaux locaux et poids restent fixes ?
- [decision] Piétons et circulation : deux préférences séparées (aujourd'hui une seule case) ?
- [decision] Un changement en marche reconstruit-il la ville ou ne règle-t-il que ce qui se règle à chaud ? (à chiffrer au
  lot 3, sans coupure qui cache le réel.)

## 6. Lots

- **Lot 1 — retrait de Google 3D** [AI] : code, tests, contrats, mentions, docs. Sortie : build et tests verts, rendu
  OpenStreetMap seul.
- **Lot 2 — retrait du parcours libre** [AI] : écran, trajets, fournisseurs, e2e, contrats `APP-002`/`APP-003`. Sortie : build
  et tests verts.
- **Lot 3 — préférences en marche** [AI] : commande des préférences dans la marche sur les trois modes, mémorisation du dernier choix,
  première marche aux valeurs par défaut. Sortie : tests, `APP-001` vert.
- **Lot 4 — accueil réduit** [AI] : retrait des options, valeurs par défaut, e2e des chemins critiques réécrits. Sortie : e2e
  verts.
- **Lot 5 — docs** [AI] : `README.md`, `app/AGENTS.md`, architecture, fonctions, guide, contrats. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-05) : cadrage seul, aucun code écrit.
- **Travail non commité** : cette fiche, l'intention, l'index.
- **Prochaine étape** : trancher les deux points, puis lot 1 une fois le chantier lancé par le demandeur.
