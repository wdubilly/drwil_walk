# Intention : une mention OpenStreetMap plus discrète dans le casque

**Statut** : proposée le 2026-11-01.

## Besoin

Le demandeur trouve gênante la mention « © contributeurs OpenStreetMap » incrustée dans le casque et demande si on peut
l'enlever. La retirer n'est pas possible : les données sont sous licence ODbL, dont l'attribution est une obligation
(`APP-003`). Reste à la rendre plus discrète sans enfreindre la règle.

## Existant

Lu le 2026-11-01 (`app/src/city/attribution.ts`, `docs/contracts.md` `APP-003`) :

- La mention est un panneau de 1024 sur 128 px dessiné dans la scène, posé devant l'utilisateur à 1,0 m de hauteur, hors de la
  zone tapis, et effacé avec la ville (fondu `APP-001`). Il est exempté de la découpe de la zone tapis.
- Le contrat `APP-003` exige la mention à l'accueil, dans le panneau de marche de la page et dans le casque ; en rendu Google 3D,
  la mention de Google s'y ajoute.
- Le guide d'attribution de la fondation OpenStreetMap (`osmfoundation.org/wiki/Licence/Attribution_Guidelines`, lu le
  2026-11-01) dit : le texte doit citer « OpenStreetMap » et indiquer la licence ODbL (lien vers `openstreetmap.org/copyright`) ;
  il doit rester lisible et proche de l'œuvre ; une carte interactive peut l'atténuer ou la réduire après une interaction ou au
  bout de cinq secondes, à condition que la licence reste facile à trouver (bouton « (i) » ou rubrique « À propos ») ; pour un
  jeu, un écran de démarrage, les crédits ou un menu conviennent. Le guide ne traite pas explicitement la réalité mixte ni les
  casques. L'auteur de cette note n'est pas juriste.

## Questions à trancher

- [decision] Faut-il garder la mention dans le casque pendant la marche, ou la montrer seulement au départ (quelques secondes)
  puis l'atténuer, en la laissant à l'accueil et dans un écran de crédits ? Cela change le texte de `APP-003`.
- [decision] Si elle reste dans le casque : où la poser (près du panneau d'infos, sur le côté, en bas) et avec quelle opacité
  et quelle taille, sans qu'elle gêne ni masque le tapis (`APP-001`) ?
- [decision] Un avis extérieur est-il souhaitable (fondation OpenStreetMap ou juriste) avant de réduire la présence de la
  mention dans le casque, puisque le guide ne couvre pas ce cas ?
- Si la mention de Google s'y ajoute un jour (rendu Google 3D), les conditions de Google sont à lire séparément ; elles ne sont
  pas couvertes ici.
