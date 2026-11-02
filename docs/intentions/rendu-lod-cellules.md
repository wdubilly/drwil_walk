# Intention : niveaux de détail et chargement par cellules

**Statut** : proposée le 2026-11-02 (lots 1 et 2 de `docs/intentions/rendu-jeu-video.md`) ; seulement si les mesures le justifient.

## Besoin

Pouvoir afficher beaucoup plus de détail près du marcheur sans dépasser le budget du casque : fusion par cellules plutôt
que globale, niveaux de détail, élimination hors champ, cache et libération des ressources, chargement progressif sans
disparition brutale. Le plan demande aussi un chargement par cellules avec préchargement dans la direction de marche.

## Existant

Lu le 2026-11-02 : une seule géométrie fusionnée pour tous les bâtiments (`app/src/city/buildings.ts`), arbres et mobilier
instanciés (`app/src/city/tree-instances.ts`, `app/src/city/props.ts`), simplification de maillage (`app/src/city/mesh-simplify.ts`), découpe de la zone
autour du marcheur (`app/src/city/zone-clip.ts`). Aucun LOD. Les quatre villes figées tiennent en 2,8 Mo dans `app/data/` : charger par
cellules ne gagnerait pas de réseau pour elles. Le trajet libre (Valhalla, Photon, `docs/intentions/essai-fournisseurs-ouverts.md`) est le seul cas où la ville n'est pas connue d'avance.

## Questions à trancher

- [decision] Le chargement par cellules est-il voulu pour le seul trajet libre, ou abandonné au profit d'une fusion par cellules de l'extrait déjà chargé ?
- Un LOD n'a de sens qu'avec des façades détaillées (`docs/intentions/rendu-facades-batiments.md`) : faut-il attendre ?
- [decision] Quel budget d'appels de rendu et de triangles fixer, une fois les premières mesures prises ?
