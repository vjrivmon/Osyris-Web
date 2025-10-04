"use client";

/**
 * EditToolbar - Barra de herramientas flotante para modo edición
 * Muestra botones de guardar, cancelar, contador de cambios, etc.
 */

import React, { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import {
  Save,
  X,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function EditToolbar() {
  const {
    isEditMode,
    pendingChanges,
    hasUnsavedChanges,
    isSaving,
    savePendingChanges,
    discardChanges
  } = useEditMode();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Si no está en modo edición, no mostrar nada
  if (!isEditMode) {
    return null;
  }

  // Manejar guardar
  const handleSave = async () => {
    const success = await savePendingChanges();

    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setErrorMessage('Error al guardar los cambios. Inténtalo de nuevo.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  // Manejar descartar
  const handleDiscard = () => {
    if (confirm('¿Estás seguro de que quieres descartar todos los cambios?')) {
      discardChanges();
    }
  };

  const changeCount = pendingChanges.size;

  return (
    <>
      {/* Toolbar principal */}
      <div className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]',
        'bg-white dark:bg-gray-800 shadow-2xl rounded-full',
        'border-2 border-gray-200 dark:border-gray-700',
        'px-6 py-3',
        'flex items-center gap-4',
        'transition-all duration-300',
        'animate-in slide-in-from-bottom-5'
      )}>
        {/* Indicador de modo edición */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Modo Edición
          </span>
        </div>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

        {/* Contador de cambios */}
        <div className="flex items-center gap-2">
          {hasUnsavedChanges ? (
            <>
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {changeCount} cambio{changeCount !== 1 ? 's' : ''} pendiente{changeCount !== 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <>
              <Info className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Sin cambios
              </span>
            </>
          )}
        </div>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          {/* Botón Guardar */}
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full',
              'font-medium text-sm transition-all',
              hasUnsavedChanges && !isSaving
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
            title={hasUnsavedChanges ? 'Guardar cambios' : 'No hay cambios para guardar'}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </span>
          </button>

          {/* Botón Descartar */}
          <button
            onClick={handleDiscard}
            disabled={!hasUnsavedChanges || isSaving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full',
              'font-medium text-sm transition-all',
              hasUnsavedChanges && !isSaving
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
            title={hasUnsavedChanges ? 'Descartar cambios' : 'No hay cambios para descartar'}
          >
            <X className="w-4 h-4" />
            <span>Descartar</span>
          </button>
        </div>
      </div>

      {/* Notificación de éxito */}
      {showSuccess && (
        <div className={cn(
          'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
          'bg-green-500 text-white shadow-2xl rounded-lg',
          'px-6 py-3 flex items-center gap-3',
          'animate-in slide-in-from-bottom-5'
        )}>
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Cambios guardados exitosamente</span>
        </div>
      )}

      {/* Notificación de error */}
      {showError && (
        <div className={cn(
          'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
          'bg-red-500 text-white shadow-2xl rounded-lg',
          'px-6 py-4 flex items-start gap-3 max-w-md',
          'animate-in slide-in-from-bottom-5'
        )}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium mb-1">Error al guardar</div>
            <div className="text-sm opacity-90">{errorMessage}</div>
          </div>
          <button
            onClick={() => setShowError(false)}
            className="hover:bg-red-600 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
