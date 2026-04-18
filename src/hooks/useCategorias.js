import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useCategorias(tipo = null) {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    let query = supabase.from('categorias').select('*').eq('activo', true).order('nome')
    if (tipo) query = query.eq('tipo', tipo)
    const { data } = await query
    setCategorias(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [tipo])

  async function salvarCategoria(dados, id = null) {
    const op = id
      ? supabase.from('categorias').update(dados).eq('id', id)
      : supabase.from('categorias').insert(dados)
    const { error } = await op
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success(id ? 'Categoria actualizada!' : 'Categoria criada!')
    await carregar()
    return true
  }

  return { categorias, loading, salvarCategoria, recarregar: carregar }
}
