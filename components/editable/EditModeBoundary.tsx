'use client'

import { useEditMode } from '@/contexts/EditModeContext'

/**
 * Componente que muestra un borde rojo alrededor de toda la pantalla
 * cuando el modo de edición está activo, advirtiendo visualmente al administrador
 */
export function EditModeBoundary() {
  const { isEditMode } = useEditMode()

  if (!isEditMode) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998] border-[16px] border-red-600/60 shadow-[0_0_60px_rgba(220,38,38,1),inset_0_0_40px_rgba(220,38,38,0.4)] animate-pulse"
      aria-hidden="true"
    />
  )
}
