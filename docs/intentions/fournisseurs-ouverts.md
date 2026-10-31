# Intention : des fournisseurs ouverts à la place de Google

**Statut** : proposée le 2026-10-31.

## Besoin

Les tuiles photoréalistes de Google ne sont pas disponibles pour les projets créés après le 8 juillet 2025 liés à un compte
de facturation de l'Espace économique européen (erreur 403, page officielle « Map Tiles API adjustments for EEA customers »).
Le demandeur facture en France : le rendu Google 3D lui est inaccessible. Il veut aussi des itinéraires et des adresses
**sans dépendance commerciale incontournable**, et sans clé exposée dans le navigateur.

## Existant

Lu le 2026-10-31 : trois modules parlent à Google (`app/src/route/geocoding.ts` Geocoding, `app/src/route/routes-api.ts`
Routes, `app/src/city/google-tiles.ts` Map Tiles et décodeur Draco de `gstatic.com`). Les tuiles de la carte
(`app/src/ui/map-math.ts`) et les bâtiments d'un trajet libre (Overpass, `app/src/city/free-route.ts`) viennent déjà
d'OpenStreetMap. Les clés `VITE_` sont insérées en clair dans le code envoyé au navigateur. Le rendu Google ne peut pas
être essayé tant qu'aucune clé n'existe.

## Décisions du demandeur (2026-10-31)

- Routage piéton : Valhalla, instance publique au départ, derrière une interface qui permet de pointer vers une instance
  auto-hébergée.
- Recherche d'adresse : Photon.
- Le rendu Google 3D reste livré, en option, pour qui n'est pas dans l'EEA ; l'OSM est le défaut pour tous.

## Pistes évaluées le 2026-10-31

- **Bing Maps for Enterprise** : écartée. Microsoft l'arrête : les comptes gratuits et de base ont cessé le 30 juin 2025,
  les comptes entreprise le 30 juin 2028, avec Azure Maps comme successeur (abonnement Azure, donc commercial).
- **ArcGIS Location Platform (Esri)** : formule gratuite mensuelle (par exemple 2 000 000 de tuiles de fond de carte, source
  Esri), sans plafond automatique : le service est coupé au-delà tant que le paiement à l'usage n'est pas activé.
  Non vérifié : disponibilité pour une facturation de l'EEA, routage piéton, conditions d'attribution et de stockage.
  Candidate éventuelle derrière l'interface, jamais le défaut.

## Questions à trancher

- [decision] Les clés Google restantes (rendu Google 3D hors EEA) : relais sur le serveur de développement pour ne pas les
  exposer dans le navigateur, ou accepter l'exposition avec plafond de budget ?
- [decision] Auto-héberger Valhalla et Photon : outiller (script, conteneur) ou seulement documenter ?
