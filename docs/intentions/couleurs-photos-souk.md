# Intention : relever les couleurs du souk sur des photos de rue (Mapillary) et les faire relire

**Statut** : proposée le 2026-11-04 (limite du chantier facades-materiaux-souk).

## Besoin

Remplacer les couleurs provisoires des matériaux locaux du souk par des couleurs tirées de vraies photos de rue, puis les
faire relire par le demandeur (`APP-012`).

## Existant

Lu le 2026-11-04 : Panoramax n'a aucune photo à moins de 30 m du tracé du souk (`docs/preuves/materiaux-souk.md`) ; le
script `npm run materials:inventory -- doha-souq-waqif` sait se replier sur Mapillary si la variable `MAPILLARY_TOKEN`
porte un jeton, jamais écrit dans le dépôt (`SEC-007`) ; `npm run materials:library -- doha-souq-waqif` tire alors les
couleurs dominantes des photos retenues. La bibliothèque embarquée dit aujourd'hui `colours.source = "provisoire"`.

## Questions à trancher

- [decision] Le demandeur fournit-il un jeton Mapillary (lancement local, hors dépôt), ou faut-il d'autres photos (prises sur place) ?
- [decision] Les couleurs relevées sont-elles fidèles au souk ? Lesquelles écarter (ombre, ciel, enseignes) ?
