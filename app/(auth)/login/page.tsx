'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sage-pale rounded-2xl mb-4">
            <span className="text-2xl">🌿</span>
          </div>
          <h1
            className="text-3xl text-charcoal mb-1"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Budget Analyzer
          </h1>
          <p className="text-sm text-muted">Tus finanzas, con claridad</p>
        </div>

        {/* Card */}
        <div
          className="bg-card-bg rounded-[20px] border border-border p-8"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <h2
            className="text-xl text-charcoal mb-1"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Bienvenido de vuelta
          </h2>
          <p className="text-sm text-muted mb-6">Ingresa para ver tu resumen</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              autoComplete="email"
            />

            <Input
              id="password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && (
              <p className="text-xs text-terracota bg-terracota-light/40 border border-terracota/20 px-3 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} size="lg" className="mt-2">
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </div>

        <p className="text-sm text-muted text-center mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-sage-dark font-medium hover:underline underline-offset-2">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </main>
  )
}
