import { useState, useEffect } from 'react'
import { Settings, Building2, Tags, Plus, Trash2, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { useCategorias } from '../../hooks/useCategorias'
import { useAno } from '../../hooks/useAno'
import { useAppStore } from '../../lib/store'
import { Input, Select, Textarea } from '../UI/Input'
import { Button } from '../UI/Button'
import { Modal } from '../UI/Modal'
import { BotaoNovoAno } from '../Dashboard/BotaoNovoAno'
import toast from 'react-hot-toast'

const TABS = ['Empresa', 'Categorias', 'Ano']

function TabEmpresa() {
  const [empresa, setEmpresa] = useState({})
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    const saved = localStorage.getItem('quindemba_empresa')
    if (saved) { const d = JSON.parse(saved); setEmpresa(d); reset(d) }
  }, [])

  function guardar(dados) {
    setLoading(true)
    localStorage.setItem('quindemba_empresa', JSON.stringify(dados))
    setEmpresa(dados)
    toast.success('Dados da empresa guardados!')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(guardar)} className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
        Os dados da empresa são usados na geração de facturas PDF.
      </div>
      <Input label="Nome da empresa" defaultValue="Quindemba" {...register('nome')} />
      <Input label="Sub-título" placeholder="Recauchutagem e Serviços" {...register('subtitulo')} />
      <Input label="NIF" placeholder="Número de identificação fiscal" {...register('nif')} />
      <Input label="Telefone" placeholder="+244 9xx xxx xxx" {...register('telefone')} />
      <Input label="Email" type="email" {...register('email')} />
      <Textarea label="Endereço" placeholder="Morada completa…" {...register('endereco')} />
      <Input label="Rodapé da factura" placeholder="Texto no rodapé do PDF" {...register('rodape')} />
      <Button type="submit" variant="primary" loading={loading}>Guardar Alterações</Button>
    </form>
  )
}

function TabCategorias() {
  const { categorias, salvarCategoria } = useCategorias()
  const [modal, setModal] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  async function criarCategoria(dados) {
    const ok = await salvarCategoria(dados)
    if (ok) { setModal(false); reset() }
  }

  const grupos = {
    produto:  categorias.filter(c => c.tipo === 'produto'),
    servico:  categorias.filter(c => c.tipo === 'servico'),
    despesa:  categorias.filter(c => c.tipo === 'despesa'),
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{categorias.length} categorias activas</p>
        <Button variant="primary" onClick={() => setModal(true)}>
          <Plus size={15} /> Nova Categoria
        </Button>
      </div>

      {Object.entries(grupos).map(([tipo, itens]) => (
        <div key={tipo} className="card">
          <h3 className="section-title mb-3 capitalize">
            {tipo === 'produto' ? 'Produtos' : tipo === 'servico' ? 'Serviços' : 'Despesas'}
          </h3>
          {itens.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma categoria neste grupo.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {itens.map(c => (
                <span key={c.id} className="badge-blue">{c.nome}</span>
              ))}
            </div>
          )}
        </div>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title="Nova Categoria">
        <form onSubmit={handleSubmit(criarCategoria)} className="space-y-4">
          <Input label="Nome *" {...register('nome', { required: true })} />
          <Select label="Tipo *" {...register('tipo', { required: true })}>
            <option value="">Seleccionar…</option>
            <option value="produto">Produto</option>
            <option value="servico">Serviço</option>
            <option value="despesa">Despesa</option>
          </Select>
          <Textarea label="Descrição" {...register('descricao')} />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={isSubmitting}>Criar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function TabAno() {
  const { anoActivo, setAnoActivo, anos } = useAno()

  return (
    <div className="space-y-5 max-w-lg">
      <div className="card border-amber-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10">
            <Sparkles size={24} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-100">Ano Activo: {anoActivo}</p>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Inicia o novo ano com um clique. O saldo de Dezembro é transferido para Janeiro, o estoque é mantido e o ano anterior fica disponível para consulta.
            </p>
            <div className="mt-4">
              <BotaoNovoAno />
            </div>
          </div>
        </div>
      </div>

      {/* Anos disponíveis */}
      {anos.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-3">Anos Disponíveis</h3>
          <div className="space-y-2">
            {anos.map(a => (
              <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                a.ano === anoActivo ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/40 border-slate-700/50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${a.ano === anoActivo ? 'text-amber-400' : 'text-slate-300'}`}>
                    {a.ano}
                  </span>
                  {a.activo && <span className="badge-yellow">Activo</span>}
                </div>
                {a.ano !== anoActivo && (
                  <button
                    onClick={() => setAnoActivo(a.ano)}
                    className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    Consultar →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ConfiguracoesPage() {
  const [tab, setTab] = useState('Empresa')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Settings size={24} /> Configurações
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-700 pb-0">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {tab === 'Empresa'    && <TabEmpresa />}
        {tab === 'Categorias' && <TabCategorias />}
        {tab === 'Ano'        && <TabAno />}
      </div>
    </div>
  )
}
