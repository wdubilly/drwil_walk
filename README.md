# drwil_walk

Marcher sur un tapis de course avec un Meta Quest 3 en visitant une vraie ville, Pune ou Doha, tout en gardant une vue
sur son environnement réel.

## Ce que ça fait

- Une page WebXR en réalité mixte, ouverte dans le navigateur du Quest 3, sans rien installer.
- 4 itinéraires : Pune Vieille ville (par défaut), Pune FC Road, Doha Corniche (du Musée d'art islamique vers West Bay)
  et Doha Souq Waqif.
- La vitesse se règle à la manette pour correspondre à celle du tapis (pas de Bluetooth dans la v0.1).
- Sécurité : la ville s'efface quand on baisse la tête, la zone du tapis reste toujours transparente et l'opacité de la
  ville est réglable.

Le détail de la v0.1 est dans `MISSION.md`.

## Démarrer

L'application n'est pas encore écrite : le projet est cadré, le développement commence avec le premier chantier. Les
commandes d'installation, de lancement et de test seront décrites ici, puis dans `INSTALL.md`, au fil des chantiers.

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
