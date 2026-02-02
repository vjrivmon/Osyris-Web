'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Clock, AlertCircle, Search, FileText, Send, Eye, Download, X, Phone, Heart, User } from 'lucide-react'
import { getApiUrl } from '@/lib/api-utils'
import type { DashboardStats } from '@/types/circular-digital'

interface CircularEstadoDashboardProps {
  actividadId?: number
}

export function CircularEstadoDashboard({ actividadId }: CircularEstadoDashboardProps) {
  const [circulares, setCirculares] = useState<any[]>([])
  const [selectedCircular, setSelectedCircular] = useState<any>(null)
  const [inscritos, setInscritos] = useState<any[]>([])
  const [stats, setStats] = useState<DashboardStats>({ total: 0, firmadas: 0, pendientes: 0, error: 0 })
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [detalleModal, setDetalleModal] = useState<any>(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  const getAuth = () => {
    const token = localStorage.getItem('token')
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  // Load circulares list
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        if (actividadId) {
          const res = await fetch(`${getApiUrl()}/api/admin/circular/${actividadId}/estado`, { headers: getAuth() })
          const data = await res.json()
          if (data.success) {
            setSelectedCircular(data.data.circular)
            setInscritos(data.data.inscritos || [])
            setStats(data.data.stats || { total: 0, firmadas: 0, pendientes: 0, error: 0 })
          }
        } else {
          const res = await fetch(`${getApiUrl()}/api/admin/circulares`, { headers: getAuth() })
          const data = await res.json()
          if (data.success) setCirculares(data.data || [])
        }
      } catch { /* */ }
      setLoading(false)
    }
    load()
  }, [actividadId])

  const loadDashboard = useCallback(async (actId: number) => {
    setLoading(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/circular/${actId}/estado`, { headers: getAuth() })
      const data = await res.json()
      if (data.success) {
        setSelectedCircular(data.data.circular)
        setInscritos(data.data.inscritos || [])
        setStats(data.data.stats || { total: 0, firmadas: 0, pendientes: 0, error: 0 })
      }
    } catch { /* */ }
    setLoading(false)
  }, [])

  const verDetalle = async (educandoId: number) => {
    if (!selectedCircular) return
    setLoadingDetalle(true)
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/circular/${selectedCircular.id}/respuesta/${educandoId}`, { headers: getAuth() })
      const data = await res.json()
      if (data.success) {
        setDetalleModal(data.data)
      }
    } catch { /* */ }
    setLoadingDetalle(false)
  }

  const filteredInscritos = inscritos.filter(i => {
    if (!busqueda) return true
    const term = busqueda.toLowerCase()
    return i.educando_nombre?.toLowerCase().includes(term) || i.educando_apellidos?.toLowerCase().includes(term)
  })

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando...</div>
  }

  // List view
  if (!selectedCircular && !actividadId) {
    return (
      <div className="space-y-4" data-testid="circulares-list">
        <h2 className="text-xl font-bold">Circulares Digitales</h2>
        {circulares.length === 0 ? (
          <p className="text-muted-foreground">No hay circulares creadas.</p>
        ) : (
          circulares.map(c => (
            <Card key={c.id} className="cursor-pointer hover:shadow-md" onClick={() => loadDashboard(c.actividad_id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.titulo}</p>
                  <p className="text-sm text-muted-foreground">{c.actividad_titulo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={c.estado === 'publicada' ? 'default' : 'secondary'}>{c.estado}</Badge>
                  <span className="text-sm text-muted-foreground">{c.total_respuestas || 0}/{c.total_inscritos || 0} firmadas</span>
                  {c.estado === 'borrador' && (
                    <Button
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation()
                        try {
                          const res = await fetch(`${getApiUrl()}/api/admin/circulares/${c.id}/publicar`, {
                            method: 'PUT',
                            headers: getAuth()
                          })
                          const data = await res.json()
                          if (data.success) {
                            // Refresh list
                            const listRes = await fetch(`${getApiUrl()}/api/admin/circulares`, { headers: getAuth() })
                            const listData = await listRes.json()
                            if (listData.success) setCirculares(listData.data || [])
                          }
                        } catch { /* */ }
                      }}
                      className="flex items-center gap-1"
                    >
                      <Send className="h-3 w-3" /> Publicar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  // Dashboard view
  return (
    <div className="space-y-4" data-testid="circular-dashboard">
      {selectedCircular && (
        <div>
          <h2 className="text-xl font-bold">{selectedCircular.titulo}</h2>
          <p className="text-sm text-muted-foreground">{selectedCircular.actividad_titulo}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="dashboard-stats">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total inscritos</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.firmadas}</p>
            <p className="text-xs text-muted-foreground">Firmadas</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.pendientes}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.error}</p>
            <p className="text-xs text-muted-foreground">Errores</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar educando..." className="pl-10" />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Educando</th>
              <th className="text-left p-3">Sección</th>
              <th className="text-left p-3">Familiar</th>
              <th className="text-center p-3">Estado</th>
              <th className="text-center p-3">Fecha firma</th>
              <th className="text-center p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredInscritos.map((i, idx) => (
              <tr key={idx} className="border-t hover:bg-muted/50">
                <td className="p-3 font-medium">{i.educando_nombre} {i.educando_apellidos}</td>
                <td className="p-3">{i.seccion}</td>
                <td className="p-3">{i.familiar_nombre}<br/><span className="text-xs text-muted-foreground">{i.familiar_email}</span></td>
                <td className="p-3 text-center">
                  {i.estado_circular === 'archivada' || i.estado_circular === 'firmada' || i.estado_circular === 'pdf_generado' ? (
                    <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />Firmada</Badge>
                  ) : i.estado_circular?.startsWith('error') ? (
                    <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>
                  ) : (
                    <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
                  )}
                </td>
                <td className="p-3 text-center text-xs">
                  {i.fecha_firma ? new Date(i.fecha_firma).toLocaleDateString('es-ES') : '-'}
                </td>
                <td className="p-3 text-center">
                  {(i.estado_circular === 'archivada' || i.estado_circular === 'firmada' || i.estado_circular === 'pdf_generado') && (
                    <Button size="sm" variant="outline" onClick={() => verDetalle(i.educando_id)} disabled={loadingDetalle}>
                      <Eye className="h-3 w-3 mr-1" /> Ver
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredInscritos.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No hay inscritos que mostrar.</p>
        )}
      </div>

      {/* Modal Detalle Respuesta */}
      {detalleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetalleModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold">
                  {detalleModal.educando?.nombre} {detalleModal.educando?.apellidos}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {detalleModal.educando?.seccion_nombre} — Firmada el {new Date(detalleModal.respuesta.fecha_firma).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDetalleModal(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              {/* Familiar que firmó */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> Tutor/a que firmó</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>{detalleModal.familiar?.nombre} {detalleModal.familiar?.apellidos}</strong></p>
                  <p>DNI: {detalleModal.familiar?.dni || 'No registrado'}</p>
                  <p>Teléfono: {detalleModal.familiar?.telefono || '-'}</p>
                  <p>Email: {detalleModal.familiar?.email || '-'}</p>
                </CardContent>
              </Card>

              {/* Datos médicos */}
              {detalleModal.respuesta.datos_medicos_snapshot && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Heart className="h-4 w-4" /> Datos médicos (snapshot)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    {(() => {
                      const dm = typeof detalleModal.respuesta.datos_medicos_snapshot === 'string'
                        ? JSON.parse(detalleModal.respuesta.datos_medicos_snapshot)
                        : detalleModal.respuesta.datos_medicos_snapshot;
                      return (
                        <div className="grid grid-cols-2 gap-2">
                          {dm.alergias && (<div><span className="text-muted-foreground">Alergias:</span> {dm.alergias}</div>)}
                          {dm.intolerancias && (<div><span className="text-muted-foreground">Intolerancias:</span> {dm.intolerancias}</div>)}
                          {dm.medicacion && (<div><span className="text-muted-foreground">Medicación:</span> {dm.medicacion}</div>)}
                          {dm.grupo_sanguineo && (<div><span className="text-muted-foreground">Grupo sanguíneo:</span> {dm.grupo_sanguineo}</div>)}
                          {dm.tarjeta_sanitaria && (<div><span className="text-muted-foreground">SIP:</span> {dm.tarjeta_sanitaria}</div>)}
                          {dm.enfermedades_cronicas && (<div><span className="text-muted-foreground">Enfermedades crónicas:</span> {dm.enfermedades_cronicas}</div>)}
                          {dm.observaciones_medicas && (<div className="col-span-2"><span className="text-muted-foreground">Observaciones:</span> {dm.observaciones_medicas}</div>)}
                          <div><span className="text-muted-foreground">Puede hacer deporte:</span> {dm.puede_hacer_deporte ? '✅ Sí' : '❌ No'}</div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Contactos emergencia */}
              {detalleModal.respuesta.contactos_emergencia_snapshot && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" /> Contactos de emergencia</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    {(() => {
                      const contactos = typeof detalleModal.respuesta.contactos_emergencia_snapshot === 'string'
                        ? JSON.parse(detalleModal.respuesta.contactos_emergencia_snapshot)
                        : detalleModal.respuesta.contactos_emergencia_snapshot;
                      return (
                        <div className="space-y-2">
                          {Array.isArray(contactos) && contactos.map((c: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                              <span className="font-medium">{i + 1}.</span>
                              <span>{c.nombre_completo || c.nombre}</span>
                              <span className="text-muted-foreground">({c.relacion})</span>
                              <span className="ml-auto font-mono">{c.telefono}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Firma */}
              {detalleModal.respuesta.firma_base64 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">✍️ Firma</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <img
                      src={detalleModal.respuesta.firma_base64}
                      alt="Firma del tutor"
                      className="max-h-32 border rounded bg-white p-2"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Descargar PDF */}
              {detalleModal.respuesta.pdf_local_path && (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={() => {
                      const pdfPath = detalleModal.respuesta.pdf_local_path;
                      const fileName = pdfPath.split('/').pop();
                      window.open(`${getApiUrl()}/uploads/circulares/${fileName}`, '_blank');
                    }}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Descargar PDF firmado
                  </Button>
                </div>
              )}

              {/* Metadata */}
              <p className="text-xs text-muted-foreground text-center">
                IP: {detalleModal.respuesta.ip_firma} · Versión: {detalleModal.respuesta.version}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
