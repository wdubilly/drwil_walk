# Chantier : une seule extraction paramétrée par ville

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/villes-a-parcourir.md`

<!-- scope
files:
  - app/scripts/*.ts
  - app/scripts/*.test.ts
  - app/package.json
  - docs/architecture.md
  - docs/intentions/*
-->

## 1. Besoin

Chaque ville a son script d'extraction recopié : `app/scripts/extract-souq.ts`, `app/scripts/extract-pune.ts`,
`app/scripts/extract-corniche.ts`, `app/scripts/extract-fc-road.ts`. Le squelette est le même quatre fois ; seules changent
l'emprise, l'origine et le fichier de sortie. Ajouter Rome, Erevan et Paris en ferait sept copies du même code — et sept
endroits où corriger la moindre évolution de la requête Overpass, comme l'a montré l'oubli des poubelles et des panneaux.

Une seule extraction, paramétrée par ville, supprime cette répétition avant qu'elle n'empire.

## Critères d'acceptation

- Une seule fonction d'extraction, paramétrée par ville (emprise, origine, nom du fichier) — `QUA-004`
- Les quatre villes existantes sont décrites par des données, non par du code recopié — `APP-003`
- **Les quatre extraits produits sont identiques à ceux du dépôt** : même contenu, à l'octet près si la source n'a pas
  changé entre deux appels — c'est la preuve que le refactor n'a rien modifié — `APP-003`
- Les commandes `npm run extract`, `extract:pune`, `extract:corniche`, `extract:fc-road` continuent de fonctionner — `QUA-011`
- Ajouter une ville ne demande que ses paramètres, aucun code nouveau — `QUA-011`
- Les tests existants des scripts restent verts, sans réseau — `QUA-004`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Ajouter une ville : c'est la suite (`docs/intentions/villes-a-parcourir.md`).
- Changer la requête Overpass ou les balises demandées (`docs/projects/extraction-mobilier.md`).
- Le rendu, les façades, les familles de régions.

## 3. Contraintes

- **Refactor sans rien casser** : suivre `docs/recipes/refactor-without-breaking.md` — tests de caractérisation d'abord,
  petites étapes commitées, un bug trouvé en chemin fait l'objet d'un commit séparé.
- Aucun appel réseau dans les tests : l'extraction prend `fetch` en paramètre, comme aujourd'hui.
- Overpass est un service public : ne pas relancer les quatre extractions en boucle pour vérifier.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).

## 4. Décisions

- 2026-11-03 : **généraliser avant d'ajouter des villes**, plutôt que de recopier le modèle une fois de plus.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — caractérisation** [AI] : figer le comportement actuel des quatre scripts par des tests, sans réseau. Sortie :
  tests verts sur le code inchangé.
- **Lot 2 — extraction unique** [AI] : une fonction paramétrée, les quatre villes décrites par des données, les anciens
  scripts réduits à leurs paramètres. Sortie : tests verts, extraits identiques.
- **Lot 3 — commandes et doc** [AI] : commandes `npm run extract*` conservées, documentation à jour. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : lot 1, les tests de caractérisation.
