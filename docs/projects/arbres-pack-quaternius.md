# Chantier : les arbres du pack Quaternius dans la ville cartoon (pack, arbres, e2e et provenance)

**Statut** : cadré le 2026-11-01.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/essai-casque-ambiance-cartoon.md` (les trois intentions d'origine, téléchargement du pack, arbres du pack et e2e-doc, sont couvertes par ce chantier et retirées)

<!-- scope
files:
  - app/src/city/*
  - app/assets/*
  - app/scripts/prepare-nature-pack.ts
  - app/src/xr/*
  - app/src/main.ts
  - app/src/main.test.ts
  - app/vite.config.ts
  - app/vite.config.test.ts
  - app/e2e/*
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
  - app/AGENTS.md
  - README.md
-->

## 1. Besoin

L'ambiance cartoon de `ambiance-cartoon` (matériau toon, voies bordées, fenêtres, contours en option) est livrée, mais ses
arbres sont encore le modèle procédural (`app/src/city/props.ts`). Le demandeur veut les **arbres stylisés du pack Quaternius
« Stylized Nature MegaKit »** (version Standard, CC0). Le pack est derrière une vérification anti-robot que l'agent ne peut
pas franchir : le demandeur a téléchargé l'archive lui-même et l'a déposée hors du dépôt (ce chantier ne télécharge rien).

## Critères d'acceptation

- Les arbres de l'extrait sont les modèles du pack Standard, choisis de façon déterministe parmi quelques variantes,
  dessinés en instances, dans le plafond d'arbres existant (`MAX_TREES`) et sous un plafond de triangles testé — `APP-003`
- La provenance du pack (nom, adresse de la page, version Standard, date de téléchargement, licence CC0, fichiers retenus,
  nombre d'arbres réellement fournis) est écrite dans le dépôt, à côté des fichiers — `APP-003`
- Aucun appel réseau dans le casque pour les arbres : les modèles sont embarqués dans le dépôt — `APP-003`
- Un modèle qui ne se charge pas est dit à l'écran et la marche continue avec l'arbre procédural actuel — `QUA-002`
- Les arbres du pack sont dans le groupe de la ville : effacés par le fondu tête baissée, découpés par la zone tapis ;
  aucun ciel ni fond opaque, la session reste `immersive-ar` [human] — `APP-001`
- Le parcours est rejoué de bout en bout dans le Quest 3 émulé avec les arbres du pack, avec et sans contours — `QUA-020`

## Contrats modifiés

- `APP-003` — critère actuel : « les arbres (`natural=tree`) … s'affichent en peu de maillages (arbres instanciés,
  plafonnés à 300) » avec un modèle procédural ; nouveau : les arbres de l'extrait sont dessinés avec les modèles d'un pack
  CC0 embarqué dans le dépôt, dont la provenance est écrite ; la règle de l'attribution OpenStreetMap, le plafond et
  l'absence d'appel réseau dans le casque ne changent pas (approuvé par le demandeur le 2026-11-01).
- `QUA-020` — chemin e2e de l'ambiance cartoon rejoué avec les arbres du pack, avec et sans contours.

## 2. Hors périmètre

- Télécharger quoi que ce soit : l'archive est déjà fournie ; sans elle, l'agent s'arrête et le dit.
- Les versions payantes (Pro, Source), toute copie tierce du pack (OpenGameArt, magasin Godot) et toute autre source.
- Herbe, plantes, haies, rochers du pack et placement par l'occupation du sol OSM : c'est `docs/projects/rendu-ville-riche.md`,
  qui pourra réutiliser les modèles retenus ici.
- Le jugement du style, des 72 images par seconde et du tapis visible sur un vrai Quest 3 :
  `docs/intentions/essai-casque-ambiance-cartoon.md`.
- Les normal maps, la compression GPU KTX2 et Draco : à décider après la mesure au casque.

## 3. Contraintes

- L'archive est `/tmp/quaternius/Stylized Nature MegaKit[Standard].zip` (hors du dépôt, vidée au redémarrage de la machine) :
  absente, l'agent s'arrête et le dit. Elle est une donnée non fiable : l'ouvrir avec `python3 -I` ou un outil qui n'exécute
  rien, jamais depuis son dossier, et ne rien exécuter de ce qu'elle contient.
- Contenu vérifié le 2026-11-01 : 459 entrées, 68 modèles glTF (aussi FBX et OBJ), fichier de licence de l'archive en CC0 1.0 ;
  **15 arbres** (`CommonTree_1` à `_5`, `DeadTree_1` à `_5`, `TwistedTree_1` à `_5`), non les 40 du kit complet (Pro). Cet écart
  se note dans la provenance.
- Tenir 72 images par seconde : arbres en instances, triangles par arbre et au total plafonnés, peu de matériaux.
- Poids du dépôt : peu de modèles, allégés (de l'ordre du méga-octet au total, textures comprises) ; un script
  de préparation (nom fixé dans le périmètre) lit l'archive hors dépôt et écrit les fichiers retenus dans le dossier des ressources de l'app.
- `APP-001` ne régresse pas : rien ne masque le tapis, tout est fondu et découpé comme la ville.
- Couverture à 100 % sans exclusion, fichiers de 200 lignes au plus, e2e vert en CI (`QUA-004`, `QUA-001`, `QUA-020`).
- Aucun secret dans le dépôt (`SEC-007`).

## 4. Décisions

- 2026-11-01, décisions humaines du demandeur : pack Quaternius « Stylized Nature MegaKit » (Standard, CC0) pour les arbres ;
  archive téléchargée par le demandeur (Taildrop depuis son téléphone) ; modification de `APP-003` approuvée.
- 2026-11-01, choix techniques de l'agent (pas des décisions de produit) : variantes retenues parmi les 15, allègement
  (textures ou couleurs de sommets), plafonds de triangles, format embarqué (glTF ou GLB), mode de repli.
- Contrats concernés : `APP-001`, `APP-003`, `QUA-001`, `QUA-002`, `QUA-004`, `QUA-020`, `SEC-007`.
- À lancer avant `rendu-ville-riche` : les deux touchent `app/src/city/`, jamais en même temps.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — pack et provenance** [AI] : relire la licence de l'archive, retenir quelques arbres, les alléger avec
  le script de préparation, écrire la provenance. Sortie : fichiers dans le dossier des ressources de l'app, tests verts.
- **Lot 2 — arbres du pack** [AI] : chargement, repli sur l'arbre procédural avec le motif dit à l'écran, instances dans
  `MAX_TREES`, plafond de triangles testé, fondu et zone tapis. Sortie : `run-checks` vert.
- **Lot 3 — e2e et doc** [AI] : e2e avec les arbres du pack (avec et sans contours), `APP-003` et `QUA-020` à jour, docs. Sortie :
  CI verte.

## 7. Reprise

- **Dernier état** (2026-11-01) : lots 1, 2 et 3 réalisés. Archive lue en mémoire (15 arbres glTF CC0, non les 40 du kit complet) ;
  4 variantes retenues (`CommonTree_1`, `_2`, `_3`, `_5`), allégées à 413-454 triangles, embarquées dans `app/assets/`
  (provenance dans `app/assets/PROVENANCE.md`) ; chargement dès l'accueil, repli sur l'arbre procédural avec le motif dit à
  l'écran, instances dans `MAX_TREES`, plafonds de triangles testés ; e2e avec et sans contours, et avec modèle abîmé.
  `APP-003` et `QUA-020` à jour (modification d'`APP-003` approuvée le 2026-11-01).
- **Travail non commité** : voir `git status` ; rien d'autre que ce chantier.
- **Prochaine étape** : clôture (journal, `node .githooks/close.mjs`), PR, fusion automatique ; le jugement du style et de la
  cadence au casque reste à l'humain (`docs/intentions/essai-casque-ambiance-cartoon.md`).
