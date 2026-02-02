'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft, ChevronRight, Check, CheckCircle2, Loader2, AlertCircle,
  User, Heart, Phone, FileText, PenTool, MapPin, Clock, Backpack, Euro, Eye, AlertTriangle
} from 'lucide-react'
import { useCircularDigital } from '@/hooks/useCircularDigital'
import { getApiUrl } from '@/lib/api-utils'
import { PerfilSaludForm } from './PerfilSaludForm'
import { FirmaDigitalCanvas } from './FirmaDigitalCanvas'
import type { PerfilSaludData, ContactoEmergencia, CampoCustomCircular, CircularResultado } from '@/types/circular-digital'

interface CircularDigitalWizardProps {
  actividadId: number
  educandoId: number
  onComplete: (resultado: CircularResultado) => void
  onCancel: () => void
}

export function CircularDigitalWizard({ actividadId, educandoId, onComplete, onCancel }: CircularDigitalWizardProps) {
  const {
    circularConfig, camposCustom, perfilSalud, contactos, educando, familiar, configRonda,
    respuestaExistente, isLoading, error: fetchError, firmar
  } = useCircularDigital(actividadId, educandoId)

  const [step, setStep] = useState(0)
  const [perfilData, setPerfilData] = useState<Partial<PerfilSaludData>>({})
  const [contactosData, setContactosData] = useState<ContactoEmergencia[]>([])
  const [camposCustomResp, setCamposCustomResp] = useState<Record<string, unknown>>({})
  const [firmaBase64, setFirmaBase64] = useState<string | null>(null)
  const [aceptaCondiciones, setAceptaCondiciones] = useState(false)
  const [actualizarPerfil, setActualizarPerfil] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<CircularResultado | null>(null)
  const [pdfPreviewBase64, setPdfPreviewBase64] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  // Init data from fetched profile
  const initData = useCallback(() => {
    if (perfilSalud && Object.keys(perfilData).length === 0) {
      setPerfilData(perfilSalud)
    }
    if (contactos.length > 0 && contactosData.length === 0) {
      setContactosData(contactos)
    }
  }, [perfilSalud, contactos, perfilData, contactosData])
  initData()

  const STEPS = [
    { label: 'Actividad', icon: FileText },
    { label: 'Educando', icon: User },
    { label: 'Salud', icon: Heart },
    { label: 'Contactos', icon: Phone },
    { label: 'Autorizaciones', icon: FileText },
    { label: 'Resumen', icon: Check },
    { label: 'Firma', icon: PenTool },
    { label: 'Revisar', icon: Eye },
  ]

  // Load PDF preview when entering the preview step
  const loadPreview = useCallback(async () => {
    if (!circularConfig) return
    setIsLoadingPreview(true)
    setPreviewError(null)
    try {
      const token = localStorage.getItem('familia_token') || localStorage.getItem('token')
      const res = await fetch(
        `${getApiUrl()}/api/circular/${circularConfig.id}/preview/${educandoId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firmaBase64: firmaBase64,
            datosMedicos: perfilData,
            contactos: contactosData
          })
        }
      )
      const data = await res.json()
      if (data.success) {
        setPdfPreviewBase64(data.data.pdfBase64)
      } else {
        setPreviewError(data.message || 'Error generando preview')
      }
    } catch {
      setPreviewError('Error de conexión al generar preview')
    } finally {
      setIsLoadingPreview(false)
    }
  }, [circularConfig, educandoId, firmaBase64, perfilData, contactosData])

  // Ya firmada
  if (respuestaExistente && !resultado) {
    return (
      <div className="text-center py-8 space-y-4" data-testid="circular-ya-firmada">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-xl font-semibold text-green-700">Circular ya firmada</h3>
        <p className="text-muted-foreground">Esta circular fue firmada el {new Date(respuestaExistente.fecha_firma).toLocaleDateString('es-ES')}</p>
        <Button onClick={onCancel}>Cerrar</Button>
      </div>
    )
  }

  // Resultado exitoso
  if (resultado) {
    return (
      <div className="text-center py-8 space-y-4" data-testid="circular-completada">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-xl font-semibold text-green-700">¡Circular firmada con éxito!</h3>
        <p className="text-muted-foreground">El PDF se ha generado automáticamente.</p>
        {resultado.pdfUrl && (
          <Button variant="outline" asChild>
            <a href={resultado.pdfUrl} target="_blank" rel="noopener noreferrer">Ver PDF</a>
          </Button>
        )}
        <Button onClick={() => onComplete(resultado)}>Continuar</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Cargando circular...</span>
      </div>
    )
  }

  if (fetchError || !circularConfig) {
    return (
      <div className="text-center py-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <p className="text-red-600">{fetchError || 'No hay circular digital disponible para esta actividad'}</p>
        <Button variant="outline" onClick={onCancel}>Volver</Button>
      </div>
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const result = await firmar({
        educandoId,
        datosMedicos: perfilData,
        contactos: contactosData,
        camposCustom: camposCustomResp,
        firmaBase64: firmaBase64!,
        firmaTipo: 'image',
        aceptaCondiciones: true,
        actualizarPerfil
      })
      setResultado(result)
    } catch (err: any) {
      setSubmitError(err.message || 'Error al firmar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCustomField = (campo: CampoCustomCircular) => {
    const val = camposCustomResp[campo.nombre_campo]
    switch (campo.tipo_campo) {
      case 'checkbox':
        return (
          <div key={campo.id} className="flex items-center space-x-2">
            <Checkbox
              checked={!!val}
              onCheckedChange={v => setCamposCustomResp(p => ({ ...p, [campo.nombre_campo]: v }))}
              id={`custom-${campo.id}`}
            />
            <Label htmlFor={`custom-${campo.id}`}>{campo.etiqueta} {campo.obligatorio && <span className="text-red-500">*</span>}</Label>
          </div>
        )
      case 'textarea':
        return (
          <div key={campo.id} className="space-y-2">
            <Label>{campo.etiqueta} {campo.obligatorio && <span className="text-red-500">*</span>}</Label>
            <Textarea value={String(val || '')} onChange={e => setCamposCustomResp(p => ({ ...p, [campo.nombre_campo]: e.target.value }))} />
          </div>
        )
      default:
        return (
          <div key={campo.id} className="space-y-2">
            <Label>{campo.etiqueta} {campo.obligatorio && <span className="text-red-500">*</span>}</Label>
            <Input value={String(val || '')} onChange={e => setCamposCustomResp(p => ({ ...p, [campo.nombre_campo]: e.target.value }))} />
          </div>
        )
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0: // Info circular (nueva)
        return (
          <Card data-testid="step-circular-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {circularConfig.titulo || circularConfig.actividad_titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info actividad con estética scout */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Grupo Scout Osyris
                </Badge>

                {circularConfig.fecha_actividad && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="font-medium">{circularConfig.fecha_actividad}</span>
                  </div>
                )}

                {(circularConfig.lugar || circularConfig.actividad_lugar) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-amber-600" />
                    <span>{circularConfig.lugar || circularConfig.actividad_lugar}</span>
                  </div>
                )}

                {circularConfig.hora_y_lugar_salida && (
                  <div className="text-sm">
                    <span className="font-medium text-green-700">Salida:</span> {circularConfig.hora_y_lugar_salida}
                  </div>
                )}

                {circularConfig.hora_y_lugar_llegada && (
                  <div className="text-sm">
                    <span className="font-medium text-blue-700">Llegada:</span> {circularConfig.hora_y_lugar_llegada}
                  </div>
                )}
              </div>

              {circularConfig.que_llevar && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm flex items-center gap-1 mb-1">
                    <Backpack className="h-4 w-4" /> Qué llevar:
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{circularConfig.que_llevar}</p>
                </div>
              )}

              {circularConfig.precio_info_pago && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm flex items-center gap-1 mb-1">
                    <Euro className="h-4 w-4" /> Precio:
                  </p>
                  <p className="text-sm text-muted-foreground">{circularConfig.precio_info_pago}</p>
                </div>
              )}

              {circularConfig.info_familias && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200">
                  <p className="text-sm">{circularConfig.info_familias}</p>
                </div>
              )}

              {circularConfig.texto_introductorio && (
                <p className="text-sm text-muted-foreground">{circularConfig.texto_introductorio}</p>
              )}

              {/* Contactos responsables de la ronda */}
              {configRonda && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm mb-2">Contactos de responsables:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                    {configRonda.responsable_castores && (
                      <span>🦫 Castores: {configRonda.responsable_castores} — {configRonda.numero_responsable_castores}</span>
                    )}
                    {configRonda.responsable_manada && (
                      <span>🐺 Manada: {configRonda.responsable_manada} — {configRonda.numero_responsable_manada}</span>
                    )}
                    {configRonda.responsable_tropa && (
                      <span>⚜️ Tropa: {configRonda.responsable_tropa} — {configRonda.numero_responsable_tropa}</span>
                    )}
                    {configRonda.responsable_pioneros && (
                      <span>🔥 Pioneros: {configRonda.responsable_pioneros} — {configRonda.numero_responsable_pioneros}</span>
                    )}
                    {configRonda.responsable_rutas && (
                      <span>🏔️ Rutas: {configRonda.responsable_rutas} — {configRonda.numero_responsable_rutas}</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 1: // Datos educando (readonly)
        return (
          <Card data-testid="step-educando">
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Datos del Educando</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs text-muted-foreground">Nombre</Label><p className="font-medium" data-testid="educando-nombre">{educando?.nombre} {educando?.apellidos}</p></div>
                <div><Label className="text-xs text-muted-foreground">Sección</Label><p className="font-medium">{educando?.seccion_nombre}</p></div>
                {educando?.fecha_nacimiento && (
                  <div><Label className="text-xs text-muted-foreground">Fecha nacimiento</Label><p>{new Date(educando.fecha_nacimiento).toLocaleDateString('es-ES')}</p></div>
                )}
              </div>

              {/* Pre-rellenado de datos tutor */}
              {familiar && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-sm mb-1">Datos del tutor/a (pre-rellenados):</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Nombre:</span> {familiar.nombre} {familiar.apellidos}</div>
                    {familiar.dni && <div><span className="text-muted-foreground">DNI:</span> {familiar.dni}</div>}
                    {familiar.telefono && <div><span className="text-muted-foreground">Teléfono:</span> {familiar.telefono}</div>}
                  </div>
                </div>
              )}

              <Alert><AlertDescription>Estos datos no se pueden modificar desde aquí. Si hay algún error, contacta con el grupo.</AlertDescription></Alert>
            </CardContent>
          </Card>
        )

      case 2: // Perfil salud
        return (
          <div data-testid="step-salud">
            <PerfilSaludForm
              initialData={perfilData as PerfilSaludData}
              initialContactos={[]}
              mode="wizard-step"
              sections={['medicos']}
              onChange={(d) => setPerfilData(d)}
            />
          </div>
        )

      case 3: // Contactos
        return (
          <Card data-testid="step-contactos">
            <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contactos de Emergencia</CardTitle></CardHeader>
            <CardContent>
              <PerfilSaludForm
                initialData={{} as PerfilSaludData}
                initialContactos={contactosData}
                mode="wizard-step"
                sections={['contactos']}
                onChange={(_, c) => setContactosData(c)}
              />
            </CardContent>
          </Card>
        )

      case 4: // Campos custom
        return (
          <Card data-testid="step-autorizaciones">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Autorizaciones Específicas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {circularConfig.texto_introductorio && (
                <p className="text-sm text-muted-foreground">{circularConfig.texto_introductorio}</p>
              )}
              {camposCustom.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay campos adicionales para esta actividad.</p>
              ) : (
                camposCustom.map(renderCustomField)
              )}
            </CardContent>
          </Card>
        )

      case 5: // Resumen
        return (
          <Card data-testid="step-resumen">
            <CardHeader><CardTitle className="flex items-center gap-2"><Check className="h-5 w-5" /> Resumen</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200">
                  <p className="font-semibold">{circularConfig.titulo || circularConfig.actividad_titulo}</p>
                  {circularConfig.fecha_actividad && <p className="text-muted-foreground">{circularConfig.fecha_actividad}</p>}
                  {(circularConfig.lugar || circularConfig.actividad_lugar) && <p className="text-muted-foreground">{circularConfig.lugar || circularConfig.actividad_lugar}</p>}
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-semibold">Educando: {educando?.nombre} {educando?.apellidos}</p>
                  <p>Sección: {educando?.seccion_nombre}</p>
                </div>
                {familiar && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">Tutor/a: {familiar.nombre} {familiar.apellidos}</p>
                    {familiar.dni && <p>DNI: {familiar.dni}</p>}
                  </div>
                )}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-semibold">Datos médicos</p>
                  <p>Alergias: {perfilData.alergias || 'Ninguna'}</p>
                  <p>Medicación: {perfilData.medicacion || 'Ninguna'}</p>
                  <p>Dieta: {perfilData.dieta_especial || 'Normal'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-semibold">Contactos emergencia</p>
                  {contactosData.map((c, i) => (
                    <p key={i}>{c.nombre_completo} — {c.telefono} ({c.relacion})</p>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox checked={aceptaCondiciones} onCheckedChange={v => setAceptaCondiciones(v === true)} id="acepta" />
                <Label htmlFor="acepta" className="text-sm cursor-pointer">
                  Confirmo que todos los datos son correctos y autorizo la participación de mi hijo/a en la actividad
                </Label>
              </div>

              {/* actualizarPerfil siempre true — se actualiza automáticamente */}
            </CardContent>
          </Card>
        )

      case 6: // Firma
        return (
          <Card data-testid="step-firma">
            <CardHeader><CardTitle className="flex items-center gap-2"><PenTool className="h-5 w-5" /> Firma Digital</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Firme en el recuadro inferior con el dedo o un stylus. La firma se incluirá en el PDF generado.
              </p>
              <FirmaDigitalCanvas onChange={setFirmaBase64} height={200} placeholder="Firme aquí con el dedo o stylus" />

              <Button
                onClick={() => { loadPreview(); setStep(7); }}
                disabled={!firmaBase64 || !aceptaCondiciones}
                className="w-full"
                size="lg"
              >
                <Eye className="h-5 w-5 mr-2" /> Revisar documento
              </Button>
            </CardContent>
          </Card>
        )

      case 7: // Revisar PDF y confirmar envío
        return (
          <Card data-testid="step-preview">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" /> Revisa el documento antes de enviar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Comprueba que todos los datos son correctos. Si hay algún error, vuelve atrás para corregirlo.
              </p>

              {isLoadingPreview && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3">Generando vista previa...</span>
                </div>
              )}

              {previewError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{previewError}</AlertDescription>
                </Alert>
              )}

              {pdfPreviewBase64 && (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={`data:application/pdf;base64,${pdfPreviewBase64}`}
                    className="w-full"
                    style={{ height: '500px' }}
                    title="Vista previa circular"
                  />
                </div>
              )}

              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {pdfPreviewBase64 && (
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => setStep(5)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Hay algún error
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    data-testid="btn-enviar-firma"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Enviando...</>
                    ) : (
                      <><Check className="h-5 w-5 mr-2" /> Confirmar y enviar</>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
    }
  }

  const canNext = () => {
    if (step === 5) return aceptaCondiciones
    if (step === 6) return false // firma step has its own button
    if (step === 7) return false // review step has its own buttons
    return true
  }

  const handleNext = () => {
    setStep(step + 1)
  }

  return (
    <div className="space-y-4" data-testid="circular-wizard">
      {/* Step indicator */}
      <div className="flex items-center justify-center space-x-1">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              step === i ? 'bg-primary text-primary-foreground' : step > i ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {step > i ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`w-6 h-0.5 mx-0.5 ${step > i ? 'bg-green-500' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <Progress value={(step / (STEPS.length - 1)) * 100} className="h-1" />

      {renderStep()}

      {/* Nav buttons (hidden on preview step — it has its own buttons) */}
      {step !== 6 && (
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> {step === 0 ? 'Cancelar' : 'Atrás'}
          </Button>
          {step < 7 && (
            <Button onClick={handleNext} disabled={!canNext()}>
              Siguiente <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
