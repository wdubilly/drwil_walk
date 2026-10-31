# Chantier : des fournisseurs ouverts à la place de Google

**Statut** : cadré le 2026-10-31.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/fournisseurs-ouverts.md`

<!-- scope
files:
  - app/src/route/*
  - app/src/route/geocoding.test.ts
  - app/src/route/routes-api.test.ts
  - app/src/city/*
  - app/src/city/google-tiles.test.ts
  - app/src/ui/*
  - app/src/xr/*
  - app/src/main.ts
  - app/src/main.test.ts
  - app/e2e/*
  - app/playwright.config.ts
  - .env.example
  - INSTALL.md
  - docs/guide-utilisateur.md
  - app/AGENTS.md
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/intentions/*
  - README.md
-->

## 1. Besoin

Le rendu Google 3D n'est pas disponible pour un compte de facturation de l'EEA (page officielle de Google). Le demandeur
veut que l'itinéraire libre marche **sans clé ni abonnement**, avec des fournisseurs OpenStreetMap, et garder Google 3D en
option pour qui n'est pas dans l'EEA.

## Critères d'acceptation

- Le routage piéton, la recherche d'adresse et le géocodage inverse passent par des interfaces ; Valhalla (routage) et
  Photon (adresses) sont les implémentations par défaut, sans aucune clé — `APP-002`
- Sans aucune clé, l'itinéraire libre marche de bout en bout : adresse ou carte, chemin à pied, marche, arrêt à l'arrivée — `QUA-020`
- L'adresse du service de routage et celle du service d'adresses se règlent par une variable non secrète, pour pointer vers
  une instance auto-hébergée — `APP-002`
- Si un service public est indisponible ou refuse la demande, la raison est dite à l'écran, et les quatre itinéraires
  figés restent utilisables — `QUA-002`
- Le rendu Google 3D reste choisissable avec une clé ; sur un refus 403 des tuiles, le message évoque la restriction de
  l'EEA — `QUA-002`
- L'attribution OpenStreetMap couvre les sources d'adresses et de routage utilisées — `APP-003`
- Le fondu de sécurité reste actif sur un trajet libre [humain] — `APP-001`

## 2. Hors périmètre

- Relais sur le serveur de développement pour les clés Google restantes : question ouverte de l'intention.
- Installer ou outiller un Valhalla ou un Photon auto-hébergé (script, conteneur) : question ouverte de l'intention.
- Enrichir le rendu OSM : `docs/projects/osm-enrichi.md`, chantier suivant.
- Retirer Google : décision du demandeur de le garder en option.

## 3. Contraintes

- Aucun appel à un service externe dans les tests : routage, adresses et tuiles factices (`QUA-020`).
- Usage raisonnable des instances publiques : une requête par validation d'adresse, aucune autocomplétion, identification
  de l'application, pas de rafale (conditions de Nominatim, de Photon et de Valhalla à relire au lancement).
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Aucun secret dans le dépôt : `.env.example` n'a que des valeurs fictives (`SEC-007`).

## 4. Décisions

- 2026-10-31, décisions humaines du demandeur : Valhalla public, auto-hébergeable derrière une interface ; Photon pour les
  adresses ; le rendu Google 3D reste en option ; l'OSM est le défaut pour tous.
- 2026-10-31, choix techniques de l'agent (pas des décisions de produit) : adresses publiques des instances et noms des
  variables fixés au lot 1 ; la recherche inverse (point vers adresse) est essayée avec Photon, avec repli sur les
  coordonnées arrondies comme aujourd'hui.
- Dépend de `google-3d-tiles` et d'`itineraire-libre`, livrés le 2026-10-31.
- Contrats concernés : `APP-001`, `APP-002`, `APP-003`, `QUA-002`, `QUA-004`, `QUA-020`, `SEC-007`.

## Contrats modifiés

- `APP-002` — le chemin du trajet libre est calculé par le service de routage choisi (Valhalla par défaut) au lieu de Google Routes ; rien d'autre ne change.
- `APP-003` — la ville et les adresses d'un trajet libre viennent d'OpenStreetMap par défaut ; Google reste une option.
- `QUA-020` — le chemin e2e du trajet libre tourne avec des fournisseurs ouverts factices.

## 5. Points à trancher

*(aucun : le relais de clés et l'auto-hébergement sont des questions d'intention, hors de ce chantier)*

## 6. Lots

- **Lot 1 — interfaces et fournisseurs ouverts** [AI] : interfaces de routage, d'adresses et de tuiles de ville ; Valhalla
  et Photon par défaut, factices en test. Sortie : tests verts, `run-checks` vert.
- **Lot 2 — Google en option** [AI] : les modules Google passent derrière les mêmes interfaces ; message 403 pour l'EEA.
  Sortie : tests verts.
- **Lot 3 — e2e et doc** [AI] : e2e sans clé, docs et guide sans clé obligatoire. Sortie : CI verte.
- **Lot 4 — essai réel** [human] : un trajet libre sur les instances publiques à Pune et à Doha ; profil piéton, justesse
  des adresses, usage raisonnable ; puis au casque.

## 7. Reprise

- **Dernier état** (2026-10-31) : cadrage seul, aucun code.
- **Travail non commité** : aucun.
- **Prochaine étape** : [AI] lot 1.
