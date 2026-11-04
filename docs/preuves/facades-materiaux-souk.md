# Preuve de clôture — facades-materiaux-souk

**Clos le** : 2026-11-04
**Commit vérifié** : `c8971069ea` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| L'inventaire Panoramax du souk (photos à moins de 30 m du tracé : identifiant, position, cap, date, auteur, licence, URL) est publié dans la preuve du chantier, couverture réelle dite ; repli sur Mapillary si Panoramax ne suffit pas, sans jeton dans le dépôt | `SEC-007` | `secrets` | — |
| Les couleurs dominantes des façades sont tirées des photos par un script de préparation (hors casque) | `APP-012` | `app-012` | — |
| La bibliothèque de matériaux du souk (enduit, pierre, bois…) est faite de textures PBR **CC0** recolorées d'après ces couleurs, embarquées avec leur provenance (app/assets/PROVENANCE.md) ; aucun appel réseau pendant la marche | `APP-012` | `app-012` | — |
| Le rendu « matériaux locaux » se choisit à l'accueil pour le souk seulement ; les autres itinéraires et le rendu par défaut restent inchangés | `APP-012` | `app-012` | — |
| Le code est **générique** : scripts et rendu prennent l'itinéraire en paramètre, la bibliothèque de matériaux est une donnée par quartier ; étendre à un autre quartier = ses données et son activation, sans code propre au souk | `APP-012` | `app-012` | — |
| Les matériaux varient de façon déterministe (teinte, échelle, usure) pour éviter la répétition entre voisins, sur les familles de façades existantes | `APP-008` | `app-008` | — |
| Tête baissée, la ville texturée s'efface comme le reste (opacité 0 %) [humain] | `APP-001` | `app-001` | — |
| Textures compressées pour le Quest 3, dans un budget mesuré par le diagnostic de rendu ; le profil « performance » les retire | `APP-006` | `app-006` | — |
| Les couleurs relues par le demandeur et le rendu jugé sur un vrai Quest 3 avant généralisation [humain] | `APP-001` | `app-001` | — |
