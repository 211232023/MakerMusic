const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.post('/', authMiddleware, authorize(['ADMIN', 'FINANCEIRO']), financeController.createOrUpdatePayment);

router.get('/my-payments', authMiddleware, authorize(['ALUNO']), financeController.getMyPayments);

router.get('/students', authMiddleware, authorize(['ADMIN', 'FINANCEIRO']), financeController.getAllStudents);

module.exports = router;