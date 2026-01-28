'use client'

import { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Clock, LogOut } from 'lucide-react'

interface InactivityWarningModalProps {
  isOpen: boolean
  secondsRemaining: number
  onContinue: () => void
  onLogout: () => void
}

/**
 * Modal de advertencia que se muestra antes de cerrar la sesion por inactividad
 * Muestra un countdown y permite al usuario extender su sesion
 */
export function InactivityWarningModal({
  isOpen,
  secondsRemaining,
  onContinue,
  onLogout
}: InactivityWarningModalProps) {
  // Estado local para animacion del countdown
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // Animacion de pulso cada segundo
  useEffect(() => {
    if (isOpen && secondsRemaining <= 30) {
      setPulseAnimation(true)
      const timer = setTimeout(() => setPulseAnimation(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen, secondsRemaining])

  // Formatear tiempo restante
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${secs} segundos`
  }

  // Color del countdown segun urgencia
  const getCountdownColor = (): string => {
    if (secondsRemaining <= 10) return 'text-red-600 dark:text-red-400'
    if (secondsRemaining <= 30) return 'text-amber-600 dark:text-amber-400'
    return 'text-blue-600 dark:text-blue-400'
  }

  // Prevenir scroll del body cuando el modal esta abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AlertDialog open={isOpen} onOpenChange={() => {}}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="space-y-4">
          {/* Icono con animacion */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock
              className={`h-8 w-8 text-amber-600 dark:text-amber-400 transition-transform ${
                pulseAnimation ? 'scale-110' : 'scale-100'
              }`}
            />
          </div>

          <AlertDialogTitle className="text-center text-xl">
            Sigues ahi?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-base space-y-3">
            <p>
              Tu sesion se cerrara automaticamente por inactividad en:
            </p>

            {/* Countdown grande y destacado */}
            <p
              className={`text-3xl font-bold tabular-nums transition-all ${getCountdownColor()} ${
                pulseAnimation ? 'scale-105' : 'scale-100'
              }`}
            >
              {formatTime(secondsRemaining)}
            </p>

            <p className="text-sm text-muted-foreground">
              Haz clic en &quot;Continuar conectado&quot; para mantener tu sesion activa.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel
            onClick={onLogout}
            className="order-2 sm:order-1 flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onContinue}
            className="order-1 sm:order-2"
            autoFocus
          >
            Continuar conectado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default InactivityWarningModal
