# Intention : la même ville et les mêmes options sur Quest, PC et tablette, par construction

**Statut** : proposée le 2026-11-05 (demande du demandeur).

## Besoin

Exprimé par le demandeur le 2026-11-05 : les trois plateformes (Quest 3, PC, tablette) doivent afficher **exactement la même
ville**, avec les mêmes options (matériaux, lampadaires, ville vivante, arbres), et **toute demande de développement doit être
traitée systématiquement pour les trois**, pas pour l'une d'elles puis rattrapée plus tard. Cela sert le générateur de
parcours (`docs/intentions/generateur-ville-complet.md`) : une ville créée doit être complète partout.

## Existant

Lu le 2026-11-05 :
- le PC et la tablette lancent la même marche que le Quest (`docs/features.md`, section « Version PC ») ; la ville est
  construite par `app/src/city/souq.ts` pour les trois ;
- les chemins d'entrée sont distincts : `app/src/xr/` (casque), `app/src/pc/enter-pc.ts` (PC et tablette) ; les choix de
  l'accueil sont lus par chacun (`app/src/ui/*-choice.ts`) ;
- `app/src/pc/enter-pc.ts` lit les matériaux et les arbres de l'accueil ; **s'il lit aussi les lampadaires et la
  circulation, c'est à relever** (aucun contrôle ne le garantit aujourd'hui) ;
- aucun contrat ne dit qu'une fonction de rendu doit exister sur les trois plateformes ; seul `APP-006` règle un rendu commun
  par profil.

## Décisions du demandeur (2026-11-05)

- **Règle** : un contrat testé « parité des plateformes », dont le test échoue quand une option de l'accueil n'atteint pas un mode.
- **Propre à chaque plateforme** (seules différences admises) : commandes, passthrough au casque seulement (sécurité-visibilité), ciel, profils de rendu par défaut.
- **Ordre** : poser la règle d'abord ; l'écart actuel est révélé par le test, puis corrigé.

## Questions à trancher

Aucune.
