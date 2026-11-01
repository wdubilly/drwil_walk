# Intention : rejouer le parcours d'une vraie course chez soi

**Statut** : proposée le 2026-11-01, à partir d'un retour du demandeur ; cadrée en partie le 2026-11-01 par `docs/projects/course-reelle-gpx.md` (GPX, points intermédiaires, longue distance, ville par bandes) ; la comparaison avec la vraie marche est cadrée par `docs/projects/comparer-marche-reelle.md` ; restent à trancher la reprise de séance, l'allure ou le temps cible et le dénivelé.

## Besoin

Deux usages donnés par le demandeur :

- courir ou marcher chez soi sur le même parcours qu'une course réelle quand il pleut dehors ;
- s'entraîner sur le parcours virtuel d'une course pour savoir si on peut en tenir la distance, avant de s'y mesurer.

Exemple cité : une course de Vidauban à Sainte-Maxime, dont le parcours évolue sur la carte pendant la marche
(`docs/intentions/carte-position-en-direct.md`).

## Existant

Lu le 2026-11-01 (`docs/features.md`, `app/src/route/`, `docs/intentions/hud-casque.md`) :

- Le trajet libre pose un départ et une arrivée sur la carte, calcule le chemin à pied par Valhalla, puis charge les bâtiments
  OpenStreetMap proches ; aller simple, arrêt à l'arrivée. Il refuse un chemin de plus de 5 km (tests de
  `app/src/route/valhalla.test.ts` et `app/src/route/routes-api.test.ts`), alors qu'une course réelle fait souvent plusieurs fois cette
  distance.
- Aucun import de fichier de tracé (rien sur GPX dans `app/`) : un parcours réel ne peut pas être fourni tel quel.
- Aucune source d'élévation : le dénivelé d'une course n'est pas rejoué (`docs/intentions/hud-casque.md`).
- La progression d'une séance à l'autre n'est pas conservée, hors la distance cumulée prévue par
  `docs/projects/hud-defis-progression.md`.

## Questions à trancher

- [decision] Comment fournir le parcours : un tracé calculé par points intermédiaires entre départ et arrivée, ou l'import
  d'un fichier de tracé de la course (GPX) ?
- [decision] Relever la limite des 5 km pour une longue distance : à quelle limite, et avec quel coût pour la cadence, la
  mémoire et le chargement de la ville le long du tracé (par bandes) ?
- [decision] Une séance se reprend-elle là où elle s'est arrêtée (progression gardée en local), ou repart-elle du début ?
- [decision] Faut-il une allure cible ou un temps cible, pour juger si l'on tient la distance ?
- Le dénivelé n'est pas rejoué : acceptable pour s'entraîner, ou source d'élévation à prévoir ?
