/**
 * Hook: useSolicitudesDesbloqueo
 *
 * Gestiona las solicitudes de desbloqueo desde el panel scouter:
 * - Listar solicitudes de la sección
 * - Aprobar/rechazar solicitudes
 * - Contador de pendientes
 */

import { useState, useCallback, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Tipos
export interface SolicitudDesbloqueo {
  id: number;
  documento_id: number;
  educando_id: number;
  familiar_id: number;
  seccion_id: number;
  tipo_documento: string;
  titulo_documento: string;
  motivo: string | null;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  revisado_por: number | null;
  fecha_solicitud: string;
  fecha_revision: string | null;
  respuesta_scouter: string | null;
  // Datos relacionados
  educando_nombre?: string;
  educando_apellidos?: string;
  familiar_nombre?: string;
  familiar_apellidos?: string;
  familiar_email?: string;
  seccion_nombre?: string;
  revisado_por_nombre?: string;
  revisado_por_apellidos?: string;
}

export interface UseSolicitudesDesbloqueoReturn {
  // Estado
  solicitudes: SolicitudDesbloqueo[];
  pendientes: number;
  loading: boolean;
  error: string | null;

  // Acciones
  cargarSolicitudes: (seccionId: number, estado?: string) => Promise<void>;
  cargarTodasPendientes: () => Promise<void>;
  aprobar: (id: number, respuesta?: string) => Promise<boolean>;
  rechazar: (id: number, respuesta: string) => Promise<boolean>;
  obtenerContador: () => Promise<number>;
  limpiarError: () => void;

  // Utilidades
  refrescar: () => void;
}

export function useSolicitudesDesbloqueo(seccionIdInicial?: number): UseSolicitudesDesbloqueoReturn {
  const [solicitudes, setSolicitudes] = useState<SolicitudDesbloqueo[]>([]);
  const [pendientes, setPendientes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seccionActual, setSeccionActual] = useState<number | undefined>(seccionIdInicial);

  // Helper para obtener token
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
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
   * Carga solicitudes por sección
   */
  const cargarSolicitudes = useCallback(async (seccionId: number, estado?: string) => {
    setLoading(true);
    setError(null);
    setSeccionActual(seccionId);

    try {
      let url = `${API_URL}/api/solicitudes-desbloqueo/seccion/${seccionId}`;
      if (estado) {
        url += `?estado=${estado}`;
      }

      const response = await fetch(url, { headers: getHeaders() });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar solicitudes');
      }

      setSolicitudes(data.data.solicitudes);
      setPendientes(data.data.pendientes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Carga todas las solicitudes pendientes (solo admin)
   */
  const cargarTodasPendientes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/solicitudes-desbloqueo/pendientes`,
        { headers: getHeaders() }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar solicitudes');
      }

      setSolicitudes(data.data.solicitudes);
      setPendientes(data.data.pendientes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Aprueba una solicitud
   */
  const aprobar = useCallback(async (id: number, respuesta?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/solicitudes-desbloqueo/${id}/aprobar`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ respuesta: respuesta || null })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al aprobar solicitud');
      }

      // Actualizar lista local
      setSolicitudes(prev =>
        prev.map(s => s.id === id ? { ...s, estado: 'aprobada' as const } : s)
      );
      setPendientes(prev => Math.max(0, prev - 1));

      // Emitir evento para sincronizar otras instancias del hook
      window.dispatchEvent(new CustomEvent('solicitudes-update'));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Rechaza una solicitud
   */
  const rechazar = useCallback(async (id: number, respuesta: string): Promise<boolean> => {
    if (!respuesta || respuesta.trim() === '') {
      setError('Debes proporcionar un motivo para el rechazo');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/solicitudes-desbloqueo/${id}/rechazar`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ respuesta })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al rechazar solicitud');
      }

      // Actualizar lista local
      setSolicitudes(prev =>
        prev.map(s => s.id === id ? { ...s, estado: 'rechazada' as const } : s)
      );
      setPendientes(prev => Math.max(0, prev - 1));

      // Emitir evento para sincronizar otras instancias del hook
      window.dispatchEvent(new CustomEvent('solicitudes-update'));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Obtiene el contador de solicitudes pendientes
   */
  const obtenerContador = useCallback(async (): Promise<number> => {
    try {
      const response = await fetch(
        `${API_URL}/api/solicitudes-desbloqueo/contador`,
        { headers: getHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        return 0;
      }

      const count = data.data.pendientes;
      setPendientes(count);
      return count;
    } catch {
      return 0;
    }
  }, [getHeaders]);

  /**
   * Limpia el error actual
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresca las solicitudes actuales
   */
  const refrescar = useCallback(() => {
    if (seccionActual) {
      cargarSolicitudes(seccionActual);
    }
  }, [seccionActual, cargarSolicitudes]);

  // Cargar contador al montar y refrescar periódicamente
  useEffect(() => {
    obtenerContador();

    // Refrescar contador cada 30 segundos
    const interval = setInterval(() => {
      obtenerContador();
    }, 30000);

    // También refrescar cuando el usuario vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        obtenerContador();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Escuchar evento de sincronización de otras instancias
    const handleSolicitudesUpdate = () => {
      obtenerContador();
    };
    window.addEventListener('solicitudes-update', handleSolicitudesUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('solicitudes-update', handleSolicitudesUpdate);
    };
  }, [obtenerContador]);

  // Cargar solicitudes si se proporciona sección inicial
  useEffect(() => {
    if (seccionIdInicial) {
      cargarSolicitudes(seccionIdInicial);
    }
  }, [seccionIdInicial, cargarSolicitudes]);

  return {
    // Estado
    solicitudes,
    pendientes,
    loading,
    error,

    // Acciones
    cargarSolicitudes,
    cargarTodasPendientes,
    aprobar,
    rechazar,
    obtenerContador,
    limpiarError,

    // Utilidades
    refrescar
  };
}

export default useSolicitudesDesbloqueo;
