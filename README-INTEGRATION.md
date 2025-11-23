````markdown
# CyberShield Security Monitor - Integration Guide

## Overview

CyberShield is an automated web security monitoring system that detects threats, blocks malicious IPs, and provides real-time security analytics.

## How It Works

### 1. Threat Detection

The system monitors incoming requests and checks for:

- SQL Injection attempts
- Cross-Site Scripting (XSS) attacks
- Path traversal attempts
- Rate limit violations
- Suspicious user agents (bots, scanners)

### 2. Automatic IP Blocking

When a threat is detected:

- High or critical severity threats trigger automatic IP blocking
- The IP is added to the blocked list immediately
- All future requests from that IP are denied until admin approval

### 3. Admin Dashboard

The dashboard provides:

- Real-time threat statistics
- Live activity feed
- Complete threat logs with details
- Blocked IP management
- Detailed security reports

## Integrating with Your Website

To protect your website with CyberShield, add this middleware to your web application.

### For Express.js Applications

```javascript
const fetch = require('node-fetch');

const securityMiddleware = async (req, res, next) => {
  try {
    const response = await fetch('https://pfrfeebtiktnfgdeoqvl.supabase.co/functions/v1/security-monitor', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer YOUR_SUPABASE_ANON_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
        body: req.body,
        queryParams: req.query,
      }),
    });

    const result = await response.json();

    if (result.blocked) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP has been blocked due to suspicious activity.',
      });
    }

    next();
  } catch (error) {
    console.error('Security check failed:', error);
    next();
  }
};

app.use(securityMiddleware);
```

### For Nginx

```nginx
location / {
    # Forward to security monitor
    auth_request /security-check;

    # Your normal proxy configuration
    proxy_pass http://your-backend;
}

location = /security-check {
    internal;
    proxy_pass https://pfrfeebtiktnfgdeoqvl.supabase.co/functions/v1/security-monitor;
    proxy_method POST;
    proxy_set_header Content-Type application/json;
    proxy_set_body '{"url":"$request_uri","method":"$request_method"}';
}
```

### For Python Flask

```python

## Monitoring Login Attempts

CyberShield now understands structured auth events. Each failed login that is reported with `authContext.event = "login"` and `authContext.status = "failure"` is stored as a threat. The first four failures from the same IP within 15 minutes are tracked in the dashboard, and on the **fifth** failure the IP is automatically blocked.

Once an IP accumulates **five failed logins within 15 minutes**, it is auto-blocked. Every subsequent attempt—successful or not—receives a block response until an administrator approves the unblock from the "Blocked IPs" panel. The provided `monitoredSignIn` helper performs a pre-check with the edge function before hitting Supabase Auth, so blocked users are stopped client-side and shown the CyberShield reason immediately.

### Supabase Auth (React/Vite) Example

Use the helper in `src/lib/securityMonitorClient.ts` to wrap your existing `signInWithPassword` call:

```tsx
import { useState } from 'react';
import { monitoredSignIn } from './lib/securityMonitorClient';
import { supabase } from './lib/supabase';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await monitoredSignIn(supabase, { email, password });

    if (result.error) {
      setError(result.error.message);
      return;
    }

    // proceed with redirect/session handling
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* your inputs */}
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Sign in</button>
    </form>
  );
}
```

Every failed attempt automatically calls the edge function with the proper `authContext` payload, so the dashboard shows the attempt instantly.

### Other Stacks / Custom Auth

If you are not using Supabase Auth or prefer manual control, call the `reportAuthAttempt` helper (or send the HTTP request yourself) whenever an auth failure occurs:

```ts
import { reportAuthAttempt } from './lib/securityMonitorClient';

