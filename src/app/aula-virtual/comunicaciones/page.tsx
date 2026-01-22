'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send, Search, Filter, History, Mail, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SendMessageModal } from '@/components/aula-virtual/educandos/send-message-modal'
import { useEducandosScouter } from '@/hooks/useEducandosScouter'
import Link from 'next/link'

export default function ComunicacionesPage() {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const { educandos } = useEducandosScouter()
  const educandosConFamilia = educandos.filter(e => e.tiene_familia_vinculada)

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunicaciones</h1>
          <p className="text-muted-foreground">
            Envia mensajes a las familias de tu seccion
          </p>
        </div>
        <Button
          onClick={() => setIsMessageModalOpen(true)}
          disabled={educandosConFamilia.length === 0}
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar Mensaje
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Familias en tu seccion</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {educandosConFamilia.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sin familia vinculada</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-6 w-6 text-muted-foreground" />
              {educandos.filter(e => !e.tiene_familia_vinculada).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Link href="/aula-virtual/educandos">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="pb-2">
              <CardDescription>Ir a educandos</CardDescription>
              <CardTitle className="text-lg flex items-center gap-2">
                Ver lista completa
                <Mail className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600" />
            Sistema de Mensajeria
          </CardTitle>
          <CardDescription>
            Comunicate directamente con las familias de los educandos de tu seccion
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center">
              <MessageSquare className="h-12 w-12 text-purple-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Envia mensajes a las familias</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Los mensajes se envian como notificaciones a las familias. Pueden verlos en su panel de notificaciones.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Puedes enviar mensajes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    A toda la seccion
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Envia un mensaje a todas las familias de tu seccion
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    A educandos seleccionados
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecciona varios educandos para enviar el mensaje
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    A un educando
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mensaje directo a la familia de un educando
                  </p>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => setIsMessageModalOpen(true)}
              disabled={educandosConFamilia.length === 0}
              className="mt-4"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Nuevo Mensaje
            </Button>
            {educandosConFamilia.length === 0 && (
              <p className="text-sm text-amber-600">
                No hay educandos con familias vinculadas en tu seccion
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de envio de mensajes */}
      <SendMessageModal
        open={isMessageModalOpen}
        onOpenChange={setIsMessageModalOpen}
        educandos={educandos}
      />
    </div>
  )
}