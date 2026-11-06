# Recipe: run the project locally

Commandes réelles de drwil_walk (couche `app/`).

Prerequisites and filling in the configuration (e.g. `.env`): `INSTALL.md`
(if present).

1. Démarrer : `cd app && npm run dev` (Vite en HTTPS, `--host` : écoute aussi sur le réseau local).
2. Signal de succès : Vite affiche une adresse `Local: https://localhost:5173/` et une ou plusieurs `Network:
   https://<ip>:5173/`. La page affiche quatre itinéraires, vitesse de départ (4,0 km/h), rappel de sécurité et boutons
   « Entrer en réalité mixte » et « Version PC ». Les préférences se règlent pendant la marche.
   Sans casque (navigateur de bureau sans WebXR), le premier bouton dit pourquoi il ne peut pas entrer ; le PC reste utilisable.
3. Depuis le Quest 3 : ouvrir l'adresse `Network` dans son navigateur et accepter le certificat auto-signé
   (pas à pas, dépannage et sécurité : `docs/guide-utilisateur.md`).
4. Enable the hooks (once per clone, local non-versioned git setting):
   `git config core.hooksPath .githooks`.
5. Arrêter : `Ctrl+C` dans le terminal de Vite.

## Known pitfalls

- 2026-10-30 : le navigateur avertit d'un certificat non fiable : c'est le certificat auto-signé de
  `@vitejs/plugin-basic-ssl`, à accepter (WebXR exige HTTPS).
