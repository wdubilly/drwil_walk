# Recipe: add a frontend screen

Goal: add a screen consistent with the existing ones.

Steps:
1. Reuse the existing screen pattern
2. Strict typing
3. User-focused tests (roles, texts)
4. Check access per role
5. Run the checks
6. Si la fonction agit sur la ville (option d'accueil, rendu), la vérifier sur les trois modes, casque, PC et tablette :
   ajouter l'option au test `app/src/xr/parity.test.ts` (APP-015) ; seules différences admises : commandes, passthrough
   au casque, ciel, profils par défaut
