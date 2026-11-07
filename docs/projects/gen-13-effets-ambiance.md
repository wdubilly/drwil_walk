# Chantier : effets d'ambiance — météo, reflets, grosses ombres

**Statut** : cadré le 2026-11-07.
**Risque** : HIGH
**Maturité** : à préciser
**Intention** : `docs/intentions/recette-visuelle-promenade.md` (rang 7, dernier ; fiche d'ensemble `docs/intentions/generateur-ville-complet.md`)

<!-- scope
files:
  - app/src/render/daylight.ts
  - app/src/render/daylight.test.ts
  - app/src/render/fog.ts
  - app/src/render/fog.test.ts
  - app/src/render/profiles.ts
  - app/src/render/profiles.test.ts
  - app/src/xr/ambience.ts
  - app/src/xr/ambience.test.ts
  - app/src/safety/visibility.ts
  - app/src/safety/visibility.test.ts
  - app/e2e/eclairage-ambiance.test.ts
  - docs/architecture.md
  - docs/features.md
-->

## 1. Besoin

Voulus par le demandeur le 2026-11-07, **en dernier**, une fois la rue composée : météo (pluie, surfaces mouillées), reflets et
grosses ombres. Coûteux et moins décisifs qu'une rue bien composée, ils ne passent que sous `APP-001` (le réel visible reste
lisible ; l'effet est **réduit ou désactivable**) et le budget mesuré au casque.

**Existant** (vérifié le 2026-11-07) : `app/src/render/daylight.ts` (lumière de l'heure réelle), `app/src/render/fog.ts` (voile plafonné à 0,15,
désactivable), `app/src/render/profiles.ts` (trois qualités), `app/src/xr/ambience.ts` ; ombrage vers le pied et matériaux toon ; **aucune ombre
portée, aucun reflet, aucune pluie** (`docs/intentions/rendu-eclairage-ambiance.md`). Les valeurs actuelles (voile 0,15, gain 0,2)
n'ont jamais été jugées au casque (`docs/intentions/essai-casque-eclairage-ambiance.md`).

## Critères d'acceptation

- Chaque effet (pluie, reflet, ombre portée) est facultatif, coupé ou réduit selon le profil graphique, sans toucher à la
  sécurité — `APP-006`
- Aucun effet ne cache le tapis, la zone de marche ni le réel visible : le voile reste sous son plafond et les surfaces
  mouillées et reflets restent lisibles — `APP-001`
- La météo et la lumière ne cachent jamais le réel et restent désactivables à l'accueil, sans commande pendant la
  marche — `APP-011`
- En cas de conflit entre l'effet et la sécurité, la sécurité l'emporte : l'effet est réduit ou désactivé — `APP-001`
- Les mêmes effets, réglés de même, sur Quest, PC et tablette — `APP-015`
- Les effets tiennent le budget mesuré au casque (images par seconde, appels, triangles relevés avant et après) [human] — `APP-006`
- Les effets sont jugés agréables et sans gêne, mêlés au passthrough [human] — `APP-011`

## Contrats modifiés

*(aucun)*

## 2. Hors périmètre

- Relief, ombrage léger et niveaux de détail : `docs/projects/rendu-lod-cellules.md` (cité, non dupliqué).
- Composition de la rue, repères, eau, figurants : `docs/projects/gen-09-reperes-monuments.md`, `gen-10-eau-paysage.md`,
  `gen-11-vie-pietons-sons.md`.
- Sons enregistrés (fiche gen-11) ; météo réelle prise d'un service réseau (la v0.1 n'émet aucune requête hors de la page).

## 3. Contraintes

- Tout chantier touchant `app/` est HIGH ; `APP-001` reste un critère testé : un test échoue si un effet couvre le champ
  proche.
- Un fichier de code reste sous 200 lignes (`QUA-001`), couverture à 100 % (`QUA-004`).
- Tout est donnée par ville ou région (p. ex. pluie possible ou non), jamais du code propre à une ville ; un seul moteur ;
  mêmes contenus sur Quest, PC et tablette (`APP-015`).
- Pas de plafond chiffré imposé d'avance : mesure au casque avant et après chaque effet (`docs/intentions/rendu-mesures-diagnostic.md`).
- Repli : sans donnée ni profil adapté, l'effet est coupé, la ville reste celle d'avant.

## 4. Décisions

- 2026-11-07 : météo, reflets et grosses ombres sont voulus, au dernier rang, sous `APP-001` et le budget mesuré.
- 2026-11-07 : en cas de conflit, la sécurité l'emporte ; l'effet est réduit ou désactivable.
- 2026-11-03 : voile plafonné à 0,15, aucun ciel posé (`APP-011`).

## 5. Points à décider

- [decision] Quels effets d'abord, et lesquels abandonner si le budget mesuré ne tient pas.
- [decision] Météo : choisie à l'accueil, tirée au hasard ou fixée par ville ; profils qui l'autorisent.
- [decision] Ombres : portées par quels objets, à quelle distance, sans dépasser les mesures.
- [human] Juger les valeurs actuelles de lumière, voile et son avant d'en ajouter
  (`docs/intentions/essai-casque-eclairage-ambiance.md`).

## 6. Incréments

1. **Mesures de départ et jugement de l'existant** [human] : cadence, lumière, voile. Sortie : relevés notés.
2. **Un effet derrière un réglage de profil** [AI] : désactivable, réduit par profil. Sortie : tests verts, `APP-006`.
3. **Garde-fou de visibilité** [AI] : l'effet s'efface devant le réel. Sortie : tests verts, `APP-001`.
4. **Effets suivants** [AI] : un par un, mesurés. Sortie : tests verts, e2e.
5. **Jugement au casque** [human] : confort et cadence. Sortie : verdict noté.

## 7. Reprise

- **Dernier état (2026-11-07)** : cadrage seul, aucun code.
- **Travail non commité** : la fiche.
- **Prochaine étape** : [human] trancher la section 5 ; ce chantier vient après gen-09 à gen-12.
