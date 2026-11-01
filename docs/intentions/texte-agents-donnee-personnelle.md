# Intention : ajuster le texte de AGENTS.md sur la donnée personnelle

**Statut** : proposée le 2026-11-01 (limite du chantier hud-tableau-de-bord).

## Besoin

`AGENTS.md` (ligne « Utilisateur ») dit « aucune donnée personnelle ». Depuis le tableau de bord de marche, le poids facultatif de
l'utilisateur est gardé dans le `localStorage` du navigateur du casque (jamais envoyé, effaçable à l'accueil) : c'est la seule
donnée personnelle du projet. La fiche du chantier demandait d'ajuster ce texte.

## Existant

Lu le 2026-11-01 : le `AGENTS.md` racine n'est pas dans le périmètre du chantier hud-tableau-de-bord (seul `app/AGENTS.md` l'est) ;
il n'a donc pas été modifié. `docs/features.md` parle encore d'« aucune donnée personnelle » à propos de la zone tapis (exact pour
elle).

## Questions à trancher

- [decision] Reformuler « aucune donnée personnelle » en « une seule donnée personnelle facultative, le poids, gardée dans le
  navigateur du casque » dans `AGENTS.md`, dans un chantier ou un détour qui l'autorise ?
