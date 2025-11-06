import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Confirmation Link</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1 class="error">Invalid Confirmation Link</h1>
            <p>The confirmation link is invalid or expired.</p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("confirmation_token", token)
      .maybeSingle();

    if (findError || !subscriber) {
      console.error("Error finding subscriber:", findError);
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Confirmation Failed</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1 class="error">Confirmation Failed</h1>
            <p>We couldn't find your subscription. The link may have expired or already been used.</p>
          </body>
        </html>
        `,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Check if already confirmed
    if (subscriber.confirmed) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Already Confirmed</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .success { color: #3eb5a4; }
            </style>
          </head>
          <body>
            <h1 class="success">Already Confirmed!</h1>
            <p>Your email has already been confirmed. You're all set to receive our newsletter!</p>
            <a href="/" style="color: #3eb5a4; text-decoration: none;">← Back to SaskTask</a>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Confirm subscription
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        confirmed: true,
        confirmation_token: null,
      })
      .eq("confirmation_token", token);

    if (updateError) {
      console.error("Error confirming subscription:", updateError);
      throw updateError;
    }

    console.log("Newsletter subscription confirmed for:", subscriber.email);

    // Return success page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Subscription Confirmed!</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #3eb5a4 0%, #4fa8d5 100%);
              color: white;
            }
            .container {
              background: white;
              color: #333;
              padding: 40px;
              border-radius: 10px;
              max-width: 500px;
              margin: 0 auto;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            .success { color: #3eb5a4; font-size: 48px; margin-bottom: 20px; }
            h1 { margin-bottom: 20px; }
            a { 
              display: inline-block;
              margin-top: 20px;
              padding: 12px 30px;
              background: #3eb5a4;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            }
            a:hover { background: #359889; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <h1>Subscription Confirmed!</h1>
            <p>Thank you for confirming your email. You're now subscribed to the SaskTask newsletter and will receive updates about new features, tips, and opportunities.</p>
            <a href="/">Back to SaskTask</a>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error: any) {
    console.error("Error in confirm-newsletter function:", error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1 class="error">Oops! Something went wrong</h1>
          <p>Please try again later or contact support if the problem persists.</p>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
};

serve(handler);
