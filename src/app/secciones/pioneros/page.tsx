import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PionerosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Posta Kanhiwara</CardTitle>
            <p className="text-xl text-center text-muted-foreground">Pioneros (13-16 años)</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Descripción</h2>
              <p className="text-lg">
                La Posta Kanhiwara es la sección de Pioneros del Grupo Scout Osyris,
                dedicada a jóvenes de 13 a 16 años que buscan aventuras, desafíos
                y crecimiento personal.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Nuestras Actividades</h2>
              <ul className="list-disc list-inside space-y-2 text-lg">
                <li>Campamentos y excursiones</li>
                <li>Proyectos de servicio comunitario</li>
                <li>Desarrollo de habilidades técnicas</li>
                <li>Liderazgo y trabajo en equipo</li>
                <li>Acción y aventura al aire libre</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
              <p className="text-lg">
                Para más información sobre nuestra sección de Pioneros,
                puedes contactarnos a través de la página principal del grupo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}