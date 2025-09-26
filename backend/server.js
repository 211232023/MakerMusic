const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes'); // Importa as rotas de utilizador
require('dotenv').config(); // Carrega as variáveis do ficheiro .env

const app = express();
const PORT = process.env.PORT || 3000; // A porta onde a sua API irá correr

// Middlewares essenciais
app.use(cors()); // Permite pedidos de outros domínios (o seu frontend)
app.use(express.json()); // Permite que o Express entenda JSON no corpo dos pedidos

// Rota principal da API
app.get('/', (req, res) => {
  res.send('API MakerMusic a funcionar!');
});

// Usa as rotas de utilizador para todos os pedidos que começam com /api/users
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});