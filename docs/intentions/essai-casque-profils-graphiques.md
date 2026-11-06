# Intention : juger les trois profils graphiques sur un vrai Quest 3 (lot 4 de rendu-profils-graphiques)

**Statut** : proposée le 2026-11-03.

## Besoin

Mesurer sur un vrai Quest 3 les images par seconde de chacun des trois profils (performance, équilibré, qualité), avec le diagnostic de rendu
(`docs/intentions/essai-casque-diagnostic-rendu.md`), vérifier que le tapis reste visible quel que soit le profil (`APP-001`), puis décider des
valeurs figées (plafonds d'arbres et de mobilier, ratio de pixels, échelle d'image).
Depuis le recentrage du 2026-11-05, mesurer aussi la mémoire et le délai de préparation des trois variantes simultanées :
les changements en marche ne reconstruisent aucune géométrie.

## Existant

Actualisé le 2026-11-05 : profils réglés en marche, mémoire validée et Équilibré au premier départ sur toutes les plateformes,
sans détection de capacités (APP-006). Variantes préparées dans `app/src/city/live-city.ts`, application à chaud dans
`app/src/xr/live-preferences.ts` ; échelle XR fixée à l'entrée, fovéation réglée à chaud.
Tests et e2e émulés (`app/e2e/profils-graphiques.test.ts`) ne prouvent ni cadence ni mémoire au vrai Quest 3.
Les plafonds restent techniques : 100 arbres/120 mobiliers en Performance, 300/400 ailleurs.

## Questions à trancher

- [human] Quelles images par seconde, mémoire et durée de préparation au casque pour chaque itinéraire et profil ?
  L'Équilibré initial est décidé ; un changement de cette règle exigerait un autre cadrage.
- [decision] Les écarts entre profils se voient-ils (arbres, mobilier, verdure, noms des rues, contours, netteté) ? Sinon, les élargir.
- Le réel reste-t-il visible, tête baissée, avec chacun des trois profils (`APP-001`) ?
