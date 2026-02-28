interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  variant?: 'default' | 'dark' | 'ghost'
}

export default function Card({
  children,
  className = '',
  padding = true,
  variant = 'default',
}: CardProps) {
  const base = 'rounded-[20px] transition-all duration-200'

  const variantClasses = {
    default: 'bg-card-bg border border-border card-shadow',
    dark:    'bg-charcoal border-0',
    ghost:   'bg-transparent border-0',
  }

  return (
    <div className={`${base} ${variantClasses[variant]} ${padding ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  )
}
