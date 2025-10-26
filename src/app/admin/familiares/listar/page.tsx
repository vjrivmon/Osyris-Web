'use client'

import { FamiliaresList } from '@/components/admin/familiares/familiares-list'
import { InvitarFamiliarModal } from '@/components/admin/familiares/invitar-familiar'
import { VincularEducandoModal } from '@/components/admin/familiares/vincular-educando'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAdminFamiliares } from '@/hooks/useAdminFamiliares'

export default function AdminFamiliaresListarPage() {
  const [showInvitarModal, setShowInvitarModal] = useState(false)
  const [showVincularModal, setShowVincularModal] = useState(false)

  const { cargarFamiliares } = useAdminFamiliares()
  const { toast } = useToast()

  const handleSuccess = () => {
    cargarFamiliares()
    toast({
      title: "Operación exitosa",
      description: "La operación se ha completado correctamente",
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Listado de Familiares</h1>
          <p className="text-muted-foreground">
            Gestiona todas las cuentas familiares del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowInvitarModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar Familiar
          </Button>
          <Button variant="outline" onClick={() => setShowVincularModal(true)}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Vincular Educando
          </Button>
        </div>
      </div>

      {/* Lista de familiares */}
      <FamiliaresList
        onInvitarFamilia={() => setShowInvitarModal(true)}
        onVincularScouts={() => setShowVincularModal(true)}
      />

      {/* Modales */}
      <InvitarFamiliarModal
        open={showInvitarModal}
        onOpenChange={setShowInvitarModal}
        onSuccess={handleSuccess}
      />

      <VincularEducandoModal
        open={showVincularModal}
        onOpenChange={setShowVincularModal}
        onSuccess={handleSuccess}
      />
    </div>
  )
}