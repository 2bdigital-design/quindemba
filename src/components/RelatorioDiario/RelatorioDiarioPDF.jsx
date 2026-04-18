import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatKz, formatData } from '../../lib/utils'
import { ICONE_SECTOR } from '../../hooks/useSectores'

export function gerarRelatorioDiarioPDF(data, sectores, resumo, movimentos, passagens, totalDia) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 14
  const corAmbar = [245, 158, 11]

  // ─── Cabeçalho ────────────────────────────────────────────
  doc.setFillColor(...corAmbar)
  doc.rect(0, 0, W, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('QUINDEMBA', margin, 13)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Relatório Diário de Caixa', margin, 21)
  doc.text(formatData(data), W - margin, 21, { align: 'right' })

  // ─── Totais globais ────────────────────────────────────────
  let y = 38
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Global do Dia', margin, y)

  autoTable(doc, {
    startY: y + 4,
    head: [['', 'Receitas', 'Despesas', 'Saldo']],
    body: [
      ['TOTAL GERAL',
        formatKz(totalDia.receitas),
        formatKz(totalDia.despesas),
        formatKz(totalDia.saldo)
      ]
    ],
    headStyles: { fillColor: corAmbar, textColor: [255,255,255], fontStyle: 'bold' },
    bodyStyles: { fontStyle: 'bold', fontSize: 10 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    margin: { left: margin, right: margin },
  })

  y = doc.lastAutoTable.finalY + 8

  // ─── Por sector ────────────────────────────────────────────
  const CORES_SECTOR = {
    'Loja':          [59, 130, 246],
    'Recauchutagem': [245, 158, 11],
    'Lavagem':       [16, 185, 129],
  }

  for (const sector of sectores) {
    const res = resumo.find(r => r.sector_id === sector.id) || {}
    const movsSect = movimentos.filter(m => m.sector_id === sector.id)
    const passagem = passagens.find(p => p.sector_id === sector.id)
    const corSect = CORES_SECTOR[sector.nome] || [100, 116, 139]
    const icone = ICONE_SECTOR[sector.nome] || ''

    // Título do sector
    doc.setFillColor(...corSect)
    doc.roundedRect(margin, y, W - margin * 2, 9, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`${sector.nome.toUpperCase()}  ${passagem?.fechado ? '(FECHADO)' : '(ABERTO)'}`,
      margin + 4, y + 6)
    y += 13

    // Resumo do sector
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Receitas: ${formatKz(res.total_receitas || 0)}`, margin + 4, y)
    doc.text(`Despesas: ${formatKz(res.total_despesas || 0)}`, margin + 54, y)
    doc.text(`Saldo: ${formatKz(res.saldo || 0)}`, margin + 108, y)
    y += 6

    // Movimentos do sector
    if (movsSect.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Descrição', 'Tipo', 'Valor (Kz)', 'Pagamento']],
        body: movsSect.map(m => [
          m.descricao,
          m.tipo === 'receita' ? '↑ Receita' : '↓ Despesa',
          formatKz(m.valor),
          m.forma_pagamento || '—',
        ]),
        headStyles: { fillColor: [30, 41, 59], textColor: [255,255,255], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 2: { halign: 'right' } },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 1) {
            data.cell.styles.textColor = data.cell.text[0].includes('Receita')
              ? [16, 185, 129] : [239, 68, 68]
          }
        }
      })
      y = doc.lastAutoTable.finalY + 6
    } else {
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text('Sem movimentos neste sector.', margin + 4, y)
      y += 8
    }

    // Responsável se fechado
    if (passagem?.responsavel) {
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text(`Responsável: ${passagem.responsavel}`, margin + 4, y)
      y += 5
    }

    y += 4

    // Nova página se necessário
    if (y > 260) { doc.addPage(); y = 20 }
  }

  // ─── Rodapé ────────────────────────────────────────────────
  doc.setFillColor(241, 245, 249)
  doc.rect(0, 285, W, 12, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text(`Quindemba · Relatório Diário · ${formatData(data)} · Gerado em ${new Date().toLocaleString('pt-AO')}`,
    W / 2, 292, { align: 'center' })

  doc.save(`Relatorio_Diario_${data}.pdf`)
}
