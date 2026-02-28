'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  statementId: string
}

export default function DeleteStatementButton({ statementId }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/statements/${statementId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>¿Eliminar?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#fff',
            backgroundColor: 'var(--terracota)',
            border: 'none',
            borderRadius: 8,
            padding: '5px 12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Eliminando…' : 'Sí, eliminar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            fontSize: 12,
            color: 'var(--muted)',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '5px 12px',
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        fontSize: 12,
        color: 'var(--muted)',
        backgroundColor: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '5px 12px',
        cursor: 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.color = 'var(--terracota)'
        el.style.borderColor = 'var(--terracota)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.color = 'var(--muted)'
        el.style.borderColor = 'var(--border)'
      }}
    >
      Eliminar
    </button>
  )
}
