const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Ligação à base de dados estabelecida com sucesso pelo pool.');
    connection.release();
  } catch (error) {
    console.error('❌ Falha ao obter ligação do pool:', error);
    throw error;
  }
};

module.exports = { pool, testConnection };