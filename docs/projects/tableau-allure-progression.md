# Chantier : l'allure et la progression dans le tableau de bord

**Statut** : cadré le 2026-11-01.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/hud-casque.md`

<!-- scope
files:
  - app/src/route/stats.ts
  - app/src/route/stats.test.ts
  - app/src/route/walk.ts
  - app/src/route/walk.test.ts
  - app/src/xr/hud-panel.ts
  - app/src/xr/hud-panel.test.ts
  - app/src/xr/experience.ts
  - app/src/xr/experience.test.ts
  - app/src/xr/experience-double.ts
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
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

Une maquette reçue le 2026-11-01 (« Parcours Vidauban Centre, simulation 3,8 km ») montre un tableau de bord plus complet que
le nôtre : l'**allure** en minutes par kilomètre, la **distance parcourue et restante** et la **progression** en pourcentage.
Le tableau de bord actuel affiche cap, heure, lieu, vitesse, durée, distance et calories.

## Critères d'acceptation

- L'allure en minutes par kilomètre se calcule à partir de la vitesse courante, et reste lisible « — » à l'arrêt ou en pause
  plutôt qu'une valeur absurde — `APP-002`
- La distance restante et la progression en pourcentage s'affichent pour un parcours qui a une arrivée (trajet libre) ; pour
  une boucle, ce sont celles du tour en cours — `APP-002`
- Le panneau de la page et le tableau de bord du casque disent les mêmes valeurs — `APP-002`
- Le tableau de bord, plus chargé, reste hors de la zone tapis, fondu tête baissée et masqué par le bouton B — `APP-001`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé, l'allure, la distance restante et la progression étant lues
  dans le casque et sur la page — `QUA-020`
- La lisibilité du tableau de bord plus chargé et le tapis resté visible sont jugés sur un vrai Quest 3 [human] — `APP-001`

## Contrats modifiés

- `APP-002` — le tableau de bord du casque (cap, heure, lieu, vitesse, durée, distance, calories) est complété par l'allure, la
  distance restante et la progression (à approuver à la validation de cette fiche).
- `QUA-020` — chemin e2e à jour pour ces valeurs.

## 2. Hors périmètre

- Le dénivelé (+42 m sur la maquette) : aucune source d'élévation dans le dépôt.
- La position sur une carte (`docs/projects/carte-position-casque.md`), le prochain repère et les étapes
  (`docs/projects/hud-voyage-guide.md`), les boutons Carte, Profil et Options.
- La mise en page, la transparence et le côté du panneau : `docs/projects/journal.md`, à lancer avant.
- Relever la vitesse maximale de 8 km/h.

## 3. Contraintes

- `APP-001` ne régresse pas : le panneau grossit seulement dans la place fixée par `docs/projects/journal.md`, hors de
  la zone tapis.
- La vitesse reste plafonnée à 8 km/h : rien ici ne relève ce maximum, qui est un choix de sécurité sur le tapis.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-11-01, décisions humaines du demandeur : l'allure, la distance restante et la progression s'ajoutent, dans une fiche
  séparée ; le maximum reste 8 km/h.
- 2026-11-01, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : format de l'allure, valeur pour une
  boucle (le tour en cours), place dans le panneau.
- À lancer après `panneau-discret` : les deux touchent `app/src/xr/hud-panel.ts`, jamais en même temps.
- Contrats concernés : `APP-001`, `APP-002`, `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : la valeur pour une boucle est un choix technique, rouvert par l'essai au casque)*

## 6. Lots

- **Lot 1 — calculs** [AI] : allure, distance restante, progression, tests. Sortie : `run-checks` vert.
- **Lot 2 — affichage** [AI] : tableau de bord du casque et panneau de la page. Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : e2e, docs, contrats à jour. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : juger la lisibilité et le tapis visible sur le Quest 3.

## 7. Reprise

- **Dernier état** (2026-11-01) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/retours-carte-poste`.
- **Prochaine étape** : [AI] lot 1.
