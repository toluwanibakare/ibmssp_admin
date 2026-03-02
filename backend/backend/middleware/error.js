const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        success: false,
        message,
        data: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

module.exports = errorHandler;
