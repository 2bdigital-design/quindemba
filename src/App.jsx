import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAppStore } from './lib/store'

// Auth
import { LoginPage } from './components/Auth/LoginPage'

// Layout
import { AppLayout } from './components/Layout/AppLayout'

// Pages
import { DashboardPage }       from './components/Dashboard/DashboardPage'
import { EstoquePage }         from './components/Estoque/EstoquePage'
import { EstoqueMesPage }      from './components/Estoque/EstoqueMesPage'
import { CaixaPage }           from './components/Caixa/CaixaPage'
import { CaixaMesPage }        from './components/Caixa/CaixaMesPage'
import { FacturasPage }        from './components/Facturacao/FacturasPage'
import { FormFactura }         from './components/Facturacao/FormFactura'
import { ClientesPage }        from './components/Clientes/ClientesPage'
import { HistoricoCliente }    from './components/Clientes/HistoricoCliente'
import { RelatoriosPage }      from './components/Relatorios/RelatoriosPage'
import { ConfiguracoesPage }   from './components/Configuracoes/ConfiguracoesPage'
import { RelatorioDiarioPage } from './components/RelatorioDiario/RelatorioDiarioPage'
import { PageLoading }         from './components/UI/Loading'

// ─── Route header titles ──────────────────────────────────────────────────────
function getPageTitle(pathname) {
  if (pathname === '/')                   return { title: 'Dashboard', subtitle: 'Visão geral do negócio' }
  if (pathname.startsWith('/estoque/'))   return { title: 'Estoque',   subtitle: 'Controlo de materiais e produtos' }
  if (pathname === '/estoque')            return { title: 'Estoque',   subtitle: 'Visão geral do estoque' }
  if (pathname.startsWith('/caixa/'))    return { title: 'Caixa',     subtitle: 'Fluxo de caixa mensal' }
  if (pathname === '/caixa')             return { title: 'Caixa',     subtitle: 'Fluxo de caixa anual' }
  if (pathname === '/facturas/nova')     return { title: 'Nova Factura', subtitle: 'Emitir documento' }
  if (pathname.startsWith('/facturas'))  return { title: 'Facturação', subtitle: 'Gestão de facturas' }
  if (pathname.startsWith('/clientes'))  return { title: 'Clientes',   subtitle: 'Base de clientes' }
  if (pathname === '/relatorios')           return { title: 'Relatórios',      subtitle: 'Exportar dados' }
  if (pathname === '/relatorio-diario')     return { title: 'Relatório Diário', subtitle: 'Caixa por sector · hoje' }
  if (pathname === '/configuracoes')        return { title: 'Configurações',    subtitle: 'Definições do sistema' }
  return { title: 'Quindemba', subtitle: '' }
}

// ─── Protected route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, session, loading }) {
  if (loading) return <PageLoading />
  if (!session) return <Navigate to="/login" replace />
  return children
}

// ─── Layout wrapper ───────────────────────────────────────────────────────────
function LayoutWithTitle() {
  const location = useLocation()
  const { title, subtitle } = getPageTitle(location.pathname)
  return <AppLayout title={title} subtitle={subtitle} />
}

export default function App() {
  const { setUser } = useAppStore()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <PageLoading />

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <LoginPage />} />

      {/* Protected app */}
      <Route
        element={
          <ProtectedRoute session={session} loading={false}>
            <LayoutWithTitle />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Estoque */}
        <Route path="estoque"             element={<EstoquePage />} />
        <Route path="estoque/:mes"        element={<EstoqueMesPage />} />

        {/* Caixa */}
        <Route path="caixa"              element={<CaixaPage />} />
        <Route path="caixa/:mes"         element={<CaixaMesPage />} />

        {/* Facturação */}
        <Route path="facturas"           element={<FacturasPage />} />
        <Route path="facturas/nova"      element={<FormFactura />} />

        {/* Clientes */}
        <Route path="clientes"           element={<ClientesPage />} />
        <Route path="clientes/:id"       element={<HistoricoCliente />} />

        {/* Relatórios */}
        <Route path="relatorios"         element={<RelatoriosPage />} />

        {/* Relatório Diário por sector */}
        <Route path="relatorio-diario"   element={<RelatorioDiarioPage />} />

        {/* Configurações */}
        <Route path="configuracoes"      element={<ConfiguracoesPage />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
