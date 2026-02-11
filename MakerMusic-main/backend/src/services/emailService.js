const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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

// --- RECUPERAÇÃO DE SENHA ---
exports.sendPasswordResetEmail = async (email, token) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperação de Senha - MakerMusic',
        html: `
            <div style="font-family: sans-serif; color: #333;">
                <h2>Redefinição de Senha MakerMusic</h2>
                <p>Você solicitou a redefinição de senha. Use o código abaixo para continuar:</p>
                <h1 style="color: #d4af37; font-size: 32px; letter-spacing: 5px;">${token}</h1>
                <p>Este código expira em 1 hora.</p>
                <p>Se você não solicitou esta redefinição, ignore este e-mail.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de recuperação enviado para: ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao enviar e-mail de recuperação:', error);
        return { success: false, error: error.message };
    }
};

// --- NOTIFICAÇÃO DE NOVA MENSALIDADE (COM DATA DINÂMICA) ---
/**
 * Envia notificação de nova mensalidade com data de vencimento dinâmica
 * @param {string} studentEmail - Email do aluno
 * @param {string} studentName - Nome do aluno
 * @param {number} amount - Valor da mensalidade
 * @param {Date} dueDate - Data de vencimento calculada
 * @param {number} daysUntilDue - Dias até o vencimento
 */
exports.sendUpcomingDueNotice = async (studentEmail, studentName, amount, dueDate, daysUntilDue) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: `Notificação de Mensalidade - Vencimento em ${formatDateBR(dueDate)}`,
    html: `
      <div style="font-family: 'Arial', sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">Olá, ${studentName}! 👋</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; margin-top: 0;">Sua nova mensalidade foi registada com sucesso!</p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 5px 0;"><strong>Valor:</strong> R$ ${parseFloat(amount).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Data de Vencimento:</strong> <span style="color: #764ba2; font-weight: bold; font-size: 18px;">${formatDateBR(dueDate)}</span></p>
            <p style="margin: 5px 0;"><strong>Dias até o vencimento:</strong> ${daysUntilDue} dias</p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Para realizar o pagamento, acesse o aplicativo MakerMusic e escolha uma das opções de pagamento disponíveis.
          </p>
          
          <div style="background: #fff3cd; padding: 12px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>💡 Dica:</strong> Pague antes da data de vencimento para evitar multas e manter seus acessos às aulas em dia.
            </p>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
            Atenciosamente,<br/>
            <strong>Equipe Maker Music</strong><br/>
            <em>Sua escola de música online</em>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail de notificação de mensalidade enviado para: ${studentEmail}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail de notificação de mensalidade:', error);
    return false;
  }
};

// --- AVISO DE ATRASO (MELHORADO COM DATA DINÂMICA) ---
/**
 * Envia notificação de mensalidade em atraso
 * @param {string} studentEmail - Email do aluno
 * @param {string} studentName - Nome do aluno
 * @param {number} amount - Valor da mensalidade
 * @param {Date} dueDate - Data de vencimento
 * @param {number} daysOverdue - Dias em atraso
 */
exports.sendOverdueNotice = async (studentEmail, studentName, amount, dueDate, daysOverdue = 0) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: '⚠️ Aviso: Mensalidade em Atraso - Maker Music',
    html: `
      <div style="font-family: 'Arial', sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">⚠️ Aviso Importante, ${studentName}</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; margin-top: 0;">Notamos que sua mensalidade está em atraso.</p>
          
          <div style="background: #ffe5e5; padding: 15px; border-left: 4px solid #f5576c; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 5px 0;"><strong>Valor:</strong> R$ ${parseFloat(amount).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Data de Vencimento:</strong> ${formatDateBR(dueDate)}</p>
            <p style="margin: 5px 0;"><strong>Dias em Atraso:</strong> <span style="color: #f5576c; font-weight: bold;">${daysOverdue} dias</span></p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin: 15px 0;">
            Para evitar a suspensão das suas aulas, por favor realize o pagamento o mais breve possível através do aplicativo MakerMusic.
          </p>
          
          <div style="background: #fff3cd; padding: 12px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>ℹ️ Informação:</strong> Conforme a Lei de Defesa do Consumidor, será aplicada multa de até 2% sobre o valor da mensalidade em caso de atraso.
            </p>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
            Atenciosamente,<br/>
            <strong>Equipe Maker Music</strong><br/>
            <em>Sua escola de música online</em>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail de atraso enviado para: ${studentEmail}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail de atraso:', error);
    return false;
  }
};

// --- LEMBRETE DE VENCIMENTO PRÓXIMO ---
/**
 * Envia lembrete de vencimento próximo (5-7 dias antes)
 * @param {string} studentEmail - Email do aluno
 * @param {string} studentName - Nome do aluno
 * @param {number} amount - Valor da mensalidade
 * @param {Date} dueDate - Data de vencimento
 * @param {number} daysUntilDue - Dias até o vencimento
 */
exports.sendUpcomingPaymentReminder = async (studentEmail, studentName, amount, dueDate, daysUntilDue) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: `Lembrete: Mensalidade vence em ${daysUntilDue} dias`,
    html: `
      <div style="font-family: 'Arial', sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">Lembrete de Pagamento 📅</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; margin-top: 0;">Olá, ${studentName}!</p>
          
          <p style="font-size: 14px; color: #666; margin: 15px 0;">
            Lembramos que sua mensalidade vence em <strong>${daysUntilDue} dias</strong>.
          </p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 5px 0;"><strong>Valor:</strong> R$ ${parseFloat(amount).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Data de Vencimento:</strong> <span style="color: #764ba2; font-weight: bold;">${formatDateBR(dueDate)}</span></p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin: 15px 0;">
            Realize o pagamento através do aplicativo MakerMusic para manter suas aulas em dia.
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
            Atenciosamente,<br/>
            <strong>Equipe Maker Music</strong><br/>
            <em>Sua escola de música online</em>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail de lembrete enviado para: ${studentEmail}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail de lembrete:', error);
    return false;
  }
};

// --- CONFIRMAÇÃO DE PAGAMENTO (MELHORADO) ---
/**
 * Envia confirmação de pagamento realizado
 * @param {string} studentEmail - Email do aluno
 * @param {string} studentName - Nome do aluno
 * @param {number} amount - Valor pago
 * @param {Date} paymentDate - Data do pagamento
 */
exports.sendPaymentConfirmation = async (studentEmail, studentName, amount, paymentDate = new Date()) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: '✅ Confirmação de Pagamento - Maker Music',
    html: `
      <div style="font-family: 'Arial', sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 24px;">✅ Pagamento Confirmado!</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; margin-top: 0;">Obrigado, ${studentName}!</p>
          
          <p style="font-size: 14px; color: #666; margin: 15px 0;">
            Seu pagamento foi processado com sucesso. Suas aulas continuam ativas!
          </p>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #38ef7d; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 5px 0;"><strong>Valor Pago:</strong> R$ ${parseFloat(amount).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Data do Pagamento:</strong> ${formatDateBR(paymentDate)}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #38ef7d; font-weight: bold;">✅ Pago</span></p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin: 15px 0;">
            Desejamos ótimas aulas! Qualquer dúvida, entre em contato conosco.
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
            Atenciosamente,<br/>
            <strong>Equipe Maker Music</strong><br/>
            <em>Sua escola de música online</em>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`E-mail de confirmação enviado para: ${studentEmail}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail de confirmação:', error);
    return false;
  }
};