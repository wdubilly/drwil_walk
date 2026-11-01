# Chantier : un panneau d'infos discret (fond transparent, en bas à gauche ou à droite)

**Statut** : cadré le 2026-11-01.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/essai-casque-tableau-de-bord.md`

<!-- scope
files:
  - app/src/xr/hud-panel.ts
  - app/src/xr/hud-panel.test.ts
  - app/src/xr/pose.ts
  - app/src/xr/pose.test.ts
  - app/src/xr/experience.ts
  - app/src/xr/experience.test.ts
  - app/src/xr/experience-double.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/ui/home.css
  - app/src/ui/panel-side.ts
  - app/src/ui/panel-side.test.ts
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

Premier retour d'un essai du tableau de bord au casque : le panneau d'infos, posé au centre devant le regard sur un fond
opaque, gêne. Le demandeur veut revoir son affichage : **un fond légèrement transparent**, et une place **en bas, à gauche
ou à droite**, plutôt qu'au milieu du champ de vision. Le côté se règle à l'accueil. Le contenu du panneau ne change pas.

## Critères d'acceptation

- Le fond du panneau est légèrement transparent : la réalité se devine derrière, et le texte reste lisible (contraste
  minimal testé) [human] — `APP-001`
- Le panneau se place en bas du champ de vision, décalé sur le côté choisi, à l'horizontale, tourné vers soi, et il suit le
  cap du regard [human] — `APP-001`
- Le panneau tout entier reste hors de la zone tapis, avec la boîte par défaut comme avec une zone réglée plus haute ou plus
  large ; sans pose de la tête, il reste caché [human] — `APP-001`
- Le panneau garde son fondu tête baissée et son masquage par le bouton B [human] — `APP-001`
- Le côté (gauche ou droite) se choisit à l'accueil, est gardé dans ce navigateur seulement, a un côté par défaut, et une
  valeur illisible est remplacée par ce défaut — `APP-002`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec le panneau de chaque côté — `QUA-020`
- La lisibilité du texte sur fond transparent, le confort de la place et le tapis resté visible sont jugés sur un vrai
  Quest 3 [human] — `APP-001`

## Contrats modifiés

- `APP-001` — point 5 : le panneau d'infos du casque « n'est posé qu'à l'horizontale devant le regard, un peu sous les yeux »
  devient posé en bas du champ de vision, décalé sur le côté choisi, sur un fond légèrement transparent, et il reste hors de la
  zone tapis (à approuver à la validation de cette fiche).
- `APP-002` — le tableau de bord du casque se place du côté choisi à l'accueil, gardé en local (à approuver à la validation
  de cette fiche).
- `QUA-020` — chemins e2e à jour pour les deux côtés.

## 2. Hors périmètre

- Le contenu du panneau (cap, heure, lieu, vitesse, durée, distance, calories) et son éclatement en plusieurs panneaux comme
  la maquette : `docs/intentions/essai-casque-tableau-de-bord.md`.
- Une transparence réglable, ou un placement réglable à la manette : un côté choisi à l'accueil suffit.
- Le lissage du suivi du cap : `docs/intentions/essai-casque-commandes-panneau.md`.
- Le message de pause quand le panneau est masqué, les nouveaux panneaux du voyage guidé et des défis
  (`docs/projects/hud-voyage-guide.md`, `docs/projects/hud-defis-progression.md`).
- La zone tapis elle-même (`app/src/safety/zone.ts`) : le panneau s'y adapte, elle ne change pas.

## 3. Contraintes

- `APP-001` ne régresse pas : le panneau reste hors de la zone tapis, ne masque rien du réel au-delà de son fond léger, et
  disparaît tête baissée.
- Tenir 72 images par seconde : un seul maillage, une texture redessinée seulement quand une valeur change.
- Aucun appel réseau, aucune donnée envoyée : le côté est gardé dans ce navigateur (comme le poids).
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-11-01, décisions humaines du demandeur : fond légèrement transparent ; panneau en bas, à gauche ou à droite ; le côté se
  choisit à l'accueil.
- 2026-11-01, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : niveau de transparence, angle
  latéral et descente du panneau, taille, côté par défaut, clé de stockage.
- À lancer avant `hud-voyage-guide` et `hud-defis-progression` : les trois touchent `app/src/xr/`, jamais en même temps.
- Contrats concernés : `APP-001`, `APP-002`, `QUA-001`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : le côté par défaut et le niveau de transparence sont des choix techniques, rouverts par l'essai au casque)*

## 6. Lots

- **Lot 1 — place et fond** [AI] : fond transparent, placement en bas et sur le côté, tests de la zone tapis (boîte par défaut
  et zone réglée). Sortie : `run-checks` vert.
- **Lot 2 — choix du côté** [AI] : réglage à l'accueil, stockage local, défaut. Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : e2e des deux côtés, docs, contrats à jour. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : juger la lisibilité, la place et le tapis visible sur le Quest 3.

## 7. Reprise

- **Dernier état** (2026-11-01) : lots 1 à 3 codés et testés en local (Vitest 100 % de couverture, tsc, taille des fichiers, e2e
  `app/e2e/panneau-discret.test.ts` vert) : fond à 70 % d'opacité, place hors de la zone tapis (`app/src/xr/pose.ts`), côté choisi
  à l'accueil (`app/src/ui/panel-side.ts`), docs et contrats à jour. Lot 4 (essai réel) : [human].
- **Travail non commité** : rien ; code commité (3637c0a) et poussé sur `workstream/panneau-discret`.
- **Prochaine étape** : `npx drwil verify --agent` (les quatre critères automatiques citant `APP-001` sont marqués [human] sur décision de l'humain), puis journal, `node .githooks/close.mjs`, PR.
