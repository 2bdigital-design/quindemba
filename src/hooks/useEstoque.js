import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../lib/store'
import toast from 'react-hot-toast'

export function useEstoque(mes = null) {
  const { anoActivo } = useAppStore()
  const [movimentos, setMovimentos] = useState([])
  const [produtos, setProdutos] = useState([])
  const [estoqueActual, setEstoqueActual] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      // Produtos activos
      const { data: prods } = await supabase
        .from('produtos')
        .select('*, categorias(nome)')
        .eq('activo', true)
        .order('nome')
      setProdutos(prods || [])

      // Movimentos do mês (ou todos do ano)
      let query = supabase
        .from('movimentos_estoque')
        .select('*, produtos(nome, unidade)')
        .eq('ano', anoActivo)
        .order('data_movimento', { ascending: false })
      if (mes) query = query.eq('mes', mes)
      const { data: movs } = await query
      setMovimentos(movs || [])

      // Estoque actual (view)
      const { data: est } = await supabase
        .from('v_estoque_actual')
        .select('*')
        .order('nome')
      setEstoqueActual(est || [])
    } finally {
      setLoading(false)
    }
  }, [anoActivo, mes])

  useEffect(() => { carregar() }, [carregar])

  async function registarMovimento(dados) {
    const payload = {
      ...dados,
      ano: anoActivo,
      mes: mes || new Date(dados.data_movimento).getMonth() + 1,
      valor_total: dados.quantidade * dados.preco_unitario,
    }
    const { error } = await supabase.from('movimentos_estoque').insert(payload)
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success('Movimento registado!')
    await carregar()
    return true
  }

  async function eliminarMovimento(id) {
    const { error } = await supabase.from('movimentos_estoque').delete().eq('id', id)
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success('Movimento eliminado.')
    await carregar()
    return true
  }

  // Resumo do mês
  const resumo = {
    entradas: movimentos.filter(m => m.tipo === 'entrada').reduce((s, m) => s + (m.valor_total || 0), 0),
    saidas:   movimentos.filter(m => m.tipo === 'saida').reduce((s, m) => s + (m.valor_total || 0), 0),
    qEntradas: movimentos.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.quantidade, 0),
    qSaidas:   movimentos.filter(m => m.tipo === 'saida').reduce((s, m) => s + m.quantidade, 0),
  }

  return { movimentos, produtos, estoqueActual, loading, registarMovimento, eliminarMovimento, resumo, recarregar: carregar }
}

export function useProdutos() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('produtos')
      .select('*, categorias(nome)')
      .order('nome')
    setProdutos(data || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function salvarProduto(dados, id = null) {
    const op = id
      ? supabase.from('produtos').update(dados).eq('id', id)
      : supabase.from('produtos').insert(dados)
    const { error } = await op
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success(id ? 'Produto actualizado!' : 'Produto criado!')
    await carregar()
    return true
  }

  async function eliminarProduto(id) {
    const { error } = await supabase.from('produtos').update({ activo: false }).eq('id', id)
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success('Produto removido.')
    await carregar()
    return true
  }

  return { produtos, loading, salvarProduto, eliminarProduto, recarregar: carregar }
}
