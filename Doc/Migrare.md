MIGRATE.md
Introduction

Ce document explique comment un collaborateur peut intégrer la base de données du projet et travailler avec les migrations Sequelize.
L’objectif est d’assurer que tous les développeurs ont la même structure de base, sans avoir besoin d’importer des dumps SQL manuellement.

1. Prérequis

Node.js installé

Base de données MySQL (ou MariaDB) locale

Projet cloné depuis Git

2. Configuration de l’environnement

Copier .env.example en .env :

### Sous Linux / macOS / Git Bash
```bash
cp .env.example .env
```
Modifier les variables .env pour correspondre à la configuration locale :