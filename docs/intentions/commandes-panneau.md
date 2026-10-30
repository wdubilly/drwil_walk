# Intention : pause, recalibrage et panneau d'infos dans le casque

**Statut** : proposée le 2026-10-30.

## Besoin

`MISSION.md` (§ 4.2) prévoit : gâchette droite pour pause / reprise, bouton A pour recalibrer (« je suis face au
tapis »), bouton B pour afficher le panneau d'infos (vitesse, distance, temps, lieu) **dans le casque**.

## Existant

Lu le 2026-10-30 : seul le joystick droit (±0,1 km/h) est codé (`app/src/xr/joystick.ts`). Le panneau de marche
(`app/src/ui/panel.ts`) est affiché sur la page, pas dans la scène 3D.

## Questions à trancher

- [decision] Panneau dans le casque : texte flottant devant soi ou attaché au poignet ?
- [decision] La pause fige-t-elle aussi la ville, ou seulement l'avancée ?
