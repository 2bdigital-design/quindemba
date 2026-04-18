import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../lib/store'
import toast from 'react-hot-toast'

export function useFacturas() {
  const { anoActivo } = useAppStore()
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('facturas')
      .select('*, clientes(nome, nif, email, telefone, endereco), itens_factura(*)')
      .eq('ano', anoActivo)
      .order('data_emissao', { ascending: false })
    setFacturas(data || [])
    setLoading(false)
  }, [anoActivo])

  useEffect(() => { carregar() }, [carregar])

  async function criarFactura(dadosFactura, itens) {
    // Buscar próximo número
    const { count } = await supabase
      .from('facturas')
      .select('*', { count: 'exact', head: true })
      .eq('ano', anoActivo)
    const seq = (count || 0) + 1
    const numero_factura = `FT ${anoActivo}/${String(seq).padStart(3, '0')}`

    const subtotal = itens.reduce((s, i) => s + i.total, 0)
    const iva = dadosFactura.aplicar_iva ? subtotal * 0.14 : 0
    const total = subtotal + iva

    const { data: factura, error } = await supabase
      .from('facturas')
      .insert({ ...dadosFactura, numero_factura, subtotal, iva, total, ano: anoActivo, mes: new Date(dadosFactura.data_emissao).getMonth() + 1 })
      .select()
      .single()

    if (error) { toast.error('Erro: ' + error.message); return null }

    // Inserir itens
    const itensPayload = itens.map(i => ({ ...i, factura_id: factura.id }))
    await supabase.from('itens_factura').insert(itensPayload)

    // Registar receita no caixa
    await supabase.from('movimentos_caixa').insert({
      ano: anoActivo,
      mes: factura.mes,
      tipo: 'receita',
      descricao: `Factura ${numero_factura}`,
      valor: total,
      cliente_id: dadosFactura.cliente_id,
      documento: numero_factura,
      data_movimento: dadosFactura.data_emissao,
      forma_pagamento: dadosFactura.forma_pagamento || 'dinheiro',
    })

    toast.success(`Factura ${numero_factura} criada!`)
    await carregar()
    return factura
  }

  async function actualizarEstado(id, estado) {
    const { error } = await supabase.from('facturas').update({ estado }).eq('id', id)
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success('Estado actualizado!')
    await carregar()
    return true
  }

  async function eliminarFactura(id) {
    const { error } = await supabase.from('facturas').delete().eq('id', id)
    if (error) { toast.error('Erro: ' + error.message); return false }
    toast.success('Factura eliminada.')
    await carregar()
    return true
  }

  return { facturas, loading, criarFactura, actualizarEstado, eliminarFactura, recarregar: carregar }
}
