import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SEND-INVOICE-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { paymentId, recipientEmail } = await req.json();
    if (!paymentId) throw new Error("Payment ID is required");
    logStep("Request received", { paymentId, recipientEmail });

    // Fetch payment with related data
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError) throw paymentError;
    if (!payment) throw new Error("Payment not found");

    // Verify user is part of this payment
    if (payment.payer_id !== user.id && payment.payee_id !== user.id) {
      throw new Error("Unauthorized to send this invoice");
    }

    // Fetch booking details
    const { data: booking } = await supabaseClient
      .from("bookings")
      .select(
        `
        *,
        tasks (
          title,
          description,
          category,
          pay_amount,
          scheduled_date,
          location
        )
      `,
      )
      .eq("id", payment.booking_id)
      .single();

    // Fetch payer and payee profiles
    const { data: payer } = await supabaseClient
      .from("profiles")
      .select("full_name, email, phone, address, city")
      .eq("id", payment.payer_id)
      .single();

    const { data: payee } = await supabaseClient
      .from("profiles")
      .select("full_name, email, phone, address, city")
      .eq("id", payment.payee_id)
      .single();

    // Determine recipient
    const emailTo = recipientEmail || (payment.payer_id === user.id ? payer?.email : payee?.email);
    if (!emailTo) throw new Error("No recipient email found");

    logStep("Sending to email", { emailTo });

    const invoiceNumber = `INV-${payment.id.substring(0, 8).toUpperCase()}`;
    const invoiceDate = payment.paid_at ? new Date(payment.paid_at) : new Date(payment.created_at);
    const subtotal = payment.amount;
    const platformFee = payment.platform_fee;
    const payoutAmount = payment.payout_amount;

    // Generate email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">SaskTask</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Invoice ${invoiceNumber}</p>
            </div>
            
            <!-- Status Badge -->
            <div style="text-align: center; padding: 20px 0;">
              <span style="display: inline-block; padding: 8px 20px; background-color: ${payment.status === "completed" ? "#dcfce7" : "#dbeafe"}; color: ${payment.status === "completed" ? "#166534" : "#1e40af"}; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                ${payment.status === "completed" ? "✓ Paid" : payment.escrow_status === "held" ? "🔒 In Escrow" : "⏳ Pending"}
              </span>
            </div>

            <!-- Invoice Content -->
            <div style="padding: 0 32px;">
              <!-- Parties -->
              <table style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">From</p>
                    <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${payee?.full_name || "Service Provider"}</p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">${payee?.email || ""}</p>
                  </td>
                  <td style="width: 16px;"></td>
                  <td style="width: 50%; vertical-align: top; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">To</p>
                    <p style="margin: 0; font-weight: 600; color: #1a1a1a;">${payer?.full_name || "Client"}</p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">${payer?.email || ""}</p>
                  </td>
                </tr>
              </table>

              <!-- Task Details -->
              <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Service</p>
                <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${booking?.tasks?.title || "Task Service"}</p>
                <p style="margin: 0; font-size: 14px; color: #64748b;">${booking?.tasks?.category || "General"} • ${booking?.tasks?.location || "Location not specified"}</p>
              </div>

              <!-- Amount Summary -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Subtotal</td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right;">$${subtotal.toFixed(2)} CAD</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Platform Fee</td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right; color: #dc2626;">-$${platformFee.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 12px;"></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 18px; font-weight: 700; color: #2563eb;">Total</td>
                    <td style="padding: 8px 0; font-size: 18px; font-weight: 700; text-align: right; color: #2563eb;">$${subtotal.toFixed(2)} CAD</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #166534; font-weight: 600;">Tasker Payout</td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right; color: #166534; font-weight: 600;">$${payoutAmount.toFixed(2)} CAD</td>
                  </tr>
                </table>
              </div>

              <!-- Invoice Date -->
              <p style="text-align: center; font-size: 12px; color: #64748b; margin-bottom: 24px;">
                Invoice Date: ${invoiceDate.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #2563eb; font-weight: 600;">Thank you for using SaskTask!</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Questions? Contact us at support@sasktask.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "SaskTask <invoices@tanjeen.com>",
      to: [emailTo],
      subject: `Invoice ${invoiceNumber} - ${booking?.tasks?.title || "Task Payment"}`,
      html: emailHTML,
    });

    if (emailError) {
      logStep("Email send error", emailError);
      throw new Error(emailError.message || "Failed to send email");
    }

    logStep("Email sent successfully", { emailId: emailData?.id });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invoice sent to ${emailTo}`,
        invoiceNumber,
        emailId: emailData?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send invoice email",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
