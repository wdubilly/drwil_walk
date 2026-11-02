# Intention : dire la limite de vitesse dans la scène du casque

**Statut** : proposée le 2026-10-31, issue du chantier `vitesse-limite-dite` (limite non traitée).
**Reviewed on 2026-11-02**: devenue sans objet, le chantier `limites-vitesse-distance` a supprimé le plafond de 8 km/h ; seul reste le minimum de 1 km/h, que le panneau de la page dit déjà. À supprimer au prochain tri.

## Besoin

Le chantier a dit la limite de 1 à 8 km/h à l'accueil et dans le panneau de marche de la page (qui signale une vitesse
à la borne). Le panneau flottant dans la scène du casque et un message au moment précis où le joystick tente de dépasser
la borne ne sont pas faits : leurs fichiers (`app/src/xr/`) étaient hors du périmètre de la fiche, et la notion de
« tentative » n'existe pas dans l'état de marche (`app/src/xr/frame.ts`).

## Existant

Le panneau de la page est vu à travers le navigateur, pas dans la scène ; le panneau flottant dépend de
`docs/projects/journal.md` et de `docs/intentions/hud-casque.md`.

## Questions à trancher

- Après `commandes-panneau` : annoncer dans la scène que le joystick est à la borne (par exemple 8 km/h), sans bascule silencieuse (`QUA-002`, aucune erreur avalée en silence).
