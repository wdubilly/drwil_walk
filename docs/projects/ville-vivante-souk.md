# Chantier : une ville vivante au Souq Waqif — lampadaires allumés, véhicules et piétons

**Statut** : cadré le 2026-11-05.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/ville-vivante.md`

<!-- scope
files:
  - app/scripts/*.ts
  - app/scripts/*.test.ts
  - app/data/souq-waqif.json
  - app/assets/*
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/src/render/*
  - app/src/xr/*
  - app/src/ui/*
  - app/e2e/*
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
-->

## 1. Besoin

La ville est vide : ni véhicule ni passant, et les lampadaires restent éteints la nuit. Le demandeur veut une ville
vivante, produite par un **moteur générique réglé par région**, mis au point **au Souq Waqif seul** — le quartier de
référence du générateur de ville complet (`docs/intentions/generateur-ville-complet.md`) — avant d'être appliqué aux
autres villes, chacune par sa fiche.

## Critères d'acceptation

- La nuit (soleil sous l'horizon), les lanternes des lampadaires, du relevé comme produits par règle, brillent et posent un
  halo au sol, sans aucune source de lumière par mât ; le jour, elles sont éteintes — `APP-011`
- Une case « Lampadaires allumés la nuit », cochée par défaut, éteint les lanternes quand elle est décochée — `APP-011`
- Une case « Circulation et piétons », décochée par défaut, fait apparaître véhicules et piétons ; décochée, la scène n'en
  contient aucun — `APP-014`
- Véhicules (voitures, deux-roues) sur les seules voies carrossables, dans le sens de la voie (`oneway` lu de l'extrait) ;
  piétons sur les trottoirs (`sidewalk`) et les voies piétonnes ; aucun figurant dans un bâtiment — `APP-014`
- Aucun figurant ne traverse devant l'utilisateur ni n'entre dans la zone tapis ; leur vitesse est plafonnée ; le fondu
  tête baissée et la vignette s'appliquent à eux comme au reste de la ville — `APP-001`, `APP-014`
- Placement et trajets reproductibles (graine tirée de l'identifiant OSM de la voie) et réglés par une table de région
  (`golfe` réglé ici, `inde` prévu avec des valeurs provisoires) — `APP-014`
- Nombre de figurants plafonné par profil graphique (moins en « performance ») ; triangles et appels de rendu relevés avant
  et après, dans les budgets de `docs/projects/rendu-lod-cellules.md` — `APP-006`
- Les modèles viennent d'un pack gratuit sous licence CC0, allégé et embarqué dans `app/assets/`, provenance et licence
  dans `app/assets/PROVENANCE.md` — `APP-014`
- Le souk est réextrait avec les balises `lanes`, `oneway` et `sidewalk` ; bâtiments, mobilier et boucle inchangés,
  chaque point de la boucle reste un sommet d'une voie — `APP-002`, `APP-003`
- Les trois autres itinéraires sont inchangés, case cochée ou non — `APP-003`
- Le souk de nuit, avec et sans circulation, jugé sur un vrai Quest 3 [human] — `APP-001`

## Contrats modifiés

- **Nouveau `APP-014`** : la ville vivante (véhicules et piétons produits par règle). Règle proposée : figurants posés
  par un moteur pur et reproductible, sur les seules voies qui leur conviennent, jamais devant l'utilisateur ni dans la
  zone tapis, vitesse plafonnée, plafonnés par profil, désactivables à l'accueil (décochés par défaut), modèles d'origine
  CC0 tracée. Preuve : tests du moteur et e2e de la marche avec et sans circulation. Rédigé dans `docs/contracts.md` au
  lot 2, avant le code qu'il couvre.
- `APP-011` (ambiance) s'étend aux lanternes allumées : la lueur ne cache jamais le réel.

## 2. Hors périmètre

- Les autres villes (Corniche, Pune Vieille ville, FC Road, villes créées) : une fiche chacune ensuite.
- Les rickshaws : propres à la région `inde`, ajoutés à la fiche de Pune (le pack retenu doit pouvoir les accueillir).
- Des sources de lumière réelles par mât, ombres portées, feux de circulation, klaxons ou sons de circulation.
- Une commande à la manette pendant la marche (décision du 2026-11-04 : risque de chute).

## 3. Contraintes

- Le réel prime : APP-001 reste un critère testé ; aucune animation brusque ni figurant qui surgit dans la vision proche.
- Le pack est une **donnée non fiable** : lu en mémoire, rien d'exécuté, comme `app/scripts/prepare-nature-pack.ts` ; la
  licence doit être CC0, vérifiée avant l'embarquement.
- Les piétons glissent (sans squelette) si leur marche animée sort des budgets mesurés : la mesure décide.
- La réextraction passe par Overpass (réseau, hors marche) ; espacer les requêtes. Le plafond de poids de `app/data/`
  vérifié par les tests est tenu.
- Tout chantier touchant `app/` est HIGH ; un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 %
  (`QUA-004`).

## 4. Décisions

- 2026-11-04 : un moteur générique réglé par région, mis au point au Souq Waqif seul ; une fiche par ville ensuite.
- 2026-11-04 : allumage automatique selon l'heure réelle, plus une case à l'accueil ; aucune commande pendant la marche.
- 2026-11-05 : modèles tirés d'un **pack gratuit** (comme les arbres Quaternius), pas de formes produites par code.
- 2026-11-05 : **deux cases** à l'accueil : « Lampadaires allumés la nuit » cochée, « Circulation et piétons » décochée.
- 2026-11-05 : **réextraire le souk** pour lire `lanes`, `oneway` et `sidewalk`.
- 2026-11-05 : **une fiche en trois lots** : lampadaires allumés, puis véhicules, puis piétons.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — lampadaires allumés** [AI] : lanterne émissive et halo au sol la nuit, d'après `sunElevation`
  (`app/src/render/daylight.ts`) ; case « Lampadaires allumés la nuit ». Sortie : tests verts, capture de nuit en e2e.
- **Lot 2 — moteur et véhicules** [AI] : choix du pack CC0 et relevé de sa licence ; réextraction du souk avec `lanes`,
  `oneway`, `sidewalk` ; `APP-014` rédigé ; moteur pur (voies, sens, vitesses, graine, table de région) ; voitures et
  deux-roues ; case « Circulation et piétons » ; plafonds par profil ; budgets relevés. Sortie : CI verte.
- **Lot 3 — piétons** [AI] : piétons sur trottoirs et voies piétonnes, marche animée ou glissée selon la mesure ; e2e de
  la marche avec et sans circulation ; documentation. Sortie : CI verte.
- **Lot 4 — jugement au casque** [human] : le souk de nuit, avec et sans circulation ; densité supportable en vision
  périphérique. Reporté à la séance groupée (`docs/intentions/seance-casque-parcours.md`).

## 7. Reprise

- **Dernier état** (2026-11-05) : lots 1 à 3 livrés sur `workstream/ville-vivante-souk`, PR #83 ; `GOVERNANCE: PASS` ;
  clôture en cours.
- **Travail non commité** : aucun.
- **Prochaine étape** : CI verte et fusion automatique de la PR #83 ; le lot 4 (jugement au casque) est humain
  (`docs/intentions/essai-casque-ville-vivante.md`, dans la séance `docs/intentions/seance-casque-parcours.md`).
