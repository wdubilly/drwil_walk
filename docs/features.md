# Fonctionnalités

Ce que fait drwil_walk, fonctionnalité par fonctionnalité, du point de vue de la personne qui marche sur le tapis.
Cadré le 2026-10-30. Le détail de la v0.1 est dans `MISSION.md`. Codé au 2026-10-30 : une première tranche (accueil,
entrée en réalité mixte, marche dans le souk de Doha, joystick de vitesse, fondu tête baissée) ; le
reste est marqué « à venir ».

## Écran d'accueil

Ouvert dans le navigateur du Quest 3 : choix de l'itinéraire (Doha Souq Waqif par défaut ; Pune Vieille ville, Pune FC Road et Doha Corniche disponibles ; « Itinéraire libre » : voir la section dédiée), du rendu de la ville (OpenStreetMap par défaut, ou Google 3D photoréaliste avec une clé) et de la vitesse de départ, ville aux voies dessinées sur le sol et aux bâtiments de plusieurs tons, palette propre à chaque itinéraire (à juger au casque), rappel de sécurité (clé de sécurité du tapis attachée, main près
de la rampe), bouton « Entrer en réalité mixte ». Une seule personne utilise l'application : pas de compte ni de rôle.

Codé : accueil sombre à grandes cibles (48 px au moins, contraste prouvé par QUA-014, contraste du texte et de son
fond) ; quatre cartes d'itinéraire avec une illustration, Doha Souq Waqif choisi par défaut, choix d'un clic ou à la
manette ; un itinéraire sans ville dans le dépôt serait marqué « Bientôt » et ne se choisirait pas (plus aucun aujourd'hui) ;
vitesse de départ (à partir de 1 km/h, sans maximum, défaut 4,0 ; le minimum est écrit sous le champ ; une saisie sous 1 km/h est ramenée à 1 km/h et une saisie illisible à 4,0 km/h, en le disant), opacité de la ville (30 à 100 %), brouillard d'ambiance (décoché) et sons d'ambiance (0 %), rappel de sécurité, mention « © contributeurs OpenStreetMap » (suivie de « Google » quand ce rendu est choisi), bouton d'entrée ; rendu OpenStreetMap par défaut, Google 3D en option : sans clé, ou si les tuiles ne se chargent pas, la marche se fait en OpenStreetMap et la raison s'affiche sur l'accueil ; un
échec (navigateur sans WebXR, réalité mixte non prise en charge) s'affiche sur la page, pour le bouton du casque seulement : le bouton « Version PC » reste utilisable. Les itinéraires qui démarrent sont le souk
de Doha, la Vieille ville de Pune, la Corniche de Doha et FC Road à Pune ; le choisi est inscrit sur la page (`data-route`) .

## Itinéraire libre

Choisir son propre trajet : à l'accueil, la carte « Itinéraire libre » ouvre une carte légère (tuiles OpenStreetMap avec leur mention,
zoom et déplacement par boutons). Le départ et l'arrivée se posent en touchant la carte ou en cherchant un lieu ou une adresse (Photon,
OpenStreetMap) ; les deux modes se remplissent mutuellement (géocodage inverse pour une touche, point placé pour une adresse), le premier résultat
d'une adresse est retenu et affiché. « Calculer le trajet » demande le chemin à pied à Valhalla (profil piéton), puis charge les
bâtiments OpenStreetMap proches du tracé ; la marche suit ce tracé à la vitesse réglée et **s'arrête à l'arrivée en le disant** (page et casque), sans
boucle (contrat APP-002). La ville vient du rendu Google 3D si on l'a choisi, ou des bâtiments OpenStreetMap chargés pour le trajet
(contrat APP-003). Aller simple, de n'importe quelle longueur ; si la ville d'un très long trajet ne se charge pas (Overpass refuse ou ne répond pas), la marche se fait sur le sol seul et la raison s'affiche. Aucune clé : routage et adresses viennent des instances publiques d'OpenStreetMap (réglables pour une instance auto-hébergée, `INSTALL.md`) ; si un service refuse
ou limite les demandes, la raison est dite et les quatre itinéraires figés restent utilisables. Une clé Google Routes remplace ces deux services (option). Aucun point ni adresse n'est conservé.

