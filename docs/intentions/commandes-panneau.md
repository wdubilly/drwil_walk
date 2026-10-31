# Intention : pause, recalibrage et panneau d'infos dans le casque

**Statut** : proposée le 2026-10-30. Cadrée le 2026-10-31 : `docs/projects/commandes-panneau.md`.

## Besoin

`MISSION.md` (§ 4.2) prévoit : gâchette droite pour pause / reprise, bouton A pour recalibrer (« je suis face au
tapis »), bouton B pour afficher le panneau d'infos (vitesse, distance, temps, lieu) **dans le casque**.

## Existant

Lu le 2026-10-30 : seul le joystick droit (±0,1 km/h) est codé (`app/src/xr/joystick.ts`). Le panneau de marche
(`app/src/ui/panel.ts`) est affiché sur la page, pas dans la scène 3D.

## Questions à trancher

- Tranché le 2026-10-31 : texte flottant devant soi, pas attaché au poignet.
- Tranché le 2026-10-31 : la pause ne fige que l'avancée, la ville et le fondu de sécurité continuent.
