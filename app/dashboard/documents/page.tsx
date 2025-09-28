"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DownloadCloud, Eye, FileText, Filter, Plus, Search, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
        <p className="text-muted-foreground">Gestiona todos los documentos del grupo scout.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar documentos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Subir Documento
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Crear Carpeta
          </Button>
        </div>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="shared">Compartidos</TabsTrigger>
            <TabsTrigger value="personal">Personales</TabsTrigger>
          </TabsList>
          <Select defaultValue="date">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Fecha (más reciente)</SelectItem>
              <SelectItem value="name">Nombre (A-Z)</SelectItem>
              <SelectItem value="size">Tamaño</SelectItem>
              <SelectItem value="type">Tipo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Documentos Recientes</CardTitle>
              <CardDescription>Documentos subidos o modificados recientemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center p-2 rounded-lg hover:bg-slate-50">
                    <FileText className={`h-10 w-10 ${getFileIconColor(doc.type)}`} />
                    <div className="ml-4 space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">{doc.name}</p>
                      <div className="flex text-xs text-muted-foreground">
                        <span>{doc.category}</span>
                        <span className="mx-2">•</span>
                        <span>Subido por {doc.uploadedBy}</span>
                        <span className="mx-2">•</span>
                        <span>{doc.date}</span>
                      </div>
                    </div>
                    <div className="ml-auto flex space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <DownloadCloud className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Carpetas</CardTitle>
              <CardDescription>Organización de documentos por categorías</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder, i) => (
                  <Link href={`/dashboard/documents/${folder.id}`} key={i} >
                    <div className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{folder.name}</p>
                          <p className="text-sm text-muted-foreground">{folder.count} documentos</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Compartidos</CardTitle>
              <CardDescription>Documentos compartidos con otros miembros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments
                  .filter((doc) => doc.shared)
                  .map((doc, i) => (
                    <div key={i} className="flex items-center p-2 rounded-lg hover:bg-slate-50">
                      <FileText className={`h-10 w-10 ${getFileIconColor(doc.type)}`} />
                      <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{doc.name}</p>
                        <div className="flex text-xs text-muted-foreground">
                          <span>{doc.category}</span>
                          <span className="mx-2">•</span>
                          <span>Subido por {doc.uploadedBy}</span>
                          <span className="mx-2">•</span>
                          <span>{doc.date}</span>
                        </div>
                      </div>
                      <div className="ml-auto flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <DownloadCloud className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Personales</CardTitle>
              <CardDescription>Documentos privados no compartidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments
                  .filter((doc) => !doc.shared)
                  .map((doc, i) => (
                    <div key={i} className="flex items-center p-2 rounded-lg hover:bg-slate-50">
                      <FileText className={`h-10 w-10 ${getFileIconColor(doc.type)}`} />
                      <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{doc.name}</p>
                        <div className="flex text-xs text-muted-foreground">
                          <span>{doc.category}</span>
                          <span className="mx-2">•</span>
                          <span>Subido por {doc.uploadedBy}</span>
                          <span className="mx-2">•</span>
                          <span>{doc.date}</span>
                        </div>
                      </div>
                      <div className="ml-auto flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <DownloadCloud className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getFileIconColor(type) {
  switch (type) {
    case "pdf":
      return "text-red-500"
    case "doc":
    case "docx":
      return "text-blue-500"
    case "xls":
    case "xlsx":
      return "text-green-500"
    case "ppt":
    case "pptx":
      return "text-orange-500"
    default:
      return "text-gray-500"
  }
}

// Mock data
const documents = [
  {
    name: "Autorización Campamento Verano.pdf",
    type: "pdf",
    category: "Autorizaciones",
    uploadedBy: "María García",
    date: "Hace 2 días",
    shared: true,
  },
  {
    name: "Listado Lobatos 2023.xlsx",
    type: "xlsx",
    category: "Listados",
    uploadedBy: "Carlos Rodríguez",
    date: "Hace 3 días",
    shared: true,
  },
  {
    name: "Presupuesto Anual 2023.pdf",
    type: "pdf",
    category: "Finanzas",
    uploadedBy: "Ana Martínez",
    date: "Hace 5 días",
    shared: true,
  },
  {
    name: "Planificación Actividades Junio.docx",
    type: "docx",
    category: "Planificación",
    uploadedBy: "Juan López",
    date: "Hace 1 semana",
    shared: true,
  },
  {
    name: "Inventario Material Acampada.xlsx",
    type: "xlsx",
    category: "Inventario",
    uploadedBy: "Laura Sánchez",
    date: "Hace 1 semana",
    shared: true,
  },
  {
    name: "Normativa Interna Grupo.pdf",
    type: "pdf",
    category: "Normativa",
    uploadedBy: "Pedro Gómez",
    date: "Hace 2 semanas",
    shared: true,
  },
  {
    name: "Memoria Actividades 2022.docx",
    type: "docx",
    category: "Memorias",
    uploadedBy: "María García",
    date: "Hace 3 semanas",
    shared: false,
  },
  {
    name: "Contactos Proveedores.xlsx",
    type: "xlsx",
    category: "Contactos",
    uploadedBy: "Carlos Rodríguez",
    date: "Hace 1 mes",
    shared: false,
  },
  {
    name: "Presentación Reunión Padres.pptx",
    type: "pptx",
    category: "Presentaciones",
    uploadedBy: "Ana Martínez",
    date: "Hace 1 mes",
    shared: true,
  },
  {
    name: "Notas Reunión Kraal.docx",
    type: "docx",
    category: "Reuniones",
    uploadedBy: "Juan López",
    date: "Hace 2 meses",
    shared: false,
  },
]

const folders = [
  { id: "autorizaciones", name: "Autorizaciones", count: 24 },
  { id: "listados", name: "Listados", count: 12 },
  { id: "finanzas", name: "Finanzas", count: 8 },
  { id: "planificacion", name: "Planificación", count: 15 },
  { id: "inventario", name: "Inventario", count: 6 },
  { id: "normativa", name: "Normativa", count: 4 },
]

