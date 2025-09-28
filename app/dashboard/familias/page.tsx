"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MessageSquare, FileText, Download, CreditCard } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function FamiliasDashboardPage() {
  const [activeTab, setActiveTab] = useState("resumen")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenida, Ana</h1>
        <p className="text-muted-foreground">
          Portal familiar del Grupo Scout Osyris. Aquí puedes gestionar la información de tus hijos y estar al día de
          todas las actividades.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Actividades</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Próxima: Campamento de Verano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Autorizaciones para el campamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 sin leer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Pendiente: Cuota de campamento</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resumen" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[400px]">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="hijos">Mis Hijos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Próximas Actividades</CardTitle>
                <CardDescription>Calendario de actividades programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingActivities.map((activity, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Calendar className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                        <p className="text-sm">{activity.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {activity.sections.map((section, j) => (
                            <Badge key={j} variant="outline" className={getSectionClass(section)}>
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/familias/calendario">Ver calendario completo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Documentos Pendientes</CardTitle>
                <CardDescription>Documentos que requieren tu atención</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDocuments.map((doc, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{doc.title}</p>
                          <Badge variant={doc.urgent ? "destructive" : "outline"}>
                            {doc.urgent ? "Urgente" : "Pendiente"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Fecha límite: {doc.deadline}</p>
                        <p className="text-sm">{doc.description}</p>
                        <div className="pt-2 flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </Button>
                          <Button size="sm">Firmar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/familias/documentos">Ver todos los documentos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mensajes Recientes</CardTitle>
                <CardDescription>Comunicaciones de los monitores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={message.avatar} alt={message.from} />
                        <AvatarFallback>{getInitials(message.from)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{message.from}</p>
                          <p className="text-xs text-muted-foreground">{message.date}</p>
                        </div>
                        <p className="text-sm font-medium">{message.subject}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{message.preview}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/familias/mensajes">Ver todos los mensajes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pagos Pendientes</CardTitle>
                <CardDescription>Cuotas y pagos por realizar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPayments.map((payment, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{payment.title}</p>
                          <Badge variant={payment.status === "Vencido" ? "destructive" : "outline"}>
                            {payment.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Fecha límite: {payment.deadline}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{payment.amount}</p>
                          <Button size="sm">Pagar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/familias/pagos">Ver historial de pagos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hijos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mis Hijos</CardTitle>
                <CardDescription>Información sobre tus hijos inscritos en el grupo</CardDescription>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar informes
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {children.map((child, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <Avatar className="h-16 w-16 border-2" style={{ borderColor: getSectionColor(child.section) }}>
                        <AvatarImage src={child.avatar} alt={child.name} />
                        <AvatarFallback>{getInitials(child.name)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-medium">{child.name}</h3>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">{child.age} años</p>
                              <Badge className={getSectionClass(child.section)}>{child.section}</Badge>
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/familias/hijos/${i}`}>Ver perfil completo</Link>
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Progresión</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${getSectionBgClass(child.section)} text-white`}>
                                {child.progression}
                              </Badge>
                              <Progress value={child.progressionPercentage} className="h-2 flex-1" />
                              <span className="text-xs">{child.progressionPercentage}%</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">Monitor</p>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={child.monitor.avatar} alt={child.monitor.name} />
                                <AvatarFallback>{getInitials(child.monitor.name)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{child.monitor.name}</span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1">Asistencia</p>
                            <div className="flex items-center gap-2">
                              <Progress value={child.attendance} className="h-2 flex-1" />
                              <span className="text-xs">{child.attendance}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Gestiona los documentos de tus hijos</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">Pendientes</TabsTrigger>
                  <TabsTrigger value="completed">Completados</TabsTrigger>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4 space-y-4">
                  {pendingDocuments.map((doc, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{doc.title}</p>
                          <Badge variant={doc.urgent ? "destructive" : "outline"}>
                            {doc.urgent ? "Urgente" : "Pendiente"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Fecha límite: {doc.deadline}</p>
                        <p className="text-sm">{doc.description}</p>
                        <div className="pt-2 flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </Button>
                          <Button size="sm">Firmar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="completed" className="mt-4 space-y-4">
                  {completedDocuments.map((doc, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{doc.title}</p>
                          <Badge variant="outline" className="bg-green-500 text-white">
                            Completado
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Completado: {doc.completedDate}</p>
                        <p className="text-sm">{doc.description}</p>
                        <div className="pt-2">
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="all" className="mt-4 space-y-4">
                  {[...pendingDocuments, ...completedDocuments].map((doc, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${(doc as any).completedDate ? "bg-green-500" : "bg-amber-500"}`}
                      >
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{doc.title}</p>
                          {(doc as any).completedDate ? (
                            <Badge variant="outline" className="bg-green-500 text-white">
                              Completado
                            </Badge>
                          ) : (
                            <Badge variant={(doc as any).urgent ? "destructive" : "outline"}>
                              {(doc as any).urgent ? "Urgente" : "Pendiente"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {(doc as any).completedDate ? `Completado: ${(doc as any).completedDate}` : `Fecha límite: ${(doc as any).deadline}`}
                        </p>
                        <p className="text-sm">{doc.description}</p>
                        <div className="pt-2 flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </Button>
                          {!(doc as any).completedDate && <Button size="sm">Firmar</Button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagos</CardTitle>
              <CardDescription>Gestiona los pagos y cuotas</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">Pendientes</TabsTrigger>
                  <TabsTrigger value="history">Historial</TabsTrigger>
                  <TabsTrigger value="receipts">Recibos</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4 space-y-4">
                  {pendingPayments.map((payment, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{payment.title}</p>
                          <Badge variant={payment.status === "Vencido" ? "destructive" : "outline"}>
                            {payment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Fecha límite: {payment.deadline}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium">{payment.amount}</p>
                          <Button>Pagar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="history" className="mt-4 space-y-4">
                  {paymentHistory.map((payment, i) => (
                    <div key={i} className="flex gap-3 rounded-lg border p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{payment.title}</p>
                          <Badge variant="outline" className="bg-green-500 text-white">
                            Pagado
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Fecha de pago: {payment.paidDate}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium">{payment.amount}</p>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Recibo
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="receipts" className="mt-4 space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-4">Recibos anuales</h3>
                    <div className="space-y-3">
                      {annualReceipts.map((receipt, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{receipt.title}</p>
                              <p className="text-sm text-muted-foreground">{receipt.description}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

function getSectionColor(section: string): string {
  if (section === "Lobatos") return "rgb(234 179 8)"
  if (section === "Castores") return "rgb(249 115 22)"
  if (section === "Tropa") return "rgb(59 130 246)"
  if (section === "Pioneros") return "rgb(220 38 38)"
  if (section === "Rutas") return "rgb(21 128 61)"
  return "hsl(var(--primary))"
}

function getSectionClass(section: string): string {
  if (section === "Lobatos") return "bg-yellow-500/10 text-yellow-500 border-yellow-500"
  if (section === "Castores") return "bg-orange-500/10 text-orange-500 border-orange-500"
  if (section === "Tropa") return "bg-blue-500/10 text-blue-500 border-blue-500"
  if (section === "Pioneros") return "bg-red-600/10 text-red-600 border-red-600"
  if (section === "Rutas") return "bg-green-700/10 text-green-700 border-green-700"
  return "bg-primary/10 text-primary border-primary"
}

function getSectionBgClass(section: string): string {
  if (section === "Lobatos") return "bg-yellow-500"
  if (section === "Castores") return "bg-orange-500"
  if (section === "Tropa") return "bg-blue-500"
  if (section === "Pioneros") return "bg-red-600"
  if (section === "Rutas") return "bg-green-700"
  return "bg-primary"
}

// Mock data
const upcomingActivities = [
  {
    title: "Campamento de Verano",
    date: "15-30 de julio, 2023",
    description: "Campamento anual en la Sierra de Gredos",
    sections: ["Lobatos", "Tropa", "Pioneros"],
  },
  {
    title: "Reunión de Padres",
    date: "10 de junio, 2023",
    description: "Reunión informativa sobre el campamento de verano",
    sections: ["Todas las secciones"],
  },
  {
    title: "Salida de fin de semana",
    date: "17-18 de junio, 2023",
    description: "Acampada en el Parque Natural de Peñalara",
    sections: ["Tropa", "Pioneros"],
  },
]

const pendingDocuments = [
  {
    title: "Autorización Campamento de Verano",
    deadline: "1 de junio, 2023",
    description: "Autorización para la participación en el campamento de verano",
    urgent: true,
  },
  {
    title: "Ficha Médica Actualizada",
    deadline: "5 de junio, 2023",
    description: "Actualización de la ficha médica para el campamento",
    urgent: false,
  },
]

const completedDocuments = [
  {
    title: "Inscripción Curso 2022-2023",
    completedDate: "15 de septiembre, 2022",
    description: "Formulario de inscripción para el curso actual",
  },
  {
    title: "Autorización Salida Sierra Norte",
    completedDate: "10 de marzo, 2023",
    description: "Autorización para la salida de fin de semana a Sierra Norte",
  },
]

const messages = [
  {
    from: "María García",
    subject: "Información Campamento de Verano",
    preview:
      "Estimadas familias, os enviamos la información detallada sobre el campamento de verano que realizaremos en julio. Necesitamos que confirméis la asistencia antes del 1 de junio y que entreguéis la autorización firmada.",
    date: "Hace 2 días",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    from: "Juan Pérez",
    subject: "Reunión de Padres",
    preview:
      "Os recordamos que el próximo sábado 10 de junio tendremos la reunión informativa sobre el campamento de verano. Es importante la asistencia de al menos un representante por familia.",
    date: "Hace 5 días",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const pendingPayments = [
  {
    title: "Cuota Campamento de Verano",
    deadline: "5 de junio, 2023",
    amount: "250,00 €",
    status: "Pendiente",
  },
]

const paymentHistory = [
  {
    title: "Cuota Anual 2022-2023",
    paidDate: "20 de septiembre, 2022",
    amount: "150,00 €",
  },
  {
    title: "Salida Sierra Norte",
    paidDate: "1 de marzo, 2023",
    amount: "45,00 €",
  },
]

const annualReceipts = [
  {
    title: "Certificado de Donaciones 2022",
    description: "Certificado para la declaración de la renta",
  },
  {
    title: "Resumen de Pagos 2022-2023",
    description: "Resumen de todos los pagos realizados durante el curso",
  },
]

const children = [
  {
    name: "Laura Martínez",
    age: 9,
    section: "Lobatos",
    avatar: "/placeholder.svg?height=64&width=64",
    progression: "Integración",
    progressionPercentage: 75,
    monitor: {
      name: "María García",
      avatar: "/placeholder.svg?height=24&width=24",
      email: "maria.garcia@osyris.org",
    },
    attendance: 90,
  },
  {
    name: "Carlos Martínez",
    age: 12,
    section: "Tropa",
    avatar: "/placeholder.svg?height=64&width=64",
    progression: "Participación",
    progressionPercentage: 45,
    monitor: {
      name: "Juan Pérez",
      avatar: "/placeholder.svg?height=24&width=24",
      email: "juan.perez@osyris.org",
    },
    attendance: 85,
  },
]

