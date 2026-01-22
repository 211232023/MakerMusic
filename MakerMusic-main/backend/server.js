const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./src/config/db'); 

const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const financeRoutes = require('./src/routes/financeRoutes'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/schedules', scheduleRoutes); 
app.use('/api/attendance', attendanceRoutes);  
app.use('/api/finance', financeRoutes);

const startServer = async () => {
  try {
    await testConnection(); 
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor a correr na porta ${PORT}`);
    });
  } catch (error) {
    console.error('🚫 Falha ao iniciar o servidor. Verifique a ligação com a base de dados.');
    console.error(error);
  }
};

startServer();
