import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    console.log("Running task expiration check at:", now.toISOString());

    // 1. Find tasks expiring within 24 hours that haven't had a reminder sent
    const { data: expiringTasks, error: expiringError } = await supabase
      .from("tasks")
      .select(
        `
        id,
        title,
        expires_at,
        task_giver_id,
        profiles!tasks_task_giver_id_fkey (
          full_name,
          email
        )
      `,
      )
      .eq("status", "open")
      .eq("expiry_reminder_sent", false)
      .not("expires_at", "is", null)
      .lte("expires_at", oneDayFromNow.toISOString())
      .gt("expires_at", now.toISOString());

    if (expiringError) {
      console.error("Error fetching expiring tasks:", expiringError);
    } else {
      console.log(`Found ${expiringTasks?.length || 0} tasks expiring soon`);

      // Send reminder emails
      for (const task of expiringTasks || []) {
        const profile = (task as any).profiles;
        if (profile?.email) {
          const expiresAt = new Date(task.expires_at!);
          const hoursLeft = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));

          try {
            await resend.emails.send({
              from: "SaskTask <onboarding@sending.tanjeen.com>",
              to: [profile.email],
              subject: `Your Task Expires in ${hoursLeft} Hours ⏰`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #1a1a1a; margin-bottom: 24px;">Task Expiring Soon!</h1>
                  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Hi ${profile.full_name || "there"},</p>
                  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                    Your task "<strong>${task.title}</strong>" will expire in approximately <strong>${hoursLeft} hours</strong>.
                  </p>
                  <div style="background: #fff3cd; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <p style="margin: 0; color: #856404;">
                      If no tasker has been assigned, the task will be automatically closed when it expires.
                    </p>
                  </div>
                  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                    You can extend the expiration date or close the task from your dashboard.
                  </p>
                  <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                    Best regards,<br>The SaskTask Team
                  </p>
                </div>
              `,
            });

            // Mark reminder as sent
            await supabase.from("tasks").update({ expiry_reminder_sent: true }).eq("id", task.id);

            console.log(`Sent expiry reminder for task ${task.id}`);
          } catch (emailError) {
            console.error(`Failed to send reminder for task ${task.id}:`, emailError);
          }
        }
      }
    }

    // 2. Find and expire tasks that have passed their expiration date
    const { data: expiredTasks, error: expiredError } = await supabase
      .from("tasks")
      .select("id, title")
      .eq("status", "open")
      .not("expires_at", "is", null)
      .lte("expires_at", now.toISOString());

    if (expiredError) {
      console.error("Error fetching expired tasks:", expiredError);
    } else {
      console.log(`Found ${expiredTasks?.length || 0} expired tasks to close`);

      // Update expired tasks to cancelled
      for (const task of expiredTasks || []) {
        const { error: updateError } = await supabase.from("tasks").update({ status: "cancelled" }).eq("id", task.id);

        if (updateError) {
          console.error(`Failed to expire task ${task.id}:`, updateError);
        } else {
          console.log(`Expired task ${task.id}: ${task.title}`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiringSoon: expiringTasks?.length || 0,
        expired: expiredTasks?.length || 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error: any) {
    console.error("Error in check-task-expiration function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
