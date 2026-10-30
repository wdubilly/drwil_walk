# Intention : outiller QUA-009, un test désactivé cite la fiche qui le justifie

**Statut** : proposée le 2026-10-30, à la clôture du socle de `app/` (fiche `docs/projects/couverture-app.md`).

## Besoin

Le contrat `QUA-009` (un test désactivé, `skip` ou `todo`, cite une fiche ouverte de `docs/projects/`) est resté MANUAL
au chantier couverture-app. Le contrat demande un script qui liste les tests désactivés sans fiche citée à côté,
déclaré dans `.drwil/ia-first.json` → `checks` avec un `id` et cité en **Check**.

## Existant

Lu le 2026-10-30 : aucun test désactivé dans `app/` (deux fichiers de test de code, deux de configuration). Le lint
(`app/eslint.config.js`) n'interdit pas `it.skip` ni `it.todo`, et rien ne relie un test désactivé à une fiche ouverte.

## Questions à trancher

- [decision] Forme de la citation : nom de fichier de la fiche dans un commentaire sur la même ligne ou la ligne
  précédente, ou autre convention ?
- [decision] Le script vérifie-t-il que la fiche citée est encore ouverte (présente dans `docs/projects/`), ou
  seulement qu'une fiche est citée ?
- [decision] Script dédié dans `.githooks/` (mécanique du kit, risque HIGH) ou script de la couche `app/` ?
