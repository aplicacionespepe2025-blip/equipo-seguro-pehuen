import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ReporteSeguridad } from '../types';

export const exportarReportesPDF = (
  reportes: ReporteSeguridad[], 
  tituloFiltro: string = 'Filtro Actual'
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Encabezado corporativo Pehuén (#676057 Cafe background)
  doc.setFillColor(103, 96, 87); // #676057
  doc.rect(0, 0, 297, 24, 'F');

  // Highlight bar (#BCB703)
  doc.setFillColor(188, 183, 3);
  doc.rect(0, 23, 297, 1.5, 'F');

  doc.setTextColor(242, 237, 201); // #F2EDC9
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EQUIPO SEGURO PEHUÉN LTDA.', 14, 12);

  doc.setTextColor(230, 225, 190);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Informe Histórico de Cultura y Seguridad en Terreno', 14, 18);

  const fechaImpresion = new Date().toLocaleString('es-CL');
  doc.setFontSize(8);
  doc.text(`Fecha Generación: ${fechaImpresion}`, 215, 12);
  doc.text(`Registros Exportados: ${reportes.length}`, 215, 18);

  // Subtítulo con rango / filtro aplicado
  doc.setTextColor(62, 57, 51);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Filtro Aplicado: ${tituloFiltro}`, 14, 30);

  // Mapear datos para la tabla
  const tableRows = reportes.map((r, index) => [
    index + 1,
    r.Id_Evento || 'N/A',
    r.Fecha || '',
    r.Cancha || 'N/A',
    (r.NombreEvaluador || '').toUpperCase(),
    (r.NombreReceptor || 'N/A').toUpperCase(),
    r.Turno || 'N/A',
    (r.EstadoCultura || '').toUpperCase(),
    r.EnQueFallamos ? (r.EnQueFallamos.length > 50 ? r.EnQueFallamos.substring(0, 47) + '...' : r.EnQueFallamos) : 'Sin observaciones',
    r.CualEsNuestroCompromiso ? (r.CualEsNuestroCompromiso.length > 50 ? r.CualEsNuestroCompromiso.substring(0, 47) + '...' : r.CualEsNuestroCompromiso) : 'N/A'
  ]);

  autoTable(doc, {
    startY: 34,
    head: [[
      '#', 
      'ID Evento', 
      'Fecha', 
      'Cancha', 
      'Evaluador (MAYÚS)', 
      'Receptor',
      'Turno', 
      'Estado Cultura', 
      '¿En qué fallamos?', 
      'Nuestro Compromiso'
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [103, 96, 87],
      textColor: [242, 237, 201],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [45, 40, 35]
    },
    alternateRowStyles: {
      fillColor: [248, 245, 228]
    },
    columnStyles: {
      0: { cellWidth: 7 },
      1: { cellWidth: 24 },
      2: { cellWidth: 18 },
      3: { cellWidth: 28 },
      4: { cellWidth: 32, fontStyle: 'bold' },
      5: { cellWidth: 28 },
      6: { cellWidth: 18 },
      7: { cellWidth: 22 },
      8: { cellWidth: 45 },
      9: { cellWidth: 45 }
    },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(120, 110, 100);
      doc.text(
        `Equipo Seguro Pehuén Ltda. - Página ${data.pageNumber} de ${pageCount}`, 
        14, 
        doc.internal.pageSize.height - 8
      );
    }
  });

  doc.save(`Reporte_Seguridad_Pehuen_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportarReporteIndividualPDF = (r: ReporteSeguridad) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Encabezado corporativo (#676057)
  doc.setFillColor(103, 96, 87);
  doc.rect(0, 0, 210, 32, 'F');

  // Highlight line (#BCB703)
  doc.setFillColor(188, 183, 3);
  doc.rect(0, 30.5, 210, 1.5, 'F');

  doc.setTextColor(242, 237, 201);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EQUIPO SEGURO PEHUÉN LTDA.', 14, 15);

  doc.setTextColor(230, 225, 190);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('REGISTRO INDIVIDUAL DE EVALUACIÓN EN TERRENO', 14, 24);

  // Bloque de metadatos principal
  doc.setFillColor(236, 230, 200);
  doc.roundedRect(14, 38, 182, 34, 2, 2, 'F');

  doc.setTextColor(62, 57, 51);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`ID EVENTO: ${r.Id_Evento}`, 18, 45);
  doc.text(`FECHA REGISTRO: ${r.FechaHoraRegistro || r.Fecha}`, 110, 45);

  doc.setFont('helvetica', 'normal');
  doc.text(`Cancha / Ámbito: ${r.Cancha}`, 18, 52);
  doc.text(`Turno: ${r.Turno}`, 110, 52);

  doc.setFont('helvetica', 'bold');
  doc.text(`EVALUADOR: ${(r.NombreEvaluador || '').toUpperCase()}`, 18, 60);
  doc.text(`RECEPTOR: ${(r.NombreReceptor || 'NO ESPECIFICADO').toUpperCase()}`, 110, 60);

  // Estado de Cultura Destacado (SIEMPRE EN MAYÚSCULAS)
  const estadoUpper = (r.EstadoCultura || '').toUpperCase();
  doc.setFillColor(103, 96, 87);
  doc.roundedRect(14, 76, 182, 14, 2, 2, 'F');
  doc.setTextColor(242, 237, 201);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`ESTADO DE CULTURA REGISTRADO: ${estadoUpper}`, 18, 85);

  // Sección 1: ¿En qué fallamos? (#D37608 Naranja accent)
  doc.setFillColor(254, 246, 235);
  doc.roundedRect(14, 94, 182, 30, 2, 2, 'F');
  doc.setFillColor(211, 118, 8);
  doc.rect(14, 94, 3.5, 30, 'F');

  doc.setTextColor(168, 90, 2);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('¿EN QUÉ FALLAMOS?', 22, 101);

  doc.setTextColor(50, 45, 40);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  const splitFallamos = doc.splitTextToSize(r.EnQueFallamos || 'Sin observaciones registradas.', 168);
  doc.text(splitFallamos, 22, 109);

  // Sección 2: ¿Cuál es nuestro compromiso? (#BCB703 Verde accent)
  doc.setFillColor(248, 247, 225);
  doc.roundedRect(14, 128, 182, 30, 2, 2, 'F');
  doc.setFillColor(188, 183, 3);
  doc.rect(14, 128, 3.5, 30, 'F');

  doc.setTextColor(115, 110, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('¿CUÁL ES NUESTRO COMPROMISO?', 22, 135);

  doc.setTextColor(50, 45, 40);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  const splitCompromiso = doc.splitTextToSize(r.CualEsNuestroCompromiso || 'Sin compromiso explícito.', 168);
  doc.text(splitCompromiso, 22, 143);

  // Sección 3: Observaciones Generales
  doc.setFillColor(242, 237, 201);
  doc.roundedRect(14, 162, 182, 24, 2, 2, 'F');

  doc.setTextColor(62, 57, 51);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVACIONES ADICIONALES:', 18, 170);

  doc.setFont('helvetica', 'normal');
  const splitObs = doc.splitTextToSize(r.Observaciones || 'Sin observaciones adicionales.', 170);
  doc.text(splitObs, 18, 178);

  // Sección 4: Adjuntar Imagen de Evidencia (Si existe y el Estado de Cultura NO es 'A')
  const esEstadoA = (r.EstadoCultura || '').toLowerCase() === 'a';
  if (r.Imagen && !esEstadoA) {
    doc.setFillColor(236, 230, 200);
    doc.roundedRect(14, 190, 182, 72, 2, 2, 'F');

    doc.setTextColor(62, 57, 51);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('EVIDENCIA FOTOGRÁFICA REGISTRADA:', 18, 197);

    try {
      doc.addImage(r.Imagen, 'JPEG', 55, 200, 100, 58);
    } catch (imgErr) {
      console.warn('No se pudo incrustar imagen en el PDF:', imgErr);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.text('[Evidencia fotográfica adjunta en el reporte digital]', 105, 225, { align: 'center' });
    }
  }

  // Pie de Página
  doc.setFontSize(8);
  doc.setTextColor(130, 120, 110);
  doc.text('Equipo Seguro Pehuén Ltda. - Documento Oficial de Gestión de Cultura de Seguridad', 105, 285, { align: 'center' });

  doc.save(`Evaluacion_${r.Id_Evento || 'Pehuen'}.pdf`);
};

export const exportarReportesExcel = (reportes: ReporteSeguridad[]) => {
  const data = reportes.map((r, index) => ({
    'Nº': index + 1,
    'ID Evento': r.Id_Evento || '',
    'Fecha': r.Fecha || '',
    'Cancha / Ubicación': r.Cancha || '',
    'Nombre Evaluador': (r.NombreEvaluador || '').toUpperCase(),
    'Nombre Receptor': (r.NombreReceptor || '').toUpperCase(),
    'Turno': r.Turno || '',
    'Estado Cultura': (r.EstadoCultura || '').toUpperCase(),
    '¿En qué fallamos?': r.EnQueFallamos || '',
    '¿Cuál es nuestro compromiso?': r.CualEsNuestroCompromiso || '',
    'Observaciones': r.Observaciones || '',
    'Fecha y Hora Registro': r.FechaHoraRegistro || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Ancho de columnas para visualización clara en Excel
  worksheet['!cols'] = [
    { wch: 6 },   // Nº
    { wch: 20 },  // ID Evento
    { wch: 14 },  // Fecha
    { wch: 28 },  // Cancha
    { wch: 30 },  // Evaluador
    { wch: 30 },  // Receptor
    { wch: 14 },  // Turno
    { wch: 16 },  // Estado
    { wch: 45 },  // Fallamos
    { wch: 45 },  // Compromiso
    { wch: 35 },  // Observaciones
    { wch: 22 }   // FechaHora
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reportes Cultura');

  XLSX.writeFile(workbook, `Historico_Cultura_Seguridad_Pehuen_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportarReportesCSV = (reportes: ReporteSeguridad[]) => {
  const headers = [
    'Id_Evento',
    'Fecha',
    'Cancha',
    'Nombre Evaluador (MAYÚSCULAS)',
    'Nombre Receptor (MAYÚSCULAS)',
    'Turno',
    'Estado de Cultura (MAYÚSCULAS)',
    '¿En que fallamos?',
    '¿Cual es nuestro compromiso?',
    'Observaciones',
    'Fecha y Hora Registro'
  ];

  const escapeCSV = (field: string | undefined) => {
    if (!field) return '""';
    const clean = field.replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = reportes.map(r => [
    escapeCSV(r.Id_Evento),
    escapeCSV(r.Fecha),
    escapeCSV(r.Cancha),
    escapeCSV((r.NombreEvaluador || '').toUpperCase()),
    escapeCSV((r.NombreReceptor || '').toUpperCase()),
    escapeCSV(r.Turno),
    escapeCSV((r.EstadoCultura || '').toUpperCase()),
    escapeCSV(r.EnQueFallamos),
    escapeCSV(r.CualEsNuestroCompromiso),
    escapeCSV(r.Observaciones),
    escapeCSV(r.FechaHoraRegistro)
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Historico_Cultura_Seguridad_Pehuen_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
