"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart3,
  Calendar,
  FileText,
  Users,
  Download,
  PlusCircle,
  Search,
  Filter,
  ChevronRight,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

export default function ComiteDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, Carlos</h1>
        <p className="text-muted-foreground">
          Panel de administración del Comité del Grupo Scout Osyris. Aquí puedes gestionar todos los aspectos del grupo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+12 desde el curso anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividades Planificadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Próxima: Campamento de Verano</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 requieren atención urgente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Financiero</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.250,00 €</div>
            <p className="text-xs text-muted-foreground">+850,00 € este mes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="finances">Finanzas</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Distribución por Secciones</CardTitle>
                <CardDescription>Número de miembros por sección</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sections.map((section) => (
                    <div key={section.name} className="flex items-center">
                      <div className="w-12 text-right mr-4">
                        <span className="text-sm font-medium">{section.count}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium" style={{ color: section.color }}>
                            {section.name}
                          </span>
                          <span className="text-sm text-muted-foreground">{section.percentage}%</span>
                        </div>
                        <Progress
                          value={section.percentage}
                          className="h-2"
                          style={{ backgroundColor: `${section.color}20` }}
                        >
                          <div className="h-full" style={{ backgroundColor: section.color }}></div>
                        </Progress>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Educandos</div>
                    <div className="text-2xl font-bold">98</div>
                    <div className="text-xs text-muted-foreground mt-1">77% del total</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Monitores</div>
                    <div className="text-2xl font-bold">29</div>
                    <div className="text-xs text-muted-foreground mt-1">23% del total</div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/comite/miembros">Ver todos los miembros</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
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
                    <Link href="/dashboard/comite/calendario">Ver calendario completo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumen Financiero</CardTitle>
                <CardDescription>Estado actual de las finanzas del grupo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Ingresos (Año)</div>
                      <div className="text-2xl font-bold">12.450,00 €</div>
                      <div className="text-xs text-green-600 mt-1">+8% respecto al año anterior</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Gastos (Año)</div>
                      <div className="text-2xl font-bold">8.200,00 €</div>
                      <div className="text-xs text-amber-600 mt-1">+5% respecto al año anterior</div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">Presupuesto Campamento</div>
                      <Badge variant="outline">En progreso</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Recaudado: 3.750,00 €</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-2">Objetivo: 5.000,00 €</div>
                  </div>

                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">Cuotas Pendientes</div>
                      <div className="text-sm font-medium">1.250,00 €</div>
                    </div>
                    <div className="text-xs text-muted-foreground">8 familias con pagos pendientes</div>
                    <Button asChild variant="link" size="sm" className="px-0 mt-1">
                      <Link href="/dashboard/comite/finanzas/pendientes">Ver detalles</Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/comite/finanzas">Ver informe completo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentos Pendientes</CardTitle>
                <CardDescription>Documentos que requieren atención</CardDescription>
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
                          <Button size="sm">Revisar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/comite/documentos">Ver todos los documentos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Gestión de Miembros</CardTitle>
                  <CardDescription>Administra los miembros del grupo scout</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar miembro..." className="pl-8 w-full sm:w-[200px]" />
                  </div>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir miembro
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="educandos">Educandos</TabsTrigger>
                  <TabsTrigger value="kraal">Kraal</TabsTrigger>
                  <TabsTrigger value="comite">Comité</TabsTrigger>
                  <TabsTrigger value="familias">Familias</TabsTrigger>
                </TabsList>

                <div className="flex items-center justify-between my-4">
                  <div className="text-sm text-muted-foreground">Mostrando 10 de 127 miembros</div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-4">Nombre</div>
                    <div className="col-span-2">Sección</div>
                    <div className="col-span-2">Rol</div>
                    <div className="col-span-2">Estado</div>
                    <div className="col-span-2 text-right">Acciones</div>
                  </div>

                  {members.map((member, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/50"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <Badge className={getSectionClass(member.section)}>{member.section}</Badge>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm">{member.role}</span>
                      </div>
                      <div className="col-span-2">
                        <Badge variant={member.status === "Activo" ? "outline" : "secondary"}>{member.status}</Badge>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/comite/miembros/${i}`}>
                            <span className="sr-only">Ver detalles</span>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <div className="text-sm text-muted-foreground">Página 1 de 13</div>
                  <Button variant="outline" size="sm">
                    Siguiente
                  </Button>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finances" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Gestión Financiera</CardTitle>
                  <CardDescription>Administra las finanzas del grupo scout</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo movimiento
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="summary">Resumen</TabsTrigger>
                  <TabsTrigger value="income">Ingresos</TabsTrigger>
                  <TabsTrigger value="expenses">Gastos</TabsTrigger>
                  <TabsTrigger value="pending">Pendientes</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Balance Total</div>
                      <div className="text-3xl font-bold">4.250,00 €</div>
                      <div className="text-xs text-green-600 mt-1">+850,00 € este mes</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Ingresos (Año)</div>
                      <div className="text-3xl font-bold">12.450,00 €</div>
                      <div className="text-xs text-green-600 mt-1">+8% respecto al año anterior</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Gastos (Año)</div>
                      <div className="text-3xl font-bold">8.200,00 €</div>
                      <div className="text-xs text-amber-600 mt-1">+5% respecto al año anterior</div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-4">Presupuestos Activos</h3>
                    <div className="space-y-4">
                      {budgets.map((budget, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{budget.name}</div>
                            <Badge variant="outline">{budget.status}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Recaudado: {budget.current} €</span>
                            <span>{budget.percentage}%</span>
                          </div>
                          <Progress value={budget.percentage} className="h-2" />
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Objetivo: {budget.target} €</span>
                            <span className="text-muted-foreground">Fecha límite: {budget.deadline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-4">Últimos Movimientos</h3>
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((transaction, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${transaction.type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
                            >
                              <CreditCard className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">{transaction.date}</p>
                            </div>
                          </div>
                          <div
                            className={`font-medium ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {transaction.amount} €
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/comite/finanzas/movimientos">Ver todos los movimientos</Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="income" className="mt-4">
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                      <div className="col-span-5">Concepto</div>
                      <div className="col-span-2">Fecha</div>
                      <div className="col-span-2">Categoría</div>
                      <div className="col-span-2 text-right">Importe</div>
                      <div className="col-span-1 text-right">Acciones</div>
                    </div>

                    {transactions
                      .filter((t) => t.type === "income")
                      .map((transaction, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/50"
                        >
                          <div className="col-span-5">
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">{transaction.reference}</p>
                          </div>
                          <div className="col-span-2 text-sm">{transaction.date}</div>
                          <div className="col-span-2">
                            <Badge variant="outline">{transaction.category}</Badge>
                          </div>
                          <div className="col-span-2 text-right font-medium text-green-500">
                            +{transaction.amount} €
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="expenses" className="mt-4">
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                      <div className="col-span-5">Concepto</div>
                      <div className="col-span-2">Fecha</div>
                      <div className="col-span-2">Categoría</div>
                      <div className="col-span-2 text-right">Importe</div>
                      <div className="col-span-1 text-right">Acciones</div>
                    </div>

                    {transactions
                      .filter((t) => t.type === "expense")
                      .map((transaction, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/50"
                        >
                          <div className="col-span-5">
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">{transaction.reference}</p>
                          </div>
                          <div className="col-span-2 text-sm">{transaction.date}</div>
                          <div className="col-span-2">
                            <Badge variant="outline">{transaction.category}</Badge>
                          </div>
                          <div className="col-span-2 text-right font-medium text-red-500">-{transaction.amount} €</div>
                          <div className="col-span-1 flex justify-end">
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="pending" className="mt-4 space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-4">Pagos Pendientes</h3>
                    <div className="space-y-3">
                      {pendingPayments.map((payment, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={payment.avatar} alt={payment.name} />
                              <AvatarFallback>{getInitials(payment.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{payment.name}</p>
                              <p className="text-xs text-muted-foreground">{payment.concept}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-medium">{payment.amount} €</p>
                              <p className="text-xs text-muted-foreground">Vence: {payment.dueDate}</p>
                            </div>
                            <Button size="sm">Recordar</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Gestión de Documentos</CardTitle>
                  <CardDescription>Administra los documentos del grupo scout</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar documento..." className="pl-8 w-full sm:w-[200px]" />
                  </div>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo documento
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="pending">Pendientes</TabsTrigger>
                  <TabsTrigger value="approved">Aprobados</TabsTrigger>
                  <TabsTrigger value="templates">Plantillas</TabsTrigger>
                </TabsList>

                <div className="flex items-center justify-between my-4">
                  <div className="text-sm text-muted-foreground">Mostrando 10 de 45 documentos</div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-5">Documento</div>
                    <div className="col-span-2">Fecha</div>
                    <div className="col-span-2">Categoría</div>
                    <div className="col-span-2">Estado</div>
                    <div className="col-span-1 text-right">Acciones</div>
                  </div>

                  {documents.map((doc, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/50"
                    >
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.description}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm">{doc.date}</div>
                      <div className="col-span-2">
                        <Badge variant="outline">{doc.category}</Badge>
                      </div>
                      <div className="col-span-2">
                        <Badge variant={getStatusVariant(doc.status)}>{doc.status}</Badge>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <div className="text-sm text-muted-foreground">Página 1 de 5</div>
                  <Button variant="outline" size="sm">
                    Siguiente
                  </Button>
                </div>
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

function getSectionClass(section: string): string {
  if (section === "Lobatos") return "bg-yellow-500/10 text-yellow-500 border-yellow-500"
  if (section === "Castores") return "bg-orange-500/10 text-orange-500 border-orange-500"
  if (section === "Tropa") return "bg-blue-500/10 text-blue-500 border-blue-500"
  if (section === "Pioneros") return "bg-red-600/10 text-red-600 border-red-600"
  if (section === "Rutas") return "bg-green-700/10 text-green-700 border-green-700"
  if (section === "Comité") return "bg-purple-600/10 text-purple-600 border-purple-600"
  if (section === "Kraal") return "bg-indigo-600/10 text-indigo-600 border-indigo-600"
  return "bg-primary/10 text-primary border-primary"
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "Pendiente") return "outline"
  if (status === "Aprobado") return "default"
  if (status === "Rechazado") return "destructive"
  if (status === "Borrador") return "secondary"
  return "outline"
}

// Mock data
const sections = [
  { name: "Castores", count: 15, percentage: 12, color: "rgb(249 115 22)" },
  { name: "Lobatos", count: 28, percentage: 22, color: "rgb(234 179 8)" },
  { name: "Tropa", count: 32, percentage: 25, color: "rgb(59 130 246)" },
  { name: "Pioneros", count: 23, percentage: 18, color: "rgb(220 38 38)" },
  { name: "Rutas", count: 15, percentage: 12, color: "rgb(21 128 61)" },
  { name: "Kraal", count: 14, percentage: 11, color: "rgb(99 102 241)" },
]

const upcomingActivities = [
  {
    title: "Campamento de Verano",
    date: "15-30 de julio, 2023",
    description: "Campamento anual en la Sierra de Gredos",
    sections: ["Todas las secciones"],
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
  {
    title: "Presupuesto Anual 2023-2024",
    deadline: "15 de junio, 2023",
    description: "Revisión y aprobación del presupuesto para el próximo curso",
    urgent: true,
  },
]

const members = [
  {
    name: "María García",
    email: "maria.garcia@osyris.org",
    section: "Lobatos",
    role: "Coordinadora",
    status: "Activo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Juan Pérez",
    email: "juan.perez@osyris.org",
    section: "Tropa",
    role: "Monitor",
    status: "Activo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Laura Sánchez",
    email: "laura.sanchez@osyris.org",
    section: "Pioneros",
    role: "Monitora",
    status: "Activo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@osyris.org",
    section: "Comité",
    role: "Presidente",
    status: "Activo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Ana Martínez",
    email: "ana.martinez@osyris.org",
    section: "Kraal",
    role: "Tesorera",
    status: "Activo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "David Gómez",
    email: "david.gomez@osyris.org",
    section: "Castores",
    role: "Monitor",
    status: "Activo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Elena Ruiz",
    email: "elena.ruiz@osyris.org",
    section: "Rutas",
    role: "Monitora",
    status: "Activo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Javier Díaz",
    email: "javier.diaz@osyris.org",
    section: "Comité",
    role: "Secretario",
    status: "Activo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Sara Fernández",
    email: "sara.fernandez@osyris.org",
    section: "Kraal",
    role: "Coordinadora",
    status: "Inactivo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Pablo Navarro",
    email: "pablo.navarro@osyris.org",
    section: "Pioneros",
    role: "Educando",
    status: "Activo",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const budgets = [
  {
    name: "Campamento de Verano",
    current: 3750,
    target: 5000,
    percentage: 75,
    status: "En progreso",
    deadline: "30 de junio, 2023",
  },
  {
    name: "Material de Acampada",
    current: 850,
    target: 1200,
    percentage: 71,
    status: "En progreso",
    deadline: "15 de julio, 2023",
  },
  {
    name: "Actividades Curso 2023-2024",
    current: 1200,
    target: 3000,
    percentage: 40,
    status: "En progreso",
    deadline: "1 de septiembre, 2023",
  },
]

const transactions = [
  {
    description: "Cuotas Mensuales Mayo",
    reference: "CM-2023-05",
    date: "28 de mayo, 2023",
    amount: 1250,
    category: "Cuotas",
    type: "income",
  },
  {
    description: "Compra Material Campamento",
    reference: "GC-2023-125",
    date: "25 de mayo, 2023",
    amount: 350,
    category: "Material",
    type: "expense",
  },
  {
    description: "Pago Reserva Albergue",
    reference: "GC-2023-124",
    date: "20 de mayo, 2023",
    amount: 500,
    category: "Alojamiento",
    type: "expense",
  },
  {
    description: "Inscripciones Campamento",
    reference: "IC-2023-01",
    date: "15 de mayo, 2023",
    amount: 2500,
    category: "Campamentos",
    type: "income",
  },
  {
    description: "Compra Material Oficina",
    reference: "GC-2023-123",
    date: "10 de mayo, 2023",
    amount: 75,
    category: "Material",
    type: "expense",
  },
  {
    description: "Cuotas Mensuales Abril",
    reference: "CM-2023-04",
    date: "28 de abril, 2023",
    amount: 1250,
    category: "Cuotas",
    type: "income",
  },
  {
    description: "Subvención Ayuntamiento",
    reference: "SA-2023-01",
    date: "15 de abril, 2023",
    amount: 1500,
    category: "Subvenciones",
    type: "income",
  },
]

const pendingPayments = [
  {
    name: "Familia Martínez",
    concept: "Cuota Campamento de Verano",
    amount: 250,
    dueDate: "5 de junio, 2023",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Familia López",
    concept: "Cuota Campamento de Verano",
    amount: 500,
    dueDate: "5 de junio, 2023",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Familia Sánchez",
    concept: "Cuota Mensual Mayo",
    amount: 45,
    dueDate: "Vencido (31 de mayo, 2023)",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Familia Gómez",
    concept: "Cuota Campamento de Verano",
    amount: 250,
    dueDate: "5 de junio, 2023",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    name: "Familia Fernández",
    concept: "Cuota Mensual Mayo",
    amount: 90,
    dueDate: "Vencido (31 de mayo, 2023)",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const documents = [
  {
    title: "Autorización Campamento de Verano",
    description: "Plantilla de autorización para el campamento",
    date: "15 de mayo, 2023",
    category: "Plantillas",
    status: "Aprobado",
  },
  {
    title: "Ficha Médica",
    description: "Formulario de información médica",
    date: "15 de mayo, 2023",
    category: "Plantillas",
    status: "Aprobado",
  },
  {
    title: "Presupuesto Anual 2023-2024",
    description: "Propuesta de presupuesto para el próximo curso",
    date: "1 de junio, 2023",
    category: "Finanzas",
    status: "Pendiente",
  },
  {
    title: "Memoria Actividades 2022-2023",
    description: "Resumen de actividades del curso actual",
    date: "28 de mayo, 2023",
    category: "Informes",
    status: "Borrador",
  },
  {
    title: "Proyecto Educativo",
    description: "Actualización del proyecto educativo del grupo",
    date: "10 de mayo, 2023",
    category: "Educativo",
    status: "Pendiente",
  },
  {
    title: "Normativa Interna",
    description: "Actualización de la normativa interna del grupo",
    date: "5 de mayo, 2023",
    category: "Normativa",
    status: "Aprobado",
  },
  {
    title: "Informe Evaluación Trimestral",
    description: "Evaluación de actividades del segundo trimestre",
    date: "15 de abril, 2023",
    category: "Informes",
    status: "Aprobado",
  },
  {
    title: "Solicitud Subvención Ayuntamiento",
    description: "Documentación para solicitar subvención municipal",
    date: "1 de abril, 2023",
    category: "Subvenciones",
    status: "Aprobado",
  },
  {
    title: "Plan Anual 2023-2024",
    description: "Planificación de actividades para el próximo curso",
    date: "1 de junio, 2023",
    category: "Planificación",
    status: "Borrador",
  },
  {
    title: "Protocolo de Seguridad",
    description: "Actualización del protocolo de seguridad en actividades",
    date: "20 de mayo, 2023",
    category: "Normativa",
    status: "Pendiente",
  },
]

