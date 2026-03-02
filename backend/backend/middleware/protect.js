const jwt = require('jsonwebtoken');

const hasValidApiKey = (req) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;
    return !!apiKey && !!validApiKey && apiKey === validApiKey;
};

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
            data: null
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
            data: null
        });
    }
};

const protectOrApiKey = (req, res, next) => {
    if (hasValidApiKey(req)) {
        return next();
    }
    return protect(req, res, next);
};

module.exports = { protect, protectOrApiKey };
