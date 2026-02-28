import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UploadZone from '@/components/UploadZone'

export default async function UploadPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--cream)', padding: '24px' }}
    >
      <div className="max-w-lg mx-auto py-8">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-8"
          style={{ color: 'var(--muted)', transition: 'color 0.15s' }}
        >
          ← Volver al dashboard
        </Link>

        {/* Encabezado */}
        <div className="mb-8">
          <h1
            className="text-3xl text-charcoal mb-1"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Subir estado de cuenta
          </h1>
          <p className="text-sm text-muted">
            Claude analizará y categorizará tus transacciones automáticamente.
          </p>
        </div>

        <UploadZone />
      </div>
    </main>
  )
}
