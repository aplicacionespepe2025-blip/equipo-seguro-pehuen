export type UserRole = 'ADMINISTRADOR' | 'SUPERVISOR' | 'USUARIO';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: string;
}

export type EstadoCulturaType = 'a' | 'b' | 'c';

export interface ReporteSeguridad {
  id?: string;
  Id_Evento: string;
  Fecha: string; // YYYY-MM-DD
  Cancha: string;
  NombreEvaluador: string; // SIEMPRE EN MAYÚSCULAS
  NombreReceptor?: string; // Nombre del Receptor de la evaluación
  Turno: string; // "Turno 1" | "Turno 2" | "Turno 3"
  EstadoCultura: EstadoCulturaType | string; // "a" | "b" | "c"
  EnQueFallamos: string;
  CualEsNuestroCompromiso: string;
  Observaciones: string;
  Imagen: string; // Base64 o URL
  FechaHoraRegistro: string; // Formato legible "YYYY-MM-DD HH:mm:ss"
  createdAt?: number;
  createdByUid?: string;
  createdByEmail?: string;
}

export interface ReportFilterState {
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;    // YYYY-MM-DD
  evaluadorBusqueda: string; // En mayúsculas
  estadoCultura: string;
  cancha: string;
  turno: string;
}

export const PRESET_SAMPLE_PHOTOS = [
  { label: 'EHS Cancha 1', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80' },
  { label: 'EPP Taller', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
  { label: 'Inspección Faena', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80' },
  { label: 'Demarcación', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80' }
];

export const CANCHAS_OPCIONES = [
  'Cancha Principal',
  'Faena Central - Pehuén',
  'Taller Mecánico',
  'Área de Trituración',
  'Planta Concentradora',
  'Campamento Sur',
  'Bodega e Insumos',
  'Laboratorio Químico',
  'Vías de Transporte'
];

export const TURNOS_OPCIONES = [
  'Turno 1',
  'Turno 2',
  'Turno 3'
];

export const ESTADOS_CULTURA_OPCIONES: { 
  value: EstadoCulturaType; 
  label: string; 
  desc: string; 
  badgeColor: string; 
  borderColor: string 
}[] = [
  {
    value: 'a',
    label: 'Estado A',
    desc: 'Cultura Inicial / Requerimiento Básico de Seguridad.',
    badgeColor: 'bg-[#D37608]/20 text-[#D37608] border-[#D37608]/50',
    borderColor: 'border-l-[#D37608]'
  },
  {
    value: 'b',
    label: 'Estado B',
    desc: 'Cultura en Desarrollo / Prevención Intermedia.',
    badgeColor: 'bg-[#BCB703]/20 text-[#8C8800] border-[#BCB703]/50',
    borderColor: 'border-l-[#BCB703]'
  },
  {
    value: 'c',
    label: 'Estado C',
    desc: 'Cultura Integrada / Gestión de Excelencia Proactiva.',
    badgeColor: 'bg-[#676057]/20 text-[#3E3933] border-[#676057]/50',
    borderColor: 'border-l-[#676057]'
  }
];
