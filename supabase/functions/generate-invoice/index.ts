import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-INVOICE] ${step}${detailsStr}`);
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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { paymentId } = await req.json();
    if (!paymentId) throw new Error("Payment ID is required");
    logStep("Payment ID received", { paymentId });

    // Fetch payment with related data
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError) throw paymentError;
    if (!payment) throw new Error("Payment not found");
    logStep("Payment fetched", { status: payment.status });

    // Verify user is part of this payment
    if (payment.payer_id !== user.id && payment.payee_id !== user.id) {
      throw new Error("Unauthorized to view this invoice");
    }

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select(`
        *,
        tasks (
          title,
          description,
          category,
          pay_amount,
          scheduled_date,
          location
        )
      `)
      .eq("id", payment.booking_id)
      .single();

    if (bookingError) {
      logStep("Booking fetch error", { error: bookingError.message });
    }
    logStep("Booking fetched", { taskTitle: booking?.tasks?.title });

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

    logStep("Profiles fetched", { payer: payer?.full_name, payee: payee?.full_name });

    // Generate invoice number from payment ID
    const invoiceNumber = `INV-${payment.id.substring(0, 8).toUpperCase()}`;
    const invoiceDate = payment.paid_at ? new Date(payment.paid_at) : new Date(payment.created_at);
    
    const subtotal = payment.amount;
    const platformFee = payment.platform_fee;
    const payoutAmount = payment.payout_amount;
    const taxDeducted = payment.tax_deducted || 0;

    // Generate PDF-ready HTML content
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice ${invoiceNumber}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px; 
              background: #fff;
              color: #1a1a1a;
              line-height: 1.6;
            }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2563eb;
            }
            .logo { 
              font-size: 32px; 
              font-weight: bold; 
              color: #2563eb;
              letter-spacing: -1px;
            }
            .logo-tagline { font-size: 12px; color: #666; margin-top: 4px; }
            .invoice-title { text-align: right; }
            .invoice-title h1 { font-size: 28px; color: #1a1a1a; margin-bottom: 8px; }
            .invoice-number { font-size: 14px; color: #666; }
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              margin-top: 8px;
            }
            .status-completed { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-held { background: #dbeafe; color: #1e40af; }
            
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 40px; 
              margin-bottom: 40px; 
            }
            .info-section h3 { 
              font-size: 11px; 
              text-transform: uppercase; 
              letter-spacing: 1px;
              color: #666; 
              margin-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }
            .info-section p { font-size: 14px; margin-bottom: 4px; }
            .info-section .name { font-weight: 600; font-size: 16px; }
            
            .details-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px;
            }
            .details-table th { 
              background: #f8fafc; 
              padding: 14px 16px; 
              text-align: left; 
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748b;
              border-bottom: 2px solid #e2e8f0;
            }
            .details-table td { 
              padding: 16px; 
              border-bottom: 1px solid #f1f5f9;
              vertical-align: top;
            }
            .details-table .task-title { font-weight: 600; margin-bottom: 4px; }
            .details-table .task-desc { font-size: 13px; color: #666; }
            .details-table .amount { text-align: right; font-weight: 600; }
            
            .summary-section {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 40px;
            }
            .summary-table { width: 320px; }
            .summary-table tr td { padding: 10px 0; font-size: 14px; }
            .summary-table tr td:last-child { text-align: right; }
            .summary-table .subtotal { border-top: 1px solid #e5e7eb; padding-top: 16px; }
            .summary-table .total { 
              font-size: 18px; 
              font-weight: 700; 
              color: #2563eb;
              border-top: 2px solid #2563eb;
              padding-top: 16px;
            }
            .summary-table .payout {
              background: #f0fdf4;
              padding: 12px;
              border-radius: 8px;
            }
            .summary-table .payout td { color: #166534; font-weight: 600; }
            
            .footer { 
              margin-top: 60px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb;
              text-align: center;
            }
            .footer p { font-size: 12px; color: #666; margin-bottom: 4px; }
            .footer .thank-you { 
              font-size: 16px; 
              color: #2563eb; 
              font-weight: 600;
              margin-bottom: 12px;
            }
            
            @media print {
              body { padding: 20px; }
              .invoice-container { max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div>
                <div class="logo">SaskTask</div>
                <div class="logo-tagline">Professional Task Services</div>
              </div>
              <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-number">${invoiceNumber}</div>
                <div class="status-badge status-${payment.status === 'completed' ? 'completed' : payment.escrow_status === 'held' ? 'held' : 'pending'}">
                  ${payment.status === 'completed' ? 'Paid' : payment.escrow_status === 'held' ? 'In Escrow' : 'Pending'}
                </div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-section">
                <h3>Bill From</h3>
                <p class="name">${payee?.full_name || 'Service Provider'}</p>
                <p>${payee?.email || ''}</p>
                ${payee?.phone ? `<p>${payee.phone}</p>` : ''}
                ${payee?.city ? `<p>${payee.city}</p>` : ''}
              </div>
              <div class="info-section">
                <h3>Bill To</h3>
                <p class="name">${payer?.full_name || 'Client'}</p>
                <p>${payer?.email || ''}</p>
                ${payer?.phone ? `<p>${payer.phone}</p>` : ''}
                ${payer?.city ? `<p>${payer.city}</p>` : ''}
              </div>
              <div class="info-section">
                <h3>Invoice Details</h3>
                <p><strong>Invoice Date:</strong> ${invoiceDate.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Payment Method:</strong> ${payment.payment_method || 'Stripe'}</p>
                ${payment.transaction_id ? `<p><strong>Transaction ID:</strong> ${payment.transaction_id}</p>` : ''}
              </div>
              <div class="info-section">
                <h3>Task Details</h3>
                <p><strong>Category:</strong> ${booking?.tasks?.category || 'General'}</p>
                <p><strong>Location:</strong> ${booking?.tasks?.location || 'Not specified'}</p>
                ${booking?.tasks?.scheduled_date ? `<p><strong>Date:</strong> ${new Date(booking.tasks.scheduled_date).toLocaleDateString()}</p>` : ''}
              </div>
            </div>

            <table class="details-table">
              <thead>
                <tr>
                  <th style="width: 60%;">Description</th>
                  <th>Category</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="task-title">${booking?.tasks?.title || 'Task Service'}</div>
                    <div class="task-desc">${booking?.tasks?.description ? booking.tasks.description.substring(0, 150) + (booking.tasks.description.length > 150 ? '...' : '') : 'Professional task service provided through SaskTask platform.'}</div>
                  </td>
                  <td>${booking?.tasks?.category || 'Service'}</td>
                  <td class="amount">$${subtotal.toFixed(2)} CAD</td>
                </tr>
              </tbody>
            </table>

            <div class="summary-section">
              <table class="summary-table">
                <tr>
                  <td>Subtotal</td>
                  <td>$${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Platform Fee (${((platformFee / subtotal) * 100).toFixed(0)}%)</td>
                  <td>-$${platformFee.toFixed(2)}</td>
                </tr>
                ${taxDeducted > 0 ? `
                <tr>
                  <td>Tax Deducted</td>
                  <td>-$${taxDeducted.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total">
                  <td>Total</td>
                  <td>$${subtotal.toFixed(2)} CAD</td>
                </tr>
                <tr class="payout">
                  <td>Tasker Payout</td>
                  <td>$${payoutAmount.toFixed(2)} CAD</td>
                </tr>
              </table>
            </div>

            <div class="footer">
              <p class="thank-you">Thank you for using SaskTask!</p>
              <p>This invoice was generated automatically by SaskTask.</p>
              <p>For questions or support, contact us at support@sasktask.com</p>
              <p style="margin-top: 12px; font-size: 10px; color: #999;">
                Generated on ${new Date().toLocaleString('en-CA')}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    logStep("Invoice HTML generated successfully");

    return new Response(JSON.stringify({ 
      success: true,
      invoiceNumber,
      html: invoiceHTML,
      payment: {
        id: payment.id,
        amount: subtotal,
        platformFee,
        payoutAmount,
        status: payment.status,
        paidAt: payment.paid_at
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate invoice" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});