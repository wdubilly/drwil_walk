# Intention : des piétons à la marche animée

**Statut** : proposée le 2026-11-05, à la clôture du chantier `docs/projects/ville-vivante-souk.md`.

## Besoin

Les piétons de la ville vivante (`APP-014`) glissent. Leur pose est figée : c'est la première image de l'animation `idle`
du pack Kenney « Mini Characters ». La fiche le permettait (« les piétons glissent si leur marche animée sort des
budgets ») ; au casque, un passant qui glisse peut paraître faux. Le besoin est une marche animée, si les budgets la
tiennent.

## Existant

Lu le 2026-11-05.

- **Pack** : il contient des animations à squelette (dont une marche). Le script `app/scripts/prepare-traffic-pack.ts`
  ne garde que la pose, sans os.
- **Rendu** : un maillage instancié par modèle, soit un appel de rendu par modèle, mis à jour avant chaque image
  (`app/src/city/traffic.ts`).
- **Pistes** : un squelette par instance coûterait un appel par piéton. D'autres pistes restent à mesurer :
  - une texture d'animation lue par le shader ;
  - quelques poses figées alternées par instance.

## Questions à trancher

- [decision] Le glissement est-il gênant au casque (à juger d'abord, `docs/intentions/essai-casque-ville-vivante.md`) ?
- Quelle technique d'animation tient dans les budgets de 150 appels et 500 000 triangles, mesurée au casque ?
