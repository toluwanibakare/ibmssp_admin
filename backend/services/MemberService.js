const { Op } = require('sequelize');
const {
    Member,
    StudentDetail,
    GraduateDetail,
    ProfessionalDetail,
    OrganizationDetail,
    ActivityLog,
    sequelize
} = require('../models');
const IdGeneratorService = require('./IdGeneratorService');

class MemberService {
    static async registerMember(data) {
        const t = await sequelize.transaction();

        try {
            // 1. Create base member record
            const member = await Member.create({
                category: data.category,
                first_name: data.first_name,
                last_name: data.last_name,
                other_name: data.other_name,
                gender: data.gender,
                date_of_birth: data.date_of_birth,
                email: data.email,
                phone: data.phone,
                address: data.address,
                state: data.state,
                country: data.country || 'Nigeria',
                registration_status: 'pending',
                payment_status: 'unpaid'
            }, { transaction: t });

            // 2. Insert into category specific table
            switch (data.category) {
                case 'student':
                    await StudentDetail.create({
                        member_id: member.member_id,
                        institution_name: data.institution_name,
                        course_of_study: data.course_of_study,
                        level: data.level,
                        matric_number: data.matric_number,
                        expected_graduation_year: data.expected_graduation_year,
                        student_id_card_file: data.student_id_card_file
                    }, { transaction: t });
                    break;

                case 'graduate':
                    await GraduateDetail.create({
                        member_id: member.member_id,
                        institution: data.institution,
                        qualification: data.qualification,
                        graduation_year: data.graduation_year,
                        study_duration: data.study_duration,
                        ny_sc_status: data.ny_sc_status,
                        certificate_file: data.certificate_file,
                        cv_file: data.cv_file
                    }, { transaction: t });
                    break;

                case 'individual':
                    await ProfessionalDetail.create({
                        member_id: member.member_id,
                        profession: data.profession,
                        specialization: data.specialization,
                        years_of_experience: data.years_of_experience,
                        current_company: data.current_company,
                        professional_certifications: data.professional_certifications,
                        license_number: data.license_number,
                        cv_file: data.cv_file
                    }, { transaction: t });
                    break;

                case 'organization':
                    await OrganizationDetail.create({
                        member_id: member.member_id,
                        organization_name: data.organization_name,
                        rc_number: data.rc_number,
                        organization_type: data.organization_type,
                        industry: data.industry,
                        iso_start_year: data.iso_start_year,
                        contact_person: data.contact_person,
                        contact_person_role: data.contact_person_role,
                        company_email: data.company_email,
                        company_phone: data.company_phone,
                        company_address: data.company_address,
                        number_of_staff: data.number_of_staff,
                        company_certificate_file: data.company_certificate_file
                    }, { transaction: t });
                    break;

                default:
                    throw new Error('Invalid member category');
            }

            // 3. Generate Membership ID
            const publicId = await IdGeneratorService.generatePublicId(data.category);
            await member.update({ public_id: publicId }, { transaction: t });

            // 4. Log activity
            await ActivityLog.create({
                member_id: member.member_id,
                action: 'REGISTRATION',
                description: `New ${data.category} registration: ${data.first_name} ${data.last_name}`
            }, { transaction: t });

            await t.commit();
            return member;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    static async getMembers(filters, pagination) {
        const { category, search } = filters;
        const { limit, offset } = pagination;

        const where = {};
        if (category) where.category = category;

        if (search) {
            where[Op.or] = [
                { public_id: { [Op.like]: `%${search}%` } },
                { first_name: { [Op.like]: `%${search}%` } },
                { last_name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        return await Member.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }

    static async getMemberDetails(id) {
        return await Member.findByPk(id, {
            include: [
                { model: StudentDetail, as: 'studentDetails' },
                { model: GraduateDetail, as: 'graduateDetails' },
                { model: ProfessionalDetail, as: 'professionalDetails' },
                { model: OrganizationDetail, as: 'organizationDetails' },
                { model: ActivityLog, as: 'ActivityLogs', order: [['created_at', 'DESC']] }
            ]
        });
    }

    static async approveMember(id) {
        const member = await Member.findByPk(id);
        if (!member) throw new Error('Member not found');

        await member.update({ registration_status: 'approved' });

        await ActivityLog.create({
            member_id: member.member_id,
            action: 'APPROVAL',
            description: `Registration approved for ${member.first_name} ${member.last_name}`
        });

        return member;
    }
}

module.exports = MemberService;
