# Fonctionnalités

Ce que fait drwil_walk, fonctionnalité par fonctionnalité, du point de vue de la personne qui marche sur le tapis.
Cadré le 2026-10-30 : rien n'est encore codé. Le détail de la v0.1 est dans `MISSION.md`.

## Écran d'accueil

Ouvert dans le navigateur du Quest 3 : choix de l'itinéraire (Pune Vieille ville par défaut, Pune FC Road, Doha
Corniche, Doha Souq Waqif) et de la vitesse de départ, rappel de sécurité (clé de sécurité du tapis attachée, main près
de la rampe), bouton « Entrer en réalité mixte ». Une seule personne utilise l'application : pas de compte ni de rôle.

## Marche dans la ville

La ville défile le long de l'itinéraire à la vitesse réglée (défaut 4,0 km/h, de 1 à 8 km/h, par pas de 0,1), avec une
caméra qui suit la rue sans rotation brusque. Manettes : gâchette droite pour pause / reprise, joystick droit pour la
vitesse, bouton A pour recalibrer, bouton B pour le panneau d'infos (vitesse, distance, temps, lieu). Sans clé Google
ou sans couverture 3D, la ville passe sur des bâtiments OpenStreetMap.

## Sécurité : le réel reste visible

La ville s'efface quand on baisse la tête (au-delà d'environ 25°), la zone du tapis définie à la manette reste
toujours transparente, l'opacité de la ville est réglable (30 à 100 %) et la périphérie peut rester en passthrough.
Règle protégée par le contrat APP-001.

## Vérifié en conditions réelles

Rien pour l'instant : aucune fonctionnalité n'a encore été essayée sur le Quest 3 et le tapis.
