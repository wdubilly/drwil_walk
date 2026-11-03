# Intents

An **intent** is a stated need, not yet scoped, estimated or prioritised:
it is not a commitment. Each brief states the need as it was expressed,
what already exists in the code (as read on the brief's date) and the
questions to decide before writing anything.

Lifecycle: a scoped intent becomes a workstream (`docs/projects/`);
abandoned, its brief is deleted, with the reason in the commit message.
A need that is already clear and doable as is does not go through here: it
goes straight into the workstream index. Shape of a brief (checked,
QUA-015): a dated (YYYY-MM-DD) « Status » line at the top, sections
« Need », « Current state » (read from the code, dated) and « Open
questions ». An intent re-read later and found partly outdated gets a
dated line under its Status, `**Reviewed on YYYY-MM-DD**: what became
false, what is still alive`; an intent with no dated review for 30 days is
reported by the checks. Closing a workstream updates the intent it comes
from (the brief's `**Intent**` field), or summarises it in the journal and
removes it when fully covered.

| Brief | In one line |
|---|---|
| `docs/intentions/test-voisin-module-pur.md` | Outiller `QUA-006` : un module de logique pure a son test à côté |
| `docs/intentions/test-desactive-cite-fiche.md` | Outiller `QUA-009` : un test désactivé cite la fiche qui le justifie |
| `docs/intentions/controles-couleurs-kit.md` | Installer les contrôles de couleurs et de contraste du kit (`QUA-014`) |
| `docs/intentions/hud-casque.md` | Le tableau de bord de marche dans le casque (maquette : statistiques, défis, boussole, étapes) |
| `docs/intentions/commandes-panneau.md` | Pause, recalibrage et panneau d'infos dans le casque |
| `docs/intentions/corniche-west-bay.md` | La Corniche de Doha jusqu'à West Bay, départ au musée |
| `docs/intentions/rendu-jeu-video.md` | Un rendu de jeu vidéo moderne : fiche d'ensemble, ordre et règles des intentions `rendu-*` |
| `docs/intentions/rendu-mesures-diagnostic.md` | [P0] Mesurer le rendu (images par seconde, appels de rendu, triangles) : à faire en premier |
| `docs/intentions/essai-casque-diagnostic-rendu.md` | Essayer le diagnostic de rendu sur un vrai Quest 3 (72 images par seconde, lisibilité) |
| `docs/intentions/diagnostic-casque-enregistrer.md` | Enregistrer les mesures de rendu depuis le casque (le bouton de la page n'y est pas atteignable) |
| `docs/intentions/rendu-profils-graphiques.md` | [P1] Des profils graphiques (casque, PC, tablette) et la détection des capacités |
| `docs/intentions/rendu-tablette-tactile.md` | [P1] La tablette et le tactile, dans le périmètre dès les premiers lots |
| `docs/intentions/rendu-facades-batiments.md` | [P2] Des bâtiments détaillés (façades, fenêtres, vitrines), plus des blocs extrudés |
| `docs/intentions/essai-casque-facades-batiments.md` | Essayer les façades procédurales sur un vrai Quest 3 (72 images par seconde, lisibilité) |
| `docs/intentions/ville-provence.md` | Un itinéraire dans une ville de Provence pour la famille de façades provençale |
| `docs/intentions/facades-textures-monuments.md` | Textures de façade et monuments glTF (suite des façades procédurales) |
| `docs/intentions/rendu-lod-cellules.md` | [P2] Niveaux de détail et fusion ou chargement par cellules, si les mesures le justifient |
| `docs/intentions/rendu-rues-mobilier.md` | [P2] Des rues, trottoirs et du mobilier urbain crédibles (marquages, passages, bordures) |
| `docs/intentions/rendu-eclairage-ambiance.md` | [P3] Éclairage, ombres, reflets, ambiance et sons (tension avec le réel visible, `APP-001`) |
| `docs/intentions/rendu-sources-donnees.md` | [P3] Plusieurs sources géographiques (Overture, autres) : relevé de couverture fait le 2026-11-03, décision à prendre |
| `docs/intentions/overture-emprises-manquantes.md` | Combler les emprises de bâtiments manquantes (empreintes d'apprentissage d'Overture) |
| `docs/intentions/noms-de-batiments-extrait.md` | Garder le nom des bâtiments dans l'extrait OpenStreetMap |
| `docs/intentions/mise-a-jour-drwil.md` | Mettre drwil à jour pour clore les trois chantiers de garantie |
| `docs/intentions/relecture-guide-casque.md` | Relire `docs/guide-utilisateur.md` sur un vrai Quest 3 |
| `docs/intentions/rendu-ville.md` | Une ville moins austère : reste la question des types de bâtiments (église, mosquée, commerce) |
| `docs/intentions/osm-enrichi.md` | Le relief du sol (reste du rendu OSM enrichi) |
| `docs/intentions/essai-casque-itineraire-libre.md` | Essayer un trajet libre au casque (carte, adresse, cadence, arrivée) |
| `docs/intentions/essai-fournisseurs-ouverts.md` | Essayer un trajet libre sur les instances publiques de Valhalla et de Photon |
| `docs/intentions/essai-casque-osm-enrichi.md` | Juger le rendu OSM enrichi et ses 72 images par seconde sur un vrai Quest 3 |
| `docs/intentions/auto-heberger-valhalla-photon.md` | Auto-héberger Valhalla et Photon |
| `docs/intentions/mention-osm-discrete.md` | Rendre la mention OpenStreetMap plus discrète dans le casque (sans la retirer, ODbL) |
| `docs/intentions/carte-position-en-direct.md` | Voir la carte et sa position bouger pendant la marche |
| `docs/intentions/poste-sans-casque.md` | Une interface pour PC, sans le casque |
| `docs/intentions/version-pc-suites.md` | Suites de la version PC : Google 3D, minicarte, manette de jeu, tactile, essais |
| `docs/intentions/course-reelle-entrainement.md` | Rejouer chez soi le parcours d'une vraie course (pluie, entraînement à la distance) |
| `docs/intentions/essai-casque-tableau-de-bord.md` | Juger le tableau de bord de marche (lisibilité, place, tapis visible) sur un vrai Quest 3 |
| `docs/intentions/noms-de-rues-extrait.md` | Le nom de la rue courante dans le tableau de bord (les extraits n'en portent pas) |
| `docs/intentions/texte-agents-donnee-personnelle.md` | Ajuster le texte de `AGENTS.md` : le poids facultatif est une donnée personnelle |
| `docs/intentions/essai-casque-ambiance-cartoon.md` | Juger l'ambiance cartoon (style, 72 images par seconde, contours) sur un vrai Quest 3 (lot 7) |
| `docs/intentions/budget-temps-e2e-longs.md` | Donner aux e2e de marche longs un budget de temps qui tienne sur une machine chargée |
| `docs/intentions/seance-casque-parcours.md` | Le parcours unique à dérouler quand le testeur est disponible au casque (regroupe les seize `essai-casque-*`) |

A one-line idea, too light for a brief, is noted with one command:
`node .githooks/note.mjs "<text>"` appends a dated line to
`docs/intentions/notes.md` (if present) (outside the workstream index), at any moment and
from any tool, without changing the activity; a note is always an intent,
never an order to code. It is promoted to an intent brief when it matures,
and its line is then removed.

## Brief template

```
# Intent: short title

**Status**: proposed on YYYY-MM-DD.

## Need

(the need as expressed, without rewording that decides in the requester's place)

## Current state

(read from the code on the date above; « not checked » if not read)

## Open questions

- [decision] ...
```
| `docs/intentions/entree-npm-pack-arbres.md` | Une entrée npm pour préparer les arbres du pack Quaternius |
| `docs/intentions/essai-casque-carrefours.md` | Juger le choix de la rue aux carrefours (pointage, prise, flèches) sur un vrai Quest 3 |
| `docs/intentions/essai-casque-vitesse-haute.md` | Essayer la marche à haute vitesse et un trajet libre de plus de 5 km sur un vrai Quest 3 |
| `docs/intentions/nettoyer-gardes-longueur-routeurs.md` | Retirer les gardes de longueur devenues sans effet des routeurs |
| `docs/intentions/carrefours-retour-au-trace.md` | Revenir au tracé d'origine après un détour aux carrefours |
| `docs/intentions/carrefours-version-pc.md` | Le choix de la rue aux carrefours dans la version PC |
