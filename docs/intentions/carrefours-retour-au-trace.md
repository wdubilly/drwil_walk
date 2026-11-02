# Intention : revenir au tracé d'origine après un détour aux carrefours

**Statut** : proposée le 2026-11-02 (limite du chantier carrefours-choix).

## Besoin

Quand l'utilisateur a quitté le tracé d'origine à un carrefour, la marche suit le réseau de voies de l'extrait sans plus de
lien avec le tracé : la boucle ne reprend pas au départ et la distance restante et la progression du tableau de bord ne
disent plus rien d'utile. Faut-il pouvoir revenir au tracé (ou en être guidé) ?

## Existant

Lu le 2026-11-02 : `app/src/xr/guide.ts` passe du tracé au réseau au premier choix différent de la rue du tracé, sans retour ;
à chaque carrefour suivant la rue « par défaut » est la plus droite. Le tableau de bord continue de calculer la distance
restante et la progression sur le tracé d'origine à partir de la distance parcourue, et le panneau expose `data-off-route`.
Le réseau est celui de l'extrait, qui ne porte ni sens uniques ni interdictions.

## Questions à trancher

- [decision] Revenir automatiquement au tracé dès qu'on le recroise, proposer une flèche « retour », ou rien ?
- [decision] Que doivent dire la distance restante, la progression et l'arrivée quand on est hors tracé ?
- [decision] La minicarte doit-elle montrer la position hors tracé et le chemin réellement suivi ?
