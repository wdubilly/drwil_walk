# Fonctionnalités

Ce que fait drwil_walk du point de vue de la personne qui marche. Mission initiale : `MISSION.md`.
Le produit actuel propose quatre itinéraires embarqués, un seul rendu OpenStreetMap, sans compte ni serveur applicatif.
Les essais sur Quest 3, PC autre que Chromium et vraie tablette restent **humains, non vérifiés**.

## Écran d'accueil

Seuls l'itinéraire et la vitesse sont des choix d'accueil :

- Les cartes viennent du catalogue des villes (une ville créée y ajoute la sienne, avec un visuel commun) ; quatre sont illustrées : Doha Souq Waqif (par défaut), Pune Vieille ville, Pune FC Road et Doha Corniche.
- Vitesse de départ : 4,0 km/h, minimum 1 km/h, sans maximum, pas de 0,1. Une valeur trop basse est ramenée à 1 ;
  une valeur illisible à 4,0, avec un message.
- Rappel de sécurité : clé de sécurité du tapis attachée, main près de la rampe ; attribution OpenStreetMap.
- « Entrer en réalité mixte » et « Version PC ». L'absence de WebXR ne bloque que le premier bouton.

Thème sombre, cibles de 48 px au moins, contraste du texte et du fond (QUA-014).
Pas de choix de fournisseur, de carte distante, d'adresse, de poids ni de réglage de rendu à l'accueil.
Les erreurs de démarrage sont dites sur la page et le bouton redevient utilisable.

## Marche dans la ville

La session Quest est `immersive-ar` (passthrough). La caméra suit le parcours GPS à la vitesse réglée,
avec une direction lissée sur 8 m dans les virages. Les quatre parcours bouclent (APP-002).
Les bâtiments viennent des extraits OpenStreetMap figés ; l'attribution ODbL apparaît sur la page et dans la scène
(APP-003). Aucun service distant n'est appelé pendant la marche.

| Itinéraire | Ville et tracé |
|---|---|
| Souq Waqif | 253 bâtiments ; boucle d'environ 1,5 km, Al Koot, ruelle principale, écuries, retour |
| Pune Vieille ville | 2 079 bâtiments ; boucle d'environ 1,5 km, Shaniwar Wada, Dagdusheth Halwai Ganpati, Bajirao Road |
| Pune FC Road | 1 427 bâtiments, dont 1 410 sans hauteur (7 m) ; aller-retour d'environ 3,5 km |
| Doha Corniche | 756 bâtiments, dont 310 sans hauteur (7 m) ; aller-retour d'environ 4 km depuis le musée |

Les tracés sont calculés sur les voies OpenStreetMap, hypothèse à relire sur place. La Corniche n'atteint pas West Bay,
dont les tours se voient de loin. Environ 20 m de la boucle du souk traversent des passages couverts dessinés comme bâtiments.
Cadence, netteté et lisibilité attendent un vrai casque : `docs/intentions/seance-casque-parcours.md`.

### Commandes Quest

- Joystick droit haut/bas : ±0,1 km/h par poussée. Gâchette droite : pause/reprise (penser à arrêter le tapis).
- A : recalage sur le regard, sans changer la distance. B : afficher/masquer tableau de bord et minicarte.
- Aux carrefours (40 m) : viser avec la manette droite puis confirmer avec la prise droite.
  Flèches jaune (proposée), blanche (pointée), verte (choisie). Sans choix, le tracé initial continue ;
  une autre rue quitte le tracé en douceur, sans changement de vitesse ni distance et sans retour guidé.
  Aucun choix n'est lu quand la ville est effacée ou les préférences ouvertes.
- Gâchette gauche : ouvrir/fermer les préférences ; rayon et prise droite pour changer une ligne.
- Clic joystick droit : diagnostic de rendu, masqué au départ.
- X, Y, joystick et prise gauches : zone tapis, décrite plus bas.

Un appui compte une fois même tenu. Les gestes attendent un essai sur vrai Quest.

### Tableau de bord et minicarte

