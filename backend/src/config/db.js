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

// Nova função para garantir que o pool de ligações está funcional
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Ligação à base de dados estabelecida com sucesso pelo pool.');
    connection.release(); // Devolve a ligação ao pool
  } catch (error) {
    console.error('❌ Falha ao obter ligação do pool:', error);
    throw error; // Lança o erro para impedir o servidor de iniciar se a BD não estiver disponível
  }
};

// Exporta o pool e a função de teste
module.exports = { pool, testConnection };