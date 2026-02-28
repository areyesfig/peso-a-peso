'use client'

import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

interface Props {
  className?: string
}

export default function LogoutButton({ className = '' }: Props) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className={className}
      style={
        !className
          ? {
              fontSize: 13,
              color: 'var(--muted)',
              padding: '6px 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }
          : undefined
      }
    >
      Cerrar sesión
    </button>
  )
}
