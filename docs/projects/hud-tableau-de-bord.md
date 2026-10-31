# Chantier : le tableau de bord de marche dans le casque

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/hud-casque.md`

<!-- scope
files:
  - app/src/xr/*
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/route/walk.ts
  - app/src/route/walk.test.ts
  - app/src/route/stats.ts
  - app/src/route/stats.test.ts
  - app/src/safety/*
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

La maquette du casque montre à gauche un tableau de bord de marche : vitesse, durée, distance et calories ; en haut, une
boussole et le lieu courant ; en haut à droite, l'heure. Ce chantier étend le panneau flottant de `commandes-panneau`
(vitesse, distance, temps, lieu) à ce tableau de bord, affiché dès le départ.

## Critères d'acceptation

- Le tableau de bord est affiché par défaut dans le casque ; le bouton B le masque et le réaffiche — `APP-002`
- Il montre la vitesse, la durée et la distance, justes : la distance est égale à la vitesse réglée multipliée par le temps
  de marche — `APP-002`
- Il montre une estimation de calories, étiquetée « environ », calculée depuis la vitesse, la durée et le poids de
  l'utilisateur ; sans poids saisi, une valeur moyenne fixe est utilisée — `APP-002`
- Le poids se saisit une fois à l'accueil, est facultatif, et n'est gardé que dans le navigateur du Quest ; il peut être
  effacé — `SEC-007`
- Il montre une boussole et le lieu courant (nom de la rue ou du lieu, lu dans l'extrait) ; sans nom connu, il le dit
  proprement — `APP-003`
- Il montre l'heure locale — `APP-002`
- Tout le tableau de bord suit le fondu tête baissée, reste hors de la zone tapis et ne se pose pas là où il masquerait le
  tapis [humain] — `APP-001`
- Le tableau de bord est rejoué de bout en bout dans le Quest 3 émulé — `QUA-020`

## Contrats modifiés

- `APP-002` — l'affichage de la marche s'ajoute (calories estimées, lieu, boussole, heure) ; la règle du parcours et de la
  distance ne change pas (approuvé le 2026-10-31).

## 2. Hors périmètre

- Le dénivelé : aucune source d'élévation (`docs/intentions/osm-enrichi.md`) ; absent de ce chantier.
- Les défis, l'objectif annuel : `docs/projects/hud-defis-progression.md`.
- Les étapes et la prochaine étape : `docs/projects/hud-voyage-guide.md`.
- Le mini-globe et la barre de commandes visée au pointeur : `docs/intentions/hud-casque.md`.

## 3. Contraintes

- Dépend de `commandes-panneau` (le panneau dans la scène) et de `zone-tapis-vignette` (la place du HUD) : à lancer après eux.
- Donnée personnelle : le poids est la seule donnée personnelle du projet ; elle est facultative, locale (`localStorage`),
  jamais envoyée, effaçable. Le texte de `AGENTS.md` (« aucune donnée personnelle ») est à ajuster au lot 1 : décision du
  demandeur du 2026-10-31.
- Tenir 72 images par seconde : le texte n'est redessiné que lorsqu'une valeur affichée change.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Aucun secret dans le dépôt (`SEC-007`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : tableau de bord affiché par défaut et masqué par B ; calories estimées
  « environ » ; poids saisi une fois à l'accueil et gardé en local ; dénivelé absent faute de source.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : formule des calories, mise en
  page, taille et position, boussole (cap lu sur la direction du parcours), source de l'heure.
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `SEC-007`, `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — valeurs et poids** [AI] : calories, saisie locale du poids, texte de gouvernance ajusté. Sortie : tests verts.
- **Lot 2 — tableau de bord dans la scène** [AI] : vitesse, durée, distance, calories, boussole, lieu, heure ; fondu de sécurité.
  Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : e2e, docs, contrats à jour. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : lisibilité et place sur le Quest 3, tapis visible.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/commandes-panneau`.
- **Prochaine étape** : [AI] lot 1, après `commandes-panneau` et `zone-tapis-vignette`.
