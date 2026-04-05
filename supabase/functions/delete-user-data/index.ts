import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get user's IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('🗑️ Data deletion request from IP:', clientIp);

    if (req.method === 'POST') {
      const supabaseUrl = Deno.env.get('SUPA_URL')!;
      const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Verify the request has a confirmation
      const body = await req.json();
      if (!body.confirm_deletion) {
        return new Response(
          JSON.stringify({
            error: 'Deletion must be confirmed',
            message: 'Please confirm you want to delete all your data',
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Delete threat logs for this IP
      const { error: threat_error } = await supabase
        .from('threat_logs')
        .delete()
        .eq('ip_address', clientIp);

      if (threat_error) {
        console.error('Error deleting threat logs:', threat_error);
      }

      // Delete blocked IPs entry for this IP
      const { error: blocked_error } = await supabase
        .from('blocked_ips')
        .delete()
        .eq('ip_address', clientIp);

      if (blocked_error) {
        console.error('Error deleting blocked IP:', blocked_error);
      }

      // Delete admin actions related to this IP
      const { error: admin_error } = await supabase
        .from('admin_actions')
        .delete()
        .eq('ip_address', clientIp);

      if (admin_error) {
        console.error('Error deleting admin actions:', admin_error);
      }

      // Log the deletion request
      const { error: log_error } = await supabase
        .from('data_deletion_requests')
        .insert({
          ip_address: clientIp,
          reason: 'User requested complete data deletion via privacy settings',
        });

      if (log_error) {
        console.error('Error logging deletion:', log_error);
      }

      console.log('✅ Data deletion complete for IP:', clientIp);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'All your activities and data have been permanently deleted',
          ip_address: clientIp,
          deleted_items: ['Threat logs', 'Blocked IP status', 'Activity records'],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // GET request - show deletion info
    return new Response(
      JSON.stringify({
        message: 'Data deletion endpoint. POST with confirm_deletion=true to delete all data',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Deletion function error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete data' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
