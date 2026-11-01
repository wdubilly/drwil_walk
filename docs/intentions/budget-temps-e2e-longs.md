# Intention : donner aux e2e longs un budget de temps qui tienne sur une machine chargée

**Statut** : proposée le 2026-11-01 (limite du chantier panneau-discret).

## Besoin

Les e2e de marche longs (chemins 6, 7, 8 de `app/e2e/chemins-critiques.test.ts`, chemin 13 de `app/e2e/zone-tapis.test.ts`) échouent
de temps en temps sur « Test timeout of 30000ms exceeded » quand la machine est chargée, alors qu'ils passent en isolé.

## Existant

Lu le 2026-11-01 : en isolé, ces tests durent 16 à 22 s sur le code du chantier comme sur `master` (mesuré), pour un budget de
30 s par test (`app/playwright.config.ts`). Avec une charge machine de 10 à 20, plusieurs rejeux de `drwil verify --evidence` ont
échoué (capture d'écran, `locator.evaluate`) avant de passer sans changement de code. Les attentes `expect.poll` ont déjà été
portées à 20 s (chantier arbres-pack-quaternius), pas le budget du test lui-même.

## Questions à trancher

- [decision] Porter le budget par test à 60 s (réglage `timeout` de `app/playwright.config.ts`, ou `test.describe.configure` dans les
  fichiers concernés), ou raccourcir ces marches (distance à atteindre moins longue) ?
