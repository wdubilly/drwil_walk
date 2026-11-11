# Intention : une zone projet du workflow CI avant les contrôles et dans le job des tranches

**Statut** : proposée le 2026-11-11 ; cadrage, rien n'est décidé ni planifié. Touche le kit drwil (modèle du workflow), pas seulement ce dépôt.

## Besoin

Né du chantier `ci-allegee` : les installations propres au projet (dépendances de `app/`, diff-cover, Chromium) doivent
tourner avant `run-checks` dans le job `checks`, et dans le job `shards`. Le modèle du kit (0.11.1) ne laisse qu'une zone
`steps` en fin de job `checks`, après le rejeu, et aucune zone dans le job `shards`. Une montée du kit réécrirait ces
installations, et la CI perdrait l'e2e ou la couverture sans bruit.

## Existant

Lu le 2026-11-11.

- `.github/workflows/ia-first.yml` : les installations sont ajoutées à la main dans le modèle des jobs `shards` et `checks`,
  hors des marqueurs `drwil-project-begin|end steps|jobs`, lesquels sont vides.
- Le correctif ne tient pas dans ce dépôt : le modèle vient du kit, `docs/projects/ci-allegee.md` interdit de le modifier hors
  du bloc scope, et un contournement (job projet complet dans la zone `jobs`) dupliquerait la logique des tranches.

## Piste

Ouvrir une PR dans le kit drwil : une zone `steps-before-checks` dans le job `checks` et une zone dans le job des tranches.
En attendant, vérifier après chaque montée du kit que `npx drwil doctor` ne signale rien et que les installations sont
toujours là (`git diff` sur le workflow).

## Questions à trancher

- Une zone dans le job des tranches suffit-elle, ou faut-il une zone commune à tous les jobs de contrôle ?
- Faut-il un contrôle (`doctor`) qui échoue si un `run-checks` en CI tourne sans les dépendances déclarées par le projet ?

## Reprise

2026-11-11 : intention notée à la fin du chantier `ci-allegee` ; aucune action en cours. Prochaine étape : décision du
demandeur sur une PR dans le kit.