Codé et vérifié dans Chromium avec un Quest 3 émulé, services factices (jamais d'appel à un service réel). Limites : jamais essayé avec les instances publiques ni sur un
vrai Quest 3 (cadence avec des milliers de bâtiments en bande de 150 m, profil piéton et justesse des adresses de Valhalla et de Photon dans les rues de Pune et de Doha) ;
`docs/intentions/essai-casque-itineraire-libre.md`.

## Marche dans la ville

La ville défile le long de l'itinéraire à la vitesse réglée (défaut 4,0 km/h, à partir de 1 km/h et sans maximum, par pas de 0,1 ; le panneau de la page dit quand la vitesse est au minimum, le message dans le casque lui-même reste à faire : `docs/intentions/hud-casque.md`), avec une
caméra qui suit le parcours sans rotation brusque (la direction est lissée sur 8 m dans les virages). Manettes : aux carrefours, manette droite pour pointer une rue et prise droite pour la choisir (voir plus bas), gâchette droite pour pause / reprise, joystick droit pour la
vitesse, bouton A pour recalibrer, bouton B pour le tableau de bord (vitesse, allure, durée, distance, distance restante et progression, calories environ, cap, lieu, heure) et la minicarte du côté opposé (le tracé du parcours, nord en haut, avec un point qui avance ; sans fond de tuiles ni réseau). La ville est faite
de bâtiments OpenStreetMap extrudés par défaut, ou des tuiles photoréalistes Google 3D au choix de l'accueil (clé requise), avec les mentions « © contributeurs OpenStreetMap » et, en rendu Google, celle de Google et les droits des tuiles. Le fondu tête baissée efface les tuiles Google comme la ville OpenStreetMap. À juger au casque : netteté à hauteur d'yeux, 72 images par seconde, lisibilité des mentions.

Codé : session `immersive-ar` (passthrough), le souk de Doha (Souq Waqif : 253 bâtiments OpenStreetMap extrudés, sol)
qui défile le long d'une boucle d'environ 1,5 km (place Al Koot, ruelle principale, écuries, retour) à la vitesse
réglée et reprend au départ à la fin de la boucle (contrat APP-002), joystick droit haut / bas pour +0,1 / −0,1 km/h (un cran par poussée),
panneau sur la page (vitesse, distance, temps, opacité de la ville, mention OpenStreetMap) et panneau de mention dans
la scène du casque, effacé avec la ville (contrat APP-003). Limites : la ville n'a pas encore été vue sur un vrai Quest 3
(rendu, 72 images par seconde, lisibilité de la mention) ; environ 20 m de la boucle traversent des passages couverts
dessinés comme des bâtiments par OpenStreetMap. Dans le casque : à l'approche d'un carrefour (40 m), des flèches à plat signalent les rues possibles (jaune : proposée, blanche : pointée, verte : choisie) et le panneau annonce « Carrefour dans N m » ; la manette droite pointe une rue, la prise droite la choisit (sans choix, la marche suit le tracé d'origine ; un autre choix quitte le tracé en douceur ; vitesse et distance ne changent pas ; rien n'est choisi ville effacée, tête baissée : APP-001, APP-002). La gâchette droite met la marche en pause et la reprend (l'avancée s'arrête, la vitesse réglée est gardée), le bouton A recale le parcours sur l'endroit et la direction où l'on regarde (la distance parcourue ne change pas), le bouton B masque ou réaffiche le tableau de bord de marche, un texte flottant sur un fond légèrement transparent, posé en bas du champ de vision du côté choisi à l'accueil (gauche ou droite, droite par défaut, gardé dans le navigateur : contrats APP-001 et APP-002), hors de la zone tapis, affiché dès le départ, qui disparaît tête baissée avec la ville : cap de la boussole (lu sur la direction du parcours) et heure locale en haut, lieu (le nom de l'itinéraire), vitesse, durée, distance et calories « environ » (formule de marche de l'ACSM : vitesse, durée et poids, 70 kg sans poids saisi) ; le poids est facultatif, saisi une fois à l'accueil, gardé seulement dans le navigateur du casque, effaçable (contrat APP-002) ; un appui ne compte qu'une fois. Sa place (28° sur le côté, 0,31 m sous les yeux) est réglée sur la simulation du champ de vision pour que tout son texte, l'heure comprise, reste dans la vue des deux côtés (APP-005). Limites : jamais essayé sur un vrai Quest 3 (lisibilité du texte sur fond transparent, place du tableau de bord, tapis resté visible) ; le nom de la rue n'est pas affiché, l'extrait OpenStreetMap n'en porte pas (`docs/intentions/noms-de-rues-extrait.md`) ; pas de dénivelé, faute de source d'élévation.

Codé aussi : la Vieille ville de Pune (2 079 bâtiments OpenStreetMap extrudés) qui défile le long d'une boucle d'environ
1,5 km (Shaniwar Wada, contour nord du fort, ruelles à l'est jusqu'au temple Dagdusheth Halwai Ganpati, retour par l'ouest
et Bajirao Road) ; la marche lit l'itinéraire choisi à l'accueil. Limites : le tracé est calculé par plus court chemin
sur les voies OpenStreetMap (hypothèse de cadrage, à relire par le demandeur) ; ni la ville ni la boucle n'ont été vues sur
un vrai Quest 3 (cadence, lisibilité).

Codé aussi : FC Road à Pune (1 427 bâtiments OpenStreetMap extrudés, dont 1 410 sans hauteur, donc à 7 m) le long d'un
aller-retour d'environ 3,5 km (1,76 km de Ferguson College, au nord, au carrefour de Jangli Maharaj Road, au sud, retour par
le même chemin) ; la marche lit l'itinéraire choisi à l'accueil. Limite : tracé calculé par plus court chemin sur les voies
OpenStreetMap, qui préfère les voies principales (hypothèse de cadrage, à relire par le demandeur).