await reportAuthAttempt({
  endpoint: '/api/login',
  event: 'login',
  identifier: userEmail,
  status: 'failure',
  metadata: { reason: 'Invalid password' },
});
```

Server-side frameworks can post directly to the edge function as long as they include:

```json
{
  "url": "/api/login",
  "method": "POST",
  "authContext": {
    "event": "login",
    "status": "failure",
    "identifier": "user@example.com"
  }
}
```

> **Note:** Never send raw passwords to the monitor. Only include metadata needed for auditing (email, IP, reason for failure, etc.).
from flask import request, jsonify
import requests

@app.before_request
def check_security():
    try:
        response = requests.post(
            'https://pfrfeebtiktnfgdeoqvl.supabase.co/functions/v1/security-monitor',
            json={
                'url': request.path,
                'method': request.method,
                'headers': dict(request.headers),
                'body': request.get_data(as_text=True),
                'queryParams': dict(request.args)
            },
            headers={
                'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
                'Content-Type': 'application/json'
            }
        )

        result = response.json();

        if result.get('blocked'):
            return jsonify({
                'error': 'Access denied',
                'message': 'Your IP has been blocked due to suspicious activity.'
            }), 403

    except Exception as e:
        print(f'Security check failed: {e}')
```

## Admin Features

### Viewing Threats

- Access the dashboard to see all detected threats in real-time
- Click on any threat to view detailed information
- Filter by severity level or date range

### Managing Blocked IPs

1. Navigate to the "Blocked IPs" tab
2. Review the list of blocked IP addresses
3. Click "Approve Unblock" to whitelist an IP address
4. The system logs all admin actions for audit purposes

### Generating Reports

1. Select the report period (24 hours, 7 days, or 30 days)
2. Click "Download Report"
3. Receive a comprehensive JSON report including:
   - Threat summary and statistics
   - Severity breakdown
   - Top threat types
   - Top attacker IPs
   - Complete event logs
   - Admin actions taken

## Security Rules

The system comes pre-configured with these security rules:

| Rule Name | Type | Severity | Pattern |
|-----------|------|----------|---------|
| SQL Injection Detection | Pattern Match | Critical | union, select, insert, update, delete, drop, exec, script |
| XSS Detection | Pattern Match | High | `<script`, javascript:, onerror, onload |
| Path Traversal | Pattern Match | High | ../, ..\\ |
| Rate Limit Violation | Rate Limit | Medium | 100 requests/minute |
| Suspicious User Agent | Pattern Match | Medium | bot, crawler, scanner, nikto, sqlmap |

You can add custom rules through the database or extend the edge function.

## Database Schema

The system uses four main tables:

1. **threat_logs** - Records every threat detection event
2. **blocked_ips** - Manages blocked IP addresses and their status
3. **admin_actions** - Logs all administrative actions
4. **security_rules** - Defines detection rules and patterns

## Important Notes

- Replace `YOUR_SUPABASE_ANON_KEY` with your actual Supabase anonymous key
- The edge function endpoint is: `https://pfrfeebtiktnfgdeoqvl.supabase.co/functions/v1/security-monitor`
- Blocked IPs remain blocked until admin approval
- All data is stored securely in Supabase with Row Level Security enabled
- The dashboard updates in real-time using Supabase realtime subscriptions

## Troubleshooting

- **Dashboard shows no data:** Apply migration `20251122040000_add_anon_dashboard_policies.sql` (`./bin/supabase db reset` locally or `./bin/supabase db push` to the remote project) so the anon key can read `threat_logs`, `blocked_ips`, and `security_rules`.
- **Edge function env errors:** Ensure `supabase/.env` contains `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` that match your project, then rerun `./bin/supabase functions serve security-monitor --env-file supabase/.env`.
- **Frontend still stale:** Restart `npm run dev` after updating `.env` values so Vite reloads the new configuration.

## Testing the System

You can test the threat detection by making requests with suspicious patterns:

```bash
# Test SQL injection detection
curl "https://your-website.com/search?q=1' UNION SELECT * FROM users--"

# Test XSS detection
curl "https://your-website.com/comment" -d "text=<script>alert('xss')</script>"

# Test rate limiting
for i in {1..150}; do curl "https://your-website.com/api/data"; done
```

## Support

For issues or questions, review the threat logs in the dashboard for detailed debugging information.

````
