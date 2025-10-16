import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Calendar,
  MessageSquare,
  ArrowRight,
  Plus
} from "lucide-react"
import Link from "next/link"

export default function AulaVirtualDashboard() {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido al Aula Virtual</h1>
        <p className="text-muted-foreground text-lg">
          Tu espacio digital para mantenerte conectado con el Grupo Scout Osyris.
        </p>
      </div>
      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Documentos</CardTitle>
                <CardDescription>Accede a documentos importantes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
              <Link href="/aula-virtual/documentos" >
                Ver documentos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Calendario</CardTitle>
                <CardDescription>Consulta actividades y eventos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
              <Link href="/aula-virtual/calendario" >
                Ver calendario
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Comunicaciones</CardTitle>
                <CardDescription>Lee mensajes y circulares</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="w-full justify-between group-hover:bg-accent">
              <Link href="/aula-virtual/comunicaciones" >
                Ver comunicaciones
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Empty State for Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Aquí aparecerá tu actividad más reciente</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">No hay actividad reciente</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Cuando interactúes con documentos, eventos o comunicaciones,
                tu actividad aparecerá aquí.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}