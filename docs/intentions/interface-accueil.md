# Intention : un écran d'accueil lisible dans le casque, avec le choix d'itinéraire

**Statut** : proposée le 2026-10-30, après un premier regard du demandeur sur l'accueil.

## Besoin

L'accueil s'affiche en HTML brut (police par défaut, champs alignés sur une seule ligne) : peu lisible dans le
navigateur du Quest 3. Il manque aussi le choix d'itinéraire prévu par `MISSION.md` (Pune Vieille ville par défaut,
Pune FC Road, Doha Corniche, Doha Souq Waqif).

## Existant

Lu le 2026-10-30 : `app/src/ui/home.ts` affiche le rappel de sécurité, la vitesse de départ (4,0), le curseur
d'opacité et le bouton « Entrer en réalité mixte » ; aucune feuille de style, aucun choix d'itinéraire. Sur un
navigateur sans WebXR, le message « La réalité mixte (immersive-ar) n'est pas prise en charge » s'affiche.

## Questions à trancher

- [decision] Style : grands boutons et textes adaptés au casque, thème sombre ou clair ?
- [decision] Choix d'itinéraire : liste simple ou cartes avec une image par balade ?
- [decision] Contraste : adopter `catalog:QUA-014` (contraste RGAA / WCAG AA) en même temps ?
