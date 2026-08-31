import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ReporteSeguridad } from '../types';

const COLLECTION_NAME = 'reportes';

// Imágenes de ejemplo comprimidas para demostración
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80"
];

const MOCK_REPORTES_INICIALES: Omit<ReporteSeguridad, 'id'>[] = [
  {
    Id_Evento: 'PEH-2026-0805-01',
    Fecha: '2026-08-05',
    Cancha: 'Faena Central - Pehuén',
    NombreEvaluador: 'MARCOS ANTONIO SILVA',
    Turno: 'Turno 1',
    EstadoCultura: 'a',
    EnQueFallamos: 'Se observó falta de delimitación adecuada en la zona de acopio temporal de residuos.',
    CualEsNuestroCompromiso: 'Instalar mallas de advertencia y conos reflexivos antes de iniciar la carga.',
    Observaciones: 'Excelente disposición del equipo para corregir la desviación de inmediato.',
    Imagen: MOCK_IMAGES[0],
    FechaHoraRegistro: '2026-08-05 11:30:00',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1 // 1 día atrás
  },
  {
    Id_Evento: 'PEH-2026-0803-02',
    Fecha: '2026-08-03',
    Cancha: 'Taller Mecánico',
    NombreEvaluador: 'RODRIGO IGNACIO VALENZUELA',
    Turno: 'Turno 2',
    EstadoCultura: 'b',
    EnQueFallamos: 'Uso parcial de protección auditiva durante operaciones con esmeril angular.',
    CualEsNuestroCompromiso: 'Realizar verificación cruzada entre compañeros antes de encender herramientas ruidosas.',
    Observaciones: 'El trabajador propuso un soporte ergonómico para sostener piezas pesadas.',
    Imagen: MOCK_IMAGES[1],
    FechaHoraRegistro: '2026-08-03 15:45:00',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 // 3 días atrás
  },
  {
    Id_Evento: 'PEH-2026-0728-03',
    Fecha: '2026-07-28',
    Cancha: 'Área de Trituración',
    NombreEvaluador: 'FERNANDO JOSÉ TAPIA',
    Turno: 'Turno 3',
    EstadoCultura: 'c',
    EnQueFallamos: 'Desatención momentánea al transitar por zonas con iluminación deficiente.',
    CualEsNuestroCompromiso: 'Reforzar el check-list de linternas personales y reportar luminarias defectuosas.',
    Observaciones: 'Se solicitó a mantención el cambio de 2 focos en la pasarela norte.',
    Imagen: MOCK_IMAGES[2],
    FechaHoraRegistro: '2026-07-28 03:20:00',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9 // 9 días atrás
  },
  {
    Id_Evento: 'PEH-2026-0720-04',
    Fecha: '2026-07-20',
    Cancha: 'Planta Concentradora',
    NombreEvaluador: 'MARCOS ANTONIO SILVA',
    Turno: 'Turno 1',
    EstadoCultura: 'a',
    EnQueFallamos: 'No se completó la tarjeta de bloqueo LOTO en la válvula auxiliar antes de la revisión.',
    CualEsNuestroCompromiso: 'Detener la maniobra, aplicar bloqueo físico y repasar procedimiento crítico de energía cero.',
    Observaciones: 'Se realiza parada de seguridad preventiva de 15 minutos con toda la cuadrilla.',
    Imagen: MOCK_IMAGES[3],
    FechaHoraRegistro: '2026-07-20 22:10:00',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 17 // 17 días atrás
  },
  {
    Id_Evento: 'PEH-2026-0712-05',
    Fecha: '2026-07-12',
    Cancha: 'Campamento Sur',
    NombreEvaluador: 'GABRIELA BEATRIZ HENRÍQUEZ',
    Turno: 'Turno 2',
    EstadoCultura: 'b',
    EnQueFallamos: 'Obstrucción menor de extintor con cajas de embalaje en bodega.',
    CualEsNuestroCompromiso: 'Mantener despejada el área de 1 metro alrededor de todo equipo contra incendios.',
    Observaciones: 'Se despejó el área inmediatamente y se señalizó la demarcación en el piso.',
    Imagen: MOCK_IMAGES[4],
    FechaHoraRegistro: '2026-07-12 14:00:00',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25 // 25 días atrás
  },
  {
    Id_Evento: 'PEH-2026-0620-06',
    Fecha: '2026-06-20',
    Cancha: 'Bodega e Insumos',
    NombreEvaluador: 'RODRIGO IGNACIO VALENZUELA',
    Turno: 'Turno 3',
    EstadoCultura: 'c',
    EnQueFallamos: 'Almacenamiento inadecuado de sustancias químicas sin su Hoja de Datos de Seguridad (HDS).',
    CualEsNuestroCompromiso: 'Etiquetar todos los envases secundarios y disponer la matriz HDS al ingreso de bodega.',
    Observaciones: 'Reporte antiguo fuera de los 31 días para probar filtros de rango de fechas.',
    Imagen: MOCK_IMAGES[0],
    FechaHoraRegistro: '2026-06-20 18:30:00',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 47 // 47 días atrás
  }
];

export const getReportes = async (): Promise<ReporteSeguridad[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('Fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    const results: ReporteSeguridad[] = [];
    querySnapshot.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...docSnap.data() } as ReporteSeguridad);
    });

    if (results.length === 0) {
      await seedReportesIniciales();
      return getReportes();
    }

    return results;
  } catch (error) {
    console.warn('Firestore offline o no configurado aún, utilizando mock local:', error);
    return MOCK_REPORTES_INICIALES.map((item, idx) => ({ id: `mock-${idx}`, ...item }));
  }
};

export const crearReporte = async (reporte: Omit<ReporteSeguridad, 'id'>): Promise<string> => {
  // Garantizar que NombreEvaluador esté SIEMPRE en MAYÚSCULAS
  const reporteAjustado: Omit<ReporteSeguridad, 'id'> = {
    ...reporte,
    NombreEvaluador: (reporte.NombreEvaluador || '').trim().toUpperCase(),
    createdAt: Date.now()
  };

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), reporteAjustado);
    return docRef.id;
  } catch (error) {
    console.error('Error guardando reporte en Firestore:', error);
    return `local-${Date.now()}`;
  }
};

export const eliminarReporte = async (id: string): Promise<void> => {
  try {
    if (id.startsWith('mock-') || id.startsWith('local-')) return;
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error al eliminar reporte de Firestore:', error);
    throw error;
  }
};

export const actualizarReporte = async (id: string, datosAjustados: Partial<ReporteSeguridad>): Promise<void> => {
  try {
    if (id.startsWith('mock-') || id.startsWith('local-')) return;
    const docRef = doc(db, COLLECTION_NAME, id);
    if (datosAjustados.NombreEvaluador) {
      datosAjustados.NombreEvaluador = datosAjustados.NombreEvaluador.trim().toUpperCase();
    }
    await updateDoc(docRef, datosAjustados);
  } catch (error) {
    console.error('Error al actualizar reporte en Firestore:', error);
    throw error;
  }
};

export const seedReportesIniciales = async (): Promise<void> => {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    for (const item of MOCK_REPORTES_INICIALES) {
      await addDoc(colRef, item);
    }
  } catch (err) {
    console.warn('Error sembrando reportes iniciales:', err);
  }
};
