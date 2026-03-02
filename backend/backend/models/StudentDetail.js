const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Member = require('./Member');

const StudentDetail = sequelize.define('StudentDetail', {
    member_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Member,
            key: 'member_id'
        }
    },
    institution_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    course_of_study: {
        type: DataTypes.STRING,
        allowNull: false
    },
    level: {
        type: DataTypes.STRING,
        allowNull: true
    },
    matric_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expected_graduation_year: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    student_id_card_file: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'student_details',
    timestamps: false
});

Member.hasOne(StudentDetail, { foreignKey: 'member_id', as: 'studentDetails' });
StudentDetail.belongsTo(Member, { foreignKey: 'member_id' });

module.exports = StudentDetail;
