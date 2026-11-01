# Chantier : une minicarte dans le casque, avec le point qui avance sur le tracé

**Statut** : cadré le 2026-11-01.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/carte-position-en-direct.md`

<!-- scope
files:
  - app/src/xr/minimap.ts
  - app/src/xr/minimap.test.ts
  - app/src/xr/hud-panel.ts
  - app/src/xr/hud-panel.test.ts
  - app/src/xr/pose.ts
  - app/src/xr/pose.test.ts
  - app/src/xr/frame.ts
  - app/src/xr/frame.test.ts
  - app/src/xr/experience.ts
  - app/src/xr/experience.test.ts
  - app/src/xr/experience-double.ts
  - app/src/route/simplify.ts
  - app/src/route/simplify.test.ts
  - app/e2e/*
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
  - README.md
-->

## 1. Besoin

Le demandeur veut voir, pendant la marche, **le parcours évoluer sur une carte** : par exemple une course de Vidauban à
Sainte-Maxime, avec un point qui avance sur le tracé. Aujourd'hui le casque n'a ni carte ni tracé, et la page n'est pas
visible en réalité mixte.

## Critères d'acceptation

- Une minicarte flotte dans le casque et montre le tracé du parcours avec un point à la position courante, qui avance avec
  la marche ; le tracé seul, sans fond de tuiles ni appel réseau — `APP-002`
- Le tracé d'un parcours long est simplifié sous un plafond de points testé, et la carte ne se redessine que lorsque la
  position a bougé d'un pas — `APP-002`
- La minicarte est posée hors de la zone tapis, suit le fondu tête baissée, se masque avec le panneau d'infos (bouton B),
  reste cachée sans pose de la tête, et ne crée ni ciel ni fond opaque — `APP-001`
- Le point avance le long du parcours dans le Quest 3 émulé, sur un itinéraire figé comme sur un trajet libre — `QUA-020`
- La lisibilité de la carte, sa place dans le champ de vision et le tapis resté visible sont jugés sur un vrai Quest 3
  [human] — `APP-001`

## Contrats modifiés

- `APP-001` — point 5 : le panneau d'infos du casque est complété par une minicarte, qui suit le même fondu, se masque avec lui
  et reste hors de la zone tapis (à approuver à la validation de cette fiche).
- `APP-002` — la marche affiche le tracé du parcours et la position courante sur une minicarte du casque (à approuver à la
  validation de cette fiche).
- `QUA-020` — chemins e2e à jour pour la minicarte.

## 2. Hors périmètre

- Un fond de tuiles OpenStreetMap et tout appel réseau pendant la marche (`APP-003`) ; la carte sur la page ou sur un écran
  voisin.
- La carte de l'accueil (`app/src/ui/map-picker.ts`) et le zoom ou le déplacement dans la minicarte.
- Le dénivelé, les étapes et le mini-globe de la maquette (`docs/intentions/hud-casque.md`).
- La place et le fond du panneau d'infos : `docs/projects/panneau-discret.md`, à lancer avant.

## 3. Contraintes

- `APP-001` ne régresse pas : la minicarte est dans la scène, fondue et placée hors de la zone tapis.
- Tenir 72 images par seconde : une petite texture redessinée seulement quand la position a bougé d'un pas, un tracé réduit.
- Aucun appel réseau : le tracé vient du fichier de l'itinéraire ou du trajet libre déjà calculé.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-11-01, décisions humaines du demandeur : la carte est dans le casque ; le tracé seul, sans fond de tuiles.
- 2026-11-01, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : taille, échelle, orientation
  (nord en haut ou tête en haut), couleurs, côté et hauteur, plafond de points.
- À lancer après `panneau-discret` : les deux touchent `app/src/xr/pose.ts` et `app/src/xr/hud-panel.ts`, jamais en même temps.
- Contrats concernés : `APP-001`, `APP-002`, `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : l'orientation et la taille sont des choix techniques, rouverts par l'essai au casque)*

## 6. Lots

- **Lot 1 — tracé simplifié** [AI] : réduire le tracé sous un plafond de points, tests. Sortie : `run-checks` vert.
- **Lot 2 — minicarte dans la scène** [AI] : dessin du tracé et du point, place hors de la zone, fondu, masquage par B.
  Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : e2e sur itinéraire figé et trajet libre, docs, contrats à jour. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : juger la lisibilité, la place et le tapis visible sur le Quest 3.

## 7. Reprise

- **Dernier état** (2026-11-01) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/retours-carte-poste`.
- **Prochaine étape** : [AI] lot 1.
