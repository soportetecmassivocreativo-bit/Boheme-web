import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Ignore dead or placeholder Supabase project domains that cause network/DNS timeouts
const isDeadDomain = !supabaseUrl || supabaseUrl.includes('xlitgvdbvmbntyikavvq') || supabaseUrl.includes('placeholder');

// Create a single supabase client for interacting with your database
export const supabase = (!isDeadDomain && supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = (): boolean => {
    return Boolean(!isDeadDomain && supabaseUrl && supabaseAnonKey);
};
