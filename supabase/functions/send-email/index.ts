import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOGO_URL = "https://ukjmduimszrydwoyrksi.supabase.co/storage/v1/object/public/assets/ibmssp-logo.png";

const EMAIL_FOOTER_TEXT =
  "\n---\nInstitute of Business Management Systems Standards Practitioners (IBMSSP)\n" +
  "A body of professionals in the business sustainability environment, registered by the Corporate Affairs Commission on June 12th, 2025.\n" +
  "Website: www.ibmssp.org.ng | WhatsApp: +2348023644148\n" +
  "LinkedIn: company/ibmssp | X: @ibmssp";

function buildBrandedEmail(innerHtml: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>IBMSSP</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9fafb;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 20px;border-bottom:3px solid #059669;background:#ffffff;">
              <img src="${LOGO_URL}" alt="IBMSSP" height="64" style="height:64px;width:auto;display:block;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;line-height:1.6;color:#374151;font-size:16px;">
              ${innerHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:40px 20px;background-color:#fcfcfc;border-top:1px solid #f1f5f9;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 24px;">
                <tr>
                  <td style="padding:0 8px;"><a href="https://www.linkedin.com/company/ibmssp" style="text-decoration:none;"><img src="https://img.icons8.com/color/48/linkedin.png" width="32" height="32" alt="LinkedIn" style="display:block;border:0;" /></a></td>
                  <td style="padding:0 8px;"><a href="https://x.com/ibmssp" style="text-decoration:none;"><img src="https://img.icons8.com/ios-filled/50/000000/twitterx--v1.png" width="32" height="32" alt="X" style="display:block;border:0;" /></a></td>
                  <td style="padding:0 8px;"><a href="https://wa.me/2348023644148" style="text-decoration:none;"><img src="https://img.icons8.com/color/48/whatsapp.png" width="32" height="32" alt="WhatsApp" style="display:block;border:0;" /></a></td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#111827;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
                © ${year} Institute of Business Management Systems Standards Practitioners (IBMSSP).
              </p>
              <p style="margin:0 0 16px;font-size:13px;color:#4b5563;max-width:480px;line-height:1.6;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
                A body of professionals in the business sustainability environment, registered by the Corporate Affairs Commission on June 12th, 2025.
              </p>
              <div style="border-top:1px solid #e5e7eb;width:48px;margin:0 auto 16px;"></div>
              <p style="margin:0;">
                <a href="https://www.ibmssp.org.ng" style="color:#059669;text-decoration:none;font-weight:600;font-size:13px;">www.ibmssp.org.ng</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function appendFooterText(content: string | undefined): string {
  const value = content || "";
  if (value.includes("www.ibmssp.org.ng")) return value;
  return `${value}${value ? "\n\n" : ""}${EMAIL_FOOTER_TEXT}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const innerHtml = html && html.trim().length > 0
      ? html
      : `<p>${(text || "").replace(/\n/g, "<br/>")}</p>`;
    const finalHtml = buildBrandedEmail(innerHtml);
    const finalText = appendFooterText(text || (html || "").replace(/<[^>]*>/g, ""));

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

    await supabase.from("sent_emails").insert({
      recipient_email: to,
      recipient_name: recipientName || to,
      subject,
      body: finalHtml,
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
      JSON.stringify({ success: false, message: (error as Error).message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
