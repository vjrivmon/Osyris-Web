"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { EditableText } from "@/components/editable/EditableText"
import { MapPin, Mail, Phone, Send } from "lucide-react"

// Data for FAQs
const faqs = [
  {
    question: "¿Cómo puedo inscribir a mi hijo/a en el grupo scout?",
    answer:
      "Para inscribir a tu hijo/a, puedes contactarnos a través del formulario de esta página, por email o acercarte directamente a nuestro local en horario de atención a familias. Te informaremos sobre el proceso de inscripción y las plazas disponibles.",
  },
  {
    question: "¿Cuál es la cuota y qué incluye?",
    answer:
      "La cuota anual es de 180€, que se puede pagar en tres plazos trimestrales. Incluye el seguro, materiales para las actividades regulares y la cuota de pertenencia a la Federación. Las acampadas y campamentos tienen un coste adicional.",
  },
  {
    question: "¿Qué edad debe tener mi hijo/a para unirse al grupo?",
    answer:
      "Aceptamos niños y niñas desde los 5 años (Castores) hasta los 19 años (Rutas). Cada sección tiene un rango de edad específico: Castores (5-7), Lobatos (7-10), Scouts (10-13), Pioneros (13-16) y Rutas (16-19).",
  },
  {
    question: "¿Cómo puedo colaborar como adulto?",
    answer:
      "Hay varias formas de colaborar: como monitor/a (Scouter), como miembro del Comité de Padres, o como colaborador puntual en actividades específicas. Contáctanos para más información.",
  },
  {
    question: "¿Qué actividades realizan durante el año?",
    answer:
      "Realizamos reuniones semanales los sábados, acampadas de fin de semana aproximadamente una vez al trimestre, y un campamento de verano de 15 días en julio. También participamos en actividades con otros grupos scouts y eventos comunitarios.",
  },
]

export default function ContactoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary py-16 md:py-24">
          <div className="container mx-auto px-4 text-center text-primary-foreground">
            <EditableText
              contentId={400}
              identificador="hero-title"
              seccion="contacto"
              as="h1"
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6"
            >
              Contacto
            </EditableText>
            <EditableText
              contentId={401}
              identificador="hero-subtitle"
              seccion="contacto"
              as="p"
              multiline
              className="mt-4 text-xl max-w-3xl mx-auto"
            >
              ¿Tienes alguna pregunta o quieres formar parte de nuestro grupo? ¡Contáctanos!
            </EditableText>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <Card>
                  <CardHeader>
                    <EditableText
                      contentId={402}
                      identificador="form-title"
                      seccion="contacto"
                      as={CardTitle}
                    >
                      Envíanos un mensaje
                    </EditableText>
                    <EditableText
                      contentId={403}
                      identificador="form-description"
                      seccion="contacto"
                      as={CardDescription}
                    >
                      Rellena el formulario y te responderemos lo antes posible.
                    </EditableText>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input id="name" placeholder="Tu nombre" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="tu@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto</Label>
                      <Input id="subject" placeholder="Asunto del mensaje" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje</Label>
                      <Textarea id="message" placeholder="Escribe tu mensaje aquí..." className="min-h-[150px]" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Enviar mensaje
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              <div className="md:w-1/2 space-y-8">
                <Card>
                  <CardHeader>
                    <EditableText
                      contentId={404}
                      identificador="contact-info-title"
                      seccion="contacto"
                      as={CardTitle}
                    >
                      Información de contacto
                    </EditableText>
                    <CardDescription>Puedes contactarnos a través de los siguientes medios.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Dirección</h3>
                        <EditableText
                          contentId={405}
                          identificador="contact-address"
                          seccion="contacto"
                          as="p"
                          multiline
                          className="text-muted-foreground"
                        >
                          Calle Poeta Ricard Sanmartí nº3, Barrio de Benimaclet, Valencia
                        </EditableText>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <EditableText
                          contentId={406}
                          identificador="contact-email"
                          seccion="contacto"
                          as="p"
                          className="text-muted-foreground"
                        >
                          info@grupoosyris.es
                        </EditableText>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">Teléfono</h3>
                        <EditableText
                          contentId={407}
                          identificador="contact-phone"
                          seccion="contacto"
                          as="p"
                          className="text-muted-foreground"
                        >
                          +34 600 123 456
                        </EditableText>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <EditableText
                      contentId={408}
                      identificador="horario-title"
                      seccion="contacto"
                      as={CardTitle}
                    >
                      Horario
                    </EditableText>
                    <EditableText
                      contentId={409}
                      identificador="horario-description"
                      seccion="contacto"
                      as={CardDescription}
                    >
                      Nuestras actividades regulares y horario de atención.
                    </EditableText>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <EditableText
                        contentId={410}
                        identificador="horario-reuniones-title"
                        seccion="contacto"
                        as="h3"
                        className="font-medium"
                      >
                        Reuniones semanales
                      </EditableText>
                      <EditableText
                        contentId={411}
                        identificador="horario-reuniones-time"
                        seccion="contacto"
                        as="p"
                        className="text-muted-foreground"
                      >
                        Sábados de 17:00 a 19:00
                      </EditableText>
                    </div>
                    <div>
                      <EditableText
                        contentId={412}
                        identificador="horario-familias-title"
                        seccion="contacto"
                        as="h3"
                        className="font-medium"
                      >
                        Atención a familias
                      </EditableText>
                      <EditableText
                        contentId={413}
                        identificador="horario-familias-time"
                        seccion="contacto"
                        as="p"
                        className="text-muted-foreground"
                      >
                        Sábados de 16:30 a 17:00 y de 19:00 a 19:30
                      </EditableText>
                    </div>
                    <div>
                      <EditableText
                        contentId={414}
                        identificador="horario-kraal-title"
                        seccion="contacto"
                        as="h3"
                        className="font-medium"
                      >
                        Reuniones de Kraal
                      </EditableText>
                      <EditableText
                        contentId={415}
                        identificador="horario-kraal-time"
                        seccion="contacto"
                        as="p"
                        className="text-muted-foreground"
                      >
                        Viernes de 20:00 a 22:00
                      </EditableText>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <EditableText
              contentId={416}
              identificador="map-title"
              seccion="contacto"
              as="h2"
              className="text-2xl font-bold text-center mb-8"
            >
              Nuestra ubicación
            </EditableText>
            <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3079.6536087335247!2d-0.3661111!3d39.4812222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd604f53c3913ebf%3A0x7fb0a7e3e5c2ae9a!2sCalle%20Poeta%20Ricard%20Sanmart%C3%AD%2C%203%2C%2046020%20Valencia!5e0!3m2!1ses!2ses!4v1653923456789!5m2!1ses!2ses"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <EditableText
              contentId={417}
              identificador="faq-title"
              seccion="contacto"
              as="h2"
              className="text-2xl font-bold text-center mb-8"
            >
              Preguntas frecuentes
            </EditableText>
            <div className="grid gap-6 max-w-3xl mx-auto">
              {faqs.map((faq, i) => (
                <Card key={i}>
                  <CardHeader>
                    <EditableText
                      contentId={418 + i * 2}
                      identificador={`faq-${i}-question`}
                      seccion="contacto"
                      as={CardTitle}
                      className="text-lg"
                    >
                      {faq.question}
                    </EditableText>
                  </CardHeader>
                  <CardContent>
                    <EditableText
                      contentId={419 + i * 2}
                      identificador={`faq-${i}-answer`}
                      seccion="contacto"
                      as="p"
                      multiline
                      className="text-muted-foreground"
                    >
                      {faq.answer}
                    </EditableText>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
