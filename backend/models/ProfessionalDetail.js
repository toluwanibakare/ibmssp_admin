const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Member = require('./Member');

const ProfessionalDetail = sequelize.define('ProfessionalDetail', {
    member_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Member,
            key: 'member_id'
        }
    },
    profession: {
        type: DataTypes.STRING,
        allowNull: false
    },
    specialization: {
        type: DataTypes.STRING,
        allowNull: true
    },
    years_of_experience: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    current_company: {
        type: DataTypes.STRING,
        allowNull: true
    },
    professional_certifications: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    license_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cv_file: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'professional_details',
    timestamps: false
});

Member.hasOne(ProfessionalDetail, { foreignKey: 'member_id', as: 'professionalDetails' });
ProfessionalDetail.belongsTo(Member, { foreignKey: 'member_id' });

module.exports = ProfessionalDetail;
