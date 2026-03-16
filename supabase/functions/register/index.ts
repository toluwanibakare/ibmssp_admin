import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = Deno.env.get("REGISTRATION_API_KEY");
    if (expectedKey && apiKey !== expectedKey) {
      return new Response(JSON.stringify({ success: false, message: "Invalid API key" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json();

    const splitName = (fullName?: string) => {
      const cleaned = (fullName || '').trim();
      if (!cleaned) return { first_name: '', last_name: '' };
      const parts = cleaned.split(/\s+/);
      const first_name = parts.shift() || '';
      const last_name = parts.length ? parts.join(' ') : '';
      return { first_name, last_name };
    };

    const organization_name = body.organization_name || body['your-organization'];
    const inferredCategory = organization_name ? "organization" : undefined;
    const nameFallback = splitName(body.full_name || body['full-name'] || organization_name);
    const category = body.category || inferredCategory;
    const first_name =
      body.first_name ||
      (category === "organization" ? organization_name : undefined) ||
      nameFallback.first_name;
    const last_name =
      body.last_name ||
      (category === "organization" ? "Organization" : undefined) ||
      nameFallback.last_name;
    const other_name = body.other_name;
    const gender = body.gender;
    const date_of_birth = body.date_of_birth;
    const email = body.email || body['email-address'] || body['your-email'];
    const phone = body.phone || body['tel-290'] || body['your-phone'] || body['tel-766'];
    const address = body.address;
    const state = body.state;
    const country = body.country;

    if (!category || !first_name || !last_name || !email || !phone) {
      return new Response(JSON.stringify({ success: false, message: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert member
    const { data: member, error: memberError } = await supabase
      .from("members")
      .insert({
        category,
        first_name,
        last_name,
        other_name: other_name || null,
        gender: gender || null,
        date_of_birth: date_of_birth || null,
        email,
        phone,
        address: address || null,
        state: state || null,
        country: country || "Nigeria",
      })
      .select()
      .single();

    if (memberError) throw memberError;

    // Insert category-specific details
    const memberId = member.member_id;

    if (category === "student" && (body.institution_name || body['your-school'])) {
      await supabase.from("student_details").insert({
        member_id: memberId,
        institution_name: body.institution_name || body['your-school'] || "",
        course_of_study: body.course_of_study || body['your-course'] || "",
        level: body.level || null,
        matric_number: body.matric_number || null,
        expected_graduation_year: body.expected_graduation_year || null,
      });
    } else if (category === "graduate" && (body.institution || body.institution_name || body['school-name'])) {
      await supabase.from("graduate_details").insert({
        member_id: memberId,
        institution: body.institution || body.institution_name || body['school-name'],
        qualification: body.qualification || body.degree || "",
        graduation_year: body.graduation_year || body['graduation-year'] || new Date().getFullYear(),
        study_duration: body.study_duration || null,
        ny_sc_status: body.ny_sc_status || null,
      });
    } else if (category === "individual" && (body.profession || body.professional_type || body['radio-846'])) {
      await supabase.from("professional_details").insert({
        member_id: memberId,
        profession: body.profession || body.professional_type || body['radio-846'],
        specialization: body.specialization || null,
        years_of_experience: body.years_of_experience || null,
        current_company: body.current_company || null,
        professional_certifications: body.professional_certifications || null,
        license_number: body.license_number || null,
      });
    } else if (category === "organization" && organization_name) {
      await supabase.from("organization_details").insert({
        member_id: memberId,
        organization_name,
        rc_number: body.rc_number || null,
        organization_type: body.organization_type || null,
        industry: body.industry || null,
        iso_start_year: body.iso_start_year || body['date-394'] || null,
        contact_person: body.contact_person || null,
        contact_person_role: body.contact_person_role || null,
        company_email: body.company_email || email,
        company_phone: body.company_phone || phone,
        company_address: body.company_address || null,
        number_of_staff: body.number_of_staff || null,
        company_certificate_file: body.company_certificate_file || body['file-business'] || null,
      });
    }

    // Log registration
    await supabase.from("activity_logs").insert({
      member_id: memberId,
      action: "REGISTRATION",
      description: `New ${category} registered: ${first_name} ${last_name} (${member.public_id})`,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Registration successful", data: { member_id: memberId, public_id: member.public_id } }),
      { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || "Registration failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
