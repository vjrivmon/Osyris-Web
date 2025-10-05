'use client'

import { useEffect, useState, useRef } from 'react'
import { useEditMode } from '@/contexts/EditModeContext'
import { useAuth } from '@/hooks/useAuth'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, CheckCircle2, Shield, Save } from 'lucide-react'

/**
 * Modal de advertencia que aparece la PRIMERA VEZ que el administrador activa el modo edición
 * en cada sesión de login. Muestra buenas prácticas y advertencias importantes.
 *
 * Persiste entre recargas de página (sessionStorage) pero se resetea al cerrar sesión,
 * garantizando que el aviso aparezca cada vez que el usuario se autentique de nuevo.
 */
export function EditModeWarning() {
  const { isEditMode } = useEditMode()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const prevEditMode = useRef(false)

  // Generar clave única por usuario
  const getStorageKey = () => {
    return user?.id ? `editModeWarningShown_${user.id}` : null
  }

  useEffect(() => {
    const storageKey = getStorageKey()

    // Si no hay usuario, no hacer nada
    if (!storageKey) return

    // Detectar cuando se activa el modo edición (transición de false a true)
    if (isEditMode && !prevEditMode.current) {
      // Verificar si ya se mostró el aviso para este usuario
      const warningShown = sessionStorage.getItem(storageKey)

      if (!warningShown) {
        setShowWarning(true)
        // Marcar que ya se mostró para este usuario en esta sesión
        sessionStorage.setItem(storageKey, '1')
      }
    }

    // Actualizar el valor anterior
    prevEditMode.current = isEditMode
  }, [isEditMode, user])

  // Limpiar sessionStorage SOLO cuando hay un logout real (no durante carga inicial)
  useEffect(() => {
    // Solo limpiar si la autenticación ya terminó de cargar Y el usuario no está autenticado
    if (!isLoading && !isAuthenticated) {
      // Usuario ha cerrado sesión, limpiar todos los flags de advertencia
      Object.keys(sessionStorage)
        .filter(key => key.startsWith('editModeWarningShown_'))
        .forEach(key => sessionStorage.removeItem(key))
    }
  }, [isAuthenticated, isLoading])

  const handleClose = () => {
    setShowWarning(false)
  }

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <AlertDialogTitle className="text-2xl">
              Modo de edición activado
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-foreground/80">
            Has entrado en el modo de edición de contenido. Por favor, ten en cuenta las siguientes recomendaciones para garantizar una experiencia óptima.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Advertencia principal */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Ten cuidado con lo que modificas
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Los cambios que realices afectarán directamente al contenido visible en la web.
                  Asegúrate de revisar cuidadosamente antes de guardar.
                </p>
              </div>
            </div>
          </div>

          {/* Buenas prácticas */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground/70 uppercase tracking-wider">
              Buenas prácticas
            </h4>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/80">
                  <strong>Revisa antes de guardar:</strong> Verifica que el contenido sea correcto,
                  sin errores ortográficos y que mantenga el formato adecuado.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/80">
                  <strong>Guarda con frecuencia:</strong> No pierdas tu trabajo. Guarda los cambios
                  periódicamente mientras editas contenido extenso.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/80">
                  <strong>Confirma tus cambios:</strong> El sistema te pedirá confirmación antes de
                  guardar o descartar. Lee los mensajes con atención.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Save className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground/80">
                  <strong>Barra de herramientas:</strong> Utiliza los botones de la barra inferior
                  para guardar o descartar todos tus cambios de forma segura.
                </p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleClose}
            className="bg-primary hover:bg-primary/90"
          >
            Entendido, continuar editando
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
