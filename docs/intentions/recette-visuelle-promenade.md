# Intention : la recette visuelle d'une promenade — décrire en données ce qui fait l'identité d'un quartier

**Statut** : proposée le 2026-11-07 ; cadrage, rien n'est décidé ni planifié.

## Besoin

Exprimé par le demandeur le 2026-11-07 : le générateur (`docs/intentions/generateur-ville-complet.md`) a beaucoup de
briques, mais il lui manque leur **assemblage cohérent** et une **identité propre à chaque quartier**, pas davantage
d'objets. Il faut une « recette » par promenade : l'inventaire de ce qu'on assemble (matériaux, sols, façades,
végétation, mobilier, figurants), ses paramètres par région avec des valeurs de repli, ses règles de placement et la
conduite à tenir quand une donnée manque.

Jalon : générer **deux quartiers très différents avec le même moteur, sans retouche de code**, et reconnaître d'emblée
leurs ambiances.

## Principe : un moteur qui lit des données, pas du code par ville

Les chantiers ci-dessous n'ajoutent pas des morceaux séparés : chacun rend le moteur capable d'appliquer **un composant de
plus, par règle**. Créer une ville suit toujours le même trajet :

1. `npm run city -- <identifiant>` : le demandeur lance la commande.
2. La commande récupère les **données de la ville** : extrait OpenStreetMap (bâtiments, rues, mobilier), boucle, photos.
3. Le moteur lit la **recette de la région** (données : palettes, sols, végétation, mobilier, figurants), avec des valeurs
   de repli et la surcharge du quartier.
4. Chaque **composant s'applique par règle**, sans code propre à la ville : façades, sols, rez-de-chaussée, arbres,
   lampadaires, mobilier, véhicules et piétons, eau et repères.
5. La ville est **inscrite à l'accueil** et proposée à l'utilisateur, complète.

Tout ce qui est propre à une ville est une donnée, tout ce qui est propre à une région est un paramètre ; le code ne
connaît ni l'une ni l'autre (`docs/intentions/generateur-ville-complet.md`, « Architecture cible »).

