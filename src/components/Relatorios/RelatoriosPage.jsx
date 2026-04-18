import { useState } from 'react'
import { FileSpreadsheet, FileDown, BarChart3, TrendingUp, Package, Wallet } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../lib/store'
import { formatKz, formatData } from '../../lib/utils'
import { MESES, getMesNome } from '../../lib/meses'
import { Button } from '../UI/Button'
import { Card } from '../UI/Card'
import { GraficoAnual } from '../Dashboard/GraficoAnual'
import { useCaixa } from '../../hooks/useCaixa'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export function RelatoriosPage() {
  const { anoActivo } = useAppStore()
  const { resumoAnual, loading } = useCaixa()
  const [gerandoExcel, setGerandoExcel] = useState(null)
  const [gerandoPDF, setGerandoPDF]     = useState(null)

  // ─── Exportar Excel ───────────────────────────────────────────────────────
  async function exportarExcelCaixa() {
    setGerandoExcel('caixa')
    const { data } = await supabase
      .from('movimentos_caixa')
      .select('*, categorias(nome), clientes(nome)')
      .eq('ano', anoActivo)
      .order('data_movimento')

    const rows = (data || []).map(m => ({
      'Mês':           getMesNome(m.mes),
      'Data':          formatData(m.data_movimento),
      'Tipo':          m.tipo,
      'Descrição':     m.descricao,
      'Categoria':     m.categorias?.nome || '',
      'Cliente':       m.clientes?.nome || '',
      'Valor (Kz)':    Number(m.valor),
      'Pagamento':     m.forma_pagamento || '',
      'Documento':     m.documento || '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Caixa')

    // Resumo anual
    const resumoRows = resumoAnual.map(r => ({
      'Mês':      getMesNome(r.mes),
      'Receitas': Number(r.total_receitas || 0),
      'Despesas': Number(r.total_despesas || 0),
      'Saldo':    Number(r.saldo || 0),
    }))
    const wsResumo = XLSX.utils.json_to_sheet(resumoRows)
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Anual')

    XLSX.writeFile(wb, `Quindemba_Caixa_${anoActivo}.xlsx`)
    setGerandoExcel(null)
  }

  async function exportarExcelEstoque() {
    setGerandoExcel('estoque')
    const { data } = await supabase
      .from('movimentos_estoque')
      .select('*, produtos(nome, unidade)')
      .eq('ano', anoActivo)
      .order('data_movimento')

    const rows = (data || []).map(m => ({
      'Mês':          getMesNome(m.mes),
      'Data':         formatData(m.data_movimento),
      'Tipo':         m.tipo,
      'Produto':      m.produtos?.nome || '',
      'Quantidade':   m.quantidade,
      'Unidade':      m.produtos?.unidade || '',
      'Preço Unit.':  Number(m.preco_unitario || 0),
      'Total (Kz)':   Number(m.valor_total || 0),
      'Fornecedor':   m.fornecedor || '',
      'Documento':    m.documento || '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Estoque')
    XLSX.writeFile(wb, `Quindemba_Estoque_${anoActivo}.xlsx`)
    setGerandoExcel(null)
  }

  async function exportarExcelFacturas() {
    setGerandoExcel('facturas')
    const { data } = await supabase
      .from('facturas')
      .select('*, clientes(nome)')
      .eq('ano', anoActivo)
      .order('data_emissao')

    const rows = (data || []).map(f => ({
      'Nº Factura':   f.numero_factura,
      'Data':         formatData(f.data_emissao),
      'Cliente':      f.clientes?.nome || '',
      'Subtotal':     Number(f.subtotal || 0),
      'IVA':          Number(f.iva || 0),
      'Total (Kz)':   Number(f.total || 0),
      'Estado':       f.estado,
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas')
    XLSX.writeFile(wb, `Quindemba_Facturas_${anoActivo}.xlsx`)
    setGerandoExcel(null)
  }

  // ─── Exportar PDF Relatório Anual ─────────────────────────────────────────
  async function exportarPDFAnual() {
    setGerandoPDF('anual')
    const doc = new jsPDF()
    const corAmbar = [245, 158, 11]

    // Header
    doc.setFillColor(...corAmbar)
    doc.rect(0, 0, 210, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('QUINDEMBA', 15, 15)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Relatório Anual — ${anoActivo}`, 15, 24)

    // Resumo mensal
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo de Caixa por Mês', 15, 42)

    const tableData = MESES.map(m => {
      const d = resumoAnual.find(r => r.mes === m.numero) || {}
      return [
        m.nome,
        formatKz(d.total_receitas || 0),
        formatKz(d.total_despesas || 0),
        formatKz(d.saldo || 0),
      ]
    })
    const totais = [
      'TOTAL',
      formatKz(resumoAnual.reduce((s, r) => s + Number(r.total_receitas || 0), 0)),
      formatKz(resumoAnual.reduce((s, r) => s + Number(r.total_despesas || 0), 0)),
      formatKz(resumoAnual.reduce((s, r) => s + Number(r.saldo || 0), 0)),
    ]

    autoTable(doc, {
      startY: 47,
      head: [['Mês', 'Receitas', 'Despesas', 'Saldo']],
      body: [...tableData, totais],
      headStyles: { fillColor: corAmbar, textColor: [255, 255, 255] },
      footStyles: { fillColor: [241, 245, 249], fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      didParseCell: (data) => {
        if (data.row.index === tableData.length && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [241, 245, 249]
        }
      }
    })

    doc.save(`Quindemba_Relatorio_${anoActivo}.pdf`)
    setGerandoPDF(null)
  }

  const totalReceitas = resumoAnual.reduce((s, r) => s + Number(r.total_receitas || 0), 0)
  const totalDespesas = resumoAnual.reduce((s, r) => s + Number(r.total_despesas || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Relatórios — {anoActivo}</h1>
        <p className="text-sm text-slate-500">Exportar dados para Excel e PDF</p>
      </div>

      {/* Gráfico anual */}
      <div className="card">
        <h3 className="section-title mb-5 flex items-center gap-2">
          <BarChart3 size={18} /> Receitas vs Despesas
        </h3>
        <GraficoAnual dados={resumoAnual} />
      </div>

      {/* Exportações Excel */}
      <div>
        <h3 className="section-title mb-3 flex items-center gap-2">
          <FileSpreadsheet size={18} className="text-emerald-400" /> Exportar para Excel
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Caixa / Financeiro', desc: 'Todos os movimentos de caixa + resumo anual', fn: exportarExcelCaixa, key: 'caixa', icon: Wallet },
            { label: 'Estoque', desc: 'Todos os movimentos de estoque do ano', fn: exportarExcelEstoque, key: 'estoque', icon: Package },
            { label: 'Facturas', desc: 'Lista completa de facturas emitidas', fn: exportarExcelFacturas, key: 'facturas', icon: FileSpreadsheet },
          ].map(item => (
            <div key={item.key} className="card-hover">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-emerald-500/10">
                  <item.icon size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200 text-sm">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <Button
                variant="success"
                className="w-full justify-center"
                loading={gerandoExcel === item.key}
                onClick={item.fn}
              >
                <FileSpreadsheet size={15} /> Exportar .xlsx
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Exportações PDF */}
      <div>
        <h3 className="section-title mb-3 flex items-center gap-2">
          <FileDown size={18} className="text-red-400" /> Exportar para PDF
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card-hover">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-red-500/10">
                <TrendingUp size={20} className="text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-sm">Relatório Anual de Caixa</p>
                <p className="text-xs text-slate-500 mt-0.5">Resumo mensal de receitas, despesas e saldos</p>
                <p className="text-xs text-amber-400 mt-1">
                  Total: {formatKz(totalReceitas - totalDespesas)}
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              className="w-full justify-center"
              loading={gerandoPDF === 'anual'}
              onClick={exportarPDFAnual}
            >
              <FileDown size={15} /> Exportar .pdf
            </Button>
          </div>
        </div>
      </div>

      {/* Resumo tabela */}
      <div className="card">
        <h3 className="section-title mb-4">Resumo por Mês — {anoActivo}</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="table-header">Mês</th>
                <th className="table-header text-right">Receitas</th>
                <th className="table-header text-right">Despesas</th>
                <th className="table-header text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {MESES.map(m => {
                const d = resumoAnual.find(r => r.mes === m.numero) || {}
                const saldo = Number(d.saldo || 0)
                return (
                  <tr key={m.numero} className="table-row">
                    <td className="table-cell font-medium text-slate-200">{m.nome}</td>
                    <td className="table-cell text-right text-emerald-400">{formatKz(d.total_receitas || 0)}</td>
                    <td className="table-cell text-right text-red-400">{formatKz(d.total_despesas || 0)}</td>
                    <td className={`table-cell text-right font-semibold ${saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatKz(saldo)}
                    </td>
                  </tr>
                )
              })}
              <tr className="border-t-2 border-amber-500/30 bg-amber-500/5">
                <td className="table-cell font-bold text-amber-400">TOTAL</td>
                <td className="table-cell text-right font-bold text-emerald-400">{formatKz(totalReceitas)}</td>
                <td className="table-cell text-right font-bold text-red-400">{formatKz(totalDespesas)}</td>
                <td className={`table-cell text-right font-bold ${totalReceitas - totalDespesas >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatKz(totalReceitas - totalDespesas)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
