# Intention : combler les emprises de bâtiments manquantes (empreintes d'apprentissage)

**Statut** : proposée le 2026-11-03, limite de l'essai de couverture d'Overture (entrée du 2026-11-03 dans `docs/projects/journal.md`).

## Besoin

Le seul apport net d'Overture sur les quatre zones est le nombre d'emprises : +1 186 bâtiments à Pune Vieille ville,
+938 sur FC Road, +369 sur la Corniche, +33 au souk. Ce sont, pour l'essentiel, des empreintes produites par
apprentissage (Microsoft Global ML Building Footprints, Google Open Buildings). Des rues de Pune où il manque un
bâtiment sur trois se voient dans le casque : la ville y paraît trouée.

## Existant

Lu le 2026-11-03 : la ville vient des seuls extraits OpenStreetMap figés de `app/data/` (`APP-003`), bâtiments extrudés
par `app/src/city/buildings.ts`. Le relevé chiffré et les licences sont dans
`docs/intentions/rendu-sources-donnees.md` ; le script d'essai est `app/scripts/overture-coverage.ts`, jamais lancé par
l'application. Rien d'Overture n'est entré dans le dépôt.

## Questions à trancher

- [decision] Ajouter ces emprises, ou laisser la ville telle qu'OpenStreetMap la décrit ? Elles n'ont ni hauteur, ni
  étage, ni type : elles seraient extrudées à la hauteur par défaut, ce qui peut rendre la ville plus plate, pas plus
  juste. Un essai au casque sur une zone trancherait mieux qu'un chiffre.
- Le relevé compare des **comptes**, pas des objets appariés : avant toute fusion, il faut mesurer le recouvrement réel
  (combien d'emprises d'Overture doublonnent une emprise OpenStreetMap) et une règle de déduplication.
- Licence et mention : la couche `buildings` d'Overture est en ODbL, donc la mention
  « © contributeurs OpenStreetMap » reste obligatoire, et la provenance des sources ajoutées (Microsoft, Google, Esri)
  doit être écrite dans la scène (`app/src/city/licence.ts`, `APP-003`).
- Poids : +40 % à +55 % de bâtiments à Pune, à mesurer contre les 72 images par seconde du Quest 3 avant d'engager quoi
  que ce soit.
