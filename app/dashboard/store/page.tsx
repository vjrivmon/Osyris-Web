"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Plus, Search, ShoppingCart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "all" || product.category === selectedCategory) &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tienda Scout</h1>
        <p className="text-muted-foreground">Gestiona los productos y pedidos de la tienda del grupo.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
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
              <SelectItem value="uniformes">Uniformes</SelectItem>
              <SelectItem value="camisetas">Camisetas</SelectItem>
              <SelectItem value="complementos">Complementos</SelectItem>
              <SelectItem value="merchandising">Merchandising</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Producto
          </Button>
          <Button variant="outline">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ver Pedidos
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="shirts">Banco de Camisas</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video w-full bg-muted">
                  <img
                    src={product.image || "/placeholder.svg?height=200&width=400"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </div>
                    <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                      {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold">{product.price} €</div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button size="sm">Añadir</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recientes</CardTitle>
              <CardDescription>Gestiona los pedidos realizados por los miembros del grupo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Pedido #{order.id}</h3>
                          <Badge variant={getOrderStatusVariant(order.status)}>{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Realizado por {order.customer} • {order.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{order.total} €</div>
                        <p className="text-sm text-muted-foreground">{order.items} productos</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                      <Button variant="outline" size="sm">
                        Actualizar estado
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shirts">
          <Card>
            <CardHeader>
              <CardTitle>Banco de Camisas</CardTitle>
              <CardDescription>Gestiona el inventario y solicitudes del banco de camisas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total de Camisas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">En diferentes tallas y estados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5</div>
                      <p className="text-xs text-muted-foreground">Esperando asignación</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Camisas Disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">18</div>
                      <p className="text-xs text-muted-foreground">Listas para asignar</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Inventario de Camisas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {shirtInventory.map((item, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Talla {item.size}</h4>
                          <Badge variant={item.quantity > 0 ? "outline" : "destructive"}>{item.quantity}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Estado: {item.condition}</p>
                          <p>Última actualización: {item.lastUpdated}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Solicitudes Recientes</h3>
                  <div className="space-y-4">
                    {shirtRequests.map((request, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{request.requester}</h4>
                              <Badge variant={getRequestStatusVariant(request.status)}>{request.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Talla solicitada: {request.size} • {request.date}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Ver detalles
                            </Button>
                            <Button size="sm">Procesar</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Solicitud de Camisa
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getOrderStatusVariant(status) {
  switch (status) {
    case "Completado":
      return "success"
    case "Pendiente":
      return "warning"
    case "Procesando":
      return "secondary"
    case "Cancelado":
      return "destructive"
    default:
      return "outline"
  }
}

function getRequestStatusVariant(status) {
  switch (status) {
    case "Aprobada":
      return "success"
    case "Pendiente":
      return "warning"
    case "Rechazada":
      return "destructive"
    default:
      return "outline"
  }
}

// Mock data
const products = [
  {
    name: "Camisa Scout Oficial",
    category: "Uniformes",
    description: "Camisa oficial del uniforme scout en color beige.",
    price: 25,
    stock: 15,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    name: "Pañoleta Grupo Osyris",
    category: "Uniformes",
    description: "Pañoleta oficial del Grupo Scout Osyris con los colores representativos.",
    price: 12,
    stock: 20,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    name: "Camiseta Campamento 2023",
    category: "Camisetas",
    description: "Camiseta conmemorativa del campamento de verano 2023.",
    price: 15,
    stock: 8,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    name: "Sudadera Grupo Osyris",
    category: "Complementos",
    description: "Sudadera con capucha y logo del Grupo Scout Osyris.",
    price: 30,
    stock: 5,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    name: "Gorra Scout",
    category: "Complementos",
    description: "Gorra con el logo scout, perfecta para actividades al aire libre.",
    price: 10,
    stock: 12,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    name: "Taza Grupo Osyris",
    category: "Merchandising",
    description: "Taza de cerámica con el logo del Grupo Scout Osyris.",
    price: 8,
    stock: 10,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    name: "Llavero Scout",
    category: "Merchandising",
    description: "Llavero con el símbolo de la flor de lis scout.",
    price: 5,
    stock: 25,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    name: "Pantalón Scout",
    category: "Uniformes",
    description: "Pantalón oficial del uniforme scout en color azul marino.",
    price: 20,
    stock: 0,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    name: "Mochila Scout",
    category: "Complementos",
    description: "Mochila resistente con el logo del Grupo Scout Osyris.",
    price: 35,
    stock: 3,
    image: "/placeholder.svg?height=200&width=400",
  },
]

const orders = [
  {
    id: "ORD001",
    customer: "María García",
    date: "15/05/2023",
    status: "Completado",
    total: 37,
    items: 2,
  },
  {
    id: "ORD002",
    customer: "Carlos Rodríguez",
    date: "18/05/2023",
    status: "Pendiente",
    total: 25,
    items: 1,
  },
  {
    id: "ORD003",
    customer: "Ana Martínez",
    date: "20/05/2023",
    status: "Procesando",
    total: 53,
    items: 3,
  },
  {
    id: "ORD004",
    customer: "Juan López",
    date: "22/05/2023",
    status: "Cancelado",
    total: 15,
    items: 1,
  },
  {
    id: "ORD005",
    customer: "Laura Sánchez",
    date: "25/05/2023",
    status: "Pendiente",
    total: 45,
    items: 2,
  },
]

const shirtInventory = [
  { size: "XS", quantity: 2, condition: "Buen estado", lastUpdated: "10/05/2023" },
  { size: "S", quantity: 5, condition: "Buen estado", lastUpdated: "10/05/2023" },
  { size: "M", quantity: 7, condition: "Buen estado", lastUpdated: "10/05/2023" },
  { size: "L", quantity: 4, condition: "Buen estado", lastUpdated: "10/05/2023" },
  { size: "XL", quantity: 0, condition: "Agotado", lastUpdated: "10/05/2023" },
  { size: "XXL", quantity: 0, condition: "Agotado", lastUpdated: "10/05/2023" },
]

const shirtRequests = [
  {
    requester: "Pablo Navarro",
    size: "M",
    date: "15/05/2023",
    status: "Pendiente",
    notes: "Primera camisa para nuevo miembro",
  },
  {
    requester: "Sofía Moreno",
    size: "S",
    date: "18/05/2023",
    status: "Aprobada",
    notes: "Cambio de talla por crecimiento",
  },
  {
    requester: "Daniel Jiménez",
    size: "L",
    date: "20/05/2023",
    status: "Pendiente",
    notes: "Camisa deteriorada, necesita reemplazo",
  },
  {
    requester: "Marta Díaz",
    size: "XL",
    date: "22/05/2023",
    status: "Rechazada",
    notes: "No hay stock disponible en esta talla",
  },
  {
    requester: "Javier Serrano",
    size: "M",
    date: "25/05/2023",
    status: "Pendiente",
    notes: "Cambio de sección",
  },
]

