'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Eye,
  Pencil,
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  UserX
} from 'lucide-react'
import { EducandoConDocs, EducandoUtils, DOCS_STATUS_CONFIG } from '@/types/educando-scouter'

interface EducandosListProps {
  educandos: EducandoConDocs[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onView: (educando: EducandoConDocs) => void
  onEdit: (educando: EducandoConDocs) => void
  onNotify: (educando: EducandoConDocs) => void
}

export function EducandosList({
  educandos,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onNotify
}: EducandosListProps) {
  const { page, totalPages, total, limit } = pagination
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  const getDocsIcon = (status: keyof typeof DOCS_STATUS_CONFIG) => {
    switch (status) {
      case 'completo':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'parcial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'critico':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pendiente':
        return <Clock className="h-4 w-4 text-amber-600" />
    }
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-center">Edad</TableHead>
              <TableHead className="text-center">Genero</TableHead>
              <TableHead className="text-center">Documentacion</TableHead>
              <TableHead className="text-center">Familia</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {educandos.map((educando) => {
              const docsStatus = EducandoUtils.getDocsStatus(educando)
              const iniciales = EducandoUtils.getIniciales(educando)
              const avatarColor = EducandoUtils.getAvatarColor(educando.nombre)
              const puedeNotificar = EducandoUtils.puedeNotificar(educando)

              return (
                <TableRow key={educando.id} className="group">
                  {/* Avatar */}
                  <TableCell>
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${avatarColor}`}
                    >
                      {iniciales}
                    </div>
                  </TableCell>

                  {/* Nombre */}
                  <TableCell>
                    <div>
                      <p className="font-medium">{educando.nombre} {educando.apellidos}</p>
                      {educando.dni && (
                        <p className="text-xs text-muted-foreground">DNI: {educando.dni}</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Edad */}
                  <TableCell className="text-center">
                    <span className="font-medium">{educando.edad}</span>
                    <span className="text-muted-foreground text-sm"> años</span>
                  </TableCell>

                  {/* Genero */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="capitalize">
                      {educando.genero === 'masculino' ? 'M' :
                       educando.genero === 'femenino' ? 'F' : '-'}
                    </Badge>
                  </TableCell>

                  {/* Documentacion */}
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-2">
                            {getDocsIcon(docsStatus)}
                            <span className={`text-sm font-medium ${
                              docsStatus === 'completo' ? 'text-green-600' :
                              docsStatus === 'parcial' ? 'text-yellow-600' :
                              docsStatus === 'pendiente' ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {educando.docs_completos}/{educando.docs_total}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{educando.docs_completos} completos</p>
                          {educando.docs_pendientes > 0 && (
                            <p>{educando.docs_pendientes} pendientes de revision</p>
                          )}
                          {educando.docs_faltantes > 0 && (
                            <p>{educando.docs_faltantes} faltantes</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  {/* Familia */}
                  <TableCell className="text-center">
                    {educando.tiene_familia_vinculada ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {educando.familiares_count}
                      </Badge>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <UserX className="h-4 w-4 text-muted-foreground mx-auto" />
                          </TooltipTrigger>
                          <TooltipContent>Sin familia vinculada</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(educando)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(educando)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {puedeNotificar && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onNotify(educando)}
                          title="Notificar familia"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y">
        {educandos.map((educando) => {
          const docsStatus = EducandoUtils.getDocsStatus(educando)
          const iniciales = EducandoUtils.getIniciales(educando)
          const avatarColor = EducandoUtils.getAvatarColor(educando.nombre)
          const puedeNotificar = EducandoUtils.puedeNotificar(educando)

          return (
            <div key={educando.id} className="p-4 flex items-center gap-4">
              {/* Avatar */}
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-medium ${avatarColor}`}
              >
                {iniciales}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{educando.nombre} {educando.apellidos}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{educando.edad} años</span>
                  <span className="flex items-center gap-1">
                    {getDocsIcon(docsStatus)}
                    {educando.docs_completos}/{educando.docs_total}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(educando)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {puedeNotificar && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNotify(educando)}
                    className="text-amber-600"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Mostrando {startItem}-{endItem} de {total}
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="min-w-[36px]"
              >
                {pageNum}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
