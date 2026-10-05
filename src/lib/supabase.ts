import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const localDemoUrl = 'https://demo.invalid';
const localDemoKey = 'demo-local-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('CyberShield: Supabase environment variables are missing. Public demo mode is available, but live authentication is disabled.');
}

export const supabase = createClient(
	supabaseUrl || localDemoUrl,
	supabaseAnonKey || localDemoKey,
);
