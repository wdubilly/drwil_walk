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

## 3. Ouvrir la page dans le Quest 3 (non vérifié sur casque)

1. Dans le Quest 3, ouvrez le navigateur (Meta Quest Browser).
2. Saisissez l'adresse `Network` affichée par le terminal, par exemple `https://192.168.1.11:5173/`.
3. Le navigateur avertit que la connexion n'est pas privée : le certificat est **auto-signé** (créé par le poste, pas
   par une autorité). C'est attendu. Choisissez l'option « Avancé » puis celle qui permet de continuer vers le site.
   N'acceptez ce certificat que pour l'adresse de votre propre poste.
4. La page d'accueil s'affiche : rappel de sécurité, itinéraire, vitesse de départ, opacité de la ville, bouton
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

L'opacité de la ville se règle à l'accueil (30 à 100 %) : baissez-la si vous voulez voir davantage le réel.

## 5. Marcher

1. Sur l'accueil, choisissez l'**itinéraire** en cliquant sur une carte (à la manette, pointez-la). Disponibles :
   Doha Souq Waqif (par défaut), Pune Vieille ville, Pune FC Road, Doha Corniche, et **Itinéraire libre** (voir ci-dessous).
   Choisissez aussi le **rendu de la ville** : « OpenStreetMap » (par défaut, sans réseau) ou « Google 3D »
   (photoréaliste, demande une clé Google dans `.env.local` (dans `app/`), voir `INSTALL.md`). Sans clé, ou si les tuiles ne se
   chargent pas, la marche se fait en OpenStreetMap et la raison s'affiche sur l'accueil, sous le bouton.
   **Itinéraire libre** (sans clé : routage et adresses d'OpenStreetMap, voir `INSTALL.md`) : une carte apparaît.
   Posez le **départ** puis l'**arrivée** en touchant la carte (boutons « + », « − » et flèches pour zoomer et la déplacer),
   ou tapez un lieu ou une adresse dans les champs « Départ » et « Arrivée » puis « Chercher » : les deux modes se
   remplissent mutuellement (l'adresse trouvée s'inscrit dans le champ, et le point se place sur la carte ; si plusieurs
   lieux correspondent, le premier est retenu et affiché). Un troisième toucher recommence ; « Effacer » vide tout. Appuyez sur
   « Calculer le trajet » : le chemin à pied et la ville autour sont chargés, et la longueur s'affiche (5 km au plus, sinon
   un message le dit). Si un service public refuse ou limite les demandes, la raison s'affiche et les quatre autres itinéraires restent utilisables.
   Aucun lieu ni adresse n'est enregistré : ils ne partent qu'aux services d'adresses (Photon) et de routage (Valhalla) d'OpenStreetMap.
2. Réglez la **vitesse de départ** (1 à 8 km/h, par pas de 0,1) et l'**opacité de la ville**. La plage est écrite sous le champ ;
   une valeur hors plage (50 par exemple) est ramenée à la borne et l'écran le dit, avec la raison (sécurité sur le tapis).
3. Appuyez sur « Entrer en réalité mixte » et acceptez la demande d'autorisation du navigateur. Si le bouton est
   grisé ou affiche un message, voir la section 6.
4. La ville défile le long de l'itinéraire à la vitesse réglée. Lancez ou ajustez le tapis à la même vitesse.
5. Pendant la marche, **joystick droit haut / bas** : +0,1 / −0,1 km/h. Un panneau (vitesse, distance, temps)
   s'affiche sur la page et dans la scène ; à 8 km/h (ou 1 km/h), il le dit : le joystick ne va pas plus loin. À la fin d'une boucle, la marche reprend au départ ; sur un itinéraire libre,
   elle s'arrête à l'arrivée et le dit (page et casque) : arrêtez alors le tapis.

Les autres commandes de manette décrites dans `docs/features.md` (pause, recalibrage, panneau d'infos) sont à venir.
Les données de la ville sont © contributeurs OpenStreetMap (et © Google en rendu Google 3D).

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
