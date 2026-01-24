import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportOptions {
  format?: 'json' | 'csv';
  categories?: string[];
  anonymize?: boolean;
}

function anonymizeEmail(email: string | null): string | null {
  if (!email) return null;
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.substring(0, 2)}***@${domain}`;
}

function anonymizeName(name: string | null): string | null {
  if (!name) return null;
  return name.split(' ').map(n => n[0] + '***').join(' ');
}

function anonymizePhone(phone: string | null): string | null {
  if (!phone) return null;
  return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
}

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

    const options: ExportOptions = await req.json();
    const { 
      format = 'json', 
      categories = [], 
      anonymize = false 
    } = options;
    
    const userId = user.id;
    const allCategories = categories.length === 0;

    console.log(`Exporting data for user ${userId} in ${format} format`);
    console.log(`Categories: ${allCategories ? 'all' : categories.join(', ')}`);
    console.log(`Anonymize: ${anonymize}`);

    // Initialize user data object
    const userData: Record<string, any> = {
      exportMetadata: {
        exportDate: new Date().toISOString(),
        userId: userId,
        email: anonymize ? anonymizeEmail(user.email || null) : user.email,
        format: format,
        categoriesIncluded: allCategories ? 'all' : categories,
        anonymized: anonymize,
        version: '2.0'
      }
    };

    // Helper to check if category should be included
    const shouldInclude = (cat: string) => allCategories || categories.includes(cat);

    // Profile data (always included if requested)
    if (shouldInclude('profile')) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profile) {
        userData.profile = anonymize ? {
          ...profile,
          email: anonymizeEmail(profile.email),
          full_name: anonymizeName(profile.full_name),
          phone: anonymizePhone(profile.phone),
          address: profile.address ? '***' : null,
        } : profile;
      }
    }

    // Tasks created by user
    if (shouldInclude('tasks')) {
      const { data: tasksCreated } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('task_giver_id', userId)
        .order('created_at', { ascending: false });
      
      if (tasksCreated && tasksCreated.length > 0) {
        userData.tasksCreated = anonymize 
          ? tasksCreated.map(t => ({
              ...t,
              location: t.location ? '***' : null,
              address: t.address ? '***' : null,
            }))
          : tasksCreated;
      }
    }

    // Bookings as task doer
    if (shouldInclude('bookings')) {
      const { data: bookingsAsDoer } = await supabaseClient
        .from('bookings')
        .select('*')
        .eq('task_doer_id', userId)
        .order('created_at', { ascending: false });
      userData.bookingsAsDoer = bookingsAsDoer || [];

      // Also get bookings for tasks created by user
      const { data: tasksForBookings } = await supabaseClient
        .from('tasks')
        .select('id')
        .eq('task_giver_id', userId);
      
      if (tasksForBookings && tasksForBookings.length > 0) {
        const taskIds = tasksForBookings.map(t => t.id);
        const { data: bookingsForMyTasks } = await supabaseClient
          .from('bookings')
          .select('*')
          .in('task_id', taskIds)
          .order('created_at', { ascending: false });
        userData.bookingsForMyTasks = bookingsForMyTasks || [];
      }
    }

    // Reviews written and received
    if (shouldInclude('reviews')) {
      const { data: reviewsWritten } = await supabaseClient
        .from('reviews')
        .select('*')
        .eq('reviewer_id', userId)
        .order('created_at', { ascending: false });
      userData.reviewsWritten = reviewsWritten || [];

      const { data: reviewsReceived } = await supabaseClient
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });
      userData.reviewsReceived = reviewsReceived || [];
    }

    // Messages sent and received
    if (shouldInclude('messages')) {
      const { data: messagesSent } = await supabaseClient
        .from('messages')
        .select('id, message, created_at, booking_id, receiver_id, read_at, edited_at')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })
        .limit(500);
      
      userData.messagesSent = anonymize 
        ? (messagesSent || []).map(m => ({
            ...m,
            message: m.message?.substring(0, 50) + (m.message?.length > 50 ? '...[truncated]' : ''),
          }))
        : messagesSent || [];

      const { data: messagesReceived } = await supabaseClient
        .from('messages')
        .select('id, message, created_at, booking_id, sender_id, read_at')
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false })
        .limit(500);
      
      userData.messagesReceived = anonymize 
        ? (messagesReceived || []).map(m => ({
            ...m,
            message: m.message?.substring(0, 50) + (m.message?.length > 50 ? '...[truncated]' : ''),
          }))
        : messagesReceived || [];
    }

    // Payments made and received
    if (shouldInclude('payments')) {
      const { data: paymentsMade } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('payer_id', userId)
        .order('created_at', { ascending: false });
      
      userData.paymentsMade = anonymize 
        ? (paymentsMade || []).map(p => ({
            ...p,
            payment_intent_id: p.payment_intent_id ? '***' : null,
            transaction_id: p.transaction_id ? '***' : null,
          }))
        : paymentsMade || [];

      const { data: paymentsReceived } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('payee_id', userId)
        .order('created_at', { ascending: false });
      
      userData.paymentsReceived = anonymize 
        ? (paymentsReceived || []).map(p => ({
            ...p,
            payment_intent_id: p.payment_intent_id ? '***' : null,
            transaction_id: p.transaction_id ? '***' : null,
          }))
        : paymentsReceived || [];
    }

    // Notifications
    if (shouldInclude('notifications')) {
      const { data: notifications } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(200);
      userData.notifications = notifications || [];
    }

    // Badges
    if (shouldInclude('badges')) {
      const { data: badges } = await supabaseClient
        .from('badges')
        .select('*')
        .eq('user_id', userId);
      userData.badges = badges || [];
    }

    // Certificates
    if (shouldInclude('certificates')) {
      const { data: certificates } = await supabaseClient
        .from('certificates')
        .select('*')
        .eq('user_id', userId);
      userData.certificates = certificates || [];
    }

    // Portfolio items
    if (shouldInclude('portfolio')) {
      const { data: portfolioItems } = await supabaseClient
        .from('portfolio_items')
        .select('*')
        .eq('user_id', userId);
      userData.portfolioItems = portfolioItems || [];
    }

    // Favorites
    if (shouldInclude('favorites')) {
      const { data: favorites } = await supabaseClient
        .from('favorites')
        .select('*')
        .eq('user_id', userId);
      userData.favorites = favorites || [];
    }

    // Saved searches
    if (shouldInclude('savedSearches')) {
      const { data: savedSearches } = await supabaseClient
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId);
      userData.savedSearches = savedSearches || [];
    }

    // Availability slots
    if (shouldInclude('availability')) {
      const { data: availabilitySlots } = await supabaseClient
        .from('availability_slots')
        .select('*')
        .eq('user_id', userId);
      userData.availabilitySlots = availabilitySlots || [];
    }

    // Login history
    if (shouldInclude('loginHistory')) {
      const { data: loginHistory } = await supabaseClient
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .order('login_at', { ascending: false })
        .limit(100);
      
      userData.loginHistory = anonymize 
        ? (loginHistory || []).map(l => ({
            ...l,
            ip_address: l.ip_address ? '***' : null,
            user_agent: l.user_agent?.substring(0, 50) || null,
          }))
        : loginHistory || [];
    }

    // Disputes raised
    if (shouldInclude('disputes')) {
      const { data: disputesRaised } = await supabaseClient
        .from('disputes')
        .select('*')
        .eq('raised_by', userId)
        .order('created_at', { ascending: false });
      userData.disputesRaised = disputesRaised || [];

      const { data: disputesAgainst } = await supabaseClient
        .from('disputes')
        .select('*')
        .eq('against_user', userId)
        .order('created_at', { ascending: false });
      userData.disputesAgainst = disputesAgainst || [];
    }

    // Service packages
    if (shouldInclude('profile')) {
      const { data: servicePackages } = await supabaseClient
        .from('service_packages')
        .select('*')
        .eq('tasker_id', userId);
      userData.servicePackages = servicePackages || [];
    }

    // User roles
    if (shouldInclude('profile')) {
      const { data: userRoles } = await supabaseClient
        .from('user_roles')
        .select('role, created_at')
        .eq('user_id', userId);
      userData.userRoles = userRoles || [];
    }

    // Payout accounts (always sanitized)
    if (shouldInclude('payoutAccounts')) {
      const { data: payoutAccounts } = await supabaseClient
        .from('payout_accounts')
        .select('id, account_type, account_status, bank_last4, created_at')
        .eq('user_id', userId);
      userData.payoutAccounts = (payoutAccounts || []).map(p => ({
        ...p,
        stripe_account_id: '***[hidden for security]***'
      }));
    }

    // Export summary
    const categories_exported = Object.keys(userData).filter(k => k !== 'exportMetadata');
    const total_records = categories_exported.reduce((sum, key) => {
      const val = userData[key];
      if (Array.isArray(val)) return sum + val.length;
      if (val && typeof val === 'object') return sum + 1;
      return sum;
    }, 0);

    userData.exportSummary = {
      categoriesExported: categories_exported.length,
      totalRecords: total_records,
      exportedAt: new Date().toISOString()
    };

    console.log(`Collected data from ${categories_exported.length} categories, ${total_records} total records`);

    if (format === 'csv') {
      // Convert to CSV format
      const csvSections: string[] = [];
      csvSections.push(`SaskTask Data Export`);
      csvSections.push(`Export Date: ${new Date().toISOString()}`);
      csvSections.push(`User ID: ${userId}`);
      csvSections.push(`Anonymized: ${anonymize}`);
      csvSections.push(`Total Records: ${total_records}`);
      csvSections.push('');
      
      for (const [key, value] of Object.entries(userData)) {
        if (key === 'exportMetadata' || key === 'exportSummary') continue;
        
        if (Array.isArray(value) && value.length > 0) {
          const headers = Object.keys(value[0]);
          const headerRow = headers.join(',');
          const rows = value.map(item => 
            headers.map(h => {
              const val = item[h];
              if (val === null || val === undefined) return '';
              if (typeof val === 'string') return `"${val.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
              if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
              return val;
            }).join(',')
          ).join('\n');
          csvSections.push(`\n=== ${key.toUpperCase()} (${value.length} records) ===`);
          csvSections.push(headerRow);
          csvSections.push(rows);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const headers = Object.keys(value);
          const headerRow = headers.join(',');
          const row = headers.map(h => {
            const val = value[h];
            if (val === null || val === undefined) return '';
            if (typeof val === 'string') return `"${val.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            return val;
          }).join(',');
          csvSections.push(`\n=== ${key.toUpperCase()} ===`);
          csvSections.push(headerRow);
          csvSections.push(row);
        }
      }
      
      const csvContent = csvSections.join('\n');
      
      return new Response(csvContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sasktask-data-export-${Date.now()}.csv"`,
        },
      });
    }

    // Return JSON format
    return new Response(JSON.stringify(userData, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
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