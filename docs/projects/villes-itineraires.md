# Chantier : trois itinéraires de plus (Rome, Erevan, Paris)

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/villes-a-parcourir.md`

<!-- scope
files:
  - app/scripts/*.ts
  - app/scripts/*.test.ts
  - app/package.json
  - app/data/*.json
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/src/ui/*
  - app/e2e/*
  - docs/architecture.md
  - docs/features.md
  - docs/guide-utilisateur.md
  - docs/intentions/*
-->

## 1. Besoin

Quatre itinéraires répartis sur deux villes finissent par se connaître par cœur. Le demandeur veut marcher ailleurs :
Rome, Erevan et Paris, dans leurs centres touristiques.

## Critères d'acceptation

- Trois itinéraires de plus sont proposés à l'accueil : Rome centro storico, Erevan centre, Paris le Marais
- Chaque ville a son extrait et son tracé de boucle, produits par l'extraction paramétrée, sans code nouveau — `APP-003`
- Chaque point d'un tracé de boucle est un sommet d'une voie de son extrait (test existant, étendu aux trois villes)
- Chaque ville reçoit les teintes de sa région (Italie, Caucase, France du Nord), jamais les palettes génériques —
  `APP-008`
- Le poids total de `app/data/` et le temps de chargement sont relevés avant et après ; le plafond vérifié par les tests
  est tenu, ou relevé sciemment et documenté
- L'attribution OpenStreetMap couvre les trois nouvelles villes — `APP-003`
- Les quatre itinéraires existants sont inchangés
- Les trois villes parcourues sur un vrai Quest 3 [human] — `APP-001`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- La tour Eiffel et les tours en treillis : le Marais en est libre, et le défaut est noté à part
  (`docs/intentions/tours-treillis-extrudees.md`).
- Une ville de Provence (`docs/intentions/ville-provence.md`), un trajet libre ou un GPX
  (`docs/projects/course-reelle-gpx.md`).
- Toute évolution du rendu : ce chantier ajoute des données, pas des capacités.

## 3. Contraintes

- **Deux chantiers d'abord**, dans cet ordre : `docs/projects/journal.md` (une seule extraction paramétrée,
  sinon trois copies de plus du même script) puis `docs/projects/journal.md` (sinon ces trois villes s'affichent
  avec les façades de Pune et Doha).
- L'extraction demande un **accès réseau** à Overpass : hors marche, jamais depuis l'application.
- Overpass est un service public : espacer les requêtes, ne pas les relancer en boucle.
- Les quatre extraits actuels pèsent 2,9 Mo ; trois de plus approchent les 5 Mo. Le plafond de poids vérifié par les tests
  est le premier risque du chantier.
- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).

## 4. Décisions

- 2026-11-03 : trois villes, dans leurs **centres touristiques** — Rome (Piazza Navona et le Panthéon), Erevan (place de
  la République, rue Abovian, la Cascade), Paris (le Marais, place des Vosges).
- 2026-11-03 : **Paris reste un itinéraire comme les autres**. Le Champ de Mars est écarté : la tour Eiffel, balisée
  `building=tower` et `height=330`, serait extrudée en bloc plein de 330 m.
- 2026-11-03 : les deux chantiers préalables passent d'abord.
- 2026-11-04 : un troisième chantier passe avant, `docs/projects/creation-itineraire.md` : les trois villes sont créées avec
  la commande unique, et non avec un script de plus par ville.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — emprises et poids** [AI] : choisir les emprises des trois quartiers, mesurer le poids obtenu, comparer au
  plafond. Sortie : trois emprises et un relevé chiffré ; si le plafond saute, s'arrêter et le dire.
- **Lot 2 — extraction** [AI] : les trois villes extraites par l'extraction paramétrée, leurs tracés de boucle tracés sur
  les voies. Sortie : six fichiers, tests verts.
- **Lot 3 — accueil, e2e et doc** [AI] : les trois itinéraires proposés à l'accueil, attribution, e2e, documentation.
  Sortie : CI verte.
- **Lot 4 — jugement au casque** [human] : marcher les trois villes, juger les teintes et la densité. Reporté à la séance
  groupée (`docs/intentions/seance-casque-parcours.md`).

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucune extraction lancée.
- **Travail non commité** : la fiche.
- **Prochaine étape** : les deux chantiers préalables, puis le lot 1.
