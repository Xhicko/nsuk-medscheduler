import { createClient } from '@supabase/supabase-js'

// Server-only admin client using the service role key. Do NOT expose this to the browser.
export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL')
  return createClient(url, key)
}
