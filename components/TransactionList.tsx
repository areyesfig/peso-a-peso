'use client'

import { useState } from 'react'
import BottomSheet from './BottomSheet'
import { CATEGORIES } from '@/lib/categorizer'
import { formatCLP } from '@/lib/format'
import type { Transaction, CategoryName } from '@/types'

const categoryMeta = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, { icon: c.icon, color: c.color }])
)

interface Props {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: Props) {
  const [items, setItems] = useState<Transaction[]>(transactions)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')

  const filtered = items.filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  )

  function handleCorrected(txId: string, newCategory: CategoryName) {
    setItems((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, category: newCategory } : t))
    )
  }

  return (
    <div>
      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar transacción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:border-sage"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--charcoal)',
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">No hay transacciones</p>
      ) : (
        <div>
          {filtered.map((t) => {
            const meta = categoryMeta[t.category]
            return (
              <div
                key={t.id}
                className="flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)', padding: '13px 0' }}
              >
                {/* Izquierda */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Ícono de categoría */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center text-[18px]"
                    style={{
                      width: 38,
                      height: 38,
                      backgroundColor: 'var(--warm-white)',
                      borderRadius: 11,
                    }}
                  >
                    {meta?.icon ?? '📦'}
                  </div>

                  {/* Descripción + meta */}
                  <div className="min-w-0">
                    <p
                      className="font-bold truncate"
                      style={{ fontSize: 13, color: 'var(--charcoal)' }}
                    >
                      {t.description}
                    </p>
                    <p style={{ fontSize: 10, marginTop: 2, color: 'var(--muted)' }}>
                      <span style={{ color: meta?.color ?? 'var(--muted)', fontWeight: 600 }}>
                        {t.category}
                      </span>
                      {' · '}
                      {t.date}
                    </p>
                  </div>
                </div>

                {/* Derecha: monto + botón editar */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span
                    className="font-bold tabular"
                    style={{
                      fontSize: 13,
                      color: t.type === 'income' ? 'var(--sage)' : 'var(--terracota)',
                    }}
                  >
                    {t.type === 'income' ? '+' : '-'}{formatCLP(t.amount)}
                  </span>

                  <button
                    onClick={() => setEditing(t)}
                    className="flex items-center justify-center flex-shrink-0"
                    title="Corregir categoría"
                    style={{
                      width: 28,
                      height: 28,
                      backgroundColor: 'var(--warm-white)',
                      borderRadius: 7,
                      fontSize: 13,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    ✏️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-muted text-right mt-3">
        {filtered.length} de {items.length} transacciones
      </p>

      {/* Bottom Sheet */}
      {editing && (
        <BottomSheet
          transactionId={editing.id}
          currentCategory={editing.category}
          onClose={() => setEditing(null)}
          onCorrected={(newCat) => {
            handleCorrected(editing.id, newCat)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
