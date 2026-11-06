# Intention : juger les commandes de la manette et le panneau d'infos sur un vrai Quest 3

**Statut** : proposée le 2026-11-01 (reste du chantier commandes-panneau, lot 5, réservé à l'humain).

## Besoin

Juger au casque ce que l'e2e émulé ne voit pas : le panneau d'infos (vitesse, distance, temps, lieu) est-il lisible, bien
placé dans le champ de vision, et le tapis reste-t-il visible ? La gâchette, A et B répondent-ils comme prévu (un appui,
une action) sur de vraies manettes Touch ?

## Existant

Actualisé le 2026-11-05 : le panneau est un texte flottant (`app/src/xr/hud-panel.ts`), posé en bas du champ de vision,
côté choisi en marche (1,1 m, 28° du regard, 31 cm sous les yeux, `app/src/xr/pose.ts`),
de 50 cm de large, soumis au fondu de la ville (disparaît
tête baissée au-delà de 25° à 40°, `APP-001`). Boutons lus aux index « xr-standard » 0, 4 et 5 (`app/src/xr/buttons.ts`),
seuil d'appui à 0,5. Le recalage reprend l'endroit et le cap du regard sans toucher à la distance. Tout cela est un choix
de l'agent, jamais vu au casque. Le panneau suit le cap du regard à chaque image, sans lissage.
Le panneau des préférences (`app/src/xr/preference-panel.ts`) le remplace pendant son ouverture, par la gâchette
gauche ; rayon et prise droite choisissent les commandes. Même placement sûr, exclusion de la zone tapis et fondu ;
aucune interaction lorsque le panneau est caché. Après modification de la règle APP-001 par le recentrage,
son ancienne attestation est caduque : cet essai humain est requis avant la clôture du chantier.

## Questions à trancher

- [decision] Distance, taille, hauteur et police du panneau : lisibles, ou à régler ? Le suivi du cap sans lissage est-il gênant ?
- [decision] Le tapis reste-t-il visible, avec le panneau affiché, en marchant et tête baissée (`APP-001`) ?
- [decision] Les index de boutons (gâchette 0, A 4, B 5) et le seuil d'appui conviennent-ils sur les manettes Touch du Quest 3 ?
- [human] Les préférences sont-elles lisibles et sélectionnables par rayon et prise droite, y compris après changement
  de côté, sans masquer le tapis ? Vérifier aussi tête baissée et dans une zone trop grande pour placer le panneau.
- [decision] Faut-il dire l'état de pause dans le casque autrement que par « PAUSE » dans le panneau (par exemple si le panneau est masqué) ?
- [decision] L'essai se joint-il à `docs/intentions/essai-casque-osm-enrichi.md` et
  `docs/intentions/essai-casque-zone-tapis.md` ?
