'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Users,
  UserPlus,
  Link,
  FileText,
  TrendingUp,
  Calendar,
  Mail,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { useAdminFamiliares, type EstadisticasFamiliares } from '@/hooks/useAdminFamiliares'
import { FamiliaresList } from '@/components/admin/familiares/familiares-list'
import { InvitarFamiliarModal } from '@/components/admin/familiares/invitar-familiar'
import { VincularEducandoModal } from '@/components/admin/familiares/vincular-educando'
import { TablaRelaciones } from '@/components/admin/familiares/tabla-relaciones'
import { AprobarDocumentosPanel } from '@/components/admin/familiares/aprobar-documentos'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function AdminFamiliaresPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showInvitarModal, setShowInvitarModal] = useState(false)
  const [showVincularModal, setShowVincularModal] = useState(false)

  const {
    loading,
    familiares,
    estadisticas,
    documentosPendientes,
    cargarFamiliares,
    cargarEstadisticas,
    cargarDocumentosPendientes
  } = useAdminFamiliares()

  const { toast } = useToast()

  // Cargar datos iniciales
  useEffect(() => {
    cargarFamiliares()
    cargarEstadisticas()
    cargarDocumentosPendientes()
  }, [])

  const handleRefresh = () => {
    cargarFamiliares()
    cargarEstadisticas()
    cargarDocumentosPendientes()
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Familias</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas?.totalFamilias || 0}</div>
            <p className="text-xs text-muted-foreground">
              Familias registradas en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Familias Activas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estadisticas?.familiasActivas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Con acceso al portal familiar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {estadisticas?.familiasPendientes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Esperando activación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docs. Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estadisticas?.documentosPendientes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerieren aprobación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por sección */}
      {estadisticas?.estadisticasPorSeccion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estadísticas por Sección
            </CardTitle>
            <CardDescription>
              Participación familiar por sección
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {estadisticas.estadisticasPorSeccion.map((seccion) => {
                const porcentaje = seccion.totalEducandos > 0
                  ? Math.round((seccion.educandosConFamilia / seccion.totalEducandos) * 100)
                  : 0

                return (
                  <Card key={seccion.seccion}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{seccion.seccion}</h3>
                        <Badge variant={porcentaje >= 80 ? 'default' : porcentaje >= 50 ? 'secondary' : 'destructive'}>
                          {porcentaje}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Educandos con familia:</span>
                          <span>{seccion.educandosConFamilia}/{seccion.totalEducandos}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Familias activas:</span>
                          <span>{seccion.familiasActivas}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              porcentaje >= 80 ? "bg-green-600" :
                              porcentaje >= 50 ? "bg-yellow-600" : "bg-red-600"
                            )}
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas de uso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Uso del Portal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Activos últimos 30 días</span>
                  <span className="font-bold">{estadisticas?.usoUltimos30Dias || 0}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sin acceso 60+ días</span>
                  <span className="font-bold text-red-600">{estadisticas?.familiasSinAcceso60Dias || 0}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Educandos con familia</span>
                  <span className="font-bold text-green-600">{estadisticas?.educandosConFamilia || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pendientes</span>
                  <span className="font-bold text-yellow-600">{estadisticas?.documentosPendientes || 0}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Aprobados</span>
                  <span className="font-bold text-green-600">{estadisticas?.documentosAprobados || 0}</span>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setActiveTab('documentos')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Gestionar Documentos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowInvitarModal(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar Familiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowVincularModal(true)}
              >
                <Link className="h-4 w-4 mr-2" />
                Vincular Educando
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setActiveTab('familiares')}
              >
                <Users className="h-4 w-4 mr-2" />
                Ver Familias
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleRefresh}
              >
                <Activity className="h-4 w-4 mr-2" />
                Actualizar Datos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Familias recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimas familias registradas o activas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {familiares.slice(0, 5).length > 0 ? (
            <div className="space-y-3">
              {familiares.slice(0, 5).map((familiar) => (
                <div key={familiar.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">
                        {familiar.nombre} {familiar.apellidos}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {familiar.email} • {familiar.educandosVinculados.length} educandos
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={familiar.estado === 'ACTIVO' ? 'default' : 'secondary'}>
                      {familiar.estado}
                    </Badge>
                    {familiar.documentosPendientes > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {familiar.documentosPendientes} docs
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay familias registradas</p>
              <Button
                onClick={() => setShowInvitarModal(true)}
                className="mt-4"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar Primera Familia
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Familias</h1>
          <p className="text-muted-foreground">
            Administra las cuentas familiares y sus accesos al sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <Activity className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => setShowInvitarModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar Familiar
          </Button>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="familiares" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Familias
            {familiares.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {familiares.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="vinculaciones" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Vinculaciones
          </TabsTrigger>
          <TabsTrigger value="documentos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
            {documentosPendientes.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {documentosPendientes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="familiares" className="space-y-6">
          <FamiliaresList
            onInvitarFamilia={() => setShowInvitarModal(true)}
            onVincularScouts={() => setShowVincularModal(true)}
            onVerDocumentos={() => setActiveTab('documentos')}
          />
        </TabsContent>

        <TabsContent value="vinculaciones" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Gestión de Vinculaciones</h2>
              <p className="text-muted-foreground">
                Vincula educandos a familias existentes para dar acceso al portal familiar
              </p>
            </div>
            <Button onClick={() => setShowVincularModal(true)}>
              <Link className="h-4 w-4 mr-2" />
              Nueva Vinculación
            </Button>
          </div>
          <TablaRelaciones onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="documentos" className="space-y-6">
          <AprobarDocumentosPanel
            onVerFamilias={() => setActiveTab('familiares')}
          />
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <InvitarFamiliarModal
        open={showInvitarModal}
        onOpenChange={setShowInvitarModal}
        onSuccess={() => {
          handleRefresh()
          toast({
            title: "Familiar invitado",
            description: "La invitación se ha enviado correctamente",
          })
        }}
      />

      <VincularEducandoModal
        open={showVincularModal}
        onOpenChange={setShowVincularModal}
        onSuccess={() => {
          handleRefresh()
          toast({
            title: "Vinculación exitosa",
            description: "El educando ha sido vinculado correctamente",
          })
        }}
      />
    </div>
  )
}