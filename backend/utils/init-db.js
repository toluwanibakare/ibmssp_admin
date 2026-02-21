const { sequelize } = require('../config/db');
require('../models'); // Import models to ensure they are registered

const initDB = async () => {
    try {
        console.log('Initializing database...');
        // This will create the database if it doesn't exist (if the connection allows)
        // and create all tables based on models
        await sequelize.sync({ force: true }); // WARNING: This drops existing tables
        console.log('Database initialized successfully with all tables.');

        // Seed default admin user
        const { User } = require('../models');
        await User.create({
            name: 'IBMSSP ADMIN',
            email: 'info@ibmssp.org.ng',
            password: 'Master@123',
            role: 'admin'
        });
        console.log('Default admin user created: info@ibmssp.org.ng / Master@123');

        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

initDB();
