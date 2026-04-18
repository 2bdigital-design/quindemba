import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ─── Ano activo ────────────────────────────────────────────────
      anoActivo: new Date().getFullYear(),
      setAnoActivo: (ano) => set({ anoActivo: ano }),

      // ─── Utilizador autenticado ───────────────────────────────────
      user: null,
      setUser: (user) => set({ user }),

      // ─── Sidebar aberta/fechada (mobile) ─────────────────────────
      sidebarAberta: false,
      setSidebarAberta: (v) => set({ sidebarAberta: v }),
      toggleSidebar: () => set((s) => ({ sidebarAberta: !s.sidebarAberta })),
    }),
    {
      name: 'quindemba-store',
      partialize: (state) => ({ anoActivo: state.anoActivo }),
    }
  )
)
