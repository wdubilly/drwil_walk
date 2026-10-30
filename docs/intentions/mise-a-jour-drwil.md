# Intention : mettre drwil à jour pour clore les trois chantiers de garantie

**Statut** : proposée le 2026-10-30, en attente d'une release de drwil.

## Besoin

Les chantiers versionnement, couverture-app et e2e-chemins-critiques ont leur travail fusionné, mais drwil 0.10.0 ne
peut pas les clore : `drwil verify` reste en FAIL sur « contrôle `coverage-diff-app` non déclaré », parce que la couche
`app` a été classée « existing » (du code existait quand `drwil guarantees` a tourné). Le défaut est traité dans drwil,
à part ; la version suivante apporte la couverture du code modifié par rapport lcov.

## Existant

Lu le 2026-10-30 : drwil 0.10.0 installé depuis l'archive de la release GitHub (`package.json` à la racine) ; 21
contrats, 15 PASS et 6 attestés ; seule l'erreur de registre ci-dessus bloque.

## Questions à trancher

- [decision] Dès la release publiée : chantier de mise à jour (nouvelle archive, `npx drwil init --dry-run` puis
  `init`, `diffCoverage` déclaré avec le lcov de `app/` produit par c8), puis clôture des trois chantiers un par un.
