"use client";

/**
 * EditModeContext - Context global para el modo de edición
 * Gestiona el estado de edición en vivo para usuarios admin/editor
 */

import React, { createContext, useContext, useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Tipos
interface PendingChange {
  id: string;
  contentId: number;
  tipo: 'texto' | 'imagen' | 'html' | 'lista' | 'json';
  contenido: any;
  metadata?: any;
  timestamp: number;
}

interface EditModeContextType {
  // Estado
  isEditMode: boolean;
  pendingChanges: Map<string, PendingChange>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // Acciones
  toggleEditMode: () => void;
  enableEditMode: () => void;
  disableEditMode: () => void;
  addPendingChange: (change: PendingChange) => void;
  removePendingChange: (id: string) => void;
  savePendingChanges: () => Promise<boolean>;
  discardChanges: () => void;

  // Permisos
  canEdit: boolean;
  isAdmin: boolean;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

// Componente interno que maneja los search params
function EditModeUrlHandler({
  canEdit,
  onEnableEditMode
}: {
  canEdit: boolean;
  onEnableEditMode: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedEditModeParam = React.useRef(false);

  useEffect(() => {
    // Solo procesar el parámetro una vez por sesión
    if (searchParams?.get('editMode') === 'true' && canEdit && !processedEditModeParam.current) {
      console.log('🚀 Activando modo edición automáticamente desde admin panel');
      onEnableEditMode();
      processedEditModeParam.current = true;

      // Limpiar el query param de la URL para que quede limpia
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, canEdit, router, onEnableEditMode]);

  return null;
}

// Provider interno sin Suspense
function EditModeProviderInner({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();

  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Permisos - SOLO administradores pueden editar
  const isAdmin = user?.rol === 'admin';
  const canEdit = Boolean(isAdmin);

  // Calcular si hay cambios sin guardar
  const hasUnsavedChanges = pendingChanges.size > 0;

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para editar');
      return;
    }
    setIsEditMode(prev => !prev);
  }, [canEdit]);

  // Habilitar modo edición
  const enableEditMode = useCallback(() => {
    if (!canEdit) {
      console.warn('Usuario no tiene permisos para editar');
      return;
    }
    setIsEditMode(true);
  }, [canEdit]);

  // Deshabilitar modo edición
  const disableEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  // Añadir cambio pendiente
  const addPendingChange = useCallback((change: PendingChange) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.set(change.id, change);
      return newMap;
    });
  }, []);

  // Eliminar cambio pendiente
  const removePendingChange = useCallback((id: string) => {
    setPendingChanges(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  // Guardar todos los cambios pendientes
  const savePendingChanges = useCallback(async (): Promise<boolean> => {
    if (pendingChanges.size === 0) {
      console.log('No hay cambios pendientes para guardar');
      return true;
    }

    if (!token) {
      console.error('No hay token de autenticación');
      return false;
    }

    setIsSaving(true);

    try {
      const changes = Array.from(pendingChanges.values());
      const results = await Promise.all(
        changes.map(async (change) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${change.contentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              tipo: change.tipo,
              contenido: change.contenido,
              metadata: change.metadata || {}
            })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar cambio');
          }

          return response.json();
        })
      );

      console.log(`✅ ${results.length} cambios guardados exitosamente`);

      // Limpiar cambios pendientes
      setPendingChanges(new Map());

      return true;

    } catch (error) {
      console.error('Error al guardar cambios:', error);
      return false;

    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges, token]);

  // Descartar todos los cambios
  const discardChanges = useCallback(() => {
    setPendingChanges(new Map());
    console.log('Cambios descartados');
  }, []);

  // Desactivar modo edición cuando el usuario cierra sesión
  useEffect(() => {
    if (!user) {
      setIsEditMode(false);
      setPendingChanges(new Map());
    }
  }, [user]);

  // Advertir antes de cerrar la página si hay cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Log cuando cambia el modo edición (debugging)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 Modo edición: ${isEditMode ? 'ACTIVADO' : 'DESACTIVADO'}`);
    }
  }, [isEditMode]);

  const value: EditModeContextType = {
    // Estado
    isEditMode,
    pendingChanges,
    isSaving,
    hasUnsavedChanges,

    // Acciones
    toggleEditMode,
    enableEditMode,
    disableEditMode,
    addPendingChange,
    removePendingChange,
    savePendingChanges,
    discardChanges,

    // Permisos
    canEdit,
    isAdmin
  };

  return (
    <EditModeContext.Provider value={value}>
      <Suspense fallback={null}>
        <EditModeUrlHandler canEdit={canEdit} onEnableEditMode={enableEditMode} />
      </Suspense>
      {children}
    </EditModeContext.Provider>
  );
}

// Provider público con Suspense
export function EditModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EditModeProviderInner>{children}</EditModeProviderInner>
    </Suspense>
  );
}

// Hook personalizado para usar el contexto
export function useEditMode() {
  const context = useContext(EditModeContext);

  if (context === undefined) {
    throw new Error('useEditMode debe ser usado dentro de un EditModeProvider');
  }

  return context;
}

// Export del contexto para casos avanzados
export { EditModeContext };
