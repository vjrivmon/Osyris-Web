'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getApiUrl } from '@/lib/api-utils'
import {
  Newspaper,
  Send,
  Eye,
  History,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

interface Seccion {
  id: number
  nombre: string
}

interface NewsletterRecord {
  id: number
  titulo: string
  contenido: string
  filtro_seccion_id: number | null
  filtro_estado: string | null
  enviado_por: number
  enviado_at: string
  destinatarios_count: number
  enviado_por_nombre: string
  enviado_por_apellidos: string
  seccion_nombre: string | null
}

export default function AdminNewsletterPage() {
  const { toast } = useToast()
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [filtroSeccion, setFiltroSeccion] = useState<string>('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [secciones, setSecciones] = useState<Seccion[]>([])
  const [previewCount, setPreviewCount] = useState<number | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Historial
  const [historial, setHistorial] = useState<NewsletterRecord[]>([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [historialPagination, setHistorialPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  })

  // Cargar secciones
  useEffect(() => {
    const loadSecciones = async () => {
      try {
        const token = localStorage.getItem('token')
        const apiUrl = getApiUrl()
        const res = await fetch(`${apiUrl}/api/secciones`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success || Array.isArray(data)) {
          setSecciones(Array.isArray(data) ? data : data.data || [])
        }
      } catch (err) {
        console.error('Error cargando secciones:', err)
      }
    }
    loadSecciones()
    loadHistorial(1)
  }, [])

  // Preview de destinatarios
  const loadPreview = useCallback(async () => {
    setLoadingPreview(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()
      const params = new URLSearchParams()
      if (filtroSeccion) params.set('filtro_seccion_id', filtroSeccion)
      if (filtroEstado) params.set('filtro_estado', filtroEstado)

      const res = await fetch(`${apiUrl}/api/newsletter/preview?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setPreviewCount(data.data.count)
      }
    } catch (err) {
      console.error('Error loading preview:', err)
    } finally {
      setLoadingPreview(false)
    }
  }, [filtroSeccion, filtroEstado])

  // Cargar preview al cambiar filtros
  useEffect(() => {
    loadPreview()
  }, [loadPreview])

  // Historial de newsletters
  const loadHistorial = async (page: number) => {
    setLoadingHistorial(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/api/newsletter/historial?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setHistorial(data.data)
        setHistorialPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total
        })
      }
    } catch (err) {
      console.error('Error loading historial:', err)
    } finally {
      setLoadingHistorial(false)
    }
  }

  // Enviar newsletter
  const handleSend = async () => {
    setShowConfirmDialog(false)
    setSending(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const body: Record<string, any> = { titulo, contenido }
      if (filtroSeccion) body.filtro_seccion_id = parseInt(filtroSeccion)
      if (filtroEstado) body.filtro_estado = filtroEstado

      const res = await fetch(`${apiUrl}/api/newsletter/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Newsletter enviada',
          description: data.message,
        })
        setTitulo('')
        setContenido('')
        setFiltroSeccion('')
        setFiltroEstado('')
        loadHistorial(1)
      } else {
        toast({
          title: 'Error',
          description: data.message || 'No se pudo enviar la newsletter',
          variant: 'destructive'
        })
      }
    } catch (err) {
      console.error('Error sending newsletter:', err)
      toast({
        title: 'Error',
        description: 'Ocurrio un error al enviar la newsletter',
        variant: 'destructive'
      })
    } finally {
      setSending(false)
    }
  }

  const canSend = titulo.trim() && contenido.trim() && previewCount !== null && previewCount > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Newspaper className="h-7 w-7 text-primary" />
          Newsletter
        </h1>
        <p className="text-muted-foreground mt-1">
          Envia comunicados segmentados a las familias
        </p>
      </div>

      {/* Formulario de envio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Nuevo Mensaje
          </CardTitle>
          <CardDescription>
            Redacta y envia una newsletter a las familias del grupo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Titulo *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Asunto del mensaje..."
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contenido">Contenido *</Label>
            <Textarea
              id="contenido"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe el contenido del mensaje..."
              rows={6}
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filtrar por seccion
              </Label>
              <Select value={filtroSeccion} onValueChange={(v) => setFiltroSeccion(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las secciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las secciones</SelectItem>
                  {secciones.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filtrar por estado
              </Label>
              <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="ACTIVO">Activos</SelectItem>
                  <SelectItem value="INACTIVO">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {loadingPreview ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Calculando...
                  </span>
                ) : previewCount !== null ? (
                  <>
                    Este mensaje llegara a <strong>{previewCount}</strong> familia{previewCount !== 1 ? 's' : ''}
                  </>
                ) : (
                  'Cargando...'
                )}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPreview}
              disabled={loadingPreview}
            >
              <Users className="h-3 w-3 mr-1" />
              Actualizar
            </Button>
          </div>

          {/* Boton enviar */}
          <div className="flex justify-end">
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={!canSend || sending}
              size="lg"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Newsletter
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogo de confirmacion */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar envio de newsletter</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviara &quot;{titulo}&quot; a {previewCount} familia{previewCount !== 1 ? 's' : ''}.
              Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>
              Confirmar envio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Newsletters
          </CardTitle>
          <CardDescription>
            {historialPagination.total} mensaje{historialPagination.total !== 1 ? 's' : ''} enviado{historialPagination.total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistorial ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : historial.length > 0 ? (
            <div className="space-y-3">
              {historial.map(item => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="font-semibold">{item.titulo}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {item.destinatarios_count} destinatarios
                      </Badge>
                      {item.seccion_nombre && (
                        <Badge variant="secondary">{item.seccion_nombre}</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {item.contenido}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Enviado por {item.enviado_por_nombre} {item.enviado_por_apellidos} el{' '}
                    {new Date(item.enviado_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}

              {/* Paginacion */}
              {historialPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadHistorial(historialPagination.page - 1)}
                    disabled={historialPagination.page === 1 || loadingHistorial}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {historialPagination.page} / {historialPagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadHistorial(historialPagination.page + 1)}
                    disabled={historialPagination.page === historialPagination.totalPages || loadingHistorial}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin newsletters</h3>
              <p className="text-muted-foreground">
                Aun no se ha enviado ninguna newsletter
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
