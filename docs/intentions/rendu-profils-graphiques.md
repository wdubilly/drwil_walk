# Intention : des profils graphiques (casque, PC, tablette)

**Statut** : proposée le 2026-11-02 (exigence transversale de `docs/intentions/rendu-jeu-video.md`) ; après les mesures (`docs/intentions/rendu-mesures-diagnostic.md`).

## Besoin

Un réglage de qualité indépendant de la logique métier, avec au moins un profil par cible : casque Quest 3, PC, tablette
(textures, niveaux de détail, distances d'affichage, ombres, reflets, densité du mobilier et de la verdure). Détection des
capacités (WebXR, extensions graphiques, tactile) sans se fier au seul user-agent, et choix manuel quand elle est insuffisante.
Chaque effet avancé garde un repli ou se désactive.

## Existant

Lu le 2026-11-02 : pas de notion de profil ; les options de rendu sont des cases de l'accueil (contours des bâtiments, ville
riche, côté du panneau) gardées dans le navigateur. Le côté du panneau est déjà un réglage mémorisé (`app/src/ui/panel.ts`).

## Questions à trancher

- [decision] Profils figés (« performance », « équilibré », « qualité ») ou un profil par appareil choisi automatiquement ?
- [decision] Le profil « qualité » est-il refusé tant que les mesures ne le permettent pas ?
- Le profil se choisit à l'accueil, avec le même mécanisme que le côté du panneau ?
