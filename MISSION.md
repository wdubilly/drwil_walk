# Fiche mission — DrWil Walk (prototype v0.1)

## 1. Contexte
L'utilisateur marche sur un **tapis de course classique (non connecté)** en portant un **Meta Quest 3**.
L'objectif est de lui donner l'impression de **se promener dans une vraie ville**, tout en gardant
une **vue partielle sur son environnement réel** pour sa sécurité (tapis, rampe, console, bouton d'arrêt).

## 2. Objectif de la mission
Développer un **prototype WebXR en réalité mixte**. Il doit tourner dans le **navigateur du Quest 3**, sans installation :
la ville défile à la vitesse de marche réglée par l'utilisateur, et le monde réel reste visible dans les zones de sécurité.

## 3. Stack technique imposée
- **JavaScript / TypeScript**, bundler **Vite**
- **three.js** + WebXR (`navigator.xr`, session **`immersive-ar`** pour le passthrough)
- Rendu de la ville : **`3d-tiles-renderer`** (NASA-AMMOS) avec **Google Photorealistic 3D Tiles**
  - Clé API lue depuis `.env` (`VITE_GOOGLE_MAPS_API_KEY`), jamais commitée (ajouter `.env` au `.gitignore`, fournir `.env.example`)
  - **Plan B obligatoire** si pas de clé : bâtiments OpenStreetMap extrudés, ou une scène de rue procédurale simple
- Serveur de dev en **HTTPS** (WebXR l'exige) : `@vitejs/plugin-basic-ssl`, accessible sur le réseau local (`--host`)
- Test sans casque : **Immersive Web Emulator** (extension navigateur) ou IWER

## 4. Fonctionnalités attendues (MVP)

### 4.1 Déplacement
- Itinéraire **prédéfini** le long d'une rue (liste de points GPS → courbe lissée)
- Itinéraires configurables dans un fichier `routes.json`
- Ville par défaut : **Pune (Inde)**, avec **2 itinéraires distincts** :
  1. **Vieille ville** (itinéraire par défaut) : de **Shaniwar Wada au temple Dagdusheth Halwai Ganpati**, par Laxmi Road / Budhwar Peth
  2. **FC Road (Fergusson College Road)** : balade le long de l'avenue
- Deuxième ville : **Doha (Qatar)**, avec **2 itinéraires distincts** :
  1. **Corniche** : du Musée d'art islamique (MIA) vers les tours de West Bay, en bord de mer
  2. **Souq Waqif** : balade dans les ruelles du souk
  - ⚠️ Vérifier la couverture photoréaliste de Google 3D Tiles sur Pune et sur Doha. Si la couverture est partielle ou absente pour une ville, basculer automatiquement sur le plan B (OSM)
- Avancement à vitesse constante, **réglable en km/h** (défaut 4,0 km/h, pas de 0,1, plage 1 à 8 km/h)
- La caméra suit la direction de la rue **en douceur** ; aucune rotation brusque (prévention du mal des transports)
- Hauteur des yeux réaliste (environ 1,65 m au-dessus du sol virtuel, ajustable)
- Pause / reprise

### 4.2 Contrôles (manettes Quest 3)
- Gâchette droite : pause / reprise
- Joystick droit haut / bas : vitesse +0,1 / −0,1 km/h
- Bouton A : recalibrer la position et l'orientation (« je suis face au tapis »)
- Bouton B : afficher ou masquer le panneau d'infos
- Panneau d'infos (HUD discret) : vitesse, distance parcourue, temps, nom de la rue ou du lieu si disponible

### 4.3 Sécurité — visibilité du réel (critique)
Session `immersive-ar` : le passthrough est visible partout où rien n'est rendu.
1. **Fondu vers le bas** : quand l'utilisateur baisse la tête (inclinaison au-delà d'environ 25° vers le bas), la ville
   s'estompe progressivement jusqu'à disparaître (on voit ses pieds, le tapis, la console)
2. **Zone tapis** : au démarrage, l'utilisateur définit avec la manette un volume (boîte) autour du tapis.
   Ce volume reste **toujours transparent** (réel visible). La zone est sauvegardée en `localStorage`
3. **Opacité globale réglable** de la ville (30 % à 100 %), via le menu
4. Option **vignette réelle** : la périphérie du champ de vision reste en passthrough

### 4.4 Écran d'accueil
- Bouton « Entrer en réalité mixte »
- Choix de l'itinéraire et de la vitesse de départ
- Rappel de sécurité : clé de sécurité du tapis attachée, main près de la rampe, vitesse modérée

## 5. Contraintes
- **Performance** : viser 72 fps stables sur Quest 3 (limiter la résolution des tuiles, `errorTarget` élevé, frustum culling)
- **Pas de Bluetooth** dans cette version (prévoir néanmoins une interface `SpeedSource` pour brancher plus tard FTMS ou un footpod)
- Code modulaire : `src/xr/`, `src/city/`, `src/route/`, `src/safety/`, `src/ui/`
- Pas de dépendance serveur : application 100 % statique

## 6. Hors périmètre (v0.1)
- Lecture de la vitesse réelle du tapis (Bluetooth / FTMS)
- Choix de direction aux intersections
- Multijoueur, sons d'ambiance, météo

## 7. Critères d'acceptation
- [ ] `npm install && npm run dev` lance un serveur HTTPS accessible depuis le Quest 3 sur le réseau local
- [ ] La session réalité mixte démarre et le passthrough est visible
- [ ] La ville s'affiche et défile le long de l'itinéraire à la vitesse choisie
- [ ] La vitesse se règle à la manette pendant la marche
- [ ] En baissant la tête, la ville s'efface et le tapis réel est visible
- [ ] La zone tapis définie reste transparente
- [ ] L'application fonctionne en mode plan B sans clé Google
- [ ] Fluidité correcte sur Quest 3 (pas de saccades notables)
- [ ] README en français : installation, obtention de la clé Google, accès depuis le Quest 3, contrôles

## 8. Livrables
1. Code source dans ce dossier (`drwil_walk`)
2. `README.md` (français)
3. `.env.example`
4. `routes.json` avec 4 itinéraires : Pune Vieille ville (défaut), Pune FC Road, Doha Corniche MIA → West Bay, Doha Souq Waqif
5. Un court récapitulatif des choix techniques et des limites connues, avec en particulier :
   - la **qualité visuelle à hauteur de piéton** des Google 3D Tiles sur chaque itinéraire (bâtiments flous ou « fondus » ?)
   - les **fps mesurés** sur Quest 3
   - une **recommandation** : rester en WebXR, ou passer à Unity + Cesium for Unity + Meta XR SDK pour la v1

## 9. Méthode de travail demandée à l'agent
- Avancer par étapes et vérifier chaque étape avant de passer à la suivante :
  1. scène three.js + WebXR AR vide avec passthrough
  2. déplacement le long d'un itinéraire
  3. affichage de la ville
  4. sécurité
  5. interface
- Tester dans l'émulateur WebXR à chaque étape
- Signaler clairement ce qui n'a pas pu être testé sur un vrai casque
