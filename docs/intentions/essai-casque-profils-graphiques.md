# Intention : juger les trois profils graphiques sur un vrai Quest 3 (lot 4 de rendu-profils-graphiques)

**Statut** : proposée le 2026-11-03.

## Besoin

Mesurer sur un vrai Quest 3 les images par seconde de chacun des trois profils (performance, équilibré, qualité), avec le diagnostic de rendu
(`docs/intentions/essai-casque-diagnostic-rendu.md`), vérifier que le tapis reste visible quel que soit le profil (`APP-001`), puis décider des
valeurs figées (plafonds d'arbres et de mobilier, ratio de pixels, échelle d'image) et du profil proposé au casque.

## Existant

Lu le 2026-11-03 : les profils, la détection et le choix à l'accueil sont livrés et prouvés par des tests (`APP-006`) et par l'e2e dans un Quest 3 émulé
(`app/e2e/profils-graphiques.test.ts`) ; aucune image par seconde n'a été mesurée au casque. Les valeurs de chaque profil sont des choix techniques de
l'agent : « performance » 100 arbres, 120 éléments de mobilier, échelle 0,8, sans ville riche ni contours ; « équilibré » le rendu d'avant les profils ;
« qualité » avec les contours et l'échelle 1,2. « Qualité » est proposé partout, sans refus fondé sur les mesures (décision du demandeur, 2026-11-03).

## Questions à trancher

- [decision] Quelles images par seconde donne chaque profil au casque, et lequel faut-il proposer par défaut au casque ?
- [decision] Les écarts entre profils se voient-ils (arbres, mobilier, verdure, noms des rues, contours, netteté) ? Sinon, les élargir.
- Le réel reste-t-il visible, tête baissée, avec chacun des trois profils (`APP-001`) ?
