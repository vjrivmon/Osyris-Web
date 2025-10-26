'use client'

import { InvitarFamiliarModal } from '@/components/admin/familiares/invitar-familiar-v2'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminFamiliaresInvitarPage() {
  const [showInvitarModal, setShowInvitarModal] = useState(false)

  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Invitación enviada",
      description: "La invitación se ha enviado correctamente",
    })
    setShowInvitarModal(false)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invitar Familiar</h1>
          <p className="text-muted-foreground">
            Envía una invitación a un nuevo familiar para que se una al portal
          </p>
        </div>
        <Button onClick={() => setShowInvitarModal(true)}>
          <Users className="h-4 w-4 mr-2" />
          Nueva Invitación
        </Button>
      </div>

      {/* Información */}
      <Card>
        <CardHeader>
          <CardTitle>Proceso de Invitación</CardTitle>
          <CardDescription>
            Cómo funciona el sistema de invitaciones familiares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-medium">1. Datos del Familiar</h3>
                <p className="text-sm text-muted-foreground">
                  Introduce la información básica del familiar: nombre, apellidos, email y teléfono.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">2. Vincular Educandos</h3>
                <p className="text-sm text-muted-foreground">
                  Selecciona uno o más educandos que serán vinculados a este familiar.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">3. Tipo de Relación</h3>
                <p className="text-sm text-muted-foreground">
                  Especifica el tipo de relación familiar (padre, madre, tutor, etc.).
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">4. Enviar Invitación</h3>
                <p className="text-sm text-muted-foreground">
                  El sistema enviará un email con las instrucciones para activar la cuenta.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Características del Sistema:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Credenciales temporales enviadas por email</li>
                <li>• Enlace de activación válido por 48 horas</li>
                <li>• Instrucciones detalladas para el primer acceso</li>
                <li>• Notificaciones automáticas a los monitores</li>
                <li>• Seguimiento del estado de la invitación</li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={() => setShowInvitarModal(true)} size="lg">
                Comenzar Invitación
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <InvitarFamiliarModal
        open={showInvitarModal}
        onOpenChange={setShowInvitarModal}
        onSuccess={handleSuccess}
      />
    </div>
  )
}