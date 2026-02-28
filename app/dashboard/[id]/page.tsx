import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import StatementTabs from '@/components/StatementTabs'
import DeleteStatementButton from '@/components/DeleteStatementButton'
import type { Transaction, MonthlySummary } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function StatementDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: statement } = await supabase
    .from('statements')
    .select('id, filename, period, summary, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!statement) notFound()

  const { data: rows } = await supabase
    .from('transactions')
    .select('*')
    .eq('statement_id', id)
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const summary = statement.summary as MonthlySummary
  const transactions = (rows ?? []) as Transaction[]

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--cream)', padding: '24px' }}
    >
      <div className="max-w-2xl mx-auto py-8">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-6"
          style={{ color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.15s' }}
        >
          ← Volver al dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1
              className="text-3xl text-charcoal mb-1"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {statement.period}
            </h1>
            <p className="text-sm text-muted">
              {statement.filename} · subido el{' '}
              {new Date(statement.created_at).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <DeleteStatementButton statementId={statement.id} />
        </div>

        {/* Tabs */}
        <StatementTabs summary={summary} transactions={transactions} />
      </div>
    </main>
  )
}
