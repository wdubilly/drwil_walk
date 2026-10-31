# Intention : juger le rendu OpenStreetMap enrichi sur un vrai Quest 3

**Statut** : proposée le 2026-10-31 (reste du chantier osm-enrichi, lot 5, réservé à l'humain).

## Besoin

Juger au casque ce que l'e2e émulé ne voit pas : le rendu enrichi (bâtiments teintés, ombrage vers le pied, arbres, bancs) est-il moins
« moche, mono-couleur, formes plates » qu'avant, et tient-il 72 images par seconde sur le Quest 3 ?

## Existant

Lu le 2026-10-31 : bâtiments teintés par leurs balises OpenStreetMap ou un ton de palette, ombrage par sommet (murs à 55 % de lumière au pied), arbres
instanciés (300 au plus, `app/src/city/props.ts`), mobilier fusionné (400 au plus), le tout effacé par le fondu de sécurité (tests et e2e émulé).
Jamais vu au casque ; les teintes des arbres, bancs et matériaux, la proportion d'ombrage et les plafonds sont des choix de l'agent.

## Questions à trancher

- [decision] Le rendu est-il assez riche, ou faut-il d'autres éléments (relief : `osm-enrichi.md`) ?
- [decision] Les 72 images par seconde sont-elles tenues sur la Corniche et la Vieille ville de Pune (les plus denses) ? Sinon, quels plafonds baisser ?
- [decision] Le fondu de sécurité efface-t-il bien arbres et mobilier au casque, tête baissée (APP-001) ?
- [decision] L'essai se joint-il à `essai-fournisseurs-ouverts.md` et `essai-casque-itineraire-libre.md` ?
