# Intention : lampadaires produits, deux limites techniques à lever (carrefours, chemin du réglage)

**Statut** : proposée le 2026-11-04.

## Besoin

Le chantier lampadaires-generes (`APP-013`) a laissé deux limites techniques, sans effet sur la sécurité mais qui nuisent à la
crédibilité et à la propreté du code.

## Existant

Lu le 2026-11-04.

- La règle ne regarde que les bâtiments et les autres objets : à un carrefour, un mât posé au bord d'une voie peut tomber sur la
  chaussée ou le trottoir d'une voie perpendiculaire (`app/src/city/lamp-rule.ts`).
- Le réglage « Lampadaires produits par règle » est une case de l'accueil que `createSouqScene` relit dans la page
  (`app/src/ui/lamps-choice.ts`), faute de pouvoir passer par `app/src/xr/experience.ts` et `app/src/pc/enter-pc.ts`, hors du
  périmètre du chantier. Le relevé (`data-mobilier`) est aussi écrit par la scène sur `#app`. Les autres réglages (brouillard,
  matériaux) passent, eux, par `HomeView`.
- La génération coûte de 25 à 130 ms au chargement d'une ville sur la machine de développement (mesure ponctuelle, hors casque).

## Questions à trancher

- Refuser un mât à moins d'une demi-chaussée d'une autre voie, au prix d'un calcul de plus au chargement ?
- Faire passer le réglage par `HomeView` (`readGeneratedLamps`) et `sceneOptionsOf` comme les autres, et retirer la lecture de
  la page ?
- Le temps de génération est-il acceptable au casque, ou faut-il le faire une fois à la préparation de l'extrait ?
