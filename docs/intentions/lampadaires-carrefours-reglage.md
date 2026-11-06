# Intention : lampadaires produits, deux limites techniques à lever (carrefours, chemin du réglage)

**Statut** : proposée le 2026-11-04.

## Besoin

Le chantier lampadaires-generes (`APP-013`) a laissé deux limites techniques, sans effet sur la sécurité mais qui nuisent à la
crédibilité et à la propreté du code.

## Existant

Lu le 2026-11-04.

- La règle ne regarde que les bâtiments et les autres objets : à un carrefour, un mât posé au bord d'une voie peut tomber sur la
  chaussée ou le trottoir d'une voie perpendiculaire (`app/src/city/lamp-rule.ts`).
- Le chemin du réglage est traité par le recentrage du 2026-11-05 : préférence validée
  (`app/src/ui/preferences.ts`), application à chaud (`app/src/xr/live-preferences.ts`,
  `app/src/city/live-city.ts`), sans lecture d'une case d'accueil. Le relevé reste écrit sur `#app`.
- La génération coûte de 25 à 130 ms au chargement d'une ville sur la machine de développement (mesure ponctuelle, hors casque).

## Questions à trancher

- Refuser un mât à moins d'une demi-chaussée d'une autre voie, au prix d'un calcul de plus au chargement ?
- Chemin du réglage : traité ; seul le refus aux carrefours reste à décider.
- Le temps de génération est-il acceptable au casque, ou faut-il le faire une fois à la préparation de l'extrait ?
