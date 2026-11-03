# Chantier : une teinte de façades par région

**Statut** : cadré le 2026-11-03.
**Risque** : HIGH
**Maturité** : prêt
**Intention** : `docs/intentions/villes-a-parcourir.md`

<!-- scope
files:
  - app/src/city/*
  - app/src/city/*.test.ts
  - app/e2e/*
  - .drwil/ia-first.json
  - docs/contracts.md
  - docs/architecture.md
  - docs/features.md
  - docs/intentions/*
-->

## 1. Besoin

`app/src/city/facade-family.ts` ne connaît que deux régions : `provence` et `ailleurs`. Toute ville hors de Provence reçoit
les mêmes familles et les mêmes palettes. Rome, Erevan et Paris s'afficheraient donc exactement comme Pune et Doha : le
travertin et les ocres romains, le tuf rose d'Erevan, la pierre de taille et le zinc parisiens seraient indiscernables.

Le demandeur a tranché le 2026-11-03 : **une famille par région**, avant d'ajouter la moindre ville.

## Approche

Le mécanisme existant suffit : il n'y a pas besoin d'une famille de plus par ville. Les familles (`ancien`, `village`,
`recent`, `provencale`) décrivent des **types de bâtiment** et restent valables partout ; c'est la **palette** qui porte la
couleur locale. Une région choisit donc son jeu de palettes, et `familyFor` reste inchangé dans sa logique.

C'est aussi ce qui limite le risque : aucun changement de structure, seulement des teintes.

## Critères d'acceptation

- Une région se déduit des coordonnées de l'itinéraire, au-delà de la seule Provence — `APP-008`
- Chaque région porte son jeu de palettes ; deux villes de régions différentes ne se ressemblent pas — `APP-008`
- Une ville d'une région inconnue retombe sur les palettes actuelles, sans rien casser — `APP-008`
- Les quatre itinéraires livrés (Pune, Doha) gardent une ville cohérente : si leur région reçoit ses propres teintes, le
  changement est **voulu, montré et documenté**, jamais subi
- Les bâtiments voisins continuent de partager famille et palette (le quartier reste lisible) — `APP-008`
- Le coût reste nul : les palettes ne sont que des couleurs de sommets, aucun triangle ni appel de rendu en plus
- Les teintes jugées sur un vrai Quest 3 [human] — `APP-001`

## Contrats modifiés

- `APP-008` (façades procédurales) : complété par le choix des palettes selon la région.

## 2. Hors périmètre

- Ajouter des villes : c'est la suite (`docs/intentions/villes-a-parcourir.md`).
- Les textures de façade et les monuments (`docs/intentions/facades-textures-monuments.md`).
- La géométrie des façades, livrée par `APP-008`.

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé.
- **Les quatre villes existantes sont déjà livrées** : toute évolution de leurs teintes doit être montrée et assumée, pas
  découverte après coup.
- Les régions se déduisent de fenêtres de latitude et de longitude, comme la Provence aujourd'hui : simple, testable, sans
  donnée extérieure ni réseau.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`) — `app/src/city/facade-family.ts` est
  déjà dense, les palettes ont vocation à sortir dans leur propre module.

## 4. Décisions

- 2026-11-03 : **une famille par région**, avant les villes.
- 2026-11-03 : la région porte les **palettes**, pas une famille de plus : les familles décrivent des types de bâtiment et
  restent valables partout.

## 5. Points à trancher

*(aucun)*

## 6. Lots

- **Lot 1 — les régions** [AI] : `Region` élargie, détection par fenêtre de coordonnées, repli sur les palettes actuelles.
  Sortie : tests verts.
- **Lot 2 — les palettes** [AI] : un jeu par région (Italie, Caucase, France du Nord, Inde, Golfe), sorties dans leur
  module. Sortie : tests verts.
- **Lot 3 — e2e et doc** [AI] : les quatre villes rejouées, `APP-008` complété, documentation à jour. Sortie : CI verte.
- **Lot 4 — jugement au casque** [human] : crédibilité des teintes par ville. Reporté à la séance groupée
  (`docs/intentions/seance-casque-parcours.md`).

## 7. Reprise

- **Dernier état** (2026-11-03) : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : lot 1, les régions.
