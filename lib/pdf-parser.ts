import { getDocumentProxy, extractText } from 'unpdf'

export class PDFPasswordRequiredError extends Error {
  constructor() {
    super('PASSWORD_REQUIRED')
    this.name = 'PDFPasswordRequiredError'
  }
}

export class PDFPasswordIncorrectError extends Error {
  constructor() {
    super('PASSWORD_INCORRECT')
    this.name = 'PDFPasswordIncorrectError'
  }
}

export async function extractTextFromPDF(buffer: Buffer, password?: string): Promise<string> {
  const data = new Uint8Array(buffer)

  try {
    const pdf = await getDocumentProxy(data, password ? { password } : {})
    const { text } = await extractText(pdf, { mergePages: true })
    return text.trim()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('No password') || msg.includes('NEED_PASSWORD')) {
      throw new PDFPasswordRequiredError()
    }
    if (msg.includes('Incorrect') || msg.includes('WRONG_PASSWORD')) {
      throw new PDFPasswordIncorrectError()
    }
    throw err
  }
}

export function extractTextFromCSV(content: string): string {
  return content.trim()
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  password?: string
): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer, password)
  }

  if (mimeType === 'text/csv' || mimeType === 'application/vnd.ms-excel') {
    return extractTextFromCSV(buffer.toString('utf-8'))
  }

  throw new Error(`Tipo de archivo no soportado: ${mimeType}`)
}
