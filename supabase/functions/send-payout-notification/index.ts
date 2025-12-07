import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYOUT-NOTIFICATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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

    const { 
      payoutAmount, 
      payoutType, 
      bankLast4, 
      transactionCount,
      paymentIds 
    } = await req.json();

    if (!payoutAmount) throw new Error("Payout amount is required");
    logStep("Request received", { payoutAmount, payoutType, transactionCount });

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile?.email) throw new Error("User email not found");

    const recipientEmail = profile.email;
    const recipientName = profile.full_name || "Tasker";
    const payoutDate = new Date().toLocaleDateString('en-CA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Determine payout type label
    const payoutTypeLabels: Record<string, string> = {
      'manual': 'Manual Withdrawal',
      'auto_weekly': 'Weekly Auto-Payout',
      'auto_biweekly': 'Bi-Weekly Auto-Payout',
      'auto_monthly': 'Monthly Auto-Payout',
    };
    const payoutLabel = payoutTypeLabels[payoutType] || 'Payout';

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
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">💰 Payout Processed!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">${payoutLabel}</p>
            </div>
            
            <!-- Success Badge -->
            <div style="text-align: center; padding: 24px 0;">
              <div style="display: inline-block; width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; line-height: 64px; font-size: 32px;">
                ✓
              </div>
            </div>

            <!-- Greeting -->
            <div style="padding: 0 32px; text-align: center;">
              <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 24px;">Hey ${recipientName}!</h2>
              <p style="margin: 0; font-size: 16px; color: #64748b;">Great news! Your payout has been successfully processed.</p>
            </div>

            <!-- Payout Details -->
            <div style="padding: 24px 32px;">
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 24px; text-align: center; border: 1px solid #86efac;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Amount Transferred</p>
                <p style="margin: 0; font-size: 42px; font-weight: 700; color: #166534;">$${payoutAmount.toFixed(2)}</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #22c55e;">CAD</p>
              </div>
            </div>

            <!-- Transaction Details -->
            <div style="padding: 0 32px 24px;">
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Payout Type</td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600; color: #1a1a1a;">${payoutLabel}</td>
                  </tr>
                  ${bankLast4 ? `
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Bank Account</td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600; color: #1a1a1a;">•••• ${bankLast4}</td>
                  </tr>
                  ` : ''}
                  ${transactionCount ? `
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Tasks Included</td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600; color: #1a1a1a;">${transactionCount} ${transactionCount === 1 ? 'task' : 'tasks'}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Processed On</td>
                    <td style="padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600; color: #1a1a1a;">${payoutDate}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Timeline -->
            <div style="padding: 0 32px 24px;">
              <div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>⏱️ Expected Arrival:</strong> Funds typically arrive in your bank account within 2-3 business days.
                </p>
              </div>
            </div>

            <!-- CTA -->
            <div style="padding: 0 32px 32px; text-align: center;">
              <a href="https://sasktask.com/payouts" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                View Payout History
              </a>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #2563eb; font-weight: 600;">Keep up the great work! 🎉</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Questions about your payout? Contact us at support@sasktask.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "SaskTask <payouts@resend.dev>",
      to: [recipientEmail],
      subject: `✓ Payout of $${payoutAmount.toFixed(2)} Processed - SaskTask`,
      html: emailHTML,
    });

    if (emailError) {
      logStep("Email send error", emailError);
      throw new Error(emailError.message || "Failed to send email");
    }

    logStep("Email sent successfully", { emailId: emailData?.id, to: recipientEmail });

    // Optionally update payment records to mark as notified
    if (paymentIds && paymentIds.length > 0) {
      logStep("Marking payments as notified", { count: paymentIds.length });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Payout notification sent to ${recipientEmail}`,
      emailId: emailData?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to send payout notification" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
