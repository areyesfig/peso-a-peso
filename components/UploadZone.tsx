'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ProcessingScreen from './ProcessingScreen'
import type { UploadResponse } from '@/types'

type Status = 'idle' | 'needs-password' | 'processing' | 'done' | 'error'

export default function UploadZone() {
  const router = useRouter()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')

  const handleFile = useCallback((f: File) => {
    const valid = ['application/pdf', 'text/csv', 'application/vnd.ms-excel']
    if (!valid.includes(f.type)) {
      setError('Solo se aceptan archivos PDF o CSV')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('El archivo no puede superar 10 MB')
      return
    }
    setError('')
    setFile(f)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  async function handleUpload(pwd?: string) {
    if (!file) return

    setStatus('processing')
    setProgress(10)
    setError('')

    const steps = [20, 40, 58, 72, 86]
    let step = 0
    const timer = setInterval(() => {
      if (step < steps.length) setProgress(steps[step++])
    }, 1400)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (pwd) formData.append('password', pwd)

      const res = await fetch('/api/process-statement', {
        method: 'POST',
        body: formData,
      })

      const data: UploadResponse = await res.json()
      clearInterval(timer)

      if (!data.success) {
        if (data.error === 'PASSWORD_REQUIRED') {
          setStatus('needs-password')
          setProgress(0)
          return
        }
        if (data.error === 'PASSWORD_INCORRECT') {
          setStatus('needs-password')
          setProgress(0)
          setError('Contraseña incorrecta, intenta de nuevo.')
          return
        }
        throw new Error(data.error || 'Error desconocido')
      }

      setProgress(100)
      setStatus('done')
      setTimeout(() => router.push('/dashboard'), 1000)
    } catch (err) {
      clearInterval(timer)
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo')
      setStatus('error')
      setProgress(0)
    }
  }

  if (status === 'processing' || status === 'done') {
    return <ProcessingScreen progress={progress} />
  }

  const active = dragging || !!file

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="relative flex flex-col items-center justify-center text-center cursor-pointer"
        style={{
          minHeight: 240,
          borderRadius: 20,
          border: `2px dashed ${active ? 'var(--sage)' : 'var(--border)'}`,
          backgroundColor: active ? 'var(--sage-pale)' : 'var(--card-bg)',
          transition: 'all 0.3s ease',
          padding: '40px 24px',
        }}
      >
        <input
          type="file"
          accept=".pdf,.csv"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {file ? (
          <>
            <span className="text-5xl mb-3">📄</span>
            <p className="font-semibold text-charcoal text-sm">{file.name}</p>
            <p className="text-xs text-muted mt-1">
              {(file.size / 1024).toFixed(1)} KB · listo para analizar
            </p>
          </>
        ) : (
          <>
            <span className="text-5xl mb-3" style={{ opacity: 0.5 }}>📂</span>
            <p className="font-medium text-charcoal text-sm">
              {dragging ? 'Suelta aquí el archivo' : 'Arrastra tu estado de cuenta aquí'}
            </p>
            <p className="text-xs text-muted mt-1">o haz clic para seleccionar</p>
            <div className="flex gap-2 mt-4">
              {['PDF', 'CSV', 'máx 10 MB'].map((chip) => (
                <span
                  key={chip}
                  className="text-xs border text-muted px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--warm-white)', borderColor: 'var(--border)' }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <p
          className="text-xs px-4 py-3"
          style={{
            color: 'var(--terracota)',
            backgroundColor: 'rgba(244,216,196,0.4)',
            border: '1px solid rgba(196,113,74,0.2)',
            borderRadius: 12,
          }}
        >
          {error}
        </p>
      )}

      {/* Campo de contraseña (PDF bloqueado) */}
      {status === 'needs-password' && (
        <div
          className="space-y-3"
          style={{
            backgroundColor: 'var(--terracota-light)',
            border: '1px solid rgba(196,113,74,0.25)',
            borderRadius: 16,
            padding: '16px',
          }}
        >
          <div className="flex items-center gap-2">
            <span>🔐</span>
            <p className="text-sm font-semibold" style={{ color: 'var(--terracota)' }}>
              Este PDF está protegido con contraseña
            </p>
          </div>
          <input
            type="password"
            placeholder="Ingresa la contraseña del PDF"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && password && handleUpload(password)}
            autoFocus
            style={{
              width: '100%',
              borderRadius: 10,
              border: '1px solid rgba(196,113,74,0.35)',
              backgroundColor: '#fff',
              padding: '10px 14px',
              fontSize: 14,
              color: 'var(--charcoal)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Botón procesar */}
      <button
        onClick={() => status === 'needs-password' ? handleUpload(password) : handleUpload()}
        disabled={!file || (status === 'needs-password' && !password)}
        style={{
          width: '100%',
          borderRadius: 14,
          padding: '16px',
          fontSize: '14px',
          fontWeight: 600,
          backgroundColor: (file && (status !== 'needs-password' || password)) ? 'var(--sage)' : 'var(--border)',
          color: (file && (status !== 'needs-password' || password)) ? '#fff' : 'var(--muted)',
          cursor: (file && (status !== 'needs-password' || password)) ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s ease',
          border: 'none',
        }}
      >
        {status === 'needs-password' ? 'Desbloquear y analizar' : 'Analizar estado de cuenta'}
      </button>

      {/* Card de privacidad */}
      <div
        className="flex items-start gap-3"
        style={{
          backgroundColor: 'var(--warm-white)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '12px 16px',
        }}
      >
        <span className="text-sm flex-shrink-0 mt-0.5">🔒</span>
        <p className="text-xs text-muted leading-relaxed">
          Tu archivo se procesa en memoria y <strong className="text-charcoal-light">nunca se almacena</strong>.
          Solo guardamos las categorías y montos. Tus datos del banco permanecen privados.
        </p>
      </div>
    </div>
  )
}
