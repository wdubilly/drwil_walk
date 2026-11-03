# Chantier : comparer la marche virtuelle à la vraie marche (temps, distance, allure)

**Statut** : cadré le 2026-11-01.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/course-reelle-entrainement.md`

<!-- scope
files:
  - app/src/route/sessions.ts
  - app/src/route/sessions.test.ts
  - app/src/ui/history.ts
  - app/src/ui/history.test.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/ui/home.css
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
  - app/src/main.ts
  - app/src/main.test.ts
  - app/src/xr/experience.ts
  - app/src/xr/experience.test.ts
  - app/src/xr/experience-double.ts
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

Un message reçu le 2026-11-01 décrit l'usage : simuler une marche virtuelle (par exemple pour aller chez quelqu'un), puis,
si l'on est bien entraîné, la transformer en vraie marche et **comparer l'effort et le temps**. Le demandeur veut garder les
séances virtuelles, noter à la main la vraie marche du même parcours, et voir l'écart.

## Critères d'acceptation

- À la fin d'une séance (arrêt à l'arrivée, ou sortie de la marche), la marche virtuelle est gardée dans un historique :
  itinéraire, date, durée, distance et allure moyenne — `APP-002`
- On saisit à la main la vraie marche d'un même parcours : date, durée et distance ; une saisie incohérente (durée ou distance
  nulle, négative ou hors bornes) est refusée en disant pourquoi — `APP-002`
- L'accueil compare, pour un même parcours, la marche virtuelle et la vraie : écart de temps, de distance et d'allure, dits en
  clair — `APP-002`
- L'historique est gardé dans ce navigateur seulement, effaçable (une séance ou tout), et jamais envoyé ; un stockage refusé
  ou illisible est dit à l'écran, et les séances de la session restent visibles — `QUA-002`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé : une séance est gardée, une vraie marche saisie, la comparaison
  lue à l'accueil — `QUA-020`

## Contrats modifiés

- `APP-002` — la marche garde ses séances dans un historique local, avec la saisie d'une vraie marche et la comparaison (à
  approuver à la validation de cette fiche).
- `QUA-020` — chemin e2e de l'historique et de la comparaison.

## 2. Hors périmètre

- L'import d'un fichier GPX de la vraie sortie, l'export de l'historique en fichier, la synchronisation entre appareils.
- Un ressenti d'effort, les calories comparées, la fréquence cardiaque et tout capteur.
- Les graphiques et les statistiques de progression : la distance cumulée des défis est dans
  `docs/projects/hud-defis-progression.md`, dont la source est à ne pas dupliquer.
- La reprise d'une séance là où elle s'est arrêtée et l'allure ou le temps cible : `docs/intentions/course-reelle-entrainement.md`.

## 3. Contraintes

- Aucune donnée n'est envoyée, aucun compte : l'historique reste dans ce navigateur, comme le poids (`app/src/route/stats.ts`).
  Le texte « aucune donnée personnelle » du fichier `AGENTS.md` à la racine est à ajuster à part
  (`docs/intentions/texte-agents-donnee-personnelle.md`).
- `APP-001` ne régresse pas : rien de ce chantier n'ajoute de contenu dans la scène du casque ; l'historique vit à l'accueil.
- Une seule source pour la distance et la durée d'une séance : celles de la marche (`app/src/route/walk.ts`), pas un second
  calcul.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-11-01, décisions humaines du demandeur : la vraie marche se saisit à la main ; on compare le temps, la distance et
  l'allure ; l'historique est gardé dans ce navigateur, effaçable.
- 2026-11-01, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : clé et forme du stockage, bornes de
  la saisie, présentation de l'écart, nombre de séances gardées.
- À lancer après `tableau-allure-progression` (l'allure vient de son calcul) et après `hud-defis-progression` (la distance
  cumulée ne se duplique pas) ; il touche `app/src/ui/home.ts` comme plusieurs fiches, jamais en même temps.
- Contrats concernés : `APP-002`, `QUA-001`, `QUA-002`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun : la forme du stockage et de la comparaison sont des choix techniques)*

## 6. Lots

- **Lot 1 — stockage des séances** [AI] : modèle, enregistrement local, effacement, repli quand le stockage est refusé.
  Sortie : tests verts.
- **Lot 2 — enregistrement à la fin d'une séance** [AI] : séance gardée à l'arrivée ou à la sortie. Sortie : `run-checks` vert.
- **Lot 3 — saisie et comparaison** [AI] : saisie de la vraie marche, validation, comparaison à l'accueil. Sortie :
  `run-checks` vert.
- **Lot 4 — e2e et doc** [AI] : e2e, docs, contrats à jour. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-01) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/retours-carte-poste`.
- **Prochaine étape** : [AI] lot 1.
