import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"

export default function PreguntasFrecuentesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* MainNav ya incluye su propio <header> con sticky top-0 */}
      <MainNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary py-16 md:py-24">
          <div className="container mx-auto px-4 text-center text-primary-foreground">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">Preguntas Frecuentes</h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">
              Encuentra respuestas a las preguntas más comunes sobre el Grupo Scout Osyris
            </p>
            <div className="mt-8 max-w-md mx-auto relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar una pregunta..."
                  className="w-full py-3 px-4 pr-10 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-foreground/70" />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="general" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="inscripcion">Inscripción</TabsTrigger>
                  <TabsTrigger value="actividades">Actividades</TabsTrigger>
                  <TabsTrigger value="organizacion">Organización</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Preguntas Generales</CardTitle>
                    <CardDescription>Información básica sobre el escultismo y el Grupo Scout Osyris</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {generalFaqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inscripcion">
                <Card>
                  <CardHeader>
                    <CardTitle>Inscripción y Cuotas</CardTitle>
                    <CardDescription>
                      Todo lo que necesitas saber sobre cómo unirte al grupo y las cuotas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {inscripcionFaqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actividades">
                <Card>
                  <CardHeader>
                    <CardTitle>Actividades y Campamentos</CardTitle>
                    <CardDescription>Información sobre nuestras actividades, salidas y campamentos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {actividadesFaqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="organizacion">
                <Card>
                  <CardHeader>
                    <CardTitle>Organización y Funcionamiento</CardTitle>
                    <CardDescription>Cómo nos organizamos y funcionamos como grupo scout</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {organizacionFaqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">¿No encuentras la respuesta que buscas?</h2>
            <p className="mb-8 max-w-2xl mx-auto">
              Si tienes alguna pregunta adicional o necesitas más información, no dudes en contactarnos. Estaremos
              encantados de ayudarte.
            </p>
            <Button asChild size="lg">
              <Link href="/contacto" >
                Contactar con nosotros
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

// Data for FAQs
const generalFaqs = [
  {
    question: "¿Qué es el escultismo?",
    answer:
      "El escultismo es un movimiento educativo para jóvenes, fundado por Robert Baden-Powell en 1907. Se basa en el aprendizaje a través de la acción, la vida en la naturaleza y el servicio a los demás. Busca formar ciudadanos responsables, comprometidos y conscientes de su entorno.",
  },
  {
    question: "¿Qué es el Grupo Scout Osyris?",
    answer:
      "El Grupo Scout Osyris es una asociación educativa sin ánimo de lucro que forma parte del Movimiento Scout Católico. Llevamos más de 30 años trabajando en el barrio de Benimaclet en Valencia, ofreciendo a niños, niñas y jóvenes un espacio de crecimiento personal basado en los valores del escultismo.",
  },
  {
    question: "¿Qué valores promueve el escultismo?",
    answer:
      "El escultismo promueve valores como la responsabilidad, el respeto, la solidaridad, el compromiso, la vida en la naturaleza, el trabajo en equipo, la autonomía personal y el servicio a los demás. Todo ello a través de una metodología activa y participativa adaptada a cada edad.",
  },
  {
    question: "¿Qué actividades realizan los scouts?",
    answer:
      "Realizamos reuniones semanales los sábados por la tarde, donde desarrollamos juegos, talleres y dinámicas educativas. También organizamos acampadas de fin de semana aproximadamente una vez al trimestre, y un campamento de verano de 15 días en julio. Todas nuestras actividades tienen un componente educativo y están adaptadas a cada grupo de edad.",
  },
  {
    question: "¿El Grupo Scout Osyris tiene alguna afiliación religiosa?",
    answer:
      "Sí, formamos parte del Movimiento Scout Católico (MSC), por lo que nuestra propuesta educativa incluye la dimensión espiritual desde la perspectiva católica. No obstante, respetamos todas las creencias y acogemos a niños y jóvenes de cualquier religión, promoviendo siempre el respeto y la tolerancia.",
  },
]

const inscripcionFaqs = [
  {
    question: "¿Cómo puedo inscribir a mi hijo/a en el grupo scout?",
    answer:
      "Para inscribir a tu hijo/a, puedes contactarnos a través del formulario de contacto de nuestra web, por email a info@grupoosyris.es o acercarte directamente a nuestro local en horario de atención a familias (sábados de 16:30 a 17:00 y de 19:00 a 19:30). Te informaremos sobre el proceso de inscripción y las plazas disponibles.",
  },
  {
    question: "¿Cuál es la edad mínima para unirse al grupo?",
    answer:
      "Aceptamos niños y niñas desde los 6 años (Castores) hasta los 19 años (Rutas). Cada sección tiene un rango de edad específico: Castores (6-8), Lobatos (8-11), Scouts (11-14), Pioneros (14-17) y Rutas (17-19).",
  },
  {
    question: "¿Cuál es la cuota y qué incluye?",
    answer:
      "La cuota anual es de 180€, que se puede pagar en tres plazos trimestrales de 60€. Incluye el seguro, materiales para las actividades regulares y la cuota de pertenencia a la Federación. Las acampadas y campamentos tienen un coste adicional que se comunica con antelación.",
  },
  {
    question: "¿Hay algún descuento para familias con varios hijos?",
    answer:
      "Sí, aplicamos un descuento del 10% en la cuota anual a partir del segundo hermano inscrito. También disponemos de becas para familias con dificultades económicas, que se pueden solicitar al Comité de Padres.",
  },
  {
    question: "¿Qué documentación se necesita para la inscripción?",
    answer:
      "Para formalizar la inscripción se necesita: formulario de inscripción cumplimentado, fotocopia del DNI del niño/a (si lo tiene) y de los padres/tutores, fotocopia de la tarjeta sanitaria, ficha médica, autorización de imágenes y justificante de pago de la cuota. Todos estos documentos se facilitan en el momento de la inscripción.",
  },
]

const actividadesFaqs = [
  {
    question: "¿Qué actividades realizan durante el año?",
    answer:
      "Realizamos reuniones semanales los sábados de 17:00 a 19:00, acampadas de fin de semana aproximadamente una vez al trimestre, y un campamento de verano de 15 días en julio. También participamos en actividades con otros grupos scouts y eventos comunitarios en el barrio de Benimaclet.",
  },
  {
    question: "¿Cómo son los campamentos de verano?",
    answer:
      "El campamento de verano dura 15 días y se realiza en julio en un entorno natural, generalmente en la montaña. Durante el campamento, los educandos viven en tiendas de campaña, participan en actividades de contacto con la naturaleza, juegos, talleres, rutas de senderismo y veladas. Todo ello siguiendo un proyecto educativo adaptado a cada edad.",
  },
  {
    question: "¿Qué equipamiento necesita mi hijo/a para las actividades?",
    answer:
      "Para las reuniones semanales solo necesitan la camisa scout y el pañoleta del grupo (que se entregan tras el periodo de integración). Para acampadas y campamentos, proporcionamos una lista detallada que incluye saco de dormir, esterilla, ropa adecuada, calzado de montaña, etc. No es necesario comprar todo de golpe, se puede ir adquiriendo progresivamente.",
  },
  {
    question: "¿Cómo garantizan la seguridad durante las actividades?",
    answer:
      "Todas nuestras actividades están planificadas y supervisadas por monitores formados. Contamos con seguros de responsabilidad civil y de accidentes. Además, seguimos protocolos de seguridad específicos para cada tipo de actividad, especialmente en las que se realizan en la naturaleza. La ratio monitor-niño se ajusta a la normativa vigente.",
  },
  {
    question: "¿Qué pasa si mi hijo/a no puede asistir a alguna actividad?",
    answer:
      "Entendemos que pueden surgir compromisos familiares o imprevistos. Solo pedimos que se nos comunique con antelación la ausencia para poder planificar adecuadamente las actividades. La asistencia regular es importante para el seguimiento del programa educativo, pero no es obligatoria para todas las actividades.",
  },
]

const organizacionFaqs = [
  {
    question: "¿Cómo se organiza el Grupo Scout Osyris?",
    answer:
      "El grupo se organiza en dos estructuras principales: el Kraal (equipo de monitores) y el Comité de Padres. El Kraal se encarga de la planificación y ejecución del programa educativo, mientras que el Comité gestiona los aspectos administrativos y económicos. Ambos trabajan coordinadamente para el buen funcionamiento del grupo.",
  },
  {
    question: "¿Qué son las secciones y cómo funcionan?",
    answer:
      "Las secciones son los grupos de edad en los que se dividen los educandos: Castores (6-8 años), Lobatos (8-11 años), Scouts (11-14 años), Pioneros (14-17 años) y Rutas (17-19 años). Cada sección tiene su propio equipo de monitores y un programa educativo adaptado a las características y necesidades de cada edad.",
  },
  {
    question: "¿Cómo puedo colaborar como adulto?",
    answer:
      "Hay varias formas de colaborar: como monitor/a (Scouter), como miembro del Comité de Padres, o como colaborador puntual en actividades específicas. Los monitores reciben formación específica y deben comprometerse a asistir regularmente. El Comité se reúne mensualmente para gestionar aspectos administrativos y económicos.",
  },
  {
    question: "¿Qué formación tienen los monitores?",
    answer:
      "Todos nuestros monitores son voluntarios y reciben formación específica en educación scout a través de la Escuela de Formación de la Federación. Esta formación incluye aspectos pedagógicos, técnicas scouts, primeros auxilios, legislación, etc. Además, realizamos formación continua dentro del grupo para mejorar nuestra labor educativa.",
  },
  {
    question: "¿Cómo se financian las actividades del grupo?",
    answer:
      "El grupo se financia principalmente a través de las cuotas de los socios, que cubren los gastos básicos de funcionamiento. También realizamos algunas actividades de autofinanciación (venta de lotería, mercadillos, etc.) y ocasionalmente recibimos subvenciones públicas para proyectos específicos. Todas las cuentas son transparentes y se presentan anualmente a las familias.",
  },
]

