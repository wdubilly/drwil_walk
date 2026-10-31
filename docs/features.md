# Fonctionnalités

Ce que fait drwil_walk, fonctionnalité par fonctionnalité, du point de vue de la personne qui marche sur le tapis.
Cadré le 2026-10-30. Le détail de la v0.1 est dans `MISSION.md`. Codé au 2026-10-30 : une première tranche (accueil,
entrée en réalité mixte, marche en ligne droite dans une rue simple, joystick de vitesse, fondu tête baissée) ; le
reste est marqué « à venir ».

## Écran d'accueil

Ouvert dans le navigateur du Quest 3 : choix de l'itinéraire (Pune Vieille ville par défaut, Pune FC Road, Doha
Corniche, Doha Souq Waqif) et de la vitesse de départ, rappel de sécurité (clé de sécurité du tapis attachée, main près
de la rampe), bouton « Entrer en réalité mixte ». Une seule personne utilise l'application : pas de compte ni de rôle.

Codé : accueil sombre à grandes cibles (48 px au moins, contraste prouvé par QUA-014, contraste du texte et de son
fond) ; quatre cartes d'itinéraire avec une illustration, Pune Vieille ville choisie par défaut, choix d'un clic ou à la
manette ; les trois autres sont marquées « Bientôt » et ne se choisissent pas (leur ville n'existe pas encore) ;
vitesse de départ (1 à 8 km/h, défaut 4,0), opacité de la ville (30 à 100 %), rappel de sécurité, bouton d'entrée ; un
échec (navigateur sans WebXR, réalité mixte non prise en charge) s'affiche sur la page. Limite : l'itinéraire choisi est
lu et inscrit sur la page (`data-route`), la marche reste la rue simple pour tous (`docs/intentions/autres-itineraires.md`).

## Marche dans la ville

La ville défile le long de l'itinéraire à la vitesse réglée (défaut 4,0 km/h, de 1 à 8 km/h, par pas de 0,1), avec une
caméra qui suit la rue sans rotation brusque. Manettes : gâchette droite pour pause / reprise, joystick droit pour la
vitesse, bouton A pour recalibrer, bouton B pour le panneau d'infos (vitesse, distance, temps, lieu). La ville est faite
de bâtiments OpenStreetMap extrudés (pas de Google en v0.1), avec la mention « © contributeurs OpenStreetMap ».

Codé : session `immersive-ar` (passthrough), une rue simple (sol et blocs) qui défile en ligne droite à la vitesse
réglée et reprend à son début après 240 m, joystick droit haut / bas pour +0,1 / −0,1 km/h (un cran par poussée),
panneau sur la page (vitesse, distance, temps, opacité de la ville). À venir : la vraie ville et ses itinéraires, la
gâchette (pause), les boutons A et B, le panneau d'infos dans le casque.

## Sécurité : le réel reste visible

La ville s'efface quand on baisse la tête (au-delà d'environ 25°), la zone du tapis définie à la manette reste
toujours transparente, l'opacité de la ville est réglable (30 à 100 %) et la périphérie peut rester en passthrough.
Règle protégée par le contrat APP-001.

Codé : le fondu tête baissée (ville pleine jusqu'à 25° sous l'horizontale, effacée à 40°, et effacée aussi si le
casque perd la pose) et l'opacité globale bornée. À venir : la zone tapis et la vignette réelle.

## Vérifié en conditions réelles

Rien pour l'instant : aucune fonctionnalité n'a encore été essayée sur le Quest 3 et le tapis. La tranche codée est
vérifiée dans Chromium avec un Quest 3 émulé (IWER), pas sur un vrai casque.
