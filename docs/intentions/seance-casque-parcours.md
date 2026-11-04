# Intention : un parcours unique à dérouler quand le testeur est disponible au casque

**Statut** : proposée le 2026-11-03.

## Besoin

Le testeur au casque est une ressource rare : il faut qu'il soit disponible. Aujourd'hui, ce qui l'attend est éparpillé
dans seize intentions séparées (`essai-casque-*`, `relecture-guide-casque`), chacune écrite à la fin de son chantier et
jamais relue ensemble. Le risque est double : arriver devant le testeur sans savoir quoi lui faire vérifier, et le faire
revenir trois fois pour des points qu'une seule séance aurait couverts.

Le besoin est donc un **parcours unique, ordonné, prêt à dérouler** : ce qu'on regarde, dans quel ordre, et ce qu'on en
rapporte. Il ne remplace aucune intention existante — chacune garde ses questions détaillées ; il dit seulement par quoi
commencer et ce qui peut se juger dans la même marche.

Ce parcours n'est pas un chantier : rien n'est à coder. C'est une liste de courses pour une séance.

## Existant

Lu le 2026-11-03. Seize intentions attendent un vrai Quest 3, soit une cinquantaine de questions marquées `[decision]` :

| Intention | Ce qui est attendu |
|---|---|
| `essai-casque-zone-tapis.md` | La zone tapis et la vignette réelle (`APP-001`) |
| `essai-casque-diagnostic-rendu.md` | Le diagnostic de rendu s'affiche et se lit |
| `diagnostic-casque-enregistrer.md` | Les mesures s'enregistrent depuis le casque |
| `essai-casque-profils-graphiques.md` | Les trois profils graphiques |
| `essai-casque-facades-batiments.md` | Les façades procédurales |
| `essai-casque-mobilier-urbain.md` | Le mobilier urbain et les marquages au sol |
| `essai-casque-eclairage-ambiance.md` | L'éclairage, le brouillard et les sons |
| `essai-casque-ville-riche.md` | Le rendu de la ville riche |
| `essai-casque-osm-enrichi.md` | Le rendu OpenStreetMap enrichi |
| `essai-casque-ambiance-cartoon.md` | L'ambiance cartoon |
| `essai-casque-tableau-de-bord.md` | Le tableau de bord de marche |
| `essai-casque-commandes-panneau.md` | Les commandes de la manette et le panneau d'infos |
| `essai-casque-carrefours.md` | Le choix de la rue aux carrefours |
| `essai-casque-itineraire-libre.md` | Un trajet libre, avec une vraie clé |
| `essai-casque-vitesse-haute.md` | La marche à haute vitesse et un très long trajet |
| `relecture-guide-casque.md` | Le guide d'utilisation relu au casque |

Une fiche de chantier est **bloquée** faute de ces mesures : `docs/projects/rendu-lod-cellules.md` (fusion des bâtiments par
cellules). Elle ne démarre que si les appels de rendu ou les triangles dépassent les budgets provisoires de 150 et 500 000.

L'outil de mesure est livré : au casque, un appui sur le **joystick droit** affiche le diagnostic, un second appui enregistre
un fichier JSON (`app/src/xr/diagnostics-report.ts`). Sur PC, la touche **D**. Le fichier porte les images par seconde, les
appels de rendu, les triangles, la pire image, les objets et les géométries.

## Parcours proposé

L'ordre compte : la sécurité d'abord, la mesure ensuite (avant que la fatigue fausse le jugement), le confort pour finir.

1. **Sécurité, avant toute marche** — le tapis, la rampe et le bouton d'arrêt restent visibles ; la vignette réelle revient
   tête baissée. C'est `APP-001`, le seul contrat attesté par un humain. Rien d'autre ne se juge si ce point échoue.
2. **Les quatre mesures** — une par ville (Pune Vieille ville, Pune FC Road, Doha Corniche, Doha Souq Waqif), **en marchant**
   et non à l'arrêt : c'est en mouvement que le champ de vision change et que les appels de rendu montent. Quatre fichiers
   JSON enregistrés depuis le casque. Ce sont eux qui débloquent ou annulent `rendu-lod-cellules`.
3. **Le rendu, dans la même marche** — façades et leurs teintes par région (Pune : Inde, Doha : Golfe ; chantier
   facades-regions, `APP-008` : sont-elles crédibles pour chaque ville ?), mobilier et marquages, éclairage et brouillard, profils graphiques : tout se
   regarde pendant les mêmes quatre marches, sans y revenir séparément.
4. **Le confort et les commandes** — tableau de bord, panneau d'infos, commandes de la manette, carrefours.
5. **Les cas longs** — haute vitesse, très long trajet, trajet libre : à part, car ils demandent du temps de marche.
6. **Le guide d'utilisation**, relu à la fin, une fois le reste jugé.

Les points 1 à 4 devraient tenir dans une séance. Les points 5 et 6 peuvent attendre une seconde.

## Questions à trancher

- [decision] Le parcours tient-il en une séance, ou faut-il le couper en deux (rendu d'abord, confort ensuite) ?
- [decision] Que rapporte-t-on d'une séance : les quatre fichiers de mesures suffisent-ils, ou faut-il aussi des notes
  écrites question par question ?
- [decision] Qui met à jour les seize intentions après la séance, et quand : l'agent sur un compte rendu oral, ou le testeur
  directement dans les fichiers ?
- Faut-il une liste imprimable ou affichable hors du casque pour dérouler le parcours sans retirer le casque à chaque point ?
- Les intentions entièrement couvertes par une séance sont-elles supprimées, ou gardées avec leur réponse datée ?
