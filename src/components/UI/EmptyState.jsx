import { PackageOpen } from 'lucide-react'

export function EmptyState({ title = 'Sem dados', description = 'Nenhum registo encontrado.', icon: Icon = PackageOpen, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="p-4 rounded-full bg-slate-800 border border-slate-700">
        <Icon size={32} className="text-slate-500" />
      </div>
      <div>
        <p className="text-slate-300 font-semibold">{title}</p>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
