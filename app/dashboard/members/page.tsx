"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Filter, Search, UserPlus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSection, setSelectedSection] = useState("all")

  const filteredMembers = members.filter(
    (member) =>
      (selectedSection === "all" || member.section === selectedSection) &&
      (member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Miembros</h1>
        <p className="text-muted-foreground">Gestiona todos los miembros del grupo scout.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar miembros..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por sección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las secciones</SelectItem>
              <SelectItem value="castores">Castores</SelectItem>
              <SelectItem value="lobatos">Lobatos</SelectItem>
              <SelectItem value="scouts">Scouts</SelectItem>
              <SelectItem value="escultas">Escultas</SelectItem>
              <SelectItem value="rovers">Rovers</SelectItem>
              <SelectItem value="kraal">Kraal</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Añadir Miembro
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="educandos">Educandos</TabsTrigger>
          <TabsTrigger value="kraal">Kraal</TabsTrigger>
          <TabsTrigger value="comite">Comité</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Todos los Miembros</CardTitle>
              <CardDescription>Listado completo de todos los miembros del grupo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Sección</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getSectionBadgeClass(member.section)}>
                          {getSectionName(member.section)}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === "Activo" ? "success" : "secondary"}>{member.status}</Badge>
                      </TableCell>
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

        <TabsContent value="educandos">
          <Card>
            <CardHeader>
              <CardTitle>Educandos</CardTitle>
              <CardDescription>Listado de todos los educandos del grupo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Sección</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Contacto Familiar</TableHead>
                    <TableHead>Documentación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers
                    .filter((member) => member.role === "Educando")
                    .map((member, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSectionBadgeClass(member.section)}>
                            {getSectionName(member.section)}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.age}</TableCell>
                        <TableCell>{member.parentContact}</TableCell>
                        <TableCell>
                          <Badge variant={member.docsComplete ? "success" : "destructive"}>
                            {member.docsComplete ? "Completa" : "Incompleta"}
                          </Badge>
                        </TableCell>
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

        <TabsContent value="kraal">
          <Card>
            <CardHeader>
              <CardTitle>Kraal</CardTitle>
              <CardDescription>Listado de todos los monitores del grupo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Sección</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers
                    .filter((member) => member.role === "Monitor" || member.role === "Coordinador")
                    .map((member, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSectionBadgeClass(member.section)}>
                            {getSectionName(member.section)}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.position}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone}</TableCell>
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

        <TabsContent value="comite">
          <Card>
            <CardHeader>
              <CardTitle>Comité</CardTitle>
              <CardDescription>Listado de todos los miembros del comité</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers
                    .filter((member) => member.role === "Comité")
                    .map((member, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.position}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone}</TableCell>
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

function getSectionBadgeClass(section) {
  switch (section) {
    case "castores":
      return "border-blue-500 text-blue-700 bg-blue-50"
    case "lobatos":
      return "border-yellow-500 text-yellow-700 bg-yellow-50"
    case "scouts":
      return "border-green-500 text-green-700 bg-green-50"
    case "escultas":
      return "border-red-500 text-red-700 bg-red-50"
    case "rovers":
      return "border-purple-500 text-purple-700 bg-purple-50"
    case "kraal":
      return "border-gray-500 text-gray-700 bg-gray-50"
    default:
      return ""
  }
}

function getSectionName(section) {
  switch (section) {
    case "castores":
      return "Castores"
    case "lobatos":
      return "Lobatos"
    case "scouts":
      return "Scouts"
    case "escultas":
      return "Escultas"
    case "rovers":
      return "Rovers"
    case "kraal":
      return "Kraal"
    default:
      return section
  }
}

// Mock data
const members = [
  {
    id: "OSY001",
    name: "María García",
    section: "lobatos",
    role: "Coordinador",
    email: "maria@example.com",
    phone: "600123456",
    status: "Activo",
    position: "Coordinadora de Lobatos",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY002",
    name: "Carlos Rodríguez",
    section: "scouts",
    role: "Monitor",
    email: "carlos@example.com",
    phone: "600123457",
    status: "Activo",
    position: "Monitor de Scouts",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY003",
    name: "Ana Martínez",
    section: "kraal",
    role: "Coordinador",
    email: "ana@example.com",
    phone: "600123458",
    status: "Activo",
    position: "Coordinadora de Grupo",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY004",
    name: "Juan López",
    section: "castores",
    role: "Monitor",
    email: "juan@example.com",
    phone: "600123459",
    status: "Activo",
    position: "Monitor de Castores",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY005",
    name: "Laura Sánchez",
    section: "escultas",
    role: "Monitor",
    email: "laura@example.com",
    phone: "600123460",
    status: "Activo",
    position: "Monitora de Escultas",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY006",
    name: "Pedro Gómez",
    section: "rovers",
    role: "Monitor",
    email: "pedro@example.com",
    phone: "600123461",
    status: "Activo",
    position: "Monitor de Rovers",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY007",
    name: "Lucía Fernández",
    section: "kraal",
    role: "Comité",
    email: "lucia@example.com",
    phone: "600123462",
    status: "Activo",
    position: "Presidenta del Comité",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY008",
    name: "Miguel Torres",
    section: "kraal",
    role: "Comité",
    email: "miguel@example.com",
    phone: "600123463",
    status: "Activo",
    position: "Tesorero",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY009",
    name: "Carmen Ruiz",
    section: "kraal",
    role: "Comité",
    email: "carmen@example.com",
    phone: "600123464",
    status: "Activo",
    position: "Secretaria",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY010",
    name: "Pablo Navarro",
    section: "lobatos",
    role: "Educando",
    email: "",
    phone: "",
    status: "Activo",
    age: 9,
    parentContact: "Antonio Navarro (600123465)",
    docsComplete: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY011",
    name: "Sofía Moreno",
    section: "castores",
    role: "Educando",
    email: "",
    phone: "",
    status: "Activo",
    age: 7,
    parentContact: "Elena Moreno (600123466)",
    docsComplete: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY012",
    name: "Daniel Jiménez",
    section: "scouts",
    role: "Educando",
    email: "",
    phone: "",
    status: "Activo",
    age: 12,
    parentContact: "Raúl Jiménez (600123467)",
    docsComplete: false,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY013",
    name: "Marta Díaz",
    section: "escultas",
    role: "Educando",
    email: "marta@example.com",
    phone: "600123468",
    status: "Activo",
    age: 16,
    parentContact: "Cristina Díaz (600123469)",
    docsComplete: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "OSY014",
    name: "Javier Serrano",
    section: "rovers",
    role: "Educando",
    email: "javier@example.com",
    phone: "600123470",
    status: "Activo",
    age: 19,
    parentContact: "",
    docsComplete: true,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

