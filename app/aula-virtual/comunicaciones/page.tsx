import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ComunicacionesPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunicaciones</h1>
          <p className="text-muted-foreground">
            Mantente informado con las últimas comunicaciones del grupo scout.
          </p>
        </div>
        <Button disabled>
          <Send className="mr-2 h-4 w-4" />
          Nueva comunicación
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar comunicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar comunicaciones..."
                className="pl-10"
                disabled
              />
            </div>
            <Button variant="outline" disabled>
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <Card>
        <CardContent className="py-16">
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No hay comunicaciones disponibles</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Aún no se han enviado comunicaciones. Los mensajes, circulares y anuncios
                aparecerán aquí cuando se publiquen.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Las comunicaciones incluirán:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">Circulares oficiales</h4>
                  <p className="text-xs text-muted-foreground">Información importante del grupo</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">Recordatorios</h4>
                  <p className="text-xs text-muted-foreground">Avisos sobre actividades próximas</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm">Noticias del grupo</h4>
                  <p className="text-xs text-muted-foreground">Novedades y actualizaciones</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}