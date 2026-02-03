const { pool } = require('../config/db');
const emailService = require('../services/emailService');

exports.createOrUpdatePayment = async (req, res) => {
  const { studentId, amount, paymentDate, status, description, paymentMethod } = req.body;
  const financeUserId = req.user.id;

  if (!studentId || !amount || !paymentDate || !status) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const insertQuery = `
        INSERT INTO payments (student_id, finance_user_id, amount, description, payment_date, status, payment_method)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(insertQuery, [
      studentId, 
      financeUserId, 
      amount, 
      description || 'Mensalidade Escola MakerMusic', 
      paymentDate, 
      status, 
      paymentMethod || 'BOLETO'
    ]);

    // Lógica de E-mail de Atraso removida do lançamento inicial.
    // O sistema agora permite que a mensalidade nasça como PENDENTE mesmo que o dia 05 já tenha passado.
    // O disparo de e-mail de atraso deve ser feito por um processo separado ou gatilho específico de cobrança.

    res.status(201).json({ message: 'Pagamento registado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registar pagamento:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;

  try {
    // Atualiza o status do pagamento (usado quando o aluno clica em pagar)
    await pool.query('UPDATE payments SET status = ? WHERE id = ?', [status, paymentId]);
    
    if (status === 'PAGO') {
      const [data] = await pool.query(`
        SELECT u.name, u.email, p.amount 
        FROM payments p 
        JOIN users u ON p.student_id = u.id 
        WHERE p.id = ?`, [paymentId]);
      
      if (data.length > 0) {
        // Envia confirmação de pagamento para o aluno
        await emailService.sendPaymentConfirmation(data[0].email, data[0].name, data[0].amount);
      }
    }

    res.json({ message: 'Status atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ message: 'Erro ao atualizar status.' });
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
            `SELECT id, amount, description, payment_date, status, payment_method 
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