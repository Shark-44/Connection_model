🚀 Initialisation du Frontend — frontend-connect

🧩 Description

Le dossier frontend-connect contient la partie interface utilisateur (React) du projet Connection_model.
Il utilise Vite pour le bundling, TypeScript pour la robustesse, et i18next pour la gestion multilingue.
Ce frontend communique avec le backend via un wrapper d’API générique basé sur Axios, selon les principes de Clean Architecture.

⚙️ Stack technique

Outil / Lib	Rôle
React 19:	Librairie UI moderne
Vite:	Build rapide et serveur de dev ultra-léger
TypeScript:	Typage statique pour fiabilité et maintenabilité
Axios:	Requêtes HTTP avec wrapper customisé
react-router-dom:	Gestion des routes
i18next + react-i18next:	Traductions et internationalisation
ESLint + TypeScript-ESLint:	Linting et cohérence du code
i18n: dossier local	Contient les fichiers de langue pour gérer les erreurs et les messages utilisateurs

🧱 Structure recommandée

frontend/
│
├── src/
│   ├── api/
│   │   ├── axiosInstance.ts       # Configuration Axios (baseURL, cookies, etc.)
│   │   ├── apiWrapper.ts          # Gestion des erreurs, standardisation des appels
│   │   └── userService.ts         # Appels API liés aux utilisateurs
│   │
│   ├── components/
│   │   ├── RegisterCard.tsx       # Formulaire d'inscription
│   │   └── LoginCard.tsx          # Formulaire de connexion
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │  
│   │
│   ├── types/
│   │   └── types.ts               # Interfaces TypeScript (ex: User)
│   │
│   ├── i18n/
│   │   ├── fr/
│   │   │   └── errors.json
│   │   └── en/
│   │       └── errors.json
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── .env
├── package.json
└── tsconfig.json

snippet onChange

Mon code :
onChange={(e) => {
  const value = e.target.value.trimStart(); // empêche les espaces au début
  if (!/[<>]/.test(value)) setUsername(value); // bloques les caractères dangereux (< et >) pour éviter des injections HTML (XSS)
}}

Evolution futur un helper réutilisable 

export const sanitizeInput = (value: string) =>
  value.trimStart().replace(/[<>]/g, '');

Ainsi :

onChange={(e) => setUsername(sanitizeInput(e.target.value))}

🧩 À propos de ta Clean Architecture


apiWrapper.ts → centralise la logique de requêtes, gestion des erreurs globales, i18n

axiosInstance.ts → configure Axios (baseURL, headers, cookies)

userService.ts → déclare les appels métier (login, logout, createUser)

