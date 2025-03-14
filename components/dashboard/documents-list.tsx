"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Upload, Download, MoreHorizontal, FileText, FilePlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockDocuments = [
  {
    id: "1",
    name: "Autorización general",
    type: "PDF",
    status: "Completo",
    updatedAt: "15/01/2025",
    size: "1.2 MB",
  },
  {
    id: "2",
    name: "Ficha médica",
    type: "PDF",
    status: "Pendiente",
    updatedAt: "-",
    size: "-",
  },
  {
    id: "3",
    name: "Autorización de imágenes",
    type: "PDF",
    status: "Completo",
    updatedAt: "15/01/2025",
    size: "0.8 MB",
  },
  {
    id: "4",
    name: "Inscripción campamento",
    type: "PDF",
    status: "Pendiente",
    updatedAt: "-",
    size: "-",
  },
  {
    id: "5",
    name: "Normativa de grupo",
    type: "PDF",
    status: "Completo",
    updatedAt: "10/01/2025",
    size: "1.5 MB",
  },
]

export function DocumentsList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredDocuments = mockDocuments.filter(
    (document) =>
      document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar documentos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <FilePlus className="mr-2 h-4 w-4" />
          Subir documento
        </Button>
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
          <div className="col-span-2">Nombre</div>
          <div>Tipo</div>
          <div>Estado</div>
          <div>Actualizado</div>
          <div></div>
        </div>
        <div className="divide-y">
          {filteredDocuments.map((document) => (
            <div key={document.id} className="grid grid-cols-6 gap-4 p-4 items-center">
              <div className="col-span-2 flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                {document.name}
              </div>
              <div>{document.type}</div>
              <div>
                {document.status === "Completo" ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completo</Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Pendiente
                  </Badge>
                )}
              </div>
              <div>{document.updatedAt}</div>
              <div className="flex justify-end gap-2">
                {document.status === "Completo" ? (
                  <Button variant="outline" size="icon" title="Descargar">
                    <Download className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="outline" size="icon" title="Subir">
                    <Upload className="h-4 w-4" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {document.status === "Completo" && <DropdownMenuItem>Ver documento</DropdownMenuItem>}
                    <DropdownMenuItem>Ver historial</DropdownMenuItem>
                    {document.status === "Completo" && <DropdownMenuItem>Reemplazar</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

