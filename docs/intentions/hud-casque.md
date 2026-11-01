# Intention : le tableau de bord de marche dans le casque (maquette)

**Statut** : proposée le 2026-10-31, à partir d'une maquette du demandeur (image reçue le 2026-10-31, non versionnée). Découpée le 2026-10-31 en trois chantiers cadrés : `docs/projects/hud-tableau-de-bord.md`, `docs/projects/hud-voyage-guide.md`, `docs/projects/hud-defis-progression.md`. Reste dans cette intention : la barre de commandes, le mini-globe et le dénivelé.

## Besoin

Une interface de marche dans le casque, d'après la maquette : à gauche, un tableau de bord (vitesse, durée, distance,
calories, dénivelé) et un défi longue distance (« Vidauban → Paris », distance parcourue et restante) ; en haut, une
boussole, le lieu courant et la prochaine étape ; à droite, l'heure, un mini-globe avec le tracé et la liste des autres
défis (Paris → Moscou, tour du monde, objectif annuel de 1 000 km) ; en bas, une barre de commandes (Carte, Itinéraire,
« Voyage guidé », Paramètres, Pause).

## Existant

Lu le 2026-10-31 : seul le joystick droit règle la vitesse dans le casque ; le panneau de marche est sur la page web, pas
dans la scène (`app/src/ui/panel.ts`). `docs/projects/journal.md` (cadré) ajoute la pause, le recalibrage et un
panneau d'infos flottant dans la scène ; `docs/projects/journal.md` (cadré) protège le tapis. Il n'existe
aucune source d'élévation, aucune notion d'étape, de défi ni de progression conservée d'une séance à l'autre.

## Décisions déjà prises (2026-10-31)

- Calories : une estimation affichée « environ », avec le poids saisi une fois à l'accueil et gardé en local (valeur moyenne sans poids).
- Tableau de bord affiché par défaut, masqué par le bouton B.
- « Voyage guidé » : enchaîne des étapes, lieux nommés tirés d'OpenStreetMap.
- Défis et objectif annuel : une distance cumulée, progression locale, sans tracé ni mini-globe.
- Sécurité : tout le HUD suit le fondu tête baissée et reste hors de la zone tapis (`APP-001`).
- Dénivelé : absent tant qu'il n'existe pas de source d'élévation.

## Questions à trancher

- [decision] La barre de commandes de la maquette (Carte, Itinéraire, Paramètres, Pause), visée au pointeur de la manette :
  à cadrer après `hud-tableau-de-bord` et `carrefours-choix`, qui introduisent le pointage.
- [decision] Un mini-globe avec le tracé : écarté pour les défis (distance seule) ; le garder pour la carte de l'itinéraire ?
- [decision] Une source d'élévation, pour le dénivelé et le relief du sol (`docs/intentions/osm-enrichi.md`).
