import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatKz, formatData } from '../../lib/utils'

export function gerarFacturaPDF(factura, empresa = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 15
  const corPrimaria = [245, 158, 11] // amber-500
  const corTexto    = [15, 23, 42]   // slate-950

  // ─── Cabeçalho ────────────────────────────────────────────────────────────
  doc.setFillColor(...corPrimaria)
  doc.rect(0, 0, W, 38, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(empresa.nome || 'QUINDEMBA', margin, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(empresa.subtitulo || 'Recauchutagem e Serviços', margin, 26)
  doc.text(empresa.nif ? `NIF: ${empresa.nif}` : '', margin, 33)

  // Número da factura (direita)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(factura.numero_factura, W - margin, 18, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Data: ${formatData(factura.data_emissao)}`, W - margin, 26, { align: 'right' })
  if (factura.data_vencimento) {
    doc.text(`Vencimento: ${formatData(factura.data_vencimento)}`, W - margin, 33, { align: 'right' })
  }

  // ─── Cliente ──────────────────────────────────────────────────────────────
  let y = 48
  doc.setTextColor(...corTexto)
  doc.setFillColor(241, 245, 249) // slate-100
  doc.roundedRect(margin, y, W - margin * 2, 28, 3, 3, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('FACTURADO A:', margin + 4, y + 7)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...corTexto)
  doc.text(factura.clientes?.nome || '—', margin + 4, y + 15)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  const clienteInfo = [
    factura.clientes?.nif && `NIF: ${factura.clientes.nif}`,
    factura.clientes?.telefone,
    factura.clientes?.email,
    factura.clientes?.endereco,
  ].filter(Boolean).join('   |   ')
  if (clienteInfo) doc.text(clienteInfo, margin + 4, y + 22)

  // ─── Tabela de itens ───────────────────────────────────────────────────────
  y += 36
  const itens = factura.itens_factura || []

  autoTable(doc, {
    startY: y,
    head: [['#', 'Descrição', 'Qtd.', 'Preço Unit.', 'Total']],
    body: itens.map((item, i) => [
      i + 1,
      item.descricao,
      item.quantidade,
      formatKz(item.preco_unitario),
      formatKz(item.total),
    ]),
    theme: 'grid',
    styles: { fontSize: 9, textColor: corTexto, cellPadding: 4 },
    headStyles: { fillColor: corPrimaria, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 18, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  // ─── Totais ───────────────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 5
  const colX = W - margin - 80

  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text('Subtotal:', colX, finalY + 7)
  doc.setTextColor(...corTexto)
  doc.text(formatKz(factura.subtotal), W - margin, finalY + 7, { align: 'right' })

  if (Number(factura.iva) > 0) {
    doc.setTextColor(71, 85, 105)
    doc.text('IVA (14%):', colX, finalY + 15)
    doc.setTextColor(...corTexto)
    doc.text(formatKz(factura.iva), W - margin, finalY + 15, { align: 'right' })
  }

  // Total box
  doc.setFillColor(...corPrimaria)
  doc.roundedRect(colX - 5, finalY + 18, W - margin - colX + 5, 14, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL:', colX, finalY + 27)
  doc.text(formatKz(factura.total), W - margin - 2, finalY + 27, { align: 'right' })

  // ─── Observações ─────────────────────────────────────────────────────────
  if (factura.observacoes) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('Observações:', margin, finalY + 42)
    doc.setTextColor(...corTexto)
    doc.text(factura.observacoes, margin, finalY + 49)
  }

  // ─── Rodapé ───────────────────────────────────────────────────────────────
  doc.setFillColor(241, 245, 249)
  doc.rect(0, 285, W, 12, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(
    empresa.rodape || `${empresa.nome || 'Quindemba'} · ${empresa.endereco || ''} · ${empresa.telefone || ''}`,
    W / 2, 292, { align: 'center' }
  )

  // ─── Estado ───────────────────────────────────────────────────────────────
  if (factura.estado === 'pago') {
    doc.setGState(doc.GState({ opacity: 0.15 }))
    doc.setTextColor(16, 185, 129)
    doc.setFontSize(48)
    doc.setFont('helvetica', 'bold')
    doc.text('PAGO', W / 2, 180, { align: 'center', angle: 45 })
    doc.setGState(doc.GState({ opacity: 1 }))
  }

  return doc
}

export function FacturaPDFButton({ factura, empresa }) {
  function baixar() {
    const doc = gerarFacturaPDF(factura, empresa)
    doc.save(`${factura.numero_factura.replace(/\s/g, '-')}.pdf`)
  }
  return (
    <button onClick={baixar} className="btn-secondary text-sm">
      Baixar PDF
    </button>
  )
}
