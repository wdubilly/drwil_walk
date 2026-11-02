# Chantier : mesurer le rendu (images par seconde, appels de rendu, triangles)

**Statut** : cadré le 2026-11-02.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/rendu-mesures-diagnostic.md`

<!-- scope
files:
  - app/src/xr/diagnostics.ts
  - app/src/xr/diagnostics.test.ts
  - app/src/xr/diagnostics-report.ts
  - app/src/xr/diagnostics-report.test.ts
  - app/src/xr/experience.ts
  - app/src/xr/experience.test.ts
  - app/src/xr/hud-panel.ts
  - app/src/xr/hud-panel.test.ts
  - app/src/xr/buttons.ts
  - app/src/xr/buttons.test.ts
  - app/src/xr/experience-pc.test.ts
  - app/src/pc/*
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
  - app/src/ui/home.css
  - app/src/main.ts
  - app/src/main.test.ts
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

Le demandeur veut un bon rendu graphique, mais les 72 images par seconde du Quest 3 n'ont jamais été mesurées : aucun
compteur dans `app/src/`. Sans chiffre, aucun lot de rendu (`docs/intentions/rendu-jeu-video.md`) n'est vérifiable. Un
diagnostic de rendu, sur casque, PC et tablette, donne : images par seconde, temps d'image, appels de rendu, triangles,
objets visibles, mémoire graphique quand elle est lisible. Les mesures peuvent être consignées en fichier pour comparer
avant et après un changement.

## Critères d'acceptation

- Le diagnostic mesure les images par seconde (moyenne glissante), le temps d'image (moyen et pire sur la fenêtre), les
  appels de rendu et les triangles du dernier rendu (`renderer.info`), les objets visibles, et la mémoire graphique
  (géométries, textures) quand elle est lisible ; une valeur illisible est dite « indisponible », jamais inventée — `QUA-002`
- Le diagnostic est **masqué par défaut** : la marche démarre sans lui, et le mesurer ne change ni la vitesse réglée ni
  la distance parcourue — `APP-002`
- En version PC, une touche l'affiche et le masque (une pression, une action) ; sur casque et tablette, un bouton du
  panneau d'infos fait de même — `APP-002`
- Affiché, il suit le fondu tête baissée, reste hors de la zone tapis et ne masque aucune information de sécurité [humain
  sur casque] — `APP-001`
- Un bouton « Enregistrer les mesures » télécharge un fichier JSON (cible, ville, version, date, valeurs mesurées et leur
  fenêtre) pour comparer avant et après ; rien n'est envoyé, aucun appel réseau, aucune donnée personnelle — `SEC-007`
- Un téléchargement impossible est dit à l'écran, la marche continue — `QUA-002`
- Le diagnostic se rejoue de bout en bout : affiché, ses valeurs sont lues sur la page en version PC et dans le Quest 3
  émulé, masquées par défaut, et le fichier consigné est lu et validé — `QUA-020`

## Contrats modifiés

- `APP-002` : la liste des touches de la version PC reçoit la touche du diagnostic (écrit au lot 3 avec le test).

## 2. Hors périmètre

- Tout changement de rendu (profils, ombres, LOD, matériaux) : les autres fiches `rendu-*`.
- Un budget chiffré par profil : il se fixe après les premières mesures (`docs/intentions/rendu-mesures-diagnostic.md`).
- L'essai sur un vrai Quest 3 pour confirmer les chiffres : [human], lot 4. Les mesures d'un Chromium sans GPU ne valent
  pas celles du casque et ne s'annoncent jamais comme telles (`QUA-013`).
- Un envoi des mesures à un serveur, une télémétrie, un historique entre séances.

## 3. Contraintes

- Le coût du diagnostic masqué doit être nul ou négligeable : aucun calcul ni lecture de `renderer.info` quand il est
  masqué, hors le compteur d'images lui-même (à justifier par un test ou une mesure).
- Le rendu three.js reste injecté (`RendererLike`, `app/src/xr/experience.ts`) : les tests le remplacent par une doublure ;
  étendre ce type au strict nécessaire.
- Les calculs (fenêtre glissante, formatage, JSON) sont en logique pure testée à côté (`QUA-006`).
- Fichiers de 200 lignes au plus, couverture à 100 % sans exclusion, e2e vert en CI (`QUA-001`, `QUA-004`, `QUA-020`) ;
  `app/src/xr/experience.ts` approche la limite : sortir le code plutôt que l'allonger.

## 4. Décisions

- 2026-11-02, décision humaine du demandeur : diagnostic masqué par défaut ; touche en version PC, bouton dans le panneau
  d'infos sur casque et tablette.
- 2026-11-02, décision humaine du demandeur : mesures aussi consignées, fichier JSON téléchargeable.
- Choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : la touche, la taille de la fenêtre
  glissante, le schéma du JSON, le nom du fichier.
- Choix de l'agent au lot 2 : sur casque, la page n'est pas visible en session `immersive-ar` (aucun DOM overlay), un bouton
  de page y est inatteignable ; le diagnostic s'y bascule donc par le clic du joystick droit (seul bouton libre de la
  manette droite), le bouton de la page restant pour la tablette. L'enregistrement depuis le casque reste à décider :
  `docs/intentions/diagnostic-casque-enregistrer.md`.
- Contrats concernés : `APP-001`, `APP-002`, `SEC-007`, `QUA-001`, `QUA-002`, `QUA-004`, `QUA-006`, `QUA-013`, `QUA-020`.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — mesures en logique pure** [AI] : fenêtre glissante, lecture de `renderer.info`, valeurs indisponibles, schéma
  du JSON. Sortie : tests verts.
- **Lot 2 — affichage et commandes** [AI] : touche en version PC, bouton du panneau, affichage masqué par défaut, fondu
  tête baissée. Sortie : `run-checks` vert.
- **Lot 3 — consignation, e2e et doc** [AI] : téléchargement du JSON, e2e, contrat `APP-002`, docs. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : protocole d'essai sur Quest 3 (marche de quelques minutes sur chaque ville, fichier
  consigné) ; conclure si les 72 images par seconde tiennent.

## 7. Reprise

- **Dernier état** (2026-11-02) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/rendu-mesures-diagnostic`.
- **Prochaine étape** : [AI] lot 1.