Vitesse, allure (— en pause), durée, distance, distance restante et progression du tour, calories **environ pour 70 kg**,
cap, lieu (itinéraire), heure locale. Aucune mesure personnelle : le poids est fixe et les anciens poids ne sont pas relus.
Pas de dénivelé faute de source d'élévation ; noms de rues manquants : `docs/intentions/noms-de-rues-extrait.md`.

Le tableau flottant est en bas du champ de vision, du côté choisi, sur un fond transparent réglable.
Ses quatre coins restent dans la vue simulée (APP-004, APP-005), hors de la zone tapis.
La minicarte est de l'autre côté, nord en haut, avec le tracé et un point mobile, sans tuiles ni réseau.
Ils suivent le regard et s'effacent tête baissée ; les préférences prennent leur place sans arrêter la marche.
Lisibilité réelle : `docs/intentions/essai-casque-tableau-de-bord.md`.

## Préférences en marche

Sur Quest, PC et tablette, chaque changement s'applique **à chaud sans reconstruire la ville ni quitter la marche**.
Les variantes graphiques sont préparées au départ ; changer un profil ne fabrique pas de géométrie.
Sur écran, ouvrir « Préférences de marche », puis cliquer/toucher une ligne. Sur Quest, pointer puis confirmer
avec la prise droite ; chaque appui passe à la valeur suivante.

| Préférence | Premier départ | Choix |
|---|---|---|
| Qualité | Équilibré | Performance, Équilibré, Qualité |
| Ville vivante (piétons et circulation) | Non | une seule commande pour les deux |
| Lampadaires | Oui | Oui/Non ; mâts produits et leurs lanternes |
| Arbres | Oui | Oui/Non |
| Brouillard | Non | Oui/Non, refusé en Performance |
| Sons d'ambiance (%) | Coupés | 0, 25, 50, 75, 100 |
| Côté du panneau | À droite | À gauche/À droite |
| Opacité du panneau (%) | 70 | 70, 80, 90, 100 |

Choix mémorisés uniquement dans le navigateur (`localStorage`). Les anciens réglages sont ignorés, sauf le profil.
Une valeur illisible ou un stockage indisponible est dit sur la page ; la séance reste utilisable.
Matériaux locaux, poids et vignette ne sont pas exposés. L'opacité du panneau ne change pas celle de la ville.

### Profils graphiques (APP-006)

| Profil | Contours | Ville riche | Marquages | Brouillard permis | Arbres/mobilier OSM max. | Pixel ratio écran | Échelle XR initiale |
|---|---|---|---|---|---|---|---|
| Performance | non | non | non | non | 100/120 | 0,75 | 0,8 |
| Équilibré | non | oui | oui | oui | 300/400 | 1 | 1 |
| Qualité | oui | oui | oui | oui | 300/400 | 2, borné par l'écran | 1,2 |

Équilibré est le premier choix sur toutes les plateformes, sans détection de capacités. À chaud, le casque adapte
la fovéation (Performance 1, Équilibré 0,5, Qualité 0), sans recréer la session ; l'échelle XR est fixée à l'entrée.
Aucun profil ne touche la zone tapis, la vignette ni l'opacité de sécurité. Cadences et budgets de mémoire des variantes
sur un vrai casque : `docs/intentions/essai-casque-profils-graphiques.md`.

## Rendu de la ville

- Bâtiments extrudés, couleurs OSM (`building:colour`, `roof:colour`, `building:material`) ou palette régionale,
  ombrage vers le pied. Sol et voies en toon à quatre paliers ; voies bordées, ligne centrale dès 7 m.
- Ville riche : revêtement des voies (asphalte, pavés, terre : balise `surface` relevée, sinon valeur de la région ; légère usure déterministe par voie, joints de pavés et grain dessinés au sol), trottoirs et passages piétons, parcours jaune, surfaces vertes et haies, jusqu'à 300 toits à deux pans,
  80 auvents, 8 noms de rues à moins de 60 m. Au plus 8 maillages fixes supplémentaires.
