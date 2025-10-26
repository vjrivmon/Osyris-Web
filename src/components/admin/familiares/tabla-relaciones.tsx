'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Users, Trash2, Search, Shield, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/api-utils"

interface Relacion {
  id: number
  familiarId: number
  familiarNombre: string
  familiarApellidos: string
  familiarEmail: string
  educandoId: number
  educandoNombre: string
  educandoApellidos: string
  educandoSeccion: string
  relacion: string
  esContactoPrincipal: boolean
  fechaCreacion: string
}

interface TablaRelacionesProps {
  onRefresh?: () => void
}

export function TablaRelaciones({ onRefresh }: TablaRelacionesProps) {
  const [relaciones, setRelaciones] = useState<Relacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [seccionFilter, setSeccionFilter] = useState('all')
  const [relacionFilter, setRelacionFilter] = useState('all')
  const { toast } = useToast()

  const cargarRelaciones = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/relaciones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setRelaciones(data.relaciones)
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudieron cargar las relaciones",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error cargando relaciones:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar las relaciones",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarRelaciones()
  }, [])

  const desvincular = async (familiarId: number, educandoId: number, nombreFamiliar: string, nombreEducando: string) => {
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/api/admin/familiares/desvincular-scout`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ familiarId, educandoId })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "✅ Desvinculación exitosa",
          description: `${nombreEducando} ha sido desvinculado de ${nombreFamiliar}`
        })
        await cargarRelaciones()
        onRefresh?.()
      } else {
        toast({
          title: "Error",
          description: data.message || "No se pudo desvincular",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error desvinculando:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al desvincular",
        variant: "destructive"
      })
    }
  }

  const exportarCSV = () => {
    const headers = ['Familiar', 'Email', 'Educando', 'Sección', 'Relación', 'Contacto Principal', 'Fecha']
    const rows = relacionesFiltradas.map(r => [
      `${r.familiarNombre} ${r.familiarApellidos}`,
      r.familiarEmail,
      `${r.educandoNombre} ${r.educandoApellidos}`,
      r.educandoSeccion,
      getRelacionLabel(r.relacion),
      r.esContactoPrincipal ? 'Sí' : 'No',
      new Date(r.fechaCreacion).toLocaleDateString()
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relaciones-familia-educando-${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    toast({
      title: "Exportación exitosa",
      description: "El archivo CSV se ha descargado correctamente"
    })
  }

  const getRelacionLabel = (relacion: string) => {
    const labels: Record<string, string> = {
      'padre': 'Padre',
      'madre': 'Madre',
      'tutor_legal': 'Tutor Legal',
      'abuelo': 'Abuelo/a',
      'otro': 'Otro'
    }
    return labels[relacion] || relacion
  }

  const getRelacionColor = (relacion: string) => {
    const colors: Record<string, string> = {
      'padre': 'bg-blue-100 text-blue-800',
      'madre': 'bg-pink-100 text-pink-800',
      'tutor_legal': 'bg-purple-100 text-purple-800',
      'abuelo': 'bg-orange-100 text-orange-800',
      'otro': 'bg-gray-100 text-gray-800'
    }
    return colors[relacion] || colors.otro
  }

  const relacionesFiltradas = relaciones.filter(r => {
    const matchesSearch = searchTerm === '' ||
      r.familiarNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.familiarApellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.educandoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.educandoApellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.familiarEmail.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeccion = seccionFilter === 'all' || r.educandoSeccion === seccionFilter
    const matchesRelacion = relacionFilter === 'all' || r.relacion === relacionFilter

    return matchesSearch && matchesSeccion && matchesRelacion
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Relaciones Activas
            </CardTitle>
            <CardDescription>
              {relacionesFiltradas.length} de {relaciones.length} vinculaciones
            </CardDescription>
          </div>
          <Button onClick={exportarCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={seccionFilter} onValueChange={setSeccionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las secciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las secciones</SelectItem>
              <SelectItem value="Castores">Castores</SelectItem>
              <SelectItem value="Manada">Manada</SelectItem>
              <SelectItem value="Tropa">Tropa</SelectItem>
              <SelectItem value="Pioneros">Pioneros</SelectItem>
              <SelectItem value="Rutas">Rutas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={relacionFilter} onValueChange={setRelacionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las relaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las relaciones</SelectItem>
              <SelectItem value="padre">Padre</SelectItem>
              <SelectItem value="madre">Madre</SelectItem>
              <SelectItem value="tutor_legal">Tutor Legal</SelectItem>
              <SelectItem value="abuelo">Abuelo/a</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : relacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay relaciones</h3>
            <p className="text-muted-foreground">
              {searchTerm || seccionFilter !== 'all' || relacionFilter !== 'all'
                ? 'No se encontraron relaciones con los filtros aplicados'
                : 'No hay relaciones familia-educando registradas'}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Familiar</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Educando</TableHead>
                  <TableHead>Sección</TableHead>
                  <TableHead>Relación</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relacionesFiltradas.map((relacion) => (
                  <TableRow key={relacion.id}>
                    <TableCell className="font-medium">
                      {relacion.familiarNombre} {relacion.familiarApellidos}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {relacion.familiarEmail}
                    </TableCell>
                    <TableCell className="font-medium">
                      {relacion.educandoNombre} {relacion.educandoApellidos}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{relacion.educandoSeccion}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRelacionColor(relacion.relacion)}>
                        {getRelacionLabel(relacion.relacion)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {relacion.esContactoPrincipal && (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Principal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(relacion.fechaCreacion).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Desvincular educando?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que deseas desvincular a{' '}
                              <strong>{relacion.educandoNombre} {relacion.educandoApellidos}</strong> de{' '}
                              <strong>{relacion.familiarNombre} {relacion.familiarApellidos}</strong>?
                              <br /><br />
                              Esta acción eliminará el acceso del familiar a la información del educando.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => desvincular(
                                relacion.familiarId,
                                relacion.educandoId,
                                `${relacion.familiarNombre} ${relacion.familiarApellidos}`,
                                `${relacion.educandoNombre} ${relacion.educandoApellidos}`
                              )}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Desvincular
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
