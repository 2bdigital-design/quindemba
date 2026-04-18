import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useClientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')
    setClientes(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function salvarCliente(dados, id = null) {
    const op = id
      ? supabase.from('clientes').update(dados).eq('id', id)
      : supabase.from('clientes').insert(dados)
    const { error } = await op
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success(id ? 'Cliente actualizado!' : 'Cliente registado!')
    await carregar()
    return true
  }

  async function eliminarCliente(id) {
    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success('Cliente removido.')
    await carregar()
    return true
  }

  async function buscarCliente(id) {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  return { clientes, loading, salvarCliente, eliminarCliente, buscarCliente, recarregar: carregar }
}
