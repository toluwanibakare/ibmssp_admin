const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Member = require('./Member');

const GraduateDetail = sequelize.define('GraduateDetail', {
    member_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Member,
            key: 'member_id'
        }
    },
    institution: {
        type: DataTypes.STRING,
        allowNull: false
    },
    qualification: {
        type: DataTypes.STRING,
        allowNull: false
    },
    graduation_year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    study_duration: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ny_sc_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    certificate_file: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cv_file: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'graduate_details',
    timestamps: false
});

Member.hasOne(GraduateDetail, { foreignKey: 'member_id', as: 'graduateDetails' });
GraduateDetail.belongsTo(Member, { foreignKey: 'member_id' });

module.exports = GraduateDetail;
