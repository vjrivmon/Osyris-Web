"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, CalendarDays, CreditCard } from "lucide-react"
import Link from "next/link"

const mockChildren = [
  {
    id: "1",
    name: "Laura Pérez",
    age: 12,
    section: "Scouts",
    team: "Águilas",
    documentationComplete: true,
    upcomingEvents: [
      {
        id: "e1",
        title: "Salida de Sección",
        date: "20-21 Abr 2025",
        location: "Parque Natural de la Albufera",
      },
      {
        id: "e2",
        title: "Campamento de Verano",
        date: "15-30 Jul 2025",
        location: "Sierra de Gredos",
      },
    ],
    pendingPayments: [],
  },
  {
    id: "2",
    name: "Carlos Pérez",
    age: 8,
    section: "Lobatos",
    team: "Seeonee",
    documentationComplete: false,
    upcomingEvents: [
      {
        id: "e3",
        title: "Festival de Primavera",
        date: "10 May 2025",
        location: "Local del Grupo",
      },
      {
        id: "e2",
        title: "Campamento de Verano",
        date: "15-30 Jul 2025",
        location: "Sierra de Gredos",
      },
    ],
    pendingPayments: [
      {
        id: "p1",
        title: "Cuota Campamento de Verano",
        amount: "250€",
        dueDate: "30 Abr 2025",
      },
    ],
  },
]

export function ChildrenList() {
  return (
    <div className="space-y-6">
      {mockChildren.map((child) => (
        <Card key={child.id} className="overflow-hidden">
          <div className="bg-muted p-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">{child.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{child.age} años</span>
                  <span>•</span>
                  <span>{child.section}</span>
                  <span>•</span>
                  <span>Equipo: {child.team}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={child.documentationComplete ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {child.documentationComplete ? "Documentación completa" : "Documentación pendiente"}
                </Badge>
                <Button asChild size="sm">
                  <Link href={`/dashboard/hijos/${child.id}`}>Ver detalles</Link>
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            <Tabs defaultValue="eventos" className="w-full">
              <TabsList className="grid grid-cols-3 rounded-none border-b">
                <TabsTrigger value="eventos" className="rounded-none">
                  Eventos
                </TabsTrigger>
                <TabsTrigger value="documentacion" className="rounded-none">
                  Documentación
                </TabsTrigger>
                <TabsTrigger value="pagos" className="rounded-none">
                  Pagos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="eventos" className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">Próximos eventos</h4>
                  </div>

                  {child.upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {child.upcomingEvents.map((event) => (
                        <div key={event.id} className="border rounded-lg p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                                <span>{event.date}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{event.location}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Ver detalles
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No hay eventos programados próximamente</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documentacion" className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">Documentación</h4>
                  </div>

                  <div className="border rounded-lg divide-y">
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Autorización general</p>
                        <p className="text-sm text-muted-foreground">
                          {child.documentationComplete ? "Subido: 15/01/2025" : "Pendiente"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        {child.documentationComplete ? "Ver" : "Subir"}
                      </Button>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Ficha médica</p>
                        <p className="text-sm text-muted-foreground">
                          {child.documentationComplete ? "Subido: 15/01/2025" : "Pendiente"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        {child.documentationComplete ? "Ver" : "Subir"}
                      </Button>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Autorización de imágenes</p>
                        <p className="text-sm text-muted-foreground">
                          {child.documentationComplete ? "Subido: 15/01/2025" : "Pendiente"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        {child.documentationComplete ? "Ver" : "Subir"}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pagos" className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">Pagos</h4>
                  </div>

                  {child.pendingPayments.length > 0 ? (
                    <div className="space-y-3">
                      {child.pendingPayments.map((payment) => (
                        <div key={payment.id} className="border rounded-lg p-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="font-medium">{payment.title}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                                <span>Importe: {payment.amount}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>Fecha límite: {payment.dueDate}</span>
                              </div>
                            </div>
                            <Button size="sm">Realizar pago</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No hay pagos pendientes</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

