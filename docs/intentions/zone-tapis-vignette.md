# Intention : zone tapis toujours transparente et vignette réelle

**Statut** : proposée le 2026-10-30.

## Besoin

`MISSION.md` (§ 4.3) prévoit deux protections pas encore codées : la **zone tapis**, un volume défini à la manette
autour du tapis et toujours transparent (sauvegardé en `localStorage`), et l'option **vignette réelle** (la périphérie
du champ de vision reste en passthrough).

## Existant

Lu le 2026-10-30 : `app/src/safety/visibility.ts` couvre le fondu tête baissée et l'opacité bornée. Le point (2) de
`APP-001` (zone tapis) reste en vérification manuelle dans le registre : aucun test ne le prouve.

## Questions à trancher

- [decision] Définir la zone : deux coins pointés à la manette, ou une boîte posée puis ajustée ?
- [decision] Vignette : activée par défaut ou en option ?
- [decision] Une fois la zone codée, retirer le champ Manual d'`APP-001` (contrat entièrement prouvé par ses tests).
