# Chantier : un accueil lisible dans le casque, avec le choix d'itinéraire

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/interface-accueil.md`

<!-- scope
files:
  - app/src/ui/*
  - app/src/main.ts
  - app/src/main.test.ts
  - app/src/route/*
  - app/index.html
  - app/public/*
  - app/e2e/*
  - .github/workflows/ia-first.yml
  - app/AGENTS.md
  - docs/contracts.md
  - docs/contracts-catalog.md
  - docs/architecture.md
  - docs/features.md
  - docs/intentions/*
  - README.md
-->

## 1. Besoin

L'accueil du casque est du HTML brut (police par défaut, champs alignés sur une ligne), peu lisible dans le
navigateur du Quest 3. Le demandeur veut un **accueil sombre, à grands boutons**, avec le **choix de l'itinéraire**
sous forme de **cartes avec une image** : Pune Vieille ville (par défaut), Pune FC Road, Doha Corniche, Doha Souq
Waqif. Périmètre : l'accueil dans le casque seulement, pas de page vitrine web.

## Critères d'acceptation

- L'accueil affiche quatre cartes d'itinéraire avec image ; Pune Vieille ville est sélectionnée par défaut ; une
  carte se choisit d'un clic ou à la manette, et l'itinéraire choisi est celui qui démarre — `QUA-020`
- Un itinéraire dont la ville n'est pas encore disponible est visible mais non sélectionnable, avec la mention
  « bientôt » ; il ne peut pas démarrer — `QUA-020`
- Le rappel de sécurité, la vitesse de départ, le curseur d'opacité et le bouton « Entrer en réalité mixte » restent
  présents et lisibles ; les cibles à viser font au moins 48 px de haut — `QUA-020`
- Le texte et son fond respectent un contraste d'au moins 4,5:1 (3:1 pour le grand texte) — `QUA-014` (adopté ici,
  contraste RGAA 4.1 / WCAG AA)
- Le fondu de sécurité n'est pas modifié — `APP-001` [humain]
- Le demandeur n'a pas de casque : l'e2e enregistre des **captures d'écran** de l'accueil (état par défaut, carte
  « bientôt », carte choisie) dans un dossier « captures » de l'e2e, et la CI les publie en pièce jointe téléchargeable — `QUA-020`
- Le parcours accueil → choix → entrée en réalité mixte est rejoué dans le Quest 3 émulé — `QUA-020`

## 2. Hors périmètre

- Les villes des autres itinéraires : `docs/intentions/autres-itineraires.md`. Ici, seules les cartes existent.
- Pause, recalibrage, panneau d'infos dans le casque : `docs/intentions/commandes-panneau.md`.
- Page vitrine web du projet (hors casque).

## 3. Contraintes

- Aucun appel réseau : images versionnées dans le dossier des ressources statiques d'`app/`, illustrations SVG dessinées pour le projet, sans photo
  sous licence incertaine.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Texte testé par ce que voit l'utilisateur (rôles, textes, boutons), pas par l'implémentation.

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : périmètre = accueil du casque ; style **sombre, grands boutons** ;
  choix d'itinéraire en **cartes avec image** ; adoption de `catalog:QUA-014` (contraste) en même temps.
- 2026-10-31, hypothèses de cadrage de l'agent, à corriger au lancement si besoin : les itinéraires sans ville sont
  affichés « bientôt » et non sélectionnables ; les images sont des illustrations SVG simples.
- Contrats concernés : `catalog:QUA-014` (à adopter depuis `docs/contracts-catalog.md`), `APP-001` et `QUA-020` (repris).

## Contrats modifiés

- `QUA-020` — étendu au choix d'itinéraire à l'accueil et aux captures de l'accueil (décidé au cadrage du 2026-10-31 : « Le parcours accueil → choix → entrée en réalité mixte est rejoué dans le Quest 3 émulé »)

## 5. Points à trancher

*(aucun : décisions prises le 2026-10-31)*

## 6. Lots

- **Lot 1 — style et cartes** [AI] : feuille de style sombre, cartes d'itinéraire avec illustrations, état
  « bientôt », sélection par défaut. Sortie : tests verts.
- **Lot 2 — contraste et câblage** [AI] : adoption de `catalog:QUA-014` avec son test, itinéraire choisi transmis au
  démarrage, e2e du parcours, docs à jour. Sortie : `run-checks` vert, CI verte.
- **Lot 3 — captures** [AI] : captures Playwright de l'accueil, publiées par la CI. Sortie : captures téléchargeables.
- **Lot 4 — relecture** [human] : juger le rendu sur les captures ; essai dans le Quest 3 plus tard, si un casque
  est disponible.

## 7. Reprise

- **Dernier état** (2026-10-31) : lots 1 à 3 codés et commités sur `workstream/accueil-casque` ; captures écrites par
  l'e2e dans `dist/e2e-captures/` (hors de la couche, ignoré par Git : le périmètre `app/e2e/*` ne couvre pas un
  sous-dossier) et publiées par la CI. `QUA-014` adopté, prouvé par un test (scripts du kit : intention
  `docs/intentions/controles-couleurs-kit.md`).
- **Travail non commité** : la clôture (journal, retrait de l'intention couverte).
- **Prochaine étape** : [AI] clôture puis PR ; [human] lot 4, juger le rendu sur les captures.
