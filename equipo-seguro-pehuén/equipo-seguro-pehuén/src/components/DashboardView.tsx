import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Users, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { getReportes } from '../services/reportService';
import { ReporteSeguridad, ESTADOS_CULTURA_OPCIONES } from '../types';

export const DashboardView: React.FC = () => {
  const [reportes, setReportes] = useState<ReporteSeguridad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Cálculos métricos
  const total = reportes.length;

  const culturaCounts = useMemo(() => {
    const counts: Record<string, number> = {
      a: 0,
      b: 0,
      c: 0
    };

    reportes.forEach((r) => {
      const key = (r.EstadoCultura || 'a').toLowerCase();
      if (counts[key] !== undefined) {
        counts[key]++;
      } else {
        counts['a']++;
      }
    });

    return counts;
  }, [reportes]);

  const estadoA = culturaCounts['a'] || 0;
  const estadoB = culturaCounts['b'] || 0;
  const estadoC = culturaCounts['c'] || 0;

  const pctA = total > 0 ? Math.round((estadoA / total) * 100) : 0;
  const pctB = total > 0 ? Math.round((estadoB / total) * 100) : 0;
  const pctC = total > 0 ? Math.round((estadoC / total) * 100) : 0;

  // Canchas con más evaluaciones
  const canchasCounts = useMemo(() => {
    const map: Record<string, number> = {};
    reportes.forEach((r) => {
      map[r.Cancha] = (map[r.Cancha] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [reportes]);

  // Top Evaluadores en Mayúsculas
  const evaluadoresTop = useMemo(() => {
    const map: Record<string, number> = {};
    reportes.forEach((r) => {
      const name = (r.NombreEvaluador || 'N/A').toUpperCase();
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [reportes]);

  return (
    <div className="space-y-6">

      {/* Header Banner - Coffee Palette */}
      <div className="bg-[#676057] text-[#F2EDC9] rounded-2xl p-6 shadow-xl flex items-center justify-between border border-[#80776D]">
        <div>
          <div className="flex items-center space-x-2 text-[#BCB703] text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-[#BCB703]" />
            <span>Panel de Analítica Integrada</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#F2EDC9]">
            Dashboard de Cultura y Seguridad Pehuén
          </h1>
          <p className="text-xs text-[#D1CB9E] mt-1">
            Métricas clave de desempeño, madurez de cultura organizacional (a, b, c) y focos de atención.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="bg-[#3E3933] hover:bg-[#282420] text-[#F2EDC9] p-2.5 rounded-xl border border-[#80776D] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#BCB703] ${loading ? 'animate-spin' : ''}`} />
        </button>
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
