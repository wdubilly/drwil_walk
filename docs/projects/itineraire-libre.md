# Chantier : choisir son propre itinéraire

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/itineraire-libre.md`

<!-- scope
files:
  - app/src/route/*
  - app/src/city/*
  - app/src/city/free-route.ts
  - app/src/city/free-route.test.ts
  - app/src/xr/*
  - app/src/ui/*
  - app/src/main.ts
  - app/src/main.test.ts
  - app/e2e/*
  - app/playwright.config.ts
  - app/playwright.config.test.ts
  - .env.example
  - INSTALL.md
  - app/package.json
  - app/package-lock.json
  - app/AGENTS.md
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/intentions/*
  - README.md
  - docs/guide-utilisateur.md
-->

## 1. Besoin

Le demandeur veut marcher sur **n'importe quel trajet** : il choisit un départ et une arrivée, l'application calcule le
chemin à pied et charge la ville autour.

## Critères d'acceptation

- L'accueil propose « Itinéraire libre » en plus des quatre cartes ; le demandeur y choisit un départ et une arrivée en
  touchant une carte ou en cherchant un lieu ou une adresse (les deux modes se remplissent mutuellement) — `QUA-020`
- Une adresse introuvable, une saisie vide, une clé absente ou refusée, un trajet de plus de 5 km : la raison est dite à
  l'écran, les quatre itinéraires figés restent utilisables — `QUA-002`
- Le chemin à pied entre les deux points est calculé par un service de routage, puis la marche le suit à la vitesse
  réglée ; en cas d'échec du calcul, une raison est dite à l'écran (jamais silencieux) — `QUA-002`
- Un trajet libre ne boucle pas : à l'arrivée la marche s'arrête et le dit — `APP-002`
- La ville autour du trajet vient du rendu Google 3D (chantier google-3d-tiles) ou, à défaut, de bâtiments
  OpenStreetMap chargés pour le trajet, avec l'attribution de la source — `APP-003`
- Le fondu de sécurité reste actif sur un trajet libre [humain] — `APP-001`
- Le parcours libre est rejoué de bout en bout dans le Quest 3 émulé, service de routage factice — `QUA-020`

## 2. Hors périmètre

- Le rendu photoréaliste lui-même : `docs/projects/journal.md`, à livrer avant ce chantier.
- Enregistrer ou partager des trajets, comptes, historique : aucune donnée personnelle conservée.
- Navigation guidée, virages annoncés, pause et recalibrage (`docs/intentions/commandes-panneau.md`).

## 3. Contraintes

- Dépend de `google-3d-tiles`, livré le 2026-10-31 (accès réseau, clé et chargement de la ville hors extrait).
- Aucune donnée personnelle conservée : les points choisis ne sont ni enregistrés ni envoyés ailleurs qu'au service de routage.
- Trajet borné en longueur (hypothèse : 5 km au plus) pour limiter les chargements.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Aucun test n'appelle un service externe : routage et tuiles factices en e2e.

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur (« oui pour tout ») : accès réseau pendant la marche accepté, clé
  Google acceptée.
- 2026-10-31, décisions humaines du demandeur : routage par l'API Google Routes (mode piéton) avec **sa propre clé**
  `VITE_GOOGLE_ROUTES_API_KEY`, distincte de la clé Map Tiles (deux API, deux clés) ; départ et arrivée choisis en
  touchant une carte à l'accueil ; aller simple, arrêt à l'arrivée ; 5 km au plus.
- 2026-10-31, hypothèses de cadrage de l'agent, à corriger au lancement : la carte de l'accueil est une carte légère
  (tuiles OpenStreetMap, avec leur attribution) dont la bibliothèque est choisie au lot 1 ; le testeur utilise les
  clés de `.env.local` (jamais dans le dépôt), `.env.example` n'a que des valeurs fictives (`SEC-007`).
- 2026-10-31, décision humaine du demandeur : recherche d'adresse en plus de la carte touchée (hypothèse de l'agent :
  API Google Geocoding avec la même clé `VITE_GOOGLE_ROUTES_API_KEY`, sur laquelle Routes et Geocoding doivent tous deux être
  activés et autorisés ; pas de troisième variable). Le premier résultat est retenu et affiché ; une touche sur la carte inscrit
  l'adresse trouvée (géocodage inverse, à défaut les coordonnées arrondies).
- 2026-10-31, choix de l'agent au lot 1 : carte de l'accueil sans bibliothèque (tuiles OpenStreetMap, zoom et déplacement par
  boutons, ~150 lignes), car Leaflet lit `window` dès l'import et suppose une vraie mise en page, ce qui contredit la
  conception par injection testée sous happy-dom ; aucune dépendance ajoutée (SEC-006, SEC-012 inchangés). Ville d'un trajet
  libre : bâtiments OpenStreetMap proches du tracé (bande de 150 m, Overpass) chargés à l'accueil quand le trajet se prépare,
  jamais pendant la marche ; si Overpass échoue, la marche reste possible sans bâtiments et le dit.
- Le périmètre (bloc scope) s'étend à `app/playwright.config.ts` et son test (clé Routes fictive des e2e), `.env.example` et
  `INSTALL.md` (documentation de la clé), à la demande de la coordination.
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `QUA-002`, `QUA-004`, `QUA-020`.

## Contrats modifiés

- `APP-002` — un itinéraire libre ne boucle pas : la marche s'arrête à l'arrivée ; les quatre itinéraires figés gardent leur boucle.
- `APP-003` — la ville d'un trajet libre ne vient pas d'un extrait versionné, mais du rendu Google ou d'un chargement OpenStreetMap.
- `QUA-020` — le chemin 10 (itinéraire libre, services factices) s'ajoute aux chemins critiques ; le chemin 2 compte cinq cartes.

## 5. Points à trancher

*(aucun : la recherche d'adresse est une question d'intention, hors de ce chantier)*

## 6. Lots

- **Lot 1 — choix des points et routage** [AI] : carte à l'accueil, appel du service, tracé en points GPS dans le
  repère local. Sortie : tests verts, routage factice.
- **Lot 2 — marche libre** [AI] : marche sur un tracé calculé, arrêt à l'arrivée, ville autour du trajet. Sortie :
  `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : chemin e2e, docs à jour. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : marcher un trajet libre sur le Quest 3, tapis à vitesse lente.

## 7. Reprise

- **Dernier état** (2026-10-31) : lots 1 à 3 codés (carte, adresses, routage, marche jusqu'à l'arrivée, e2e, docs), vérifiés sans
  clé avec des services factices. Lot 4 (essai réel, vraie clé, Quest 3) : humain, intention `docs/intentions/essai-casque-itineraire-libre.md`.
- **Travail non commité** : voir `git status`.
- **Prochaine étape** : [human] lot 4.
