"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Package, Plus, Search, ShoppingCart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredItems = inventoryItems.filter(
    (item) =>
      (selectedCategory === "all" || item.category === selectedCategory) &&
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
        <p className="text-muted-foreground">Gestiona todo el material del grupo scout.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar material..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="acampada">Material de Acampada</SelectItem>
              <SelectItem value="cocina">Material de Cocina</SelectItem>
              <SelectItem value="actividades">Material de Actividades</SelectItem>
              <SelectItem value="oficina">Material de Oficina</SelectItem>
              <SelectItem value="sanitario">Material Sanitario</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Material
          </Button>
          <Button variant="outline">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Lista de Compra
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todo el Material</TabsTrigger>
          <TabsTrigger value="low">Stock Bajo</TabsTrigger>
          <TabsTrigger value="maintenance">En Mantenimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Inventario Completo</CardTitle>
              <CardDescription>Listado de todo el material del grupo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex justify-between">
                            <span>
                              {item.quantity} / {item.total}
                            </span>
                            <span className={getStockStatusClass(item.quantity, item.total)}>
                              {getStockStatus(item.quantity, item.total)}
                            </span>
                          </div>
                          <Progress value={(item.quantity / item.total) * 100} className="h-2 mt-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low">
          <Card>
            <CardHeader>
              <CardTitle>Material con Stock Bajo</CardTitle>
              <CardDescription>Material que necesita reposición</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems
                    .filter((item) => item.quantity / item.total < 0.3)
                    .map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex justify-between">
                              <span>
                                {item.quantity} / {item.total}
                              </span>
                              <span className="text-red-500 font-medium">Bajo</span>
                            </div>
                            <Progress value={(item.quantity / item.total) * 100} className="h-2 mt-1" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                          <Button variant="ghost" size="sm">
                            Reponer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Material en Mantenimiento</CardTitle>
              <CardDescription>Material que está siendo reparado o revisado</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Fecha de Entrada</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.entryDate}</TableCell>
                      <TableCell>{item.responsible}</TableCell>
                      <TableCell>{item.notes}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                        <Button variant="ghost" size="sm">
                          Finalizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Material</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryItems.reduce((acc, item) => acc + item.total, 0)}</div>
            <p className="text-xs text-muted-foreground">
              {inventoryItems.reduce((acc, item) => acc + item.quantity, 0)} disponibles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Material en Buen Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryItems.filter((item) => item.status === "Buen estado").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (inventoryItems.filter((item) => item.status === "Buen estado").length / inventoryItems.length) * 100,
              )}
              % del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Material con Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryItems.filter((item) => item.quantity / item.total < 0.3).length}
            </div>
            <p className="text-xs text-muted-foreground">Necesita reposición pronto</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Material en Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceItems.length}</div>
            <p className="text-xs text-muted-foreground">En proceso de reparación</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getStockStatus(quantity, total) {
  const ratio = quantity / total
  if (ratio < 0.3) return "Bajo"
  if (ratio < 0.7) return "Medio"
  return "Alto"
}

function getStockStatusClass(quantity, total) {
  const ratio = quantity / total
  if (ratio < 0.3) return "text-red-500 font-medium"
  if (ratio < 0.7) return "text-yellow-500 font-medium"
  return "text-green-500 font-medium"
}

function getStatusVariant(status) {
  switch (status) {
    case "Buen estado":
      return "success"
    case "Deteriorado":
      return "warning"
    case "Necesita reparación":
      return "destructive"
    default:
      return "secondary"
  }
}

// Mock data
const inventoryItems = [
  {
    name: "Tiendas de campaña (4 plazas)",
    category: "Material de Acampada",
    quantity: 8,
    total: 12,
    status: "Buen estado",
    location: "Almacén Principal",
  },
  {
    name: "Tiendas de campaña (8 plazas)",
    category: "Material de Acampada",
    quantity: 4,
    total: 6,
    status: "Buen estado",
    location: "Almacén Principal",
  },
  {
    name: "Hornillos de gas",
    category: "Material de Cocina",
    quantity: 6,
    total: 8,
    status: "Buen estado",
    location: "Almacén Cocina",
  },
  {
    name: "Bombonas de gas",
    category: "Material de Cocina",
    quantity: 2,
    total: 10,
    status: "Buen estado",
    location: "Almacén Cocina",
  },
  {
    name: "Cuerdas (50m)",
    category: "Material de Acampada",
    quantity: 3,
    total: 6,
    status: "Buen estado",
    location: "Almacén Principal",
  },
  {
    name: "Botiquines completos",
    category: "Material Sanitario",
    quantity: 4,
    total: 5,
    status: "Buen estado",
    location: "Armario Sanitario",
  },
  {
    name: "Linternas",
    category: "Material de Acampada",
    quantity: 6,
    total: 15,
    status: "Deteriorado",
    location: "Almacén Principal",
  },
  {
    name: "Ollas grandes",
    category: "Material de Cocina",
    quantity: 4,
    total: 6,
    status: "Buen estado",
    location: "Almacén Cocina",
  },
  {
    name: "Paelleras",
    category: "Material de Cocina",
    quantity: 2,
    total: 3,
    status: "Buen estado",
    location: "Almacén Cocina",
  },
  {
    name: "Lonas",
    category: "Material de Acampada",
    quantity: 3,
    total: 8,
    status: "Deteriorado",
    location: "Almacén Principal",
  },
  {
    name: "Brújulas",
    category: "Material de Actividades",
    quantity: 8,
    total: 15,
    status: "Buen estado",
    location: "Armario Actividades",
  },
  {
    name: "Mapas topográficos",
    category: "Material de Actividades",
    quantity: 5,
    total: 10,
    status: "Buen estado",
    location: "Armario Actividades",
  },
  {
    name: "Material de papelería",
    category: "Material de Oficina",
    quantity: 1,
    total: 5,
    status: "Bajo stock",
    location: "Armario Oficina",
  },
  {
    name: "Herramientas",
    category: "Material de Acampada",
    quantity: 1,
    total: 2,
    status: "Necesita reparación",
    location: "Almacén Principal",
  },
]

const maintenanceItems = [
  {
    name: "Tienda de campaña (8 plazas)",
    category: "Material de Acampada",
    entryDate: "10/05/2023",
    responsible: "Carlos Rodríguez",
    notes: "Reparación de varillas y costura de la puerta",
  },
  {
    name: "Hornillo de gas",
    category: "Material de Cocina",
    entryDate: "15/05/2023",
    responsible: "Ana Martínez",
    notes: "Limpieza y revisión de conexiones",
  },
  {
    name: "Kit de herramientas",
    category: "Material de Acampada",
    entryDate: "20/05/2023",
    responsible: "Juan López",
    notes: "Inventario y reposición de piezas faltantes",
  },
]

