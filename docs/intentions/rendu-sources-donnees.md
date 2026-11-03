# Intention : plusieurs sources de données géographiques (Overture, autres)

**Statut** : proposée le 2026-11-02 (lot 5 de `docs/intentions/rendu-jeu-video.md`) ; la moins urgente, à ne cadrer qu'après les façades.

**Revu le 2026-11-03** : l'essai de couverture est fait (chantier `docs/projects/rendu-sources-donnees.md`). Le relevé
chiffré et les licences sont ci-dessous ; restent à trancher l'intégration ou l'abandon, par le demandeur.

## Besoin

Ne pas dépendre d'OpenStreetMap seul : une couche qui normalise, fusionne et déduplique plusieurs sources (OpenStreetMap,
Overture Maps), garde la provenance et les licences, et gère les données manquantes. Ces sources donnent des vecteurs et
des attributs, jamais des façades photoréalistes ; les textures et modèles 3D sont une question distincte.

## Existant

Lu le 2026-11-02 : une seule source, OpenStreetMap, extraite à l'avance et figée dans `app/data/` (scripts `app/scripts/extract-*.ts`),
avec sa mention d'attribution (`app/src/city/attribution.ts`, `APP-003`). Aucun flux réseau pour la ville ; seul le trajet
libre appelle des services (Valhalla, Photon).

Lu le 2026-11-03 : s'y ajoute `app/scripts/overture-coverage.ts`, l'essai de couverture d'Overture. Il n'est jamais lancé
par l'application : c'est un relevé ponctuel, à la main, dont rien n'entre dans `app/data/`.

## Relevé de couverture d'Overture Maps

Version publiée lue : `2026-10-21.0` (fichiers Parquet publics, sans compte). Relevé ponctuel : aucune donnée
d'Overture n'entre dans `app/data/` et l'application n'appelle jamais ces fichiers.

### Licences des couches lues

- `buildings / building` : **ODbL** — sources : OpenStreetMap (ODbL), Microsoft Global ML Building Footprints (ODbL), Esri Community Maps (CC BY 4.0), Google Open Buildings (CC BY 4.0)
- `addresses / address` : **licences ouvertes, variables par pays** — sources : OpenAddresses et registres nationaux ; ni l'Inde ni le Qatar ne figurent dans la liste des sources

### Couverture, par zone : extrait OpenStreetMap figé → Overture

| Zone | Bâtiments | Hauteur ou étages | Étages | Type | Nom | Forme de toit | Matériau de façade | Adresses |
|---|---|---|---|---|---|---|---|---|
| Pune Vieille ville | 2079 → 3265 (+1186) | 38 → 39 (+1) | 9 → 9 (+0) | 21 → 27 (+6) | 0 → 27 (+27) | 1 → 3 (+2) | 3 → 4 (+1) | 0 → 0 |
| Pune FC Road | 1427 → 2365 (+938) | 17 → 17 (+0) | 17 → 17 (+0) | 82 → 92 (+10) | 0 → 76 (+76) | 0 → 1 (+1) | 1 → 1 (+0) | 0 → 0 |
| Doha Corniche | 756 → 1125 (+369) | 446 → 440 (-6) | 431 → 424 (-7) | 136 → 161 (+25) | 0 → 141 (+141) | 0 → 0 (+0) | 3 → 3 (+0) | 0 → 0 |
| Doha Souq Waqif | 253 → 286 (+33) | 85 → 93 (+8) | 33 → 29 (-4) | 37 → 46 (+9) | 0 → 38 (+38) | 0 → 0 (+0) | 0 → 0 (+0) | 0 → 0 |

### Comment le relevé a été produit

DuckDB lit les fichiers Parquet publiés par Overture (bucket public, sans compte ni clé) ; il est gardé hors du dépôt
(`~/.cache/drwil-duckdb/duckdb`, v2.0.0, MIT) et c'est le seul à ouvrir le réseau. Depuis `app/` :

```sh
DUCKDB=$HOME/.cache/drwil-duckdb/duckdb node -e "
import('./scripts/overture-coverage.ts').then(async m=>{
  const {execFile}=require('node:child_process');const fs=require('node:fs');
  const run=sql=>new Promise((ok,ko)=>execFile(process.env.DUCKDB,['-no-agent','-json','-c',sql],{maxBuffer:1e8},(e,out,err)=>e?ko(new Error(String(err||e))):ok(out)));
  fs.writeFileSync(process.argv[1], await m.survey(run, f=>fs.readFileSync('data/'+f,'utf8')));
})" <fichier-de-relevé>
```

Une lecture par zone (un « OU » entre les quatre cadres empêche l'élagage par les statistiques des fichiers et fait lire
les 270 Go de la couche) ; comptez environ cinq minutes pour les deux requêtes.

Deux réserves de lecture : la colonne « Hauteur ou étages » compte, côté extrait figé, les bâtiments dont la hauteur ne
retombe pas sur la valeur par défaut de 7 m (un bâtiment réellement haut de 7 m y manque donc) ; et le relevé compare des
**comptes**, pas des objets appariés : Overture n'ajoute pas forcément l'attribut aux bâtiments qui en manquent chez nous.

### Ce que le relevé dit

- **Emprises** : Overture en apporte nettement plus partout (+1 186 à Pune Vieille ville, +938 sur FC Road, +369 sur la
  Corniche, +33 au souk), venues pour l'essentiel des empreintes produites par apprentissage (Microsoft, Google).
- **Hauteurs et étages** : aucun apport (+1, 0, −6, +8 ; étages 0, 0, −7, −4). Overture n'enrichit pas ce que le rendu
  utilise le plus.
- **Noms** : le seul apport net d'attribut (+27, +76, +141, +38), parce que l'extraction du dépôt ne garde pas le nom des
  bâtiments. À comparer d'abord avec ce qu'une extraction OpenStreetMap plus complète donnerait, avant de changer de source.
- **Types** : apport modeste (+6 à +25). **Toits et matériaux de façade** : quasi nuls.
- **Adresses** : **zéro** sur les quatre zones, ce que la page d'attribution confirme (ni l'Inde ni le Qatar parmi les
  sources d'adresses).

## Questions à trancher

- [decision] Faut-il une fiche d'intégration d'Overture ? Le relevé du 2026-11-03 répond « peu d'intérêt pour le rendu
  actuel » : Overture n'apporte ni hauteur, ni étage, ni adresse sur les quatre zones ; il apporte des emprises
  supplémentaires (issues d'apprentissage, donc sans attribut) et des noms de bâtiments. Décision du demandeur.
- [decision] Les données restent-elles figées dans le dépôt, ou un accès réseau pendant la marche est-il admis (aujourd'hui non, hors trajet libre) ?
- Les licences d'Overture sont vérifiées (2026-11-03) : `buildings` est en **ODbL**, donc la mention
  « © contributeurs OpenStreetMap » reste obligatoire et aucune licence plus permissive n'est gagnée ; `addresses` porte
  des licences ouvertes variables par pays, à revérifier par pays avant tout import. La couche `places` (CDLA Permissive
  2.0) n'a pas été lue : elle n'était pas dans le besoin.
