'use client'

import { useEffect, useRef, useState } from 'react'
import { formatCLP } from '@/lib/format'

interface Props {
  value: number
  duration?: number
  className?: string
}

export default function AnimatedNumber({
  value,
  duration = 1200,
  className = '',
}: Props) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(eased * value)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return (
    <span className={`tabular ${className}`}>
      {formatCLP(displayed)}
    </span>
  )
}
