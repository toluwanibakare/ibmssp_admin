const nodemailer = require('nodemailer');
require('dotenv').config();

const smtpPort = Number(process.env.SMTP_PORT || 587);
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const EMAIL_FOOTER_TEXT = 'For more information visit our website: www.ibmssp.org.ng or contact us on: +2348023644148';
const EMAIL_FOOTER_HTML = '<br><br><hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" /><p style="font-size:12px;color:#555;">For more information visit our website: <a href="https://www.ibmssp.org.ng" target="_blank" rel="noopener noreferrer">www.ibmssp.org.ng</a> or contact us on: +2348023644148</p>';

function appendFooter(content = '', footer = '') {
    const trimmed = content || '';
    if (trimmed.includes('www.ibmssp.org.ng') || trimmed.includes('+2348023644148')) {
        return trimmed;
    }
    return `${trimmed}${trimmed ? '\n\n' : ''}${footer}`;
}

class EmailService {
    static async sendEmail(to, subject, text, html) {
        try {
            const finalText = appendFooter(text, EMAIL_FOOTER_TEXT);
            const finalHtml = appendFooter(html, EMAIL_FOOTER_HTML);
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to,
                subject,
                text: finalText,
                html: finalHtml
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
