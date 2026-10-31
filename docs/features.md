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
vitesse de départ (1 à 8 km/h, défaut 4,0 ; la plage est écrite sous le champ et une saisie hors plage est ramenée à la borne en le disant, avec la raison), opacité de la ville (30 à 100 %), rappel de sécurité, mention « © contributeurs OpenStreetMap » (suivie de « Google » quand ce rendu est choisi), bouton d'entrée ; rendu OpenStreetMap par défaut, Google 3D en option : sans clé, ou si les tuiles ne se chargent pas, la marche se fait en OpenStreetMap et la raison s'affiche sur l'accueil ; un
échec (navigateur sans WebXR, réalité mixte non prise en charge) s'affiche sur la page. Les itinéraires qui démarrent sont le souk
de Doha, la Vieille ville de Pune, la Corniche de Doha et FC Road à Pune ; le choisi est inscrit sur la page (`data-route`) .

## Itinéraire libre

Choisir son propre trajet : à l'accueil, la carte « Itinéraire libre » ouvre une carte légère (tuiles OpenStreetMap avec leur mention,
zoom et déplacement par boutons). Le départ et l'arrivée se posent en touchant la carte ou en cherchant un lieu ou une adresse (Photon,
OpenStreetMap) ; les deux modes se remplissent mutuellement (géocodage inverse pour une touche, point placé pour une adresse), le premier résultat
d'une adresse est retenu et affiché. « Calculer le trajet » demande le chemin à pied à Valhalla (profil piéton), puis charge les
bâtiments OpenStreetMap proches du tracé ; la marche suit ce tracé à la vitesse réglée et **s'arrête à l'arrivée en le disant** (page et casque), sans
boucle (contrat APP-002). La ville vient du rendu Google 3D si on l'a choisi, ou des bâtiments OpenStreetMap chargés pour le trajet
(contrat APP-003). Aller simple, 5 km au plus. Aucune clé : routage et adresses viennent des instances publiques d'OpenStreetMap (réglables pour une instance auto-hébergée, `INSTALL.md`) ; si un service refuse
ou limite les demandes, la raison est dite et les quatre itinéraires figés restent utilisables. Une clé Google Routes remplace ces deux services (option). Aucun point ni adresse n'est conservé.

Codé et vérifié dans Chromium avec un Quest 3 émulé, services factices (jamais d'appel à un service réel). Limites : jamais essayé avec les instances publiques ni sur un
vrai Quest 3 (cadence avec des milliers de bâtiments en bande de 150 m, profil piéton et justesse des adresses de Valhalla et de Photon dans les rues de Pune et de Doha) ;
`docs/intentions/essai-casque-itineraire-libre.md`.

## Marche dans la ville

La ville défile le long de l'itinéraire à la vitesse réglée (défaut 4,0 km/h, de 1 à 8 km/h, par pas de 0,1 ; le panneau de la page dit quand la vitesse est à une borne, le message dans le casque lui-même reste à faire : `docs/intentions/hud-casque.md`), avec une
caméra qui suit le parcours sans rotation brusque (la direction est lissée sur 8 m dans les virages). Manettes : gâchette droite pour pause / reprise, joystick droit pour la
vitesse, bouton A pour recalibrer, bouton B pour le panneau d'infos (vitesse, distance, temps, lieu). La ville est faite
de bâtiments OpenStreetMap extrudés par défaut, ou des tuiles photoréalistes Google 3D au choix de l'accueil (clé requise), avec les mentions « © contributeurs OpenStreetMap » et, en rendu Google, celle de Google et les droits des tuiles. Le fondu tête baissée efface les tuiles Google comme la ville OpenStreetMap. À juger au casque : netteté à hauteur d'yeux, 72 images par seconde, lisibilité des mentions.

Codé : session `immersive-ar` (passthrough), le souk de Doha (Souq Waqif : 253 bâtiments OpenStreetMap extrudés, sol)
qui défile le long d'une boucle d'environ 1,5 km (place Al Koot, ruelle principale, écuries, retour) à la vitesse
réglée et reprend au départ à la fin de la boucle (contrat APP-002), joystick droit haut / bas pour +0,1 / −0,1 km/h (un cran par poussée),
panneau sur la page (vitesse, distance, temps, opacité de la ville, mention OpenStreetMap) et panneau de mention dans
la scène du casque, effacé avec la ville (contrat APP-003). Limites : la ville n'a pas encore été vue sur un vrai Quest 3
(rendu, 72 images par seconde, lisibilité de la mention) ; environ 20 m de la boucle traversent des passages couverts
dessinés comme des bâtiments par OpenStreetMap. À venir : la gâchette (pause), les boutons A et B, le panneau d'infos dans le casque.

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

Rendu enrichi (chantier osm-enrichi) : les bâtiments prennent la couleur, la couleur de toit ou le matériau de leurs balises
OpenStreetMap, sinon un ton de la palette de l'itinéraire ; les murs s'assombrissent vers le pied (ombrage par sommet) ; les
arbres, lampadaires et bancs de l'extrait s'affichent (300 arbres et 400 éléments de mobilier au plus, les plus proches du
parcours). Constaté sur les extraits du 2026-10-31 : arbres 155 (souk), 285 (Vieille ville), 513 (Corniche), 105 (FC Road) ;
bancs 19 (souk) et 8 (Corniche) ; aucun lampadaire ; très peu de bâtiments portent une couleur ou un matériau (7 matériaux
au total, un seul toit coloré hors bâtiment), donc la plupart gardent le ton de la palette. À juger au casque, cadence
comprise (lot 5 du chantier, humain) ; le relief du sol n'est pas fait (`docs/intentions/osm-enrichi.md`).

## Sécurité : le réel reste visible

La ville s'efface quand on baisse la tête (au-delà d'environ 25°), la zone du tapis définie à la manette reste
toujours transparente, l'opacité de la ville est réglable (30 à 100 %) et la périphérie peut rester en passthrough.
Règle protégée par le contrat APP-001.

Codé : le fondu tête baissée (ville pleine jusqu'à 25° sous l'horizontale, effacée à 40°, et effacée aussi si le
casque perd la pose) et l'opacité globale bornée. À venir : la zone tapis et la vignette réelle.

## Vérifié en conditions réelles

Rien pour l'instant : aucune fonctionnalité n'a encore été essayée sur le Quest 3 et le tapis. La tranche codée est
vérifiée dans Chromium avec un Quest 3 émulé (IWER), pas sur un vrai casque.
