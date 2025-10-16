"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken, makeAuthenticatedRequest } from "@/lib/auth-utils"
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Calendar,
  Phone,
  MapPin
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminUsers() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    rol: 'scouter'
  })

  useEffect(() => {
    loadUsers()
  }, [])

  // Using centralized auth utils now - getAuthToken imported

  const loadUsers = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        setUsers([])
        return
      }

      const data = await makeAuthenticatedRequest('/api/usuarios')

      if (data.success && data.data) {
        setUsers(data.data)
      } else if (Array.isArray(data)) {
        setUsers(data)
      } else {
        console.error('Failed to load users: Invalid response format')
        setUsers([])
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    }
  }

  const addUser = async () => {
    try {
      setIsLoading(true)
      const token = getAuthToken()

      const data = await makeAuthenticatedRequest('/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })

      if (data.success) {
        toast({
          title: '✅ Usuario creado',
          description: 'El usuario se ha creado correctamente'
        })
        setNewUser({
          email: '',
          password: '',
          nombre: '',
          apellidos: '',
          telefono: '',
          direccion: '',
          fecha_nacimiento: '',
          rol: 'scouter'
        })
        setShowAddUser(false)
        loadUsers()
      } else {
        throw new Error(data.message || 'Error al crear usuario')
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al crear usuario',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const token = getAuthToken()
      const response = await makeAuthenticatedRequest(`/api/usuarios/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ activo: !currentStatus })
      })

      if (response.ok) {
        toast({
          title: '✅ Estado actualizado',
          description: `Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`
        })
        loadUsers()
      } else {
        throw new Error('Error al cambiar estado del usuario')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado del usuario',
        variant: 'destructive'
      })
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return

    try {
      const token = getAuthToken()
      const response = await makeAuthenticatedRequest(`/api/usuarios/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: '✅ Usuario eliminado',
          description: 'El usuario se ha eliminado correctamente'
        })
        loadUsers()
      } else {
        throw new Error('Error al eliminar usuario')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive'
      })
    }
  }

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Badge variant="destructive" className="bg-red-600">Administrador</Badge>
      case 'scouter':
        return <Badge variant="secondary">Scouter</Badge>
      default:
        return <Badge variant="outline">{rol}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada'
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getInitials = (nombre: string, apellidos: string) => {
    return `${nombre?.charAt(0) || ''}${apellidos?.charAt(0) || ''}`.toUpperCase()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-red-200 dark:border-red-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-red-900 dark:text-red-100">👥 Gestión de Usuarios</h1>
          <p className="text-red-600 dark:text-red-400 mt-2">
            Administra todos los usuarios del sistema
          </p>
        </div>
        <Button
          onClick={() => setShowAddUser(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold text-red-600">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.rol === 'admin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scouters</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.rol === 'scouter').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.activo).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-900 dark:text-red-100">Lista de Usuarios</CardTitle>
          <CardDescription>
            Gestiona la información y permisos de todos los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      {user.foto_perfil ? (
                        <img
                          src={user.foto_perfil}
                          alt={`${user.nombre} ${user.apellidos}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-red-700 dark:text-red-300 font-medium">
                          {getInitials(user.nombre, user.apellidos)}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {user.nombre} {user.apellidos}
                        </h3>
                        {getRoleBadge(user.rol)}
                        <Badge variant={user.activo ? 'default' : 'secondary'}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          {user.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.telefono}
                            </span>
                          )}
                        </div>
                        {(user.direccion || user.fecha_nacimiento) && (
                          <div className="flex items-center gap-4">
                            {user.direccion && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {user.direccion}
                              </span>
                            )}
                            {user.fecha_nacimiento && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(user.fecha_nacimiento)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.activo)}
                      className={user.activo ?
                        "text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-950" :
                        "text-green-600 hover:bg-green-100 dark:hover:bg-green-950"
                      }
                    >
                      {user.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay usuarios registrados</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Crea el primer usuario usando el botón "Nuevo Usuario"
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-900 dark:text-red-100">Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea una nueva cuenta de usuario en el sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                  className="border-red-200 dark:border-red-800"
                  placeholder="Nombre"
                />
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input
                  id="apellidos"
                  value={newUser.apellidos}
                  onChange={(e) => setNewUser({...newUser, apellidos: e.target.value})}
                  className="border-red-200 dark:border-red-800"
                  placeholder="Apellidos"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="border-red-200 dark:border-red-800"
                placeholder="usuario@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="border-red-200 dark:border-red-800 pr-10"
                  placeholder="Mínimo 6 caracteres"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={newUser.telefono}
                  onChange={(e) => setNewUser({...newUser, telefono: e.target.value})}
                  className="border-red-200 dark:border-red-800"
                  placeholder="666123456"
                />
              </div>
              <div>
                <Label htmlFor="fecha_nacimiento">Fecha Nacimiento</Label>
                <Input
                  id="fecha_nacimiento"
                  type="date"
                  value={newUser.fecha_nacimiento}
                  onChange={(e) => setNewUser({...newUser, fecha_nacimiento: e.target.value})}
                  className="border-red-200 dark:border-red-800"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={newUser.direccion}
                onChange={(e) => setNewUser({...newUser, direccion: e.target.value})}
                className="border-red-200 dark:border-red-800"
                placeholder="Calle Principal 123"
              />
            </div>

            <div>
              <Label htmlFor="rol">Rol *</Label>
              <Select value={newUser.rol} onValueChange={(value) => setNewUser({...newUser, rol: value})}>
                <SelectTrigger className="border-red-200 dark:border-red-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scouter">Scouter</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>
              Cancelar
            </Button>
            <Button
              onClick={addUser}
              disabled={isLoading || !newUser.email || !newUser.password || !newUser.nombre}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}