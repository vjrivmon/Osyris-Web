'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmacionReunionFormProps {
  educandoId: number
  educandoNombre: string
  actividadId: number
  estadoActual?: 'confirmado' | 'no_asiste' | 'pendiente'
  onConfirmar: (educandoId: number, asistira: boolean, comentarios?: string) => Promise<boolean>
  className?: string
}

export function ConfirmacionReunionForm({
  educandoId,
  educandoNombre,
  actividadId,
  estadoActual = 'pendiente',
  onConfirmar,
  className
}: ConfirmacionReunionFormProps) {
  const [comentarios, setComentarios] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [estado, setEstado] = useState(estadoActual)
  const [error, setError] = useState<string | null>(null)

  const handleConfirmacion = async (asistira: boolean) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const exito = await onConfirmar(educandoId, asistira, comentarios)
      if (exito) {
        setEstado(asistira ? 'confirmado' : 'no_asiste')
      } else {
        setError('Error al guardar la confirmacion. Intentalo de nuevo.')
      }
    } catch {
      setError('Error inesperado. Intentalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (estado === 'confirmado' || estado === 'no_asiste') {
    return (
      <div className={cn('p-4 rounded-lg border', className)}>
        <Alert className={estado === 'confirmado' ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'}>
          <AlertDescription className={estado === 'confirmado' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
            {estado === 'confirmado' ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {educandoNombre} asistira a la reunion
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {educandoNombre} no asistira a la reunion
              </span>
            )}
          </AlertDescription>
        </Alert>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEstado('pendiente')}
          className="mt-2 text-muted-foreground"
        >
          Cambiar respuesta
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4 p-4 rounded-lg border', className)}>
      <div>
        <p className="font-medium mb-2">Asistira {educandoNombre} a la reunion?</p>
      </div>

      <div>
        <Label htmlFor={`comentarios-${educandoId}`} className="text-sm text-muted-foreground">
          Comentario (opcional)
        </Label>
        <Textarea
          id={`comentarios-${educandoId}`}
          placeholder="Algun comentario o informacion adicional..."
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          className="mt-1"
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => handleConfirmacion(true)}
          disabled={isSubmitting}
          className="flex-1 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Si, asistire
        </Button>
        <Button
          onClick={() => handleConfirmacion(false)}
          disabled={isSubmitting}
          variant="outline"
          className="flex-1 border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          No podre asistir
        </Button>
      </div>
    </div>
  )
}

interface ConfirmacionReunionCompactProps {
  educandoId: number
  estadoActual?: 'confirmado' | 'no_asiste' | 'pendiente'
  onConfirmar: (educandoId: number, asistira: boolean) => Promise<boolean>
  className?: string
}

export function ConfirmacionReunionCompact({
  educandoId,
  estadoActual = 'pendiente',
  onConfirmar,
  className
}: ConfirmacionReunionCompactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [estado, setEstado] = useState(estadoActual)

  const handleConfirmacion = async (asistira: boolean) => {
    setIsSubmitting(true)
    try {
      const exito = await onConfirmar(educandoId, asistira)
      if (exito) {
        setEstado(asistira ? 'confirmado' : 'no_asiste')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (estado === 'confirmado') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn('text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20', className)}
        onClick={() => setEstado('pendiente')}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Asiste
      </Button>
    )
  }

  if (estado === 'no_asiste') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn('text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20', className)}
        onClick={() => setEstado('pendiente')}
      >
        <XCircle className="h-4 w-4 mr-1" />
        No asiste
      </Button>
    )
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleConfirmacion(true)}
        disabled={isSubmitting}
        className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-1"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleConfirmacion(false)}
        disabled={isSubmitting}
        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-1"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
