import type { Category } from '@/types'
import { formatCLP } from '@/lib/format'

interface Props {
  categories: Category[]
  size?: number
}

export default function CategoryDonut({ categories, size = 200 }: Props) {
  const top = categories.filter((c) => c.total > 0).slice(0, 8)
  const total = top.reduce((sum, c) => sum + c.total, 0)
  if (total === 0) return null

  const cx = size / 2
  const cy = size / 2
  const R = size * 0.38
  const ri = size * 0.22
  const gap = 0.025

  let angle = -Math.PI / 2

  const segments = top.map((cat) => {
    const sweep = (cat.total / total) * (2 * Math.PI) - gap
    const a1 = angle
    angle += sweep + gap
    const a2 = a1 + sweep

    const large = sweep > Math.PI ? 1 : 0

    const d = [
      `M ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}`,
      `A ${R} ${R} 0 ${large} 1 ${cx + R * Math.cos(a2)} ${cy + R * Math.sin(a2)}`,
      `L ${cx + ri * Math.cos(a2)} ${cy + ri * Math.sin(a2)}`,
      `A ${ri} ${ri} 0 ${large} 0 ${cx + ri * Math.cos(a1)} ${cy + ri * Math.sin(a1)}`,
      'Z',
    ].join(' ')

    return { d, cat }
  })

  return (
    <div className="flex flex-col items-center gap-5">
      {/* SVG donut */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {segments.map(({ d, cat }, i) => (
          <path key={i} d={d} fill={cat.color} opacity={0.88} />
        ))}
        {/* Label central */}
        <text
          x={cx} y={cy - 7}
          textAnchor="middle"
          fontSize="10"
          fill="var(--muted)"
          fontFamily="var(--font-dm-sans)"
        >
          Total gastos
        </text>
        <text
          x={cx} y={cy + 11}
          textAnchor="middle"
          fontSize="15"
          fontWeight="700"
          fill="var(--charcoal)"
          fontFamily="var(--font-dm-sans)"
        >
          {formatCLP(total)}
        </text>
      </svg>

      {/* Leyenda */}
      <div className="w-full grid grid-cols-2 gap-x-6 gap-y-2">
        {top.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-xs text-charcoal-light truncate">
              {cat.icon} {cat.name}
            </span>
            <span className="text-xs font-semibold text-charcoal tabular ml-auto">
              {cat.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
