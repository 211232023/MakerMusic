// Exemplo de como configurar a ligação no Node.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Utilizador padrão do XAMPP
  password: '',   // Senha padrão do XAMPP é vazia
  database: 'makermusic_db'
});

module.exports = pool;