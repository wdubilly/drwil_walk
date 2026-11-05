# Intention : une ville vivante — circulation, piétons et lampadaires allumés, par un moteur générique

**Statut** : proposée le 2026-11-04 ; cadrée le 2026-11-05 pour le souk (chantier ville-vivante-souk, clos ; entrée du `docs/projects/journal.md`).
**Reviewed on 2026-11-05**: moteur livré au souk (`APP-014`, chantier ville-vivante-souk) ; le catalogue des types et la table par région sont des données (`app/assets/figurants-catalogue.json`), sans type en dur. Restent vivants : le réglage de la région `inde` (valeurs provisoires), les rickshaws (un modèle CC0, une ligne de catalogue, un poids de région), l'extension aux autres itinéraires (la liste `itineraires` du catalogue, une fiche par ville) et aux villes créées par `npm run city`, le jugement au casque (`essai-casque-ville-vivante.md`) et les piétons animés (`pietons-animes.md`).

## Besoin

Exprimé par le demandeur le 2026-11-04 : la ville est vide, il veut « des gens de la circulation ». Décisions posées le
même jour :

- **Un moteur générique, pas une fiche par ville** : le moteur est mis au point et testé **au Souq Waqif uniquement**
  (décision du 2026-11-04, là où le prototype des matériaux locaux est déjà livré), puis chaque ville a sa fiche qui ne
  fait que régler ses paramètres et vérifier le rendu.
- **Contenu du premier lot** : voitures, deux-roues et rickshaws, piétons sur les trottoirs, lampadaires allumés la nuit.
- **Lampadaires allumés** (notes du 2026-11-04) : allumage automatique selon l'heure réelle, plus une case à l'accueil pour
  le couper, comme le brouillard et les sons ; **aucune commande à la manette pendant la marche** (risque de chute).

## Existant

Lu le 2026-11-04.

- **Aucun objet mobile dans la scène** : tout est statique (bâtiments, arbres, mobilier fusionné dans un maillage,
  `app/src/city/props.ts`). OpenStreetMap ne porte ni véhicule ni piéton : tout serait produit par règle.
- **Une règle de pose existe déjà** : `app/src/city/lamp-rule.ts` (APP-013, lampadaires produits par règle) pose des objets
  par classe de voie (`highway`), avec une graine tirée de l'identifiant OSM, des refus (bâtiment, trottoir trop étroit à
  1,2 m, écart de 2 m) et un plafond par profil. C'est le modèle à suivre pour placer voies de circulation et trottoirs.
- **Les voies** (`app/src/city/souq-data.ts`) portent leur classe `highway` et leur tracé en mètres locaux ; ni le nombre
  de voies ni le sens unique ne sont lus aujourd'hui.
- **Les régions** existent (`app/src/city/facade-family.ts` : `inde`, `golfe`…, `regionOf` d'après la position) : de quoi
  paramétrer le mélange de véhicules et la densité de piétons par région, comme les familles de façades (APP-008).
- **La création d'une ville** passe par une commande unique depuis la PR #80 (`npm run city -- <id>`,
  `app/data/villes.json`) : une ville nouvelle hériterait du moteur par sa région, sans code.
- **L'heure** : `app/src/render/daylight.ts` donne `sunElevation(hour)`, négative la nuit — le signal d'allumage des
  lampadaires est déjà là. La lanterne actuelle n'est qu'un bloc coloré, sans émission (`app/src/city/furniture.ts`).
- **Les plafonds par profil** (`app/src/render/profiles.ts` : `maxFurniture`, `maxGeneratedLamps`) : le même mécanisme
  servirait aux figurants (moins en « performance »).
- **Sécurité** : APP-001 (sécurité-visibilité : le réel reste visible) et APP-011 (ambiance plafonnée, désactivable) bornent
  tout ajout visuel.

## Approche proposée

Présentée au demandeur le 2026-11-04, avant tout code.

1. **Un moteur, des paramètres de région.** Un module pur décide où et comment circulent véhicules et piétons (voies,
   trottoirs, vitesses, densités) ; une table par région règle le mélange : au `golfe`, surtout des voitures, larges
   avenues, peu de piétons ; en `inde`, deux-roues et rickshaws nombreux, piétons denses. Le souk ne doit pas figer le
   moteur : les paramètres de l'Inde sont prévus dès le départ, même s'ils ne sont réglés qu'à la fiche de Pune.
2. **Mise au point au Souq Waqif seul** : ruelles surtout piétonnes, quelques voies de voitures en bordure ; c'est le
   quartier de référence, où façades, matériaux locaux et lampadaires produits sont déjà réunis.
3. **Une fiche par ville** ensuite (Corniche, Pune Vieille ville, FC Road, puis les villes créées par `npm run city`).
4. **Lampadaires allumés** dans le même moteur d'ambiance : lanterne émissive et halo au sol quand le soleil est sous
   l'horizon, sans source de lumière par mât (trop coûteux, voir `docs/intentions/rendu-eclairage-ambiance.md`).

## Garde-fous de sécurité proposés (APP-001)

- Mouvements **lents et prévisibles**, parallèles à la marche ; **jamais un figurant qui traverse devant l'utilisateur**
  ni qui surgit dans la zone tapis.
- **Une case à l'accueil** pour couper la circulation et les piétons ; une autre (ou la même) pour les lampadaires
  allumés. Aucune commande pendant la marche.
- Le fondu tête baissée et la vignette s'appliquent aux figurants comme au reste de la ville.

## Conséquences sur le Quest 3

Non mesurées : à chiffrer au cadrage contre les budgets de `docs/projects/rendu-lod-cellules.md`. Des figurants animés
coûtent bien plus que du mobilier fusionné : chaque objet mobile est un appel de rendu ou une instance à mettre à jour à
chaque image. Piste : modèles très simples, instanciés par type, animation par déplacement seul (pas de squelette) au
premier lot, plafonds par profil.

## Questions à trancher

Tranchées le 2026-11-05 pour le souk (chantier ville-vivante-souk : détail dans son entrée du `docs/projects/journal.md`) : pack de
modèles gratuit, deux cases à l'accueil (lampadaires allumés cochée, circulation et piétons décochée), réextraction avec
`lanes`, `oneway` et `sidewalk`, une fiche en trois lots. Reste ouverte, à juger au casque :

- Quelle densité reste supportable en vision périphérique sur le tapis ?

## Ordre proposé

1. La fiche du moteur, testée au Souq Waqif seul.
2. Une fiche par ville : la Corniche, Pune Vieille ville, FC Road, puis les villes nouvelles ; une ville créée par
   `npm run city` doit hériter du moteur par sa région (voir `docs/intentions/inscrire-une-ville-creee.md`).
