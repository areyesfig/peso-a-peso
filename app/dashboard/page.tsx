import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import AnimatedNumber from '@/components/AnimatedNumber'
import CategoryCard from '@/components/CategoryCard'
import type { MonthlySummary, StatementRow } from '@/types'
import { formatCLP } from '@/lib/format'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: latest } = await supabase
    .from('statements')
    .select('id, filename, period, summary, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: statements } = await supabase
    .from('statements')
    .select('id, filename, period, transaction_count, created_at, summary')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const latestSummary = latest?.summary as MonthlySummary | undefined

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--cream)', padding: '24px' }}
    >
      <div className="max-w-2xl mx-auto py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            {/* Mes en --muted uppercase 12px */}
            <p
              className="uppercase font-semibold mb-1"
              style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em' }}
            >
              {latestSummary?.period ?? 'Sin análisis aún'}
            </p>

            {/* Monto total en Playfair 26px con AnimatedNumber */}
            {latestSummary ? (
              <div
                className="text-charcoal"
                style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, lineHeight: 1.2 }}
              >
                <AnimatedNumber value={latestSummary.totalExpenses} duration={1200} />
                <span className="text-muted ml-2" style={{ fontSize: 14, fontFamily: 'var(--font-dm-sans)' }}>
                  en gastos
                </span>
              </div>
            ) : (
              <p
                className="text-charcoal"
                style={{ fontFamily: 'var(--font-playfair)', fontSize: 26 }}
              >
                —
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Botón + circular */}
            <Link
              href="/upload"
              className="flex items-center justify-center text-white font-bold text-lg"
              title="Subir nuevo estado"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'var(--sage)',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              +
            </Link>
            <LogoutButton />
          </div>
        </div>

        {latestSummary ? (
          <>
            {/* ── Mini stats ── */}
            <div
              className="grid grid-cols-3 gap-4"
            >
              {[
                { label: 'Gastos', value: latestSummary.totalExpenses, negative: true },
                { label: 'Ingresos', value: latestSummary.totalIncome, negative: false },
                {
                  label: 'Balance',
                  value: Math.abs(latestSummary.netBalance),
                  negative: latestSummary.netBalance < 0,
                },
              ].map(({ label, value, negative }) => (
                <div
                  key={label}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: '14px 16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                >
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{label}</p>
                  <p
                    className="font-bold tabular"
                    style={{
                      fontSize: 15,
                      color: negative ? 'var(--terracota)' : 'var(--sage-dark)',
                    }}
                  >
                    {negative && label !== 'Balance' ? '-' : ''}{formatCLP(value)}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Categorías ── */}
            {latestSummary.categories?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <p
                    className="uppercase font-semibold"
                    style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}
                  >
                    Gastos por categoría
                  </p>
                  <Link
                    href={`/dashboard/${latest?.id}`}
                    style={{ fontSize: 13, color: 'var(--sage-dark)', textDecoration: 'none' }}
                  >
                    Ver detalle →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {latestSummary.categories.map((cat, i) => (
                    <CategoryCard key={cat.name} category={cat} delay={i * 60} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Historial ── */}
            {statements && statements.length > 0 && (
              <section>
                <p
                  className="uppercase font-semibold mb-4"
                  style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}
                >
                  Historial
                </p>
                <div className="space-y-2">
                  {(statements as StatementRow[]).map((s) => (
                    <Link
                      key={s.id}
                      href={`/dashboard/${s.id}`}
                      className="flex items-center justify-between animate-fade-up history-card"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 16,
                        padding: '14px 18px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        textDecoration: 'none',
                      }}
                    >
                      <div>
                        <p className="font-semibold" style={{ fontSize: 13, color: 'var(--charcoal)' }}>
                          {s.period}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                          {s.filename} · {s.transaction_count} transacciones
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-bold tabular"
                          style={{ fontSize: 13, color: 'var(--terracota)' }}
                        >
                          -{s.summary?.totalExpenses != null
                            ? formatCLP(s.summary.totalExpenses as number)
                            : '—'}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                          {new Date(s.created_at).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* Estado vacío */
          <div
            className="text-center py-20"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '2px dashed var(--border)',
              borderRadius: 20,
            }}
          >
            <span className="text-5xl block mb-4" style={{ opacity: 0.4 }}>📂</span>
            <p className="text-muted text-sm mb-4">No tienes análisis todavía</p>
            <Link
              href="/upload"
              className="inline-block font-semibold text-sm"
              style={{
                backgroundColor: 'var(--sage)',
                color: '#fff',
                borderRadius: 14,
                padding: '10px 20px',
                textDecoration: 'none',
              }}
            >
              Subir primer estado de cuenta
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
