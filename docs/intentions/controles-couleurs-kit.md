# Intention : installer les contrôles de couleurs et de contraste du kit

**Statut** : proposée le 2026-10-31, à l'adoption de `QUA-014` (contraste du texte et de son fond) par le chantier
accueil-casque.

## Besoin

`QUA-014` est prouvé par un test unitaire (`app/src/ui/contrast.test.ts`) qui lit les couleurs de
`app/src/ui/home.css`. Le kit propose deux contrôles dédiés, le contrôle des couleurs en dur du kit (aucune couleur en dur hors de la
charte) et le contrôle de contraste du kit (contraste de chaque combinaison de classes écrite), à copier dans `.githooks/` et à
déclarer dans `.drwil/ia-first.json`. Ils n'ont pas pu l'être : ces fichiers étaient hors du périmètre du chantier.

## Existant

Lu le 2026-10-31 : le test de contraste couvre les couples texte / fond déclarés à la main dans le test ; un nouveau
texte sur un nouveau fond doit y être ajouté, rien ne le signale sinon. Les modèles du kit sont dans
`node_modules/drwil/templates/common/optional/front-quality/` (leur README décrit l'activation) et supposent une
palette de type Tailwind, que ce projet n'a pas (variables CSS).

## Questions à trancher

- [decision] Garder le test seul, ou installer les deux contrôles du kit et les adapter aux variables CSS ?
- [decision] Si oui, déclarer un contrôle propre dans `.drwil/ia-first.json` et basculer la preuve de `QUA-014` dessus ?
