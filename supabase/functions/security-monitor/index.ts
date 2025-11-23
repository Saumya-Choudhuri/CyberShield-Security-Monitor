import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AuthContext {
  event?: 'login' | 'signup' | string;
  status?: 'success' | 'failure' | string;
  identifier?: string;
  metadata?: Record<string, unknown>;
}

interface ThreatDetectionRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
  authContext?: AuthContext;
}

interface ThreatResult {
  blocked: boolean;
  threats: Array<{
    type: string;
    severity: string;
    reason: string;
  }>;
  ip: string;
  message?: string;
}

const FAILED_LOGIN_WINDOW_MINUTES = 15;
const FAILED_LOGIN_THRESHOLD = 5;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPA_URL')!;
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const payload = (await req.json()) as Partial<ThreatDetectionRequest>;
    const {
      url = req.url,
      method = req.method,
      headers = {},
      body,
      queryParams,
      authContext,
    } = payload;
    const headerUserAgent = headers['user-agent'] || req.headers.get('user-agent') || 'unknown';

    const { data: blockedIp } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', clientIp)
      .eq('status', 'blocked')
      .maybeSingle();

    if (blockedIp) {
      await supabase.from('threat_logs').insert({
        ip_address: clientIp,
        threat_type: 'Blocked IP Access Attempt',
        severity: 'high',
        request_path: url,
        request_method: method,
        user_agent: headerUserAgent,
        payload: { headers, body, queryParams },
        blocked: true,
      });

      return new Response(
        JSON.stringify({
          blocked: true,
          reason: 'IP address is blocked',
          message: 'Access denied. Your IP has been blocked due to suspicious activity.',
          ip: clientIp,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (authContext?.event === 'login' && authContext.status === 'precheck') {
      return new Response(
        JSON.stringify({ blocked: false, threats: [], ip: clientIp }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: rules } = await supabase
      .from('security_rules')
      .select('*')
      .eq('enabled', true);

    const threats: Array<{ type: string; severity: string; reason: string }> = [];
    const authDescriptor = authContext ? JSON.stringify(authContext) : '';
    const fullRequest = `${url} ${body || ''} ${JSON.stringify(queryParams || {})} ${authDescriptor}`;
    const userAgent = headerUserAgent.toLowerCase();

    for (const rule of rules || []) {
      if (rule.rule_type === 'pattern_match') {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(fullRequest) || regex.test(userAgent)) {
          threats.push({
            type: rule.rule_name,
            severity: rule.severity,
            reason: `Matched pattern: ${rule.pattern}`,
          });
        }
      }
    }

    const { count } = await supabase
      .from('threat_logs')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gte('created_at', new Date(Date.now() - 60000).toISOString());

    let loginFailureCount = 0;
    if (authContext?.event === 'login' && authContext.status === 'failure') {
      const { count: recentLoginFailures } = await supabase
        .from('threat_logs')
        .select('id', { count: 'exact', head: true })
        .eq('ip_address', clientIp)
        .eq('threat_type', 'Failed Login Attempt')
        .gte('created_at', new Date(Date.now() - FAILED_LOGIN_WINDOW_MINUTES * 60 * 1000).toISOString());

      loginFailureCount = (recentLoginFailures || 0) + 1;
      const severity = loginFailureCount >= FAILED_LOGIN_THRESHOLD ? 'high' : 'medium';

      threats.push({
        type: 'Failed Login Attempt',
        severity,
        reason: `${loginFailureCount} failed login attempts within ${FAILED_LOGIN_WINDOW_MINUTES} minutes`,
      });
    }

    if ((count || 0) > 50) {
      threats.push({
        type: 'Rate Limit Violation',
        severity: 'high',
        reason: `${count} requests in last minute`,
      });
    }

    const loginThresholdReached = loginFailureCount >= FAILED_LOGIN_THRESHOLD;
    const shouldBlock = loginThresholdReached || threats.some(t => 
      t.severity === 'critical' || t.severity === 'high'
    ) || (count || 0) > 100;

    if (threats.length > 0) {
      await supabase.from('threat_logs').insert({
        ip_address: clientIp,
        threat_type: threats.map(t => t.type).join(', '),
        severity: threats[0].severity,
        request_path: url,
        request_method: method,
        user_agent: headerUserAgent,
        payload: { headers, body, queryParams, authContext, threats },
        blocked: shouldBlock,
      });

      if (shouldBlock) {
        const { data: existingBlock } = await supabase
          .from('blocked_ips')
          .select('*')
          .eq('ip_address', clientIp)
          .maybeSingle();

        if (existingBlock) {
          await supabase
            .from('blocked_ips')
            .update({ 
              threat_count: existingBlock.threat_count + 1,
              reason: `${existingBlock.reason}; ${threats[0].type}`,
            })
            .eq('id', existingBlock.id);
        } else {
          await supabase.from('blocked_ips').insert({
            ip_address: clientIp,
            reason: threats.map(t => t.type).join(', '),
            threat_count: 1,
            status: 'blocked',
            metadata: { threats },
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        blocked: shouldBlock,
        threats,
        ip: clientIp,
        message: loginThresholdReached ? 'Too many failed login attempts. Contact an admin to unblock access.' : undefined,
        timestamp: new Date().toISOString(),
      } as ThreatResult),
      {
        status: shouldBlock ? 403 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Security monitor error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});