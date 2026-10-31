# Chantier : un mode d'emploi pour installer et utiliser drwil_walk avec un Quest 3

**Statut** : cadré le 2026-10-31.
**Risque** : LOW
**Maturité** : prêt

<!-- scope
files:
  - docs/guide-utilisateur.md
  - INSTALL.md
  - docs/recipes/run-locally.md
  - README.md
-->

## 1. Besoin

Le demandeur veut un **mode d'emploi pour l'installation**, lisible par quelqu'un qui n'est pas développeur :
de zéro jusqu'à la première marche sur le tapis avec le Quest 3. `INSTALL.md` existe déjà mais s'adresse à un
poste de développement (clonage, gouvernance, contrôles).

## Critères d'acceptation

- Le guide utilisateur (nouveau fichier, voir le bloc scope) décrit pas à pas : prérequis (Node, poste et Quest 3 sur le même réseau), lancer
  l'application, ouvrir l'adresse Network dans le navigateur du Quest, accepter le certificat auto-signé,
  entrer en réalité mixte, choisir l'itinéraire, régler la vitesse — `QUA-011`
- Il explique l'installation du tapis et la **sécurité** : zone dégagée, rappel de l'accueil, fondu de la ville
  quand on baisse la tête, la ville n'est jamais un substitut à la vigilance [humain] — `APP-001`
- Il liste les ennuis connus avec leur remède (certificat, bouton grisé sans WebXR, casque sur un autre réseau) — `QUA-011`
- Chaque commande citée est exécutée telle quelle avant d'être écrite (preuve avant affirmation) ; ce qui n'a pu
  être essayé sans casque est signalé « non vérifié » — `QUA-011`
- README.md et INSTALL.md renvoient au guide, sans en copier le contenu (une information, une source) — `QUA-011`

## 2. Hors périmètre

- Tout code de l'application ; l'hébergement permanent (le guide couvre le poste local, `npm run dev`).
- Les itinéraires à venir : le guide ne cite que ceux disponibles.

## 3. Contraintes

- Français, ton simple, captures éventuelles tirées des captures e2e déjà produites.
- Doc seule : la PR part en fusion automatique (règle « Documentation-only PR »).

## 4. Décisions

- 2026-10-31, décision humaine du demandeur : un **guide utilisateur Quest 3**, pas seulement une mise à jour
  d'`INSTALL.md`.
- Hypothèse de cadrage : le guide est écrit **après** les itinéraires pour ne pas être périmé, mais il peut partir
  avant si seul le souk est cité.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — rédaction** [AI] : guide, renvois dans `README.md` et `INSTALL.md`. Sortie : `run-checks` vert.
- **Lot 2 — relecture** [human] : suivre le guide sur le vrai poste et le vrai Quest 3.

## 7. Reprise

- **Dernier état** (2026-10-31) : fiche cadrée, rien de rédigé.
- **Travail non commité** : aucun.
- **Prochaine étape** : [AI] lancer le chantier (`/drwil-start`).
