const { sequelize } = require('../config/db');
require('../models'); // Import models to ensure they are registered

const initDB = async () => {
    try {
        console.log('Initializing database...');
        // This will create the database if it doesn't exist (if the connection allows)
        // and create all tables based on models
        await sequelize.sync({ force: true }); // WARNING: This drops existing tables
        console.log('Database initialized successfully with all tables.');

        // No demo/fake users are created here. All users should come from real data sources.

        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

initDB();
