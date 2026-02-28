'use client'

import { useEffect, useState } from 'react'
import type { Category } from '@/types'
import { formatCLP } from '@/lib/format'

interface Props {
  category: Category
  delay?: number
}

export default function CategoryCard({ category, delay = 0 }: Props) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className="animate-fade-up"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        animationDelay: `${delay}ms`,
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'scale(1.01)'
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      {/* Fila superior: icono + nombre + porcentaje */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span style={{ fontSize: 18 }}>{category.icon}</span>
          <span
            className="font-bold truncate"
            style={{ fontSize: 13, color: 'var(--charcoal)' }}
          >
            {category.name}
          </span>
        </div>
        <span
          className="flex-shrink-0 ml-1"
          style={{ fontSize: 11, color: 'var(--muted)' }}
        >
          {category.percentage.toFixed(1)}%
        </span>
      </div>

      {/* Monto */}
      <p
        className="font-bold tabular mb-3"
        style={{ fontSize: 14, color: 'var(--charcoal)' }}
      >
        {formatCLP(category.total)}
      </p>

      {/* Barra de progreso animada */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 4, backgroundColor: '#F0EBE3' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            backgroundColor: category.color,
            width: animated ? `${Math.min(category.percentage, 100)}%` : '0%',
            transition: `width 0.8s cubic-bezier(.4,0,.2,1)`,
          }}
        />
      </div>
    </div>
  )
}
