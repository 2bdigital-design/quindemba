export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`${hover ? 'card-hover' : 'card'} ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({ title, value, icon: Icon, color = 'amber', trend, subtitle }) {
  const colors = {
    amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20' },
    green:   { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    red:     { bg: 'bg-red-500/10',     icon: 'text-red-400',     border: 'border-red-500/20' },
    blue:    { bg: 'bg-blue-500/10',    icon: 'text-blue-400',    border: 'border-blue-500/20' },
    purple:  { bg: 'bg-purple-500/10',  icon: 'text-purple-400',  border: 'border-purple-500/20' },
  }
  const c = colors[color] || colors.amber

  return (
    <div className={`card border ${c.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}% vs mês anterior
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${c.bg}`}>
            <Icon size={22} className={c.icon} />
          </div>
        )}
      </div>
    </div>
  )
}
