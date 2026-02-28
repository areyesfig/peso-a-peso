import type { CategoryName } from '@/lib/categorizer'

// ─── Entidades del dominio ────────────────────────────────────

export interface Transaction {
  id: string
  date: string          // YYYY-MM-DD
  description: string
  merchant?: string     // nombre limpio extraído por la IA
  amount: number
  type: 'income' | 'expense'
  category: string
}

export interface Category {
  name: string
  icon: string          // emoji de la categoría
  color: string         // hex del sistema de diseño
  total: number
  count: number
  transactions: Transaction[]
  percentage: number    // % sobre totalExpenses
}

export interface BillingInfo {
  totalDebt: number | null          // saldo total adeudado
  minPayment: number | null         // pago mínimo
  dueDate: string | null            // fecha de vencimiento YYYY-MM-DD
  previousBalance: number | null    // saldo anterior
  totalCharges: number | null       // cargos del período
  totalPayments: number | null      // pagos y abonos del período
  creditLimit: number | null        // límite de crédito
  availableCredit: number | null    // crédito disponible
  usedCredit: number | null         // cupo utilizado (creditLimit - availableCredit)
}

export interface MonthlySummary {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  categories: Category[]
  topExpenses: Transaction[]
  period: string        // e.g. "Mayo 2025"
  aiInsights: string
  transactionCount: number
  billingInfo?: BillingInfo
}

export interface Statement {
  id: string
  userId: string
  filename: string
  fileType: 'pdf' | 'csv'
  period: string
  summary: MonthlySummary
  transactions: Transaction[]
  createdAt: string
}

// ─── Respuestas de API ────────────────────────────────────────

export interface UploadResponse {
  success: boolean
  statementId?: string
  summary?: MonthlySummary
  transactions?: Transaction[]
  error?: string
}

export interface CategorizationResult {
  transactions: Transaction[]
  summary: Omit<MonthlySummary, 'aiInsights'>
  rawText: string
}

export interface CategoryCorrectionPayload {
  transactionId: string
  newCategory: CategoryName
}

// ─── Filas de base de datos (Supabase) ───────────────────────

export interface StatementRow {
  id: string
  user_id: string
  filename: string
  file_type: 'pdf' | 'csv'
  period: string | null
  summary: MonthlySummary | null
  transaction_count: number
  created_at: string
}

export interface TransactionRow {
  id: string
  statement_id: string
  user_id: string
  date: string | null
  description: string
  merchant: string | null
  amount: string          // Supabase devuelve numeric como string
  type: 'income' | 'expense'
  category: string
  created_at: string
}

export interface CategoryCorrectionRow {
  id: string
  transaction_id: string
  user_id: string
  old_category: string
  new_category: string
  created_at: string
}

// ─── Re-exports útiles ────────────────────────────────────────

export type { CategoryName }
