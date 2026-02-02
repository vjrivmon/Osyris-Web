'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Save, Loader2, CheckCircle2, Settings, Users } from 'lucide-react'
import { getApiUrl } from '@/lib/api-utils'
import type { ConfigRonda } from '@/types/circular-digital'

const SECCIONES = [
  { key: 'castores', label: 'Castores', color: 'text-orange-600' },
  { key: 'manada', label: 'Manada', color: 'text-yellow-600' },
  { key: 'tropa', label: 'Tropa', color: 'text-blue-600' },
  { key: 'pioneros', label: 'Pioneros', color: 'text-red-600' },
  { key: 'rutas', label: 'Rutas', color: 'text-green-600' },
]

export function ConfigRondaForm() {
  const [config, setConfig] = useState<Partial<ConfigRonda>>({
    temporada: '',
    responsable_castores: '', numero_responsable_castores: '',
    responsable_manada: '', numero_responsable_manada: '',
    responsable_tropa: '', numero_responsable_tropa: '',
    responsable_pioneros: '', numero_responsable_pioneros: '',
    responsable_rutas: '', numero_responsable_rutas: '',
    normas_generales: 'Recordamos que en las actividades scouts no se permiten teléfonos móviles, golosinas ni plásticos de un solo uso.',
    cuenta_bancaria: '',
  })
  const [existingId, setExistingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const getAuth = () => {
    const token = localStorage.getItem('token')
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/config-ronda/activa`, { headers: getAuth() })
        const data = await res.json()
        if (data.success && data.data) {
          setConfig(data.data)
          setExistingId(data.data.id)
        }
      } catch { /* */ }
      setLoading(false)
    }
    load()
  }, [])

  const updateField = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = existingId
        ? `${getApiUrl()}/api/admin/config-ronda/${existingId}`
        : `${getApiUrl()}/api/admin/config-ronda`
      const method = existingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: getAuth(),
        body: JSON.stringify(config)
      })
      const data = await res.json()
      if (data.success) {
        setExistingId(data.data.id)
        setSaved(true)
      }
    } catch { /* */ }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="config-ronda-form">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> Configuración de Ronda
            </span>
            {existingId && <Badge variant="secondary">ID: {existingId}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ronda Solar</Label>
              <Input
                value={config.temporada || ''}
                onChange={e => updateField('temporada', e.target.value)}
                placeholder="Ej: 2025-2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Cuenta bancaria</Label>
              <Input
                value={config.cuenta_bancaria || ''}
                onChange={e => updateField('cuenta_bancaria', e.target.value)}
                placeholder="ES12 3456 7890 1234 5678 9012"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Responsables por Sección
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SECCIONES.map(seccion => (
            <div key={seccion.key} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-lg">
              <div className="flex items-center">
                <span className={`font-semibold ${seccion.color}`}>{seccion.label}</span>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Responsable</Label>
                <Input
                  value={(config as any)[`responsable_${seccion.key}`] || ''}
                  onChange={e => updateField(`responsable_${seccion.key}`, e.target.value)}
                  placeholder="Nombre del responsable"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Teléfono</Label>
                <Input
                  value={(config as any)[`numero_responsable_${seccion.key}`] || ''}
                  onChange={e => updateField(`numero_responsable_${seccion.key}`, e.target.value)}
                  placeholder="600 000 000"
                  type="tel"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Normas Generales</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={config.normas_generales || ''}
            onChange={e => updateField('normas_generales', e.target.value)}
            placeholder="Texto de normas generales para la circular..."
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end items-center">
        {saved && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle2 className="h-4 w-4" /> Guardado correctamente
          </span>
        )}
        <Button onClick={handleSave} disabled={saving || !config.temporada}>
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> {existingId ? 'Actualizar' : 'Crear'} Config Ronda</>
          )}
        </Button>
      </div>
    </div>
  )
}
