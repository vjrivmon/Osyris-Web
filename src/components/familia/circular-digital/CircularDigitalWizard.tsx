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
import {
  ChevronLeft, ChevronRight, Check, CheckCircle2, Loader2, AlertCircle,
  User, Heart, Phone, FileText, PenTool
} from 'lucide-react'
import { useCircularDigital } from '@/hooks/useCircularDigital'
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
  const { circularConfig, camposCustom, perfilSalud, contactos, educando, respuestaExistente, isLoading, error: fetchError, firmar } = useCircularDigital(actividadId, educandoId)

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
    { label: 'Educando', icon: User },
    { label: 'Salud', icon: Heart },
    { label: 'Contactos', icon: Phone },
    { label: 'Autorizaciones', icon: FileText },
    { label: 'Resumen', icon: Check },
    { label: 'Firma', icon: PenTool },
  ]

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
      case 0: // Datos educando (readonly)
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
              <Alert><AlertDescription>Estos datos no se pueden modificar desde aquí. Si hay algún error, contacta con el grupo.</AlertDescription></Alert>
            </CardContent>
          </Card>
        )

      case 1: // Perfil salud
        return (
          <div data-testid="step-salud">
            <PerfilSaludForm
              initialData={perfilData as PerfilSaludData}
              initialContactos={[]}
              mode="wizard-step"
              onChange={(d) => setPerfilData(d)}
            />
          </div>
        )

      case 2: // Contactos
        return (
          <Card data-testid="step-contactos">
            <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contactos de Emergencia</CardTitle></CardHeader>
            <CardContent>
              <PerfilSaludForm
                initialData={{} as PerfilSaludData}
                initialContactos={contactosData}
                mode="wizard-step"
                onChange={(_, c) => setContactosData(c)}
              />
            </CardContent>
          </Card>
        )

      case 3: // Campos custom
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

      case 4: // Resumen
        return (
          <Card data-testid="step-resumen">
            <CardHeader><CardTitle className="flex items-center gap-2"><Check className="h-5 w-5" /> Resumen</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-semibold">Educando: {educando?.nombre} {educando?.apellidos}</p>
                  <p>Sección: {educando?.seccion_nombre}</p>
                </div>
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

              <div className="flex items-center space-x-3">
                <Checkbox checked={actualizarPerfil} onCheckedChange={v => setActualizarPerfil(v === true)} id="actualizar" />
                <Label htmlFor="actualizar" className="text-sm cursor-pointer">
                  Actualizar mi perfil de salud con estos datos para futuras actividades
                </Label>
              </div>
            </CardContent>
          </Card>
        )

      case 5: // Firma
        return (
          <Card data-testid="step-firma">
            <CardHeader><CardTitle className="flex items-center gap-2"><PenTool className="h-5 w-5" /> Firma Digital</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Firme en el recuadro inferior con el dedo o un stylus. La firma se incluirá en el PDF generado.
              </p>
              <FirmaDigitalCanvas onChange={setFirmaBase64} height={200} placeholder="Firme aquí con el dedo o stylus" />

              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!firmaBase64 || !aceptaCondiciones || isSubmitting}
                className="w-full"
                size="lg"
                data-testid="btn-enviar-firma"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Generando circular...</>
                ) : (
                  <><Check className="h-5 w-5 mr-2" /> Firmar y enviar</>
                )}
              </Button>
            </CardContent>
          </Card>
        )
    }
  }

  const canNext = () => {
    if (step === 4) return aceptaCondiciones
    if (step === 5) return false // submit button handles this
    return true
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

      {/* Nav buttons */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> {step === 0 ? 'Cancelar' : 'Atrás'}
        </Button>
        {step < 5 && (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
            Siguiente <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
