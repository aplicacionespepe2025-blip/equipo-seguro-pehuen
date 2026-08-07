import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Users, 
  RefreshCw,
  Sparkles,
  Calendar,
  Filter,
  Clock
} from 'lucide-react';
import { getReportes } from '../services/reportService';
import { ReporteSeguridad, ESTADOS_CULTURA_OPCIONES } from '../types';

type PresetFilter = 'todos' | 'semana' | 'mes' | '30dias' | 'personalizado';

export const DashboardView: React.FC = () => {
  const [reportes, setReportes] = useState<ReporteSeguridad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros de Rango de Fecha
  const [preset, setPreset] = useState<PresetFilter>('todos');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getReportes();
      setReportes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Función para formatear YYYY-MM-DD
  const formatDateStr = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Manejador de botones de Presets de fecha
  const handleSelectPreset = (p: PresetFilter) => {
    setPreset(p);
    const now = new Date();

    if (p === 'todos') {
      setFechaInicio('');
      setFechaFin('');
    } else if (p === 'semana') {
      const pastWeek = new Date();
      pastWeek.setDate(now.getDate() - 7);
      setFechaInicio(formatDateStr(pastWeek));
      setFechaFin(formatDateStr(now));
    } else if (p === 'mes') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setFechaInicio(formatDateStr(startOfMonth));
      setFechaFin(formatDateStr(now));
    } else if (p === '30dias') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      setFechaInicio(formatDateStr(past30));
      setFechaFin(formatDateStr(now));
    } else if (p === 'personalizado') {
      if (!fechaInicio) {
        const pastWeek = new Date();
        pastWeek.setDate(now.getDate() - 7);
        setFechaInicio(formatDateStr(pastWeek));
      }
      if (!fechaFin) {
        setFechaFin(formatDateStr(now));
      }
    }
  };

  // Reportes filtrados por el rango de fechas
  const filteredReportes = useMemo(() => {
    return reportes.filter((r) => {
      if (!r.Fecha) return true;
      if (fechaInicio && r.Fecha < fechaInicio) return false;
      if (fechaFin && r.Fecha > fechaFin) return false;
      return true;
    });
  }, [reportes, fechaInicio, fechaFin]);

  // Cálculos métricos sobre los reportes filtrados
  const total = filteredReportes.length;

  const culturaCounts = useMemo(() => {
    const counts: Record<string, number> = {
      a: 0,
      b: 0,
      c: 0
    };

    filteredReportes.forEach((r) => {
      const key = (r.EstadoCultura || 'a').toLowerCase();
      if (counts[key] !== undefined) {
        counts[key]++;
      } else {
        counts['a']++;
      }
    });

    return counts;
  }, [filteredReportes]);

  const estadoA = culturaCounts['a'] || 0;
  const estadoB = culturaCounts['b'] || 0;
  const estadoC = culturaCounts['c'] || 0;

  const pctA = total > 0 ? Math.round((estadoA / total) * 100) : 0;
  const pctB = total > 0 ? Math.round((estadoB / total) * 100) : 0;
  const pctC = total > 0 ? Math.round((estadoC / total) * 100) : 0;

  // Canchas con más evaluaciones
  const canchasCounts = useMemo(() => {
    const map: Record<string, number> = {};
    filteredReportes.forEach((r) => {
      map[r.Cancha] = (map[r.Cancha] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredReportes]);

  // Top Evaluadores en Mayúsculas
  const evaluadoresTop = useMemo(() => {
    const map: Record<string, number> = {};
    filteredReportes.forEach((r) => {
      const name = (r.NombreEvaluador || 'N/A').toUpperCase();
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [filteredReportes]);

  return (
    <div className="space-y-6">

      {/* Header Banner - Coffee Palette */}
      <div className="bg-[#676057] text-[#F2EDC9] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#80776D]">
        <div>
          <div className="flex items-center space-x-2 text-[#BCB703] text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-[#BCB703]" />
            <span>Panel de Analítica Integrada</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#F2EDC9]">
            Dashboard de Cultura y Seguridad Pehuén
          </h1>
          <p className="text-xs text-[#D1CB9E] mt-1">
            Métricas clave de desempeño, madurez de cultura organizacional (a, b, c) y avances semanales o mensuales.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="bg-[#3E3933] hover:bg-[#282420] text-[#F2EDC9] p-2.5 rounded-xl border border-[#80776D] transition-colors cursor-pointer self-end md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-[#BCB703] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Barra de Filtro por Rango de Fecha (Semanal / Mensual / Rango Personalizado) */}
      <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#D1CB9E] pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[#8A8602]" />
            <h3 className="font-heading font-bold text-sm text-[#3E3933] uppercase tracking-wider">
              Filtro por Rango de Fecha / Avances
            </h3>
          </div>

          <div className="text-xs font-bold text-[#676057]">
            Mostrando <span className="text-[#3E3933] font-mono font-bold text-sm">{filteredReportes.length}</span> de {reportes.length} evaluaciones
          </div>
        </div>

        {/* Botones de Presets de Fecha */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelectPreset('todos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              preset === 'todos'
                ? 'bg-[#676057] text-[#F2EDC9] border-[#3E3933] shadow-md'
                : 'bg-[#FAF8EA] text-[#676057] border-[#D1CB9E] hover:bg-[#EFEAD0]'
            }`}
          >
            Todas las Fechas
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('semana')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center space-x-1.5 ${
              preset === 'semana'
                ? 'bg-[#676057] text-[#F2EDC9] border-[#3E3933] shadow-md'
                : 'bg-[#FAF8EA] text-[#676057] border-[#D1CB9E] hover:bg-[#EFEAD0]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#BCB703]" />
            <span>Esta Semana (7 Días)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('mes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center space-x-1.5 ${
              preset === 'mes'
                ? 'bg-[#676057] text-[#F2EDC9] border-[#3E3933] shadow-md'
                : 'bg-[#FAF8EA] text-[#676057] border-[#D1CB9E] hover:bg-[#EFEAD0]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#BCB703]" />
            <span>Este Mes</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('30dias')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              preset === '30dias'
                ? 'bg-[#676057] text-[#F2EDC9] border-[#3E3933] shadow-md'
                : 'bg-[#FAF8EA] text-[#676057] border-[#D1CB9E] hover:bg-[#EFEAD0]'
            }`}
          >
            Últimos 30 Días
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('personalizado')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center space-x-1.5 ${
              preset === 'personalizado'
                ? 'bg-[#676057] text-[#F2EDC9] border-[#3E3933] shadow-md'
                : 'bg-[#FAF8EA] text-[#676057] border-[#D1CB9E] hover:bg-[#EFEAD0]'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-[#BCB703]" />
            <span>Rango Personalizado</span>
          </button>
        </div>

        {/* Inputs de Fechas Personalizadas o Detalle Activo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1 items-end">
          <div>
            <label className="text-[11px] font-bold text-[#676057] block mb-1">Fecha Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setPreset('personalizado');
              }}
              className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-[#3E3933] font-mono font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#BCB703]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#676057] block mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setPreset('personalizado');
              }}
              className="w-full bg-[#FAF8EA] border border-[#D1CB9E] text-[#3E3933] font-mono font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#BCB703]"
            />
          </div>

          {(fechaInicio || fechaFin) && (
            <div>
              <button
                type="button"
                onClick={() => handleSelectPreset('todos')}
                className="w-full bg-[#EFEAD0] hover:bg-[#D1CB9E] text-[#3E3933] text-xs font-bold py-2 rounded-xl border border-[#D1CB9E] transition-colors cursor-pointer"
              >
                Limpiar Filtros de Fecha
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#676057]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Evaluaciones</span>
            <ShieldCheck className="w-5 h-5 text-[#8A8602]" />
          </div>
          <div className="font-heading font-bold text-3xl text-[#3E3933]">
            {total}
          </div>
          <p className="text-[11px] text-[#676057]">Registros acumulados en Firestore</p>
        </div>

        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#D37608]">
            <span className="text-xs font-bold uppercase tracking-wider">Estado A</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="font-heading font-bold text-3xl text-[#D37608] flex items-baseline space-x-2">
            <span>{pctA}%</span>
            <span className="text-xs font-sans text-[#676057]">({estadoA} eval.)</span>
          </div>
          <p className="text-[11px] text-[#676057]">Cultura Inicial / Requerimiento Básico</p>
        </div>

        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#8A8602]">
            <span className="text-xs font-bold uppercase tracking-wider">Estado B</span>
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="font-heading font-bold text-3xl text-[#8A8602] flex items-baseline space-x-2">
            <span>{pctB}%</span>
            <span className="text-xs font-sans text-[#676057]">({estadoB} eval.)</span>
          </div>
          <p className="text-[11px] text-[#676057]">Cultura en Desarrollo / Intermedia</p>
        </div>

        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#676057]">
            <span className="text-xs font-bold uppercase tracking-wider">Estado C</span>
            <Users className="w-5 h-5 text-[#3E3933]" />
          </div>
          <div className="font-heading font-bold text-3xl text-[#3E3933] flex items-baseline space-x-2">
            <span>{pctC}%</span>
            <span className="text-xs font-sans text-[#676057]">({estadoC} eval.)</span>
          </div>
          <p className="text-[11px] text-[#676057]">Cultura Integrada / Proactiva</p>
        </div>

      </div>

      {/* Gráficos de Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Distribución por Estado de Cultura */}
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#3E3933] uppercase tracking-wider flex items-center space-x-2 border-b border-[#D1CB9E] pb-3">
            <PieChart className="w-4 h-4 text-[#8A8602]" />
            <span>Distribución de Estados de Cultura (A, B, C)</span>
          </h3>

          <div className="space-y-4">
            {ESTADOS_CULTURA_OPCIONES.map((opt) => {
              const count = culturaCounts[opt.value] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={opt.value} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#3E3933]">{opt.label} - {opt.desc}</span>
                    <span className="font-mono text-[#676057] font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3.5 bg-[#EFEAD0] rounded-full overflow-hidden border border-[#D1CB9E]">
                    <div
                      className={`h-full transition-all duration-500 ${
                        opt.value === 'a' ? 'bg-[#D37608]' :
                        opt.value === 'b' ? 'bg-[#BCB703]' : 'bg-[#676057]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Canchas con Más Evaluaciones */}
        <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#3E3933] uppercase tracking-wider flex items-center space-x-2 border-b border-[#D1CB9E] pb-3">
            <MapPin className="w-4 h-4 text-[#8A8602]" />
            <span>Evaluaciones por Cancha / Faena</span>
          </h3>

          <div className="space-y-3">
            {canchasCounts.length === 0 ? (
              <p className="text-xs text-[#676057]">Sin registros de cancha.</p>
            ) : (
              canchasCounts.map(([canchaName, count]) => {
                const max = canchasCounts[0][1] || 1;
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={canchaName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#3E3933] truncate">{canchaName}</span>
                      <span className="font-mono text-[#8A8602] font-bold">{count} eval.</span>
                    </div>
                    <div className="w-full h-3 bg-[#EFEAD0] rounded-full overflow-hidden border border-[#D1CB9E]">
                      <div
                        className="h-full bg-[#676057] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Top Evaluadores */}
      <div className="bg-[#FAF8EA] border border-[#D1CB9E] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-sm text-[#3E3933] uppercase tracking-wider flex items-center space-x-2 border-b border-[#D1CB9E] pb-3">
          <Users className="w-4 h-4 text-[#8A8602]" />
          <span>Líderes Evaluadores Más Activos en Terreno</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {evaluadoresTop.map(([evalName, count], idx) => (
            <div key={evalName} className="bg-[#EFEAD0] p-4 rounded-xl border border-[#D1CB9E] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8A8602] font-bold block uppercase">#{idx + 1} Evaluador</span>
                <span className="font-heading font-bold text-sm text-[#3E3933] uppercase tracking-wide">
                  {evalName}
                </span>
              </div>
              <span className="font-mono font-bold text-xs bg-[#676057] text-[#F2EDC9] px-3 py-1 rounded-full">
                {count} Rep.
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
