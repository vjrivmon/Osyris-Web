'use client'

import { VincularEducandoModal } from '@/components/admin/familiares/vincular-educando'
import { TablaRelaciones } from '@/components/admin/familiares/tabla-relaciones'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link as LinkIcon, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminFamiliaresVincularPage() {
  const [showVincularModal, setShowVincularModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Vinculación exitosa",
      description: "El educando ha sido vinculado correctamente",
    })
    setShowVincularModal(false)
    setRefreshKey(prev => prev + 1) // Refrescar tabla
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vincular Educando a Familiar</h1>
          <p className="text-muted-foreground">
            Crea nuevas vinculaciones entre educandos y familias existentes
          </p>
        </div>
        <Button onClick={() => setShowVincularModal(true)}>
          <LinkIcon className="h-4 w-4 mr-2" />
          Nueva Vinculación
        </Button>
      </div>

      {/* Información */}
      <Card>
        <CardHeader>
          <CardTitle>Proceso de Vinculación</CardTitle>
          <CardDescription>
            Cómo funciona el sistema de vinculación familiar-scout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-medium">1. Seleccionar Familiar</h3>
                <p className="text-sm text-muted-foreground">
                  Busca y selecciona un familiar existente al que quieras vincular un scout.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">2. Seleccionar Educando</h3>
                <p className="text-sm text-muted-foreground">
                  Busca y selecciona el educando que será vinculado al familiar.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">3. Definir Relación</h3>
                <p className="text-sm text-muted-foreground">
                  Especifica el tipo de relación familiar y si será el contacto principal.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">4. Confirmar Vinculación</h3>
                <p className="text-sm text-muted-foreground">
                  Revisa los detalles y confirma la vinculación.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Tipos de Relación Disponibles:</h3>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span><strong>Padre/Madre:</strong> Padre o madre biológico/a del educando</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span><strong>Tutor Legal:</strong> Tutor con documentación legal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span><strong>Abuelo/a:</strong> Abuelo/a materno/a o paterno/a</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span><strong>Otro:</strong> Otro tipo de relación familiar</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Características del Sistema:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Notificación automática al familiar</li>
                <li>• Contacto principal único por educando</li>
                <li>• Límite de familiares por educando (configurable)</li>
                <li>• Historial de vinculaciones</li>
                <li>• Posibilidad de desvincular cuando sea necesario</li>
              </ul>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={() => setShowVincularModal(true)} size="lg">
                Comenzar Vinculación
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Relaciones Existentes */}
      <TablaRelaciones key={refreshKey} onRefresh={handleRefresh} />

      {/* Modal */}
      <VincularEducandoModal
        open={showVincularModal}
        onOpenChange={setShowVincularModal}
        onSuccess={handleSuccess}
      />
    </div>
  )
}