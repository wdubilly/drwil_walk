# Intention : créer la clé Google et vérifier la couverture de Pune et de Doha

**Statut** : proposée le 2026-10-31 (reste du chantier google-3d-tiles, lot 1, réservé à l'humain).

**Revue le 2026-10-31 (EEA)** : créer la clé Map Tiles est inutile avec une facturation de l'EEA (403, voir `docs/intentions/google-3d-tiles.md`). À ne faire qu'avec une facturation hors EEA.

## Besoin

Le rendu Google 3D est livré et prouvé avec des tuiles factices, mais il n'a jamais tourné avec une vraie clé : l'agent n'en
a aucune et n'appelle jamais Google. Le demandeur doit créer la clé « Map Tiles API », la restreindre, la poser dans
`.env.local` (dans `app/`) et constater que Google couvre bien Pune et Doha en 3D photoréaliste.

## Existant

Lu le 2026-10-31 (`app/src/city/google-tiles.ts`, `app/src/main.ts`, `INSTALL.md`) : la clé est lue de `VITE_GOOGLE_MAPS_API_KEY`
(variable de build Vite, donc lisible dans la page : restriction par référent HTTP et par API dans la console Google).
Sans clé, ou si le jeu de tuiles est refusé, la marche se fait en OpenStreetMap et la raison s'affiche à l'accueil.
Les mentions de Google (texte « Google » et droits des tuiles) tiennent lieu de logo ; leur conformité aux conditions de Google
n'est pas vérifiée. Le décodeur Draco des tuiles est chargé depuis `www.gstatic.com` (version 1.5.7), non essayé. Les messages
d'échec viennent de la bibliothèque, qui ne garde pas le code HTTP : le texte d'un refus réel n'a jamais été lu.

## Questions à trancher

- [decision] Créer la clé et la restreindre (référents, « Map Tiles API » seule) : qui, et quel plafond de coût accepté au-delà du quota gratuit ?
- [decision] La couverture photoréaliste de Pune (Vieille ville, FC Road) et de Doha (Souq Waqif, Corniche) est-elle suffisante ? Sinon, quels itinéraires restent en OpenStreetMap ?
- [decision] Les mentions affichées (texte « Google » et droits des tuiles) suffisent-elles aux conditions d'attribution de Google, ou faut-il afficher le logo ?
