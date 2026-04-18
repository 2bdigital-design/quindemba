import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, User, Phone, Mail, Trash2, Edit2 } from 'lucide-react'
import { useClientes } from '../../hooks/useClientes'
import { Button } from '../UI/Button'
import { Loading } from '../UI/Loading'
import { EmptyState } from '../UI/EmptyState'
import { Modal } from '../UI/Modal'
import { ConfirmDialog } from '../UI/ConfirmDialog'
import { FormCliente } from './FormCliente'

export function ClientesPage() {
  const navigate = useNavigate()
  const { clientes, loading, salvarCliente, eliminarCliente } = useClientes()
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [deletar, setDeletar] = useState(null)
  const [deletando, setDeletando] = useState(false)

  if (loading) return <Loading />

  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone || '').includes(busca) ||
    (c.email || '').toLowerCase().includes(busca.toLowerCase())
  )

  function abrirNovo() { setEditando(null); setModal(true) }
  function abrirEditar(c) { setEditando(c); setModal(true) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="text-sm text-slate-500">{clientes.length} clientes registados</p>
        </div>
        <Button variant="primary" onClick={abrirNovo}>
          <Plus size={16} /> Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input-field pl-9" placeholder="Buscar por nome, telefone ou email…"
          value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={User}
          title="Sem clientes"
          description="Nenhum cliente encontrado."
          action={<Button onClick={abrirNovo} variant="primary"><Plus size={15} /> Novo Cliente</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(c => (
            <div key={c.id} className="card-hover flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 font-bold text-sm">
                      {c.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100 text-sm">{c.nome}</p>
                    {c.nif && <p className="text-xs text-slate-500">NIF: {c.nif}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => abrirEditar(c)}
                    className="p-1.5 rounded text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeletar(c)}
                    className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                {c.telefone && (
                  <p className="flex items-center gap-2"><Phone size={12} /> {c.telefone}</p>
                )}
                {c.email && (
                  <p className="flex items-center gap-2"><Mail size={12} /> {c.email}</p>
                )}
              </div>

              <button
                onClick={() => navigate(`/clientes/${c.id}`)}
                className="text-xs text-amber-400 hover:text-amber-300 text-left transition-colors"
              >
                Ver histórico →
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editando ? 'Editar Cliente' : 'Novo Cliente'}>
        <FormCliente
          defaultValues={editando || {}}
          onSave={async (dados) => {
            const ok = await salvarCliente(dados, editando?.id)
            if (ok) setModal(false)
          }}
          onCancel={() => setModal(false)}
        />
      </Modal>

      <ConfirmDialog
        open={!!deletar}
        onClose={() => setDeletar(null)}
        title="Eliminar cliente"
        message={`Eliminar o cliente "${deletar?.nome}"? Esta acção não pode ser revertida.`}
        loading={deletando}
        onConfirm={async () => {
          setDeletando(true)
          await eliminarCliente(deletar.id)
          setDeletando(false)
          setDeletar(null)
        }}
      />
    </div>
  )
}