- Façades procédurales (APP-008) : identifiant OSM comme graine, quatre familles adaptées à la région,
  aucun voisin identique, fenêtres, portes, volets, balcons et corniches à moins de 80 m du parcours.
  Teintes de l'Inde à Pune, sable et bois du Golfe à Doha. Performance réduit le détail.
  Rez-de-chaussée commerçant : vitrine, porte et auvent (plat, store rayé ou arcade) selon la région ; un commerce relevé
  dans OpenStreetMap (`shop`, `amenity`) en a toujours un, et une part des bâtiments sans usage connu en reçoit un par règle.
  Formes simples, pas encore jugées au casque.
  Les teintes d'un quartier (souk Waqif, Vieille ville de Pune) se surchargent dans `app/assets/recette-regions.json`, avec
  l'origine de chaque élément ; elles jouent aussi sur les façades, les matériaux et les figurants ; teintes inchangées, pas encore jugées au casque.
- Matériaux locaux (APP-012) : appliqués automatiquement quand une bibliothèque embarquée existe, absents en Performance.
  Textures CC0 recolorées, teinte/échelle/usure déterministes sans doublon voisin, aucun réseau.
- Arbres Quaternius CC0 : quatre variantes de 413–454 triangles, cap et taille reproductibles, au plus 300.
  Échec de chargement signalé, repli sur un arbre simple.
- Mobilier OSM et marquages (APP-009) : dimensions réelles, axe de rue, bancs, poubelles, panneaux,
  bordures de trottoir et lignes d'arrêt. Les extraits n'ont ni lampadaire ni poubelle ni panneau ;
  bancs au souk et à la Corniche.

Tout s'efface avec la ville. Limites : couleurs sans références suffisantes et textures non compressées ;
`docs/intentions/palettes-regions-references.md`, `docs/intentions/textures-compressees-quest.md`,
`docs/intentions/essai-casque-facades-batiments.md`, `docs/intentions/essai-casque-materiaux-souk.md`,
`docs/intentions/essai-casque-ville-riche.md`, `docs/intentions/essai-casque-ambiance-cartoon.md`.

### Lampadaires produits par règle (APP-013)

Inventés, jamais présentés comme relevés : intervalle 27,5 m sur voie passante, 37,5 m en quartier, 17,5 m en ruelle,
variation ±20 % par graine OSM ; pas de sentier, escalier ni cheminement piéton. Mât à 0,6 m de la bordure,
bras vers la chaussée. Refus dans un bâtiment, sur trottoir de moins de 1,2 m ou à moins de 2 m d'un objet ;
les relevés sont prioritaires. Plafond 100 en Performance, 300 ailleurs. Provenance `osm`/`generated`,
résumé sur la page. Maillage séparé pour permettre leur retrait à chaud.
Environ 21 600 triangles pour 300 mâts (calcul, pas mesure). Densité et cadence : `docs/intentions/seance-casque-parcours.md`.

### Éclairage et ambiance (APP-011)

Lumière suivant l'heure locale au départ : soleil de 6 h à 18 h, orange rasant puis blanc de midi ;
nuit doucement éclairée, heure illisible remplacée par midi. Aucun ciel opaque au casque.
Brouillard : rien sous 8 m, opacité au plus 15 % au casque, jusqu'à 90 % sur écran, coupé en Performance.
Sons produits par code : aucun contexte audio à volume nul, gain plafonné à 0,2 ; quitter coupe le son.
De nuit, lanternes et halos chauds au sol : deux maillages instanciés, aucune lumière par mât,
aucun effet sur l'alpha du passthrough, découpe et fondu de sécurité. La préférence Lampadaires les coupe aussi.
Non jugé/écouté sur vrai casque : `docs/intentions/seance-casque-parcours.md`.

### Ville vivante (APP-014)

