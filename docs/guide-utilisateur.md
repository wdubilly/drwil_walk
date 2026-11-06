# Guide d'utilisation : marcher dans une ville avec le Quest 3

Ce guide va de zéro jusqu'à la première marche sur le tapis, sans connaissance de programmation. Il couvre le poste
local (`npm run dev`), pas un hébergement permanent. Ce que fait l'application, écran par écran : `docs/features.md`.

**Avertissement sur l'état de ce guide.** Les commandes de la section 2 ont été exécutées sur un poste de
développement. Tout ce qui se passe dans le casque (certificat, réalité mixte, manettes, marche) n'a **pas été
vérifié sur un vrai Quest 3** : ces étapes sont marquées « non vérifié » et attendent une relecture humaine avec le
casque.

## 1. Avant de commencer

- Un poste (Windows, macOS ou Linux) avec **Node.js 24** et **npm 11**. Pour vérifier : `node -v` puis `npm -v`
  (ils affichent un numéro de version commençant par 24 et par 11).
- Les fichiers du projet sur le poste. Le clonage et les outils de développement sont décrits dans `INSTALL.md`.
- Un **Meta Quest 3**, et le poste et le casque sur le **même réseau Wi-Fi ou local**. Un réseau « invité » ou
  isolé qui sépare les appareils empêche le casque de joindre le poste (voir la section 6).
- Un tapis de course classique (non connecté) : l'application ne le pilote pas, vous réglez la vitesse à la manette
  pour qu'elle corresponde à celle du tapis.

## 2. Lancer l'application sur le poste

Dans un terminal, depuis le dossier du projet :

```bash
cd app
npm ci
npm run dev
```

`npm ci` n'est nécessaire qu'une fois (il installe les dépendances). `npm run dev` démarre le serveur. Il est prêt
quand le terminal affiche une ligne `Local:` et une ou plusieurs lignes `Network:` du type :

```
➜  Local:   https://localhost:5173/
➜  Network: https://192.168.1.11:5173/
```

Gardez ce terminal ouvert pendant toute la marche. Pour arrêter : `Ctrl+C` dans ce terminal.

À noter :

- Si le port 5173 est déjà pris, le serveur en prend un autre (par exemple 5174) et l'affiche : utilisez toujours
  les adresses affichées, pas celles de ce guide.
- Plusieurs lignes `Network:` peuvent apparaître (une par carte réseau, y compris des réseaux virtuels). Prenez celle
  dont le début ressemble à l'adresse de votre poste sur le réseau du casque, souvent `192.168.…`.
- L'adresse commence par `https://` (et non `http://`) : le mode réalité mixte du navigateur l'exige.

### Créer un nouvel itinéraire (PC de développement uniquement, réseau nécessaire)

Une seule commande, depuis `app/`, prépare une ville : l'extrait OpenStreetMap, le tracé de boucle et les matériaux colorés
d'après des photos de rue.

```bash
npm run city -- rome --nom "Rome, centre" --emprise 41.89,12.47,41.91,12.50 --depart 41.8986,12.4768 --arrivee 41.9029,12.4534
```

- L'identifiant (`rome`) sert de nom aux fichiers ; `--emprise` s'écrit sud,ouest,nord,est et `--depart`, `--arrivee`,
  `--via` en latitude,longitude. `--retour boucle` revient par un autre chemin (par défaut : aller-retour).
- `npm run city -- souq` rejoue une ville déjà décrite dans `app/data/villes.json`.
- Photos : Panoramax, puis Mapillary si la variable d'environnement `MAPILLARY_TOKEN` contient votre jeton (ne l'écrivez
  jamais dans un fichier du dépôt), puis vos propres photos avec `--photos <dossier>` (le dossier reste hors du dépôt, seules
  les couleurs en sont tirées). Sans photo à moins de 30 m du tracé, la recherche s'élargit jusqu'à 1 km, puis la
  palette de la région sert de repli ; la commande l'écrit.
- La commande affiche un rapport : pour chaque couleur, la photo d'où elle vient (distance, auteur, licence). Les
  services publics sont interrogés avec des pauses : ne la relancez pas en boucle.
- La ville créée n'apparaît pas encore à l'accueil : son inscription dans l'application reste à faire.

## 3. Ouvrir la page dans le Quest 3 (non vérifié sur casque)

1. Dans le Quest 3, ouvrez le navigateur (Meta Quest Browser).
2. Saisissez l'adresse `Network` affichée par le terminal, par exemple `https://192.168.1.11:5173/`.
3. Le navigateur avertit que la connexion n'est pas privée : le certificat est **auto-signé** (créé par le poste, pas
   par une autorité). C'est attendu. Choisissez l'option « Avancé » puis celle qui permet de continuer vers le site.
   N'acceptez ce certificat que pour l'adresse de votre propre poste.
