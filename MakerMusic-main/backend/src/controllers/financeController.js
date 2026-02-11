const { pool } = require('../config/db');
const emailService = require('../services/emailService');

/**
 * Constantes de Configuração
 */
const ANTECEDENCIA_MINIMA_DIAS = 10; // Dias mínimos entre emissão e vencimento
const DIA_FIXO_PADRAO = 5; // Dia fixo padrão para vencimento

/**
 * Calcula a data de vencimento dinâmica com antecedência mínima
 * Integra as duas pesquisas fornecidas:
 * 1. Pesquisa 1: Dia fixo e consideração de dias úteis
 * 2. Pesquisa 2: Antecedência mínima de 10-15 dias entre emissão e vencimento
 * 
 * @param {Date} dataEmissao - Data de emissão/lançamento da mensalidade
 * @param {number} fixedDay - Dia fixo do mês para vencimento (1-28)
 * @param {number} antecedenciaMinima - Dias mínimos de antecedência (padrão: 10)
 * @param {Array<Date>} holidays - Array de datas de feriados (opcional)
 * @returns {Date} Data de vencimento calculada
 */
function calculateDueDate(dataEmissao, fixedDay = DIA_FIXO_PADRAO, antecedenciaMinima = ANTECEDENCIA_MINIMA_DIAS, holidays = []) {
  // Cópia da data para não alterar o original
  const emissao = new Date(dataEmissao);
  
  // Criar data de vencimento com o dia fixo do mês atual
  let vencimento = new Date(emissao.getFullYear(), emissao.getMonth(), fixedDay);
  
  // Calcular a diferença em dias entre emissão e vencimento
  const diffEmissaoVencimento = (vencimento - emissao) / (1000 * 60 * 60 * 24);
  
  console.log(`[DEBUG] Data Emissão: ${formatDateBR(emissao)}`);
  console.log(`[DEBUG] Data Vencimento Inicial: ${formatDateBR(vencimento)}`);
  console.log(`[DEBUG] Diferença em dias: ${diffEmissaoVencimento}`);
  console.log(`[DEBUG] Antecedência Mínima Requerida: ${antecedenciaMinima} dias`);
  
  // REGRA: Se a diferença for menor que a antecedência mínima, pula para o próximo mês
  if (diffEmissaoVencimento < antecedenciaMinima) {
    console.log(`[DEBUG] Diferença (${diffEmissaoVencimento.toFixed(1)}) < Antecedência Mínima (${antecedenciaMinima}). Pulando para próximo mês.`);
    vencimento.setMonth(vencimento.getMonth() + 1);
  }
  
  // Ajustar para dia útil se necessário (evitar finais de semana e feriados)
  vencimento = adjustToBusinessDay(vencimento, holidays);
  
  console.log(`[DEBUG] Data Vencimento Final: ${formatDateBR(vencimento)}`);
  
  return vencimento;
}

/**
 * Ajusta uma data para o próximo dia útil se cair em fim de semana ou feriado
 * @param {Date} date - Data a ser ajustada
 * @param {Array<Date>} holidays - Array de datas de feriados
 * @returns {Date} Data ajustada para dia útil
 */
function adjustToBusinessDay(date, holidays = []) {
  const dayOfWeek = date.getDay();
  let adjustedDate = new Date(date);
  
  // Converter feriados para formato comparable (sem hora)
  const holidayStrings = holidays.map(h => h.toDateString());
  
  // Verificar se é fim de semana (0 = domingo, 6 = sábado)
  if (dayOfWeek === 0) {
    console.log(`[DEBUG] Data caiu em domingo. Ajustando para segunda-feira.`);
    adjustedDate.setDate(adjustedDate.getDate() + 1); // Segunda-feira
  } else if (dayOfWeek === 6) {
    console.log(`[DEBUG] Data caiu em sábado. Ajustando para segunda-feira.`);
    adjustedDate.setDate(adjustedDate.getDate() + 2); // Segunda-feira
  }
  
  // Verificar se é feriado e ajustar recursivamente
  if (holidayStrings.includes(adjustedDate.toDateString())) {
    console.log(`[DEBUG] Data é feriado. Ajustando para próximo dia.`);
    adjustedDate.setDate(adjustedDate.getDate() + 1);
    return adjustToBusinessDay(adjustedDate, holidays);
  }
  
  return adjustedDate;
}

/**
 * Formata a data para o padrão brasileiro (DD/MM/YYYY)
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
function formatDateBR(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formata a data para o padrão SQL (YYYY-MM-DD)
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data formatada para SQL
 */
