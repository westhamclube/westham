/**
 * Gera extrato bancário em PDF com logo do West Ham
 */
import { jsPDF } from 'jspdf';

export interface TransactionForPdf {
  id: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  data_movimento: string;
}

const CATEGORIA_LABELS: Record<string, string> = {
  patrocinio: 'Patrocínio',
  despesa_jogadores: 'Despesa Jogadores',
  despesa_locomocao: 'Despesa Locomoção',
  medicamentos: 'Medicamentos',
  arbitragem: 'Arbitragem',
  material_esportivo: 'Material Esportivo',
  alimentacao: 'Alimentação',
  uniformes: 'Uniformes',
  outros: 'Outros',
};

function formatMoney(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
}

function formatDate(s: string): string {
  return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');
}

export async function generateCashFlowPdf(
  transactions: TransactionForPdf[],
  periodoInicio: string,
  periodoFim: string,
  saldoInicial: number,
  saldoFinal: number
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210; // A4 width in mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Cores West Ham
  const red = [200, 16, 46] as [number, number, number];
  const orange = [241, 90, 34] as [number, number, number];
  const dark = [30, 30, 30] as [number, number, number];

  let y = 20;

  // Cabeçalho com cores West Ham e logo
  doc.setFillColor(...red);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setFillColor(...orange);
  doc.rect(0, 30, pageWidth, 4, 'F');
  doc.setTextColor(255, 255, 255);
  try {
    const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/logoswest/transparente.png` : '';
    if (logoUrl) {
      const imgData = await fetch(logoUrl)
        .then((r) => r.blob())
        .then(
          (blob) =>
            new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = rej;
              reader.readAsDataURL(blob);
            })
        )
        .catch(() => null);
      if (imgData) {
        doc.addImage(imgData, 'PNG', margin, 4, 18, 22);
      }
    }
  } catch {
    // Fallback sem logo
  }
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SPORT CLUB WESTHAM', margin + 22, 14);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Extrato de Fluxo de Caixa', margin + 22, 21);

  y = 44;

  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Período: ${formatDate(periodoInicio)} a ${formatDate(periodoFim)}`, margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Saldo Inicial: ${formatMoney(saldoInicial)}`, margin, y);
  y += 6;
  doc.text(`Saldo Final: ${formatMoney(saldoFinal)}`, margin, y);
  y += 12;

  // Tabela
  const colWidths = [20, 35, 70, 30, 25];
  const headers = ['Data', 'Categoria', 'Descrição', 'Valor', 'Tipo'];
  const startY = y;

  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setTextColor(...dark);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  let x = margin;
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y + 5.5);
    x += colWidths[i];
  });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  for (const t of transactions) {
    if (y > 270) {
      doc.addPage();
      y = 20;
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold');
      x = margin;
      headers.forEach((h, i) => {
        doc.text(h, x + 2, y + 5.5);
        x += colWidths[i];
      });
      y += 10;
      doc.setFont('helvetica', 'normal');
    }

    const catLabel = CATEGORIA_LABELS[t.categoria] || t.categoria;
    const descTrunc = t.descricao.length > 45 ? t.descricao.slice(0, 42) + '...' : t.descricao;
    const valorStr = formatMoney(t.valor);
    const tipoStr = t.tipo === 'entrada' ? 'Entrada' : 'Saída';
    doc.setTextColor(...dark);
    doc.text(formatDate(t.data_movimento), margin + 2, y + 4);
    doc.text(catLabel, margin + 22, y + 4);
    doc.text(descTrunc, margin + 57, y + 4);
    doc.text(valorStr, margin + 127, y + 4);
    doc.setTextColor(t.tipo === 'entrada' ? 0 : 200, t.tipo === 'entrada' ? 128 : 0, t.tipo === 'entrada' ? 0 : 0);
    doc.text(tipoStr, margin + 157, y + 4);
    doc.setTextColor(...dark);
    y += 6;
  }

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Resumo: Total Entradas - Total Saídas = ${formatMoney(saldoFinal)}`, margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Documento gerado em ${new Date().toLocaleString('pt-BR')} - Sport Club Westham - Uso interno`,
    margin,
    285
  );

  doc.save(`extrato-caixa-westham-${periodoInicio}-${periodoFim}.pdf`);
}
