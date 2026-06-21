// lib/supabase.js — single Supabase client for the whole app
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Loud, early failure — easier than a hundred "undefined" errors later.
  console.error(
    '[supabase] Missing env vars. Create client/.env with ' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see client/.env.example).'
  )
}

export const supabase = createClient(url || '', anonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const PAPERS_BUCKET = 'papers'
export const CV_BUCKET = 'cv'

// Public URL for a file stored in one of our buckets.
export function fileUrl(bucket, path) {
  if (!path) return null
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
