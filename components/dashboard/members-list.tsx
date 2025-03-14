"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, User, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockMembers = [
  {
    id: "1",
    name: "Ana García",
    role: "Educando",
    section: "Scouts",
    email: "ana.garcia@example.com",
    phone: "600123456",
  },
  {
    id: "2",
    name: "Carlos Martínez",
    role: "Educando",
    section: "Scouts",
    email: "carlos.martinez@example.com",
    phone: "600123457",
  },
  {
    id: "3",
    name: "Laura Sánchez",
    role: "Kraal",
    section: "Lobatos",
    email: "laura.sanchez@example.com",
    phone: "600123458",
  },
  {
    id: "4",
    name: "Miguel Fernández",
    role: "Kraal",
    section: "Castores",
    email: "miguel.fernandez@example.com",
    phone: "600123459",
  },
  {
    id: "5",
    name: "Lucía Rodríguez",
    role: "Comité",
    section: "-",
    email: "lucia.rodriguez@example.com",
    phone: "600123460",
  },
]

export function MembersList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [sectionFilter, setSectionFilter] = useState("all")

  const filteredMembers = mockMembers.filter(
    (member) =>
      (roleFilter === "all" || member.role === roleFilter) &&
      (sectionFilter === "all" || member.section === sectionFilter) &&
      (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar miembro..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="Educando">Educando</SelectItem>
              <SelectItem value="Kraal">Kraal</SelectItem>
              <SelectItem value="Comité">Comité</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Filtrar por sección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las secciones</SelectItem>
              <SelectItem value="Castores">Castores</SelectItem>
              <SelectItem value="Lobatos">Lobatos</SelectItem>
              <SelectItem value="Scouts">Scouts</SelectItem>
              <SelectItem value="Escultas">Escultas</SelectItem>
              <SelectItem value="Rovers">Rovers</SelectItem>
              <SelectItem value="-">Sin sección</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 font-medium border-b">
          <div className="md:col-span-2">Nombre</div>
          <div className="hidden md:block">Rol</div>
          <div className="hidden md:block">Sección</div>
          <div className="hidden md:block"></div>
        </div>
        <div className="divide-y">
          {filteredMembers.map((member) => (
            <div key={member.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 items-center">
              <div className="md:col-span-2 flex items-center">
                <div className="bg-muted rounded-full p-2 mr-3">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div>{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.email}</div>
                </div>
              </div>
              <div className="hidden md:block">
                <Badge
                  variant="outline"
                  className={
                    member.role === "Educando"
                      ? "bg-secondary/10 text-secondary"
                      : member.role === "Kraal"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent-tertiary/10 text-accent-tertiary"
                  }
                >
                  {member.role}
                </Badge>
              </div>
              <div className="hidden md:block">
                {member.section !== "-" ? member.section : <span className="text-muted-foreground">-</span>}
              </div>
              <div className="hidden md:flex justify-end">
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
                    <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                    <DropdownMenuItem>Editar información</DropdownMenuItem>
                    <DropdownMenuItem>Enviar mensaje</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Versión móvil */}
              <div className="flex md:hidden items-center justify-between w-full">
                <div className="flex flex-col gap-1">
                  <Badge
                    variant="outline"
                    className={
                      member.role === "Educando"
                        ? "bg-secondary/10 text-secondary"
                        : member.role === "Kraal"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent-tertiary/10 text-accent-tertiary"
                    }
                  >
                    {member.role}
                  </Badge>
                  {member.section !== "-" && <span className="text-sm">{member.section}</span>}
                </div>
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
                    <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                    <DropdownMenuItem>Editar información</DropdownMenuItem>
                    <DropdownMenuItem>Enviar mensaje</DropdownMenuItem>
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

