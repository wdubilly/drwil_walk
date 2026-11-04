# Pending work — index

One line per topic. Detail and **status** live in the linked brief, the only
source: this index copies no state. A topic without a link fits in two
lines here. Unscoped ideas: `docs/intentions/README.md`. Writing rules:
`docs/ia-first.md`, section 7.

Mandatory marker on every open item (QUA-015): `[AI]` doable by an agent in
the repo; `[human]` a gesture outside the repo (server, vault, approval,
infrastructure); `[decision]` to be settled by the requester before any
work. An agent does not attempt a `[human]` gesture and does not decide a
`[decision]`: it raises it. Small tasks that don't justify a project:
`docs/projects/routine-maintenance.md`.

Optional priority, not checked by check-docs.mjs (plain convention): `[P0]`
most urgent, `[P1]` high, `[P2]` normal, `[P3]` least urgent. Without a tag,
a topic is considered `[P2]`.

A project whose brief is **entirely** finished (not just one point among
others) is condensed into `docs/projects/journal.md` then removed from
this index, not checked: see
`docs/recipes/working-with-branches.md`, "Closing" section. Remaining
checked lines are already-done points of a brief that stays open
otherwise.

## Projects

Ordre de lancement : par priorité (`[P0]` d'abord), puis par ordre alphabétique du chemin à priorité égale (limite de l'outil
de sondage : quatre niveaux). Les dépendances sont respectées : `ambiance-cartoon` avant `rendu-ville-riche`, `panneau-discret`
avant les fiches qui touchent le panneau d'infos, `champ-de-vision-casque` puis `panneau-heure-hors-vue` avant elles aussi
(le panneau doit tenir dans la vue avant d'y ajouter du contenu), `tableau-allure-progression` et `hud-defis-progression` avant
`hud-suivi-comparer-marche-reelle`, les fiches de la ville avant `course-reelle-gpx`. `extraction-generique` puis `facades-regions` avant `villes-itineraires` (décision du 2026-11-03 : une famille de façades par région, et une seule extraction paramétrée, avant d'ajouter Rome, Erevan ou Paris). `creation-itineraire` en tête des P2, puis `lampadaires-generes`, puis `villes-itineraires` (décision du 2026-11-04 : la commande unique existe avant toute nouvelle extraction ; les trois villes sont créées avec elle). `facades-materiaux-souk` avant `facades-regions` (décision du 2026-11-03 : les palettes par région pourront reprendre les couleurs relevées sur les photos). Les fiches hud passent en dernier (décision du 2026-11-03) ; `hud-suivi-comparer-marche-reelle` porte le préfixe hud pour passer après `hud-defis-progression`. La Corniche est reportée le 2026-11-01 : à annuler si `course-reelle-gpx` couvre le besoin.

- [ ] [P2] [AI] Trois itinéraires de plus (Rome, Erevan, Paris) — `docs/projects/villes-itineraires.md`
- [ ] [P2] [AI] Fusion des bâtiments par cellules (en attente d'une séance au casque : `docs/intentions/seance-casque-parcours.md`) — `docs/projects/rendu-lod-cellules.md`
- [ ] [P3] [AI] Les défis de distance et l'objectif annuel — `docs/projects/hud-defis-progression.md`
- [ ] [P3] [AI] Le voyage guidé par étapes — `docs/projects/hud-voyage-guide.md`
- [ ] [P3] [AI] Comparer la marche virtuelle à la vraie marche — `docs/projects/hud-suivi-comparer-marche-reelle.md`
- [ ] [P3] [AI] La Corniche de Doha jusqu'à West Bay, départ au musée (reportée, à annuler si le GPX suffit) — `docs/projects/corniche-west-bay.md`
- [ ] [P3] [AI] Rejouer une vraie course : GPX ou points intermédiaires, longue distance — `docs/projects/course-reelle-gpx.md`

<!-- Example:
- [ ] [AI] short title of the topic, link to a brief if more than two lines
  are needed, otherwise the topic fits here.
- [x] topic delivered (YYYY-MM-DD).
-->
