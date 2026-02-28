import type { MonthlySummary, BillingInfo } from '@/types'
import { formatCLP } from '@/lib/format'

interface Props {
  summary: MonthlySummary
}

function HighlightedText({ text }: { text: string }) {
  // Resalta montos ($123.45) y montos negativos (-$123.45)
  const parts = text.split(/(-?\$[\d,]+\.?\d*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('-$')) {
          return (
            <strong key={i} style={{ color: 'var(--terracota-light)', fontWeight: 700 }}>
              {part}
            </strong>
          )
        }
        if (part.startsWith('$')) {
          return (
            <strong key={i} style={{ color: 'var(--sage-light)', fontWeight: 700 }}>
              {part}
            </strong>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function UsedCreditBar({ billing }: { billing: BillingInfo }) {
  const used = billing.usedCredit
  const limit = billing.creditLimit
  if (used == null) return null

  const pct = limit != null && limit > 0 ? Math.min((used / limit) * 100, 100) : null
  const barColor = pct != null
    ? pct >= 90 ? 'var(--terracota)' : pct >= 70 ? '#E8A838' : 'var(--sage)'
    : 'var(--sage)'

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '16px',
        marginBottom: 12,
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>
          Cupo utilizado
        </p>
        {pct != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>
            {Math.round(pct)}%
          </span>
        )}
      </div>
      <p className="font-bold tabular" style={{ fontSize: 22, color: 'var(--charcoal)', marginBottom: 8 }}>
        {formatCLP(used)}
        {limit != null && (
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', marginLeft: 6 }}>
            / {formatCLP(limit)}
          </span>
        )}
      </p>
      {pct != null && (
        <div style={{ height: 6, backgroundColor: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
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
      {billing.availableCredit != null && (
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
          Disponible: <strong style={{ color: 'var(--charcoal)' }}>{formatCLP(billing.availableCredit)}</strong>
        </p>
      )}
    </div>
  )
}

function BillingCard({ billing }: { billing: BillingInfo }) {
  const fmt = (v: number | null) => v != null ? formatCLP(v) : '—'
  const fmtDate = (d: string | null) => {
    if (!d) return '—'
    try {
      return new Date(d + 'T12:00:00').toLocaleDateString('es-CL', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    } catch { return d }
  }

  const rows = [
    { label: 'Saldo total adeudado', value: fmt(billing.totalDebt), highlight: true },
    { label: 'Pago mínimo',          value: fmt(billing.minPayment), highlight: false },
    { label: 'Fecha de vencimiento', value: fmtDate(billing.dueDate), highlight: false },
    { label: 'Saldo anterior',       value: fmt(billing.previousBalance), highlight: false },
    { label: 'Cargos del período',   value: fmt(billing.totalCharges), highlight: false },
    { label: 'Pagos y abonos',       value: fmt(billing.totalPayments), highlight: false },
  ].filter(r => r.value !== '—')

  if (rows.length === 0) return null

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
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
      {rows.map((row) => (
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
  )
}

export default function AISummary({ summary }: Props) {
  return (
    <div className="space-y-4">
      {/* Cupo utilizado — siempre primero si existe */}
      {summary.billingInfo && <UsedCreditBar billing={summary.billingInfo} />}

      {/* Resumen financiero del estado de cuenta */}
      {summary.billingInfo && <BillingCard billing={summary.billingInfo} />}

      {/* Insights de IA */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: 'var(--charcoal)', borderRadius: 20, padding: '24px' }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: -20, right: -20, width: 100, height: 100,
            borderRadius: '50%', backgroundColor: 'var(--sage)', opacity: 0.15,
          }}
        />
        <p
          className="mb-4"
          style={{
            color: 'var(--sage-light)', fontSize: 10,
            textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
          }}
        >
          ✦ Análisis IA
        </p>
        {summary.aiInsights ? (
          <p style={{ color: '#F0EBE3', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            <HighlightedText text={summary.aiInsights} />
          </p>
        ) : (
          <p style={{ color: '#F0EBE3', fontSize: 13, opacity: 0.5 }}>
            Sin análisis disponible.
          </p>
        )}
        {summary.period && (
          <p className="mt-4 font-semibold" style={{ color: 'var(--sage-light)', fontSize: 11, opacity: 0.7 }}>
            {summary.period}
          </p>
        )}
      </div>
    </div>
  )
}
