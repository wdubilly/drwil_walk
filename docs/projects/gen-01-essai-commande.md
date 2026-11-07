# Chantier : essai réel de `npm run city` contre les vrais services

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (rang 1, socle ; fiche d'ensemble `docs/intentions/generateur-ville-complet.md`)

<!-- scope
files:
  - app/scripts/create-city.ts
  - app/scripts/city-args.ts
  - app/scripts/photo-search.ts
  - app/scripts/extract-souq.ts
  - app/scripts/panoramax.ts
  - app/src/city/create-city.test.ts
  - app/src/city/city-args.test.ts
  - app/src/city/city-photos.test.ts
  - app/data/villes.json
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

La commande `npm run city -- <identifiant>` n'a tourné que sur des réponses simulées : jamais contre Overpass, Panoramax,
Mapillary ni ambientCG (`docs/intentions/essai-commande-creation-reseau.md`). La recette visuelle suppose qu'une ville
nouvelle se crée **sans modifier de code** ; il faut le prouver une fois pour de bon, et relever ce que le réel coûte.

Existant (lu le 2026-11-07) : la commande, ses arguments et la recherche de photos existent (`app/scripts/create-city.ts`,
`app/scripts/city-args.ts`, `app/scripts/photo-search.ts`) avec des tests sur doubles ; l'inscription à l'accueil est automatique. Manque : tout
relevé réel (durée, poids écrit, échecs, limite de 1 000 résultats Panoramax en quartier dense, délais d'Overpass).

## Critères d'acceptation

- Une ville nouvelle, ajoutée dans `app/data/villes.json` puis créée par la seule commande, s'inscrit à l'accueil sans
  qu'aucun fichier de code ne change (`git diff` limité aux données) — `APP-003`
- La ville créée porte l'attribution OpenStreetMap et sa région est déduite sans code propre à la ville — `APP-003`
- Les photos et couleurs locales produites restent bornées et embarquées — `APP-012`
- La ville créée se parcourt sur la boucle produite — `APP-002`
- La ville créée s'efface tête baissée comme les autres — `APP-001`
- Le rapport d'essai relève la durée, le poids écrit et les échecs ; une donnée manquante ou un service en échec laisse la
  commande dans un état net (message clair, rien d'à moitié écrit)
- Le rendu de la ville créée vu au casque, sans jugement de beauté [human] — `APP-001`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Valhalla et Photon (parcours libre retiré le 2026-11-05) : `docs/intentions/auto-heberger-valhalla-photon.md` et
  `docs/intentions/essai-fournisseurs-ouverts.md` n'autorisent aucun essai réseau ; elles ne sont pas relancées ici.
- La recette de région, les sols, les rez-de-chaussée (fiches `gen-02` à `gen-04`).
- La génération dans l'appli (intention à part).

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé quand le rendu change.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Tout est donnée par ville ou par région, jamais code propre à une ville ; un seul moteur ; mêmes contenus sur Quest, PC et
  tablette (`APP-015`).
- Chaque élément porte son origine (relevé OSM ou photo, ou ajouté par règle) ; budget **mesuré**, sans plafond chiffré.
- Repli quand une donnée manque (photos absentes : palette de repli de la région, acceptée le 2026-11-05).
- Secrets : le jeton Mapillary ne s'écrit jamais dans le code, un journal ou une sortie.

## 4. Décisions

- 2026-11-05 : une ville est complète avec la palette de repli quand les photos manquent.
- 2026-11-05 : la génération reste la commande sur le PC de développement.
- 2026-11-07 : le jalon est la création d'une ville nouvelle sans retouche de code (`docs/intentions/recette-visuelle-promenade.md`).

- 2026-11-07 : la ville d'essai est **Rome centro storico** (ville nouvelle).
- 2026-11-07 : les boucles rejouées **remplacent** les boucles versionnées (décision du 2026-11-05 confirmée).

## 5. Points à décider

- [decision] Génère-t-on les bibliothèques de matériaux des trois autres quartiers pour juger leurs couleurs au casque ?

## 6. Incréments

- **Incrément 1 — préparer l'essai** [human] : fournir le jeton Mapillary (variable d'environnement, jamais commité),
  vérifier l'accès réseau, choisir la ville. Sortie : jeton et ville confirmés par le demandeur.
- **Incrément 2 — lancer la commande et relever** [human] : durée, poids des fichiers écrits, échecs, couverture photo
  réelle. Sortie : rapport daté dans la fiche (journal), sans secret.
- **Incrément 3 — corriger ce que le réel révèle** [AI] : limites de résultats, délais, vignettes, repli sur échec, avec
  test sur double pour chaque cas. Sortie : tests verts, `npx drwil verify --agent` en `GOVERNANCE: PASS`.
- **Incrément 4 — constat et doc** [AI] : `git diff` ne montre que des données ; `docs/architecture.md` et
  `docs/features.md` à jour. Sortie : `node .githooks/check-docs.mjs` sans erreur.

## 7. Reprise

- **Dernier état** (2026-11-07): cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [decision] trancher les trois points, puis [human] fournir le jeton et lancer l'essai.
