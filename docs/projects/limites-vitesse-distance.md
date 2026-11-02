# Chantier : supprimer le plafond de vitesse (8 km/h) et la limite de longueur du trajet libre (5 km)

**Statut** : cadré le 2026-11-02.
**Risque** : HIGH
**Maturité** : prêt

<!-- scope
files:
  - app/src/route/speed.ts
  - app/src/route/speed.test.ts
  - app/src/route/providers.ts
  - app/src/route/routes-api.test.ts
  - app/src/route/valhalla.test.ts
  - app/src/route/walk.ts
  - app/src/route/stats.ts
  - app/src/xr/*
  - app/src/pc/*
  - app/src/ui/home.ts
  - app/src/ui/home.test.ts
  - app/src/ui/panel.ts
  - app/src/ui/panel.test.ts
  - app/src/ui/free-trip.ts
  - app/src/ui/free-trip.test.ts
  - app/e2e/*
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
  - README.md
  - MISSION.md
-->

## 1. Besoin

Le demandeur marche et court sur son tapis et ne veut plus de deux limites posées au départ : la vitesse n'a plus de maximum
(aujourd'hui 8 km/h, `MAX_SPEED_KMH` dans `app/src/route/speed.ts`, « par sécurité sur le tapis ») et un trajet libre n'est
plus refusé pour sa longueur (aujourd'hui 5 km au plus, `MAX_ROUTE_M` dans `app/src/route/providers.ts`). Le minimum de
1 km/h reste.

## Critères d'acceptation

- Une vitesse de plus de 8 km/h se règle (accueil, joystick, touches de la version PC) et la ville avance à cette vitesse,
  sans plafond ; le minimum de 1 km/h et le pas de 0,1 km/h restent — `APP-002`
- Une saisie illisible (non numérique, infinie) retombe sur la vitesse par défaut en le disant à l'écran, et plus aucun
  message ne parle d'un maximum ni d'une « limite de sécurité sur le tapis » — `QUA-002`
- Un trajet libre de n'importe quelle longueur est accepté : aucun refus avant l'appel au service de routage, ni sur la
  distance à vol d'oiseau ni sur la longueur du chemin — `APP-002`
- Si la ville d'un trajet très long ne peut pas se charger (Overpass refuse ou ne répond pas), la marche se fait sur le
  sol seul et la raison est dite à l'écran, sans bloquer le trajet — `QUA-002`
- La marche à plus de 8 km/h et un trajet libre de plus de 5 km sont rejoués de bout en bout dans le Quest 3 émulé, sans
  requête hors de la page servie et avec des services factices — `QUA-020`
- La ville s'efface toujours tête baissée, quelle que soit la vitesse — `APP-001`

## Contrats modifiés

- `QUA-020` — critère d'origine : « (19) la version PC … pilotée au clavier et à la souris (vitesse bornée de 1 à 8 km/h,
  pause et reprise, recalage, masquage du tableau, regard, une pression = une action) » ; le chemin e2e de la limite de
  vitesse (`app/e2e/vitesse-limite.test.ts`) rejoue aujourd'hui la borne de 8 km/h — raison : la borne haute disparaît,
  seul le minimum de 1 km/h reste borné (approuvé le 2026-11-02 par le demandeur).

## 2. Hors périmètre

- Un plafond de remplacement « raisonnable » : le demandeur a choisi « aucun plafond » le 2026-11-02.
- Les itinéraires figés : leurs boucles gardent leur longueur ; seul le trajet libre perd sa limite de longueur.
- Un rappel de sécurité nouveau : celui de l'accueil reste tel quel (`MISSION.md`).
- Une montée progressive de la vitesse ou un avertissement à haute vitesse (à cadrer à part si le demandeur le veut).

## 3. Contraintes

- Risque physique (chute sur le tapis) : retirer la borne haute est un choix explicite du demandeur, pris le 2026-11-02 ;
  la sécurité-visibilité (`APP-001`) ne change pas et reste testée.
- La vitesse reste un nombre fini et au moins égal à 1 km/h ; une valeur non finie retombe sur 4,0 km/h (`QUA-002`).
- Un très long trajet fait grossir la requête Overpass (le tracé est déjà réduit à un nombre de points au plus dans
  `app/src/city/free-route.ts`, hors périmètre) : le repli sur le sol seul existe déjà et doit rester dit à l'écran.
- Aucune dépendance ni flux réseau nouveau ; le trajet libre n'appelle que ses services actuels.
- Fichiers de 200 lignes au plus, couverture à 100 % sans exclusion, e2e vert en CI (`QUA-001`, `QUA-004`, `QUA-020`).

## 4. Décisions

- 2026-11-02, décision humaine du demandeur : plus de plafond de vitesse (le minimum de 1 km/h reste) et plus de limite
  de longueur du trajet libre.
- 2026-11-02, choix techniques de l'agent (pas des décisions de produit) : la valeur de repli d'une saisie illisible reste
  la vitesse par défaut ; la forme des messages ; le texte de la plage devient « à partir de 1 km/h ».
- Contrats concernés : `APP-001`, `APP-002`, `QUA-001`, `QUA-002`, `QUA-004`, `QUA-020`.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — suppression des deux plafonds, en logique pure** [AI] : vitesse sans maximum, aucun refus de longueur, messages
  mis à jour. Sortie : tests verts.
- **Lot 2 — écrans et commandes** [AI] : accueil, panneau, joystick, touches de la version PC. Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : e2e à haute vitesse et sur un long trajet, docs et contrat `QUA-020`. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : essayer à haute vitesse sur le tapis, avec précaution (clé de sécurité attachée).

## 7. Reprise

- **Dernier état** (2026-11-02) : cadrage seul, aucun code.
- **Travail non commité** : la fiche et sa ligne de l'index, sur la branche `cadrage/limites-vitesse-distance`.
- **Prochaine étape** : [AI] lot 1. Chevauchement à régler au lancement : `docs/projects/course-reelle-gpx.md` lève aussi la
  limite de 5 km (lot 2, avec un plafond technique) ; une fois ce chantier clos, retirer ce point de cette fiche
  (commit séparé).
