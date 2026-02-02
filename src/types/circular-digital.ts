// ============================================================================
// Tipos para la feature Circular Digital
// ============================================================================

// --- Perfil de Salud ---
export interface PerfilSaludData {
  id?: number;
  educando_id: number;
  alergias: string;
  intolerancias: string;
  dieta_especial: string;
  medicacion: string;
  observaciones_medicas: string;
  grupo_sanguineo: string;
  tarjeta_sanitaria: string;
  enfermedades_cronicas: string;
  puede_hacer_deporte: boolean;
  notas_adicionales: string;
  ultima_actualizacion?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactoEmergencia {
  id?: number;
  educando_id?: number;
  nombre_completo: string;
  telefono: string;
  relacion: string;
  orden: number;
}

// --- Plantillas de Circular ---
export interface PlantillaCircular {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  campos_estandar: string[];
  activa: boolean;
  created_at?: string;
  updated_at?: string;
}

// --- Config Ronda (contactos por sección, por temporada) ---
export interface ConfigRonda {
  id: number;
  temporada: string;
  responsable_castores: string;
  numero_responsable_castores: string;
  responsable_manada: string;
  numero_responsable_manada: string;
  responsable_tropa: string;
  numero_responsable_tropa: string;
  responsable_pioneros: string;
  numero_responsable_pioneros: string;
  responsable_rutas: string;
  numero_responsable_rutas: string;
  normas_generales: string;
  cuenta_bancaria: string;
  activa: boolean;
  created_at?: string;
  updated_at?: string;
}

// --- Circular por Actividad ---
export interface CircularActividad {
  id: number;
  actividad_id: number;
  plantilla_id: number | null;
  titulo: string;
  texto_introductorio: string;
  fecha_limite_firma: string | null;
  estado: 'borrador' | 'publicada' | 'cerrada' | 'cancelada';
  configuracion: Record<string, unknown>;
  creado_por: number;
  // Campos template PDF
  numero_dia: string;
  destinatarios: string;
  fecha_actividad: string;
  lugar: string;
  hora_y_lugar_salida: string;
  hora_y_lugar_llegada: string;
  que_llevar: string;
  precio_info_pago: string;
  info_familias: string;
  created_at?: string;
  updated_at?: string;
  // Campos join
  actividad_titulo?: string;
  actividad_fecha_inicio?: string;
  actividad_fecha_fin?: string;
  actividad_lugar?: string;
}

// --- Campo Custom ---
export interface CampoCustomCircular {
  id?: number;
  circular_actividad_id?: number;
  nombre_campo: string;
  tipo_campo: 'texto' | 'textarea' | 'checkbox' | 'select';
  etiqueta: string;
  obligatorio: boolean;
  opciones: string[] | null;
  orden: number;
}

// --- Respuesta a Circular ---
export interface CircularRespuesta {
  id: number;
  circular_actividad_id: number;
  educando_id: number;
  familiar_id: number;
  datos_medicos_snapshot: PerfilSaludData;
  contactos_emergencia_snapshot: ContactoEmergencia[];
  campos_custom_respuestas: Record<string, unknown>;
  firma_base64: string;
  firma_tipo: 'image' | 'text';
  ip_firma: string;
  user_agent_firma: string;
  fecha_firma: string;
  estado: 'firmada' | 'pdf_generado' | 'archivada' | 'error_pdf' | 'error_drive' | 'superseded' | 'anulada';
  pdf_drive_id: string | null;
  pdf_hash_sha256: string | null;
  pdf_local_path: string | null;
  version: number;
  created_at?: string;
  updated_at?: string;
}

// --- Info Familiar (para pre-rellenar autorización) ---
export interface FamiliarInfo {
  id: number;
  nombre: string;
  apellidos: string;
  dni?: string;
  telefono?: string;
}

// --- Wizard Props y State ---
export interface CircularDigitalWizardProps {
  actividadId: number;
  educandoId: number;
  familiarId?: number;
  onComplete: (resultado: CircularResultado) => void;
  onCancel: () => void;
  embedded?: boolean;
  initialStep?: number;
}

export interface CircularResultado {
  success: boolean;
  circularRespuestaId: number;
  pdfUrl: string;
  pdfDriveId: string;
}

export interface WizardState {
  currentStep: number;
  perfilSalud: PerfilSaludData | null;
  contactosEmergencia: ContactoEmergencia[];
  camposCustomRespuestas: Record<string, unknown>;
  firmaBase64: string | null;
  aceptaCondiciones: boolean;
  datosModificados: boolean;
  actualizarPerfil: boolean;
  isSubmitting: boolean;
  error: string | null;
}

// --- Firma Digital ---
export interface FirmaDigitalCanvasProps {
  onChange: (firmaBase64: string | null) => void;
  width?: number;
  height?: number;
  penColor?: string;
  minWidth?: number;
  maxWidth?: number;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: string;
  minPoints?: number;
}

// --- Dashboard Admin ---
export interface InscritoConEstado {
  educandoId: number;
  educandoNombre: string;
  educandoApellidos: string;
  seccion: string;
  familiarNombre: string;
  familiarEmail: string;
  estadoCircular: 'pendiente' | 'firmada' | 'archivada' | 'error';
  fechaFirma: string | null;
  pdfDriveId: string | null;
  pdfUrl: string | null;
}

export interface DashboardStats {
  total: number;
  firmadas: number;
  pendientes: number;
  error: number;
}

// --- Formulario de Circular (respuesta del API) ---
export interface CircularFormularioResponse {
  circular: CircularActividad;
  camposCustom: CampoCustomCircular[];
  perfilSalud: PerfilSaludData | null;
  contactos: ContactoEmergencia[];
  educando: {
    id: number;
    nombre: string;
    apellidos: string;
    fecha_nacimiento: string;
    seccion_nombre: string;
  };
  familiar: FamiliarInfo | null;
  configRonda: ConfigRonda | null;
  respuestaExistente: CircularRespuesta | null;
}

// --- Datos para firmar ---
export interface DatosFirmaCircular {
  educandoId: number;
  datosMedicos: Partial<PerfilSaludData>;
  contactos: ContactoEmergencia[];
  camposCustom: Record<string, unknown>;
  firmaBase64: string;
  firmaTipo: 'image' | 'text';
  aceptaCondiciones: boolean;
  actualizarPerfil: boolean;
}

// --- Datos para crear circular (admin) ---
export interface CrearCircularData {
  actividad_id: number;
  titulo: string;
  texto_introductorio?: string;
  fecha_limite_firma?: string | null;
  estado?: 'borrador' | 'publicada';
  // Campos template PDF
  numero_dia?: string;
  destinatarios?: string;
  fecha_actividad?: string;
  lugar?: string;
  hora_y_lugar_salida?: string;
  hora_y_lugar_llegada?: string;
  que_llevar?: string;
  precio_info_pago?: string;
  info_familias?: string;
  // Campos custom
  camposCustom?: CampoCustomCircular[];
}
