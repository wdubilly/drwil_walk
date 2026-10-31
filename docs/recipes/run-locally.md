# Recipe: run the project locally

Commandes réelles de drwil_walk (couche `app/`).

Prerequisites and filling in the configuration (e.g. `.env`): `INSTALL.md`
(if present).

1. Démarrer : `cd app && npm run dev` (Vite en HTTPS, `--host` : écoute aussi sur le réseau local).
2. Signal de succès : Vite affiche une adresse `Local: https://localhost:5173/` et une ou plusieurs `Network:
   https://<ip>:5173/`. Ouverte dans un navigateur, la page affiche l'accueil : rappel de sécurité, vitesse de départ (4,0 km/h), opacité de la ville et bouton « Entrer
   en réalité mixte ». Sans casque (navigateur de bureau sans WebXR), le bouton affiche pourquoi il ne peut pas entrer.
3. Depuis le Quest 3 : ouvrir l'adresse `Network` dans son navigateur et accepter le certificat auto-signé
   (pas à pas, dépannage et sécurité : `docs/guide-utilisateur.md`).
4. Enable the hooks (once per clone, local non-versioned git setting):
   `git config core.hooksPath .githooks`.
5. Arrêter : `Ctrl+C` dans le terminal de Vite.

## Known pitfalls

- 2026-10-30 : le navigateur avertit d'un certificat non fiable : c'est le certificat auto-signé de
  `@vitejs/plugin-basic-ssl`, à accepter (WebXR exige HTTPS).
