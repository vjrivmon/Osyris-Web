'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QuickAddModal } from '@/components/admin/quick-add-modal'
import { BulkInviteModal } from '@/components/admin/bulk-invite-modal'
import {
  Mail,
  UserPlus,
  Users,
  Clock,
  Send,
  RefreshCw,
} from 'lucide-react'
import { getAuthToken, makeAuthenticatedRequest } from '@/lib/auth-utils'
import { useToast } from '@/hooks/use-toast'

interface PendingUser {
  id: number
  email: string
  nombre: string
  apellidos: string
  rol: string
  invitation_expires_at: string
}

interface InvitacionesPanelProps {
  onRefresh?: () => void
}

export function InvitacionesPanel({ onRefresh }: InvitacionesPanelProps) {
  const { toast } = useToast()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPendingUsers()
  }, [])

  const loadPendingUsers = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await makeAuthenticatedRequest('/api/admin/users/pending')
      if (response) {
        setPendingUsers(response.data || [])
      }
    } catch (error) {
      console.error('Error loading pending users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendInvitation = async (userId: number) => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await makeAuthenticatedRequest(`/api/admin/invitations/${userId}/resend`, {
        method: 'POST'
      })

      if (response) {
        toast({
          title: 'Invitacion reenviada',
          description: 'Se ha enviado un nuevo correo de invitacion',
        })
        loadPendingUsers()
      }
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast({
        title: 'Error',
        description: 'No se pudo reenviar la invitacion',
        variant: 'destructive',
      })
    }
  }

  const handleUserAdded = () => {
    loadPendingUsers()
    onRefresh?.()
    toast({
      title: 'Usuario invitado',
      description: 'La invitacion se ha enviado correctamente',
    })
  }

  const handleBulkInvitesSent = () => {
    loadPendingUsers()
    onRefresh?.()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Sistema de Invitaciones</CardTitle>
              <CardDescription>Gestiona las invitaciones de usuarios</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={loadPendingUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botones de accion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickAddModal
            onUserAdded={handleUserAdded}
            trigger={
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Enviar Invitacion
              </Button>
            }
          />

          <BulkInviteModal
            onInvitesSent={handleBulkInvitesSent}
            trigger={
              <Button variant="outline" className="w-full border-orange-500 text-orange-600 hover:bg-orange-50">
                <Users className="h-4 w-4 mr-2" />
                Invitaciones Multiples
              </Button>
            }
          />
        </div>

        {/* Usuarios pendientes */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Pendientes de registro
            </span>
            <Badge variant={pendingUsers.length > 0 ? 'secondary' : 'outline'}>
              {pendingUsers.length}
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay invitaciones pendientes</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {pendingUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.nombre} {user.apellidos}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {user.rol}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(user.invitation_expires_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleResendInvitation(user.id)}
                    title="Reenviar invitacion"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {pendingUsers.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Y {pendingUsers.length - 5} mas...
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
