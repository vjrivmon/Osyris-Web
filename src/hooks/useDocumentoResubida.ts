/**
 * Hook: useDocumentoResubida
 *
 * Gestiona la lógica de resubida de documentos:
 * - Verificación de límite 24h
 * - Subida de nueva versión
 * - Solicitud de desbloqueo
 * - Estado de carga y errores
 */

import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Tipos
export interface LimiteSubidaResult {
  puedeSubir: boolean;
  subidasHoy: number;
  limiteDiario: number;
  tiempoRestante: number | null; // ms
  proximaSubida: string | null;
  ultimaSubida: string | null;
  tieneVersionAnterior: boolean;
  versionActual: number;
}

export interface HistorialVersion {
  id: number;
  version: number;
  archivo_nombre: string;
  fecha_subida: string;
  estado: 'reemplazado' | 'rechazado' | 'restaurado';
  motivo: string | null;
  subido_por: string;
}

export interface HistorialResult {
  documentoActual: {
    id: number;
    titulo: string;
    archivo_nombre: string;
    version: number;
    fecha_subida: string;
    estado: string;
  };
  historial: HistorialVersion[];
  totalVersiones: number;
}

export interface TipoDocumentoConfig {
  tipo: string;
  nombre: string;
  prefijo: string;
  tienePlantilla: boolean;
  plantilla: string | null;
  obligatorio: boolean;
  edadMinima: number | null;
  requiereTutorial: boolean;
}

export interface SolicitudDesbloqueoResult {
  id: number;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_solicitud: string;
}

export interface LimiteByTipoResult extends LimiteSubidaResult {
  documentoId: number | null;
  esPrimerSubida: boolean;
}

export interface UseDocumentoResubidaReturn {
  // Estado
  loading: boolean;
  error: string | null;
  limiteInfo: LimiteSubidaResult | null;
  historial: HistorialResult | null;
  tipoConfig: TipoDocumentoConfig | null;

  // Acciones
  verificarLimite: (documentoId: number | string) => Promise<LimiteSubidaResult | null>;
  verificarLimiteByTipo: (educandoId: number, tipoDocumento: string) => Promise<LimiteByTipoResult | null>;
  subirNuevaVersion: (documentoId: number | string, file: File) => Promise<boolean>;
  subirDocumentoByTipo: (educandoId: number, tipoDocumento: string, file: File) => Promise<boolean>;
  solicitarDesbloqueo: (documentoId: number | string, motivo?: string) => Promise<SolicitudDesbloqueoResult | null>;
  obtenerHistorial: (documentoId: number | string) => Promise<HistorialResult | null>;
  obtenerConfigTipo: (tipoDocumento: string) => Promise<TipoDocumentoConfig | null>;
  limpiarError: () => void;

  // Utilidades
  formatearTiempoRestante: (ms: number) => string;
}

