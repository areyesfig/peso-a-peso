import type { BillingInfo, Transaction } from '@/types'
import { formatCLP } from '@/lib/format'
import { CATEGORIES } from '@/lib/categorizer'

interface Props {
  billing: BillingInfo
  transactions: Transaction[]
}

const CATEGORY_META = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, { icon: c.icon, color: c.color }])
) as Record<string, { icon: string; color: string }>

export default function CupoTab({ billing, transactions }: Props) {
  const used = billing.usedCredit
  const limit = billing.creditLimit
  const pct = used != null && limit != null && limit > 0
    ? Math.min((used / limit) * 100, 100)
    : null
  const barColor = pct != null
    ? pct >= 90 ? 'var(--terracota)' : pct >= 70 ? '#E8A838' : 'var(--sage)'
    : 'var(--sage)'

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalCargos = expenses.reduce((s, t) => s + t.amount, 0)

  const fmt = (v: number | null) => v != null ? formatCLP(v) : '—'
  const fmtDate = (d: string | null) => {
    if (!d) return '—'
    try {
      return new Date(d + 'T12:00:00').toLocaleDateString('es-CL', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    } catch { return d }
  }

  const billingRows = [
    { label: 'Saldo total adeudado', value: fmt(billing.totalDebt), highlight: true },
    { label: 'Pago mínimo',          value: fmt(billing.minPayment), highlight: false },
    { label: 'Fecha de vencimiento', value: fmtDate(billing.dueDate), highlight: false },
    { label: 'Saldo anterior',       value: fmt(billing.previousBalance), highlight: false },
    { label: 'Cargos del período',   value: fmt(billing.totalCharges), highlight: false },
    { label: 'Pagos y abonos',       value: fmt(billing.totalPayments), highlight: false },
  ].filter(r => r.value !== '—')

  return (
    <div className="space-y-4">
      {/* Hero — Cupo utilizado */}
      {used != null && (
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '20px',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 12 }}>
            Cupo utilizado
          </p>
          <div className="flex items-end gap-2" style={{ marginBottom: 12 }}>
            <span className="font-bold tabular" style={{ fontSize: 32, lineHeight: 1, color: barColor }}>
              {formatCLP(used)}
            </span>
            {pct != null && (
              <span style={{ fontSize: 14, fontWeight: 700, color: barColor, marginBottom: 2 }}>
                {Math.round(pct)}%
              </span>
            )}
          </div>
          {pct != null && (
            <div style={{ height: 8, backgroundColor: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  backgroundColor: barColor,
                  borderRadius: 99,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            {billing.availableCredit != null && (
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                Disponible: <strong style={{ color: 'var(--charcoal)' }}>{formatCLP(billing.availableCredit)}</strong>
              </p>
            )}
            {limit != null && (
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                Límite: <strong style={{ color: 'var(--charcoal)' }}>{formatCLP(limit)}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Info de facturación */}
      {billingRows.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <p
            style={{
              padding: '12px 16px',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--muted)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            Resumen del estado de cuenta
          </p>
          {billingRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between"
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: row.highlight ? 'var(--terracota-light)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{row.label}</span>
              <span
                className="font-bold tabular"
                style={{
                  fontSize: 13,
                  color: row.highlight ? 'var(--terracota)' : 'var(--charcoal)',
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Lista de transacciones expense */}
      {expenses.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <p
            style={{
              padding: '12px 16px',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--muted)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            Detalle de cargos
          </p>
          {expenses.map((txn) => {
            const meta = CATEGORY_META[txn.category] || { icon: '📦', color: '#9A9590' }
            const dateStr = txn.date
              ? new Date(txn.date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
              : ''
            return (
              <div
                key={txn.id}
                className="flex items-center gap-3"
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: meta.color + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {meta.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {txn.description}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {dateStr}
                  </p>
                </div>
                <span className="font-bold tabular" style={{ fontSize: 13, color: 'var(--terracota)', flexShrink: 0 }}>
                  {formatCLP(txn.amount)}
                </span>
              </div>
            )
          })}
          {/* Footer */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--warm-white)',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {expenses.length} transaccion{expenses.length !== 1 ? 'es' : ''}
            </span>
            <span className="font-bold tabular" style={{ fontSize: 13, color: 'var(--charcoal)' }}>
              Total: {formatCLP(totalCargos)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
