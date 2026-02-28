import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-charcoal">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-4 py-3 border rounded-xl text-sm transition-all
          bg-card-bg text-charcoal placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage
          ${error ? 'border-terracota bg-terracota-light/30' : 'border-border'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-terracota">{error}</p>}
    </div>
  )
}
