const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST, // Nom du service de la base de données dans docker-compose.yml
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
module.exports = pool;