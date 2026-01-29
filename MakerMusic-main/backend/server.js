const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// --- NOVA LÓGICA PARA VÍDEOS (RANGE REQUESTS) ---
// O Android exige que o servidor suporte pedidos parciais (bytes) para reproduzir vídeos.
app.get('/uploads/:filename', (req, res, next) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    const ext = path.extname(filePath).toLowerCase();
    
    // Se não for vídeo, deixa o express.static normal lidar
    if (!['.mp4', '.mov', '.m4v', '.3gp', '.mkv'].includes(ext)) {
        return next();
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Arquivo não encontrado');
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4', // Ajuste conforme necessário ou use mime-types
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
});

// Servir arquivos estáticos da pasta uploads (para imagens e outros)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    console.error('🚫 Falha ao iniciar o servidor.');
    console.error(error);
  }
};

startServer();