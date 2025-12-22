'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScoutHijo, ScoutUtils, DocumentoUtils } from "@/types/familia"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertTriangle, Clock } from "lucide-react"

interface HijoCardCompactoProps {
  hijo: ScoutHijo
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function HijoCardCompacto({
  hijo,
  selected = false,
  onClick,
  className
}: HijoCardCompactoProps) {
  // Calcular estado de documentos
  const documentosCompletos = hijo.documentos?.filter(d =>
    d.estado === 'actualizado' || d.estado === 'correcto'
  ).length || 0

  const totalDocumentos = hijo.documentos?.length || 5 // 5 documentos estándar

  const documentosCriticos = hijo.documentos?.filter(d =>
    DocumentoUtils.esCritico(d.estado)
  ).length || 0

  // Determinar icono y color según estado de documentos
  const getDocumentosEstadoDisplay = () => {
    if (documentosCriticos > 0) {
      return {
        icon: AlertTriangle,
        color: 'text-red-600 bg-red-50 border-red-200',
        label: `${documentosCriticos} pendiente${documentosCriticos > 1 ? 's' : ''}`
      }
    }

    if (documentosCompletos === totalDocumentos) {
      return {
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50 border-green-200',
        label: 'Al día'
      }
    }

    return {
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      label: `${documentosCompletos}/${totalDocumentos}`
    }
  }

  const documentosEstado = getDocumentosEstadoDisplay()
  const EstadoIcon = documentosEstado.icon
  const iniciales = ScoutUtils.getIniciales(hijo.nombre, hijo.apellidos)

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected && "ring-2 ring-green-500 shadow-md",
        !hijo.activo && "opacity-60",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          {/* Avatar más pequeño */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={hijo.foto} alt={hijo.nombre} />
            <AvatarFallback className="text-sm font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
              {iniciales}
            </AvatarFallback>
          </Avatar>

          {/* Información principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <h3 className="font-semibold text-sm truncate">
                {hijo.nombre} {hijo.apellidos}
              </h3>
              {selected && (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-muted-foreground mt-0.5">
              <span className="truncate">{hijo.seccion}</span>
              <span>•</span>
              <span>{hijo.edad} años</span>
            </div>
          </div>

          {/* Badge de estado de documentos - texto completo */}
          <div className="flex-shrink-0">
            {documentosCriticos > 0 ? (
              <Badge variant="outline" className="flex items-center space-x-1.5 border-red-200 bg-red-50/30 dark:border-red-500/50 dark:bg-red-500/20">
                <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                  {documentosCriticos} {documentosCriticos === 1 ? 'documento pendiente' : 'documentos pendientes'}
                </span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center space-x-1 border-gray-200 dark:border-gray-600">
                <span className="text-xs text-muted-foreground">{documentosCompletos}/{totalDocumentos}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Barra de progreso minimalista - azul corporativo si hay documentos pendientes */}
        {documentosCompletos < totalDocumentos && (
          <div className="mt-2">
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1">
              <div
                className={cn(
                  "h-1 rounded-full transition-all",
                  documentosCriticos > 0 ? "bg-blue-600" : "bg-gray-400"
                )}
                style={{ width: `${(documentosCompletos / totalDocumentos) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Componente para mostrar lista de hijos de forma compacta
 */
export function HijosListaCompacta({
  hijos,
  hijoSeleccionado,
  onSelectHijo,
  className
}: {
  hijos: ScoutHijo[]
  hijoSeleccionado?: number
  onSelectHijo?: (hijoId: number) => void
  className?: string
}) {
  if (hijos.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No tienes hijos vinculados
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:gap-6", className)}>
      {hijos.map((hijo) => (
        <HijoCardCompacto
          key={hijo.id}
          hijo={hijo}
          selected={hijoSeleccionado === hijo.id}
          onClick={() => onSelectHijo?.(hijo.id)}
        />
      ))}
    </div>
  )
}
