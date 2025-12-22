"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StaticText } from "@/components/ui/static-content"
import { HelpCircle } from "lucide-react"

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

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* MainNav ya incluye su propio <header> con sticky top-0 */}
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary py-12 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 text-center text-primary-foreground">
            <StaticText
              content="Preguntas Frecuentes"
              tag="h1"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6"
            />
            <StaticText
              content="Encuentra respuestas a las preguntas más comunes sobre el Grupo Scout Osyris"
              tag="p"
              className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-4 sm:gap-6 max-w-4xl mx-auto">
              {faqs.map((faq, i) => (
                <Card 
                  key={i} 
                  className="border-l-4 border-l-primary hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <StaticText content={faq.question} tag="span" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StaticText
                      content={faq.answer}
                      tag="p"
                      className="text-muted-foreground leading-relaxed pl-8"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-12 sm:py-16 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <StaticText
              content="¿No encuentras lo que buscas?"
              tag="h2"
              className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
            />
            <StaticText
              content="Si tienes alguna otra pregunta, no dudes en contactarnos. Estaremos encantados de ayudarte."
              tag="p"
              className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-4"
            />
            <a 
              href="/contacto" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Contacta con nosotros
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

