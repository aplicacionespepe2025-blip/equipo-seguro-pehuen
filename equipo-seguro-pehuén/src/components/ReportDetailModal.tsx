import React from 'react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Image as ImageIcon
} from 'lucide-react';
import { ReporteSeguridad, ESTADOS_CULTURA_OPCIONES } from '../types';

interface ReportDetailModalProps {
  reporte: ReporteSeguridad;
  onClose: () => void;
  onDownloadPdf: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  reporte,
  onClose,
  onDownloadPdf
}) => {
  const getBadgeStyle = (estado: string) => {
    const found = ESTADOS_CULTURA_OPCIONES.find(
      (e) => e.value.toLowerCase() === (estado || '').toLowerCase()
    );
    if (found) return found;
    return {
      badgeColor: 'bg-[#676057]/20 text-[#3E3933] border-[#676057]/50',
      borderColor: 'border-l-[#676057]'
    };
  };

  const badgeMeta = getBadgeStyle(reporte.EstadoCultura);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3E3933]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FAF8EA] border border-[#D1CB9E] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal - Coffee Palette */}
        <div className="bg-[#676057] p-6 border-b border-[#3E3933] flex items-center justify-between text-[#F2EDC9]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#BCB703] text-[#3E3933] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm text-[#BCB703]">{reporte.Id_Evento}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8EA] text-[#3E3933]">
                  Estado {(reporte.EstadoCultura || '').toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-heading font-bold text-[#F2EDC9]">
                Detalle de Evaluación de Seguridad en Terreno
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#F2EDC9] hover:text-white hover:bg-[#3E3933] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Banner principal de metadatos (Sin Evaluado) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#EFEAD0] p-4 rounded-2xl border border-[#D1CB9E]">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#676057] block">Evaluador (MAYÚSCULAS)</span>
              <span className="font-heading font-bold text-sm text-[#3E3933] uppercase break-words">
                {(reporte.NombreEvaluador || '').toUpperCase()}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-[#676057] block">Fecha Evaluación</span>
              <span className="font-bold text-sm text-[#8A8602]">{reporte.Fecha}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-[#676057] block">Cancha / Ubicación</span>
              <span className="font-medium text-sm text-[#3E3933]">{reporte.Cancha}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-[#676057] block">Turno</span>
              <span className="font-medium text-sm text-[#3E3933]">{reporte.Turno}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] font-bold uppercase text-[#676057] block">Fecha y Hora Registro</span>
              <span className="font-mono text-xs text-[#676057]">{reporte.FechaHoraRegistro || 'No especificada'}</span>
            </div>
          </div>

          {/* Desviación: ¿En qué fallamos? (Solo para Estado B y C) */}
          {reporte.EstadoCultura?.toLowerCase() !== 'a' && (
            <div className="bg-[#D37608]/10 border border-[#D37608]/40 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase text-[#D37608] flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>¿En qué fallamos?</span>
              </h4>
              <p className="text-sm text-[#3E3933] leading-relaxed font-medium">
                {reporte.EnQueFallamos}
              </p>
            </div>
          )}

          {/* Compromiso: ¿Cuál es nuestro compromiso? (Solo para Estado B y C) */}
          {reporte.EstadoCultura?.toLowerCase() !== 'a' && (
            <div className="bg-[#BCB703]/20 border border-[#BCB703] rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase text-[#8A8602] flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>¿Cuál es nuestro compromiso?</span>
              </h4>
              <p className="text-sm text-[#3E3933] leading-relaxed font-medium">
                {reporte.CualEsNuestroCompromiso || 'Sin compromiso registrado.'}
              </p>
            </div>
          )}

          {/* Observaciones */}
          <div className="bg-[#EFEAD0] border border-[#D1CB9E] rounded-2xl p-4 space-y-1">
            <h4 className="text-xs font-bold uppercase text-[#676057]">Observaciones Adicionales</h4>
            <p className="text-xs text-[#3E3933] leading-relaxed font-medium">
              {reporte.Observaciones || 'Sin observaciones adicionales.'}
            </p>
          </div>

          {/* Evidencia Fotográfica */}
          {reporte.Imagen && (reporte.EstadoCultura || '').toLowerCase() !== 'a' && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-[#676057] flex items-center space-x-1">
                <ImageIcon className="w-4 h-4 text-[#8A8602]" />
                <span>Evidencia Fotográfica Registrada</span>
              </h4>
              <div className="w-full h-72 bg-[#3E3933] rounded-2xl overflow-hidden border border-[#D1CB9E] flex items-center justify-center">
                <img
                  src={reporte.Imagen}
                  alt="Evidencia Terreno"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-[#EFEAD0] p-4 border-t border-[#D1CB9E] flex items-center justify-between">
          <span className="text-xs font-bold text-[#676057]">
            Equipo Seguro Pehuén Ltda.
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={onDownloadPdf}
              className="bg-[#676057] hover:bg-[#3E3933] text-[#F2EDC9] font-heading font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#BCB703]" />
              <span>DESCARGAR PDF INDIVIDUAL</span>
            </button>

            <button
              onClick={onClose}
              className="bg-[#FAF8EA] hover:bg-[#EFEAD0] text-[#3E3933] border border-[#D1CB9E] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
