'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Heart, Phone } from 'lucide-react'
import type { PerfilSaludData, ContactoEmergencia } from '@/types/circular-digital'

interface PerfilSaludFormProps {
  initialData?: PerfilSaludData | null
  initialContactos?: ContactoEmergencia[]
  mode: 'standalone' | 'wizard-step'
  readOnly?: boolean
  sections?: ('medicos' | 'contactos')[]
  onSave?: (data: Partial<PerfilSaludData>, contactos: ContactoEmergencia[]) => void
  onChange?: (data: Partial<PerfilSaludData>, contactos: ContactoEmergencia[]) => void
}

const DEFAULT_PERFIL: Partial<PerfilSaludData> = {
  alergias: '', intolerancias: '', dieta_especial: '', medicacion: '',
  observaciones_medicas: '', grupo_sanguineo: '', tarjeta_sanitaria: '',
  enfermedades_cronicas: '', puede_hacer_deporte: true, notas_adicionales: ''
}

const DEFAULT_CONTACTO: ContactoEmergencia = { nombre_completo: '', telefono: '', relacion: 'tutor', orden: 1 }

export function PerfilSaludForm({ initialData, initialContactos, mode, readOnly, sections, onSave, onChange }: PerfilSaludFormProps) {
  const showMedicos = !sections || sections.includes('medicos')
  const showContactos = !sections || sections.includes('contactos')
  const [data, setData] = useState<Partial<PerfilSaludData>>({ ...DEFAULT_PERFIL, ...initialData })
  const [contactos, setContactos] = useState<ContactoEmergencia[]>(
    initialContactos?.length ? initialContactos : [{ ...DEFAULT_CONTACTO }]
  )

  useEffect(() => {
    if (initialData) setData(prev => ({ ...prev, ...initialData }))
  }, [initialData])

  useEffect(() => {
    if (initialContactos?.length) setContactos(initialContactos)
  }, [initialContactos])

  const updateField = (field: string, value: unknown) => {
    const newData = { ...data, [field]: value }
    setData(newData)
    onChange?.(newData, contactos)
  }

  const updateContacto = (index: number, field: string, value: string) => {
    const newContactos = [...contactos]
    newContactos[index] = { ...newContactos[index], [field]: value }
    setContactos(newContactos)
    onChange?.(data, newContactos)
  }

  const addContacto = () => {
    if (contactos.length >= 3) return
    const newContactos = [...contactos, { ...DEFAULT_CONTACTO, orden: contactos.length + 1 }]
    setContactos(newContactos)
    onChange?.(data, newContactos)
  }

  const removeContacto = (index: number) => {
    if (contactos.length <= 1) return
    const newContactos = contactos.filter((_, i) => i !== index).map((c, i) => ({ ...c, orden: i + 1 }))
    setContactos(newContactos)
    onChange?.(data, newContactos)
  }

  return (
    <div className="space-y-4" data-testid="perfil-salud-form">
      {/* Datos médicos */}
      {showMedicos && <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Datos Médicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alergias</Label>
              <Textarea value={data.alergias || ''} onChange={e => updateField('alergias', e.target.value)} placeholder="Ninguna conocida" readOnly={readOnly} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Intolerancias</Label>
              <Textarea value={data.intolerancias || ''} onChange={e => updateField('intolerancias', e.target.value)} placeholder="Ninguna conocida" readOnly={readOnly} rows={2} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dieta especial</Label>
              <Input value={data.dieta_especial || ''} onChange={e => updateField('dieta_especial', e.target.value)} placeholder="Vegetariano, sin gluten..." readOnly={readOnly} />
            </div>
            <div className="space-y-2">
              <Label>Medicación</Label>
              <Textarea value={data.medicacion || ''} onChange={e => updateField('medicacion', e.target.value)} placeholder="Ninguna" readOnly={readOnly} rows={2} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Enfermedades crónicas</Label>
            <Textarea value={data.enfermedades_cronicas || ''} onChange={e => updateField('enfermedades_cronicas', e.target.value)} placeholder="Ninguna" readOnly={readOnly} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Observaciones médicas</Label>
            <Textarea value={data.observaciones_medicas || ''} onChange={e => updateField('observaciones_medicas', e.target.value)} placeholder="Notas adicionales..." readOnly={readOnly} rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Grupo sanguíneo</Label>
              <Input value={data.grupo_sanguineo || ''} onChange={e => updateField('grupo_sanguineo', e.target.value)} placeholder="A+, O-, ..." readOnly={readOnly} />
            </div>
            <div className="space-y-2">
              <Label>Tarjeta sanitaria</Label>
              <Input value={data.tarjeta_sanitaria || ''} onChange={e => updateField('tarjeta_sanitaria', e.target.value)} placeholder="Nº tarjeta" readOnly={readOnly} />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox checked={data.puede_hacer_deporte !== false} onCheckedChange={v => updateField('puede_hacer_deporte', v)} disabled={readOnly} id="deporte" />
              <Label htmlFor="deporte">Puede hacer deporte</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {showMedicos && </Card>}

      {/* Contactos de emergencia */}
      {showContactos && <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-500" />
            Contactos de Emergencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contactos.map((c, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg" data-testid={`contacto-${i}`}>
              <div className="space-y-1">
                <Label className="text-xs">Nombre completo</Label>
                <Input value={c.nombre_completo} onChange={e => updateContacto(i, 'nombre_completo', e.target.value)} placeholder="Nombre y apellidos" readOnly={readOnly} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Teléfono</Label>
                <Input value={c.telefono} onChange={e => updateContacto(i, 'telefono', e.target.value)} placeholder="600 000 000" readOnly={readOnly} type="tel" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Relación</Label>
                <Input value={c.relacion} onChange={e => updateContacto(i, 'relacion', e.target.value)} placeholder="Padre, madre, tutor..." readOnly={readOnly} />
              </div>
              <div className="flex items-end">
                {!readOnly && contactos.length > 1 && (
                  <Button variant="outline" size="sm" onClick={() => removeContacto(i)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!readOnly && contactos.length < 3 && (
            <Button variant="outline" size="sm" onClick={addContacto} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Añadir contacto
            </Button>
          )}
        </CardContent>
      </Card>}

      {mode === 'standalone' && !readOnly && (
        <Button onClick={() => onSave?.(data, contactos)} className="w-full">
          Guardar perfil de salud
        </Button>
      )}
    </div>
  )
}