Codé aussi : la Corniche de Doha (756 bâtiments OpenStreetMap extrudés, dont les tours de West Bay dans l'extrait) le long d'un
aller-retour d'environ 4 km (2 km sur le front de mer en partant près du Musée d'art islamique, retour par le même chemin) ;
la marche lit l'itinéraire choisi à l'accueil. Limites : le tracé est calculé par plus court chemin sur les voies
OpenStreetMap, qui préfère les cheminements piétons (hypothèse de cadrage, à relire par le demandeur) ; il part du point
relié le plus proche du musée et n'atteint pas West Bay (environ 3,5 km plus loin), dont les tours ne se voient que de loin ;
310 bâtiments sur 756 sans hauteur OSM (7 m par défaut) ; jamais essayé sur un vrai Quest 3.

Ville riche (chantier rendu-ville-riche) : sur les quatre itinéraires figés (et le trajet libre, dont la requête lit les mêmes balises), les rues
portent des trottoirs (`sidewalk`) et des passages piétons zébrés, le chemin suivi est jaune bordé de sombre, les parcs, herbes et bois sont des
surfaces vertes au sol avec leurs haies, les toits à deux pans (300 au plus) et les auvents (80 au plus) s'ajoutent aux bâtiments, et jusqu'à 8 noms
de rues (les plus proches du parcours, à 60 m au plus) sont écrits à plat sur la chaussée, dans le sens de la marche. Rien de tout cela n'ajoute plus
de 8 maillages fixes, et tout s'efface avec la ville tête baissée (APP-001). Hors périmètre : ciel, soleil, brume, relief. Non vu au casque :
voir `docs/intentions/essai-casque-ville-riche.md`.

Rendu enrichi (chantier osm-enrichi) : les bâtiments prennent la couleur, la couleur de toit ou le matériau de leurs balises
OpenStreetMap, sinon un ton de la palette de l'itinéraire ; les murs s'assombrissent vers le pied (ombrage par sommet) ; les
arbres, lampadaires et bancs de l'extrait s'affichent (300 arbres et 400 éléments de mobilier au plus, les plus proches du
parcours ; les arbres sont ceux du pack Quaternius, voir l'ambiance cartoon ci-dessous). Constaté sur les extraits du 2026-10-31 : arbres 155 (souk), 285 (Vieille ville), 513 (Corniche), 105 (FC Road) ;
bancs 19 (souk) et 8 (Corniche) ; aucun lampadaire ; très peu de bâtiments portent une couleur ou un matériau (7 matériaux
au total, un seul toit coloré hors bâtiment), donc la plupart gardent le ton de la palette. À juger au casque, cadence
comprise (lot 5 du chantier, humain) ; le relief du sol n'est pas fait (`docs/intentions/osm-enrichi.md`).

## Mobilier urbain et marquages au sol

Chantier rendu-rues-mobilier (APP-009). Le mobilier courant est produit par code, aux dimensions réelles : lampadaire (mât de
4,5 m, bras et lanterne au-dessus de la chaussée), banc (assise à 45 cm, dossier à 85 cm, long de 1,8 m), corbeille (90 cm) et
panneau (2,2 m). Chaque pièce est posée au sol et tournée dans l'axe du parcours le plus proche, jamais de travers. Rien n'est
inventé : une pièce n'est posée que là où l'extrait porte la balise exacte (`highway=street_lamp`, `amenity=bench`,
`amenity=waste_basket`, `traffic_sign` ou `highway=stop|give_way`). Les marquages suivent les balises de voie : passages piétons
en bandes blanches (`footway=crossing`) avec une ligne d'arrêt de chaque côté, trottoirs et leurs bordures (`footway=sidewalk`,
`sidewalk=both|left|right`) ; une balise absente ne produit rien.

