"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Plus, Search, ShoppingCart, Package, Trash2, Edit, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Tipos para los datos
interface Product {
  id: string
  name: string
  category: string
  description: string
  price: number
  stock: number
  image: string
}

interface Order {
  id: string
  customer: string
  date: string
  status: string
  total: number
  items: number
}

interface ShirtInventoryItem {
  size: string
  quantity: number
  condition: string
  lastUpdated: string
}

interface ShirtRequest {
  id: string
  requester: string
  size: string
  date: string
  status: string
  notes: string
}

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [shirtInventory, setShirtInventory] = useState<ShirtInventoryItem[]>(initialShirtInventory)
  const [shirtRequests, setShirtRequests] = useState<ShirtRequest[]>(initialShirtRequests)

  // Form states for new product
  const [newProductName, setNewProductName] = useState("")
  const [newProductCategory, setNewProductCategory] = useState("")
  const [newProductDescription, setNewProductDescription] = useState("")
  const [newProductPrice, setNewProductPrice] = useState("")
  const [newProductStock, setNewProductStock] = useState("")

  // Form states for shirt request
  const [newRequestName, setNewRequestName] = useState("")
  const [newRequestSize, setNewRequestSize] = useState("")
  const [newRequestNotes, setNewRequestNotes] = useState("")

  // Form states for inventory update
  const [editingSize, setEditingSize] = useState("")
  const [editingQuantity, setEditingQuantity] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "all" || product.category === selectedCategory) &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAddProduct = () => {
    if (!newProductName || !newProductCategory || !newProductPrice) {
      toast({
        title: "Error",
        description: "El nombre, la categoría y el precio son obligatorios.",
        variant: "destructive",
      })
      return
    }

    const newProduct = {
      id: `product-${Date.now()}`,
      name: newProductName,
      category: newProductCategory,
      description: newProductDescription,
      price: Number.parseFloat(newProductPrice),
      stock: Number.parseInt(newProductStock) || 0,
      image: "/placeholder.svg?height=200&width=400",
    }

    setProducts([...products, newProduct])

    // Reset form
    setNewProductName("")
    setNewProductCategory("")
    setNewProductDescription("")
    setNewProductPrice("")
    setNewProductStock("")

    toast({
      title: "Producto añadido",
      description: "El producto ha sido añadido correctamente.",
    })
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id))
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado correctamente.",
    })
  }

  const handleUpdateOrderStatus = (id: string, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
    toast({
      title: "Estado actualizado",
      description: `El pedido ha sido marcado como ${newStatus}.`,
    })
  }

  const handleAddShirtRequest = () => {
    if (!newRequestName || !newRequestSize) {
      toast({
        title: "Error",
        description: "El nombre y la talla son obligatorios.",
        variant: "destructive",
      })
      return
    }

    const newRequest = {
      id: `request-${Date.now()}`,
      requester: newRequestName,
      size: newRequestSize,
      date: "Hoy",
      status: "Pendiente",
      notes: newRequestNotes,
    }

    setShirtRequests([...shirtRequests, newRequest])

    // Reset form
    setNewRequestName("")
    setNewRequestSize("")
    setNewRequestNotes("")

    toast({
      title: "Solicitud añadida",
      description: "La solicitud de camisa ha sido añadida correctamente.",
    })
  }

  const handleUpdateShirtRequest = (id: string, newStatus: string) => {
    setShirtRequests(shirtRequests.map((request) => (request.id === id ? { ...request, status: newStatus } : request)))

    // If approved, update inventory
    if (newStatus === "Aprobada") {
      const request = shirtRequests.find((r) => r.id === id)
      if (request) {
        setShirtInventory(
          shirtInventory.map((item) =>
            item.size === request.size ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
          ),
        )
      }
    }

    toast({
      title: "Estado actualizado",
      description: `La solicitud ha sido marcada como ${newStatus}.`,
    })
  }

  const handleUpdateShirtInventory = () => {
    if (!editingSize || editingQuantity === "") {
      toast({
        title: "Error",
        description: "La talla y la cantidad son obligatorias.",
        variant: "destructive",
      })
      return
    }

    setShirtInventory(
      shirtInventory.map((item) =>
        item.size === editingSize
          ? {
              ...item,
              quantity: Number.parseInt(editingQuantity),
              lastUpdated: "Hoy",
              condition: Number.parseInt(editingQuantity) > 0 ? "Buen estado" : "Agotado",
            }
          : item,
      ),
    )

    // Reset form
    setEditingSize("")
    setEditingQuantity("")

    toast({
      title: "Inventario actualizado",
      description: "El inventario de camisas ha sido actualizado correctamente.",
    })
  }

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
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Añadir Producto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir nuevo producto</DialogTitle>
                <DialogDescription>Añade un nuevo producto a la tienda del grupo.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Nombre del producto</Label>
                  <Input
                    id="product-name"
                    placeholder="Ej: Camisa Scout Oficial"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-category">Categoría</Label>
                  <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                    <SelectTrigger id="product-category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uniformes">Uniformes</SelectItem>
                      <SelectItem value="camisetas">Camisetas</SelectItem>
                      <SelectItem value="complementos">Complementos</SelectItem>
                      <SelectItem value="merchandising">Merchandising</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description">Descripción</Label>
                  <Textarea
                    id="product-description"
                    placeholder="Descripción del producto"
                    value={newProductDescription}
                    onChange={(e) => setNewProductDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Precio (€)</Label>
                    <Input
                      id="product-price"
                      type="number"
                      placeholder="0.00"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-stock">Stock</Label>
                    <Input
                      id="product-stock"
                      type="number"
                      placeholder="0"
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Imagen del producto</Label>
                  <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50">
                    <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Arrastra y suelta una imagen aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG o GIF. Máximo 2MB.</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewProductName("")
                    setNewProductCategory("")
                    setNewProductDescription("")
                    setNewProductPrice("")
                    setNewProductStock("")
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddProduct}>Añadir Producto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" asChild>
            <a href="#orders">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ver Pedidos
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="orders" id="orders">
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="shirts">Banco de Camisas</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, i) => (
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
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No se encontraron productos</h3>
                <p className="text-muted-foreground mt-2">Intenta cambiar los filtros o añade un nuevo producto.</p>
              </div>
            )}
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
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Button>
                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Cambiar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Procesando">Procesando</SelectItem>
                          <SelectItem value="Completado">Completado</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total de Camisas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {shirtInventory.reduce((acc, item) => acc + item.quantity, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">En diferentes tallas y estados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {shirtRequests.filter((req) => req.status === "Pendiente").length}
                      </div>
                      <p className="text-xs text-muted-foreground">Esperando asignación</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Camisas Disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {shirtInventory.reduce((acc, item) => acc + item.quantity, 0)}
                      </div>
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

                  <div className="mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Actualizar inventario
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Actualizar inventario de camisas</DialogTitle>
                          <DialogDescription>
                            Modifica la cantidad disponible de una talla específica.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="shirt-size">Talla</Label>
                            <Select value={editingSize} onValueChange={setEditingSize}>
                              <SelectTrigger id="shirt-size">
                                <SelectValue placeholder="Selecciona una talla" />
                              </SelectTrigger>
                              <SelectContent>
                                {shirtInventory.map((item) => (
                                  <SelectItem key={item.size} value={item.size}>
                                    Talla {item.size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="shirt-quantity">Cantidad</Label>
                            <Input
                              id="shirt-quantity"
                              type="number"
                              placeholder="0"
                              value={editingQuantity}
                              onChange={(e) => setEditingQuantity(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingSize("")
                              setEditingQuantity("")
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={handleUpdateShirtInventory}>Actualizar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Solicitudes Recientes</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Solicitante</TableHead>
                        <TableHead>Talla</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shirtRequests.map((request, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{request.requester}</TableCell>
                          <TableCell>{request.size}</TableCell>
                          <TableCell>{request.date}</TableCell>
                          <TableCell>
                            <Badge variant={getRequestStatusVariant(request.status)}>{request.status}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{request.notes}</TableCell>
                          <TableCell className="text-right">
                            {request.status === "Pendiente" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-500 hover:text-green-700"
                                  onClick={() => handleUpdateShirtRequest(request.id, "Aprobada")}
                                >
                                  Aprobar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleUpdateShirtRequest(request.id, "Rechazada")}
                                >
                                  Rechazar
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Solicitud de Camisa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nueva solicitud de camisa</DialogTitle>
                        <DialogDescription>Registra una nueva solicitud para el banco de camisas.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="requester-name">Nombre del solicitante</Label>
                          <Input
                            id="requester-name"
                            placeholder="Nombre completo"
                            value={newRequestName}
                            onChange={(e) => setNewRequestName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="request-size">Talla solicitada</Label>
                          <Select value={newRequestSize} onValueChange={setNewRequestSize}>
                            <SelectTrigger id="request-size">
                              <SelectValue placeholder="Selecciona una talla" />
                            </SelectTrigger>
                            <SelectContent>
                              {shirtInventory.map((item) => (
                                <SelectItem key={item.size} value={item.size}>
                                  Talla {item.size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="request-notes">Notas (opcional)</Label>
                          <Textarea
                            id="request-notes"
                            placeholder="Motivo de la solicitud, detalles adicionales, etc."
                            value={newRequestNotes}
                            onChange={(e) => setNewRequestNotes(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewRequestName("")
                            setNewRequestSize("")
                            setNewRequestNotes("")
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleAddShirtRequest}>Registrar Solicitud</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
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
const initialProducts = [
  {
    id: "prod1",
    name: "Camisa Scout Oficial",
    category: "uniformes",
    description: "Camisa oficial del uniforme scout en color beige.",
    price: 25,
    stock: 15,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "prod2",
    name: "Pañoleta Grupo Osyris",
    category: "uniformes",
    description: "Pañoleta oficial del Grupo Scout Osyris con los colores representativos.",
    price: 12,
    stock: 20,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "prod3",
    name: "Camiseta Campamento 2023",
    category: "camisetas",
    description: "Camiseta conmemorativa del campamento de verano 2023.",
    price: 15,
    stock: 8,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "prod4",
    name: "Sudadera Grupo Osyris",
    category: "complementos",
    description: "Sudadera con capucha y logo del Grupo Scout Osyris.",
    price: 30,
    stock: 5,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "prod5",
    name: "Gorra Scout",
    category: "complementos",
    description: "Gorra con el logo scout, perfecta para actividades al aire libre.",
    price: 10,
    stock: 12,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "prod6",
    name: "Taza Grupo Osyris",
    category: "merchandising",
    description: "Taza de cerámica con el logo del Grupo Scout Osyris.",
    price: 8,
    stock: 10,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "prod7",
    name: "Llavero Scout",
    category: "merchandising",
    description: "Llavero con el símbolo de la flor de lis scout.",
    price: 5,
    stock: 25,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "prod8",
    name: "Pantalón Scout",
    category: "uniformes",
    description: "Pantalón oficial del uniforme scout en color azul marino.",
    price: 20,
    stock: 0,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "prod9",
    name: "Mochila Scout",
    category: "complementos",
    description: "Mochila resistente con el logo del Grupo Scout Osyris.",
    price: 35,
    stock: 3,
    image: "/placeholder.svg?height=200&width=400",
  },
]

const initialOrders = [
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

const initialShirtInventory = [
  { size: "XS", quantity: 2, condition: "Buen estado", lastUpdated: "10/05/2023" },
  { size: "S", quantity: 5, condition: "Buen estado", lastUpdated: "10/05/2023" },
  { size: "M", quantity: 7, condition: "Buen estado", lastUpdated: "10/05/2023" },
  { size: "L", quantity: 4, condition: "Buen estado", lastUpdated: "10/05/2023" },
  { size: "XL", quantity: 0, condition: "Agotado", lastUpdated: "10/05/2023" },
  { size: "XXL", quantity: 0, condition: "Agotado", lastUpdated: "10/05/2023" },
]

const initialShirtRequests = [
  {
    id: "req1",
    requester: "Pablo Navarro",
    size: "M",
    date: "15/05/2023",
    status: "Pendiente",
    notes: "Primera camisa para nuevo miembro",
  },
  {
    id: "req2",
    requester: "Sofía Moreno",
    size: "S",
    date: "18/05/2023",
    status: "Aprobada",
    notes: "Cambio de talla por crecimiento",
  },
  {
    id: "req3",
    requester: "Daniel Jiménez",
    size: "L",
    date: "20/05/2023",
    status: "Pendiente",
    notes: "Camisa deteriorada, necesita reemplazo",
  },
  {
    id: "req4",
    requester: "Marta Díaz",
    size: "XL",
    date: "22/05/2023",
    status: "Rechazada",
    notes: "No hay stock disponible en esta talla",
  },
  {
    id: "req5",
    requester: "Javier Serrano",
    size: "M",
    date: "25/05/2023",
    status: "Pendiente",
    notes: "Cambio de sección",
  },
]

