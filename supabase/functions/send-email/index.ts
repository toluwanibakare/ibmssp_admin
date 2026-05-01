import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f7; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { padding: 30px; text-align: center; border-bottom: 4px solid #059669; }
    .content { padding: 40px; line-height: 1.6; color: #374151; font-size: 16px; }
    .footer { padding: 30px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px; }
    .content h1 { color: #111827; margin-top: 0; }
    .content p { margin-bottom: 1em; }
    .content img { max-width: 100%; border-radius: 8px; }
    .social-links { margin-bottom: 15px; }
    .social-links a { margin: 0 10px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://ukjmduimszrydwoyrksi.supabase.co/storage/v1/object/public/assets/ibmssp-logo.png" alt="IBMSSP" width="140">
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <div class="social-links">
        <a href="https://www.ibmssp.org.ng"><img src="https://img.icons8.com/color/48/linkedin.png" width="24" height="24"></a>
        <a href="https://www.ibmssp.org.ng"><img src="https://img.icons8.com/ios-filled/50/000000/twitterx--v1.png" width="24" height="24"></a>
      </div>
      <p>© ${new Date().getFullYear()} Institute of Business Management Systems Standards Practitioners.</p>
      <p><a href="https://www.ibmssp.org.ng" style="color: #059669; text-decoration: none; font-weight: bold;">www.ibmssp.org.ng</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { to, subject, text, html, recipientName } = await req.json();

    const finalHtml = wrapHtmlContent(html);

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
      content: text || "",
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
