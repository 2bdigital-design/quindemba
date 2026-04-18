import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import toast from 'react-hot-toast'

export function Header({ title, subtitle }) {
  const { toggleSidebar, user, anoActivo } = useAppStore()
  const [menuAberto, setMenuAberto] = useState(false)
  const navigate = useNavigate()

  async function sair() {
    await supabase.auth.signOut()
    toast.success('Sessão terminada.')
    navigate('/login')
  }

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          {title && <h2 className="text-base font-semibold text-slate-100 leading-tight">{title}</h2>}
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Ano badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <span className="text-xs font-semibold text-amber-400">{anoActivo}</span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
              <User size={14} className="text-amber-400" />
            </div>
            <span className="hidden sm:block text-sm text-slate-300 max-w-[120px] truncate">
              {user?.email?.split('@')[0] || 'Utilizador'}
            </span>
            <ChevronDown size={14} />
          </button>

          {menuAberto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700">
                  <p className="text-xs text-slate-500">Sessão iniciada como</p>
                  <p className="text-sm text-slate-200 font-medium truncate">{user?.email || '—'}</p>
                </div>
                <button
                  onClick={sair}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  Terminar sessão
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
