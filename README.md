# drwil_walk

Marcher sur un tapis de course avec un Meta Quest 3 en visitant une vraie ville, Pune ou Doha, tout en gardant une vue
sur son environnement réel.

## Ce que ça fait

- Une page WebXR en réalité mixte, ouverte dans le navigateur du Quest 3, sans rien installer.
- 4 itinéraires proposés : Pune Vieille ville, Pune FC Road, Doha Corniche (du Musée d'art islamique vers West Bay)
  et Doha Souq Waqif. Le souk de Doha (par défaut), la Vieille ville de Pune, la Corniche de Doha et Pune FC Road se parcourent.
- Un itinéraire libre (départ et arrivée sur une carte ou par une adresse, chemin à pied calculé par Valhalla et adresses de Photon, 5 km au plus,
  arrêt à l'arrivée), sans clé (instances publiques d'OpenStreetMap, `INSTALL.md`) ; si un service refuse, la raison est dite et les quatre itinéraires restent.
- Deux rendus de la ville, au choix à l'accueil : bâtiments OpenStreetMap (par défaut, sans réseau) ou, avec une clé
  Google (`INSTALL.md`), les tuiles photoréalistes Google 3D, avec repli sur OpenStreetMap et raison dite à l'écran.
- La vitesse se règle à la manette pour correspondre à celle du tapis (pas de Bluetooth dans la v0.1).
- Sécurité : la ville s'efface quand on baisse la tête, la zone du tapis reste toujours transparente et l'opacité de la
  ville est réglable.

Le détail de la v0.1 est dans `MISSION.md`.

## Démarrer

Une première tranche est codée : accueil, entrée en réalité mixte, marche dans le souk de Doha, la Vieille ville de Pune, la Corniche de Doha ou FC Road (bâtiments
OpenStreetMap extrudés et teintés, arbres et mobilier, boucle d'environ 1,5 km) à la vitesse réglée (joystick droit : ±0,1 km/h), ville qui s'efface
tête baissée. La zone tapis arrive chantier par chantier. Les données de la ville sont ©
contributeurs OpenStreetMap (licence ODbL). Avec Node.js 24 :

```bash
cd app
npm ci
npm run dev    # serveur HTTPS sur le réseau local, à ouvrir depuis le navigateur du Quest 3
npm test       # tests unitaires
npm run extract # relance l'extraction du souk depuis OpenStreetMap (Overpass) et réécrit app/data/souq-waqif.json
npm run extract:pune # de même pour la Vieille ville de Pune (app/data/pune-vieille-ville.json)
npm run extract:corniche # de même pour la Corniche de Doha (app/data/doha-corniche.json)
npm run extract:fc-road # de même pour FC Road à Pune (app/data/pune-fc-road.json)
npm run e2e    # chemins critiques de bout en bout, Quest 3 émulé (après npx playwright install chromium) ;
               # les captures de l'accueil et de la marche à Pune, sur la Corniche et sur FC Road sont écrites dans dist/e2e-captures/
```

Mode d'emploi pas à pas avec le Quest 3 (réseau, certificat, tapis, sécurité) : `docs/guide-utilisateur.md`.
Installation complète et contrôles : `INSTALL.md`.

## Documentation

| Sujet | Document |
|---|---|
| Mission de la v0.1 | `MISSION.md` |
| Ce que fait l'application, écran par écran | `docs/features.md` |
| Structure du code, carte du dépôt | `docs/architecture.md` |
| Sécurité | `docs/security.md` |

## Travailler sur le projet

Projet gouverné avec drwil : les assistants de code (et les humains) commencent par `AGENTS.md`. Les règles vérifiées
sont dans `docs/contracts.md`, les procédures dans `docs/recipes/`, le travail en attente dans
`docs/projects/pending.md`. Activer les hooks de vérification une fois par clone :
`git config core.hooksPath .githooks`.
