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
    // Get user's IP - try multiple headers
    let clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (!clientIp) {
      clientIp = req.headers.get('x-real-ip')?.trim();
    }
    if (!clientIp) {
      clientIp = req.headers.get('cf-connecting-ip')?.trim();
    }
    if (!clientIp) {
      clientIp = 'unknown';
    }

    console.log('🗑️ Data deletion request from IP:', clientIp);

    if (req.method === 'POST') {
      const supabaseUrl = Deno.env.get('SUPA_URL')!;
      const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Verify the request has a confirmation
      const body = await req.json();
      if (!body.confirm_deletion) {
        console.warn('⚠️ Deletion not confirmed');
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

      // Use IP from frontend if provided, otherwise fall back to header extraction
      let ipToDelete = body.user_ip || clientIp;
      console.log('🗑️ Using IP for deletion:', ipToDelete, '(from:', body.user_ip ? 'frontend' : 'headers', ')');

      let deletedCount = 0;

      // Delete threat logs for this IP
      console.log('🗑️ Deleting threat_logs for IP:', ipToDelete);
      const { data: threat_logs_deleted, error: threat_error } = await supabase
        .from('threat_logs')
        .delete()
        .eq('ip_address', ipToDelete)
        .select('id');

      if (threat_error) {
        console.error('❌ Error deleting threat logs:', threat_error);
      } else {
        deletedCount += threat_logs_deleted?.length || 0;
        console.log('✅ Deleted threat_logs:', threat_logs_deleted?.length || 0);
      }

      // Delete blocked IPs entry for this IP
      console.log('🗑️ Deleting blocked_ips for IP:', ipToDelete);
      const { data: blocked_ips_deleted, error: blocked_error } = await supabase
        .from('blocked_ips')
        .delete()
        .eq('ip_address', ipToDelete)
        .select('id');

      if (blocked_error) {
        console.error('❌ Error deleting blocked IP:', blocked_error);
      } else {
        deletedCount += blocked_ips_deleted?.length || 0;
        console.log('✅ Deleted blocked_ips:', blocked_ips_deleted?.length || 0);
      }

      // Delete admin actions related to this IP
      console.log('🗑️ Deleting admin_actions for IP:', ipToDelete);
      const { data: admin_actions_deleted, error: admin_error } = await supabase
        .from('admin_actions')
        .delete()
        .eq('ip_address', ipToDelete)
        .select('id');

      if (admin_error) {
        console.error('❌ Error deleting admin actions:', admin_error);
      } else {
        deletedCount += admin_actions_deleted?.length || 0;
        console.log('✅ Deleted admin_actions:', admin_actions_deleted?.length || 0);
      }

      // Log the deletion request
      console.log('📝 Logging deletion request');
      const { error: log_error } = await supabase
        .from('data_deletion_requests')
        .insert({
          ip_address: ipToDelete,
          reason: 'User requested complete data deletion via privacy settings',
        });

      if (log_error) {
        console.error('❌ Error logging deletion:', log_error);
      } else {
        console.log('✅ Deletion logged');
      }

      console.log('✅ Total items deleted:', deletedCount);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'All your activities and data have been permanently deleted',
          ip_address: ipToDelete,
          deleted_items: [
            `${threat_logs_deleted?.length || 0} threat logs`,
            `${blocked_ips_deleted?.length || 0} blocked IP entries`,
            `${admin_actions_deleted?.length || 0} admin actions`,
          ],
          total_deleted: deletedCount,
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
    console.error('❌ Deletion function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to delete data',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
