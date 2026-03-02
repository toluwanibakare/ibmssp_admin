const { loadEnv } = require('../config/env');
loadEnv();

const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid or missing API key',
            data: null
        });
    }

    next();
};

module.exports = { verifyApiKey };
