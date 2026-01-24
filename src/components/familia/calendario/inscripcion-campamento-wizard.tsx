'use client'
import { getApiUrl } from '@/lib/api-utils'

/**
 * Wizard de inscripcion a campamento (multi-paso)
 *
 * Flujo:
 * Paso 0: Seleccion asistencia (Si/No)
 * Paso 1: Informacion del campamento (readonly)
 * Paso 2: Formulario + Documentos
 * Paso 3: Confirmacion y recordatorios
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import {
  Check,
  X,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Euro,
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  User,
  Heart,
  Info,
  Eye,
  FileCheck,
  Receipt,
  RefreshCw
} from 'lucide-react'
import { useInscripcionCampamento } from '@/hooks/useInscripcionCampamento'
import { DocumentoViewerModal } from '@/components/familia/documento-viewer-modal'
import type { ActividadCampamento, ScoutHijo, DatosInscripcionCampamento } from '@/types/familia'

const API_URL = getApiUrl()

// Tipo para circulares de campamento
interface CircularCampamento {
  id: string
  name: string
  mimeType: string
  size?: string
  webViewLink?: string
  modifiedTime?: string
  tipoCampamento: string
}

interface InscripcionCampamentoWizardProps {
  isOpen: boolean
  onClose: () => void
  actividad: ActividadCampamento
  educando: ScoutHijo
  familiarData?: {
    nombre: string
    email: string
    telefono: string
  }
}

type WizardStep = 0 | 1 | 2 | 3

export function InscripcionCampamentoWizard({
  isOpen,
  onClose,
  actividad,
  educando,
  familiarData
}: InscripcionCampamentoWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(0)
  const [asistira, setAsistira] = useState<boolean | null>(null)
  const [infoConfirmada, setInfoConfirmada] = useState(false)
  const [datosConfirmados, setDatosConfirmados] = useState(false)
  const [recordatoriosChecked, setRecordatoriosChecked] = useState<Record<number, boolean>>({})

  // Estado para circulares
  const [circulares, setCirculares] = useState<CircularCampamento[]>([])
  const [circularesModalOpen, setCircularesModalOpen] = useState(false)
  const [loadingCirculares, setLoadingCirculares] = useState(false)
  const [circularDescargada, setCircularDescargada] = useState(false)

  // Datos del formulario
  const [formData, setFormData] = useState<Partial<DatosInscripcionCampamento>>({
    email_familiar: familiarData?.email || '',
    nombre_familiar: familiarData?.nombre || '',
    telefono_familiar: familiarData?.telefono || '',
    alergias: '',
    intolerancias: '',
    dieta_especial: ''
  })

  // Estado para modal de cancelación
  const [mostrarCancelacion, setMostrarCancelacion] = useState(false)
  const [motivoCancelacion, setMotivoCancelacion] = useState('')
  const [cancelando, setCancelando] = useState(false)

  // Estado para reinscripción (cuando está cancelado)
  const [reinscribiendo, setReinscribiendo] = useState(false)

  // Ref para distinguir entre carga inicial y navegación del usuario
  // Evita que el useEffect de inscripción interfiera cuando el usuario navega manualmente
  const isInitialLoadRef = useRef(true)

  // Estado para modal de visualización de documentos
  const [docViewerOpen, setDocViewerOpen] = useState(false)
  const [selectedDocumento, setSelectedDocumento] = useState<{ name: string; webViewLink?: string; id?: string } | null>(null)

  // Hook de inscripcion
  const {
    inscripcion,
    loading,
    error,
    inscribir,
    marcarNoAsiste,
    cancelarInscripcion,
    subirCircularFirmada,
    subirJustificantePago,
    descargarCircular: descargarCircularHook,
    datosSaludPrellenados,
    circularSubida,
    justificanteSubido,
    progreso
  } = useInscripcionCampamento({
    actividadId: typeof actividad.id === 'string' ? parseInt(actividad.id) : actividad.id,
    educandoId: educando.id,
    autoFetch: isOpen
  })

  // Obtener tipo de campamento desde titulo o configuracion
  const getTipoCampamento = () => {
    const titulo = actividad.titulo?.toUpperCase() || ''
    if (titulo.includes('NAVIDAD')) return 'NAVIDAD'
    if (titulo.includes('INICIO')) return 'INICIO'
    if (titulo.includes('PASCUA')) return 'PASCUA'
    if (titulo.includes('VERANO')) return 'VERANO'
    if (titulo.includes('ANIVERSARIO')) return 'ANIVERSARIO'
    return 'NAVIDAD' // Default
  }

  // Helper para obtener token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Cargar circulares desde API
  const fetchCirculares = useCallback(async () => {
    setLoadingCirculares(true)
    try {
      const tipo = getTipoCampamento()
      const res = await fetch(`${API_URL}/api/drive/campamento/${tipo}/circulares`, {
        headers: getAuthHeaders()
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setCirculares(data.data || [])
        }
      }
    } catch (err) {
      console.error('Error fetching circulares:', err)
    } finally {
      setLoadingCirculares(false)
    }
  }, [actividad])

  // Descargar circular usando el mismo endpoint que plantillas
  const downloadCircular = async (fileId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/drive/plantilla/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al descargar circular')
      }

      // Crear blob y descargar
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setCircularDescargada(true)
      return true
    } catch (err) {
      console.error('Error descargando circular:', err)
      return false
    }
  }

  // Cargar circulares cuando se abre el modal
  useEffect(() => {
    if (circularesModalOpen && circulares.length === 0) {
      fetchCirculares()
    }
  }, [circularesModalOpen, circulares.length, fetchCirculares])

  // Resetear el ref de carga inicial cuando se abre el wizard
  // Esto permite que el useEffect de inscripción funcione correctamente si el usuario
  // cierra y vuelve a abrir el wizard
  useEffect(() => {
    if (isOpen) {
      isInitialLoadRef.current = true
    }
  }, [isOpen])

  // Prellenar datos del familiar cuando estén disponibles
  // IMPORTANTE: useState solo usa el valor inicial en el primer render
  // Si familiarData viene de auth asíncrono, necesitamos este useEffect
  useEffect(() => {
    if (familiarData) {
      setFormData(prev => ({
        ...prev,
        nombre_familiar: familiarData.nombre || prev.nombre_familiar || '',
        email_familiar: familiarData.email || prev.email_familiar || '',
        telefono_familiar: familiarData.telefono || prev.telefono_familiar || ''
      }))
    }
  }, [familiarData])

  // Prellenar datos de salud cuando esten disponibles
  useEffect(() => {
    if (datosSaludPrellenados) {
      setFormData(prev => ({
        ...prev,
        alergias: datosSaludPrellenados.alergias || prev.alergias,
        observaciones_medicas: datosSaludPrellenados.observaciones_medicas || prev.observaciones_medicas
      }))
    }
  }, [datosSaludPrellenados])

  // Prellenar datos desde inscripción existente
  useEffect(() => {
    if (inscripcion) {
      setFormData(prev => ({
        ...prev,
        nombre_familiar: inscripcion.nombre_familiar || prev.nombre_familiar || '',
        email_familiar: inscripcion.email_familiar || prev.email_familiar || '',
        telefono_familiar: inscripcion.telefono_familiar || prev.telefono_familiar || '',
        alergias: inscripcion.alergias || prev.alergias || '',
        dieta_especial: inscripcion.dieta_especial || prev.dieta_especial || ''
      }))
    }
  }, [inscripcion])

  // Si ya existe inscripcion, ir al paso correspondiente (SOLO en carga inicial)
  // IMPORTANTE: Usamos isInitialLoadRef para evitar que este efecto interfiera
  // cuando el usuario está navegando manualmente (ej: después de confirmar asistencia)
  useEffect(() => {
    // Solo aplicar navegación automática en carga inicial
    if (inscripcion && isInitialLoadRef.current) {
      isInitialLoadRef.current = false  // Marcar que ya pasó la carga inicial

      if (inscripcion.estado === 'no_asiste') {
        // Si ya había dicho que no, mostrar paso 0 para que pueda cambiar de opinión
        setAsistira(false)
        setCurrentStep(0)
      } else if (inscripcion.estado === 'inscrito' || inscripcion.datos_confirmados) {
        // Inscripción completa previa → ir a confirmación
        setAsistira(true)
        setCurrentStep(3)
      } else {
        // Inscripción en progreso → ir al paso 2 (documentos)
        setAsistira(true)
        setCurrentStep(2)
      }
    }
  }, [inscripcion])

  const handleAsistenciaSeleccion = async (value: boolean) => {
    setAsistira(value)

    if (!value) {
      // Marcar no asiste y cerrar directamente (sin mostrar mensaje definitivo)
      const success = await marcarNoAsiste()
      if (success) {
        // Cerrar directamente - el usuario puede cambiar de opinión más tarde
        onClose()
      }
    } else {
      // IMPORTANTE: Marcar que el usuario está navegando manualmente
      // Esto evita que el useEffect de inscripción interfiera cuando se crea/actualiza la inscripción
      isInitialLoadRef.current = false

      // Crear inscripcion inicial si no existe para permitir subir documentos
      if (!inscripcion) {
        const success = await inscribir({
          actividad_id: typeof actividad.id === 'string' ? parseInt(actividad.id) : actividad.id,
          educando_id: educando.id,
          asistira: true,
          email_familiar: familiarData?.email || '',
          nombre_familiar: familiarData?.nombre || '',
          telefono_familiar: familiarData?.telefono || ''
        })
        if (!success) {
          // Si falla la inscripcion, no avanzar
          return
        }
      }
      // Continuar al siguiente paso
      setCurrentStep(1)
    }
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as WizardStep)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((currentStep - 1) as WizardStep)
    }
  }

  const handleSubmitInscripcion = async () => {
    // La inscripcion ya fue creada en Step 0, solo actualizar datos
    const success = await inscribir({
      actividad_id: typeof actividad.id === 'string' ? parseInt(actividad.id) : actividad.id,
      educando_id: educando.id,
      asistira: true,
      datos_confirmados: true,
      ...formData
    })

    if (success) {
      handleNextStep()
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    tipo: 'circular' | 'justificante'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (tipo === 'circular') {
      await subirCircularFirmada(file)
    } else {
      await subirJustificantePago(file)
    }
  }

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Formatear hora
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return ''
    return timeStr.substring(0, 5)
  }

  // Recordatorios activos
  const getRecordatoriosActivos = () => {
    const predefinidos = actividad.campamento?.recordatorios_predefinidos
      ?.filter(r => r.activo)
      .map(r => r.texto) || []
    const personalizados = actividad.campamento?.recordatorios_personalizados || []
    return [...predefinidos, ...personalizados]
  }

  // Función para reinscribirse (resetear inscripción cancelada)
  const handleReinscribir = async () => {
    setReinscribiendo(true)
    setCurrentStep(0)
    setAsistira(null)
    setInfoConfirmada(false)
    setDatosConfirmados(false)
    // El hook manejará la actualización del estado en BD cuando el usuario confirme de nuevo
  }

  // Vista especial para inscripción cancelada
  const StepCancelado = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">Inscripcion Cancelada</h3>
      <p className="text-muted-foreground">
        La inscripcion de <span className="font-medium">{educando.nombre}</span> a este campamento fue cancelada previamente.
      </p>
      {inscripcion?.observaciones && (
        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <span className="font-medium">Motivo:</span> {inscripcion.observaciones}
        </p>
      )}
      <div className="flex justify-center gap-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button onClick={handleReinscribir} className="bg-primary hover:bg-primary/90">
          <RefreshCw className="h-4 w-4 mr-2" />
          Volver a inscribirse
        </Button>
      </div>
    </div>
  )

  // Render del paso actual
  // IMPORTANTE: Llamamos a las funciones directamente en lugar de usarlas como componentes JSX
  // para evitar que React las desmonte/remonte en cada re-render (lo que causa pérdida de focus en inputs)
  const renderStep = () => {
    // Si está cancelado y no está reinscribiéndose, mostrar vista de cancelado
    if (inscripcion?.estado === 'cancelado' && !reinscribiendo) {
      return StepCancelado()
    }

    switch (currentStep) {
      case 0:
        return StepAsistencia()
      case 1:
        return StepInformacion()
      case 2:
        return StepFormularioDocumentos()
      case 3:
        return StepConfirmacion()
      default:
        return null
    }
  }

  // ==========================================
  // PASO 0: Seleccion de asistencia
  // ==========================================
  const StepAsistencia = () => (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">
          {actividad.titulo}
        </h3>
        <p className="text-muted-foreground">
          {formatDate(actividad.fecha)}
          {actividad.fechaFin && actividad.fechaFin !== actividad.fecha && (
            <> - {formatDate(actividad.fechaFin)}</>
          )}
        </p>
      </div>

      <div className="text-center py-6">
        <p className="text-lg mb-6">
          ¿Asistira <strong>{educando.nombre}</strong> al campamento?
        </p>

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant={asistira === true ? 'default' : 'outline'}
            className="w-32 h-24 flex flex-col gap-2"
            onClick={() => handleAsistenciaSeleccion(true)}
          >
            <Check className="h-8 w-8" />
            <span className="text-lg">Si</span>
          </Button>

          <Button
            size="lg"
            variant={asistira === false ? 'destructive' : 'outline'}
            className="w-32 h-24 flex flex-col gap-2"
            onClick={() => handleAsistenciaSeleccion(false)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <X className="h-8 w-8" />
            )}
            <span className="text-lg">No</span>
          </Button>
        </div>
      </div>
    </div>
  )

  // ==========================================
  // PASO 1: Informacion del campamento
  // ==========================================
  const StepInformacion = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pb-4">
      {/* Info basica */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Informacion del Campamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Fecha</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(actividad.fecha)}
                  {actividad.fechaFin && actividad.fechaFin !== actividad.fecha && (
                    <> al {formatDate(actividad.fechaFin)}</>
                  )}
                </p>
              </div>
            </div>

            {actividad.lugar && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Lugar</p>
                  <p className="text-sm text-muted-foreground">{actividad.lugar}</p>
                </div>
              </div>
            )}

            {actividad.costo && (
              <div className="flex items-start gap-3">
                <Euro className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Precio</p>
                  <p className="text-sm text-muted-foreground">{actividad.costo}€</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logistica salida/regreso */}
      {(actividad.campamento?.lugar_salida || actividad.campamento?.lugar_regreso) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Salida y Regreso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {actividad.campamento?.lugar_salida && (
              <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                <p className="font-medium text-primary dark:text-primary">Salida</p>
                <p className="text-sm text-primary/80 dark:text-primary/70">
                  {actividad.campamento.lugar_salida}
                  {actividad.campamento.hora_salida && (
                    <> a las <strong>{formatTime(actividad.campamento.hora_salida)}</strong></>
                  )}
                </p>
                {actividad.campamento.mapa_salida_url && (
                  <a
                    href={actividad.campamento.mapa_salida_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    <MapPin className="h-3 w-3" /> Ver en mapa
                  </a>
                )}
              </div>
            )}

            {actividad.campamento?.lugar_regreso && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="font-medium text-blue-800 dark:text-blue-300">Regreso</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {actividad.campamento.lugar_regreso}
                  {actividad.campamento.hora_regreso && (
                    <> a las <strong>{formatTime(actividad.campamento.hora_regreso)}</strong></>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pago */}
      {actividad.campamento?.numero_cuenta && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Euro className="h-5 w-5 text-primary" />
              Datos de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Numero de cuenta:</p>
              <p className="font-mono text-amber-900 dark:text-amber-200 select-all">
                {actividad.campamento.numero_cuenta}
              </p>
            </div>
            {actividad.campamento.concepto_pago && (
              <div>
                <p className="text-sm font-medium">Concepto:</p>
                <p className="text-sm text-muted-foreground">
                  {actividad.campamento.concepto_pago}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recordatorios - Checklist interactiva */}
      {getRecordatoriosActivos().length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Recordatorios Importantes
            </CardTitle>
            <CardDescription>
              Marca cada elemento cuando lo tengas preparado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecordatoriosActivos().map((recordatorio, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    recordatoriosChecked[index]
                      ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/40'
                      : 'bg-background hover:bg-muted/50'
                  }`}
                  onClick={() => setRecordatoriosChecked(prev => ({
                    ...prev,
                    [index]: !prev[index]
                  }))}
                >
                  <Checkbox
                    checked={recordatoriosChecked[index] || false}
                    onCheckedChange={(checked) => setRecordatoriosChecked(prev => ({
                      ...prev,
                      [index]: checked === true
                    }))}
                    className="h-5 w-5"
                  />
                  <span className={`text-sm ${recordatoriosChecked[index] ? 'text-primary dark:text-primary line-through' : ''}`}>
                    {recordatorio}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      </div>

      {/* Footer con confirmacion y botones */}
      <div className="pt-4 border-t space-y-3 flex-shrink-0">
        {/* Confirmacion de lectura */}
        <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50">
          <Checkbox
            id="info-confirmada"
            checked={infoConfirmada}
            onCheckedChange={(checked) => setInfoConfirmada(checked === true)}
            className="h-5 w-5"
          />
          <label htmlFor="info-confirmada" className="text-sm font-medium cursor-pointer">
            He leido y entendido toda la informacion del campamento
          </label>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" size="lg" onClick={handlePrevStep}>
            <ChevronLeft className="h-5 w-5 mr-2" />
            Atras
          </Button>
          <Button size="lg" onClick={handleNextStep} disabled={!infoConfirmada}>
            Continuar
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )

  // ==========================================
  // PASO 2: Formulario y Documentos
  // ==========================================
  const StepFormularioDocumentos = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2 pb-4">
        {/* Columna izquierda: Documentos */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <FileText className="h-6 w-6" />
            Documentos Requeridos
          </h3>

          {/* Descarga de circular - Boton estilo plantillas */}
          <div className={`flex items-center justify-between p-5 rounded-xl border transition-colors ${
            circularDescargada
              ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/40'
              : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}>
            <div className="flex-1 mr-6">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-base">Circular / Autorizacion</p>
                {circularDescargada && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/20 dark:bg-primary/30 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    Descargada
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Descargar, firmar y volver a subir
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCircularesModalOpen(true)}
              className="border-amber-500 text-amber-600 hover:bg-amber-50 flex-shrink-0 px-4 py-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>

          {/* Subir circular firmada */}
          <Card className={`border-2 ${circularSubida ? 'border-primary/40 bg-primary/10 dark:bg-primary/20' : 'border-dashed border-primary/30'}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold flex items-center gap-2">
                      Subir Circular Firmada
                      {circularSubida && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Se enviara automaticamente al email de la seccion
                    </p>
                  </div>
                </div>

                {!circularSubida && (
                  <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileUpload(e, 'circular')}
                      className="hidden"
                      id="circular-upload"
                      disabled={loading}
                    />
                    <label htmlFor="circular-upload" className="cursor-pointer block">
                      <Upload className="h-12 w-12 mx-auto text-primary/60 mb-3" />
                      <p className="text-base font-medium text-foreground">
                        {loading ? 'Subiendo...' : 'Haz clic para seleccionar archivo'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">PDF o imagen (JPG, PNG)</p>
                    </label>
                  </div>
                )}

                {circularSubida && (
                  <div className="flex items-center gap-2 p-3 bg-primary/20 dark:bg-primary/30 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">Circular subida correctamente</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subir justificante de pago */}
          <Card className={`border-2 ${justificanteSubido ? 'border-primary/40 bg-primary/10 dark:bg-primary/20' : 'border-dashed border-primary/30'}`}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold flex items-center gap-2">
                      Subir Justificante de Pago
                      {justificanteSubido && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Se enviara automaticamente a tesoreria
                    </p>
                  </div>
                </div>

                {!justificanteSubido && (
                  <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileUpload(e, 'justificante')}
                      className="hidden"
                      id="justificante-upload"
                      disabled={loading}
                    />
                    <label htmlFor="justificante-upload" className="cursor-pointer block">
                      <Upload className="h-12 w-12 mx-auto text-primary/60 mb-3" />
                      <p className="text-base font-medium text-foreground">
                        {loading ? 'Subiendo...' : 'Haz clic para seleccionar archivo'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">PDF o imagen (JPG, PNG)</p>
                    </label>
                  </div>
                )}

                {justificanteSubido && (
                  <div className="flex items-center gap-2 p-3 bg-primary/20 dark:bg-primary/30 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">Justificante subido correctamente</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Datos */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <User className="h-6 w-6" />
            Datos de Inscripcion
          </h3>

          {/* Datos del familiar */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Datos del Familiar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_familiar" className="text-sm font-medium">Nombre completo</Label>
                <Input
                  id="nombre_familiar"
                  value={formData.nombre_familiar}
                  onChange={(e) => setFormData({ ...formData, nombre_familiar: e.target.value })}
                  placeholder="Nombre y apellidos"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_familiar" className="text-sm font-medium">Email</Label>
                <Input
                  id="email_familiar"
                  type="email"
                  value={formData.email_familiar}
                  onChange={(e) => setFormData({ ...formData, email_familiar: e.target.value })}
                  placeholder="email@ejemplo.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono_familiar" className="text-sm font-medium">Telefono</Label>
                <Input
                  id="telefono_familiar"
                  type="tel"
                  value={formData.telefono_familiar}
                  onChange={(e) => setFormData({ ...formData, telefono_familiar: e.target.value })}
                  placeholder="600 000 000"
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Datos del educando (readonly) */}
          <Card className="bg-muted/30 border-2 border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Datos del Educando
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-3 bg-background rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {educando.nombre?.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <p className="text-base font-semibold">{educando.nombre} {educando.apellidos}</p>
                  <p className="text-sm text-muted-foreground">{educando.seccion}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datos de salud */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Datos de Salud
              </CardTitle>
              <CardDescription className="text-sm">
                Prellenados desde la ficha sanitaria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alergias" className="text-sm font-medium">Alergias e intolerancias</Label>
                <Textarea
                  id="alergias"
                  value={formData.alergias}
                  onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                  placeholder="Ninguna / Detallar alergias..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dieta_especial" className="text-sm font-medium">Dieta especial</Label>
                <Input
                  id="dieta_especial"
                  value={formData.dieta_especial}
                  onChange={(e) => setFormData({ ...formData, dieta_especial: e.target.value })}
                  placeholder="Vegetariano, sin gluten, etc."
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mx-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Footer con confirmacion y botones */}
      <div className="pt-4 border-t space-y-3 px-2 flex-shrink-0">
        {/* Confirmacion de datos */}
        <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50">
          <Checkbox
            id="datos-confirmados"
            checked={datosConfirmados}
            onCheckedChange={(checked) => setDatosConfirmados(checked === true)}
            className="h-5 w-5"
          />
          <label htmlFor="datos-confirmados" className="text-sm font-medium cursor-pointer">
            Confirmo que todos los datos son correctos
          </label>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" size="lg" onClick={handlePrevStep}>
            <ChevronLeft className="h-5 w-5 mr-2" />
            Atras
          </Button>
          <Button
            size="lg"
            onClick={handleSubmitInscripcion}
            disabled={!datosConfirmados || loading}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Finalizar Inscripcion
                <Check className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  // ==========================================
  // PASO 3: Confirmacion
  // ==========================================
  const StepConfirmacion = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 py-3 px-2 text-center">
      {asistira === false ? (
        // Confirmacion de NO asistencia
        <>
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <X className="h-7 w-7 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold">No asistencia registrada</h3>
            <p className="text-muted-foreground mt-2">
              Hemos registrado que <strong>{educando.nombre}</strong> no asistira al campamento.
            </p>
          </div>
        </>
      ) : (
        // Confirmacion de inscripcion exitosa
        <>
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-primary">Inscripcion Completada</h3>
            <p className="text-muted-foreground mt-2">
              <strong>{educando.nombre}</strong> ha sido inscrito/a correctamente en el campamento.
            </p>
          </div>

          {/* Progreso */}
          <div className="max-w-md mx-auto space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progreso de inscripcion</span>
              <span className="font-medium">{progreso}%</span>
            </div>
            <Progress value={progreso} className="h-2" />
          </div>

          {/* Documentos Enviados */}
          {inscripcion && (circularSubida || justificanteSubido) && (
            <Card className="text-left max-w-md mx-auto">
              <CardHeader className="py-2 pb-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Documentos Enviados
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 space-y-2">
                {/* Circular Firmada */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className={`h-5 w-5 ${circularSubida ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                    <div>
                      <p className="font-medium text-sm">Circular Firmada</p>
                      <p className="text-xs text-muted-foreground">
                        {circularSubida ? 'Subido correctamente' : 'Pendiente de subir'}
                      </p>
                    </div>
                  </div>
                  {circularSubida && (inscripcion.circular_firmada_url || inscripcion.circular_firmada_drive_id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700"
                      onClick={() => {
                        setSelectedDocumento({
                          name: 'Circular Firmada',
                          webViewLink: inscripcion.circular_firmada_url,
                          id: inscripcion.circular_firmada_drive_id
                        })
                        setDocViewerOpen(true)
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Ver
                    </Button>
                  )}
                </div>

                {/* Justificante de Pago */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Receipt className={`h-5 w-5 ${justificanteSubido ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`} />
                    <div>
                      <p className="font-medium text-sm">Justificante de Pago</p>
                      <p className="text-xs text-muted-foreground">
                        {justificanteSubido ? 'Subido correctamente' : 'Pendiente de subir'}
                      </p>
                    </div>
                  </div>
                  {justificanteSubido && (inscripcion.justificante_pago_url || inscripcion.justificante_pago_drive_id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700"
                      onClick={() => {
                        setSelectedDocumento({
                          name: 'Justificante de Pago',
                          webViewLink: inscripcion.justificante_pago_url,
                          id: inscripcion.justificante_pago_drive_id
                        })
                        setDocViewerOpen(true)
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Ver
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recordatorios */}
          {getRecordatoriosActivos().length > 0 && (
            <Card className="text-left max-w-md mx-auto">
              <CardHeader className="py-2 pb-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-amber-500" />
                  No olvides para el campamento
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <ul className="space-y-1 text-sm">
                  {getRecordatoriosActivos().map((recordatorio, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{recordatorio}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
      </div>

      {/* Botones de acción - Footer fijo */}
      <div className="pt-3 border-t flex justify-center gap-3 flex-shrink-0 bg-background">
        <Button variant="outline" onClick={handlePrevStep} className="min-w-32">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button onClick={onClose} className="min-w-32">
          Cerrar
        </Button>
        {inscripcion && (inscripcion.estado === 'inscrito' || inscripcion.estado === 'pendiente') && (
          <Button
            variant="outline"
            className="min-w-32 border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700"
            onClick={() => setMostrarCancelacion(true)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar Inscripción
          </Button>
        )}
      </div>
    </div>
  )

  // Handler para cancelar inscripción
  const handleCancelarInscripcion = async () => {
    setCancelando(true)
    try {
      const success = await cancelarInscripcion(motivoCancelacion || undefined)
      if (success) {
        setMostrarCancelacion(false)
        setMotivoCancelacion('')
        // Volver al paso inicial
        setCurrentStep(0)
        setAsistira(null)
      }
    } finally {
      setCancelando(false)
    }
  }

  // Indicador de pasos
  const StepIndicator = () => {
    const steps = [
      { num: 0, label: 'Asistencia' },
      { num: 1, label: 'Informacion' },
      { num: 2, label: 'Documentos' },
      { num: 3, label: 'Confirmacion' }
    ]

    // Si no asiste, ocultar pasos intermedios
    if (asistira === false) {
      return null
    }

    return (
      <div className="flex items-center justify-center space-x-2 mb-4">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep === step.num
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step.num
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {currentStep > step.num ? (
                <Check className="h-4 w-4" />
              ) : (
                step.num + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-1 ${
                  currentStep > step.num ? 'bg-green-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="text-2xl">🏕️</span>
              Inscripcion al Campamento
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulario de inscripción al campamento para {educando.nombre}
            </DialogDescription>
          </DialogHeader>

          <StepIndicator />

          <div className="flex-1 overflow-auto min-h-0">
            {renderStep()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Circulares - estilo identico a Plantillas */}
      <Dialog open={circularesModalOpen} onOpenChange={setCircularesModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-amber-600" />
              Circular del Campamento
            </DialogTitle>
            <DialogDescription>
              Descarga la circular, firmala y subela completada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-6">
            {loadingCirculares ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : circulares.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay circulares disponibles todavia</p>
              </div>
            ) : (
              circulares.map((circular) => (
                <div
                  key={circular.id}
                  className={`flex items-center justify-between p-5 rounded-xl border transition-colors ${
                    circularDescargada
                      ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/40'
                      : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex-1 mr-6">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-base">{circular.name}</p>
                      {circularDescargada && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/20 dark:bg-primary/30 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          Descargada
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Circular de autorizacion para el campamento
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => downloadCircular(circular.id, circular.name)}
                    className="border-amber-500 text-amber-600 hover:bg-amber-50 flex-shrink-0 px-4 py-2"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de confirmación de cancelación */}
      <AlertDialog open={mostrarCancelacion} onOpenChange={setMostrarCancelacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              ¿Cancelar inscripción?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará la inscripción de <strong>{educando.nombre}</strong> al campamento.
              Los documentos subidos se mantendrán, pero deberás volver a inscribirte si cambias de opinión.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="motivo-cancelacion" className="text-sm font-medium">
              Motivo de la cancelación (opcional)
            </Label>
            <Textarea
              id="motivo-cancelacion"
              placeholder="Indica el motivo de la cancelación..."
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelando}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelarInscripcion}
              disabled={cancelando}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Sí, cancelar inscripción'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para visualizar documentos */}
      <DocumentoViewerModal
        isOpen={docViewerOpen}
        onClose={() => {
          setDocViewerOpen(false)
          setSelectedDocumento(null)
        }}
        documento={selectedDocumento ? {
          name: selectedDocumento.name,
          webViewLink: selectedDocumento.webViewLink,
          id: selectedDocumento.id
        } : null}
      />
    </>
  )
}
