"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, MoreHorizontal, Plus, MinusCircle, PlusCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockInventory = [
  {
    id: "1",
    name: "Tiendas de campaña",
    category: "Acampada",
    quantity: 10,
    status: "Buen estado",
    location: "Zulo principal",
  },
  {
    id: "2",
    name: "Hornillos",
    category: "Cocina",
    quantity: 5,
    status: "Buen estado",
    location: "Zulo principal",
  },
  {
    id: "3",
    name: "Cuerdas (10m)",
    category: "Pionerismo",
    quantity: 15,
    status: "Buen estado",
    location: "Zulo secundario",
  },
  {
    id: "4",
    name: "Linternas",
    category: "Iluminación",
    quantity: 8,
    status: "Algunas defectuosas",
    location: "Zulo principal",
  },
  {
    id: "5",
    name: "Botiquín",
    category: "Primeros auxilios",
    quantity: 3,
    status: "Revisar contenido",
    location: "Zulo principal",
  },
]

export function InventoryList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredInventory = mockInventory.filter(
    (item) =>
      (categoryFilter === "all" || item.category === categoryFilter) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar material..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="Acampada">Acampada</SelectItem>
            <SelectItem value="Cocina">Cocina</SelectItem>
            <SelectItem value="Pionerismo">Pionerismo</SelectItem>
            <SelectItem value="Iluminación">Iluminación</SelectItem>
            <SelectItem value="Primeros auxilios">Primeros auxilios</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Añadir material
        </Button>
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
          <div className="col-span-2">Material</div>
          <div>Cantidad</div>
          <div>Estado</div>
          <div>Ubicación</div>
          <div></div>
        </div>
        <div className="divide-y">
          {filteredInventory.map((item) => (
            <div key={item.id} className="grid grid-cols-6 gap-4 p-4 items-center">
              <div className="col-span-2 flex items-center">
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                <div>
                  <div>{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>{item.quantity}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Badge
                  variant="outline"
                  className={
                    item.status === "Buen estado"
                      ? "bg-green-100 text-green-800"
                      : item.status === "Algunas defectuosas"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <div>{item.location}</div>
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
                    <DropdownMenuItem>Editar material</DropdownMenuItem>
                    <DropdownMenuItem>Cambiar ubicación</DropdownMenuItem>
                    <DropdownMenuItem>Registrar incidencia</DropdownMenuItem>
                    <DropdownMenuItem>Historial de uso</DropdownMenuItem>
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

