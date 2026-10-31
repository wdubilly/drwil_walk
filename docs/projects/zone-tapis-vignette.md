# Chantier : zone tapis toujours transparente et vignette réelle

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/zone-tapis-vignette.md`

<!-- scope
files:
  - app/src/safety/*
  - app/src/xr/*
  - app/src/city/*
  - app/src/ui/*
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

`MISSION.md` (§ 4.3) prévoit deux protections encore absentes. La **zone tapis** : un volume autour du tapis, défini à la
manette, que la ville ne recouvre jamais pour que le tapis, la rampe et la console réels restent visibles. La **vignette
réelle** : la périphérie du champ de vision reste en passthrough. Aujourd'hui seul le fondu tête baissée existe ; le point
(2) d'`APP-001` n'est prouvé par aucun test et reste vérifié à la main.

## Critères d'acceptation

- Un volume « zone tapis » n'est jamais recouvert par la ville : rien n'est rendu à l'intérieur, quel que soit l'angle de
  la tête ou l'opacité réglée — `APP-001`
- Sans zone enregistrée, la marche démarre avec une boîte par défaut autour de la position de départ : le tapis est
  protégé dès le premier lancement — `APP-001`
- L'utilisateur pose la boîte devant lui puis la déplace et la redimensionne à la manette ; la zone est enregistrée en
  `localStorage` et relue au lancement suivant — `APP-001`
- Une zone enregistrée illisible ou aberrante est remplacée par la boîte par défaut, jamais par une zone vide — `APP-001`
- La vignette réelle est activée par défaut : la périphérie du champ de vision reste en passthrough ; elle peut être
  désactivée — `APP-001`
- Le tapis reste visible et la zone se règle bien à la manette sur un vrai Quest 3 [humain] — `APP-001`
- La zone et la vignette sont rejouées de bout en bout dans le Quest 3 émulé — `QUA-020`

## Contrats modifiés

- `APP-001` — former criterion : « (2) le volume zone tapis défini par l'utilisateur est toujours rendu transparent », avec
  le champ Manual (point sans test). Raison : le point (2) est codé et testé, le champ Manual est retiré ; la vignette
  réelle rejoint la règle. Les points (1), (3) et (4) ne changent pas (approuvé le 2026-10-31).

## 2. Hors périmètre

- Les commandes de pause, de recalibrage et le panneau d'infos : `docs/projects/journal.md`, à faire avant celui-ci
  (les deux touchent `app/src/xr/*` et `app/src/main.ts`).
- Un menu d'opacité globale dans le casque.
- La maquette complète du casque : `docs/intentions/hud-casque.md`.
- Plusieurs zones ou plusieurs tapis.

## 3. Contraintes

- `APP-001` est un contrat testé, et ce chantier le complète : la zone ne peut que réduire ce qui est rendu, jamais
  l'augmenter. Une pose ou une zone illisible montre le réel (comme `headDownFactor`).
- La session reste `immersive-ar` (`APP-001`, point 4).
- Aucune donnée personnelle : la zone enregistrée n'est qu'un volume en mètres, dans `localStorage`, sans compte ni serveur.
- Tenir 72 images par seconde : l'évidement de la zone ne doit pas coûter un rendu supplémentaire par image.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Aucun secret dans le dépôt (`SEC-007`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : boîte posée puis ajustée à la manette ; vignette activée par défaut ;
  sans zone enregistrée, une boîte par défaut autour de soi protège le tapis.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit), fixés au lot 1 : dimensions de la boîte par
  défaut, boutons utilisés pour la poser et l'ajuster sans entrer en conflit avec la gâchette, A et B de
  `commandes-panneau`, méthode pour rendre la zone transparente (découpe ou plans de coupe), forme et largeur de la
  vignette, endroit du réglage qui la désactive.
- Dépend de `commandes-panneau` : à lancer après lui.
- Contrats concernés : `APP-001`, `QUA-001`, `QUA-004`, `QUA-020`, `SEC-007`.

## 5. Points à trancher

*(aucun : les dimensions et les boutons sont des choix techniques de l'agent)*

## 6. Lots

- **Lot 1 — la zone, en logique pure** [AI] : boîte par défaut, validation d'une zone lue, enregistrement. Sortie : tests
  verts.
- **Lot 2 — la zone, rendue** [AI] : la ville n'est jamais rendue dans la zone. Sortie : `run-checks` vert.
- **Lot 3 — pose et réglage à la manette** [AI] : poser, déplacer, redimensionner. Sortie : `run-checks` vert.
- **Lot 4 — vignette réelle** [AI] : périphérie en passthrough, activée par défaut, désactivable. Sortie : `run-checks` vert.
- **Lot 5 — e2e, doc et contrat** [AI] : e2e, retrait du champ Manual d'`APP-001`, docs à jour. Sortie : CI verte.
- **Lot 6 — essai réel** [human] : sur le Quest 3, vérifier que le tapis reste visible et que la zone se règle.

## 7. Reprise

- **Dernier état** (2026-11-01) : lots 1 à 5 codés et testés sur la branche `workstream/zone-tapis-vignette` (zone, découpe, réglage à la manette gauche, vignette, e2e chemin 13, docs, contrat `APP-001`). Lot 6 (essai réel) : réservé à l'humain, repris dans `docs/intentions/essai-casque-zone-tapis.md`.
- **Travail non commité** : voir `git status`.
- **Prochaine étape** : [human] attestation d'`APP-001` après l'essai au casque (`drwil attest APP-001`), puis clôture.
