const { pool } = require('../config/db');

exports.createOrUpdatePayment = async (req, res) => {
  const { studentId, amount, paymentDate, status, description } = req.body;
  const financeUserId = req.user.id;

  if (!studentId || !amount || !paymentDate || !status) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const insertQuery = `
        INSERT INTO payments (student_id, finance_user_id, amount, description, payment_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    await pool.query(insertQuery, [studentId, financeUserId, amount, description || 'Mensalidade', paymentDate, status]);

    res.status(201).json({ message: 'Pagamento registado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registar pagamento:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await pool.query(
            'SELECT id, name, email FROM users WHERE role = "ALUNO" ORDER BY name ASC'
        );
        res.json(students);
    } catch (error) {
        console.error('Erro ao buscar todos os alunos:', error);
        res.status(500).json({ message: 'Erro no servidor ao buscar alunos.' });
    }
};

exports.getMyPayments = async (req, res) => {
    const studentId = req.user.id;
    try {
        const [payments] = await pool.query(
            `SELECT id, amount, description, payment_date, status 
             FROM payments 
             WHERE student_id = ? 
             ORDER BY payment_date DESC`,
            [studentId]
        );
        res.json(payments);
    } catch (error) {
        console.error('Erro ao buscar pagamentos:', error);
        res.status(500).json({ message: 'Erro no servidor.' });
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