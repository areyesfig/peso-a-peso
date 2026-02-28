'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

function mapAuthError(message: string): string {
  if (message.includes('User already registered')) return 'Ya existe una cuenta con este correo'
  if (message.includes('Invalid email')) return 'El correo electrónico no es válido'
  if (message.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres'
  if (message.includes('rate limit') || message.includes('too many requests')) return 'Demasiados intentos, intenta más tarde'
  if (message.includes('Email not confirmed')) return 'Revisa tu correo para confirmar tu cuenta'
  return 'Ocurrió un error al crear la cuenta. Intenta de nuevo.'
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(mapAuthError(error.message))
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
          <p className="text-sm text-muted">Empieza a entender tus gastos</p>
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
            Crear cuenta
          </h2>
          <p className="text-sm text-muted mb-6">Es gratis, sin tarjeta de crédito</p>

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
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />

            <Input
              id="confirm"
              label="Confirmar contraseña"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />

            {error && (
              <p className="text-xs text-terracota bg-terracota-light/40 border border-terracota/20 px-3 py-2.5 rounded-xl">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} size="lg" className="mt-2">
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>
          </form>
        </div>

        {/* Privacidad */}
        <div className="flex items-start gap-2 mt-4 px-1">
          <span className="text-sm mt-0.5 flex-shrink-0">🔒</span>
          <p className="text-xs text-muted leading-relaxed">
            Tu archivo se procesa en memoria y nunca se almacena en nuestros servidores.
            Solo guardamos las categorías y montos, nunca datos personales del banco.
          </p>
        </div>

        <p className="text-sm text-muted text-center mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-sage-dark font-medium hover:underline underline-offset-2">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
