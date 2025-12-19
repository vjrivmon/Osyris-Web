'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  UsersRound,
  CheckCircle,
  Clock,
  FileText,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { useAdminFamiliares } from '@/hooks/useAdminFamiliares'

export function FamiliasResumenCard() {
  const {
    loading,
    familiares,
    estadisticas,
    cargarFamiliares,
    cargarEstadisticas,
  } = useAdminFamiliares()

  useEffect(() => {
    cargarFamiliares()
    cargarEstadisticas()
  }, [])

  const handleRefresh = () => {
    cargarFamiliares()
    cargarEstadisticas()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <UsersRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Gestion de Familias</CardTitle>
              <CardDescription>Resumen del portal familiar</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{estadisticas?.totalFamilias || 0}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="text-2xl font-bold text-green-600">{estadisticas?.familiasActivas || 0}</div>
            <div className="text-xs text-muted-foreground">Activas</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <div className="text-2xl font-bold text-yellow-600">{estadisticas?.documentosPendientes || 0}</div>
            <div className="text-xs text-muted-foreground">Docs</div>
          </div>
        </div>

        {/* Familias recientes */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Familias recientes
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : familiares.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <UsersRound className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay familias registradas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {familiares.slice(0, 3).map((familiar) => (
                <div
                  key={familiar.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {familiar.nombre} {familiar.apellidos}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{familiar.educandosVinculados?.length || 0} educandos</span>
                      {familiar.documentosPendientes > 0 && (
                        <Badge variant="destructive" className="text-xs h-5">
                          <FileText className="h-3 w-3 mr-1" />
                          {familiar.documentosPendientes}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={familiar.estado === 'ACTIVO' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {familiar.estado === 'ACTIVO' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {familiar.estado}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link to full page */}
        <Button variant="outline" className="w-full" asChild>
          <Link href="/admin/familiares">
            Ver todas las familias
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
