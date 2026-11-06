# Intention : recentrer le produit sur le générateur d'itinéraire

**Statut** : réalisée sur la branche `chantier/recentrage-generateur` le 2026-11-06, livraison en cours.
La clôture et ses limites sont consignées dans l'entrée `recentrage-generateur` du journal des projets.

## Besoin

Exprimé par le demandeur le 2026-11-05 : ne garder que l'aspect **générateur complet d'itinéraire** (graphisme, ville, vie),
pour construire ensuite « à la volée » d'autres itinéraires. L'accueil a trop d'options techniques ; le parcours libre n'est
pas opportun ; Google 3D doit disparaître faute de licence.

## Décisions du demandeur (2026-11-05)

- **Google 3D** : on **supprime** le code, les tests et les contrats (pas de licence). Le rendu OpenStreetMap devient le seul.
- **Parcours libre** (recherche d'adresse, trajet libre) : **supprimé pour l'instant** ; il pourra revenir plus tard, par une
  autre intention.
- **Accueil** : ne restent visibles que l'**itinéraire** et la **vitesse**. Tout le reste quitte l'accueil.
- **Préférences en marche** (décision du 2026-11-05) : l'utilisateur règle ses préférences **pendant la marche** et elles sont
  **gardées d'une marche à l'autre** : le dernier choix devient le départ de la marche suivante. Exemples : pas de ville vivante
  (ni piétons ni circulation), qualité (Performance, Équilibré, Qualité), lampadaires, arbres, brouillard, sons, côté et
  opacité du panneau. Première marche :
  valeurs par défaut (qualité **Équilibré**, le poids `DEFAULT_WEIGHT_KG`, le reste selon la région). Sur Quest, PC et
  tablette. Pas de réglage avancé caché : juger un profil en développement n'est pas nécessaire.
- **Ordre** : ce recentrage passe **avant** la parité des plateformes et l'inscription des villes, car il change ce qu'elles
  doivent couvrir.

## Existant avant chantier (relevé du 2026-11-05)

- Google : fabrique de tuiles, mode de marche, choix d'accueil, dépendance et e2e désormais retirés.
- Parcours libre : carte/adresses, fournisseurs, préparation et e2e désormais retirés.
- Contrats touchés : `APP-002` (trajet libre), `APP-003` (OpenStreetMap chargé pour un trajet libre, mention Google),
  `APP-011` (ambiance), `APP-012` (option des matériaux locaux), `APP-006` (profil réglé à l'accueil).

## Risques

- Les profils graphiques (`APP-006`) et la sécurité-visibilité (`APP-001`) ne doivent pas bouger : retirer un choix d'accueil
  ne retire jamais la sécurité ; le profil par défaut reste prudent.
- Les e2e des chemins critiques (`docs/contracts.md`, ligne « chemins critiques ») citent Google et le parcours libre : ils
  sont à réécrire, pas à supprimer sans remplaçant.

## Précisions du demandeur (2026-11-05)

- **Préférences réglables en marche** : qualité, ville vivante, lampadaires, arbres, brouillard, sons, côté et opacité du
  panneau. Restent fixes : matériaux locaux, poids (valeur par défaut), vignette.
- **Ville vivante** : **une seule** préférence, qui couvre piétons et circulation (pas deux cases).
- **Application** : **toujours à chaud** ; toute préférence retenue s'applique sans reconstruire la ville.
- **Anciens réglages mémorisés** : ignorés ; on repart des valeurs par défaut, sauf le profil mis en mémoire.

## Questions à trancher

Aucune.
