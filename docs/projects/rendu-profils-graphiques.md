# Chantier : des profils graphiques (casque, PC, tablette)

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/rendu-profils-graphiques.md`

<!-- scope
files:
  - app/src/render/profiles.ts
  - app/src/render/profiles.test.ts
  - app/src/render/capabilities.ts
  - app/src/render/capabilities.test.ts
  - app/src/ui/profile-choice.ts
  - app/src/ui/profile-choice.test.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/ui/home.css
  - app/src/main.ts
  - app/src/main.test.ts
  - app/src/city/*
  - app/src/xr/*
  - app/src/pc/*
  - app/e2e/*
  - .drwil/ia-first.json
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
  - README.md
-->

## 1. Besoin

Un réglage de qualité du rendu, indépendant de la logique de marche : trois profils figés (performance, équilibré,
qualité) qui règlent ensemble les options de rendu aujourd'hui dispersées (contours des bâtiments, ville riche, densité
des arbres et du mobilier, ratio de pixels). Le profil par défaut dépend de l'appareil (casque, PC, tablette), détecté par
ses capacités et non par le seul user-agent ; le demandeur peut le changer à l'accueil. Chaque réglage garde une valeur de
repli.

## Critères d'acceptation

- Trois profils figés existent (performance, équilibré, qualité) ; chacun fixe l'ensemble des réglages de rendu branchés,
  sans logique métier de marche — `APP-006`
- Le profil par défaut est choisi d'après les capacités détectées (WebXR, tactile, extensions graphiques), jamais d'après le
  seul user-agent ; une détection impossible retombe sur « équilibré » — `APP-006`
- Le profil se choisit à l'accueil, se garde dans le navigateur et s'applique au casque, au PC et à la tablette ; le choix
  manuel l'emporte sur la détection — `APP-006`
- Une valeur de profil inconnue ou corrompue dans le navigateur est ignorée et dite, jamais avalée en silence — `QUA-002`
- Aucun profil, « qualité » compris, n'assouplit la sécurité-visibilité : le réel reste visible quel que soit le profil —
  `APP-001`
- Les trois profils s'enchaînent dans le Quest 3 émulé sans changer le parcours ni la visibilité du réel — `QUA-020`
- Les images par seconde de chaque profil sur un vrai Quest 3 [human] — `APP-006`

## Contrats modifiés

- `QUA-020` — ancien critère : « (14) la marche en rendu cartoon se rejoue avec et sans les contours des bâtiments, décochés par
  défaut à l'accueil » — raison : le profil graphique remplace les cases « contours » et « ville riche » de l'accueil ; la
  marche se rejoue avec chacun des trois profils, la ville riche et les contours étant réglés par le profil (approuvé le
  2026-11-03)

## 2. Hors périmètre

- Les effets pas encore construits (ombres, reflets, façades détaillées, niveaux de détail) : ils se brancheront sur les
  profils dans leurs propres fiches (`rendu-*`).
- Le retrait du code Google dormant.
- Un profil choisi automatiquement par les images par seconde mesurées : la mesure reste un diagnostic, pas un réglage.
- L'interface tactile de la tablette (`docs/projects/rendu-tablette-tactile.md`).

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`), un module pur a son test à côté
  (`QUA-006`).
- Texte à l'écran en français ; contraste conforme (`QUA-014`).

## 4. Décisions

- 2026-11-03 : **trois profils figés**, avec **choix manuel seulement** ; le défaut dépend de l'appareil (pas de profil
  automatique par appareil sans choix possible).
- 2026-11-03 : le profil « qualité » est **proposé partout**, sans refus fondé sur les mesures ; le risque est assumé par le
  demandeur.
- 2026-11-03 : le profil **remplace** les cases « contours » et « ville riche » de l'accueil : une seule commande règle le
  rendu.
- 2026-11-03 : ce chantier livre l'ossature **et tous les réglages actuels du rendu** (contours, ville riche, densité des
  arbres et du mobilier, ratio de pixels), pas seulement une ossature vide.

## 5. Points à trancher

- [human] Les images par seconde de chaque profil sur un vrai Quest 3.

## 6. Lots

- **Lot 1 — profils et détection** [AI] : modules purs app/src/render/profiles.ts et capabilities.ts (à créer), avec leurs tests. Critère de
  sortie : tests verts, couverture 100 %.
- **Lot 2 — choix à l'accueil et mémorisation** [AI] : app/src/ui/profile-choice.ts (à créer) sur le modèle du côté du
  panneau (`app/src/ui/panel-side.ts`), valeur invalide dite. Critère de sortie : tests de l'accueil verts.
- **Lot 3 — branchement des réglages** [AI] : contours, ville riche, densité, ratio de pixels lus depuis le profil au
  casque, au PC et à la tablette. Critère de sortie : e2e des trois profils dans le Quest 3 émulé.
- **Lot 4 — documentation et essai casque** [AI] : docs, contrat `APP-006`, intention d'essai au casque.

## 7. Reprise

- **Dernier état** (2026-11-03) : lots 1 à 4 livrés ; reste l'essai au casque [human] (`docs/intentions/essai-casque-profils-graphiques.md`).
- **Travail non commité** : aucun une fois la clôture commitée.
- **Prochaine étape** : clôture, puis essai au casque par l'humain.
