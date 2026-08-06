import React, { useState } from 'react';
import { X, Save, ShieldCheck, Camera, Sparkles, Loader2 } from 'lucide-react';
import { ReporteSeguridad, ESTADOS_CULTURA_OPCIONES, CANCHAS_OPCIONES, TURNOS_OPCIONES, PRESET_SAMPLE_PHOTOS } from '../types';

interface ReportEditModalProps {
  reporte: ReporteSeguridad;
  onClose: () => void;
  onSave: (updatedData: Partial<ReporteSeguridad>) => Promise<void>;
}

export const ReportEditModal: React.FC<ReportEditModalProps> = ({
  reporte,
  onClose,
  onSave
}) => {
  const [nombreEvaluador, setNombreEvaluador] = useState<string>(reporte.NombreEvaluador || '');
  const [fecha, setFecha] = useState<string>(reporte.Fecha || '');
  const [cancha, setCancha] = useState<string>(reporte.Cancha || CANCHAS_OPCIONES[0]);
  const [turno, setTurno] = useState<string>(reporte.Turno || TURNOS_OPCIONES[0]);
  const [estadoCultura, setEstadoCultura] = useState<'a' | 'b' | 'c'>(
    (reporte.EstadoCultura as 'a' | 'b' | 'c') || 'b'
  );
  const [enQueFallamos, setEnQueFallamos] = useState<string>(reporte.EnQueFallamos || '');
  const [cualEsNuestroCompromiso, setCualEsNuestroCompromiso] = useState<string>(reporte.CualEsNuestroCompromiso || '');
  const [observaciones, setObservaciones] = useState<string>(reporte.Observaciones || '');
  const [imagen, setImagen] = useState<string>(reporte.Imagen || '');

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombreEvaluador.trim()) {
      setError('El nombre del evaluador es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const updated: Partial<ReporteSeguridad> = {
        NombreEvaluador: nombreEvaluador.trim().toUpperCase(),
        Fecha: fecha,
        Cancha: cancha,
        Turno: turno,
        EstadoCultura: estadoCultura,
        EnQueFallamos: enQueFallamos,
        CualEsNuestroCompromiso: cualEsNuestroCompromiso,
        Observaciones: observaciones,
        // Si el estado de cultura es A, no guardamos imagen
        Imagen: estadoCultura === 'a' ? '' : imagen
      };

      await onSave(updated);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Error al actualizar el reporte.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3E3933]/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#FAF8EA] border border-[#D1CB9E] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-[#676057] text-[#F2EDC9] p-5 border-b border-[#3E3933] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#BCB703] text-[#3E3933] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-[#F2EDC9]">
                Editar Reporte de Cultura y Seguridad
              </h2>
              <p className="text-xs text-[#D1CB9E] font-mono">
                {reporte.Id_Evento}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#D1CB9E] hover:text-white hover:bg-[#3E3933] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#D37608]/10 border border-[#D37608] text-[#A85A02] text-xs font-bold rounded-xl">
              {error}
            </div>
          )}

          {/* Evaluador y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#676057]">
                Nombre Evaluador (MAYÚSCULAS) *
              </label>
              <input
                type="text"
                required
                value={nombreEvaluador}
                onChange={(e) => setNombreEvaluador(e.target.value.toUpperCase())}
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-3 py-2 text-xs font-bold uppercase text-[#3E3933] focus:ring-2 focus:ring-[#BCB703]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#676057]">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-3 py-2 text-xs text-[#3E3933] font-medium focus:ring-2 focus:ring-[#BCB703]"
              />
            </div>
          </div>

          {/* Cancha y Turno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#676057]">
                Cancha / Ubicación *
              </label>
              <select
                value={cancha}
                onChange={(e) => setCancha(e.target.value)}
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-3 py-2 text-xs text-[#3E3933] font-bold"
              >
                {CANCHAS_OPCIONES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#676057]">
                Turno de Trabajo *
              </label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-3 py-2 text-xs text-[#3E3933] font-bold"
              >
                {TURNOS_OPCIONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Estado de Cultura */}
          <div className="space-y-1.5 pt-2 border-t border-[#D1CB9E]">
            <label className="text-xs font-bold text-[#676057] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#8A8602]" />
              <span>Estado de Cultura *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ESTADOS_CULTURA_OPCIONES.map((op) => {
                const isSelected = estadoCultura === op.value;
                return (
                  <button
                    type="button"
                    key={op.value}
                    onClick={() => setEstadoCultura(op.value as 'a' | 'b' | 'c')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#BCB703] text-[#3E3933] border-[#3E3933] shadow-sm'
                        : 'bg-[#EFEAD0] text-[#676057] border-[#D1CB9E] hover:bg-[#D1CB9E]/30'
                    }`}
                  >
                    Estado {op.value.toUpperCase()}
                  </button>
                );
              })}
            </div>
            {estadoCultura === 'a' && (
              <p className="text-[10px] text-[#8A8602] font-bold italic">
                * Nota: Para Estado A no se adjunta imagen de evidencia.
              </p>
            )}
          </div>

          {/* ¿En qué fallamos? */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#676057]">
              ¿En qué fallamos?
            </label>
            <textarea
              rows={2}
              value={enQueFallamos}
              onChange={(e) => setEnQueFallamos(e.target.value)}
              className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl p-2.5 text-xs text-[#3E3933] focus:ring-2 focus:ring-[#BCB703]"
            />
          </div>

          {/* ¿Cuál es nuestro compromiso? */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#676057]">
              ¿Cuál es nuestro compromiso?
            </label>
            <textarea
              rows={2}
              value={cualEsNuestroCompromiso}
              onChange={(e) => setCualEsNuestroCompromiso(e.target.value)}
              className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl p-2.5 text-xs text-[#3E3933] focus:ring-2 focus:ring-[#BCB703]"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#676057]">
              Observaciones Adicionales
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl p-2.5 text-xs text-[#3E3933] focus:ring-2 focus:ring-[#BCB703]"
            />
          </div>

          {/* Evidencia Fotográfica (Sólo si NO es Estado A) */}
          {estadoCultura !== 'a' && (
            <div className="space-y-2 pt-2 border-t border-[#D1CB9E]">
              <label className="text-xs font-bold text-[#676057] flex items-center space-x-1">
                <Camera className="w-3.5 h-3.5 text-[#8A8602]" />
                <span>Fotografía de Evidencia (URL o Muestra)</span>
              </label>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="flex-1 bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-3 py-2 text-xs text-[#3E3933]"
                />
              </div>

              {/* Botones de presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_SAMPLE_PHOTOS.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setImagen(p.url)}
                    className="text-[10px] bg-[#EFEAD0] hover:bg-[#BCB703] text-[#3E3933] px-2 py-1 rounded-lg border border-[#D1CB9E] font-bold transition-all cursor-pointer"
                  >
                    Muestra {idx + 1}
                  </button>
                ))}
              </div>

              {imagen && (
                <div className="mt-2 h-32 w-full rounded-xl overflow-hidden border border-[#D1CB9E]">
                  <img src={imagen} alt="Vista previa" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-2 border-t border-[#D1CB9E]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#EFEAD0] hover:bg-[#D1CB9E] text-[#676057] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#BCB703] hover:bg-[#8A8602] text-[#3E3933] text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
