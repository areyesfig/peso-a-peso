'use client'

import { useState, useMemo } from 'react'
import AISummary from './AISummary'
import CategoryCard from './CategoryCard'
import CategoryDonut from './CategoryDonut'
import CupoTab from './CupoTab'
import TransactionList from './TransactionList'
import type { MonthlySummary, Transaction } from '@/types'

type Tab = 'Resumen' | 'Cupo' | 'Categorías' | 'Transacciones'

interface Props {
  summary: MonthlySummary
  transactions: Transaction[]
}

export default function StatementTabs({ summary, transactions }: Props) {
  const hasCupo = summary.billingInfo?.usedCredit != null

  const tabs = useMemo<Tab[]>(() => {
    const base: Tab[] = ['Resumen']
    if (hasCupo) base.push('Cupo')
    base.push('Categorías', 'Transacciones')
    return base
  }, [hasCupo])

  const [active, setActive] = useState<Tab>('Resumen')

  const cupoPct = hasCupo && summary.billingInfo!.creditLimit != null && summary.billingInfo!.creditLimit > 0
    ? Math.round((summary.billingInfo!.usedCredit! / summary.billingInfo!.creditLimit!) * 100)
    : null

  return (
    <div>
      {/* Pill tabs */}
      <div
        className="flex gap-1 mb-6 w-fit"
        style={{
          backgroundColor: 'var(--warm-white)',
          borderRadius: 12,
          padding: 4,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            style={{
              borderRadius: 10,
              padding: '6px 16px',
              fontSize: 13,
              fontWeight: active === tab ? 700 : 400,
              backgroundColor: active === tab ? 'var(--card-bg)' : 'transparent',
              color: active === tab ? 'var(--charcoal)' : 'var(--muted)',
              boxShadow: active === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {tab}
            {tab === 'Cupo' && cupoPct != null && (
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 99,
                  backgroundColor: active === tab ? 'var(--sage-pale)' : 'var(--border)',
                  color: active === tab ? 'var(--sage-dark)' : 'var(--muted)',
                }}
              >
                {cupoPct}%
              </span>
            )}
            {tab === 'Transacciones' && transactions.length > 0 && (
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 99,
                  backgroundColor: active === tab ? 'var(--sage-pale)' : 'var(--border)',
                  color: active === tab ? 'var(--sage-dark)' : 'var(--muted)',
                }}
              >
                {transactions.length}
              </span>
            )}
            {tab === 'Categorías' && summary.categories?.length > 0 && (
              <span
                style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 99,
                  backgroundColor: active === tab ? 'var(--sage-pale)' : 'var(--border)',
                  color: active === tab ? 'var(--sage-dark)' : 'var(--muted)',
                }}
              >
                {summary.categories.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido con fade */}
      <div key={active} className="animate-fade-up">
        {active === 'Resumen' && <AISummary summary={summary} />}

        {active === 'Cupo' && summary.billingInfo && (
          <CupoTab billing={summary.billingInfo} transactions={transactions} />
        )}

        {active === 'Categorías' && (
          summary.categories?.length > 0 ? (
            <div className="space-y-8">
              <CategoryDonut categories={summary.categories} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {summary.categories.map((cat, i) => (
                  <CategoryCard key={cat.name} category={cat} delay={i * 60} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-10">Sin categorías registradas</p>
          )
        )}

        {active === 'Transacciones' && (
          transactions.length > 0 ? (
            <TransactionList transactions={transactions} />
          ) : (
            <p className="text-sm text-muted text-center py-10">Sin transacciones registradas</p>
          )
        )}
      </div>
    </div>
  )
}
