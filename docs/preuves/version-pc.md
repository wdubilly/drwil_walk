# Preuve de clôture — version-pc

**Clos le** : 2026-11-02
**Commit vérifié** : `065d16eac0` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| À l'accueil, un bouton « Version PC » lance la marche dans un canvas de la page, sans session WebXR : même ville, même parcours et même vitesse que dans le casque | `APP-002` | `app-002` | — |
| La version PC se pilote au clavier et à la souris : pause et reprise, vitesse plus et moins dans la plage de 1 à 8 km/h, recalage du parcours, masquage du panneau, regard à la souris ; une pression ne déclenche qu'une action | `APP-002` | `app-002` | — |
| Les itinéraires figés et le trajet libre marchent en version PC, le trajet libre s'arrête à l'arrivée en le disant | `APP-002` | `app-002` | — |
| Un navigateur sans WebXR peut lancer la version PC : l'échec de la réalité mixte reste dit pour le bouton du casque, il ne bloque plus l'application | `QUA-002` | `lint-app` | — |
| Le bouton du casque continue d'ouvrir une session immersive-ar avec le fondu tête baissée, la zone tapis et la vignette ; la version PC n'ouvre jamais de session WebXR et ne les applique pas, faute de passthrough ni de tapis [humain] | `APP-001` | `app-001` | — |
| Le parcours est rejoué de bout en bout dans Chromium en version PC, sans émulation WebXR | `QUA-020` | `e2e` | — |
