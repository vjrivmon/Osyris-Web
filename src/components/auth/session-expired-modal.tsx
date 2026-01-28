'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Clock, ShieldOff, LogOut } from 'lucide-react'
import type { SessionExpiredReason } from '@/lib/auth-utils'

interface SessionExpiredModalProps {
  isOpen: boolean
  reason: SessionExpiredReason
  onClose: () => void
}

/**
 * Modal que se muestra cuando la sesión del usuario ha expirado
 * Ofrece información clara sobre la razón y un botón para volver a iniciar sesión
 */
export function SessionExpiredModal({ isOpen, reason, onClose }: SessionExpiredModalProps) {
  const router = useRouter()

  // Configuración según la razón
  const config: Record<SessionExpiredReason, {
    icon: typeof Clock
    title: string
    description: string
    iconColor: string
  }> = {
    inactivity: {
      icon: Clock,
      title: 'Sesion cerrada por inactividad',
      description: 'Para proteger tu cuenta, hemos cerrado tu sesion despues de 15 minutos de inactividad.',
      iconColor: 'text-amber-500'
    },
    token_expired: {
      icon: Clock,
      title: 'Tu sesion ha expirado',
      description: 'Tu sesion ha caducado. Por favor, vuelve a iniciar sesion para continuar.',
      iconColor: 'text-blue-500'
    },
    token_invalid: {
      icon: ShieldOff,
      title: 'Sesion no valida',
      description: 'Tu sesion ya no es valida. Esto puede ocurrir si iniciaste sesion en otro dispositivo.',
      iconColor: 'text-red-500'
    },
    manual: {
      icon: LogOut,
      title: 'Has cerrado sesion',
      description: 'Has cerrado sesion correctamente.',
      iconColor: 'text-gray-500'
    }
  }

  const currentConfig = config[reason] || config.token_invalid
  const Icon = currentConfig.icon

  const handleLoginRedirect = () => {
    onClose()
    router.push('/login')
  }

  // Prevenir scroll del body cuando el modal está abierto
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
          {/* Icono centrado */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Icon className={`h-8 w-8 ${currentConfig.iconColor}`} />
          </div>

          <AlertDialogTitle className="text-center text-xl">
            {currentConfig.title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-base">
            {currentConfig.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 sm:justify-center">
          <AlertDialogAction
            onClick={handleLoginRedirect}
            className="w-full sm:w-auto min-w-[200px]"
          >
            Volver a iniciar sesion
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default SessionExpiredModal
