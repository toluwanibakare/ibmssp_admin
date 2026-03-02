const nodemailer = require('nodemailer');
const { loadEnv } = require('../config/env');
loadEnv();

function createTransport(port) {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

function isConnectionError(error) {
    if (!error) return false;
    const connectionCodes = new Set(['ESOCKET', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH']);
    return connectionCodes.has(error.code) || error.command === 'CONN';
}

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
        const primaryPort = Number(process.env.SMTP_PORT || 465);
        const fallbackPort = Number(process.env.SMTP_FALLBACK_PORT || 587);
        const finalText = appendFooter(text, EMAIL_FOOTER_TEXT);
        const finalHtml = appendFooter(html, EMAIL_FOOTER_HTML);

        const sendWithPort = async (port) => {
            const transporter = createTransport(port);
            return transporter.sendMail({
                from: {
                    name: process.env.SMTP_FROM_NAME || 'IBMSSP',
                    address: process.env.SMTP_FROM
                },
                to,
                subject,
                text: finalText,
                html: finalHtml
            });
        };

        try {
            try {
                const info = await sendWithPort(primaryPort);
                console.log('Email sent: %s', info.messageId);
                return info;
            } catch (primaryError) {
                const canRetry = primaryPort !== fallbackPort && isConnectionError(primaryError);
                if (!canRetry) throw primaryError;

                console.warn(`Primary SMTP connection failed on port ${primaryPort}. Retrying on ${fallbackPort}...`);
                const info = await sendWithPort(fallbackPort);
                console.log('Email sent via fallback port %s: %s', fallbackPort, info.messageId);
                return info;
            }
        } catch (error) {
            console.error('Email send error:', error);
            throw error;
        }
    }
}

module.exports = EmailService;
