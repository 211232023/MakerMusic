const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendPasswordResetEmail = async (email, token) => {
    const resetLink = `http://localhost:19006/reset-password/${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperação de Senha - MakerMusic',
        html: `
            <h2>Redefinição de Senha MakerMusic</h2>
            <p>Você solicitou a redefinição de senha. Use o código abaixo para continuar:</p>
            <h1 style="color: #d4af37; font-size: 32px;">${token}</h1>
            <p>Este código expira em 1 hora.</p>
            <p>Se você não solicitou esta redefinição, ignore este e-mail.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions );
        // A linha abaixo foi corrigida
        console.log(`E-mail de recuperação enviado para: ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Erro ao enviar e-mail de recuperação:', error);
        return { success: false, error: error.message };
    }
};