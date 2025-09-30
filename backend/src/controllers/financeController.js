const { pool } = require('../config/db');

// Admin define ou atualiza um pagamento para um aluno
exports.createOrUpdatePayment = async (req, res) => {
  const { studentId, amount, paymentDate, status, description } = req.body;
  const financeUserId = req.user.id; // ID do Admin/Financeiro logado

  if (!studentId || !amount || !paymentDate || !status) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Usamos "ON DUPLICATE KEY UPDATE" para criar um novo pagamento ou atualizar um existente
    // para um aluno em um determinado mês/ano.
    // Vamos usar o primeiro dia do mês como identificador único.
    const paymentMonth = new Date(paymentDate).toISOString().slice(0, 7) + '-01';

    const query = `
      INSERT INTO payments (student_id, finance_user_id, amount, description, payment_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        amount = VALUES(amount), 
        status = VALUES(status), 
        description = VALUES(description),
        finance_user_id = VALUES(finance_user_id);
    `;
    
    // Precisamos de uma forma de identificar o pagamento para o ON DUPLICATE KEY UPDATE funcionar.
    // Vamos adicionar uma coluna 'payment_identifier' (ex: '2023-10') na tabela 'payments'
    // Por agora, vamos simplificar e apenas inserir, assumindo um pagamento por vez.
    
    const insertQuery = `
        INSERT INTO payments (student_id, finance_user_id, amount, description, payment_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(insertQuery, [studentId, financeUserId, amount, description, paymentDate, status]);

    res.status(201).json({ message: 'Pagamento registado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registar pagamento:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const [payments] = await db.query('SELECT * FROM payments WHERE user_id = ?', [req.user.id]);

    const formattedPayments = payments.map(payment => ({
      ...payment,
      amount: parseFloat(payment.amount) 
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).send('Erro no servidor');
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const [payments] = await db.query('SELECT p.*, u.name as user_name FROM payments p JOIN users u ON p.user_id = u.id');

    const formattedPayments = payments.map(payment => ({
        ...payment,
        amount: parseFloat(payment.amount)
    }));

    res.json(formattedPayments);
  } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar pagamentos' });
  }
};