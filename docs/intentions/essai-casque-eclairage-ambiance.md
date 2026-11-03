# Intention : juger l'éclairage, le brouillard et les sons d'ambiance sur un vrai Quest 3 (lot 4 de rendu-eclairage-ambiance)

**Statut** : proposée le 2026-11-03.

## Besoin

Juger, sur un vrai Quest 3 et en marchant, ce qu'aucun test ne peut voir : la lumière de l'heure réelle est-elle crédible mêlée
au passthrough (matin, midi, soir, nuit) ; le brouillard plafonné à 0,15 apporte-t-il de la profondeur sans jamais gêner la vue
du tapis, de la rampe ou du bouton d'arrêt ; les sons d'ambiance, une fois montés, laissent-ils entendre le tapis, la pièce et
une personne qui parle.

## Existant

Lu le 2026-11-03 : la lumière, le ciel, le brouillard et les sons sont livrés et prouvés par des tests (`APP-011`), rejoués dans
un Quest 3 émulé (`app/e2e/eclairage-ambiance.test.ts`). Le plafond de voile (0,15), le seuil de 8 m sans brouillard, le gain
sonore maximal (0,2) et les teintes du jour sont des choix de l'agent, jamais vus ni entendus au casque.

## Questions à trancher

- [decision] La lumière de l'heure réelle est-elle crédible mêlée au passthrough, ou faut-il décaler ou adoucir la courbe ?
- [decision] Le brouillard à 0,15 se voit-il assez pour servir à quelque chose, et le tapis reste-t-il parfaitement visible ?
- [decision] Le gain sonore maximal (0,2) laisse-t-il entendre le tapis et la pièce, ou faut-il le baisser encore ?
- Faut-il garder les sons coupés par défaut une fois le confort jugé, ou proposer un volume faible d'emblée ?
