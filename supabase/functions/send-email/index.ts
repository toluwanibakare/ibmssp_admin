import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EMAIL_FOOTER_TEXT =
  "For more information visit our website: www.ibmssp.org.ng or contact us on: +2348023644148";
const EMAIL_FOOTER_HTML =
  '<br><br><hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" /><p style="font-size:12px;color:#555;">For more information visit our website: <a href="https://www.ibmssp.org.ng" target="_blank" rel="noopener noreferrer">www.ibmssp.org.ng</a> or contact us on: +2348023644148</p>';

function appendFooter(content: string | undefined, footer: string): string {
  const value = content || "";
  if (value.includes("www.ibmssp.org.ng") || value.includes("+2348023644148"))
    return value;
  return `${value}${value ? "\n\n" : ""}${footer}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const { to, subject, text, html, recipientName } = await req.json();

    if (!to || !subject || (!text && !html)) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields: to, subject, text/html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const finalText = appendFooter(text, EMAIL_FOOTER_TEXT);
    const finalHtml = appendFooter(html, EMAIL_FOOTER_HTML);

    // Send email via SMTP
    const smtpPort = Number(Deno.env.get("SMTP_PORT") || "465");
    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST")!,
        port: smtpPort,
        tls: true,
        auth: {
          username: Deno.env.get("SMTP_USER")!,
          password: Deno.env.get("SMTP_PASS")!,
        },
      },
    });

    await client.send({
      from: `${Deno.env.get("SMTP_FROM_NAME") || "IBMSSP"} <${Deno.env.get("SMTP_FROM")!}>`,
      to,
      subject,
      content: finalText,
      html: finalHtml,
    });

    await client.close();

    // Log to database
    await supabase.from("sent_emails").insert({
      recipient_email: to,
      recipient_name: recipientName || to,
      subject,
      body: finalHtml || finalText,
      status: "sent",
      sent_by: userId,
    });

    await supabase.from("activity_logs").insert({
      action: "EMAIL_SENT",
      description: `Email sent to ${to}: "${subject}"`,
      performed_by: userId,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send email error:", error);

    return new Response(
      JSON.stringify({ success: false, message: error.message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
