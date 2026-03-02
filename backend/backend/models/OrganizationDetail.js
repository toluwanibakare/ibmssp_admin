const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Member = require('./Member');

const OrganizationDetail = sequelize.define('OrganizationDetail', {
    member_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Member,
            key: 'member_id'
        }
    },
    organization_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rc_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    organization_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    industry: {
        type: DataTypes.STRING,
        allowNull: true
    },
    iso_start_year: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contact_person: {
        type: DataTypes.STRING,
        allowNull: true
    },
    contact_person_role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    company_email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company_phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    number_of_staff: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    company_certificate_file: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'organization_details',
    timestamps: false
});

Member.hasOne(OrganizationDetail, { foreignKey: 'member_id', as: 'organizationDetails' });
OrganizationDetail.belongsTo(Member, { foreignKey: 'member_id' });

module.exports = OrganizationDetail;
