# Chantier : pause, recalibrage et panneau d'infos dans le casque

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/commandes-panneau.md`

<!-- scope
files:
  - app/src/xr/*
  - app/src/xr/joystick.test.ts
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
  - app/src/safety/*
  - app/src/route/walk.ts
  - app/src/route/walk.test.ts
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

Dans le casque, l'utilisateur n'a aujourd'hui que le joystick droit pour régler la vitesse. `MISSION.md` (§ 4.2) prévoit
trois autres commandes : la gâchette droite pour mettre en pause et reprendre, le bouton A pour recalibrer (« je suis face
au tapis »), le bouton B pour afficher ou masquer le panneau d'infos (vitesse, distance, temps, lieu), lisible **dans le
casque** et non plus seulement sur la page web.

## Critères d'acceptation

- La gâchette droite met la marche en pause et la reprend : l'avancée s'arrête, la vitesse réglée est conservée, la ville
  reste affichée et le fondu de sécurité continue de s'appliquer — `APP-002`
- Le bouton A recalibre : la position de départ et l'orientation du parcours se recalent sur l'endroit et la direction où
  l'utilisateur regarde, sans toucher à la distance déjà parcourue — `APP-002`
- Le bouton B masque et réaffiche le panneau d'infos, un texte flottant devant soi, dans la scène (vitesse, distance,
  temps et lieu), affiché par défaut dès le départ — `APP-002`
- Le panneau dans le casque ne masque jamais le tapis : il suit le fondu de la ville, donc disparaît tête baissée, et il
  reste borné dans le champ de vision [humain] — `APP-001`
- Un appui sur une commande ne déclenche qu'une action (pas de répétition tant que le bouton reste tenu) — `APP-002`
- Les trois commandes sont rejouées de bout en bout dans le Quest 3 émulé : pause, recalibrage, panneau — `QUA-020`

## 2. Hors périmètre

- La maquette complète du casque (tableau de bord de marche, défis, boussole, mini-globe, barre de commandes visée au
  pointeur) : `docs/intentions/hud-casque.md`, chantier ultérieur qui s'appuiera sur celui-ci.
- Le panneau attaché au poignet : écarté, texte flottant devant soi seulement.
- La zone tapis et la vignette réelle : `docs/intentions/zone-tapis-vignette.md`.
- Un menu de réglage de l'opacité globale dans le casque.
- Le panneau sur la page web (`app/src/ui/panel.ts`) : il reste tel quel, hors casque.

## 3. Contraintes

- `APP-001` est un contrat testé : rien de ce chantier ne doit pouvoir masquer le tapis ; le panneau passe par le même
  fondu que la ville.
- Un changement de session XR ne doit pas casser le mode `immersive-ar` (`APP-001`, point 4).
- Aucun appel réseau, aucune donnée enregistrée : la pause et le recalibrage ne vivent que le temps de la session.
- Tenir 72 images par seconde : le texte du panneau n'est redessiné que lorsqu'une valeur affichée change, comme le
  panneau de la page.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Aucun secret dans le dépôt (`SEC-007`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : le panneau est un texte flottant devant soi ; la pause ne fige que
  l'avancée ; ce chantier couvre les trois commandes de `MISSION.md`, pas la maquette complète.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : distance, taille et position
  du panneau dans le champ de vision ; seuil d'appui d'un bouton ; police et mise en page du texte ; ce que « recalibrer »
  recale exactement (origine et cap du parcours dans l'espace de référence).
- Contrats concernés : `APP-001`, `APP-002`, `QUA-004`, `QUA-001`, `QUA-020`, `SEC-007`.

## Contrats modifiés

- `APP-002` — la marche suit le parcours : ajout de la pause (l'avancée s'arrête, rien d'autre ne change) et du recalibrage
  (le parcours se recale sans changer la distance parcourue) — raison : décisions de `MISSION.md` § 4.2 (approuvé le
  2026-10-31).

## 5. Points à trancher

*(aucun : le panneau attaché au poignet et la maquette complète sont hors de ce chantier)*

## 6. Lots

- **Lot 1 — lecture des commandes** [AI] : gâchette, bouton A, bouton B lus sur la manette droite, un appui = une action.
  Sortie : tests verts.
- **Lot 2 — pause et recalibrage** [AI] : la marche s'arrête et reprend sans perdre la vitesse ; le parcours se recale sur
  le regard sans changer la distance. Sortie : `run-checks` vert.
- **Lot 3 — panneau dans la scène** [AI] : texte flottant, redessiné seulement quand une valeur change, soumis au fondu de
  sécurité. Sortie : `run-checks` vert.
- **Lot 4 — e2e et doc** [AI] : e2e des trois commandes, docs et contrats à jour. Sortie : CI verte.
- **Lot 5 — essai réel** [human] : juger sur le Quest 3 la lisibilité du panneau, sa place et le tapis resté visible.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : la fiche et la mise à jour de l'intention, sur la branche `cadrage/commandes-panneau`.
- **Prochaine étape** : [AI] lot 1, une fois le cadrage commité et fusionné.
