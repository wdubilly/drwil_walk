# Intention : plusieurs sources de données géographiques (Overture, autres)

**Statut** : proposée le 2026-11-02 (lot 5 de `docs/intentions/rendu-jeu-video.md`) ; la moins urgente, à ne cadrer qu'après les façades.

## Besoin

Ne pas dépendre d'OpenStreetMap seul : une couche qui normalise, fusionne et déduplique plusieurs sources (OpenStreetMap,
Overture Maps), garde la provenance et les licences, et gère les données manquantes. Ces sources donnent des vecteurs et
des attributs, jamais des façades photoréalistes ; les textures et modèles 3D sont une question distincte.

## Existant

Lu le 2026-11-02 : une seule source, OpenStreetMap, extraite à l'avance et figée dans `app/data/` (scripts `app/scripts/extract-*.ts`),
avec sa mention d'attribution (`app/src/city/attribution.ts`, `APP-003`). Aucun flux réseau pour la ville ; seul le trajet
libre appelle des services (Valhalla, Photon).

## Questions à trancher

- [decision] Overture Maps apporterait-il, sur Pune et Doha, des attributs (hauteurs, types) qu'OpenStreetMap n'a pas ? Un essai de couverture précède toute architecture.
- [decision] Les données restent-elles figées dans le dépôt, ou un accès réseau pendant la marche est-il admis (aujourd'hui non, hors trajet libre) ?
- Les licences d'Overture (ODbL ou CDLA selon la couche) se vérifient avant tout import.
