"use client";

/**
 * EditModeContext - STUB (Desactivado)
 *
 * Este contexto ha sido desactivado. Todas las funciones retornan valores
 * por defecto que mantienen la compatibilidad con el código existente
 * pero sin activar ninguna funcionalidad de edición.
 */

import React, { createContext, useContext } from 'react';

// Tipos (mantenidos para compatibilidad)
interface PendingChange {
  id: string;
  contentId: number;
  tipo: 'texto' | 'imagen' | 'html' | 'lista' | 'json';
  contenido: any;
  metadata?: any;
  timestamp: number;
  identificador?: string;
  seccion?: string;
}

interface EditModeContextType {
  // Estado - siempre desactivado
  isEditMode: boolean;
  pendingChanges: Map<string, PendingChange>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // Acciones - todas no-op
  toggleEditMode: () => void;
  enableEditMode: () => void;
  disableEditMode: () => void;
  addPendingChange: (change: PendingChange) => void;
  removePendingChange: (id: string) => void;
  savePendingChanges: () => Promise<boolean>;
  discardChanges: () => void;

  // Permisos - siempre falsos
  canEdit: boolean;
  isAdmin: boolean;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

// Stub Provider - simplemente pasa los children sin ninguna lógica
export function EditModeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Stub del hook - retorna valores por defecto seguros
// Manejo seguro para server-side rendering
export function useEditMode(): EditModeContextType {
  // Siempre usar useContext primero (regla de hooks)
  const context = useContext(EditModeContext);

  // Si tenemos contexto, usarlo
  if (context) {
    return context;
  }

  // Si no hay contexto (server-side o provider no montado), retornar valores por defecto
  return {
    // Estado - siempre desactivado
    isEditMode: false,
    pendingChanges: new Map(),
    isSaving: false,
    hasUnsavedChanges: false,

    // Acciones - todas no-op
    toggleEditMode: () => {},
    enableEditMode: () => {},
    disableEditMode: () => {},
    addPendingChange: () => {},
    removePendingChange: () => {},
    savePendingChanges: async () => true,
    discardChanges: () => {},

    // Permisos - siempre falsos
    canEdit: false,
    isAdmin: false,
  };
}

// Export del contexto para compatibilidad (casos avanzados que no deberían usarse más)
export { EditModeContext };