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
  const safeContent = content || "";
  
  // Ultimate hard-coded template - no bail-out conditions
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>IBMSSP Notification</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style type="text/css">
    body { width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; margin: 0; padding: 0; background-color: #f4f4f7; }
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
    #backgroundTable { mso-table-lspace: 0pt; mso-table-rspace: 0pt; line-height: 100% !important; margin: 0; padding: 0; width: 100% !important; }
    img { outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; }
    .content-area h1, .content-area h2, .content-area p, .content-area li { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; color: #374151;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" id="backgroundTable" style="background-color: #f4f4f7;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          
          <!-- Green Brand Header -->
          <tr>
            <td align="center" style="padding: 30px 0; border-bottom: 4px solid #059669; background-color: #ffffff;">
              <img src="https://ukjmduimszrydwoyrksi.supabase.co/storage/v1/object/public/assets/ibmssp-logo.png" alt="IBMSSP" width="140" style="display: block; width: 140px; height: auto;" />
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td class="content-area" style="padding: 40px 30px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #374151;">
              <div style="width: 100%;">
                ${safeContent
                  .replace(/<h1>/g, '<h1 style="color: #111827; font-size: 24px; font-weight: bold; margin-bottom: 20px; margin-top: 0;">')
                  .replace(/<h2>/g, '<h2 style="color: #111827; font-size: 20px; font-weight: bold; margin-bottom: 15px; margin-top: 25px;">')
                  .replace(/<p>/g, '<p style="margin-bottom: 15px;">')
                  .replace(/<ul>/g, '<ul style="margin-bottom: 15px; padding-left: 20px;">')
                  .replace(/<li>/g, '<li style="margin-bottom: 5px;">')
                  .replace(/<img /g, '<img style="border-radius: 8px; max-width: 100%; height: auto; margin: 15px 0; display: block;" ')
                }
              </div>
            </td>
          </tr>

          <!-- Professional Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #f3f4f6;">
              <div style="margin-bottom: 20px;">
                <a href="https://www.ibmssp.org.ng" style="display: inline-block; margin: 0 10px;"><img src="https://img.icons8.com/color/48/linkedin.png" width="24" height="24" alt="LinkedIn" /></a>
                <a href="https://www.ibmssp.org.ng" style="display: inline-block; margin: 0 10px;"><img src="https://img.icons8.com/ios-filled/50/000000/twitterx--v1.png" width="24" height="24" alt="X" /></a>
              </div>
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Institute of Business Management Systems Standards Practitioners.
              </p>
              <p style="margin: 5px 0 0; font-family: Arial, sans-serif; font-size: 12px; color: #9ca3af;">
                <a href="https://www.ibmssp.org.ng" style="color: #059669; text-decoration: none; font-weight: bold;">www.ibmssp.org.ng</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function appendFooter(content: string | undefined, footer: string): string {
  const value = content || "";
  if (value.includes("---")) return value; // Use a separator as a marker instead
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
