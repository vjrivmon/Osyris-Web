'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Save, Send } from 'lucide-react'
import { getApiUrl } from '@/lib/api-utils'

interface CampoCustom {
  nombre_campo: string
  tipo_campo: 'texto' | 'textarea' | 'checkbox' | 'select'
  etiqueta: string
  obligatorio: boolean
  opciones: string[] | null
  orden: number
}

interface CircularCrearFormProps {
  onCreated?: () => void
}

export function CircularCrearForm({ onCreated }: CircularCrearFormProps) {
  const [actividades, setActividades] = useState<any[]>([])
  const [actividadId, setActividadId] = useState('')
  const [titulo, setTitulo] = useState('')
  const [textoIntro, setTextoIntro] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [camposCustom, setCamposCustom] = useState<CampoCustom[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const getAuth = () => {
    const token = localStorage.getItem('token')
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  useEffect(() => {
    fetch(`${getApiUrl()}/api/actividades`, { headers: getAuth() })
      .then(r => r.json())
      .then(d => { if (d.success) setActividades(d.data || []) })
      .catch(() => {})
  }, [])

  const addCampo = () => {
    setCamposCustom([...camposCustom, {
      nombre_campo: `campo_${camposCustom.length + 1}`,
      tipo_campo: 'checkbox',
      etiqueta: '',
      obligatorio: false,
      opciones: null,
      orden: camposCustom.length
    }])
  }

  const removeCampo = (i: number) => {
    setCamposCustom(camposCustom.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (publicar: boolean) => {
    setLoading(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/circulares`, {
        method: 'POST',
        headers: getAuth(),
        body: JSON.stringify({
          actividad_id: parseInt(actividadId),
          titulo: titulo || `Circular - ${actividades.find(a => a.id == actividadId)?.titulo || 'Actividad'}`,
          texto_introductorio: textoIntro,
          fecha_limite_firma: fechaLimite || null,
          estado: publicar ? 'publicada' : 'borrador',
          camposCustom
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        onCreated?.()
      }
    } catch { /* */ }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-4" data-testid="circular-creada">
        <div className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <Save className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-700">Circular creada correctamente</h3>
        <Button variant="outline" onClick={() => { setSuccess(false); setTitulo(''); setTextoIntro(''); setCamposCustom([]) }}>Crear otra</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="circular-crear-form">
      <Card>
        <CardHeader><CardTitle>Crear Circular Digital</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Actividad</Label>
            <Select value={actividadId} onValueChange={setActividadId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar actividad" /></SelectTrigger>
              <SelectContent>
                {actividades.map(a => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Título de la circular</Label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Circular Campamento Navidad 2026" />
          </div>

          <div className="space-y-2">
            <Label>Texto introductorio</Label>
            <Textarea value={textoIntro} onChange={e => setTextoIntro(e.target.value)} placeholder="Instrucciones para las familias..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Fecha límite de firma</Label>
            <Input type="date" value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Campos personalizados
            <Button variant="outline" size="sm" onClick={addCampo}><Plus className="h-4 w-4 mr-1" />Añadir campo</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {camposCustom.map((campo, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-xs">Etiqueta</Label>
                <Input value={campo.etiqueta} onChange={e => {
                  const nc = [...camposCustom]; nc[i] = { ...nc[i], etiqueta: e.target.value, nombre_campo: e.target.value.toLowerCase().replace(/\s+/g, '_') }; setCamposCustom(nc)
                }} placeholder="Ej: Autorizo baño en río" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select value={campo.tipo_campo} onValueChange={v => {
                  const nc = [...camposCustom]; nc[i] = { ...nc[i], tipo_campo: v as any }; setCamposCustom(nc)
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="texto">Texto</SelectItem>
                    <SelectItem value="textarea">Texto largo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox checked={campo.obligatorio} onCheckedChange={v => {
                    const nc = [...camposCustom]; nc[i] = { ...nc[i], obligatorio: v === true }; setCamposCustom(nc)
                  }} />
                  <Label className="text-xs">Obligatorio</Label>
                </div>
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={() => removeCampo(i)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {camposCustom.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Sin campos personalizados. Añade preguntas específicas de la actividad.</p>}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => handleSubmit(false)} disabled={!actividadId || loading}>
          <Save className="h-4 w-4 mr-2" /> Guardar borrador
        </Button>
        <Button onClick={() => handleSubmit(true)} disabled={!actividadId || loading}>
          <Send className="h-4 w-4 mr-2" /> Publicar circular
        </Button>
      </div>
    </div>
  )
}
