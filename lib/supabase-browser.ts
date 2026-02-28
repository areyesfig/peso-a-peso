'use client'

import { createBrowserClient } from '@supabase/ssr'

// Cliente Supabase para Client Components ('use client')
// Usa createBrowserClient de @supabase/ssr (no createClient de @supabase/supabase-js)
// para que las cookies de sesión sean gestionadas correctamente con el middleware.
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
