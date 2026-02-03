const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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

// --- AVISO DE ATRASO ---
exports.sendOverdueNotice = async (studentEmail, studentName, amount, dueDate) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Aviso de Mensalidade em Atraso - Maker Music',
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Olá, ${studentName}!</h2>
        <p>Notamos que a sua mensalidade no valor de <strong>R$ ${parseFloat(amount).toFixed(2)}</strong>, com vencimento em <strong>${new Date(dueDate).toLocaleDateString()}</strong>, ainda não foi identificada em nosso sistema.</p>
        <p>Para evitar a suspensão das aulas, por favor realize o pagamento através do aplicativo.</p>
        <br/>
        <p>Atenciosamente,<br/>Equipe Maker Music</p>
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

// --- CONFIRMAÇÃO DE PAGAMENTO ---
exports.sendPaymentConfirmation = async (studentEmail, studentName, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentEmail,
    subject: 'Confirmação de Pagamento - Maker Music',
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Obrigado, ${studentName}!</h2>
        <p>Seu pagamento no valor de <strong>R$ ${parseFloat(amount).toFixed(2)}</strong> foi confirmado com sucesso.</p>
        <p>Desejamos ótimas aulas!</p>
        <br/>
        <p>Atenciosamente,<br/>Equipe Maker Music</p>
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