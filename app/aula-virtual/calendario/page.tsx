import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarDays, Filter, Plus } from "lucide-react"

export default function CalendarioPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Consulta todas las actividades y eventos del grupo scout.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Nueva actividad
          </Button>
        </div>
      </div>

      {/* Calendar View Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vista de calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Mes</Button>
            <Button variant="ghost" size="sm" disabled>Semana</Button>
            <Button variant="ghost" size="sm" disabled>Día</Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <Card>
        <CardContent className="py-16">
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No hay eventos programados</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Aún no se han programado actividades en el calendario. Los eventos aparecerán aquí
                cuando se configuren desde el panel de administración.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                El calendario incluirá:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">Reuniones semanales</h4>
                  <p className="text-xs text-muted-foreground">Actividades regulares de cada sección</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">Salidas y campamentos</h4>
                  <p className="text-xs text-muted-foreground">Actividades especiales y acampadas</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">Eventos del grupo</h4>
                  <p className="text-xs text-muted-foreground">Celebraciones y actividades grupales</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}