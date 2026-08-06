import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  Eye, 
  Pencil,
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Grid, 
  Table as TableIcon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getReportes, eliminarReporte, actualizarReporte } from '../services/reportService';
import { ReporteSeguridad, ESTADOS_CULTURA_OPCIONES, TURNOS_OPCIONES } from '../types';
import { exportarReportesPDF, exportarReportesExcel, exportarReportesCSV, exportarReporteIndividualPDF } from '../utils/exportUtils';
import { ReportDetailModal } from './ReportDetailModal';
import { ReportEditModal } from './ReportEditModal';

export const ReportHistory: React.FC = () => {
  const { user } = useAuth();

  const [reportes, setReportes] = useState<ReporteSeguridad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // 1. RANGO POR DEFECTO: ÚNICAMENTE LOS ÚLTIMOS 31 DÍAS
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 31);
    return date.toISOString().slice(0, 10);
  };

  const getDefaultEndDate = () => {
    return new Date().toISOString().slice(0, 10);
  };

  // Estados de Filtros Interactivos
  const [fechaInicio, setFechaInicio] = useState<string>(getDefaultStartDate());
  const [fechaFin, setFechaFin] = useState<string>(getDefaultEndDate());
  const [evaluadorBusqueda, setEvaluadorBusqueda] = useState<string>(''); // Búsqueda en MAYÚSCULAS
  const [estadoCulturaFiltro, setEstadoCulturaFiltro] = useState<string>('TODOS');
  const [turnoFiltro, setTurnoFiltro] = useState<string>('TODOS');

  // Vista de pantalla: 'grid' (tarjetas) o 'table' (tabla)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modales
  const [selectedReport, setSelectedReport] = useState<ReporteSeguridad | null>(null);
  const [editingReport, setEditingReport] = useState<ReporteSeguridad | null>(null);

  // Cargar reportes desde Firestore
  const fetchReportesData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReportes();
      setReportes(data);
    } catch (err: any) {
      console.error('Error cargando reportes:', err);
      setError('No se pudo cargar la lista de reportes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportesData();
  }, []);

  // Manejador de cambio en filtro de Evaluador (Convierte a Mayúsculas automáticamente)
  const handleEvaluadorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvaluadorBusqueda(e.target.value.toUpperCase());
  };

  // Restablecer filtros al Rango por Defecto (Últimos 31 días)
  const handleResetToDefault31Days = () => {
    setFechaInicio(getDefaultStartDate());
    setFechaFin(getDefaultEndDate());
    setEvaluadorBusqueda('');
    setEstadoCulturaFiltro('TODOS');
    setTurnoFiltro('TODOS');
  };

  // Mostrar todo el histórico sin restricción de fecha
  const handleClearAllDateLimits = () => {
    setFechaInicio('');
    setFechaFin('');
  };

  // Lógica de Filtrado en Tiempo Real sobre la lista
  const reportesFiltrados = useMemo(() => {
    return reportes.filter((r) => {
      // 0. Filtro por Rol (USUARIO solo ve sus propios registros; ADMINISTRADOR y SUPERVISOR ven todos)
      if (user?.role === 'USUARIO') {
        const myUid = user.uid;
        const myEmail = user.email?.toLowerCase();
        const myName = user.displayName?.toUpperCase();

        const isMine =
          (r.createdByUid && r.createdByUid === myUid) ||
          (r.createdByEmail && myEmail && r.createdByEmail.toLowerCase() === myEmail) ||
          (r.NombreEvaluador && myName && r.NombreEvaluador.toUpperCase() === myName) ||
          (r.NombreEvaluador && myEmail && r.NombreEvaluador.toLowerCase().includes(myEmail.split('@')[0]));

        if (!isMine) return false;
      }

      // 1. Filtro por Rango de Fechas
      if (fechaInicio && r.Fecha < fechaInicio) return false;
      if (fechaFin && r.Fecha > fechaFin) return false;

      // 2. Filtro por Nombre de Evaluador (Búsqueda en Mayúsculas)
      if (evaluadorBusqueda.trim()) {
        const queryUpper = evaluadorBusqueda.trim().toUpperCase();
        const evalUpper = (r.NombreEvaluador || '').toUpperCase();
        if (!evalUpper.includes(queryUpper)) return false;
      }

      // 3. Filtro por Estado de Cultura (a, b, c)
      if (estadoCulturaFiltro !== 'TODOS') {
        if ((r.EstadoCultura || '').toLowerCase() !== estadoCulturaFiltro.toLowerCase()) {
          return false;
        }
      }

      // 4. Filtro por Turno (Turno 1, Turno 2, Turno 3)
      if (turnoFiltro !== 'TODOS') {
        if (r.Turno !== turnoFiltro) return false;
      }

      return true;
    });
  }, [reportes, fechaInicio, fechaFin, evaluadorBusqueda, estadoCulturaFiltro, turnoFiltro, user]);

  const canEditOrDelete = user?.role === 'ADMINISTRADOR' || user?.role === 'SUPERVISOR';

  // Manejo de edicion de reporte
  const handleSaveEdit = async (updatedData: Partial<ReporteSeguridad>) => {
    if (!editingReport?.id) return;
    if (!canEditOrDelete) {
      alert('Acceso Denegado: Los usuarios con rol USUARIO no tienen permisos para editar registros.');
      return;
    }
    await actualizarReporte(editingReport.id, updatedData);
    setReportes((prev) =>
      prev.map((r) => (r.id === editingReport.id ? { ...r, ...updatedData } : r))
    );
  };

  // Manejo de eliminación
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!canEditOrDelete) {
      alert('Acceso Denegado: Los usuarios con rol USUARIO no tienen permisos para eliminar registros.');
      return;
    }
    if (window.confirm('¿Está seguro de que desea eliminar este reporte permanentemente?')) {
      try {
        await eliminarReporte(id);
        setReportes((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        alert('Error al eliminar el reporte.');
      }
    }
  };

  // Estilo de badge según Estado de Cultura
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

  return (
    <div className="space-y-6">

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          reporte={selectedReport}
          onClose={() => setSelectedReport(null)}
          onDownloadPdf={() => exportarReporteIndividualPDF(selectedReport)}
        />
      )}

      {/* Edit Modal */}
      {editingReport && (
        <ReportEditModal
          reporte={editingReport}
          onClose={() => setEditingReport(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Encabezado Principal - Theme Pehuén */}
      <div className="bg-[#676057] text-[#F2EDC9] rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border border-[#80776D]">
        <div>
          <div className="flex items-center space-x-2 text-[#BCB703] text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-4 h-4 text-[#BCB703]" />
            <span>Módulo de Histórico Integrado</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#F2EDC9] flex items-center space-x-3">
            <span>HISTÓRICO DE REPORTES DE CULTURA</span>
            <span className="text-xs font-sans bg-[#BCB703] text-[#3E3933] font-bold px-3 py-1 rounded-full">
              {reportesFiltrados.length} Registros
            </span>
          </h1>
          <p className="text-xs text-[#D1CB9E] mt-1">
            Filtros por rango de fechas (por defecto <strong>últimos 31 días</strong>), evaluador en mayúsculas, estados de cultura (a, b, c) y exportación PDF/CSV.
          </p>
        </div>

        {/* Acciones de Exportación Global */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => exportarReportesExcel(reportesFiltrados)}
            disabled={reportesFiltrados.length === 0}
            className="bg-[#BCB703] hover:bg-[#8A8602] text-[#3E3933] disabled:opacity-50 font-heading font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#3E3933]" />
            <span>EXPORTAR EXCEL (.XLSX)</span>
          </button>

          <button
            onClick={() => exportarReportesPDF(reportesFiltrados, `${fechaInicio || 'Inicio'} a ${fechaFin || 'Fin'}`)}
            disabled={reportesFiltrados.length === 0}
            className="bg-[#3E3933] hover:bg-[#282420] text-[#F2EDC9] disabled:opacity-50 font-heading font-bold text-xs px-4 py-2.5 rounded-xl shadow-md border border-[#80776D] flex items-center space-x-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#BCB703]" />
            <span>DESCARGAR PDF</span>
          </button>

          <button
            onClick={() => exportarReportesCSV(reportesFiltrados)}
            disabled={reportesFiltrados.length === 0}
            className="bg-[#FAF8EA] hover:bg-[#EFEAD0] disabled:opacity-50 text-[#3E3933] font-heading font-bold text-xs px-4 py-2.5 rounded-xl border border-[#D1CB9E] flex items-center space-x-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#8A8602]" />
            <span>EXPORTAR CSV</span>
          </button>

          <button
            onClick={fetchReportesData}
            title="Recargar desde Firestore"
            className="bg-[#3E3933] hover:bg-[#282420] text-[#F2EDC9] p-2.5 rounded-xl border border-[#80776D] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#BCB703] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* FILTROS INTERACTIVOS EN VENTANA HISTÓRICO */}
      <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#D1CB9E] pb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#8A8602]" />
            <h3 className="font-heading font-bold text-sm text-[#3E3933]">
              Filtros de Búsqueda Avanzada
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetToDefault31Days}
              className="text-xs bg-[#BCB703]/20 text-[#8A8602] hover:bg-[#BCB703]/30 border border-[#BCB703] px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
            >
              📅 ÚLTIMOS 31 DÍAS (DEFECTO)
            </button>
            <button
              onClick={handleClearAllDateLimits}
              className="text-xs bg-[#676057] text-[#F2EDC9] hover:bg-[#3E3933] px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
            >
              TODOS LOS REGISTROS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* 1. Rango de Fechas: Inicio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#676057] flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#8A8602]" />
              <span>Fecha Desde</span>
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-3 py-2 text-xs text-[#3E3933] font-medium focus:ring-2 focus:ring-[#BCB703] focus:outline-none"
            />
          </div>

          {/* 1. Rango de Fechas: Fin */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#676057] flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#8A8602]" />
              <span>Fecha Hasta</span>
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-3 py-2 text-xs text-[#3E3933] font-medium focus:ring-2 focus:ring-[#BCB703] focus:outline-none"
            />
          </div>

          {/* 2. Filtro por Nombre de Evaluador (Convierte a Mayúsculas automáticamente) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#676057] flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Search className="w-3.5 h-3.5 text-[#8A8602]" />
                <span>Nombre Evaluador</span>
              </span>
              <span className="text-[10px] text-[#8A8602] font-mono font-bold">
                MAYÚS
              </span>
            </label>
            <input
              type="text"
              value={evaluadorBusqueda}
              onChange={handleEvaluadorChange}
              placeholder="BUSCAR EVALUADOR..."
              className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-3 py-2 text-xs text-[#3E3933] placeholder-[#80776D] uppercase focus:ring-2 focus:ring-[#BCB703] focus:outline-none font-bold"
            />
          </div>

          {/* 3. Filtro por Estado de Cultura (a, b, c) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#676057] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#8A8602]" />
              <span>Estado Cultura</span>
            </label>
            <select
              value={estadoCulturaFiltro}
              onChange={(e) => setEstadoCulturaFiltro(e.target.value)}
              className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-3 py-2 text-xs text-[#3E3933] font-bold focus:ring-2 focus:ring-[#BCB703] focus:outline-none"
            >
              <option value="TODOS">Todos los Estados</option>
              {ESTADOS_CULTURA_OPCIONES.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          {/* 4. Filtro por Turno */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#676057]">
              Turno
            </label>
            <select
              value={turnoFiltro}
              onChange={(e) => setTurnoFiltro(e.target.value)}
              className="w-full bg-[#FAF8EA] border border-[#D1CB9E] rounded-xl px-3 py-2 text-xs text-[#3E3933] font-bold focus:ring-2 focus:ring-[#BCB703] focus:outline-none"
            >
              <option value="TODOS">Todos los Turnos</option>
              {TURNOS_OPCIONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Selector de Modo de Vista */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-[#D1CB9E] text-xs">
          <div className="flex items-center space-x-1 bg-[#EFEAD0] p-1 rounded-xl border border-[#D1CB9E]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg flex items-center space-x-1 cursor-pointer text-xs ${
                viewMode === 'grid' ? 'bg-[#676057] text-[#F2EDC9] font-bold' : 'text-[#676057] hover:text-[#3E3933]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Tarjetas</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg flex items-center space-x-1 cursor-pointer text-xs ${
                viewMode === 'table' ? 'bg-[#676057] text-[#F2EDC9] font-bold' : 'text-[#676057] hover:text-[#3E3933]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>
        </div>
      </div>

      {/* LISTADO DE RESULTADOS */}
      {loading ? (
        <div className="text-center py-16 bg-[#FAF8EA] rounded-2xl border border-[#D1CB9E]">
          <RefreshCw className="w-8 h-8 text-[#8A8602] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#3E3933]">Cargando reportes desde Cloud Firestore...</p>
        </div>
      ) : error ? (
        <div className="bg-[#D37608]/10 border border-[#D37608] text-[#A85A02] p-6 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-[#D37608] mx-auto" />
          <p className="font-bold text-sm">{error}</p>
          <button
            onClick={fetchReportesData}
            className="text-xs bg-[#676057] text-[#F2EDC9] px-4 py-2 rounded-xl font-bold hover:bg-[#3E3933]"
          >
            Reintentar
          </button>
        </div>
      ) : reportesFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF8EA] rounded-2xl border border-[#D1CB9E] space-y-3">
          <History className="w-10 h-10 text-[#80776D] mx-auto" />
          <h3 className="text-base font-heading font-bold text-[#3E3933]">
            No se encontraron reportes con los filtros seleccionados
          </h3>
          <p className="text-xs text-[#676057] max-w-md mx-auto font-medium">
            Prueba ajustando el rango de fechas o haciendo clic en el botón para restablecer los 31 días por defecto.
          </p>
          <button
            onClick={handleResetToDefault31Days}
            className="text-xs bg-[#676057] text-[#F2EDC9] font-bold px-4 py-2.5 rounded-xl hover:bg-[#3E3933] cursor-pointer"
          >
            Restablecer a Últimos 31 Días
          </button>
        </div>
      ) : viewMode === 'grid' ? (

        /* VISTA DE TARJETAS (GRID) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reportesFiltrados.map((r) => {
            const badgeMeta = getBadgeStyle(r.EstadoCultura);
            return (
              <div
                key={r.id || r.Id_Evento}
                className={`bg-[#FAF8EA] rounded-2xl border border-[#D1CB9E] overflow-hidden shadow-md hover:shadow-lg transition-all flex flex-col justify-between border-l-4 ${badgeMeta.borderColor}`}
              >
                <div>
                  
                  {/* Foto previa + Overlay de ID */}
                  <div className="relative h-44 bg-[#3E3933] overflow-hidden group">
                    {r.Imagen && (r.EstadoCultura || '').toLowerCase() !== 'a' ? (
                      <img
                        src={r.Imagen}
                        alt="Foto Reporte"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#F2EDC9] font-mono text-xs">
                        Sin foto
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#3E3933] via-transparent to-transparent opacity-80" />

                    {/* ID & Fecha Badge */}
                    <div className="absolute top-3 left-3 bg-[#3E3933]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-[#80776D] text-[11px] font-mono font-bold text-[#F2EDC9]">
                      {r.Id_Evento}
                    </div>

                    <div className="absolute top-3 right-3 bg-[#3E3933]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-[#80776D] text-[11px] text-[#F2EDC9] font-medium">
                      📅 {r.Fecha}
                    </div>

                    {/* Estado de cultura badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border bg-[#FAF8EA] text-[#3E3933] border-[#3E3933]`}>
                        Estado {(r.EstadoCultura || '').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Contenido Principal */}
                  <div className="p-5 space-y-3">
                    
                    {/* EVALUADOR EN MAYÚSCULAS */}
                    <div className="bg-[#EFEAD0] p-3 rounded-xl border border-[#D1CB9E] space-y-0.5">
                      <div className="text-[10px] font-bold uppercase text-[#8A8602] tracking-wider">
                        EVALUADOR EN TERRENO:
                      </div>
                      <div className="font-heading font-bold text-sm text-[#3E3933] tracking-wide uppercase break-words">
                        {(r.NombreEvaluador || '').toUpperCase()}
                      </div>
                    </div>

                    {/* Cancha & Turno */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#676057] block text-[10px] font-bold uppercase">Cancha / Ubicación:</span>
                        <span className="text-[#3E3933] font-bold truncate block">{r.Cancha}</span>
                      </div>
                      <div>
                        <span className="text-[#676057] block text-[10px] font-bold uppercase">Turno:</span>
                        <span className="text-[#3E3933] font-bold truncate block">{r.Turno}</span>
                      </div>
                    </div>

                    {/* ¿En qué fallamos? */}
                    <div className="bg-[#D37608]/10 p-3 rounded-xl border border-[#D37608]/30 space-y-1">
                      <span className="text-[10px] font-bold text-[#D37608] uppercase tracking-wider block">
                        ¿EN QUÉ FALLAMOS?
                      </span>
                      <p className="text-xs text-[#3E3933] line-clamp-2 font-medium leading-relaxed">
                        {r.EnQueFallamos}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Acciones de Tarjeta */}
                <div className="p-3 bg-[#EFEAD0] border-t border-[#D1CB9E] flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => setSelectedReport(r)}
                    className="flex-1 bg-[#676057] hover:bg-[#3E3933] text-[#F2EDC9] text-xs font-bold py-2 px-2.5 rounded-xl flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#BCB703]" />
                    <span>Ver</span>
                  </button>

                  {canEditOrDelete && (
                    <button
                      onClick={() => setEditingReport(r)}
                      title="Editar Registro"
                      className="p-2 bg-[#FAF8EA] hover:bg-[#BCB703]/20 text-[#3E3933] font-bold rounded-xl border border-[#D1CB9E] transition-colors cursor-pointer flex items-center space-x-1 text-xs"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#8A8602]" />
                      <span>Editar</span>
                    </button>
                  )}

                  <button
                    onClick={() => exportarReporteIndividualPDF(r)}
                    title="Exportar PDF Individual"
                    className="p-2 bg-[#FAF8EA] hover:bg-[#FAF8EA]/80 text-[#8A8602] rounded-xl border border-[#D1CB9E] transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  {canEditOrDelete && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      title="Eliminar Registro"
                      className="p-2 bg-[#FAF8EA] hover:bg-red-100 text-[#D37608] rounded-xl border border-[#D1CB9E] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* VISTA DE TABLA COMPLETA */
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#3E3933]">
              <thead className="bg-[#676057] text-[#F2EDC9] font-heading font-bold uppercase tracking-wider border-b border-[#3E3933]">
                <tr>
                  <th className="p-3.5">ID Evento</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Evaluador (MAYÚS)</th>
                  <th className="p-3.5">Cancha</th>
                  <th className="p-3.5">Turno</th>
                  <th className="p-3.5">Estado Cultura</th>
                  <th className="p-3.5 min-w-[200px]">¿En qué fallamos?</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D1CB9E]">
                {reportesFiltrados.map((r) => {
                  return (
                    <tr key={r.id || r.Id_Evento} className="hover:bg-[#EFEAD0] transition-colors font-medium">
                      <td className="p-3.5 font-mono font-bold text-[#8A8602]">{r.Id_Evento}</td>
                      <td className="p-3.5">{r.Fecha}</td>
                      <td className="p-3.5 font-bold uppercase text-[#3E3933]">{r.NombreEvaluador.toUpperCase()}</td>
                      <td className="p-3.5">{r.Cancha}</td>
                      <td className="p-3.5">{r.Turno}</td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-[#676057] text-[#F2EDC9] uppercase">
                          Estado {(r.EstadoCultura || '').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#3E3933] max-w-xs truncate">{r.EnQueFallamos}</td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedReport(r)}
                            title="Ver Detalle"
                            className="p-1.5 text-[#3E3933] hover:text-[#8A8602] hover:bg-[#FAF8EA] rounded-lg cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canEditOrDelete && (
                            <button
                              onClick={() => setEditingReport(r)}
                              title="Editar Registro"
                              className="p-1.5 text-[#8A8602] hover:bg-[#FAF8EA] rounded-lg cursor-pointer flex items-center space-x-1 text-xs font-bold"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => exportarReporteIndividualPDF(r)}
                            title="PDF Individual"
                            className="p-1.5 text-[#676057] hover:bg-[#FAF8EA] rounded-lg cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {canEditOrDelete && (
                            <button
                              onClick={() => handleDelete(r.id)}
                              title="Eliminar Registro"
                              className="p-1.5 text-[#D37608] hover:bg-red-100 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
