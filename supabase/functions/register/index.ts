import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 2. Health Check (Verify Deployment)
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok", message: "Registry Webhook is active" }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    console.log("--- Webhook Invoked ---");
    console.log("Method:", req.method);
    
    // 3. Authenticate
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = Deno.env.get("REGISTRATION_API_KEY");
    
    if (expectedKey && (!apiKey || apiKey !== expectedKey)) {
      console.warn("Auth Failed: Missing or invalid x-api-key");
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Authentication Failed. Ensure x-api-key header is sent." 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 4. Safely Read Body
    const rawBody = await req.text();
    console.log("Raw Received Body:", rawBody.substring(0, 500));
    
    let body;
    try {
      body = JSON.parse(rawBody);
      // Handle CF7 double-stringified JSON
      if (typeof body === "string") {
        console.log("Detected stringified JSON, parsing again...");
        body = JSON.parse(body);
      }
    } catch (e) {
      console.error("JSON Parse Error:", e.message);
      return new Response(JSON.stringify({ success: false, message: "Invalid JSON payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 5. Field Mapping (Resilient to CF7 patterns)
    const splitName = (fullName?: string) => {
      const cleaned = (fullName || "").trim();
      if (!cleaned) return { first_name: "", last_name: "" };
      const parts = cleaned.split(/\s+/);
      const first_name = parts.shift() || "";
      const last_name = parts.length ? parts.join(" ") : "";
      return { first_name, last_name };
    };

    const organization_name = body.organization_name || body["your-organization"] || body["organization"];
    const inferredCategory = organization_name ? "organization" : undefined;
    const nameFallback = splitName(body.full_name || body["full-name"] || body["your-name"] || organization_name);
    
    const category = body.category || inferredCategory || "individual";
    const first_name = body.first_name || (category === "organization" ? organization_name : undefined) || nameFallback.first_name;
    const last_name = body.last_name || (category === "organization" ? "Organization" : undefined) || nameFallback.last_name;
    const email = body.email || body["email-address"] || body["your-email"] || body["email"];
    const phone = body.phone || body["tel-290"] || body["your-phone"] || body["tel-766"] || body["phone"];
    
    console.log("Mapped Data:", { category, first_name, last_name, email, phone });

    if (!first_name || !last_name || !email || !phone) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Missing required fields (Name, Email, or Phone)",
        debug: { hasFirstName: !!first_name, hasEmail: !!email, hasPhone: !!phone }
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 6. Database Operations
    const { data: member, error: memberError } = await supabase
      .from("members")
      .insert({
        category,
        first_name,
        last_name,
        other_name: body.other_name || null,
        gender: body.gender || null,
        date_of_birth: body.date_of_birth || body["date-394"] || null,
        email,
        phone,
        address: body.address || body["your-address"] || null,
        state: body.state || body["your-state"] || null,
        country: body.country || "Nigeria",
      })
      .select()
      .single();

    if (memberError) {
      console.error("Database Insert Error:", memberError);
      return new Response(JSON.stringify({ success: false, message: memberError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 7. Insert Category Details
    const memberId = member.member_id;
    if (category === "organization" && organization_name) {
      await supabase.from("organization_details").insert({
        member_id: memberId,
        organization_name,
        rc_number: body.rc_number || null,
        company_email: body.company_email || email,
        company_phone: body.company_phone || phone,
        iso_start_year: body.iso_start_year || body["date-394"] || null,
      });
    }

    // 8. Log Activity
    await supabase.from("activity_logs").insert({
      member_id: memberId,
      action: "REGISTRATION",
      description: `New ${category} registered via Webhook: ${first_name} ${last_name}`,
    });

    return new Response(JSON.stringify({ success: true, message: "Registration successful" }), {
      status: 201,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Unexpected Error:", error);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
