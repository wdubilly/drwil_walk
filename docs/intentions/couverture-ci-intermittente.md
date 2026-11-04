# Intention : la couverture de `app` échoue par intermittence dans la CI, tous les tests verts

**Statut** : proposée le 2026-11-04.

## Besoin

Une exécution de la CI peut échouer sur « coverage of app (c8) » alors que tous les tests passent : des fichiers sans rapport
avec le changement (`app/eslint.config.js`, `app/playwright.config.ts`, `app/vite.config.ts`, `app/src/main.ts`, une partie de
`app/src/city/zip-read.ts`…) y sont comptés à 0 %, comme si la couverture de certains workers n'avait pas été écrite. Relancer
le même commit la rend verte : la CI rouge ne dit alors rien du changement, et coûte une relance d'un quart d'heure.

## Existant

Lu le 2026-11-04 : sur la PR #76 (détour mobilier-hauteur-test), le même commit était vert sur l'événement `pull_request` et
rouge sur `push` (exécution 41815502049), vert à la relance. Les PR des chantiers facades-materiaux-souk et
overture-zones-cities ont aussi connu des exécutions rouges, causes non relues. `app/AGENTS.md` note déjà qu'une couverture à
0 % vient d'un worker tué avant d'écrire (pool `forks`) ; `app/vite.config.ts` garde `pool: "threads"`.

## Questions à trancher

- Quelle est la cause : worker terminé avant l'écriture de sa couverture, deux exécutions concurrentes sur le même dossier,
  autre ?
- Faut-il ne lancer qu'une exécution par commit (push ou pull_request) ?
