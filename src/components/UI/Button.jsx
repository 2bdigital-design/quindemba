import { Loader2 } from 'lucide-react'

export function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-lg px-4 py-2.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm'
  const variants = {
    primary:   'bg-amber-500 hover:bg-amber-400 text-slate-900',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600',
    danger:    'bg-red-600 hover:bg-red-500 text-white',
    ghost:     'text-slate-400 hover:text-slate-100 hover:bg-slate-700',
    success:   'bg-emerald-600 hover:bg-emerald-500 text-white',
    outline:   'border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100',
  }
  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
