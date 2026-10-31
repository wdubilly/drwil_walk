# Fonctionnalités

Ce que fait drwil_walk, fonctionnalité par fonctionnalité, du point de vue de la personne qui marche sur le tapis.
Cadré le 2026-10-30. Le détail de la v0.1 est dans `MISSION.md`. Codé au 2026-10-30 : une première tranche (accueil,
entrée en réalité mixte, marche dans le souk de Doha, joystick de vitesse, fondu tête baissée) ; le
reste est marqué « à venir ».

## Écran d'accueil

Ouvert dans le navigateur du Quest 3 : choix de l'itinéraire (Doha Souq Waqif par défaut ; Pune Vieille ville et Doha Corniche disponibles ; Pune FC Road
à venir) et de la vitesse de départ, rappel de sécurité (clé de sécurité du tapis attachée, main près
de la rampe), bouton « Entrer en réalité mixte ». Une seule personne utilise l'application : pas de compte ni de rôle.

Codé : accueil sombre à grandes cibles (48 px au moins, contraste prouvé par QUA-014, contraste du texte et de son
fond) ; quatre cartes d'itinéraire avec une illustration, Doha Souq Waqif choisi par défaut, choix d'un clic ou à la
manette ; la dernière (Pune FC Road) est marquée « Bientôt » et ne se choisissent pas (leur ville n'existe pas encore) ;
vitesse de départ (1 à 8 km/h, défaut 4,0), opacité de la ville (30 à 100 %), rappel de sécurité, mention « © contributeurs OpenStreetMap », bouton d'entrée ; un
échec (navigateur sans WebXR, réalité mixte non prise en charge) s'affiche sur la page. Les itinéraires qui démarrent sont le souk
de Doha, la Vieille ville de Pune et la Corniche de Doha ; le choisi est inscrit sur la page (`data-route`) ; les autres villes : `docs/intentions/autres-itineraires.md`.

## Marche dans la ville

La ville défile le long de l'itinéraire à la vitesse réglée (défaut 4,0 km/h, de 1 à 8 km/h, par pas de 0,1), avec une
caméra qui suit le parcours sans rotation brusque (la direction est lissée sur 8 m dans les virages). Manettes : gâchette droite pour pause / reprise, joystick droit pour la
vitesse, bouton A pour recalibrer, bouton B pour le panneau d'infos (vitesse, distance, temps, lieu). La ville est faite
de bâtiments OpenStreetMap extrudés (pas de Google en v0.1), avec la mention « © contributeurs OpenStreetMap ».

Codé : session `immersive-ar` (passthrough), le souk de Doha (Souq Waqif : 253 bâtiments OpenStreetMap extrudés, sol)
qui défile le long d'une boucle d'environ 1,5 km (place Al Koot, ruelle principale, écuries, retour) à la vitesse
réglée et reprend au départ à la fin de la boucle (contrat APP-002), joystick droit haut / bas pour +0,1 / −0,1 km/h (un cran par poussée),
panneau sur la page (vitesse, distance, temps, opacité de la ville, mention OpenStreetMap) et panneau de mention dans
la scène du casque, effacé avec la ville (contrat APP-003). Limites : la ville n'a pas encore été vue sur un vrai Quest 3
(rendu, 72 images par seconde, lisibilité de la mention) ; environ 20 m de la boucle traversent des passages couverts
dessinés comme des bâtiments par OpenStreetMap. À venir : le dernier itinéraire (Pune FC Road), la gâchette (pause), les boutons A et B, le panneau d'infos dans le casque.

Codé aussi : la Vieille ville de Pune (2 079 bâtiments OpenStreetMap extrudés) qui défile le long d'une boucle d'environ
1,5 km (Shaniwar Wada, contour nord du fort, ruelles à l'est jusqu'au temple Dagdusheth Halwai Ganpati, retour par l'ouest
et Bajirao Road) ; la marche lit l'itinéraire choisi à l'accueil. Limites : le tracé est calculé par plus court chemin
sur les voies OpenStreetMap (hypothèse de cadrage, à relire par le demandeur) ; ni la ville ni la boucle n'ont été vues sur
un vrai Quest 3 (cadence, lisibilité).

Codé aussi : la Corniche de Doha (756 bâtiments OpenStreetMap extrudés, dont les tours de West Bay dans l'extrait) le long d'un
aller-retour d'environ 4 km (2 km sur le front de mer en partant près du Musée d'art islamique, retour par le même chemin) ;
la marche lit l'itinéraire choisi à l'accueil. Limites : le tracé est calculé par plus court chemin sur les voies
OpenStreetMap, qui préfère les cheminements piétons (hypothèse de cadrage, à relire par le demandeur) ; il part du point
relié le plus proche du musée et n'atteint pas West Bay (environ 3,5 km plus loin), dont les tours ne se voient que de loin ;
310 bâtiments sur 756 sans hauteur OSM (7 m par défaut) ; jamais essayé sur un vrai Quest 3.

## Sécurité : le réel reste visible

La ville s'efface quand on baisse la tête (au-delà d'environ 25°), la zone du tapis définie à la manette reste
toujours transparente, l'opacité de la ville est réglable (30 à 100 %) et la périphérie peut rester en passthrough.
Règle protégée par le contrat APP-001.

Codé : le fondu tête baissée (ville pleine jusqu'à 25° sous l'horizontale, effacée à 40°, et effacée aussi si le
casque perd la pose) et l'opacité globale bornée. À venir : la zone tapis et la vignette réelle.

## Vérifié en conditions réelles

Rien pour l'instant : aucune fonctionnalité n'a encore été essayée sur le Quest 3 et le tapis. La tranche codée est
vérifiée dans Chromium avec un Quest 3 émulé (IWER), pas sur un vrai casque.
