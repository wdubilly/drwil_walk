# Chantier : éclairage et ambiance de la ville

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : à affiner
**Intention** : `docs/intentions/rendu-eclairage-ambiance.md`

<!-- scope
files:
  - app/src/city/*
  - app/src/xr/*
  - app/src/pc/*
  - app/src/render/*
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/e2e/*
  - .drwil/ia-first.json
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - app/AGENTS.md
  - README.md
-->

## 1. Besoin

Une lumière crédible qui suit l'heure réelle, un ciel et un brouillard virtuels **à condition de ne jamais couvrir le réel
visible**, et des sons d'ambiance facultatifs, coupés par défaut. Tout est réglable par le profil graphique.

## Critères d'acceptation

- L'éclairage de la ville suit l'heure locale réelle de l'utilisateur ; un repli fixe s'applique si l'heure est illisible —
  `APP-011`
- Au casque, aucun ciel ni brouillard ne réduit la visibilité du réel : la sécurité-visibilité reste testée avec chaque effet
  actif — `APP-001`
- Sur PC et tablette (sans passthrough), un ciel et un brouillard virtuels sont permis — `APP-011`
- Les sons d'ambiance sont coupés par défaut, se règlent à l'accueil et se coupent d'un geste ; aucun son n'est joué sans
  choix de l'utilisateur — `APP-011`
- Chaque effet se règle par le profil graphique et garde un repli désactivé — `APP-011`
- La marche se rejoue avec chaque effet actif, sans erreur — `QUA-020`
- La crédibilité de la lumière et le confort des sons sur un vrai Quest 3 [human] — `APP-011`

## Contrats modifiés

*(à déterminer au lot 1 : le choix du passthrough sans ciel virtuel est tranché le 2026-10-31, `docs/intentions/rendu-ville.md`)*

## 2. Hors périmètre

- Les ombres portées : coûteuses, à décider après les mesures (`docs/intentions/rendu-mesures-diagnostic.md`).
- Les reflets, surfaces mouillées et la pluie.
- Les façades et le mobilier (autres fiches).

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` prime sur tout effet d'ambiance.
- Le casque a déjà ses propres sons : un son ne doit pas masquer les bruits du réel (risque de chute).
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Dépend des profils graphiques et des façades détaillées.

## 4. Décisions

- 2026-11-03 : un ciel ou un brouillard virtuel est acceptable **à condition de ne jamais couvrir le réel visible**.
- 2026-11-03 : **sons d'ambiance facultatifs, coupés par défaut**.
- 2026-11-03 : l'heure de la journée suit **l'heure réelle**.

## 5. Points à trancher

- [decision] Au casque, un brouillard même léger est-il admis, ou seulement sur PC et tablette ? Définir un seuil mesurable de
  « réel visible » avant de coder.
- [decision] Les sons coupent-ils le bruit du réel : sons au casque admis, ou seulement PC et tablette ?
- [human] Les effets sur un vrai Quest 3.

## 6. Lots

- **Lot 1 — cadrage de la sécurité** [decision] : trancher les deux points ci-dessus, puis écrire le contrat `APP-011`.
- **Lot 2 — lumière selon l'heure** [AI] : éclairage et ciel PC et tablette. Sortie : tests verts.
- **Lot 3 — sons facultatifs** [AI] : réglage à l'accueil, coupés par défaut. Sortie : tests verts.
- **Lot 4 — profils, e2e et doc** [AI] : réglage par profil, e2e, docs. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [decision] points de la section 5, après les façades.