Règles posées : un catalogue partagé de modèles et de matériaux, des règles de placement, puis des paramètres régionaux et
des exceptions **en données** ; les photos guident l'apparence, OpenStreetMap fournit le connu, et les ajouts procéduraux
restent distingués des éléments réellement relevés. À chaque étape : mêmes contenus sur Quest, PC et tablette, sécurité
inchangée (`APP-001`), poids des données contrôlé, mesure au casque avant d'optimiser. Météo, reflets et grosses ombres
viennent **en dernier** (coûteux, moins décisifs qu'une rue bien composée ; `docs/intentions/rendu-eclairage-ambiance.md`).

## Existant

Lu le 2026-11-07, d'après le dépôt (master à `98cfb44`).

- **Déjà là** : emprises, hauteurs et façades (`APP-008`) ; matériaux locaux recolorés (`APP-012`), couverture réelle à
  éprouver ; quatre modèles d'arbres, haies, surfaces vertes ; chaussées, trottoirs, passages, bordures, marquages ;
  bancs, poubelles, panneaux (selon les données) ; lampadaires produits (`APP-013`) et ambiance selon l'heure ;
  véhicules et piétons au souk seulement, piétons sans animation (`APP-014`) ; trois qualités de rendu et préférences
  communes aux trois plateformes (`APP-015`) ; inscription automatique d'une ville créée (PR #90).
- **Pas de recette** : région (`regionOf`) et palettes existent, mais sans description commune des sols, rez-de-chaussée,
  végétation et mobilier par quartier ; seule la région `golfe` est réglée pour les figurants.
- **Intentions voisines à ne pas refaire** : `palettes-regions-references.md`, `rendu-rues-mobilier.md`,
  `ville-vivante.md`, `pietons-animes.md`, `facades-textures-monuments.md`, `mobilier-remarquable-gltf.md`,
  `tours-treillis-extrudees.md`, `sons-ambiance-ville.md`, `rendu-lod-cellules.md`.

## Ordre proposé

Gain visuel décroissant, une promenade complète comme preuve à chaque étape.

1. **Finir le socle** : inscription automatique (faite), essai réel de `npm run city` (fait le 2026-11-11 sur Rome centro storico,
   journal `docs/projects/journal.md`) ; reste à juger au casque le rendu de la ville créée (lot [humain]).
2. **La recette elle-même** : inventaire des briques, paramètres régionaux avec repli, règles de placement, gestion des
   données manquantes. C'est le cadrage à finir en premier.
3. **Compléter le souk de référence** : sols (pavés, asphalte, bordures cohérentes ; faits le 2026-11-11 par `gen-03`, jugement au casque
   à faire), rez-de-chaussée (boutiques,
   vitrines, portes, auvents ; faits le 2026-11-12 par `gen-04`, jugement au casque à faire), placement cohérent des arbres, lampadaires et objets (alignements, espacements, accès
   dégagés), végétation adaptée.
4. **Prouver la généralisation sur Pune** : un quartier visuellement différent, même moteur, paramètres régionaux
   complétés plutôt que des exceptions codées.
5. **Éléments distinctifs, à la demande d'une promenade** : eau et quais (Corniche), monuments et bâtiments
   remarquables, puis piétons animés et sons locaux ; relief, ombrage léger et niveaux de détail selon les mesures.
6. **Régénérer les quatre itinéraires**, puis ajouter les villes par la commande
   (`docs/intentions/villes-a-parcourir.md`).

## Décisions du demandeur (2026-11-07)

- **Où vit la recette** : données de région par défaut, avec surcharge par quartier.
- **Relevé ou ajouté** : un champ d'origine dans les données, relu par les preuves.
- **Jalon** : le souk Waqif et **Pune Vieille ville**, même moteur, sans retouche de code.
- **Palettes** : `palettes-regions-references.md` est absorbée par cette intention.
- **Budget** : pas de budget chiffré par quartier ; la mesure reste exigée à chaque étape (poids des données, appels de
  rendu) et sert à juger, sans plafond d'avance.

- **Périmètre (2026-11-07)** : **tous** les composants graphiques entrent dans la recette, y compris ceux que l'ordre
  proposé laissait « à la demande » (eau et quais, bâtiments remarquables, piétons animés, sons, relief, niveaux de
  détail). L'ordre reste, il ne retranche rien : ce qui est tardif est planifié, pas abandonné.
- **Météo, reflets, grosses ombres (2026-11-07)** : voulus aussi, au dernier rang, une fois la rue composée. Ils ne
  passent que sous les garde-fous de `APP-001` (le réel visible, la lisibilité) et du budget mesuré au casque ; en cas
  de conflit, la sécurité l'emporte et l'effet est réduit ou désactivable.

## Composants à intégrer et chantiers

Chaque ligne devient un chantier (ou plusieurs), lancé un par un par le demandeur (`/drwil-start`), chacun prouvé par une
promenade complète. Toute modification de `app/` est HIGH (`APP-001`).

| Rang | Composant | Chantier envisagé | Intentions reliées |
|---|---|---|---|
| 1 | Socle | Essai réel de `npm run city` | `essai-commande-creation-reseau.md` |
| 1 | Format de la recette | Données région + surcharge quartier, champ d'origine, repli (fait le 2026-11-11 : `gen-02-format-recette`, `app/assets/recette-regions.json`) | `palettes-regions-references.md` (absorbée) |
| 2 | Sols et rues | Pavés, asphalte, bordures cohérentes | `rendu-rues-mobilier.md` |
| 2 | Rez-de-chaussée | Boutiques, vitrines, portes, auvents | `rendu-facades-batiments.md` |
| 2 | Matériaux | Repli sans photos, compression Quest | `textures-compressees-quest.md`, `essai-casque-materiaux-souk.md` |
| 3 | Placement | Arbres, lampadaires, mobilier : alignements, espacements, accès | `lampadaires-carrefours-reglage.md`, `extraction-mobilier-manquant.md` |
| 3 | Végétation régionale | Palmiers, arbres d'alignement, buissons, jardinières | `rendu-jeu-video.md` |
| 4 | Pune Vieille ville | Preuve de généralisation, sans code propre | `villes-a-parcourir.md` |
| 5 | Repères | Monuments, mosquées, temples, tours en treillis | `facades-textures-monuments.md`, `tours-treillis-extrudees.md`, `mobilier-remarquable-gltf.md` |
| 5 | Eau et paysage | Mer, quais, berges, parcs, horizon (Corniche) | `corniche-west-bay.md` |
| 5 | Vie | Piétons animés, modèles régionaux, sons | `pietons-animes.md`, `ville-vivante.md`, `sons-ambiance-ville.md` |
| 5 | Relief et détail | Relief, ombrage léger, niveaux de détail, mesures | `rendu-lod-cellules.md`, `rendu-eclairage-ambiance.md` |
| 7 | Météo, reflets, grosses ombres | Effets d'ambiance, sous réserve de `APP-001` et du budget mesuré | `rendu-eclairage-ambiance.md`, `essai-casque-eclairage-ambiance.md` |
| 6 | Catalogue | Régénérer les quatre itinéraires, ajouter les villes | `generateur-ville-complet.md` |

## Questions à trancher

*(aucune)*