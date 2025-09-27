require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const { testConnection } = require('./src/config/db'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

// Nova função assíncrona para iniciar o servidor
const startServer = async () => {
  try {
    // 1. Primeiro, tenta ligar-se à base de dados
    await testConnection();

    // 2. Se a ligação for bem-sucedida, e só então, inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor pronto e a correr na porta ${PORT}`);
    });
  } catch (error) {
    // Se a ligação à BD falhar, o servidor não inicia
    console.error('🚫 Falha ao iniciar o servidor. Verifique a ligação com a base de dados.');
    process.exit(1); // Encerra o processo com um código de erro
  }
};

// Chama a função para iniciar tudo
startServer();