import type {
  SignInWithPasswordCredentials,
  SupabaseClient,
} from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const securityMonitorUrl =
  import.meta.env.VITE_SECURITY_MONITOR_URL ||
  (supabaseUrl ? `${supabaseUrl}/functions/v1/security-monitor` : '');
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

type AuthAttemptStatus = 'success' | 'failure' | 'precheck';
type AuthEventType = 'login' | 'signup' | string;

export interface SecurityMonitorResponse {
  blocked: boolean;
  message?: string;
  ip?: string;
  threats?: Array<{ type: string; severity: string; reason: string }>;
}

interface ReportAuthAttemptOptions {
  endpoint?: string;
  event?: AuthEventType;
  identifier?: string;
  status: AuthAttemptStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Sends a structured auth attempt payload to the CyberShield security-monitor edge function.
 */
export async function reportAuthAttempt({
  endpoint = '/auth/login',
  event = 'login',
  identifier,
  status,
  metadata,
}: ReportAuthAttemptOptions): Promise<SecurityMonitorResponse | null> {
  if (!securityMonitorUrl) {
    console.warn('CyberShield: Unable to determine security-monitor URL.');
    return null;
  }

  const clientHeaders: Record<string, string> = {};
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    clientHeaders['user-agent'] = navigator.userAgent;
  }

  try {
    const response = await fetch(securityMonitorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(anonKey ? { Authorization: `Bearer ${anonKey}` } : {}),
      },
      body: JSON.stringify({
        url: endpoint,
        method: 'POST',
        headers: clientHeaders,
        authContext: {
          event,
          status,
          identifier,
          metadata,
        },
      }),
    });

    if (!response.ok) {
      console.warn('CyberShield: Security monitor responded with', response.status);
    }

    const text = await response.text();
    if (!text) {
      return null;
    }

    const data = JSON.parse(text) as SecurityMonitorResponse;
    return data;
  } catch (error) {
    console.warn('CyberShield: Failed to report auth attempt', error);
    return null;
  }
}

interface MonitoredSignInOptions {
  endpoint?: string;
}

/**
 * Wraps supabase.auth.signInWithPassword so failed attempts automatically notify CyberShield.
 */
export async function monitoredSignIn(
  client: SupabaseClient,
  credentials: SignInWithPasswordCredentials,
  options?: MonitoredSignInOptions,
) {
  const identifier =
    'email' in credentials
      ? credentials.email
      : 'phone' in credentials
        ? credentials.phone
        : undefined;
  const endpoint = options?.endpoint ?? '/auth/login';

  const precheck = await reportAuthAttempt({
    endpoint,
    identifier,
    status: 'precheck',
  });

  if (precheck?.blocked) {
    throw new Error(precheck.message || 'Access denied. Your IP is currently blocked by CyberShield.');
  }

  const result = await client.auth.signInWithPassword(credentials);

  if (result.error) {
    await reportAuthAttempt({
      endpoint,
      identifier,
      status: 'failure',
      metadata: {
        code: result.error.name,
        message: result.error.message,
      },
    });
  } else if (result.data?.session) {
    await reportAuthAttempt({
      endpoint,
      identifier,
      status: 'success',
    });
  }

  return result;
}
