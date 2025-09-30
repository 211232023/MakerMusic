const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

// Rota para Admin/Financeiro criar ou atualizar um pagamento
router.post('/', authMiddleware, authorize(['ADMIN', 'FINANCEIRO']), financeController.createOrUpdatePayment);

// Rota para o Aluno ver os seus pagamentos
router.get('/my-payments', authMiddleware, authorize(['ALUNO']), financeController.getMyPayments);

module.exports = router;