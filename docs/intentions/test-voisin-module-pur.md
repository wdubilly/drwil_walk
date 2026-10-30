# Intention : outiller QUA-006, un module de logique pure a son test à côté

**Statut** : proposée le 2026-10-30, à la clôture du socle de `app/` (fiche `docs/projects/couverture-app.md`).

## Besoin

Le contrat `QUA-006` (un module de logique pure a son fichier `*.test.ts` juste à côté) est resté MANUAL au chantier
couverture-app : ni ESLint ni c8 ne le vérifient tels quels. Le contrat demande un script ou une règle de lint qui liste
les modules sans test voisin, déclaré dans `.drwil/ia-first.json` → `checks` avec un `id` et cité en **Check**.

## Existant

Lu le 2026-10-30 : `app/src/route/speed.ts` a son test `app/src/route/speed.test.ts`, `app/src/main.ts` a
`app/src/main.test.ts`. La couverture à 100 % sans exclusion (`QUA-004`) oblige déjà tout fichier à être exécuté par un
test, mais pas par un test voisin : un module couvert par le test d'un autre module passerait. Aucun script de ce
genre dans `.githooks/` (seul `.githooks/check-code-rules.mjs`, point d'extension vide, pourrait l'accueillir).

## Questions à trancher

- [decision] Qu'est-ce qu'un « module de logique pure » pour le script : tout `app/src/**/*.ts` hors tests, ou une
  liste de dossiers (route, safety…) en excluant le code de rendu three.js ?
- [decision] Script dédié dans `.githooks/` (mécanique du kit, risque HIGH) ou script de la couche `app/` (testé et
  couvert comme le reste) ?
