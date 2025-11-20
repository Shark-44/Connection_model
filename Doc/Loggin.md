# La journalisation ou loggin

C'est un sujet que je decouvre dans mon évolution. Certes je connais l'intérêt dans les logiciels et j'ai cherché comment implementer dans mon API backend. Certes j'ai demandé a une IA pour me faire une image et c'est la raison pour laquelle j'ai choisi la lib WINSTON  https://github.com/winstonjs/winston 

## l'implementation

Oui c'est la premiere question dans cette installation. J'ai compris qu'il me fallait un fichier logger.js pour configurer, un dossier de stockage logs et le lancer dans app.js.

La seconde question fut de logger quoi? pourquoi? et comment? tout en gardant au fond de ma tête la reglementation RGPD.

1. Pourquoi journaliser ?

Traçabilité : Savoir qui a fait quoi et quand.
Débogage : Identifier rapidement les problèmes en production.
Sécurité : Détecter les tentatives suspectes (ex : échecs de login répétés).
Analyse : Comprendre l’usage de l’API et optimiser les performances.

2. Quoi Journaliser ?

Le bon fonctionnement de mon API par les endpoints dans les routers
La journalisation des erreurs dans mon gestionnaire ErrorHandler.
Les metadonnées qui sont aussi une tracabilité d'un user, d'une ip etc ...

Mais attention le RGPD! Il ne faut pas logger :

Les mots de passe
Les tokens JWT
Les données de santé, données sensibles
Les emails et identifiants complets si ce n’est pas nécessaire

3. Comment journaliser ?

