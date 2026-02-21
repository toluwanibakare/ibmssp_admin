const { ActivityLog, Member } = require('../models');

class LogController {
    static async list(req, res, next) {
        try {
            const logs = await ActivityLog.findAll({
                include: [{ model: Member, attributes: ['first_name', 'last_name', 'public_id'] }],
                order: [['created_at', 'DESC']],
                limit: 100
            });

            res.status(200).json({
                success: true,
                message: 'Activity logs retrieved',
                data: logs
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = LogController;
