import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { allowed, resetMs } = checkRateLimit(`del:${user.id}`, RATE_LIMITS.deleteStatement)
  if (!allowed) {
    return NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta de nuevo en ${Math.ceil(resetMs / 1000)} segundos.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)) } }
    )
  }

  // Verificar que el statement pertenece al usuario
  const { data: statement } = await supabase
    .from('statements')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!statement) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  // Borrar transacciones primero
  await supabase
    .from('transactions')
    .delete()
    .eq('statement_id', id)
    .eq('user_id', user.id)

  // Borrar el statement
  const { error } = await supabase
    .from('statements')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error eliminando statement:', error)
    return NextResponse.json({ error: 'Error al eliminar el estado de cuenta' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
