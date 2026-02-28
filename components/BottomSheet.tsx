'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/categorizer'
import type { CategoryName } from '@/types'

interface Props {
  transactionId: string
  currentCategory: string
  onClose: () => void
  onCorrected: (newCategory: CategoryName) => void
}

export default function BottomSheet({
  transactionId,
  currentCategory,
  onClose,
  onCorrected,
}: Props) {
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSelect(category: CategoryName) {
    if (category === currentCategory) { onClose(); return }
    setSaving(true)
    try {
      await fetch('/api/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transactionId, category }),
      })
      onCorrected(category)
      setDone(true)
      setTimeout(onClose, 1400)
    } catch {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full bg-card-bg animate-slide-up"
        style={{ borderRadius: '20px 20px 0 0', padding: '24px', paddingBottom: '36px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div
          className="mx-auto mb-5 rounded-full"
          style={{ width: 40, height: 4, backgroundColor: 'var(--border)' }}
        />

        {done ? (
          <p className="text-center text-sm py-6" style={{ color: 'var(--charcoal-light)' }}>
            Gracias, esto nos ayuda a mejorar ✨
          </p>
        ) : (
          <>
            <h3 className="font-semibold text-charcoal text-sm mb-4">
              Corregir categoría
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  disabled={saving}
                  onClick={() => handleSelect(cat.name as CategoryName)}
                  className="flex items-center gap-2.5 px-3 py-3 text-left text-sm border transition-all duration-150"
                  style={{
                    borderRadius: 10,
                    backgroundColor: cat.name === currentCategory ? 'var(--sage-pale)' : 'var(--warm-white)',
                    borderColor: cat.name === currentCategory ? 'var(--sage)' : 'var(--border)',
                    color: 'var(--charcoal)',
                    fontWeight: cat.name === currentCategory ? 700 : 400,
                  }}
                >
                  <span>{cat.icon}</span>
                  <span className="text-xs">{cat.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
