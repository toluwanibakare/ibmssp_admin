const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

class EmailService {
    static async sendEmail(to, subject, text, html) {
        try {
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to,
                subject,
                text,
                html
            });
            console.log('Email sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Email send error:', error);
            throw error;
        }
    }
}

module.exports = EmailService;
