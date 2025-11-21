import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { bookingId, paymentId } = await req.json();
    
    // Fetch booking and task details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select(`
        *,
        tasks (
          title,
          description,
          category,
          pay_amount,
          task_giver:profiles!tasks_task_giver_id_fkey (full_name, email)
        ),
        task_doer:profiles!bookings_task_doer_id_fkey (full_name, email)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError) throw bookingError;

    // Fetch payment details
    const { data: payment } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    // Generate invoice number
    const { data: invoiceNumber } = await supabaseClient
      .rpc("generate_invoice_number");

    const subtotal = payment?.amount || booking.tasks.pay_amount;
    const platformFee = payment?.platform_fee || (subtotal * 0.15);
    const taxAmount = payment?.tax_deducted || (subtotal * 0.05);
    const totalAmount = subtotal;

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        user_id: booking.tasks.task_giver.id,
        booking_id: bookingId,
        task_id: booking.task_id,
        subtotal,
        tax_amount: taxAmount,
        platform_fee: platformFee,
        total_amount: totalAmount,
        status: payment ? "paid" : "draft",
        payment_id: paymentId,
        invoice_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: payment ? payment.paid_at : null
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Generate PDF HTML content
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .company { font-size: 24px; font-weight: bold; color: #2563eb; }
            .invoice-info { margin: 30px 0; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f3f4f6; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .total { font-size: 18px; font-weight: bold; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-draft { background: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">SaskTask</div>
            <p>Professional Task Services</p>
          </div>

          <div class="invoice-info">
            <div class="section">
              <span class="label">Invoice #:</span> ${invoice.invoice_number}<br>
              <span class="label">Date:</span> ${new Date(invoice.invoice_date).toLocaleDateString()}<br>
              <span class="label">Due Date:</span> ${new Date(invoice.due_date).toLocaleDateString()}<br>
              <span class="label">Status:</span> 
              <span class="status status-${invoice.status}">${invoice.status.toUpperCase()}</span>
            </div>

            <div class="section">
              <p class="label">Billed To:</p>
              <p>${booking.tasks.task_giver.full_name}<br>
              ${booking.tasks.task_giver.email}</p>
            </div>

            <div class="section">
              <p class="label">Service Provider:</p>
              <p>${booking.task_doer.full_name}<br>
              ${booking.task_doer.email}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${booking.tasks.title}<br>
                    <small style="color: #666;">${booking.tasks.description}</small>
                </td>
                <td>${booking.tasks.category}</td>
                <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="float: right; width: 300px;">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Platform Fee (15%):</td>
                <td style="text-align: right;">$${platformFee.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax (GST 5%):</td>
                <td style="text-align: right;">$${taxAmount.toFixed(2)}</td>
              </tr>
              <tr class="total">
                <td>Total:</td>
                <td style="text-align: right;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="clear: both; margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="text-align: center; color: #666; font-size: 12px;">
              Thank you for using SaskTask! For questions, contact support@sasktask.com
            </p>
          </div>
        </body>
      </html>
    `;

    return new Response(JSON.stringify({ 
      success: true,
      invoice: invoice,
      html: invoiceHTML
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Invoice Generation Error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate invoice" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
