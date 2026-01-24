import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the user's token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { format = 'json' } = await req.json();
    const userId = user.id;

    console.log(`Exporting data for user ${userId} in ${format} format`);

    // Collect all user data from various tables
    const userData: Record<string, any> = {
      exportDate: new Date().toISOString(),
      userId: userId,
      email: user.email,
    };

    // Profile data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    userData.profile = profile;

    // Tasks created by user
    const { data: tasksCreated } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('task_giver_id', userId);
    userData.tasksCreated = tasksCreated || [];

    // Bookings as task doer
    const { data: bookingsAsDoer } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('task_doer_id', userId);
    userData.bookingsAsDoer = bookingsAsDoer || [];

    // Reviews written
    const { data: reviewsWritten } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('reviewer_id', userId);
    userData.reviewsWritten = reviewsWritten || [];

    // Reviews received
    const { data: reviewsReceived } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('reviewee_id', userId);
    userData.reviewsReceived = reviewsReceived || [];

    // Messages sent
    const { data: messagesSent } = await supabaseClient
      .from('messages')
      .select('id, message, created_at, booking_id')
      .eq('sender_id', userId);
    userData.messagesSent = messagesSent || [];

    // Payments made
    const { data: paymentsMade } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('payer_id', userId);
    userData.paymentsMade = paymentsMade || [];

    // Payments received
    const { data: paymentsReceived } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('payee_id', userId);
    userData.paymentsReceived = paymentsReceived || [];

    // Notifications
    const { data: notifications } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId);
    userData.notifications = notifications || [];

    // Badges
    const { data: badges } = await supabaseClient
      .from('badges')
      .select('*')
      .eq('user_id', userId);
    userData.badges = badges || [];

    // Certificates
    const { data: certificates } = await supabaseClient
      .from('certificates')
      .select('*')
      .eq('user_id', userId);
    userData.certificates = certificates || [];

    // Portfolio items
    const { data: portfolioItems } = await supabaseClient
      .from('portfolio_items')
      .select('*')
      .eq('user_id', userId);
    userData.portfolioItems = portfolioItems || [];

    // Favorites
    const { data: favorites } = await supabaseClient
      .from('favorites')
      .select('*')
      .eq('user_id', userId);
    userData.favorites = favorites || [];

    // Saved searches
    const { data: savedSearches } = await supabaseClient
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId);
    userData.savedSearches = savedSearches || [];

    // Login history
    const { data: loginHistory } = await supabaseClient
      .from('login_history')
      .select('*')
      .eq('user_id', userId);
    userData.loginHistory = loginHistory || [];

    // Disputes raised
    const { data: disputesRaised } = await supabaseClient
      .from('disputes')
      .select('*')
      .eq('raised_by', userId);
    userData.disputesRaised = disputesRaised || [];

    // Service packages
    const { data: servicePackages } = await supabaseClient
      .from('service_packages')
      .select('*')
      .eq('tasker_id', userId);
    userData.servicePackages = servicePackages || [];

    // Availability slots
    const { data: availabilitySlots } = await supabaseClient
      .from('availability_slots')
      .select('*')
      .eq('user_id', userId);
    userData.availabilitySlots = availabilitySlots || [];

    // User roles
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    userData.userRoles = userRoles || [];

    // Payout accounts (sanitized)
    const { data: payoutAccounts } = await supabaseClient
      .from('payout_accounts')
      .select('id, account_type, account_status, bank_last4, created_at')
      .eq('user_id', userId);
    userData.payoutAccounts = payoutAccounts || [];

    console.log(`Collected data from ${Object.keys(userData).length} categories`);

    if (format === 'csv') {
      // Convert to CSV format
      const csvSections: string[] = [];
      
      for (const [key, value] of Object.entries(userData)) {
        if (Array.isArray(value) && value.length > 0) {
          const headers = Object.keys(value[0]).join(',');
          const rows = value.map(item => 
            Object.values(item).map(v => 
              typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
            ).join(',')
          ).join('\n');
          csvSections.push(`\n### ${key} ###\n${headers}\n${rows}`);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const headers = Object.keys(value).join(',');
          const row = Object.values(value).map(v => 
            typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
          ).join(',');
          csvSections.push(`\n### ${key} ###\n${headers}\n${row}`);
        }
      }
      
      const csvContent = `SaskTask Data Export - ${new Date().toISOString()}\nUser ID: ${userId}\n${csvSections.join('\n')}`;
      
      return new Response(csvContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="sasktask-data-export-${Date.now()}.csv"`,
        },
      });
    }

    // Return JSON format
    return new Response(JSON.stringify(userData, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="sasktask-data-export-${Date.now()}.json"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Failed to export data', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
