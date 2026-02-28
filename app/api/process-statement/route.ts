import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromFile, PDFPasswordRequiredError, PDFPasswordIncorrectError } from '@/lib/pdf-parser'
import { categorizeTransactions, generateInsights } from '@/lib/categorizer'
import { createServerSupabaseClient } from '@/lib/supabase'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import type { UploadResponse } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const { allowed, remaining, resetMs } = checkRateLimit(`process:${user.id}`, RATE_LIMITS.processStatement)
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: `Demasiadas solicitudes. Intenta de nuevo en ${Math.ceil(resetMs / 1000)} segundos.` },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)), 'X-RateLimit-Remaining': '0' } }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se recibió ningún archivo' }, { status: 400 })
    }

    const allowedTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Solo se aceptan archivos PDF o CSV' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !['pdf', 'csv'].includes(ext)) {
      return NextResponse.json(
        { success: false, error: 'Solo se aceptan archivos .pdf o .csv' },
        { status: 400 }
      )
    }

    const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El archivo no puede superar 10 MB' },
        { status: 400 }
      )
    }

    // 1. Extraer texto del archivo (el archivo no se almacena — privacidad)
    const password = formData.get('password') as string | null
    const buffer = Buffer.from(await file.arrayBuffer())

    // Validar magic bytes y cross-check con extensión
    if (ext === 'pdf') {
      const pdfMagic = buffer.slice(0, 4).toString('ascii')
      if (pdfMagic !== '%PDF') {
        return NextResponse.json(
          { success: false, error: 'El archivo no es un PDF válido' },
          { status: 400 }
        )
      }
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { success: false, error: 'La extensión no coincide con el tipo de archivo' },
          { status: 400 }
        )
      }
    } else if (ext === 'csv') {
      if (buffer.includes(0x00)) {
        return NextResponse.json(
          { success: false, error: 'El archivo CSV contiene datos binarios inválidos' },
          { status: 400 }
        )
      }
      if (!['text/csv', 'application/vnd.ms-excel'].includes(file.type)) {
        return NextResponse.json(
          { success: false, error: 'La extensión no coincide con el tipo de archivo' },
          { status: 400 }
        )
      }
    }
    const rawText = await extractTextFromFile(buffer, file.type, password ?? undefined)

    if (!rawText || rawText.length < 50) {
      return NextResponse.json(
        { success: false, error: 'No se pudo extraer texto del archivo' },
        { status: 422 }
      )
    }

    // 3. Categorizar con Claude
    const { transactions, summary } = await categorizeTransactions(rawText)

    // 4. Generar insights con Claude
    const aiInsights = await generateInsights(summary)
    const fullSummary = { ...summary, aiInsights }

    // 5. Guardar en base de datos
    const { data: statement, error: dbError } = await supabase
      .from('statements')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_type: file.type === 'application/pdf' ? 'pdf' : 'csv',
        period: summary.period,
        summary: fullSummary,
        transaction_count: transactions.length,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error guardando en DB:', dbError)
      return NextResponse.json(
        { success: false, error: 'Error al guardar el análisis' },
        { status: 500 }
      )
    }

    // 6. Guardar transacciones
    const transactionsToInsert = transactions.map((t) => ({
      statement_id: statement.id,
      user_id: user.id,
      date: t.date,
      description: t.description,
      merchant: t.merchant || null,
      amount: t.amount,
      type: t.type,
      category: t.category,
    }))

    await supabase.from('transactions').insert(transactionsToInsert)

    return NextResponse.json({
      success: true,
      statementId: statement.id,
      summary: fullSummary,
      transactions,
    })
  } catch (error) {
    if (error instanceof PDFPasswordRequiredError) {
      return NextResponse.json(
        { success: false, error: 'PASSWORD_REQUIRED' },
        { status: 422 }
      )
    }
    if (error instanceof PDFPasswordIncorrectError) {
      return NextResponse.json(
        { success: false, error: 'PASSWORD_INCORRECT' },
        { status: 422 }
      )
    }
    console.error('Error procesando estado de cuenta:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
