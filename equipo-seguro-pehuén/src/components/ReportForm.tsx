import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Send, 
  Camera, 
  Upload, 
  CheckCircle2, 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { crearReporte } from '../services/reportService';
import { 
  CANCHAS_OPCIONES, 
  TURNOS_OPCIONES, 
  ESTADOS_CULTURA_OPCIONES, 
  EstadoCulturaType, 
  ReporteSeguridad,
  PRESET_SAMPLE_PHOTOS
} from '../types';

interface ReportFormProps {
  onSuccessSave: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSuccessSave }) => {
  const { user } = useAuth();

  // Generar ID de Evento único automático (ej. PEH-2026-0806-001)
  const generateNewEventId = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    return `PEH-${dateStr}-${randNum}`;
  };

  const [idEvento, setIdEvento] = useState<string>(generateNewEventId());
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [cancha, setCancha] = useState<string>(user?.email || '');
  
  // CAMPO CRÍTICO: Nombre Evaluador (SIEMPRE EN MAYÚSCULAS)
  const [nombreEvaluador, setNombreEvaluador] = useState<string>(
    user?.displayName ? user.displayName.toUpperCase() : ''
  );

  const [turno, setTurno] = useState<string>(TURNOS_OPCIONES[0]);
  const [estadoCultura, setEstadoCultura] = useState<EstadoCulturaType>('a');
  const [enQueFallamos, setEnQueFallamos] = useState<string>('');
  const [cualEsNuestroCompromiso, setCualEsNuestroCompromiso] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [imagen, setImagen] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (user?.displayName) {
      setNombreEvaluador(user.displayName.toUpperCase());
    }
    if (user?.email) {
      setCancha(user.email);
    }
  }, [user]);

  // Manejo de cambio en Nombre Evaluador (Transforma instantáneamente a MAYÚSCULAS)
  const handleNombreEvaluadorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase();
    setNombreEvaluador(upperValue);
  };

  // Carga de imagen desde archivo local
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagen(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nombreEvaluador.trim()) {
      setErrorMessage('El campo "Nombre del Evaluador" es obligatorio.');
      return;
    }

    if (estadoCultura !== 'a' && !enQueFallamos.trim()) {
      setErrorMessage('El campo "¿En qué fallamos?" es obligatorio para documentar la desviación.');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const fechaHoraFormatted = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;

      const enQueFallamosValor = estadoCultura === 'a' 
        ? (enQueFallamos.trim() || 'Cumplimiento Alto - Operación segura sin desviaciones')
        : enQueFallamos.trim();

      const compromisoValor = estadoCultura === 'a'
        ? (cualEsNuestroCompromiso.trim() || 'Mantener estándares de operación segura.')
        : (cualEsNuestroCompromiso.trim() || 'Compromiso de revisión de controles críticos.');

      const nuevoReporte: Omit<ReporteSeguridad, 'id'> = {
        Id_Evento: idEvento.trim() || generateNewEventId(),
        Fecha: fecha,
        Cancha: user?.email || cancha || 'sin.sesion@pehuen.cl',
        // FORZAR MAYÚSCULAS EN SUBMIT
        NombreEvaluador: nombreEvaluador.trim().toUpperCase(),
        Turno: turno,
        EstadoCultura: estadoCultura,
        EnQueFallamos: enQueFallamosValor,
        CualEsNuestroCompromiso: compromisoValor,
        Observaciones: observaciones.trim() || 'Sin observaciones adicionales.',
        Imagen: estadoCultura === 'a' ? '' : (imagen || ''),
        FechaHoraRegistro: fechaHoraFormatted,
        createdByUid: user?.uid,
        createdByEmail: user?.email
      };

      await crearReporte(nuevoReporte);

      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onSuccessSave();
      }, 1500);

    } catch (err: any) {
      console.error('Error al enviar el reporte:', err);
      setErrorMessage('Hubo un error al guardar el reporte en Firestore. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Toast de Éxito */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#BCB703] text-[#3E3933] px-5 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-[#8A8602] animate-bounce font-bold">
          <CheckCircle2 className="w-6 h-6 text-[#3E3933]" />
          <div>
            <h4 className="font-heading font-bold text-sm">¡Reporte Registrado!</h4>
            <p className="text-xs text-[#3E3933]/80">Guardado exitosamente en Cloud Firestore.</p>
          </div>
        </div>
      )}

      {/* Header Banner - Coffee Palette with Olive Accent */}
      <div className="bg-[#676057] text-[#F2EDC9] p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#80776D]">
        <div>
          <div className="flex items-center space-x-2 text-[#BCB703] text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-[#BCB703]" />
            <span>Formulario Oficial de Evaluación en Terreno</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#F2EDC9]">
            Nuevo Registro de Cultura y Seguridad
          </h1>
          <p className="text-xs text-[#D1CB9E] mt-1">
            "Equipo Seguro Pehuén Ltda." - Registra desviaciones, fortalezas y compromisos en cancha.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#3E3933] px-3 py-2 rounded-xl border border-[#80776D] text-xs font-mono text-[#BCB703]">
          <span>ID: {idEvento}</span>
          <button 
            type="button"
            onClick={() => setIdEvento(generateNewEventId())} 
            title="Generar Nuevo ID"
            className="p-1 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-[#D37608]/20 border border-[#D37608] text-[#A85A02] p-4 rounded-xl text-sm flex items-center space-x-3 font-semibold">
          <AlertTriangle className="w-5 h-5 text-[#D37608] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* MÓDULO 1: Datos de Contexto & Evaluador */}
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-sm font-heading font-bold uppercase text-[#3E3933] tracking-wider flex items-center space-x-2 border-b border-[#D1CB9E] pb-3">
            <User className="w-4 h-4 text-[#8A8602]" />
            <span>1. Identificación del Evaluador y la Evaluación</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Campo NOMBRE DE EVALUADOR con transformación a MAYÚSCULAS en tiempo real */}
            <div className="md:col-span-2 space-y-2 bg-[#EFEAD0] p-4 rounded-xl border border-[#BCB703]/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#3E3933] uppercase tracking-wide flex items-center space-x-1">
                  <span>Nombre de Evaluador</span>
                  <span className="text-[#D37608]">*</span>
                </label>
                <span className="text-[10px] bg-[#BCB703]/30 text-[#3E3933] px-2 py-0.5 rounded font-mono font-bold uppercase">
                  AUTO-MAYÚSCULAS
                </span>
              </div>
              <input
                type="text"
                required
                value={nombreEvaluador}
                onChange={handleNombreEvaluadorChange}
                onBlur={(e) => setNombreEvaluador(e.target.value.toUpperCase())}
                placeholder="EJ. MARCOS ANTONIO SILVA (SE TRANSFORMA A MAYÚSCULAS)"
                className="w-full bg-[#FAF8EA] border border-[#676057]/40 rounded-xl px-4 py-3 text-[#3E3933] placeholder-[#80776D] focus:outline-none focus:ring-2 focus:ring-[#BCB703] font-heading font-bold tracking-wide uppercase text-sm"
              />
              <p className="text-[11px] text-[#676057]">
                ⚠️ <strong className="text-[#3E3933]">Regla Corporativa:</strong> Este campo convierte automáticamente cada carácter ingresado a mayúsculas para mantener consistencia en los filtros.
              </p>
            </div>

            {/* Fecha de la Evaluación */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3E3933] uppercase tracking-wide flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#8A8602]" />
                <span>Fecha del Evento / Evaluación</span>
                <span className="text-[#D37608]">*</span>
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-4 py-2.5 text-[#3E3933] focus:outline-none focus:ring-2 focus:ring-[#BCB703] text-sm font-medium"
              />
            </div>

            {/* Ubicacion Cancha */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3E3933] uppercase tracking-wide flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#8A8602]" />
                <span>Ubicacion Cancha</span>
              </label>
              <input
                type="text"
                readOnly
                value={user?.email || cancha || 'sin.sesion@pehuen.cl'}
                className="w-full bg-[#EFEAD0] border border-[#D1CB9E] rounded-xl px-4 py-2.5 text-[#3E3933] font-bold text-sm focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Turno - SOLO Turno 1, Turno 2, Turno 3 */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-[#3E3933] uppercase tracking-wide flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#8A8602]" />
                <span>Turno de Trabajo (Opciones Exclusivas: Turno 1, Turno 2, Turno 3)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TURNOS_OPCIONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTurno(t)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      turno === t
                        ? 'bg-[#676057] text-[#F2EDC9] border-[#3E3933] shadow-md'
                        : 'bg-[#FAF8EA] text-[#676057] border-[#D1CB9E] hover:border-[#676057]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* MÓDULO 2: Selección de Estado de Cultura (a, b, c) */}
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D1CB9E] pb-3 gap-1">
            <h2 className="text-sm font-heading font-bold uppercase text-[#3E3933] tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#8A8602]" />
              <span>ESTADO DE CULTURA</span>
              <span className="text-[#D37608]">*</span>
            </h2>
            <span className="text-xs text-[#80776D] font-medium">
              Seleccione el nivel observado en faena
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {[
              {
                value: 'a' as EstadoCulturaType,
                letter: 'A',
                title: 'Cumplimiento Alto',
                desc: 'Operación segura sin desviaciones'
              },
              {
                value: 'b' as EstadoCulturaType,
                letter: 'B',
                title: 'Observación Media',
                desc: 'Desviación menor corregible'
              },
              {
                value: 'c' as EstadoCulturaType,
                letter: 'C',
                title: 'Riesgo / Desviación Crítica',
                desc: 'Acción correctiva inmediata requerida'
              }
            ].map((item) => {
              const isSelected = estadoCultura === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setEstadoCultura(item.value)}
                  className={`p-6 rounded-2xl border transition-all text-center flex flex-col items-center justify-center cursor-pointer min-h-[145px] ${
                    isSelected
                      ? 'bg-[#BCB703] text-white border-[#8A8602] shadow-lg ring-2 ring-[#BCB703]/50'
                      : 'bg-white text-[#3E3933] border-[#E2DDC7] hover:border-[#80776D]'
                  }`}
                >
                  <span className={`text-4xl font-extrabold mb-1 ${isSelected ? 'text-white' : 'text-[#5A554E]'}`}>
                    {item.letter}
                  </span>
                  <span className={`text-sm font-bold mb-1 ${isSelected ? 'text-white' : 'text-[#3E3933]'}`}>
                    {item.title}
                  </span>
                  <span className={`text-[11px] leading-tight ${isSelected ? 'text-white/95' : 'text-[#80776D]'}`}>
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MÓDULO 3: Hallazgos, Compromiso y Observaciones */}
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-sm font-heading font-bold uppercase text-[#3E3933] tracking-wider flex items-center space-x-2 border-b border-[#D1CB9E] pb-3">
            <FileText className="w-4 h-4 text-[#8A8602]" />
            <span>
              {estadoCultura === 'a' ? '3. Observaciones' : '3. Hallazgos, Compromiso y Observaciones'}
            </span>
          </h2>

          <div className="space-y-4">
            
            {/* Si es Estado B o C, se muestran Hallazgos y Compromiso */}
            {estadoCultura !== 'a' && (
              <>
                {/* ¿En qué fallamos? */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#D37608] uppercase tracking-wide flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>¿En qué fallamos? (Desviación u Oportunidad de Mejora)</span>
                    <span>*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={enQueFallamos}
                    onChange={(e) => setEnQueFallamos(e.target.value)}
                    placeholder="Describa claramente la falta, desatención o condición subestándar detectada en la cancha..."
                    className="w-full bg-[#FAF8EA] border border-[#D37608]/50 rounded-xl p-3 text-[#3E3933] placeholder-[#80776D] focus:outline-none focus:ring-2 focus:ring-[#D37608] text-sm font-medium"
                  />
                </div>

                {/* ¿Cuál es nuestro compromiso? */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8A8602] uppercase tracking-wide flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8A8602]" />
                    <span>¿Cuál es nuestro compromiso? (Acción Correctiva Inmediata)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={cualEsNuestroCompromiso}
                    onChange={(e) => setCualEsNuestroCompromiso(e.target.value)}
                    placeholder="Escriba el acuerdo pactado para corregir la desviación y prevenir su recurrencia..."
                    className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl p-3 text-[#3E3933] placeholder-[#80776D] focus:outline-none focus:ring-2 focus:ring-[#BCB703] text-sm font-medium"
                  />
                </div>
              </>
            )}

            {/* Observaciones (Siempre visibles) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#676057] uppercase tracking-wide">
                {estadoCultura === 'a' ? 'Observaciones' : 'Observaciones Generales'}
              </label>
              <textarea
                rows={estadoCultura === 'a' ? 4 : 2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales, condiciones de la faena, felicitaciones u observaciones..."
                className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl p-3 text-[#3E3933] placeholder-[#80776D] focus:outline-none focus:ring-2 focus:ring-[#BCB703] text-sm font-medium"
              />
            </div>

          </div>
        </div>

        {/* MÓDULO 4: Evidencia Fotográfica */}
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-heading font-bold uppercase text-[#3E3933] tracking-wider flex items-center space-x-2 border-b border-[#D1CB9E] pb-3">
            <Camera className="w-4 h-4 text-[#8A8602]" />
            <span>4. Evidencia Fotográfica / Registro en Terreno</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Cargar desde archivo / Cámara */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#676057] block">
                Subir Foto desde Celular o PC:
              </label>
              <div className="border-2 border-dashed border-[#D1CB9E] hover:border-[#676057] rounded-xl p-6 text-center bg-[#FAF8EA] transition-colors">
                <Upload className="w-8 h-8 text-[#80776D] mx-auto mb-2" />
                <p className="text-xs text-[#3E3933] font-bold mb-1">
                  Arrastra una imagen o haz clic para seleccionar
                </p>
                <p className="text-[10px] text-[#676057] mb-3">JPG, PNG o WEBP (Máx. 5MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="bg-[#676057] hover:bg-[#3E3933] text-[#F2EDC9] text-xs font-bold px-4 py-2 rounded-lg cursor-pointer inline-block transition-colors"
                >
                  Seleccionar Archivo
                </label>
              </div>

              {/* Selector de fotos de demostración rápidas */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-[#676057] mb-2 block">
                  O elige una foto de muestra rápida:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_SAMPLE_PHOTOS.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImagen(photo.url)}
                      className={`relative rounded-lg overflow-hidden border-2 h-14 ${
                        imagen === photo.url ? 'border-[#BCB703] ring-2 ring-[#BCB703]' : 'border-[#D1CB9E] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Vista Previa de Imagen */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#676057] block">
                Vista Previa Registrada:
              </label>
              <div className="w-full h-52 bg-[#EFEAD0] rounded-xl border border-[#D1CB9E] overflow-hidden relative flex items-center justify-center">
                {imagen ? (
                  <img
                    src={imagen}
                    alt="Evidencia Terreno"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-[#80776D]">
                    <ImageIcon className="w-10 h-10 mx-auto mb-1 opacity-50" />
                    <span className="text-xs font-medium">Sin foto adjunta</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Botón de Envío */}
        <div className="flex items-center justify-end space-x-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto bg-[#676057] hover:bg-[#3E3933] text-[#F2EDC9] font-heading font-bold text-sm px-8 py-3.5 rounded-xl shadow-xl border border-[#3E3933] flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#BCB703]" />
                <span>Guardando en Firestore...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 stroke-[2.5] text-[#BCB703]" />
                <span>GUARDAR REPORTE EN TERRENO</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
