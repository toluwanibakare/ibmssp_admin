const Joi = require('joi');

const commonFields = {
    category: Joi.string().valid('student', 'graduate', 'individual', 'organization').required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    other_name: Joi.string().optional().allow(''),
    gender: Joi.string().optional().allow(''),
    date_of_birth: Joi.date().optional().allow(null),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    country: Joi.string().optional().default('Nigeria').allow('')
};

const studentFields = {
    institution_name: Joi.string().required(),
    course_of_study: Joi.string().required(),
    level: Joi.string().optional().allow(''),
    matric_number: Joi.string().optional().allow(''),
    expected_graduation_year: Joi.number().integer().optional(),
    student_id_card_file: Joi.string().optional().allow('')
};

const graduateFields = {
    institution: Joi.string().required(),
    qualification: Joi.string().required(),
    graduation_year: Joi.number().integer().required(),
    study_duration: Joi.string().optional().allow(''),
    ny_sc_status: Joi.string().optional().allow(''),
    certificate_file: Joi.string().optional().allow(''),
    cv_file: Joi.string().optional().allow('')
};

const individualFields = {
    profession: Joi.string().required(),
    specialization: Joi.string().optional().allow(''),
    years_of_experience: Joi.number().integer().required(),
    current_company: Joi.string().optional().allow(''),
    professional_certifications: Joi.string().optional().allow(''),
    license_number: Joi.string().optional().allow(''),
    cv_file: Joi.string().optional().allow('')
};

const organizationFields = {
    organization_name: Joi.string().required(),
    rc_number: Joi.string().optional().allow(''),
    organization_type: Joi.string().optional().allow(''),
    industry: Joi.string().optional().allow(''),
    iso_start_year: Joi.string().optional().allow(''),
    contact_person: Joi.string().optional().allow(''),
    contact_person_role: Joi.string().optional().allow(''),
    company_email: Joi.string().email().optional().allow(''),
    company_phone: Joi.string().optional().allow(''),
    company_address: Joi.string().optional().allow(''),
    number_of_staff: Joi.number().integer().optional(),
    company_certificate_file: Joi.string().optional().allow('')
};

const validateRegistration = (data) => {
    // We refine the schema based on category to ensure strict validation
    let schema;
    const base = Joi.object(commonFields);

    switch (data.category) {
        case 'student':
            schema = base.append(studentFields);
            break;
        case 'graduate':
            schema = base.append(graduateFields);
            break;
        case 'individual':
            schema = base.append(individualFields);
            break;
        case 'organization':
            schema = base.append(organizationFields);
            break;
        default:
            return { error: { message: 'Invalid category' } };
    }

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

module.exports = { validateRegistration };