function formatDateSQL(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Busca os feriados do banco de dados para o ano especificado
 * @param {number} year - Ano para buscar feriados
 * @returns {Promise<Array>} Array de datas de feriados
 */
async function getHolidaysForYear(year) {
  try {
    const [holidays] = await pool.query(
      'SELECT holiday_date FROM holidays WHERE YEAR(holiday_date) = ? ORDER BY holiday_date',
      [year]
    );
    return holidays.map(h => new Date(h.holiday_date));
  } catch (error) {
    console.warn('Aviso: Não foi possível buscar feriados do banco de dados:', error.message);
    return []; // Retorna array vazio se a tabela não existir
  }
}

/**
 * Busca a configuração de antecedência mínima do banco de dados
 * @returns {Promise<number>} Dias mínimos de antecedência
 */
async function getAntecedenciaMinima() {
  try {
    // Nota: A tabela payment_settings no SQL fornecido não possui a coluna antecedencia_minima.
    // Usamos o valor padrão de 10 dias conforme a regra de negócio.
    return ANTECEDENCIA_MINIMA_DIAS;
  } catch (error) {
    console.warn('Aviso: Usando antecedência mínima padrão:', ANTECEDENCIA_MINIMA_DIAS);
    return ANTECEDENCIA_MINIMA_DIAS;
  }
}

/**
 * Cria ou atualiza um pagamento (mensalidade) com vencimento dinâmico
 * Implementa a lógica consolidada das duas pesquisas
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.createOrUpdatePayment = async (req, res) => {
  const { studentId, amount, status, description, paymentMethod, fixedDueDay = DIA_FIXO_PADRAO } = req.body;
  const financeUserId = req.user.id;

  // Validação de campos obrigatórios
  if (!studentId || !amount || !status) {
    return res.status(400).json({ 
      message: 'Todos os campos são obrigatórios: studentId, amount, status.' 
    });
  }

  // Validação do dia fixo (deve estar entre 1 e 28)
  if (fixedDueDay < 1 || fixedDueDay > 28) {
    return res.status(400).json({ 
      message: 'O dia fixo de vencimento deve estar entre 1 e 28.' 
    });
  }

  try {
    // Data de emissão (data atual do servidor)
    const dataEmissao = new Date();
    
    // Buscar configurações do banco de dados
    const antecedenciaMinima = await getAntecedenciaMinima();
    const holidays = await getHolidaysForYear(dataEmissao.getFullYear());
    
    console.log(`\n[LANÇAMENTO DE MENSALIDADE]`);
    console.log(`Aluno ID: ${studentId}`);
    console.log(`Valor: R$ ${parseFloat(amount).toFixed(2)}`);
    console.log(`Data de Emissão: ${formatDateBR(dataEmissao)}`);
    
    // Calcular a data de vencimento dinamicamente com antecedência mínima
    const calculatedDueDate = calculateDueDate(dataEmissao, fixedDueDay, antecedenciaMinima, holidays);
    
    // Formatar a data para o banco de dados (YYYY-MM-DD)
    const dueDateFormatted = formatDateSQL(calculatedDueDate);
    
    // Calcular dias até o vencimento
    const daysUntilDue = Math.ceil((calculatedDueDate - dataEmissao) / (1000 * 60 * 60 * 24));

    // Query de inserção
    const insertQuery = `
        INSERT INTO payments (student_id, finance_user_id, amount, description, payment_date, status, payment_method)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Executar inserção
    const result = await pool.query(insertQuery, [
      studentId, 
      financeUserId, 
      amount, 
      description || 'Mensalidade Escola MakerMusic', 
      dueDateFormatted,  // Data calculada dinamicamente com antecedência
      status, 
      paymentMethod || 'BOLETO'
    ]);

    // Buscar dados do aluno para enviar notificação
    const [studentData] = await pool.query(
      'SELECT name, email FROM users WHERE id = ?',
      [studentId]
    );

    // Enviar e-mail de notificação de nova mensalidade
    if (studentData.length > 0) {
      const student = studentData[0];
      
      // Enviar notificação ao aluno com a data correta
      if (emailService && emailService.sendUpcomingDueNotice) {
        await emailService.sendUpcomingDueNotice(
            student.email,
            student.name,
            amount,
            calculatedDueDate,
            daysUntilDue
        );
      }
    }

    // Log de sucesso
    console.log(`✅ Mensalidade lançada com sucesso!`);
    console.log(`Vencimento: ${formatDateBR(calculatedDueDate)} (${daysUntilDue} dias)`);
    console.log(`---\n`);

    // Resposta de sucesso com informações da data calculada
    res.status(201).json({ 
      message: 'Pagamento registado com sucesso!',
      paymentId: result[0].insertId,
      dueDate: formatDateBR(calculatedDueDate),
      dueDateISO: dueDateFormatted,
      daysUntilDue: daysUntilDue,
      fixedDueDay: fixedDueDay,
      antecedenciaMinima: antecedenciaMinima,
      emissionDate: formatDateBR(dataEmissao)
    });

  } catch (error) {
    console.error('Erro ao registar pagamento:', error);
    res.status(500).json({ 
      message: 'Erro no servidor ao registar pagamento.',
      error: error.message 
    });
  }
};

/**
 * Atualiza o status de um pagamento
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.updatePaymentStatus = async (req, res) => {
  const { paymentId } = req.params;
  const { status } = req.body;

  // Validação de campos obrigatórios
  if (!status) {
    return res.status(400).json({ message: 'O status é obrigatório.' });
  }

  try {
    // Atualizar o status do pagamento
    await pool.query('UPDATE payments SET status = ? WHERE id = ?', [status, paymentId]);
    
    // Se o status for PAGO, enviar confirmação
    if (status === 'PAGO') {
      const [data] = await pool.query(`
        SELECT u.name, u.email, p.amount 
        FROM payments p 
        JOIN users u ON p.student_id = u.id 
        WHERE p.id = ?`, [paymentId]);
      
      if (data.length > 0) {
        // Enviar confirmação de pagamento para o aluno
        if (emailService && emailService.sendPaymentConfirmation) {
            await emailService.sendPaymentConfirmation(data[0].email, data[0].name, data[0].amount);
        }
      }
    }

    res.json({ 
      message: 'Status atualizado com sucesso!',
      paymentId: paymentId,
      newStatus: status
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar status do pagamento.',
      error: error.message 
    });
  }
};

/**
 * Obtém todos os alunos cadastrados
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await pool.query(
            'SELECT id, name, email FROM users WHERE role = "ALUNO" ORDER BY name ASC'
        );
        res.json(students);
    } catch (error) {
        console.error('Erro ao buscar todos os alunos:', error);
        res.status(500).json({ 
          message: 'Erro no servidor ao buscar alunos.',
          error: error.message 
        });
    }
};

/**
 * Obtém os pagamentos do aluno autenticado
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
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
        
        // Formatar as datas para o padrão brasileiro
        const formattedPayments = payments.map(payment => ({
          ...payment,
          payment_date: formatDateBR(new Date(payment.payment_date))
        }));
        
        res.json(formattedPayments);
    } catch (error) {
        console.error('Erro ao buscar pagamentos:', error);
        res.status(500).json({ 
          message: 'Erro no servidor ao buscar pagamentos.',
          error: error.message 
        });
    }
};

/**
 * Obtém os pagamentos de um aluno específico (apenas para ADMIN e FINANCEIRO)
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.getStudentPayments = async (req, res) => {
  const { studentId } = req.params;
  
  try {
    const [payments] = await pool.query(
      `SELECT id, amount, description, payment_date, status, payment_method 
       FROM payments 
       WHERE student_id = ? 
       ORDER BY payment_date DESC`,
      [studentId]
    );
    
    // Formatar as datas para o padrão brasileiro
    const formattedPayments = payments.map(payment => ({
      ...payment,
      payment_date: formatDateBR(new Date(payment.payment_date))
    }));
    
    res.json(formattedPayments);
  } catch (error) {
    console.error('Erro ao buscar pagamentos do aluno:', error);
    res.status(500).json({ 
      message: 'Erro no servidor ao buscar pagamentos.',
      error: error.message 
    });
  }
};

/**
 * Obtém relatório de pagamentos com filtros
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.getPaymentReport = async (req, res) => {
  const { status, month, year } = req.query;
  
  try {
    let query = 'SELECT * FROM payments WHERE 1=1';
    const params = [];
    
    // Filtro por status
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    // Filtro por mês e ano
    if (month && year) {
      query += ' AND MONTH(payment_date) = ? AND YEAR(payment_date) = ?';
      params.push(month, year);
    }
    
    query += ' ORDER BY payment_date DESC';
    
    const [payments] = await pool.query(query, params);
    
    // Formatar as datas
    const formattedPayments = payments.map(payment => ({
      ...payment,
      payment_date: formatDateBR(new Date(payment.payment_date))
    }));
    
    res.json(formattedPayments);
  } catch (error) {
    console.error('Erro ao gerar relatório de pagamentos:', error);
    res.status(500).json({ 
      message: 'Erro no servidor ao gerar relatório.',
      error: error.message 
    });
  }
};

/**
 * Testa o cálculo de vencimento com uma data específica (apenas para DEBUG)
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 */
exports.testCalculateDueDate = async (req, res) => {
  const { emissionDate, fixedDay = DIA_FIXO_PADRAO } = req.body;
  
  if (!emissionDate) {
    return res.status(400).json({ 
      message: 'emissionDate é obrigatório no formato YYYY-MM-DD' 
    });
  }
  
  try {
    const dataEmissao = new Date(emissionDate);
    const antecedenciaMinima = await getAntecedenciaMinima();
    const holidays = await getHolidaysForYear(dataEmissao.getFullYear());
    
    const calculatedDueDate = calculateDueDate(dataEmissao, fixedDay, antecedenciaMinima, holidays);
    const daysUntilDue = Math.ceil((calculatedDueDate - dataEmissao) / (1000 * 60 * 60 * 24));
    
    res.json({
      emissionDate: formatDateBR(dataEmissao),
      fixedDay: fixedDay,
      antecedenciaMinima: antecedenciaMinima,
      calculatedDueDate: formatDateBR(calculatedDueDate),
      daysUntilDue: daysUntilDue,
      message: `Lançado em ${formatDateBR(dataEmissao)} -> Vence em ${formatDateBR(calculatedDueDate)} (${daysUntilDue} dias de prazo)`
    });
  } catch (error) {
    console.error('Erro ao testar cálculo:', error);
    res.status(500).json({
      message: 'Erro ao testar cálculo de vencimento.',
      error: error.message
    });
  }
};