export function useDocumentoResubida(): UseDocumentoResubidaReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limiteInfo, setLimiteInfo] = useState<LimiteSubidaResult | null>(null);
  const [historial, setHistorial] = useState<HistorialResult | null>(null);
  const [tipoConfig, setTipoConfig] = useState<TipoDocumentoConfig | null>(null);

  // Helper para obtener token
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || localStorage.getItem('familia_token');
    }
    return null;
  }, []);

  // Helper para headers
  const getHeaders = useCallback(() => {
    const token = getToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  }, [getToken]);

  /**
   * Verifica si un documento puede ser subido (límite 24h)
   */
  const verificarLimite = useCallback(async (documentoId: number | string): Promise<LimiteSubidaResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/documentos-resubida/${documentoId}/puede-subir`,
        { headers: getHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar límite de subida');
      }

      setLimiteInfo(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Verifica si un documento puede ser subido usando educando_id y tipo
   * Útil cuando no tenemos el ID del documento pero sí el tipo
   */
  const verificarLimiteByTipo = useCallback(async (
    educandoId: number,
    tipoDocumento: string
  ): Promise<LimiteByTipoResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/documentos-resubida/educando/${educandoId}/tipo/${tipoDocumento}/puede-subir`,
        { headers: getHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar límite de subida');
      }

      setLimiteInfo(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Sube una nueva versión del documento
   * Usa el endpoint existente de Google Drive
   */
  const subirNuevaVersion = useCallback(async (
    documentoId: number | string,
    file: File
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Primero verificar límite
      const limite = await verificarLimite(documentoId);
      if (!limite?.puedeSubir) {
        throw new Error('Has alcanzado el límite de subidas por hoy. Solicita desbloqueo si necesitas subir de nuevo.');
      }

      // Preparar FormData
      const formData = new FormData();
      formData.append('archivo', file);

      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/drive/documentos/${documentoId}/reemplazar`,
        {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Si es error de límite (429), mensaje especial
        if (response.status === 429) {
          throw new Error('Has alcanzado el límite de 1 subida por día para este documento. Puedes solicitar desbloqueo si necesitas corregirlo urgentemente.');
        }
        throw new Error(data.message || 'Error al subir documento');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getToken, verificarLimite]);

  /**
   * Sube un documento usando educandoId y tipoDocumento
   * Esta función usa el endpoint de upload que maneja tanto nuevos como reemplazos
   * Usa limiteInfo ya cargado para evitar verificaciones adicionales
   */
  const subirDocumentoByTipo = useCallback(async (
    educandoId: number,
    tipoDocumento: string,
    file: File
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Usar limiteInfo ya cargado si está disponible
      if (limiteInfo && !limiteInfo.puedeSubir) {
        throw new Error('Has alcanzado el límite de subidas por hoy. Solicita desbloqueo si necesitas subir de nuevo.');
      }

      // Preparar FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('educandoId', educandoId.toString());
      formData.append('tipoDocumento', tipoDocumento);

      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/drive/documento/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Si es error de límite (429), mensaje especial
        if (response.status === 429) {
          throw new Error('Has alcanzado el límite de 1 subida por día para este documento. Puedes solicitar desbloqueo si necesitas corregirlo urgentemente.');
        }
        throw new Error(data.message || 'Error al subir documento');
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getToken, limiteInfo]);

  /**
   * Solicita desbloqueo del límite de 24h
   */
  const solicitarDesbloqueo = useCallback(async (
    documentoId: number | string,
    motivo?: string
  ): Promise<SolicitudDesbloqueoResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/solicitudes-desbloqueo`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            documentoId: Number(documentoId),
            motivo: motivo || null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear solicitud de desbloqueo');
      }

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Obtiene el historial de versiones de un documento
   */
  const obtenerHistorial = useCallback(async (documentoId: number | string): Promise<HistorialResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/documentos-resubida/${documentoId}/historial`,
        { headers: getHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener historial');
      }

      setHistorial(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Obtiene la configuración de un tipo de documento
   */
  const obtenerConfigTipo = useCallback(async (tipoDocumento: string): Promise<TipoDocumentoConfig | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/documentos-resubida/tipo/${tipoDocumento}/config`,
        { headers: getHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener configuración');
      }

      setTipoConfig(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Limpia el error actual
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Formatea el tiempo restante en formato legible
   */
  const formatearTiempoRestante = useCallback((ms: number): string => {
    if (ms <= 0) return 'Ya puedes subir';

    const segundos = Math.floor(ms / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);

    if (horas > 0) {
      const minutosRestantes = minutos % 60;
      return `${horas}h ${minutosRestantes}m`;
    }
    if (minutos > 0) {
      return `${minutos}m`;
    }
    return `${segundos}s`;
  }, []);

  return {
    // Estado
    loading,
    error,
    limiteInfo,
    historial,
    tipoConfig,

    // Acciones
    verificarLimite,
    verificarLimiteByTipo,
    subirNuevaVersion,
    subirDocumentoByTipo,
    solicitarDesbloqueo,
    obtenerHistorial,
    obtenerConfigTipo,
    limpiarError,

    // Utilidades
    formatearTiempoRestante
  };
}

export default useDocumentoResubida;
