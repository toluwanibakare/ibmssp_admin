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
    const { category, first_name, last_name, other_name, gender, date_of_birth, email, phone, address, state, country } = body;

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

    if (category === "student" && body.institution_name) {
      await supabase.from("student_details").insert({
        member_id: memberId,
        institution_name: body.institution_name,
        course_of_study: body.course_of_study || "",
        level: body.level || null,
        matric_number: body.matric_number || null,
        expected_graduation_year: body.expected_graduation_year || null,
      });
    } else if (category === "graduate" && body.institution) {
      await supabase.from("graduate_details").insert({
        member_id: memberId,
        institution: body.institution,
        qualification: body.qualification || "",
        graduation_year: body.graduation_year || new Date().getFullYear(),
        study_duration: body.study_duration || null,
        ny_sc_status: body.ny_sc_status || null,
      });
    } else if (category === "individual" && body.profession) {
      await supabase.from("professional_details").insert({
        member_id: memberId,
        profession: body.profession,
        specialization: body.specialization || null,
        years_of_experience: body.years_of_experience || null,
        current_company: body.current_company || null,
        professional_certifications: body.professional_certifications || null,
        license_number: body.license_number || null,
      });
    } else if (category === "organization" && body.organization_name) {
      await supabase.from("organization_details").insert({
        member_id: memberId,
        organization_name: body.organization_name,
        rc_number: body.rc_number || null,
        organization_type: body.organization_type || null,
        industry: body.industry || null,
        iso_start_year: body.iso_start_year || null,
        contact_person: body.contact_person || null,
        contact_person_role: body.contact_person_role || null,
        company_email: body.company_email || email,
        company_phone: body.company_phone || phone,
        company_address: body.company_address || null,
        number_of_staff: body.number_of_staff || null,
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
