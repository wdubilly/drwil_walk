# Chantier : essai de couverture d'Overture Maps (source complémentaire)

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/rendu-sources-donnees.md`

<!-- scope
files:
  - app/scripts/overture-coverage.ts
  - app/scripts/overture-coverage.test.ts
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
- La décision d'intégrer ou non Overture est prise par le demandeur sur le relevé [human] — `QUA-011`

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
  pour ce seul relevé hors marche.

## 5. Points à trancher

- [human] Décider d'après le relevé s'il faut une fiche d'intégration.

## 6. Lots

- **Lot 1 — licences** [AI] : vérifier les licences par couche des fichiers publiés.
- **Lot 2 — relevé de couverture** [AI] : script et relevé chiffré dans une intention. Sortie : tests verts, relevé lu.
- **Lot 3 — décision** [human] : intégrer ou abandonner.

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : lot 1, les licences par couche des fichiers publiés.
