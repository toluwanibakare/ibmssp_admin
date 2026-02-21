const { Member } = require('../models');
const { Op } = require('sequelize');

class IdGeneratorService {
    static async generatePublicId(category) {
        const year = new Date().getFullYear();
        const prefixMap = {
            student: 'STU',
            graduate: 'GRD',
            individual: 'IND',
            organization: 'ORG'
        };

        const prefix = prefixMap[category];
        if (!prefix) throw new Error('Invalid category for ID generation');

        // Find the latest public_id for this category and year
        const lastMember = await Member.findOne({
            where: {
                category,
                public_id: {
                    [Op.like]: `${prefix}-${year}-%`
                }
            },
            order: [['member_id', 'DESC']]
        });

        let nextNumber = 1;
        if (lastMember && lastMember.public_id) {
            const parts = lastMember.public_id.split('-');
            const lastSeq = parseInt(parts[2], 10);
            if (!isNaN(lastSeq)) {
                nextNumber = lastSeq + 1;
            }
        }

        const paddedNumber = nextNumber.toString().padStart(4, '0');
        return `${prefix}-${year}-${paddedNumber}`;
    }
}

module.exports = IdGeneratorService;
