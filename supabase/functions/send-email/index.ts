import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EMAIL_FOOTER_TEXT = 
  "\n---\nInstitute of Business Management Systems Standards Practitioners (IBMSSP)\n" +
  "A body of professionals in the business sustainability environment, registered by the Corporate Affairs Commission in June 12th, 2025.\n" +
  "Website: www.ibmssp.org.ng | WhatsApp: +2348023644148\n" +
  "LinkedIn: company/ibmssp | X: @ibmssp";

const EMAIL_HEADER_HTML = `
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-bottom: 3px solid #059669;">
    <tr>
      <td align="center" style="padding: 25px 0;">
        <img src="https://ukjmduimszrydwoyrksi.supabase.co/storage/v1/object/public/assets/ibmssp-logo.png" alt="IBMSSP" style="height: 70px; width: auto; display: block; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));" onerror="this.style.display='none'; this.nextSibling.style.display='block';" /><span style="display:none; color: #059669; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">IBMSSP</span>
      </td>
    </tr>
  </table>
`;

const EMAIL_FOOTER_HTML = `
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px; background-color: #fcfcfc; border-top: 1px solid #eeeeee;">
    <tr>
      <td align="center" style="padding: 30px 20px;">
        <div style="margin-bottom: 20px;">
          <a href="https://www.linkedin.com/company/ibmssp" style="display: inline-block; margin: 0 12px; text-decoration: none;">
            <img src="https://img.icons8.com/color/48/linkedin.png" width="28" height="28" alt="LinkedIn" />
          </a>
          <a href="https://x.com/ibmssp" style="display: inline-block; margin: 0 12px; text-decoration: none;">
            <img src="https://img.icons8.com/ios-filled/50/000000/twitterx--v1.png" width="28" height="28" alt="X" />
          </a>
          <a href="https://wa.me/2348023644148" style="display: inline-block; margin: 0 12px; text-decoration: none;">
            <img src="https://img.icons8.com/color/48/whatsapp.png" width="28" height="28" alt="WhatsApp" />
          </a>
        </div>
        
        <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #666666; max-width: 500px;">
          <p style="margin: 0; font-weight: 700; color: #111827;">
            © \${new Date().getFullYear()} Institute of Business Management Systems Standards Practitioners (IBMSSP).
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            A body of professionals in the business sustainability environment, registered by the Corporate Affairs Commission in June 12th, 2025.
          </p>
          <div style="border-top: 1px solid #eeeeee; margin: 15px auto; width: 40px;"></div>
          <p style="margin: 0;">
            <a href="https://www.ibmssp.org.ng" style="color: #059669; text-decoration: none; font-weight: 600;">Visit website: www.ibmssp.org.ng</a>
          </p>
        </div>
      </td>
    </tr>
  </table>
`;

function wrapHtmlContent(content: string | undefined): string {
  if (!content) return "";
  if (content.includes('id="ibmssp-email-wrapper"')) return content;
  return \`
    <div id="ibmssp-email-wrapper" style="background-color: #f9fafb; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        \${EMAIL_HEADER_HTML}
        <div style="padding: 40px; line-height: 1.6; color: #374151; font-size: 16px;">
          \${content}
        </div>
        \${EMAIL_FOOTER_HTML}
      </div>
    </div>
  \`;
}

function appendFooter(content: string | undefined, footer: string): string {
  const value = content || "";
  if (value.includes("---")) return value; // Use a separator as a marker instead
  return \`\${value}\${value ? "\n\n" : ""}\${footer}\`;
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
    const finalHtml = wrapHtmlContent(html);

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
