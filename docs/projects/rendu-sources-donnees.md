# Chantier : essai de couverture d'Overture Maps (source complémentaire)

**Statut** : en cours le 2026-11-03 (branche `workstream/rendu-sources-donnees`).
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/rendu-sources-donnees.md`

<!-- scope
files:
  - app/scripts/overture-coverage.ts
  - app/src/city/overture-coverage.test.ts
  - docs/intentions/*
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

OpenStreetMap reste la source principale. Overture Maps est **évalué** comme source complémentaire pour enrichir les
bâtiments, les adresses et les données géographiques manquantes à Pune et à Doha. Ce chantier mesure la couverture et vérifie
les licences ; il n'intègre rien dans l'application et ne remplace aucune donnée OpenStreetMap.

## Critères d'acceptation

- Un script mesure, sur les quatre zones des extraits, ce qu'Overture apporte que OpenStreetMap n'a pas (hauteurs, types,
  adresses) et écrit un relevé chiffré — `QUA-011`
- La licence de chaque couche d'Overture utilisée est vérifiée et écrite avant tout import — `APP-003`
- Aucune donnée d'Overture n'entre dans `app/data/` ni dans l'application : la ville reste celle d'OpenStreetMap — `APP-003`
- Le script n'est jamais lancé par l'application ni pendant la marche : aucun accès réseau en marche (hors trajet libre) —
  `APP-003`
- Le relevé chiffré et les licences sont écrits dans l'intention, pour que le demandeur décide d'intégrer ou
  non Overture (la décision elle-même est le lot 3, un point à trancher) — `QUA-011`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Toute intégration dans l'application (fusion, déduplication, provenance) : une fiche à part, si le relevé la justifie.
- Remplacer une donnée OpenStreetMap : interdit sans vérification de cohérence et de licence (décision du 2026-11-03).
- Les textures et modèles 3D.

## 3. Contraintes

- La ville reste figée dans le dépôt ; aucun flux réseau en marche.
- Le script d'essai est lancé à la main : un accès réseau n'est ouvert que pour l'essai, avec l'accord du demandeur.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).

## 4. Décisions

- 2026-11-03 : **OpenStreetMap reste la source principale** ; Overture est évalué en complément, sans rien remplacer sans
  vérification de cohérence et de licence.
- 2026-11-03 : l'essai lit les **fichiers publiés d'Overture (Parquet, sans compte ni clé)**, pas l'API en ligne.
- 2026-11-03 : le demandeur autorise **l'agent à lancer le script de relevé**, avec l'accès réseau que cela demande,
  pour ce **seul relevé ponctuel**. Aucun flux réseau pendant l'utilisation de l'application : la ville reste figée
  dans le dépôt.

## 5. Points à trancher

- [human] Décider d'après le relevé s'il faut une fiche d'intégration.

## 6. Lots

- **Lot 1 — licences** [AI] : vérifier les licences par couche des fichiers publiés. **Fait le 2026-11-03** :
  `buildings/building` en ODbL (sources OpenStreetMap et Microsoft en ODbL, Esri et Google Open Buildings en CC BY 4.0),
  `addresses/address` sous des licences ouvertes variables par pays. Relevées dans le script (`LICENCES`) et écrites
  dans `docs/intentions/rendu-sources-donnees.md`.
- **Lot 2 — relevé de couverture** [AI] : script et relevé chiffré dans une intention. Sortie : tests verts, relevé lu.
  **Fait le 2026-11-03** : `app/scripts/overture-coverage.ts` (test `app/src/city/overture-coverage.test.ts`), relevé
  lancé une fois, sur la version publiée `2026-10-21.0`, et écrit dans `docs/intentions/rendu-sources-donnees.md`.
- **Lot 3 — décision** [human] : intégrer ou abandonner. **Ouvert** : le relevé est là, la décision revient au demandeur.

## 7. Reprise

- **Dernier état** (2026-11-03) : lots 1 et 2 faits. Le script lit les fichiers Parquet publiés d'Overture par DuckDB
  (gardé hors du dépôt, lui seul ouvre le réseau), injecté comme la lecture des extraits : le test n'ouvre ni réseau ni
  fichier. Rien d'Overture n'est entré dans `app/data/`. Deux intentions sont nées des limites du relevé :
  `docs/intentions/overture-emprises-manquantes.md` et `docs/intentions/noms-de-batiments-extrait.md`.
- **Travail non commité** : aucun.
- **Prochaine étape** : lot 3, la décision du demandeur sur le relevé. Rien à coder d'ici là.

## 8. Écart de cadrage corrigé

Le bloc `scope` plaçait le test à côté du script, dans le dossier des scripts. Vitest ne lit que le dossier des sources
et la racine de la couche (`include` de `app/vite.config.ts`) : un test placé là n'aurait jamais tourné, et c8 aurait
compté le script comme non couvert. Le périmètre a donc été corrigé en `app/src/city/overture-coverage.test.ts`, où
vivent déjà les tests des scripts d'extraction (convention de `app/AGENTS.md`). Même fichier, même rôle : aucun
élargissement.
