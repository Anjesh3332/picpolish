import { createBrowserClient } from '@supabase/ssr';

/**
 * Create Supabase client for browser
 * Use this in client components and pages
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Export singleton instance
export const supabase = createClient();