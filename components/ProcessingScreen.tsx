'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  'Leyendo tus transacciones...',
  'Identificando comercios y montos...',
  'Categorizando con IA...',
  'Preparando tu resumen...',
  '¡Listo!',
]

interface Props {
  progress?: number
}

export default function ProcessingScreen({ progress = 0 }: Props) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, MESSAGES.length - 1))
    }, 700)
    return () => clearInterval(timer)
  }, [])

  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      {/* Círculo SVG de progreso */}
      <div className="relative" style={{ width: 112, height: 112 }}>
        <svg
          width="112"
          height="112"
          viewBox="0 0 100 100"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          {/* Progreso */}
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="var(--sage)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        {/* Emoji centrado */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl">🧠</span>
        </div>
      </div>

      {/* Mensaje rotativo */}
      <p
        className="text-sm text-center font-medium"
        style={{ color: 'var(--charcoal-light)', minHeight: 20, transition: 'opacity 0.3s' }}
      >
        {MESSAGES[msgIndex]}
      </p>

      {/* Barra de progreso lineal */}
      <div
        className="overflow-hidden rounded-full"
        style={{ width: 192, height: 4, backgroundColor: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: 'var(--sage)',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  )
}
