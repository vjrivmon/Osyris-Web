import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Filter, Download, Plus } from "lucide-react"

export default function MisEducandosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mis Educandos</h1>
        <p className="text-muted-foreground">Gestiona los educandos a tu cargo en la sección Lobatos</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar educando..." className="pl-8" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Educando
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="activos">Activos</TabsTrigger>
          <TabsTrigger value="pendientes">Documentación Pendiente</TabsTrigger>
          <TabsTrigger value="progresion">Progresión</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listado de Educandos</CardTitle>
              <CardDescription>Todos los educandos de la sección Lobatos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {educandos.map((educando, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={educando.avatar} alt={educando.name} />
                        <AvatarFallback>{getInitials(educando.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-bold">{educando.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="badge-manada">
                            Lobatos
                          </Badge>
                          <span className="text-sm text-muted-foreground">{educando.age} años</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 md:border-l md:pl-4 mt-4 md:mt-0">
                      <h4 className="font-medium mb-2">Progresión</h4>
                      <p className="text-sm text-muted-foreground mb-2">{educando.progression}</p>
                      <div className="flex flex-wrap gap-2">
                        {educando.badges.map((badge, j) => (
                          <Badge key={j} variant="secondary" className="rounded-full">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="md:border-l md:pl-4 mt-4 md:mt-0">
                      <h4 className="font-medium mb-2">Documentación</h4>
                      <ul className="text-sm space-y-1">
                        {educando.documents.map((doc, j) => (
                          <li key={j} className="flex items-center gap-2">
                            {doc.completed ? (
                              <Badge variant="success" className="rounded-full">
                                Completado
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="rounded-full">
                                Pendiente
                              </Badge>
                            )}
                            <span>{doc.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-2 justify-center mt-4 md:mt-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/kraal/mis-educandos/${i}`}>Ver perfil</Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Contactar familia
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Educandos Activos</CardTitle>
              <CardDescription>Educandos con asistencia regular</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido de educandos activos</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pendientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentación Pendiente</CardTitle>
              <CardDescription>Educandos con documentación pendiente</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido de documentación pendiente</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progresion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progresión</CardTitle>
              <CardDescription>Estado de progresión de los educandos</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido de progresión</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Mock data
const educandos = [
  {
    name: "Pablo Navarro",
    age: 9,
    progression: "Etapa de Participación",
    badges: ["Naturaleza", "Expresión"],
    avatar: "/placeholder.svg?height=100&width=100",
    documents: [
      { name: "Ficha médica", completed: true },
      { name: "Autorización de imágenes", completed: true },
      { name: "Autorización campamento", completed: false },
    ],
  },
  {
    name: "Sofía Moreno",
    age: 8,
    progression: "Etapa de Integración",
    badges: ["Creatividad"],
    avatar: "/placeholder.svg?height=100&width=100",
    documents: [
      { name: "Ficha médica", completed: true },
      { name: "Autorización de imágenes", completed: true },
      { name: "Autorización campamento", completed: false },
    ],
  },
  {
    name: "Daniel Jiménez",
    age: 9,
    progression: "Etapa de Participación",
    badges: ["Deporte", "Naturaleza"],
    avatar: "/placeholder.svg?height=100&width=100",
    documents: [
      { name: "Ficha médica", completed: true },
      { name: "Autorización de imágenes", completed: false },
      { name: "Autorización campamento", completed: false },
    ],
  },
  {
    name: "Lucía Fernández",
    age: 10,
    progression: "Etapa de Animación",
    badges: ["Expresión", "Servicio", "Técnica"],
    avatar: "/placeholder.svg?height=100&width=100",
    documents: [
      { name: "Ficha médica", completed: true },
      { name: "Autorización de imágenes", completed: true },
      { name: "Autorización campamento", completed: true },
    ],
  },
  {
    name: "Marcos Ruiz",
    age: 8,
    progression: "Etapa de Integración",
    badges: [],
    avatar: "/placeholder.svg?height=100&width=100",
    documents: [
      { name: "Ficha médica", completed: false },
      { name: "Autorización de imágenes", completed: false },
      { name: "Autorización campamento", completed: false },
    ],
  },
]

