"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockEducandos = [
  {
    id: "1",
    name: "Ana García",
    age: 12,
    section: "Scouts",
    team: "Águilas",
    documentationComplete: true,
  },
  {
    id: "2",
    name: "Carlos Martínez",
    age: 11,
    section: "Scouts",
    team: "Águilas",
    documentationComplete: false,
  },
  {
    id: "3",
    name: "Laura Sánchez",
    age: 13,
    section: "Scouts",
    team: "Lobos",
    documentationComplete: true,
  },
  {
    id: "4",
    name: "Miguel Fernández",
    age: 12,
    section: "Scouts",
    team: "Lobos",
    documentationComplete: false,
  },
  {
    id: "5",
    name: "Lucía Rodríguez",
    age: 13,
    section: "Scouts",
    team: "Halcones",
    documentationComplete: true,
  },
  {
    id: "6",
    name: "Pablo Navarro",
    age: 11,
    section: "Scouts",
    team: "Halcones",
    documentationComplete: true,
  },
]

export function EducandosList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEducandos = mockEducandos.filter(
    (educando) =>
      educando.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      educando.team.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o equipo..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>Añadir educando</Button>
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
          <div>Nombre</div>
          <div>Edad</div>
          <div>Equipo</div>
          <div>Documentación</div>
          <div></div>
        </div>
        <div className="divide-y">
          {filteredEducandos.map((educando) => (
            <div key={educando.id} className="grid grid-cols-5 gap-4 p-4 items-center">
              <div>{educando.name}</div>
              <div>{educando.age} años</div>
              <div>{educando.team}</div>
              <div>
                {educando.documentationComplete ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completa</Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                    Incompleta
                  </Badge>
                )}
              </div>
              <div className="flex justify-end">
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
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      Ver documentación
                    </DropdownMenuItem>
                    <DropdownMenuItem>Editar información</DropdownMenuItem>
                    <DropdownMenuItem>Ver historial</DropdownMenuItem>
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

