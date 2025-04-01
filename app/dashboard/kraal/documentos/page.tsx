"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DownloadCloud, Eye, FileText, Filter, FolderPlus, Search, Share, Trash2, Upload } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [documents, setDocuments] = useState(initialDocuments)
  const [folders, setFolders] = useState(initialFolders)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderDescription, setNewFolderDescription] = useState("")
  const [uploadFileName, setUploadFileName] = useState("")
  const [uploadFileCategory, setUploadFileCategory] = useState("")
  const [uploadFileDescription, setUploadFileDescription] = useState("")

  const filteredDocuments = documents.filter(
    (doc) =>
      (selectedCategory === "all" || doc.category === selectedCategory) &&
      (doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleDeleteDocument = (id) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
    toast({
      title: "Documento eliminado",
      description: "El documento ha sido eliminado correctamente.",
    })
  }

  const handleDeleteFolder = (id) => {
    setFolders(folders.filter((folder) => folder.id !== id))
    toast({
      title: "Carpeta eliminada",
      description: "La carpeta ha sido eliminada correctamente.",
    })
  }

  const handleCreateFolder = () => {
    if (!newFolderName) {
      toast({
        title: "Error",
        description: "El nombre de la carpeta es obligatorio.",
        variant: "destructive",
      })
      return
    }

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      description: newFolderDescription,
      count: 0,
    }

    setFolders([...folders, newFolder])
    setNewFolderName("")
    setNewFolderDescription("")

    toast({
      title: "Carpeta creada",
      description: "La carpeta ha sido creada correctamente.",
    })
  }

  const simulateUpload = () => {
    if (!uploadFileName || !uploadFileCategory) {
      toast({
        title: "Error",
        description: "El nombre y la categoría son obligatorios.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // Add the new document
          const fileExtension = uploadFileName.split(".").pop().toLowerCase()
          const newDocument = {
            id: `doc-${Date.now()}`,
            name: uploadFileName,
            type: fileExtension,
            category: uploadFileCategory,
            uploadedBy: "María García",
            date: "Justo ahora",
            shared: false,
            description: uploadFileDescription,
          }

          setDocuments([newDocument, ...documents])

          // Update folder count
          setFolders(
            folders.map((folder) =>
              folder.id === uploadFileCategory ? { ...folder, count: folder.count + 1 } : folder,
            ),
          )

          // Reset form
          setUploadFileName("")
          setUploadFileCategory("")
          setUploadFileDescription("")

          toast({
            title: "Archivo subido",
            description: "El archivo ha sido subido correctamente.",
          })

          return 0
        }
        return prev + 10
      })
    }, 300)
  }

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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
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
                <Upload className="mr-2 h-4 w-4" />
                Subir Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir nuevo documento</DialogTitle>
                <DialogDescription>
                  Sube un nuevo documento al sistema. Los archivos permitidos son PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX,
                  JPG, PNG.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="filename">Nombre del archivo</Label>
                  <Input
                    id="filename"
                    placeholder="ejemplo.pdf"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={uploadFileCategory} onValueChange={setUploadFileCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Añade una descripción para este documento"
                    value={uploadFileDescription}
                    onChange={(e) => setUploadFileDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Archivo</Label>
                  <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Arrastra y suelta archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-muted-foreground">Tamaño máximo: 10MB</p>
                  </div>
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subiendo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadFileName("")
                    setUploadFileCategory("")
                    setUploadFileDescription("")
                    setIsUploading(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={simulateUpload} disabled={isUploading}>
                  Subir Documento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                Crear Carpeta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nueva carpeta</DialogTitle>
                <DialogDescription>Crea una nueva carpeta para organizar tus documentos.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="foldername">Nombre de la carpeta</Label>
                  <Input
                    id="foldername"
                    placeholder="Nueva Carpeta"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="folderdescription">Descripción (opcional)</Label>
                  <Textarea
                    id="folderdescription"
                    placeholder="Añade una descripción para esta carpeta"
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewFolderName("")
                    setNewFolderDescription("")
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateFolder}>Crear Carpeta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center p-2 rounded-lg hover:bg-muted/50">
                      <FileText className={`h-10 w-10 ${getFileIconColor(doc.type)}`} />
                      <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{doc.name}</p>
                        <div className="flex flex-wrap text-xs text-muted-foreground">
                          <span>{getFolderName(doc.category, folders)}</span>
                          <span className="mx-2">•</span>
                          <span>Subido por {doc.uploadedBy}</span>
                          <span className="mx-2">•</span>
                          <span>{doc.date}</span>
                          {doc.description && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="italic">{doc.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ml-auto flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <DownloadCloud className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron documentos que coincidan con tu búsqueda.
                  </div>
                )}
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
                  <div key={i} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer relative group">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{folder.name}</p>
                        <p className="text-sm text-muted-foreground">{folder.count} documentos</p>
                        {folder.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{folder.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFolder(folder.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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
                    <div key={i} className="flex items-center p-2 rounded-lg hover:bg-muted/50">
                      <FileText className={`h-10 w-10 ${getFileIconColor(doc.type)}`} />
                      <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{doc.name}</p>
                        <div className="flex text-xs text-muted-foreground">
                          <span>{getFolderName(doc.category, folders)}</span>
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
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}>
                          <Trash2 className="h-4 w-4" />
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
                    <div key={i} className="flex items-center p-2 rounded-lg hover:bg-muted/50">
                      <FileText className={`h-10 w-10 ${getFileIconColor(doc.type)}`} />
                      <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">{doc.name}</p>
                        <div className="flex text-xs text-muted-foreground">
                          <span>{getFolderName(doc.category, folders)}</span>
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
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
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

function getFolderName(categoryId, folders) {
  const folder = folders.find((f) => f.id === categoryId)
  return folder ? folder.name : categoryId
}

// Mock data
const initialDocuments = [
  {
    id: "doc1",
    name: "Autorización Campamento Verano.pdf",
    type: "pdf",
    category: "autorizaciones",
    uploadedBy: "María García",
    date: "Hace 2 días",
    shared: true,
    description: "Formulario de autorización para el campamento de verano 2024",
  },
  {
    id: "doc2",
    name: "Listado Lobatos 2024.xlsx",
    type: "xlsx",
    category: "listados",
    uploadedBy: "Carlos Rodríguez",
    date: "Hace 3 días",
    shared: true,
    description: "Lista actualizada de todos los miembros de la Manada",
  },
  {
    id: "doc3",
    name: "Presupuesto Anual 2024.pdf",
    type: "pdf",
    category: "finanzas",
    uploadedBy: "Ana Martínez",
    date: "Hace 5 días",
    shared: true,
    description: "Presupuesto detallado para la ronda solar 2024-2025",
  },
  {
    id: "doc4",
    name: "Planificación Actividades Junio.docx",
    type: "docx",
    category: "planificacion",
    uploadedBy: "Juan López",
    date: "Hace 1 semana",
    shared: true,
    description: "Planificación detallada de las actividades de junio",
  },
  {
    id: "doc5",
    name: "Inventario Material Acampada.xlsx",
    type: "xlsx",
    category: "inventario",
    uploadedBy: "Laura Sánchez",
    date: "Hace 1 semana",
    shared: true,
    description: "Inventario actualizado de todo el material de acampada",
  },
  {
    id: "doc6",
    name: "Normativa Interna Grupo.pdf",
    type: "pdf",
    category: "normativa",
    uploadedBy: "Pedro Gómez",
    date: "Hace 2 semanas",
    shared: true,
    description: "Documento con la normativa interna actualizada del grupo",
  },
  {
    id: "doc7",
    name: "Memoria Actividades 2023.docx",
    type: "docx",
    category: "memorias",
    uploadedBy: "María García",
    date: "Hace 3 semanas",
    shared: false,
    description: "Memoria de todas las actividades realizadas en 2023",
  },
  {
    id: "doc8",
    name: "Contactos Proveedores.xlsx",
    type: "xlsx",
    category: "contactos",
    uploadedBy: "Carlos Rodríguez",
    date: "Hace 1 mes",
    shared: false,
    description: "Lista de contactos de proveedores habituales",
  },
  {
    id: "doc9",
    name: "Presentación Reunión Padres.pptx",
    type: "pptx",
    category: "presentaciones",
    uploadedBy: "Ana Martínez",
    date: "Hace 1 mes",
    shared: true,
    description: "Presentación para la reunión de padres de inicio de ronda",
  },
  {
    id: "doc10",
    name: "Notas Reunión Kraal.docx",
    type: "docx",
    category: "reuniones",
    uploadedBy: "Juan López",
    date: "Hace 2 meses",
    shared: false,
    description: "Acta de la última reunión del Kraal",
  },
]

const initialFolders = [
  {
    id: "autorizaciones",
    name: "Autorizaciones",
    count: 24,
    description: "Formularios de autorización para actividades y campamentos",
  },
  { id: "listados", name: "Listados", count: 12, description: "Listados de miembros por secciones" },
  { id: "finanzas", name: "Finanzas", count: 8, description: "Documentos relacionados con presupuestos y gastos" },
  { id: "planificacion", name: "Planificación", count: 15, description: "Documentos de planificación de actividades" },
  { id: "inventario", name: "Inventario", count: 6, description: "Inventarios de material del grupo" },
  { id: "normativa", name: "Normativa", count: 4, description: "Documentos normativos y reglamentos" },
  { id: "memorias", name: "Memorias", count: 7, description: "Memorias de actividades y rondas solares" },
  { id: "contactos", name: "Contactos", count: 3, description: "Listados de contactos" },
  { id: "presentaciones", name: "Presentaciones", count: 5, description: "Presentaciones para reuniones" },
  { id: "reuniones", name: "Reuniones", count: 9, description: "Actas y documentos de reuniones" },
]

