const MemberService = require('../services/MemberService');
const { Member } = require('../models');
const { validateRegistration } = require('../utils/validation');

const normalizeCF7Data = (data) => {
    const normalized = { ...data };

    // Detect Category if not provided
    if (!normalized.category) {
        if (data['your-school'] || data['your-course']) normalized.category = 'student';
        else if (data['your-organization']) normalized.category = 'organization';
        else if (data['radio-846']) normalized.category = 'individual';
        else if (data['graduation-year']) normalized.category = 'graduate';
    }

    // Common Field Mapping
    const name = data['your-name'] || data['full-name'] || data['your-organization'] || '';
    if (name && (!normalized.first_name || !normalized.last_name)) {
        const parts = name.trim().split(' ');
        normalized.first_name = parts[0] || 'N/A';
        normalized.last_name = parts.slice(1).join(' ') || 'N/A';
    }

    normalized.email = data['your-email'] || data['email-address'] || data['company-email'] || data.email;
    normalized.phone = data['your-phone'] || data['tel-290'] || data['tel-766'] || data.phone;

    // Category Specific Mapping
    if (normalized.category === 'student') {
        normalized.institution_name = data['your-school'] || data.institution_name;
        normalized.course_of_study = data['your-course'] || data.course_of_study;
        normalized.student_id_card_file = data['file-354'] || data.student_id_card_file;
    } else if (normalized.category === 'organization') {
        normalized.organization_name = data['your-organization'] || data.organization_name;
        normalized.company_phone = data['tel-766'] || data.company_phone;
        normalized.company_email = data['your-email'] || data.company_email;
        normalized.iso_start_year = data['date-394'] || data.iso_start_year;
        normalized.company_certificate_file = data['file-business'] || data.company_certificate_file;
    } else if (normalized.category === 'individual') {
        normalized.profession = data['radio-846'] || data.profession;
        normalized.cv_file = data['iso-document'] || data.cv_file;
    } else if (normalized.category === 'graduate') {
        normalized.institution = data['school-name'] || data.institution;
        normalized.qualification = data['degree'] || data.qualification;
        normalized.course_of_study = data['course'] || data.course_of_study;
        normalized.graduation_year = data['graduation-year'] || data.graduation_year;
        normalized.study_duration = data['study-duration'] || data.study_duration;
        normalized.certificate_file = data['certificate-upload'] || data.certificate_file;
    }

    return normalized;
};

class MemberController {
    static async register(req, res, next) {
        try {
            const normalizedData = normalizeCF7Data(req.body);
            const { error } = validateRegistration(normalizedData);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error: ' + error.details.map(d => d.message).join(', '),
                    data: null
                });
            }

            const existing = await Member.findOne({ where: { email: normalizedData.email } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered',
                    data: null
                });
            }

            const member = await MemberService.registerMember(normalizedData);
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    public_id: member.public_id,
                    member_id: member.member_id
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async list(req, res, next) {
        try {
            const { category, search, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows } = await MemberService.getMembers(
                { category, search },
                { limit: parseInt(limit), offset: parseInt(offset) }
            );

            res.status(200).json({
                success: true,
                message: 'Members retrieved successfully',
                data: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    members: rows
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req, res, next) {
        try {
            const member = await MemberService.getMemberDetails(req.params.id);
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                    data: null
                });
            }
            res.status(200).json({
                success: true,
                message: 'Member details retrieved',
                data: member
            });
        } catch (error) {
            next(error);
        }
    }

    static async approve(req, res, next) {
        try {
            const member = await MemberService.approveMember(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Registration approved',
                data: member
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MemberController;
