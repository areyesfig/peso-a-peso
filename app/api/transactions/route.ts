import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/categorizer'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import type { Transaction } from '@/types'

const CATEGORY_NAMES = CATEGORIES.map(c => c.name) as [string, ...string[]]

const PatchTransactionSchema = z.object({
  id: z.string(),
  category: z.enum(CATEGORY_NAMES).optional(),
  description: z.string().min(1).max(500).optional(),
}).refine(data => data.category || data.description, {
  message: 'Se requiere al menos category o description',
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statementId = searchParams.get('statementId')
    const category = searchParams.get('category')
    const type = searchParams.get('type') as 'income' | 'expense' | null

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (statementId) query = query.eq('statement_id', statementId)
    if (category) query = query.eq('category', category)
    if (type) query = query.eq('type', type)

    const { data, error } = await query

    if (error) {
      console.error('Error obteniendo transacciones:', error)
      return NextResponse.json({ error: 'Error al obtener las transacciones' }, { status: 500 })
    }

    return NextResponse.json({ transactions: data as Transaction[] })
  } catch (error) {
    console.error('Error obteniendo transacciones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { allowed, resetMs } = checkRateLimit(`txn:${user.id}`, RATE_LIMITS.transactions)
    if (!allowed) {
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Intenta de nuevo en ${Math.ceil(resetMs / 1000)} segundos.` },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)) } }
      )
    }

    const body = await request.json()
    const parseResult = PatchTransactionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      )
    }

    const { id, category, description } = parseResult.data

    const updates: Partial<Transaction> = {}
    if (category) updates.category = category
    if (description) updates.description = description

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error actualizando transacción:', error)
      return NextResponse.json({ error: 'Error al actualizar la transacción' }, { status: 500 })
    }

    return NextResponse.json({ transaction: data })
  } catch (error) {
    console.error('Error actualizando transacción:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