Relevé des quatre extraits figés, réextraits le 2026-11-04 avec les poubelles et les panneaux : bancs 19 (souk) et 8
(Corniche), aucun ailleurs ; poubelles 14 (Corniche), aucune ailleurs ; **aucun lampadaire** ni **aucun panneau**
(OpenStreetMap n'en porte aucun dans les quatre emprises, ni `traffic_sign` ni `highway=stop|give_way`). Passages piétons :
31 (souk), 18 (Vieille ville), 30 (FC Road), 104 (Corniche) ; trottoirs tracés à part : 40 (Vieille ville), 69 (FC Road),
18 (Corniche), 0 (souk) ; voies portant une balise `sidewalk` : 1 (FC Road), 8 (Corniche).

Tout le mobilier tient dans un seul maillage plafonné (400 pièces, les plus proches du parcours d'abord) et les marquages se
fondent dans le maillage des voies : aucun maillage ni matériau en plus, donc tout s'efface avec la ville tête baissée
(APP-001). Hors périmètre : les lampadaires comme source de lumière (`docs/intentions/rendu-eclairage-ambiance.md`) et les
éléments remarquables en glTF (`docs/intentions/mobilier-remarquable-gltf.md`). Non jugé au casque :
`docs/intentions/essai-casque-mobilier-urbain.md`.

## Version PC (sans casque)

Le bouton « Version PC » de l'accueil lance la même marche (même ville, même parcours, même vitesse) dans un canvas qui couvre la
page, sans aucune session WebXR : un navigateur sans WebXR peut donc l'utiliser. Le bouton « Entrer en réalité mixte » reste
distinct et ouvre toujours une session `immersive-ar`, avec le fondu tête baissée, la zone tapis et la vignette ; la version PC ne les
applique pas, faute de passthrough ni de tapis (rien n'y remplace APP-001, voir `docs/contracts.md`).

Commandes : Espace (ou P) pause et reprise ; ↑ ou + et ↓ ou − règlent la vitesse de 0,1 km/h par pression (PageHaut et PageBas : 1 km/h), à partir de 1 km/h et sans maximum ;
R recale le parcours sur le regard sans toucher à la distance ; H masque le tableau (les mentions de données restent) ; D affiche ou masque le diagnostic de rendu ; glisser la souris tourne le regard ;
Échap quitte. Une pression ne déclenche qu'une action : une touche tenue ne répète pas. Les itinéraires figés bouclent ; le trajet libre s'arrête à l'arrivée et le dit.

Limites : OpenStreetMap seulement (le rendu Google 3D choisi est dit indisponible), ni minicarte, ni manette de jeu ;
le tableau de bord est celui de la page ; jamais essayé sur un autre navigateur que Chromium (e2e). Voir `docs/intentions/version-pc-suites.md`.

Façades des bâtiments (chantier rendu-facades-batiments, APP-008) : les bâtiments ne sont plus des blocs nus. Près du parcours (80 m), chacun reçoit des façades dessinées par code, sans texture : corniche, porte du côté de la rue suivie, fenêtres (vitrines pour un commerce), volets et balcons, en nombre réglé par la largeur du mur et par les étages d'OpenStreetMap (repli sur la hauteur, ou sur un type générique, quand ils manquent). Quatre familles (provençale, maison de village, bâtiment ancien, construction récente) sont choisies selon la région : la provençale n'apparaît qu'en Provence, jamais à Pune ni à Doha. L'identifiant OSM sert de graine : la même ville donne toujours les mêmes façades, et deux voisins n'ont jamais la même façade. Le profil graphique règle le détail (« performance » réduit, « équilibré » et « qualité » complet). Comme le reste de la ville, les façades s'effacent tête baissée (APP-001). Une teinte par région (chantier facades-regions, APP-008) : la région se déduit de la position de l'itinéraire (Provence, France du Nord, Italie, Caucase, Inde, Golfe) et choisit les couleurs des détails (liserés, volets, portes, rambardes), les familles restant les mêmes partout ; sans région connue, les teintes d'avant restent. **Changement voulu sur les quatre itinéraires livrés** : Pune prend les teintes de l'Inde (chaux blanche, volets turquoise, safran et vert, portes de teck), Doha celles du Golfe (enduits sable, bois sombre des portes et des volets) ; la forme des façades et le nombre de triangles ne changent pas, et l'e2e joint une capture de chaque ville à son rapport. Limites (teintes) : choisies sans photo de référence, fenêtres de région grossières (`docs/intentions/palettes-regions-references.md`) ; jamais jugées sur un vrai Quest 3 (`docs/intentions/seance-casque-parcours.md`). Limites (façades) : jamais essayé sur un vrai Quest 3 (`docs/intentions/essai-casque-facades-batiments.md`) ; aucune ville de Provence (`docs/intentions/ville-provence.md`) ; ni texture ni monument glTF (`docs/intentions/facades-textures-monuments.md`).

Matériaux locaux du souk (chantier facades-materiaux-souk, APP-012, prototype) : à l'accueil, quand le souk Waqif est choisi, une troisième option de rendu « Matériaux locaux (prototype) » habille les façades détaillées d'enduit, de pierre et de bois texturés (textures CC0 recolorées, embarquées : aucun appel réseau pendant la marche). Sur un autre itinéraire l'option est masquée et le rendu revient à OpenStreetMap, qui reste le rendu par défaut. Le matériau suit la famille de la façade ; sa teinte, son échelle et l'usure plus sombre du pied du mur sont tirées de l'identifiant OSM, et deux voisins n'ont jamais le même matériau dans la même teinte. Le profil « performance » n'en pose aucun. Tête baissée, la ville habillée s'efface comme le reste (APP-001). Limites : couleurs provisoires (palette du souk), faute de photo de rue relevée (`docs/intentions/couleurs-photos-souk.md`) ; textures sans compression GPU (`docs/intentions/textures-compressees-quest.md`) ; jamais jugé sur un vrai Quest 3 (`docs/intentions/essai-casque-materiaux-souk.md`).

Créer un itinéraire (chantier creation-itineraire, APP-003, APP-012) : une seule commande hors casque, `npm run city -- <identifiant> --nom "<nom>" --emprise <sud,ouest,nord,est> --depart <lat,lon> --arrivee <lat,lon>` (étapes `--via`, retour `--retour aller-retour|boucle`, photos fournies `--photos <dossier>`), écrit l'extrait OpenStreetMap de la ville, son tracé de boucle (plus court chemin, chaque point sur une voie de l'extrait) et sa bibliothèque de matériaux, sans code ni script npm propre à la ville ; les quatre itinéraires existants sont décrits dans `app/data/villes.json` et se rejouent par leur identifiant. Les couleurs viennent de photos de rue (Panoramax, puis Mapillary avec `MAPILLARY_TOKEN`, puis photos fournies) ; sans photo à moins de 30 m du tracé, la recherche s'élargit aux quartiers voisins jusqu'à 1 km, puis se replie sur la palette de la région, et le rapport dit pour chaque couleur d'où elle vient (photo, distance, auteur, licence). Limites : la commande n'a été essayée que sur des réponses simulées (jamais contre Overpass, Panoramax ou Mapillary) ; le tracé rejoué des quatre itinéraires est valide mais pas identique aux boucles versionnées, qui n'ont pas été réécrites ; une ville créée n'est pas encore inscrite dans l'application (`docs/intentions/inscrire-une-ville-creee.md`) ; couleurs et matériaux à juger au casque (`docs/intentions/seance-casque-parcours.md`).

Tablette (chantier rendu-tablette-tactile, APP-007) : ouverte sur une tablette, la même version PC se commande au toucher. Des boutons en bas de l'écran
(« Moins vite », « Pause ou reprise », « Plus vite », « Recaler », « Quitter ») font les mêmes actions que le clavier ; glisser un doigt sur la scène tourne le regard,
relâcher l'arrête. Le tableau de bord reste du HTML en surimpression, et l'accueil comme le panneau tiennent dans la largeur d'un petit écran. Limites : rejoué en émulation
tactile de Chromium seulement ; l'essai sur une vraie tablette reste à faire (`docs/intentions/essai-tablette-tactile.md`) ; pas de pincement ni de gyroscope.

## Sécurité : le réel reste visible

La ville s'efface quand on baisse la tête (au-delà d'environ 25°), la zone du tapis définie à la manette reste
toujours transparente, l'opacité de la ville est réglable (30 à 100 %) et la périphérie peut rester en passthrough.
Règle protégée par le contrat APP-001.

Codé : le fondu tête baissée (ville pleine jusqu'à 25° sous l'horizontale, effacée à 40°, et effacée aussi si le
casque perd la pose) et l'opacité globale bornée.

Zone tapis : une boîte (par défaut 1,2 m de large, 2,4 m de profondeur, 1,2 m de haut, autour de la position de départ)
dans laquelle la ville n'est jamais rendue, quel que soit l'angle de la tête ou l'opacité ; le tapis, la rampe et la console
restent visibles. Elle se règle à la manette gauche : X la pose sous soi dans le sens du regard, le joystick la déplace
(vers l'avant en poussant), la prise (grip) tenue + joystick la redimensionne, Y rend la boîte par défaut. Elle est
enregistrée en fin de geste dans `localStorage` (un volume en mètres, aucune donnée personnelle) et relue au lancement suivant ;
une zone illisible est remplacée par la boîte par défaut. Vignette réelle : la périphérie du champ de vision reste en
passthrough (fondu entre 60 % et 125 % du rayon de l'image) ; activée par défaut, case à décocher à l'accueil.
Non essayé sur un vrai Quest 3 (lot 6 de la fiche).

Ambiance cartoon (lots 2, 3 et 5 de `docs/projects/journal.md`) : le sol, les voies et les bâtiments ont un matériau
toon à quatre paliers de lumière ; chaque classe de voie a sa couleur, une bordure plus claire et, dès 7 m de large, une ligne
centrale ; les façades portent un motif de fenêtres dessiné par le shader. Les contours des bâtiments (un trait autour des bâtiments à moins de 120 m du parcours) sont réglés par le profil graphique (ci-dessous), sans case à part. Les arbres sont ceux du pack Quaternius
« Stylized Nature MegaKit » (version Standard, CC0), embarqués dans `app/assets/` (provenance dans `app/assets/PROVENANCE.md`) : quatre
variantes d'arbre commun retenues parmi les 15 arbres de l'archive (non les 40 du kit complet), allégées à 413-454 triangles,
une variante, un cap et une taille par arbre tirés de sa position (donc la même forêt à chaque marche), 300 arbres au plus,
aucun appel réseau. Si le modèle ne se charge pas, l'écran le dit (« Arbres stylisés indisponibles… ») et la marche continue avec
l'arbre simple. Non essayé sur un vrai Quest 3 (`docs/intentions/essai-casque-ambiance-cartoon.md`).

## Profils graphiques

Chantier rendu-profils-graphiques (APP-006). À l'accueil, trois profils figés règlent ensemble le rendu, au casque, au PC et à la tablette :

| Profil | Contours | Ville riche (verdure, noms des rues) | Marquages au sol | Brouillard d'ambiance | Arbres / mobilier au plus | Ratio de pixels (PC, tablette) | Échelle d'image (casque) |
|---|---|---|---|---|---|---|---|
| Performance | non | non | non | non | 100 / 120 | 0,75 | 0,8 |
| Équilibré | non | oui | oui | oui | 300 / 400 | 1 | 1 |
| Qualité | oui | oui | oui | oui | 300 / 400 | 2, sans dépasser l'écran | 1,2 |

Le profil proposé vient des capacités de l'appareil, pas du seul user-agent : session `immersive-ar` possible (casque : équilibré), pointeur tactile
principal (tablette : performance), WebGL 2 absent (performance), ni casque ni tactile (PC : qualité) ; une détection impossible donne « équilibré ». Le choix
manuel l'emporte, est gardé dans le navigateur (`localStorage`, jamais envoyé) et relu à l'accueil suivant ; une valeur gardée inconnue est ignorée et dite à
l'accueil. Aucun profil ne touche l'opacité, la vignette ni la zone tapis : le réel reste visible (APP-001). Le profil retenu est inscrit sur la page (`data-profile`).
« Qualité » est proposé partout, sans refus fondé sur des mesures : le risque est assumé. Les images par seconde de chaque profil n'ont jamais été mesurées sur
un vrai Quest 3 (`docs/intentions/essai-casque-profils-graphiques.md`).

## Lampadaires produits par règle

Chantier lampadaires-generes (APP-013). Aucun extrait ne porte de lampadaire : la ville en produit le long des rues, sans jamais
les faire passer pour des relevés. L'intervalle dépend de la classe de voie (voie passante 27,5 m, rue de quartier 37,5 m,
ruelle 17,5 m ; ni sentier, ni escalier, ni cheminement piéton), varié de ±20 % par une graine tirée de l'identifiant
OpenStreetMap de la voie : jamais régulier, mais identique à chaque promenade. Le côté de la rue est choisi par tronçon, le
mât est posé à 0,6 m de la bordure, bras tendu vers la chaussée. Trois refus : dans un bâtiment, sur un trottoir de moins de
1,2 m, à moins de 2 m d'un autre objet ; les objets du relevé sont posés d'abord et jamais écartés.

Chaque objet porte sa provenance (`osm` ou `generated`) et la page dit combien de chaque sorte sont dessinés (`data-mobilier`,
par exemple « 12 d'OpenStreetMap · 300 produits »). Les lampadaires produits ont leur plafond par profil graphique (100 en
performance, 300 ailleurs), distinct de celui du mobilier du relevé, et partagent son maillage : aucun appel de rendu en plus
(environ 21 600 triangles pour 300 mâts, calculé et non mesuré). À l'accueil, la case **Lampadaires produits par règle**
(cochée) les éteint quand on la décoche ; rien n'en est gardé. Ils s'effacent tête baissée avec la ville (APP-001). Non jugé
au casque (densité, hauteur, images par seconde) : `docs/intentions/seance-casque-parcours.md`.

## Éclairage et ambiance

Chantier rendu-eclairage-ambiance (APP-011). La lumière de la ville suit l'heure réelle de l'appareil : le soleil monte de 6 h à
18 h, sa couleur passe de l'orange rasant au blanc de midi, le ciel et le brouillard suivent la même courbe ; la nuit, la ville
reste éclairée doucement (le soleil ne passe jamais sous l'horizon) et une heure illisible retombe sur midi. Rien ne se règle :
l'heure n'est pas un réglage de l'accueil.

Deux réglages facultatifs s'ajoutent à l'accueil, tous deux éteints à chaque ouverture (rien n'est gardé dans le navigateur) :

- **Brouillard** (décoché) : un voile de profondeur. Au casque, il ne dépasse jamais 15 % d'opacité, même à 1000 m, et rien
  n'est voilé en deçà de 8 m : la zone tapis, le panneau d'infos, la minicarte et tout obstacle à portée de pas gardent leurs
  couleurs (APP-001). Sur la version PC, où il n'y a pas de réel à voir, le voile peut aller plus loin (90 %). Le profil
  « performance » le refuse, même coché.
- **Sons d'ambiance** (0 %) : une rumeur produite par code (bruit filtré, bouclé). Tant que le volume est à 0, aucun contexte
  audio n'est ouvert ; au plus fort, le gain reste à 0,2, de quoi entendre le tapis, la pièce et une personne qui parle.
  Quitter la marche coupe le son.

Au casque, aucun ciel ni fond n'est posé : le fond est le passthrough, donc le réel. Sur la version PC, le ciel suit l'heure.
Ce qui est appliqué est inscrit sur la page (`data-ambiance`, par exemple « brouillard 15 % · sons 20 % »). Limites : jamais
essayé sur un vrai Quest 3 (`docs/intentions/essai-casque-eclairage-ambiance.md`) ; les sons sont un murmure produit par code,
pas une ville enregistrée (`docs/intentions/sons-ambiance-ville.md`) ; la courbe du jour ignore la saison et la latitude.

## Vérifié en conditions réelles

Rien pour l'instant : aucune fonctionnalité n'a encore été essayée sur le Quest 3 et le tapis. La tranche codée est
vérifiée dans Chromium avec un Quest 3 émulé (IWER), pas sur un vrai casque.
