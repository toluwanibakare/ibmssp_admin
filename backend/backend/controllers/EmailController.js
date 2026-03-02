const EmailService = require('../services/EmailService');
const { ActivityLog } = require('../models');

class EmailController {
    static async send(req, res, next) {
        try {
            const { to, subject, text, html } = req.body;
            if (!to || !subject || (!text && !html)) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required email fields: to, subject, and text/html',
                    data: null
                });
            }

            await EmailService.sendEmail(to, subject, text, html);

            // Log the email activity
            await ActivityLog.create({
                action: 'EMAIL_SENT',
                description: `Email sent to ${to}: "${subject}"`
            });

            res.status(200).json({
                success: true,
                message: 'Email sent successfully',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = EmailController;
