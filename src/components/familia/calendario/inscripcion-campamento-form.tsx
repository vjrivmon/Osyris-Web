'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Info,
  Heart,
  Utensils,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Componente de tooltip para campos de formulario
interface FieldTooltipProps {
  content: string
  label?: string
}

function FieldTooltip({ content, label }: FieldTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-1"
          aria-label={label ? `Informacion sobre ${label}` : 'Mas informacion'}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface DatosSaludPrellenados {
  alergias?: string
  intolerancias?: string
  medicacion?: string
  dieta?: string
  observaciones_medicas?: string
}

interface InscripcionCampamentoFormProps {
  educandoId: number
  educandoNombre: string
  actividadId: number
  actividadTitulo: string
  precio?: number
  datosSaludPrellenados?: DatosSaludPrellenados
  estadoActual?: 'pendiente' | 'inscrito' | 'no_asiste'
  onInscribir: (datos: InscripcionDatos) => Promise<boolean>
  onNoAsiste: (motivo?: string) => Promise<boolean>
  className?: string
}

export interface InscripcionDatos {
  educandoId: number
  actividadId: number
  asistira: boolean
  datosConfirmados: boolean
  alergias?: string
  intolerancias?: string
  medicacion?: string
  dieta?: string
  observaciones?: string
}

export function InscripcionCampamentoForm({
  educandoId,
  educandoNombre,
  actividadId,
  actividadTitulo,
  precio,
  datosSaludPrellenados,
  estadoActual = 'pendiente',
  onInscribir,
  onNoAsiste,
  className
}: InscripcionCampamentoFormProps) {
  const [asistira, setAsistira] = useState<'si' | 'no' | null>(null)
  const [asistiraError, setAsistiraError] = useState(false)
  const [asistiraTouched, setAsistiraTouched] = useState(false)
  const [motivoNoAsiste, setMotivoNoAsiste] = useState('')
  const [alergias, setAlergias] = useState(datosSaludPrellenados?.alergias || '')
  const [intolerancias, setIntolerancias] = useState(datosSaludPrellenados?.intolerancias || '')
  const [medicacion, setMedicacion] = useState(datosSaludPrellenados?.medicacion || '')
  const [dieta, setDieta] = useState(datosSaludPrellenados?.dieta || '')
  const [observaciones, setObservaciones] = useState(datosSaludPrellenados?.observaciones_medicas || '')
  const [datosConfirmados, setDatosConfirmados] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estado, setEstado] = useState(estadoActual)

  useEffect(() => {
    if (datosSaludPrellenados) {
      setAlergias(datosSaludPrellenados.alergias || '')
      setIntolerancias(datosSaludPrellenados.intolerancias || '')
      setMedicacion(datosSaludPrellenados.medicacion || '')
      setDieta(datosSaludPrellenados.dieta || '')
      setObservaciones(datosSaludPrellenados.observaciones_medicas || '')
    }
  }, [datosSaludPrellenados])

  // Limpiar error de asistira cuando se selecciona una opcion
  const handleAsistiraChange = (value: 'si' | 'no') => {
    setAsistira(value)
    setAsistiraError(false)
    setAsistiraTouched(true)
  }

  const handleSubmit = async () => {
    // Validar campo obligatorio de campamento/asistencia
    if (!asistira) {
      setAsistiraError(true)
      setAsistiraTouched(true)
      setError('Debes indicar si asistira al campamento')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (asistira === 'no') {
        const exito = await onNoAsiste(motivoNoAsiste)
        if (exito) {
          setEstado('no_asiste')
        } else {
          setError('Error al guardar. Intentalo de nuevo.')
        }
      } else {
        if (!datosConfirmados) {
          setError('Debes confirmar que los datos son correctos')
          setIsSubmitting(false)
          return
        }

        const datos: InscripcionDatos = {
          educandoId,
          actividadId,
          asistira: true,
          datosConfirmados,
          alergias,
          intolerancias,
          medicacion,
          dieta,
          observaciones
        }

        const exito = await onInscribir(datos)
        if (exito) {
          setEstado('inscrito')
        } else {
          setError('Error al inscribir. Intentalo de nuevo.')
        }
      }
    } catch {
      setError('Error inesperado. Intentalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (estado === 'inscrito') {
    return (
      <Card className={cn('border-green-200 bg-green-50', className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                {educandoNombre} esta inscrito/a
              </p>
              <p className="text-sm text-green-700">
                Inscripcion al {actividadTitulo} completada
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (estado === 'no_asiste') {
    return (
      <Card className={cn('border-gray-200 bg-gray-50', className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-gray-500" />
            <div>
              <p className="font-medium text-gray-700">
                {educandoNombre} no asistira
              </p>
              <p className="text-sm text-gray-600">
                Has indicado que no asistira al {actividadTitulo}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEstado('pendiente')}
            className="mt-3"
          >
            Cambiar respuesta
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Inscripcion al Campamento
        </CardTitle>
        <CardDescription>
          Para: {educandoNombre}
          {precio && <span className="ml-2 font-medium">| Precio: {precio}EUR</span>}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className={cn(
            "text-base font-medium",
            asistiraError && "text-destructive"
          )}>
            Asistira {educandoNombre} al campamento? <span className="text-destructive">*</span>
          </Label>
          <div className={cn(
            "p-3 rounded-lg border-2 transition-colors",
            asistiraError
              ? "border-destructive bg-destructive/5"
              : asistira
                ? "border-primary/30 bg-primary/5"
                : "border-muted"
          )}>
            <RadioGroup
              value={asistira || ''}
              onValueChange={handleAsistiraChange}
              className="flex gap-6"
              aria-required="true"
              aria-invalid={asistiraError}
              aria-describedby={asistiraError ? "asistira-error" : undefined}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="si"
                  id="asiste-si"
                  className={cn(asistiraError && "border-destructive")}
                />
                <Label htmlFor="asiste-si" className="cursor-pointer font-medium">Si, asistira</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="no"
                  id="asiste-no"
                  className={cn(asistiraError && "border-destructive")}
                />
                <Label htmlFor="asiste-no" className="cursor-pointer font-medium">No podra asistir</Label>
              </div>
            </RadioGroup>
          </div>
          {asistiraError && (
            <p id="asistira-error" className="text-sm text-destructive flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Este campo es obligatorio. Selecciona una opcion.
            </p>
          )}
        </div>

        {asistira === 'no' && (
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo (opcional)</Label>
            <Textarea
              id="motivo"
              placeholder="Indica el motivo por el que no asistira..."
              value={motivoNoAsiste}
              onChange={(e) => setMotivoNoAsiste(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {asistira === 'si' && (
          <>
            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Heart className="h-5 w-5 text-red-500" />
                Datos de Salud
              </div>

              {datosSaludPrellenados && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Estos datos se han prellenado desde la ficha medica.
                    Si han cambiado, actualiza aqui.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="alergias">Alergias</Label>
                    <FieldTooltip
                      content="Alergias alimentarias, medicamentosas, ambientales u otras que debamos conocer durante el campamento"
                      label="Alergias"
                    />
                  </div>
                  <Input
                    id="alergias"
                    placeholder="Ej: Polen, acaros..."
                    value={alergias}
                    onChange={(e) => setAlergias(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="intolerancias">Intolerancias alimentarias</Label>
                    <FieldTooltip
                      content="Intolerancias a alimentos especificos que debamos tener en cuenta para la elaboracion de menus"
                      label="Intolerancias alimentarias"
                    />
                  </div>
                  <Input
                    id="intolerancias"
                    placeholder="Ej: Lactosa, gluten..."
                    value={intolerancias}
                    onChange={(e) => setIntolerancias(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="medicacion">Medicacion que toma</Label>
                  <FieldTooltip
                    content="Medicamentos que el educando toma regularmente. Indicar nombre del medicamento, dosis y frecuencia"
                    label="Medicacion"
                  />
                </div>
                <Input
                  id="medicacion"
                  placeholder="Indicar medicamentos y dosis si aplica"
                  value={medicacion}
                  onChange={(e) => setMedicacion(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Utensils className="h-5 w-5 text-orange-500" />
                Dieta
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="dieta">Dieta especial</Label>
                  <FieldTooltip
                    content="Indicar si sigue una dieta especifica por motivos de salud, religiosos o de preferencia personal"
                    label="Dieta especial"
                  />
                </div>
                <Input
                  id="dieta"
                  placeholder="Ej: Vegetariano, vegano, sin cerdo..."
                  value={dieta}
                  onChange={(e) => setDieta(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="observaciones">Otras observaciones</Label>
                <FieldTooltip
                  content="Cualquier otra informacion importante que los monitores deban conocer durante el campamento"
                  label="Otras observaciones"
                />
              </div>
              <Textarea
                id="observaciones"
                placeholder="Cualquier otra informacion relevante para el campamento..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="datos-confirmados"
                checked={datosConfirmados}
                onCheckedChange={(checked) => setDatosConfirmados(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="datos-confirmados"
                  className="text-sm font-medium cursor-pointer"
                >
                  Confirmo que los datos son correctos
                </Label>
                <p className="text-xs text-gray-600">
                  Al marcar esta casilla, confirmas que la informacion proporcionada es correcta
                  y estas de acuerdo con la inscripcion.
                </p>
              </div>
            </div>
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (asistira === 'si' && !datosConfirmados)}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : asistira === 'si' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Inscribir al campamento
            </>
          ) : asistira === 'no' ? (
            <>
              <XCircle className="h-4 w-4 mr-2" />
              Confirmar no asistencia
            </>
          ) : (
            'Selecciona una opcion'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
