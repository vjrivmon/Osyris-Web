'use client'

import { useState, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useEducandosScouter } from '@/hooks/useEducandosScouter'
import { EducandosList } from '@/components/aula-virtual/educandos/educandos-list'
import { EducandoFilters } from '@/components/aula-virtual/educandos/educando-filters'
import { EducandoFormModal } from '@/components/aula-virtual/educandos/educando-form-modal'
import { EducandoDetailModal } from '@/components/aula-virtual/educandos/educando-detail-modal'
import { SendNotificationModal } from '@/components/aula-virtual/educandos/send-notification-modal'
import { SendMessageModal } from '@/components/aula-virtual/educandos/send-message-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, AlertCircle, Users, Loader2, Mail } from 'lucide-react'
import { EducandoConDocs } from '@/types/educando-scouter'

export default function EducandosPage() {
  const { user } = useAuth()
  const {
    educandos,
    loading,
    error,
    pagination,
    filters,
    diagnosticInfo,
    setFilters,
    resetFilters,
    createEducando,
    updateEducando,
    deactivateEducando,
    fetchDocumentacion,
    sendNotificacion
  } = useEducandosScouter()

  // Estados de modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [selectedEducando, setSelectedEducando] = useState<EducandoConDocs | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Handlers
  const handleAddNew = () => {
    setSelectedEducando(null)
    setIsEditing(false)
    setIsFormModalOpen(true)
  }

  const handleEdit = (educando: EducandoConDocs) => {
    setSelectedEducando(educando)
    setIsEditing(true)
    setIsFormModalOpen(true)
  }

  const handleViewDetail = (educando: EducandoConDocs) => {
    setSelectedEducando(educando)
    setIsDetailModalOpen(true)
  }

  const handleNotify = (educando: EducandoConDocs) => {
    setSelectedEducando(educando)
    setIsNotificationModalOpen(true)
  }

  const handleFormSubmit = async (data: Parameters<typeof createEducando>[0]) => {
    if (isEditing && selectedEducando) {
      const result = await updateEducando(selectedEducando.id, data)
      if (result) {
        setIsFormModalOpen(false)
        setSelectedEducando(null)
      }
      return !!result
    } else {
      const result = await createEducando(data)
      if (result) {
        setIsFormModalOpen(false)
      }
      return !!result
    }
  }

  const handleDeactivate = async (id: number) => {
    const success = await deactivateEducando(id)
    if (success) {
      setIsDetailModalOpen(false)
      setSelectedEducando(null)
    }
    return success
  }

  const handleSendNotification = async (documentosFaltantes: string[], mensaje?: string) => {
    if (!selectedEducando) return false
    const success = await sendNotificacion(selectedEducando.id, {
      documentos_faltantes: documentosFaltantes,
      mensaje
    })
    if (success) {
      setIsNotificationModalOpen(false)
    }
    return success
  }

  // Obtener nombre de la sección del primer educando (si existe)
  const seccionNombre = educandos.length > 0 && educandos[0].seccion_nombre
    ? educandos[0].seccion_nombre
    : 'tu seccion'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Educandos de {seccionNombre}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los educandos de tu sección y controla el estado de su documentación
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => setIsMessageModalOpen(true)}
            disabled={educandos.filter(e => e.tiene_familia_vinculada).length === 0}
          >
            <Mail className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Mensaje a Familias</span>
            <span className="sm:hidden">Mensaje</span>
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nuevo Educando</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Educandos</CardDescription>
            <CardTitle className="text-3xl">{pagination.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Docs Completos</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {educandos.filter(e => e.docs_completos === e.docs_total).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Docs Pendientes</CardDescription>
            <CardTitle className="text-3xl text-amber-600">
              {educandos.filter(e => e.docs_pendientes > 0).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sin Familia</CardDescription>
            <CardTitle className="text-3xl text-gray-500">
              {educandos.filter(e => !e.tiene_familia_vinculada).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Suspense fallback={
        <div className="h-12 bg-muted/50 rounded-lg animate-pulse" />
      }>
        <EducandoFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
        />
      </Suspense>

      {/* Main Content */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : educandos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No hay educandos</h3>
              <p className="text-muted-foreground mt-1 max-w-md">
                {filters.search ||
                 filters.genero ||
                 filters.estadoDocs !== 'todos' ||
                 filters.grupoEdad !== 'todos' ||
                 filters.activo !== 'activos'
                  ? 'No se encontraron educandos con los filtros seleccionados. Prueba a modificar o limpiar los filtros.'
                  : 'Aun no tienes educandos en tu seccion'}
              </p>
              {!filters.search &&
               !filters.genero &&
               filters.estadoDocs === 'todos' &&
               filters.grupoEdad === 'todos' &&
               filters.activo === 'activos' && (
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer educando
                </Button>
              )}
            </div>
          ) : (
            <EducandosList
              educandos={educandos}
              pagination={pagination}
              onPageChange={(page) => setFilters({ page })}
              onView={handleViewDetail}
              onEdit={handleEdit}
              onNotify={handleNotify}
            />
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <EducandoFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        educando={isEditing ? selectedEducando : null}
        onSubmit={handleFormSubmit}
        seccionId={user?.seccion_id}
        diagnosticInfo={diagnosticInfo}
      />

      <EducandoDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        educando={selectedEducando}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onNotify={handleNotify}
        fetchDocumentacion={fetchDocumentacion}
      />

      <SendNotificationModal
        open={isNotificationModalOpen}
        onOpenChange={setIsNotificationModalOpen}
        educando={selectedEducando}
        onSend={handleSendNotification}
        fetchDocumentacion={fetchDocumentacion}
      />

      {/* MED-005: Modal para enviar mensajes a familias */}
      <SendMessageModal
        open={isMessageModalOpen}
        onOpenChange={setIsMessageModalOpen}
        educandos={educandos}
        preselectedEducandoIds={selectedEducando ? [selectedEducando.id] : []}
      />
    </div>
  )
}
