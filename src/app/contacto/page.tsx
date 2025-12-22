"use client"

import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StaticText } from "@/components/ui/static-content"
import { MapPin, Mail, Phone, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useContactForm } from "@/hooks/useContactForm"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ContactoPage() {
  const {
    formData,
    errors,
    isLoading,
    isSuccess,
    isError,
    errorMessage,
    successMessage,
    handleChange,
    handleSubmit,
    resetForm
  } = useContactForm();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* MainNav ya incluye su propio <header> con sticky top-0 */}
      <MainNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-primary py-12 sm:py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 text-center text-primary-foreground">
            <StaticText
              content="Contacto"
              tag="h1"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6"
            />
            <StaticText
              content="¿Tienes alguna pregunta o quieres formar parte de nuestro grupo? ¡Contáctanos!"
              tag="p"
              className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-4"
            />
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
              {/* Left side - Contact Info & Schedule */}
              <div className="lg:w-1/2 space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      <StaticText content="Información de contacto" tag="span" />
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">Puedes contactarnos a través de los siguientes medios.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Dirección</h3>
                            <StaticText
                              content="Calle Poeta Ricard Sanmartí nº3"
                              tag="p"
                              className="text-muted-foreground"
                            />
                            <StaticText
                              content="Barrio de Benimaclet, Valencia"
                              tag="p"
                              className="text-muted-foreground"
                            />
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Email</h3>
                            <StaticText
                              content="info@grupoosyris.es"
                              tag="p"
                              className="text-muted-foreground"
                            />
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Teléfono</h3>
                            <StaticText
                              content="+34 600 123 456"
                              tag="p"
                              className="text-muted-foreground"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg overflow-hidden border h-48 sm:h-56 md:h-64">
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      <StaticText content="Horario" tag="span" />
                    </CardTitle>
                    <CardDescription>
                      <StaticText content="Nuestras actividades regulares y horario de atención." tag="span" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <StaticText
                        content="Reuniones semanales"
                        tag="h3"
                        className="font-medium"
                      />
                      <StaticText
                        content="Sábados de 17:00 a 19:00"
                        tag="p"
                        className="text-muted-foreground"
                      />
                    </div>
                    <div>
                      <StaticText
                        content="Atención a familias"
                        tag="h3"
                        className="font-medium"
                      />
                      <StaticText
                        content="Sábados de 16:30 a 17:00 y de 19:00 a 19:30"
                        tag="p"
                        className="text-muted-foreground"
                      />
                    </div>
                    <div>
                      <StaticText
                        content="Reuniones de Kraal"
                        tag="h3"
                        className="font-medium"
                      />
                      <StaticText
                        content="Viernes de 20:00 a 22:00"
                        tag="p"
                        className="text-muted-foreground"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right side - Contact Form */}
              <div className="lg:w-1/2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      <StaticText content="Envíanos un mensaje" tag="span" />
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      <StaticText content="Rellena el formulario y te responderemos lo antes posible." tag="span" />
                    </CardDescription>
                  </CardHeader>

                  <form onSubmit={onSubmit}>
                    <CardContent className="space-y-4">
                      {/* Mensaje de éxito */}
                      {isSuccess && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            {successMessage}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Mensaje de error */}
                      {isError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {errorMessage}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          placeholder="Tu nombre"
                          value={formData.nombre}
                          onChange={(e) => handleChange('nombre', e.target.value)}
                          disabled={isLoading}
                          className={errors.nombre ? 'border-red-500' : ''}
                        />
                        {errors.nombre && (
                          <p className="text-sm text-red-500">{errors.nombre}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          disabled={isLoading}
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="asunto">Asunto</Label>
                        <Input
                          id="asunto"
                          placeholder="Asunto del mensaje"
                          value={formData.asunto}
                          onChange={(e) => handleChange('asunto', e.target.value)}
                          disabled={isLoading}
                          className={errors.asunto ? 'border-red-500' : ''}
                        />
                        {errors.asunto && (
                          <p className="text-sm text-red-500">{errors.asunto}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mensaje">Mensaje</Label>
                        <Textarea
                          id="mensaje"
                          placeholder="Escribe tu mensaje aquí..."
                          className={`min-h-[150px] ${errors.mensaje ? 'border-red-500' : ''}`}
                          value={formData.mensaje}
                          onChange={(e) => handleChange('mensaje', e.target.value)}
                          disabled={isLoading}
                        />
                        {errors.mensaje && (
                          <p className="text-sm text-red-500">{errors.mensaje}</p>
                        )}
                        <p className="text-xs text-muted-foreground text-right">
                          {formData.mensaje.length}/5000 caracteres
                        </p>
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar mensaje
                          </>
                        )}
                      </Button>

                      {isSuccess && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={resetForm}
                        >
                          Enviar otro mensaje
                        </Button>
                      )}
                    </CardFooter>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
