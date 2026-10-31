# Intention : auto-héberger Valhalla et Photon

**Statut** : proposée le 2026-10-31 (question ouverte du chantier fournisseurs-ouverts).

## Besoin

Ne pas dépendre des instances publiques (limites d'usage, disponibilité) pour le routage piéton et les adresses du trajet libre.

## Existant

Lu le 2026-10-31 : l'application vise une instance auto-hébergée par deux variables non secrètes, `VITE_ROUTING_URL` (Valhalla) et
`VITE_GEOCODING_URL` (Photon), documentées dans `INSTALL.md` et `.env.example` ; rien n'installe ces services (ni script ni conteneur).
Leur extrait de données (Inde de l'Ouest, Qatar), leur taille disque et leur mise à jour ne sont pas étudiés.

## Questions à trancher

- [decision] Outiller (script, conteneur) ou seulement documenter l'installation de Valhalla et de Photon ?
- [decision] Quelles régions couvrir, et sur quelle machine (le poste de développement, un petit serveur) ?
