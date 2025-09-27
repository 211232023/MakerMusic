const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Esta linha agora vai funcionar corretamente
const { testConnection } = require('./src/config/db'); 

const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);

const startServer = async () => {
  try {
    // Agora a função testConnection será encontrada e executada
    await testConnection(); 
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor a correr na porta ${PORT}`);
    });
  } catch (error) {
    console.error('🚫 Falha ao iniciar o servidor. Verifique a ligação com a base de dados.');
  }
};

startServer();