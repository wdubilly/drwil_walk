# Chantier : inscrire à l'accueil une ville créée par la commande

**Statut** : cadré le 2026-11-05.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/inscrire-une-ville-creee.md`, `docs/intentions/generateur-ville-complet.md` (bloc 5, étape 2)

<!-- scope
files:
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/src/route/*
  - app/src/ui/*
  - app/scripts/*.ts
  - app/scripts/*.test.ts
  - app/data/*.json
  - app/e2e/*
  - app/AGENTS.md
  - README.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
-->

## 1. Besoin

`npm run city -- <identifiant>` écrit l'extrait, la boucle et les matériaux d'une ville, mais ne l'inscrit pas : elle n'a
ni carte d'accueil, ni entrée dans `cityFor`, ni palette. Le demandeur veut que créer une ville suffise à la voir
apparaître à l'accueil, sans code propre à elle (`docs/intentions/generateur-ville-complet.md`).

## Critères d'acceptation

- Le catalogue `app/data/villes.json` est la **source unique** des villes : `cityFor` et la liste des itinéraires de
  l'accueil en sont lus à la construction, sans `import` écrit à la main par ville — `APP-002`, `APP-003`
- Une ville ajoutée au catalogue par la commande apparaît à l'accueil avec son nom, son lieu et son attribution OpenStreetMap
  (la carte n'a pas d'illustration propre : un visuel de repli commun), sans changer un fichier de code — `APP-003`
- La palette d'une ville est **déduite de sa région** (`regionOf`), jamais écrite par ville ; une ville hors des régions
  connues reçoit la palette « ailleurs » — `APP-008`
- Les quatre itinéraires existants s'affichent comme avant, dans le même ordre, avec leurs illustrations ; le défaut reste le
  souk — `APP-002`
- Un identifiant sans ville dans le catalogue reste une erreur dite, jamais un repli muet — `QUA-002`
- Un test unique, paramétré sur le catalogue, vérifie pour chaque ville : extrait et boucle présents, chaque point de la
  boucle est un sommet de voie, la ville se charge, la carte d'accueil existe — `APP-002`, `APP-003`
- `app/AGENTS.md` et `README.md` ne citent plus les commandes `npm run extract*` retirées, mais `npm run city` ; les
  intentions qui les citent pour le contexte d'alors sont relues — `QUA-011`
- Les quatre quartiers existants ne changent pas dans ce chantier : leur régénération est un autre chantier
  (décision du 2026-11-05) — `APP-003`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Régénérer les quatre quartiers par la commande (boucles rejouées) : chantier à part, décidé le 2026-11-05.
- Essayer la commande contre les vrais services (`docs/intentions/essai-commande-creation-reseau.md`).
- Les paramètres de région des figurants et des matériaux (`docs/intentions/generateur-ville-complet.md`, étape 4).
- Toute évolution du rendu ou de la sécurité-visibilité.

## 3. Contraintes

- Les tests tournent sans transformation de Vite : pas d'`import.meta.glob` ; le catalogue est lu comme un fichier JSON
  importé.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Le poids total de `app/data/` ne bouge pas : aucune donnée de ville n'est ajoutée ici.

## 4. Décisions

- 2026-11-05 : l'inscription se fait par **lecture du catalogue `app/data/villes.json` à la construction**, pas par un
  fichier généré par la commande.
- 2026-11-05 : la palette d'une ville créée est **déduite de la région** (`APP-008`), pas écrite dans le catalogue.
- 2026-11-05 : une ville est « complète » pour l'accueil avec la palette de repli et la ville vivante par défaut (région
  « ailleurs »).

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — lecture du catalogue** [AI] : `cityFor` et la liste des itinéraires lus depuis `app/data/villes.json`, palette
  déduite de la région. Sortie : les quatre villes inchangées, tests verts.
- **Lot 2 — carte d'accueil** [AI] : une ville du catalogue sans illustration reçoit une carte à visuel de repli ; la
  commande ajoute au catalogue tout ce qu'il faut à la carte. Sortie : e2e de l'accueil sur une ville de test.
- **Lot 3 — docs** [AI] : `app/AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/features.md`, intentions relues.
  Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-05) : cadrage seul, aucun code écrit.
- **Travail non commité** : cette fiche, l'index, l'intention du générateur.
- **Prochaine étape** : lot 1 une fois le chantier lancé par le demandeur.
