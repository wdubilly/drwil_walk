# Intention : un itinéraire dans une ville de Provence (famille provençale des façades)

**Statut** : proposée le 2026-11-03.

## Besoin

Marcher dans une vraie ville de Provence : la famille de façades provençale (`APP-008`) n'est choisie que pour une ville de cette région et n'a, aujourd'hui,
aucune ville où s'exercer.

## Existant

Lu le 2026-11-03 : la famille provençale et la détection de la région (`regionOf` dans `app/src/city/facade-family.ts` : latitude 43 à 44,4, longitude 4,2 à 7,7)
sont livrées et testées sur des coordonnées de Provence ; les quatre itinéraires (Pune et Doha) n'en relèvent pas. Aucun extrait ni parcours de Provence n'existe.

## Questions à trancher

- [decision] Quelle ville et quel quartier de Provence (ou rue de départ) ?
- [decision] La fenêtre de latitude et de longitude de la Provence est-elle la bonne (elle englobe aussi, par exemple, des villes du Languedoc voisin) ?
- Faut-il aussi des familles pour d'autres régions (Inde, Golfe) plutôt que seulement « ancien » et « récent » ?
