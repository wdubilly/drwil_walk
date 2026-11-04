# Intention : appuyer les palettes de façades par région sur des références, et affiner les fenêtres de région

**Statut** : proposée le 2026-11-04 (limite du chantier facades-regions).

## Besoin

Les palettes de détails par région (`APP-008`, `app/src/city/facade-palettes.ts`) ont été choisies par l'agent, d'après des
traits connus de chaque région (travertin et ocres romains, tuf rose d'Erevan, pierre de taille et zinc parisiens, chaux et
couleurs vives de Pune, enduits sable de Doha), sans photo ni source documentée. Les régions se déduisent de fenêtres de
latitude et de longitude volontairement larges : elles débordent sur des pays voisins (l'est de la Turquie dans
« Caucase », le sud de l'Iran dans « Golfe », la Corse dans « Italie ») et laissent des trous (Lyon, entre Provence et
France du Nord, retombe sur le jeu de base).

## Existant

Lu le 2026-11-04 : six fenêtres dans `regionOf` (`app/src/city/facade-family.ts`), la première qui contient l'origine
l'emporte ; trois palettes par famille et par région ; repli « ailleurs » sur les palettes d'avant les régions. L'intention
`docs/intentions/identite-visuelle-quartiers.md` décrit une méthode par photos de rue (Panoramax) pour le souk, qui pourrait
servir ici.

## Questions à trancher

- [decision] Les teintes de chaque région doivent-elles être tirées de photos de rue (méthode de `APP-012`) ou relues par le
  demandeur sur captures (jointes au rapport de l'e2e `app/e2e/facades-batiments.test.ts`) ?
- [decision] Faut-il des régions plus fines (une par pays, ou par ville), ou des polygones plutôt que des fenêtres ?
- Une ville de France entre Provence et France du Nord (Lyon) doit-elle recevoir un jeu à elle ?
