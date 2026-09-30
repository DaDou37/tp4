## API Tasks

API REST réalisée avec node.js, Express et PostgreSQL, avec une environnement Docker. 

## Installation 

Installer les dépendance:
- npm install

Lancer le projet: 
- docker compose up -d --build

L'api est disponible sur: 
- http://localhost:3000

GET    /tasks                Récupere les tâches
POST   /tasks                Ajoute une tâches
PUT    /tasks/:id            modifie une tâche
PATCH  /tasks/:id/completed  modifie un statue
DELETE /tasks/:id            supprime une tache 

## Base de donnée
PostgreSql est lancé avec docker 
Database: api
user: david
password: david
port: 5432

Les données sont stocké dans PostegreSQL grâce au volume docker 
