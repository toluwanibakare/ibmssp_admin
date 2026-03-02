const { loadEnv } = require('./config/env');
loadEnv();
const app = require('./app');
const { connectDB, sequelize } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to Database
        await connectDB();

        // In production, you might not want to sync with alter:true
        // But for development/initialization, it's helpful
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('Database synchronized');
        }

        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
