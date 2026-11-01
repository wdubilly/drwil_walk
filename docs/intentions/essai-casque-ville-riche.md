# Intention : juger le rendu de la ville riche sur un vrai Quest 3

**Statut** : proposée le 2026-11-01 (reste du chantier rendu-ville-riche, lot 7, réservé à l'humain).

## Besoin

Juger au casque ce que l'e2e émulé ne voit pas : sol et route (trottoirs, passages piétons, chemin suivi), verdure au sol, toits à deux pans,
auvents et noms de rues rendent-ils la ville plus vivante, sans gêner la vue de l'environnement réel, et à 72 images par seconde ?

## Existant

Lu le 2026-11-01 : tout est dessiné par `app/src/city/` (`app/src/city/walkways.ts`, `app/src/city/vegetation.ts`, `app/src/city/roofs.ts`, `app/src/city/street-names.ts`) avec des plafonds
(400 rues à trottoirs, 120 passages, 150 surfaces, 200 haies, 300 toits, 80 auvents, 8 plaques) et s'efface avec la ville (tests et e2e émulé).
Jamais vu au casque ; les couleurs, la taille et la pose à plat des plaques sont des choix de l'agent.

## Questions à trancher

- [decision] Les plaques de rue, posées à plat, se lisent-elles en marchant (grand angle rasant) ? Faut-il les dresser ou les agrandir ?
- [decision] Les polices du navigateur du Quest affichent-elles le devanagari et l'arabe des plaques ?
- [decision] Les 72 images par seconde sont-elles tenues sur la Corniche et la Vieille ville de Pune ? Sinon, quels plafonds baisser ?
- [decision] Le chemin suivi (jaune bordé de sombre) se distingue-t-il assez des trottoirs, et la ville riche s'efface-t-elle bien tête baissée (APP-001) ?
