# Chantier : dire la limite de vitesse

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt

<!-- scope
files:
  - app/src/route/speed.ts
  - app/src/route/speed.test.ts
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/ui/home.css
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
  - app/e2e/*
  - docs/contracts.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - README.md
-->

## 1. Besoin

Un testeur a saisi 50 km/h à l'accueil et la vitesse n'a pas changé : `clampSpeedKmh` ramène toute valeur dans la plage de
1 à 8 km/h sans rien dire (`app/src/route/speed.ts`). La plage est voulue (`MISSION.md`, sécurité sur un tapis), mais le
bornage silencieux trompe l'utilisateur. Il faut le dire.

## Critères d'acceptation

- Une vitesse saisie hors de la plage de 1 à 8 km/h est ramenée à la borne et l'écran le dit, en nommant la limite et la
  raison (sécurité sur le tapis) — `QUA-002`
- La plage de 1 à 8 km/h est lisible à l'accueil avant la saisie, sans avoir à se tromper — `QUA-002`
- Dans le casque, une vitesse déjà à la borne le dit quand le joystick tente de la dépasser (pas de bascule silencieuse) —
  `QUA-002`
- La plage reste de 1 à 8 km/h et le pas de 0,1 : rien d'autre ne change dans le réglage de la vitesse — `APP-002`
- Le message est rejoué de bout en bout dans le Quest 3 émulé : 50 saisi, 8 retenu, limite annoncée — `QUA-020`

## Contrats modifiés

*(aucun : la plage et le contrat ne changent pas, seul le message s'ajoute)*

## 2. Hors périmètre

- Relever la limite au-delà de 8 km/h : décision du demandeur du 2026-10-31, on la garde.
- Lire la vitesse réelle du tapis (Bluetooth) : hors v0.1.
- Un menu de réglage dans le casque : `docs/intentions/hud-casque.md`.

## 3. Contraintes

- Le message est écrit pour un humain, en français, lisible (contraste, `QUA-014`) ; il n'ajoute aucune donnée enregistrée.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).

## 4. Décisions

- 2026-10-31, décision humaine du demandeur : garder 8 km/h et le dire.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit) : le texte exact du message, son emplacement à
  l'accueil et dans le casque, la durée d'affichage.
- Contrats concernés : `APP-002`, `QUA-002`, `QUA-004`, `QUA-001`, `QUA-014`, `QUA-020`.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — le message à l'accueil** [AI] : limite lisible avant la saisie, annonce au bornage. Sortie : tests verts.
- **Lot 2 — le message dans le casque** [AI] : annonce quand le joystick tente de dépasser la borne. Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : e2e, docs à jour. Sortie : CI verte.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : la fiche, sur la branche `cadrage/commandes-panneau`.
- **Prochaine étape** : [AI] lot 1. Indépendant des autres chantiers cadrés.
