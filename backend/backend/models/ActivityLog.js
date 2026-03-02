const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Member = require('./Member');

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    member_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Member,
            key: 'member_id'
        }
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'activity_logs',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at'
});

Member.hasMany(ActivityLog, { foreignKey: 'member_id' });
ActivityLog.belongsTo(Member, { foreignKey: 'member_id' });

module.exports = ActivityLog;
