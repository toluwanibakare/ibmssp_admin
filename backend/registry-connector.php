<?php
/**
 * Plugin Name: IBMSSP Registry Connector
 * Description: Sends Contact Form 7 submissions to membership dashboard API
 */

add_action('wpcf7_mail_sent', 'ibmssp_send_to_registry');

function ibmssp_send_to_registry($contact_form) {

    $submission = WPCF7_Submission::get_instance();
    if (!$submission) return;

    $data = $submission->get_posted_data();
    $uploaded_files = $submission->uploaded_files();
    $form_title = $contact_form->title();

    $payload = [
        'category' => '',
        'form_name' => $form_title
    ];

    /*
    ========================================
    STUDENTS FORM
    ========================================
    */
    if (isset($data['your-school'])) {

        $payload = array_merge($payload, [
            'category' => 'student',
            'full_name' => sanitize_text_field($data['your-name']),
            'email' => sanitize_email($data['your-email']),
            'phone' => sanitize_text_field($data['tel-290']),
            'institution_name' => sanitize_text_field($data['your-school']),
            'course_of_study' => sanitize_text_field($data['your-course']),
            'verification_file' => $uploaded_files['file-354'] ?? null
        ]);
    }

    /*
    ========================================
    ORGANIZATION FORM
    ========================================
    */
    elseif (isset($data['your-organization'])) {

        $payload = array_merge($payload, [
            'category' => 'organization',
            'organization_name' => sanitize_text_field($data['your-organization']),
            'company_phone' => sanitize_text_field($data['tel-766']),
            'company_email' => sanitize_email($data['your-email']),
            'iso_start_year' => sanitize_text_field($data['date-394']),
            'certificate_file' => $uploaded_files['file-business'] ?? null
        ]);
    }

    /*
    ========================================
    INDIVIDUALS (AUDITORS / CONSULTANTS)
    ========================================
    */
    elseif (isset($data['radio-846'])) {

        $payload = array_merge($payload, [
            'category' => 'individual',
            'full_name' => sanitize_text_field($data['your-name']),
            'email' => sanitize_email($data['your-email']),
            'phone' => sanitize_text_field($data['your-phone']),
            'professional_type' => sanitize_text_field($data['radio-846']),
            'verification_file' => $uploaded_files['iso-document'] ?? null
        ]);
    }

    /*
    ========================================
    GRADUATES
    ========================================
    */
    elseif (isset($data['degree'])) {

        $payload = array_merge($payload, [
            'category' => 'graduate',
            'full_name' => sanitize_text_field($data['full-name']),
            'email' => sanitize_email($data['email-address']),
            'institution_name' => sanitize_text_field($data['school-name']),
            'degree' => sanitize_text_field($data['degree']),
            'course_of_study' => sanitize_text_field($data['course']),
            'graduation_year' => sanitize_text_field($data['graduation-year']),
            'study_duration' => sanitize_text_field($data['study-duration']),
            'additional_message' => sanitize_textarea_field($data['additional-message'] ?? ''),
            'certificate_file' => $uploaded_files['certificate-upload'] ?? null
        ]);
    }

    /*
    SEND TO NODE API
    */
    wp_remote_post('https://ukjmduimszrydwoyrksi.supabase.co/functions/v1/register', [
        'method' => 'POST',
        'headers' => [
            'Content-Type' => 'application/json',
            'x-api-key' => 'ibmssp_admin_secret_key_2025'
        ],
        'body' => json_encode($payload),
        'timeout' => 25
    ]);
}
