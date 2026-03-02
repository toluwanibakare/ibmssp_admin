const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Member = sequelize.define('Member', {
    member_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    public_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true // Generated after creation
    },
    category: {
        type: DataTypes.ENUM('student', 'graduate', 'individual', 'organization'),
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    other_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Nigeria'
    },
    registration_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    payment_status: {
        type: DataTypes.ENUM('unpaid', 'paid'),
        defaultValue: 'unpaid'
    }
}, {
    tableName: 'members',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Member;
