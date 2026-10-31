# Preuve de clôture — guide-installation

**Clos le** : 2026-10-31
**Commit vérifié** : `38b867db2e` — verdict `drwil verify` : PASS

critères de ce chantier, et ce qui les prouve aujourd'hui encore (rejoués par `drwil verify` après la clôture) :

| Critère | Contrat | Contrôle | Empreinte des fichiers couverts |
|---|---|---|---|
| Le guide utilisateur (nouveau fichier, voir le bloc scope) décrit pas à pas : prérequis (Node, poste et Quest 3 sur le même réseau), lancer l'application, ouvrir l'adresse Network dans le navigateur du Quest, accepter le certificat auto-signé, entrer en réalité mixte, choisir l'itinéraire, régler la vitesse | `QUA-011` | `docs-references` | — |
| Il explique l'installation du tapis et la **sécurité** : zone dégagée, rappel de l'accueil, fondu de la ville quand on baisse la tête, la ville n'est jamais un substitut à la vigilance [humain] | `APP-001` | `app-001` | — |
| Il liste les ennuis connus avec leur remède (certificat, bouton grisé sans WebXR, casque sur un autre réseau) | `QUA-011` | `docs-references` | — |
| Chaque commande citée est exécutée telle quelle avant d'être écrite (preuve avant affirmation) ; ce qui n'a pu être essayé sans casque est signalé « non vérifié » | `QUA-011` | `docs-references` | — |
| README.md et INSTALL.md renvoient au guide, sans en copier le contenu (une information, une source) | `QUA-011` | `docs-references` | — |
