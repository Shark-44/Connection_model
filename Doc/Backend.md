🚀 Initialisation du Backend — backend-connect

📦 Description

Ce backend gère la logique serveur de l’application Connection_model, utilisant Node.js, Express, et Sequelize pour la gestion de la base de données MySQL.
Il inclut des outils de sécurité et de logs tels que Helmet, Morgan, JWT, et bcrypt pour le chiffrement des mots de passe.

⚙️ Technologies principales

Outil / Lib	Rôle
Express	Framework web minimaliste pour créer les routes et middlewares
Sequelize	ORM pour communiquer avec la base MySQL
MySQL2	Driver MySQL compatible Sequelize
dotenv	Gestion des variables d’environnement via le fichier .env
bcrypt / bcryptjs	Hachage des mots de passe
jsonwebtoken (JWT)	Authentification par token
cookie-parser	Lecture des cookies dans les requêtes
cors	Autorise les connexions cross-origin (ex : depuis le frontend React)
helmet	Protection HTTP contre les vulnérabilités courantes
morgan	Logger HTTP pour suivre les requêtes
nodemon	(en dev) redémarre automatiquement le serveur à chaque modification

🧠 Structure type du backend

backend/
│
├── src/
│   ├── app.js               # Initialisation d’Express, middlewares
│   ├── server.js            # Point d’entrée du serveur
│   ├── controllers/         # Logique métier
│   ├── routes/              # Définition des routes Express
│   ├── models/              # Modèles Sequelize
│   ├── middlewares/         # Middleware d’authentification, validation, etc.
│   └── config/              # Connexion base de données, variables .env
│
├── .env                     # Variables d’environnement (non versionné)
├── package.json
└── README.md
