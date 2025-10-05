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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Si no está en modo edición, no mostrar nada
  if (!isEditMode) {
    return null;
  }

  // Manejar guardar - ahora abre el modal de confirmación
  const handleSaveClick = () => {
    setShowSaveDialog(true);
  };

  // Confirmar y guardar los cambios
  const confirmSave = async () => {
    setShowSaveDialog(false);
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
    discardChanges();
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
            onClick={handleSaveClick}
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

          {/* Botón Descartar con confirmación */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
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
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Descartar todos los cambios?</AlertDialogTitle>
                <AlertDialogDescription>
                  Estás a punto de descartar <strong>{changeCount} cambio{changeCount !== 1 ? 's' : ''}</strong> sin guardar.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-3 py-2">
                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-orange-800 dark:text-orange-200">
                      <strong>Esta acción no se puede deshacer.</strong> Todos los cambios que hayas realizado se perderán permanentemente.
                    </div>
                  </div>
                </div>

                {pendingChanges.size > 0 && (
                  <div className="text-sm">
                    <p className="font-medium mb-2 text-gray-900 dark:text-gray-100">Cambios que se descartarán:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                      {Array.from(pendingChanges.values()).map((change, idx) => (
                        <li key={idx}>
                          {change.identificador}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDiscard}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Descartar cambios
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Modal de confirmación de guardado */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-green-600" />
              Revisar cambios antes de guardar
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de guardar <strong>{changeCount} cambio{changeCount !== 1 ? 's' : ''}</strong>. Revisa los elementos modificados antes de confirmar:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-2">
            {pendingChanges.size > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 className="font-semibold text-sm mb-3 text-blue-900 dark:text-blue-100">Contenido que se guardará:</h4>
                <div className="space-y-2">
                  {Array.from(pendingChanges.values()).map((change, idx) => {
                    // Crear nombres más user-friendly
                    const friendlyNames: Record<string, string> = {
                      'hero-title': 'Título principal',
                      'hero-subtitle': 'Subtítulo',
                      'timeline-events': 'Eventos de la línea del tiempo',
                      'valores-list': 'Lista de valores',
                      'testimonials-list': 'Testimonios',
                      'metodo-scout-items': 'Puntos del método scout',
                      'about-description': 'Descripción',
                      'contact-info': 'Información de contacto'
                    }

                    const displayName = friendlyNames[change.identificador] || change.identificador

                    return (
                      <div key={idx} className="bg-white dark:bg-gray-900 rounded p-3 text-sm border border-blue-100 dark:border-blue-900">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {displayName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Sección: {change.seccion}
                            </div>
                            {change.tipo !== 'json' && change.contenido && (
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded max-h-20 overflow-y-auto">
                                {String(change.contenido).substring(0, 150)}
                                {String(change.contenido).length > 150 && '...'}
                              </div>
                            )}
                            {change.tipo === 'json' && (
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 italic">
                                Lista de elementos editables
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  Los cambios se guardarán en la base de datos y serán visibles inmediatamente en la página.
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Confirmar y guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
