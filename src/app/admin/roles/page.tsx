"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Shield, Search, Plus, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const PERMISOS_LABELS: Record<string, string> = {
  aprobar_documentos: "Aprobar documentos",
  gestionar_eventos: "Gestionar eventos",
  ver_metricas: "Ver metricas",
  gestionar_secciones: "Gestionar secciones",
  enviar_newsletter: "Enviar newsletter",
}

interface Usuario {
  id: number
  nombre: string
  apellidos: string
  email: string
  rol: string
  activo: boolean
}

interface Permiso {
  id: number
  usuario_id: number
  permiso: string
  seccion_id: number | null
  otorgado_por: number | null
  created_at: string
}

export default function RolesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [permisosMap, setPermisosMap] = useState<Record<number, Permiso[]>>({})
  const [tiposPermisos, setTiposPermisos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState<string>("todos")
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; permisoId: number | null; label: string }>({
    open: false,
    permisoId: null,
    label: "",
  })

  // Solo superadmin puede acceder
  useEffect(() => {
    const userRoles = user?.roles || [user?.rol]
    if (user && !userRoles.includes("superadmin")) {
      router.push("/admin/dashboard")
    }
  }, [user, router])

  const getToken = () => localStorage.getItem("token")

  const fetchTiposPermisos = useCallback(async () => {
    try {
      const res = await fetch("/api/permisos/tipos-disponibles", {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setTiposPermisos(data.data)
      }
    } catch (err) {
      console.error("Error cargando tipos de permisos:", err)
    }
  }, [])

  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users?limit=200", {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setUsuarios(data.data?.users || data.data || [])
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err)
      setError("Error al cargar usuarios")
    }
  }, [])

  const fetchPermisos = useCallback(async (usuarioId: number) => {
    try {
      const res = await fetch(`/api/permisos/${usuarioId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        setPermisosMap((prev) => ({ ...prev, [usuarioId]: data.data }))
      }
    } catch (err) {
      console.error(`Error cargando permisos de usuario ${usuarioId}:`, err)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchTiposPermisos(), fetchUsuarios()])
      setLoading(false)
    }
    loadData()
  }, [fetchTiposPermisos, fetchUsuarios])

  // Cargar permisos para cada usuario visible
  useEffect(() => {
    const filteredUsers = getFilteredUsuarios()
    filteredUsers.forEach((u) => {
      if (!permisosMap[u.id]) {
        fetchPermisos(u.id)
      }
    })
  }, [usuarios, searchTerm, filterRol])

  const getFilteredUsuarios = () => {
    return usuarios.filter((u) => {
      const matchSearch =
        !searchTerm ||
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchRol = filterRol === "todos" || u.rol === filterRol
      return matchSearch && matchRol && u.activo
    })
  }

  const hasPermiso = (usuarioId: number, permiso: string): boolean => {
    const permisos = permisosMap[usuarioId] || []
    return permisos.some((p) => p.permiso === permiso)
  }

  const getPermisoId = (usuarioId: number, permiso: string): number | null => {
    const permisos = permisosMap[usuarioId] || []
    const found = permisos.find((p) => p.permiso === permiso)
    return found ? found.id : null
  }

  const togglePermiso = async (usuarioId: number, permiso: string) => {
    const key = `${usuarioId}-${permiso}`
    setSaving(key)
    setError(null)

    try {
      if (hasPermiso(usuarioId, permiso)) {
        // Revocar
        const permisoId = getPermisoId(usuarioId, permiso)
        if (permisoId) {
          setDeleteDialog({
            open: true,
            permisoId,
            label: `${PERMISOS_LABELS[permiso] || permiso}`,
          })
        }
      } else {
        // Asignar
        const res = await fetch("/api/permisos", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usuario_id: usuarioId, permiso }),
        })
        const data = await res.json()
        if (data.success) {
          await fetchPermisos(usuarioId)
        } else {
          setError(data.message || "Error al asignar permiso")
        }
      }
    } catch (err) {
      setError("Error de conexion al gestionar permiso")
    } finally {
      setSaving(null)
    }
  }

  const confirmDeletePermiso = async () => {
    if (!deleteDialog.permisoId) return

    setSaving(`delete-${deleteDialog.permisoId}`)
    try {
      const res = await fetch(`/api/permisos/${deleteDialog.permisoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (data.success) {
        // Refrescar permisos de todos los usuarios
        Object.keys(permisosMap).forEach((id) => fetchPermisos(Number(id)))
      } else {
        setError(data.message || "Error al revocar permiso")
      }
    } catch (err) {
      setError("Error de conexion al revocar permiso")
    } finally {
      setSaving(null)
      setDeleteDialog({ open: false, permisoId: null, label: "" })
    }
  }

  const getRolLabel = (rol: string) => {
    const labels: Record<string, string> = {
      superadmin: "Superadmin",
      kraal: "Kraal",
      jefe_seccion: "Jefe de seccion",
      familia: "Familia",
      educando: "Educando",
      comite: "Comite",
    }
    return labels[rol] || rol
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const filteredUsuarios = getFilteredUsuarios()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Gestion de Permisos</h1>
          <p className="text-sm text-muted-foreground">
            Asigna y revoca permisos granulares a los usuarios del sistema
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
            Cerrar
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
                <SelectItem value="kraal">Kraal</SelectItem>
                <SelectItem value="jefe_seccion">Jefe de seccion</SelectItem>
                <SelectItem value="familia">Familia</SelectItem>
                <SelectItem value="comite">Comite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Usuarios ({filteredUsuarios.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Usuario</TableHead>
                  <TableHead className="min-w-[100px]">Rol</TableHead>
                  {tiposPermisos.map((permiso) => (
                    <TableHead key={permiso} className="text-center min-w-[120px]">
                      {PERMISOS_LABELS[permiso] || permiso}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2 + tiposPermisos.length} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {usuario.nombre} {usuario.apellidos}
                          </div>
                          <div className="text-xs text-muted-foreground">{usuario.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {getRolLabel(usuario.rol)}
                        </span>
                      </TableCell>
                      {tiposPermisos.map((permiso) => {
                        const isSuperadmin = usuario.rol === "superadmin"
                        const has = hasPermiso(usuario.id, permiso)
                        const key = `${usuario.id}-${permiso}`
                        const isSaving = saving === key

                        return (
                          <TableCell key={permiso} className="text-center">
                            {isSuperadmin ? (
                              <span className="text-xs text-muted-foreground" title="Superadmin tiene todos los permisos">
                                AUTO
                              </span>
                            ) : (
                              <button
                                onClick={() => togglePermiso(usuario.id, permiso)}
                                disabled={isSaving}
                                className={`w-10 h-6 rounded-full transition-colors relative ${
                                  has
                                    ? "bg-primary"
                                    : "bg-muted border border-border"
                                } ${isSaving ? "opacity-50" : "cursor-pointer hover:opacity-80"}`}
                                title={has ? "Click para revocar" : "Click para asignar"}
                              >
                                <span
                                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                    has ? "translate-x-4" : "translate-x-0.5"
                                  }`}
                                />
                                {isSaving && (
                                  <Loader2 className="h-3 w-3 animate-spin absolute top-1.5 left-1/2 -translate-x-1/2 text-muted-foreground" />
                                )}
                              </button>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, permisoId: null, label: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revocar permiso?</AlertDialogTitle>
            <AlertDialogDescription>
              Estas a punto de revocar el permiso &quot;{deleteDialog.label}&quot;. El usuario perdera acceso a esta funcionalidad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePermiso}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revocar permiso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
