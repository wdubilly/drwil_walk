# Intention : juger le tableau de bord de marche sur un vrai Quest 3

**Statut** : proposée le 2026-11-01 (reste du chantier hud-tableau-de-bord, lot 4, réservé à l'humain).

## Besoin

Juger au casque ce que l'e2e émulé ne voit pas : le tableau de bord (cap, heure, lieu, vitesse, durée, distance, calories) est-il
lisible, bien placé, et le tapis reste-t-il visible quand il est affiché ? Se masque-t-il au bouton B et disparaît-il tête baissée ?

## Existant

Lu le 2026-11-01 : un seul panneau de 0,6 m sur 0,3 m, posé à 1,2 m devant le regard et 0,2 m sous les yeux (`app/src/xr/pose.ts`,
`app/src/xr/hud-panel.ts`), dont le bord bas reste au-dessus de la zone tapis par défaut (1,2 m) pour une tête à 1,6 m ; texte
de 34 à 60 px sur 640 px ; fondu de la ville (`APP-001`). Tout cela est un choix de l'agent, jamais vu au casque. Les critères de
la fiche citant `APP-001` (reste hors de la zone tapis) sont à juger par l'humain, qui doit aussi attester le contrat.

## Questions à trancher

- [decision] Le texte est-il lisible à 72 images par seconde, en marchant, et le tableau de bord bien placé (taille, hauteur, distance) ?
- [decision] Le tapis reste-t-il visible, y compris avec une zone tapis réglée plus haute que la boîte par défaut ?
- [decision] La mise en page d'un seul panneau convient-elle, ou faut-il l'éclater comme la maquette (statistiques à gauche, boussole en haut, heure à droite) ?
