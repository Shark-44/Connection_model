### WORKFLOW

Mon projet est de réaliser un modele de connection reemployable.

Ainsi un backend avec Sequelise pour m'habituer a l'ORM. C'est nouveau pour moi.
Un frontend sous react/typescript pour garder des habitude.

1. Creation d'une mini base de donnée
2. Creation d'un backend minimaliste
3. Creation d'un frontend également minimaliste
4. Hash du password et integration de cors
5. Chapitre sur migrate pour savoir partager ma bdd.
6. Login/logout avec token avec connection soit par username ou email. (ajout de helmet et morgan)
7. Mise en place d'un rate limiting. Apres 3 tentatives bloquage du compte et attente 15 min. C'est un scenario mais qui peut ouvrir a d'autres...