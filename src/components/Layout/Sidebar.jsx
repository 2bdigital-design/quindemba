import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Wallet, FileText,
  Users, BarChart3, Settings, ChevronDown, ChevronRight, X, CalendarDays
} from 'lucide-react'
import { useState } from 'react'
import { MESES } from '../../lib/meses'
import { useAppStore } from '../../lib/store'

const NAV_ITEMS = [
  { path: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/estoque',      icon: Package,         label: 'Estoque',     sub: 'estoque' },
  { path: '/caixa',        icon: Wallet,          label: 'Caixa',       sub: 'caixa' },
  { path: '/facturas',        icon: FileText,     label: 'Facturação' },
  { path: '/clientes',        icon: Users,        label: 'Clientes' },
  { path: '/relatorio-diario',icon: CalendarDays, label: 'Relatório Diário' },
  { path: '/relatorios',      icon: BarChart3,    label: 'Relatórios' },
  { path: '/configuracoes',   icon: Settings,     label: 'Configurações' },
]

function MesLinks({ base }) {
  const { anoActivo } = useAppStore()
  const mesActual = new Date().getMonth() + 1
  return (
    <div className="ml-4 border-l border-slate-700 pl-3 space-y-0.5 mt-1">
      {MESES.map(m => (
        <NavLink
          key={m.numero}
          to={`/${base}/${m.numero}`}
          className={({ isActive }) =>
            `flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
              isActive
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/40'
            } ${m.numero === mesActual ? 'font-semibold' : ''}`
          }
        >
          <span className="w-5 text-center text-[10px] text-slate-600">{m.numero}</span>
          {m.nome}
          {m.numero === mesActual && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </NavLink>
      ))}
    </div>
  )
}

export function Sidebar() {
  const { anoActivo, sidebarAberta, setSidebarAberta } = useAppStore()
  const location = useLocation()
  const [expanded, setExpanded] = useState(() => {
    if (location.pathname.startsWith('/estoque')) return 'estoque'
    if (location.pathname.startsWith('/caixa')) return 'caixa'
    return null
  })

  function toggle(sub) {
    setExpanded(prev => prev === sub ? null : sub)
  }

  return (
    <>
      {/* Overlay mobile */}
      {sidebarAberta && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800
        flex flex-col z-40 transition-transform duration-300
        ${sidebarAberta ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-amber-400 tracking-wide">QUINDEMBA</h1>
            <p className="text-xs text-slate-500">{anoActivo} · Gestão de Recauchutagem</p>
          </div>
          <button
            onClick={() => setSidebarAberta(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-100 hover:bg-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
            const isExpanded = expanded === item.sub

            if (item.sub) {
              return (
                <div key={item.path}>
                  <button
                    onClick={() => toggle(item.sub)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/60'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isExpanded
                      ? <ChevronDown size={14} />
                      : <ChevronRight size={14} />
                    }
                  </button>
                  {isExpanded && <MesLinks base={item.sub} />}
                </div>
              )
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link-active' : 'sidebar-link'
                }
                onClick={() => setSidebarAberta(false)}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-600 text-center">
          Quindemba &copy; {anoActivo}
        </div>
      </aside>
    </>
  )
}