4. La page d'accueil s'affiche : rappel de sécurité, itinéraire, vitesse de départ, bouton
   « Entrer en réalité mixte ».

Un essai sans casque est possible : ouvrez l'adresse `Local` dans le navigateur du poste. L'accueil s'affiche, mais le
bouton explique qu'il ne peut pas entrer en réalité mixte (pas de WebXR), ce qui est normal.

## 4. Installer le tapis et se préparer (sécurité)

Le risque principal est une chute. Avant de mettre le casque :

- **Dégagez la zone** autour du tapis : rien à portée de bras ni de chute, sol sec, personne qui peut passer.
- **Attachez la clé de sécurité** du tapis à vos vêtements, et gardez **une main près de la rampe**. C'est le rappel
  affiché sur l'accueil.
- Commencez à **vitesse modérée** (4,0 km/h par défaut). Réglez d'abord la vitesse du tapis, puis celle de
  l'application pour qu'elles coïncident.
- La ville est dessinée par-dessus le monde réel (passthrough). **Quand vous baissez la tête** (au-delà d'environ
  25° sous l'horizontale), la ville s'efface progressivement, entièrement vers 40° : baissez la tête pour voir le tapis
  et vos pieds. Si le casque perd son suivi, la ville s'efface aussi. C'est une règle protégée du projet (contrat
  `APP-001`, sécurité par visibilité), vérifiée par des tests automatiques, mais pas encore sur un vrai casque.
- **La ville n'est jamais un substitut à la vigilance.** Elle reste une image : arrêtez le tapis avant de retirer le
  casque ou si quelque chose vous gêne, et ne comptez pas sur elle pour voir un obstacle.

La visibilité de sécurité et la vignette restent fixes ; aucune préférence ne les désactive.

## 5. Marcher

1. Sur l'accueil, choisissez l'**itinéraire** en cliquant sur une carte (à la manette, pointez-la). Disponibles :
   Doha Souq Waqif (par défaut), Pune Vieille ville, Pune FC Road et Doha Corniche.
   Le rendu OpenStreetMap est embarqué : aucune clé ni recherche d'adresse ni connexion à un service distant.
2. Réglez la **vitesse de départ** (à partir de 1 km/h, sans maximum, par pas de 0,1). Le minimum est écrit sous le champ ;
   une valeur sous 1 km/h est ramenée à 1 km/h et l'écran le dit. Réglez une vitesse que vous maîtrisez, clé de sécurité du tapis attachée.
   Les préférences se règlent une fois la marche démarrée (voir ci-dessous). Le poids n'est pas demandé :
   les calories « environ » sont une estimation pour 70 kg, jamais une mesure personnelle.
3. Appuyez sur « Entrer en réalité mixte » et acceptez la demande d'autorisation du navigateur. Si le bouton est
   grisé ou affiche un message, voir la section 6.
4. La ville défile le long de l'itinéraire à la vitesse réglée. Lancez ou ajustez le tapis à la même vitesse.
5. Pendant la marche, **joystick droit haut / bas** : +0,1 / −0,1 km/h. Un panneau (vitesse, distance, temps)
   s'affiche sur la page et dans la scène ; à 1 km/h, il le dit : le joystick ne descend pas plus bas.
   À la fin d'une boucle, la marche reprend au départ.

### Préférences pendant la marche (non vérifié sur appareil réel)

**Quest** : la **gâchette gauche** ouvre ou ferme les préférences. Pointez une ligne avec la manette droite puis
appuyez sur la **prise droite** : chaque appui passe à la valeur suivante. Le tableau de bord laisse sa place au
panneau de préférences ; baissez la tête et il s'efface, comme la ville. Le réglage de la zone tapis reste disponible.

**PC et tablette** : ouvrez **« Préférences de marche »**, puis cliquez ou touchez un bouton pour passer à la valeur
suivante. La marche continue, sans reconstruire la ville, et les commandes de vitesse restent disponibles.

| Préférence | Choix |
|---|---|
| Qualité | Performance, Équilibré, Qualité ; Équilibré au premier départ |
| Ville vivante (piétons et circulation) | une seule commande, Non au premier départ ; figurants au Souq Waqif seulement |
| Lampadaires | Oui au premier départ ; coupe aussi leurs lanternes |
| Arbres | Oui au premier départ |
| Brouillard | Non au premier départ ; au casque, aucun voile à moins de 8 m et 15 % au plus ; Performance le refuse |
| Sons d'ambiance (%) | Coupés, 25, 50, 75, 100 ; gain sonore plafonné à 20 % ; garder le tapis et la pièce audibles |
| Côté du panneau | À gauche ou À droite ; droite au premier départ |
| Opacité du panneau (%) | 70, 80, 90, 100 ; ne modifie pas l'opacité de la ville |

Le dernier choix est gardé dans ce navigateur pour la prochaine marche, sans envoi. Les anciens réglages sont ignorés,
sauf le profil graphique. Un stockage illisible ou indisponible est signalé sur la page ; les changements restent utilisables
pour la séance. Les matériaux locaux et la vignette restent fixes. La lumière suit l'heure de l'appareil au départ.

**Carrefours** (dans le casque) : à l'approche d'un carrefour, des flèches au sol montrent les rues possibles (jaune), le panneau dit « Carrefour dans N m ». Visez une rue avec la **manette droite** (la flèche devient blanche) puis appuyez sur la **prise** : la flèche devient verte et vous prenez cette rue. Si vous ne choisissez rien, vous suivez le tracé de l'itinéraire. Choisir une autre rue ne change ni la vitesse ni la distance parcourue ; une fois sorti du tracé, il n'y a pas de retour guidé vers lui. La version PC ne propose pas de carrefours.

Autres commandes de la **manette droite** : **gâchette** = pause / reprise (penser à arrêter ou ralentir le tapis) ;
**A** = recalibrer le parcours sur votre position et regard, sans changer la distance ; **B** = afficher / masquer le
tableau de bord et la minicarte. Le tableau montre cap, heure, lieu, vitesse, allure (« — » en pause), durée, distance,
distance restante et progression du tour. Les calories sont **environ pour 70 kg**, pas une mesure personnelle.
Il reste en bas du champ de vision, du côté réglé pendant la marche (droite au premier départ), hors de la zone tapis,
sur un fond transparent ; tête baissée, il s'efface avec la ville. La minicarte, de l'autre côté, montre tracé nord en haut
et point mobile sans tuiles ni connexion. **Clic joystick droit** = diagnostic de rendu, masqué au départ (images/s,
temps d'image, appels de rendu, triangles ; valeur illisible dite « indisponible »). Sur écran, « Enregistrer les mesures »
télécharge un JSON sans envoi. Une pression compte une fois même tenue. Gestes non essayés sur vrai Quest 3.

**Zone tapis** (manette gauche) : une boîte autour du tapis (par défaut 1,2 m sur 2,4 m, 1,2 m de haut, autour de l'endroit où vous démarrez) dans laquelle la ville n'est jamais dessinée : le tapis, la rampe et la console restent visibles. **Bouton X** = poser la boîte sous vous, dans le sens où vous regardez ; **joystick gauche** = la déplacer (en avançant, la boîte avance) ; **prise gauche tenue + joystick** = l'élargir (gauche/droite) ou l'allonger (haut/bas) ; **bouton Y** = revenir à la boîte par défaut. Le réglage est enregistré dans le navigateur quand vous relâchez le joystick, et repris au lancement suivant ; si l'enregistrement échoue, l'écran le dit. Dans la ville, le trou laisse voir le réel : c'est lui qui montre où est la zone. **Vignette réelle** : la périphérie du champ de vision reste toujours en vision réelle, sans préférence pour la désactiver. Ni la zone ni la vignette n'ont encore été essayées sur un vrai Quest 3.

**Ville riche** : les rues ont des trottoirs et des passages piétons, le chemin que vous suivez est jaune, les parcs sont verts, certains toits sont à deux pans et quelques noms de rues sont écrits au sol devant vous. Tout s'efface, comme le reste de la ville, quand vous baissez la tête.

**Façades** : près du parcours, les bâtiments ont des fenêtres, des portes, des volets, des balcons et une corniche, qui varient d'un bâtiment à l'autre ; elles s'effacent tête baissée comme le reste de la ville. Le profil « performance » en dessine moins. Non vérifié dans un vrai casque.

**Mobilier urbain et marquages** : les bancs, lampadaires, poubelles et panneaux de la rue sont dessinés à leur taille réelle et
posés dans l'axe de la rue, uniquement là où les données OpenStreetMap en signalent ; les passages piétons, les bordures de
trottoir et les lignes d'arrêt suivent les mêmes données. Les extraits livrés ne contiennent aujourd'hui ni lampadaire, ni
poubelle, ni panneau : vous ne verrez donc que les bancs du souk de Doha et de la Corniche. Des **lampadaires** sont
produits par règle le long des rues (inventés, pas relevés) ; la préférence Lampadaires les retire à chaud, avec leurs
lanternes. De nuit au départ (avant 6 h et après 18 h), elles brillent avec un halo au sol, sans masquer le réel.
Au souk, Ville vivante active ensemble véhicules et passants, désactivés au premier départ. Votre dernier choix est
repris aux marches suivantes. Les figurants disparaissent en douceur avant d'arriver à 10 m, restent hors du tapis et
s'effacent tête baissée. Le profil Performance en pose moins. Le profil **Performance** réduit le
mobilier et retire les marquages. Rien de tout cela ne masque le réel : tête baissée, la ville et son mobilier s'effacent. Non
vérifié au casque.

**Ambiance cartoon** : aplats à paliers de couleur, voies bordées et façades avec fenêtres. Le profil se règle pendant
la marche ; Qualité ajoute les contours, Performance retire verdure au sol et noms de rues, réduit arbres et mobilier.
Équilibré au premier départ, dernier choix mémorisé ensuite. Aucun profil ne retire la sécurité.
Arbres Quaternius embarqués, quatre variantes reproductibles, sans réseau ; échec signalé avec repli sur arbres simples.
Ce rendu n'a pas été jugé sur vrai Quest 3. Données : © contributeurs OpenStreetMap.

### Sans casque : la version PC

Sur l'accueil, le bouton **« Version PC »** (à côté de « Entrer en réalité mixte ») lance la même marche dans la page,
sans casque et sans WebXR : n'importe quel navigateur de bureau convient (essayé sur Chromium). Elle n'applique ni le fondu
tête baissée, ni la zone tapis, ni la vignette : il n'y a pas de réel à protéger devant un écran, mais ne marchez pas sur un
tapis en regardant un écran sans la même vigilance (clé de sécurité, main près de la rampe).

| Touche | Action |
|---|---|
| Espace (ou P) | pause et reprise |
| ↑ ou +, ↓ ou − | vitesse +0,1 / −0,1 km/h (PageHaut, PageBas : ±1 km/h), à partir de 1 km/h, sans maximum |
| R | recaler le parcours sur le regard |
| H | masquer ou réafficher le tableau |
| D | afficher ou masquer le diagnostic de rendu (images par seconde, appels de rendu, triangles) |
| glisser la souris | regarder autour |
| Échap | quitter la version PC |

**Sur une tablette** : ouvrez l'application dans le navigateur et touchez « Version PC ». Des boutons en bas de l'écran règlent la vitesse (« Moins vite », « Plus vite » : 0,1 km/h par appui), mettent en pause ou reprennent, recalent le parcours sur le regard et quittent ; glissez un doigt sur la scène pour regarder autour, relâchez-le pour arrêter. Le tableau de bord s'affiche par-dessus la scène. Même vigilance qu'au PC : regarder un écran en marchant sur un tapis demande clé de sécurité et main près de la rampe. Jamais essayé sur une vraie tablette (émulation tactile de Chromium seulement).

La marche se fait uniquement sur les itinéraires embarqués et boucle.

## 6. Ennuis connus et remèdes

| Symptôme | Remède |
|---|---|
| Le navigateur du Quest avertit d'un certificat non fiable | Normal : certificat auto-signé. Avancé, puis continuer vers l'adresse de votre poste. WebXR exige HTTPS, donc on ne peut pas passer par `http://`. |
| Le bouton « Entrer en réalité mixte » est grisé ou affiche une raison | Le navigateur n'offre pas WebXR : vous êtes sur le navigateur du poste, ou la page n'est pas en `https://`. Ouvrez-la dans le navigateur du Quest, à l'adresse `Network`. |
| La page ne se charge pas dans le Quest (délai dépassé) | Le casque et le poste ne sont pas sur le même réseau (Wi-Fi invité, réseau isolé, VPN), ou le pare-feu du poste bloque le port affiché. Remettez-les sur le même réseau, vérifiez l'adresse (plusieurs lignes `Network:`), autorisez le port dans le pare-feu. |
| L'adresse `Network` change d'un jour à l'autre | Le routeur redonne une autre adresse au poste : relisez celle que le terminal affiche à chaque lancement. |
| Le terminal indique « Port 5173 is in use » | Un autre programme tient le port : Vite en prend un autre, utilisez l'adresse affichée. |
| La vitesse affichée ne colle pas au tapis | L'application ne lit pas le tapis : réglez les deux à la main (joystick droit pour l'application). |

Les remèdes liés au casque, au pare-feu et au réseau sont **non vérifiés** ici ; seul le changement de port
(5173 pris, le serveur prend 5174) a été constaté sur le poste.

## 7. À faire relire par une personne avec le casque

Suivre ce guide sur le vrai poste et le vrai Quest 3, de la section 2 à la marche, et corriger tout ce qui diffère
(libellés exacts du navigateur du casque, du certificat, de l'autorisation de réalité mixte).
