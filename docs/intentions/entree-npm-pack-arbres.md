# Intention : une entrée npm pour préparer les arbres du pack Quaternius

**Statut** : proposée le 2026-11-01.

## Besoin

Relancer la préparation des arbres du pack (`app/scripts/prepare-nature-pack.ts`) par une commande courte, comme les extractions
d'extraits (`npm run extract`…), au lieu d'une ligne `node -e` à recopier.

## Existant

Lu le 2026-11-01 : le script lit l'archive Standard hors du dépôt et réécrit `app/assets/quaternius-trees.json` et
`app/assets/quaternius-licence.txt` ; sa commande est écrite dans `app/AGENTS.md` et `app/assets/PROVENANCE.md`. `app/package.json`
n'était pas dans le périmètre du chantier arbres-pack-quaternius, donc aucune entrée `npm run` n'a été ajoutée.

## Questions à trancher

- [decision] Ajouter une entrée npm (par exemple `npm run prepare:nature-pack -- <archive>`) dans `app/package.json` : oui ou non, sachant
  que l'opération est rare (le pack ne change pas) ?
