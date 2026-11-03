# Chantier : éclairage et ambiance de la ville

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
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
  actif [human] — `APP-001`
- Sur PC et tablette (sans passthrough), un ciel et un brouillard virtuels sont permis — `APP-011`
- Les sons d'ambiance sont coupés par défaut, se règlent à l'accueil et se coupent d'un geste ; aucun son n'est joué sans
  choix de l'utilisateur — `APP-011`
- Chaque effet se règle par le profil graphique et garde un repli désactivé — `APP-011`
- La marche se rejoue avec chaque effet actif, sans erreur — `QUA-020`

Le jugement de la crédibilité de la lumière et du confort des sons au casque sort des tests : il est porté par
`docs/intentions/essai-casque-eclairage-ambiance.md`.

## Contrats modifiés

- `APP-011` (créé au lot 1) : l'ambiance ne cache jamais le réel — lumière de l'heure réelle avec repli de midi, brouillard
  éteint par défaut et plafonné à 0,15 d'opacité au casque (rien de voilé sous 8 m, désactivable entièrement), aucun ciel ni
  fond posé au casque, sons coupés par défaut et plafonnés, rien n'est gardé dans le navigateur, réglage par le profil avec
  repli désactivé.
- `APP-001` inchangé : l'ambiance ne touche pas à la sécurité-visibilité (aucun fond au casque, voile plafonné, rien de voilé
  sous 8 m) ; c'est `APP-011` qui porte ces garanties.
- `APP-006` complété : le brouillard d'ambiance fait partie des réglages du profil (« performance » le refuse) et un refus
  l'emporte sur la case de l'accueil.
- `QUA-020` complété : chemin 25, `app/e2e/eclairage-ambiance.test.ts`.
- Le choix du passthrough sans ciel virtuel au casque (tranché le 2026-10-31, `docs/intentions/rendu-ville.md`) est tenu :
  `scene.background` reste nul au casque.

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
- 2026-11-03 : **brouillard admis au casque**, opacité maximale **0,15** — seuil mesurable, donc testable sous
  `APP-001`. Trois conditions tenues ensemble : le brouillard est **désactivable entièrement** par l'utilisateur ;
  il ne masque **jamais un obstacle** ; il ne compromet **jamais la lisibilité du cheminement**. Ces trois points
  sont à traduire en critères testables dans `APP-011`.
- 2026-11-03 : **sons d'ambiance admis au casque**, coupés par défaut, sans jamais masquer les bruits du réel.

## 5. Points à trancher

- [human] Les effets sur un vrai Quest 3.

## 6. Lots

- **Lot 1 — contrat de sécurité** [AI] : écrire `APP-011` (opacité du brouillard au casque plafonnée à 0,15,
  brouillard désactivable, aucun obstacle masqué, cheminement toujours lisible, sons coupés par défaut), avec son
  test.
- **Lot 2 — lumière selon l'heure** [AI] : éclairage, ciel et brouillard, casque compris sous le plafond d'opacité.
  Sortie : tests verts.
- **Lot 3 — sons facultatifs** [AI] : réglage à l'accueil, coupés par défaut. Sortie : tests verts.
- **Lot 4 — profils, e2e et doc** [AI] : réglage par profil, e2e, docs. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-11-03) : lots 1 à 4 faits. `APP-011` écrit et contrôlé par `app-011` ; lumière de l'heure réelle
  (`app/src/render/daylight.ts`), brouillard plafonné (`app/src/render/fog.ts`), application à la scène
  (`app/src/xr/ambience.ts`) et sons facultatifs (`app/src/xr/ambience-sound.ts`) livrés, branchés au casque
  (`app/src/xr/experience.ts`) et au PC (`app/src/pc/enter-pc.ts`), réglés à l'accueil (`app/src/ui/home.ts`) et par le profil
  (`app/src/render/profiles.ts`) ; e2e `app/e2e/eclairage-ambiance.test.ts` (chemin 25) ; docs à jour.
- **Travail non commité** : aucun.
- **Prochaine étape** : clôture du chantier ; l'essai sur un vrai Quest 3 reste à faire
  (`docs/intentions/essai-casque-eclairage-ambiance.md`).