Activable par une seule préférence, sur les itinéraires du catalogue (Souq Waqif seulement).
Voitures, taxis, 4x4, utilitaires, deux-roues sur voies carrossables ; piétons sur trottoirs et voies piétonnes.
`oneway`, `lanes`, côté de conduite et emprises des bâtiments sont respectés. Moteur pur à graine OSM,
types en données (`app/assets/figurants-catalogue.json`), tables régionales dans la recette (`app/assets/recette-regions.json`), Golfe réglé, Inde provisoire.
Vitesses plafonnées à 30 km/h et 6 km/h. Plafonds véhicules/piétons : 8/16, 20/40, 30/60 selon profil.
Figurants retirés à moins de 10 m avec transition sur 4 m, soumis à la zone tapis et au fondu.
Un maillage instancié par modèle CC0, 12 au plus ; modèles invalides refusés avec raison.
Les piétons glissent sans animation. Origines/licences : `app/assets/PROVENANCE.md`.
Essai réel et animation : `docs/intentions/seance-casque-parcours.md`.

## Sécurité : le réel reste visible (APP-001)

Ville pleine jusqu'à 25° tête baissée, effacée à 40°, effacée aussi sans pose du casque.
Zone tapis toujours transparente : boîte 1,2 × 2,4 × 1,2 m au départ. X la pose sous soi ;
joystick gauche la déplace, prise tenue + joystick la redimensionne, Y rétablit le défaut.
Enregistrement en fin de geste, erreur dite ; zone illisible remplacée par le défaut.
Vignette réelle toujours active : périphérie en passthrough, fondu entre 60 % et 125 % du rayon.
Aucune préférence ni changement de qualité ne réduit ces protections.

## Version PC et tablette

Canvas de page sans WebXR, même ville, vitesse et calculs. Pas de fondu, de zone tapis ni de vignette sur écran.
Espace/P pause ; ↑/+ et ↓/− vitesse ±0,1, PageHaut/PageBas ±1 ; R recale ; H masque le tableau ;
D diagnostic ; glisser regarde ; Échap quitte. Une pression = une action, sans répétition.
Pas de choix de carrefour ni de minicarte ni de manette de jeu : `docs/intentions/version-pc-suites.md`.

Tablette (APP-007) : boutons tactiles de 48 px, « Moins vite », « Pause ou reprise », « Plus vite », « Recaler », « Quitter » ;
glisser un doigt regarde, relâcher arrête. Préférences accessibles au toucher ; tableau HTML et accueil petit écran.
Ni pincement ni gyroscope. Émulation Chromium seulement : `docs/intentions/essai-tablette-tactile.md`.

Diagnostic : images/s, temps d'image, appels de rendu et triangles, valeur illisible dite indisponible.
Sur écran, « Enregistrer les mesures » télécharge du JSON, sans envoi.

### Parité des plateformes (APP-015)

Casque, PC et tablette montrent la même ville avec les mêmes options (matériaux, lampadaires, ville vivante, arbres, profil).
Propre à chaque plateforme : commandes (carrefours et minicarte au casque seulement), passthrough et protections au casque,
ciel et brouillard, profils par défaut ; rendu Google 3D indisponible sur PC et tablette (repli annoncé).

## Créer un itinéraire

`npm run city -- <identifiant> [options]` prépare extrait, boucle et matériaux **sur le PC de développement uniquement**,
avec réseau ; rien n'est généré dans le casque. Villes décrites dans `app/data/villes.json` (source unique, lue par l'application : la ville créée apparaît à l'accueil sans code), pas de script par ville.
Photos Panoramax, Mapillary (jeton dans l'environnement), photos fournies ; recherche jusqu'à 1 km puis palette régionale,
rapport de provenance, poids écrits, durée et vignettes écartées. Rien n'est écrit (catalogue compris) tant que toutes les étapes n'ont pas réussi ;
un échec rend un message avec la cause réseau. Arguments : `docs/guide-utilisateur.md`. Essai réel sur Rome centro storico le 2026-11-11 : `docs/projects/journal.md`.
Inscription à l'accueil encore manuelle : `docs/intentions/inscrire-une-ville-creee.md`.
