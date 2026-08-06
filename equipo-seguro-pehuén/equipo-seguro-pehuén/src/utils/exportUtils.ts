import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  // Mapear datos para la tabla (Sin Nombre Evaluado)
  const tableRows = reportes.map((r, index) => [
    index + 1,
    r.Id_Evento || 'N/A',
    r.Fecha || '',
    r.Cancha || 'N/A',
    (r.NombreEvaluador || '').toUpperCase(),
    r.Turno || 'N/A',
    (r.EstadoCultura || '').toUpperCase(),
    r.EnQueFallamos ? (r.EnQueFallamos.length > 60 ? r.EnQueFallamos.substring(0, 57) + '...' : r.EnQueFallamos) : 'Sin observaciones',
    r.CualEsNuestroCompromiso ? (r.CualEsNuestroCompromiso.length > 60 ? r.CualEsNuestroCompromiso.substring(0, 57) + '...' : r.CualEsNuestroCompromiso) : 'N/A'
  ]);

  autoTable(doc, {
    startY: 34,
    head: [[
      '#', 
      'ID Evento', 
      'Fecha', 
      'Cancha', 
      'Evaluador (MAYÚS)', 
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
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [45, 40, 35]
    },
    alternateRowStyles: {
      fillColor: [248, 245, 228]
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 26 },
      2: { cellWidth: 20 },
      3: { cellWidth: 32 },
      4: { cellWidth: 38, fontStyle: 'bold' },
      5: { cellWidth: 22 },
      6: { cellWidth: 24 },
      7: { cellWidth: 49 },
      8: { cellWidth: 50 }
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

  // Bloque de metadatos principal (Sin Nombre Evaluado)
  doc.setFillColor(236, 230, 200);
  doc.roundedRect(14, 38, 182, 30, 2, 2, 'F');

  doc.setTextColor(62, 57, 51);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`ID EVENTO: ${r.Id_Evento}`, 18, 46);
  doc.text(`FECHA REGISTRO: ${r.FechaHoraRegistro || r.Fecha}`, 110, 46);

  doc.setFont('helvetica', 'normal');
  doc.text(`Cancha / Ámbito: ${r.Cancha}`, 18, 54);
  doc.text(`Turno: ${r.Turno}`, 110, 54);

  doc.setFont('helvetica', 'bold');
  doc.text(`EVALUADOR: ${(r.NombreEvaluador || '').toUpperCase()}`, 18, 62);

  // Estado de Cultura Destacado (SIEMPRE EN MAYÚSCULAS)
  const estadoUpper = (r.EstadoCultura || '').toUpperCase();
  doc.setFillColor(103, 96, 87);
  doc.roundedRect(14, 72, 182, 16, 2, 2, 'F');
  doc.setTextColor(242, 237, 201);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`ESTADO DE CULTURA REGISTRADO: ${estadoUpper}`, 18, 82);

  // Sección 1: ¿En qué fallamos? (#D37608 Naranja accent)
  doc.setFillColor(254, 246, 235);
  doc.roundedRect(14, 92, 182, 32, 2, 2, 'F');
  doc.setFillColor(211, 118, 8);
  doc.rect(14, 92, 3.5, 32, 'F');

  doc.setTextColor(168, 90, 2);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('¿EN QUÉ FALLAMOS?', 22, 100);

  doc.setTextColor(50, 45, 40);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  const splitFallamos = doc.splitTextToSize(r.EnQueFallamos || 'Sin observaciones registradas.', 168);
  doc.text(splitFallamos, 22, 108);

  // Sección 2: ¿Cuál es nuestro compromiso? (#BCB703 Verde accent)
  doc.setFillColor(248, 247, 225);
  doc.roundedRect(14, 128, 182, 32, 2, 2, 'F');
  doc.setFillColor(188, 183, 3);
  doc.rect(14, 128, 3.5, 32, 'F');

  doc.setTextColor(115, 110, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('¿CUÁL ES NUESTRO COMPROMISO?', 22, 136);

  doc.setTextColor(50, 45, 40);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  const splitCompromiso = doc.splitTextToSize(r.CualEsNuestroCompromiso || 'Sin compromiso explícito.', 168);
  doc.text(splitCompromiso, 22, 144);

  // Sección 3: Observaciones Generales
  doc.setFillColor(242, 237, 201);
  doc.roundedRect(14, 164, 182, 26, 2, 2, 'F');

  doc.setTextColor(62, 57, 51);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVACIONES ADICIONALES:', 18, 172);

  doc.setFont('helvetica', 'normal');
  const splitObs = doc.splitTextToSize(r.Observaciones || 'Sin observaciones adicionales.', 170);
  doc.text(splitObs, 18, 180);

  // Sección 4: Adjuntar Imagen de Evidencia (Si existe)
  if (r.Imagen) {
    doc.setFillColor(236, 230, 200);
    doc.roundedRect(14, 194, 182, 70, 2, 2, 'F');

    doc.setTextColor(62, 57, 51);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('EVIDENCIA FOTOGRÁFICA REGISTRADA:', 18, 201);

    try {
      doc.addImage(r.Imagen, 'JPEG', 55, 204, 100, 56);
    } catch (imgErr) {
      console.warn('No se pudo incrustar imagen en el PDF:', imgErr);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.text('[Evidencia fotográfica adjunta en el reporte digital]', 105, 225, { align: 'center' });
    }
  }

  // SIN FIRMA NI TIMBRE (Eliminado a petición)

  // Pie de Página
  doc.setFontSize(8);
  doc.setTextColor(130, 120, 110);
  doc.text('Equipo Seguro Pehuén Ltda. - Documento Oficial de Gestión de Cultura de Seguridad', 105, 285, { align: 'center' });

  doc.save(`Evaluacion_${r.Id_Evento || 'Pehuen'}.pdf`);
};

export const exportarReportesCSV = (reportes: ReporteSeguridad[]) => {
  const headers = [
    'Id_Evento',
    'Fecha',
    'Cancha',
    'Nombre Evaluador (MAYÚSCULAS)',
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
