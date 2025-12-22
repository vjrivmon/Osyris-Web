import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"

export default function TerminosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* MainNav ya incluye su propio <header> con sticky top-0 */}
      <MainNav />

      <main className="flex-1 container py-12">
        <h1 className="text-3xl font-bold mb-6">Términos de Servicio</h1>

        <div className="prose max-w-none">
          <p>Última actualización: 21 de marzo de 2025</p>

          <h2>1. Introducción</h2>
          <p>
            Bienvenido a la plataforma web del Grupo Scout Osyris. Estos Términos de Servicio ("Términos") rigen su
            acceso y uso de nuestro sitio web, servicios, aplicaciones y herramientas (colectivamente, los "Servicios").
          </p>
          <p>
            Al acceder o utilizar nuestros Servicios, usted acepta estar sujeto a estos Términos. Si no está de acuerdo
            con estos Términos, no debe acceder ni utilizar nuestros Servicios.
          </p>

          <h2>2. Definiciones</h2>
          <ul>
            <li>
              <strong>"Nosotros", "nos", "nuestro"</strong> se refiere al Grupo Scout Osyris.
            </li>
            <li>
              <strong>"Usted", "su"</strong> se refiere a la persona que accede o utiliza los Servicios.
            </li>
            <li>
              <strong>"Contenido"</strong> se refiere a cualquier información, texto, gráficos, fotos, videos u otros
              materiales que se cargan, descargan o aparecen en nuestros Servicios.
            </li>
          </ul>

          <h2>3. Uso de los Servicios</h2>
          <p>
            Nuestros Servicios están destinados a ser utilizados por miembros del Grupo Scout Osyris, incluyendo
            monitores, educandos, familias y comité. Usted debe tener al menos 18 años para crear una cuenta en nuestros
            Servicios, o tener el consentimiento de un padre o tutor legal si es menor de edad.
          </p>
          <p>
            Usted es responsable de mantener la confidencialidad de su contraseña y cuenta, y es completamente
            responsable de todas las actividades que ocurran bajo su cuenta.
          </p>

          <h2>4. Contenido y Conducta</h2>
          <p>
            Usted es responsable de todo el Contenido que publique, cargue, o de otra manera ponga a disposición a
            través de nuestros Servicios. No debe publicar Contenido que:
          </p>
          <ul>
            <li>Sea ilegal, difamatorio, obsceno, pornográfico, invasivo de la privacidad de otros, o abusivo.</li>
            <li>Infrinja los derechos de propiedad intelectual de terceros.</li>
            <li>
              Contenga virus, troyanos, gusanos, bombas de tiempo, o cualquier otro código, archivo o programa diseñado
              para interrumpir, destruir o limitar la funcionalidad de cualquier software o hardware.
            </li>
          </ul>

          <h2>5. Propiedad Intelectual</h2>
          <p>
            El Contenido proporcionado por nosotros, incluyendo pero no limitado a textos, gráficos, logotipos, iconos,
            imágenes, clips de audio, descargas digitales y compilaciones de datos, es propiedad del Grupo Scout Osyris
            o de sus proveedores de contenido y está protegido por las leyes de propiedad intelectual.
          </p>
          <p>
            No puede utilizar, reproducir, modificar, distribuir o almacenar ningún Contenido para cualquier otro
            propósito que no sea el uso permitido de los Servicios.
          </p>

          <h2>6. Privacidad</h2>
          <p>
            Su privacidad es importante para nosotros. Nuestra Política de Privacidad explica cómo recopilamos, usamos y
            protegemos su información personal cuando utiliza nuestros Servicios. Al utilizar nuestros Servicios, usted
            acepta la recopilación y uso de información de acuerdo con nuestra Política de Privacidad.
          </p>

          <h2>7. Limitación de Responsabilidad</h2>
          <p>
            En la medida permitida por la ley, el Grupo Scout Osyris no será responsable por cualquier daño indirecto,
            incidental, especial, consecuente o punitivo, o cualquier pérdida de beneficios o ingresos, ya sea incurrida
            directa o indirectamente, o cualquier pérdida de datos, uso, buena voluntad, u otras pérdidas intangibles,
            resultantes de:
          </p>
          <ul>
            <li>Su acceso o uso o incapacidad para acceder o usar los Servicios.</li>
            <li>Cualquier conducta o contenido de terceros en los Servicios.</li>
            <li>Acceso no autorizado, uso o alteración de su contenido o transmisiones.</li>
          </ul>

          <h2>8. Modificaciones</h2>
          <p>
            Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier
            momento. Si una revisión es material, proporcionaremos al menos 30 días de aviso antes de que los nuevos
            términos entren en vigor. Lo que constituye un cambio material será determinado a nuestra sola discreción.
          </p>

          <h2>9. Terminación</h2>
          <p>
            Podemos terminar o suspender su acceso a nuestros Servicios inmediatamente, sin previo aviso o
            responsabilidad, por cualquier razón, incluyendo, sin limitación, si usted incumple estos Términos.
          </p>

          <h2>10. Ley Aplicable</h2>
          <p>
            Estos Términos se regirán e interpretarán de acuerdo con las leyes de España, sin tener en cuenta sus
            disposiciones sobre conflictos de leyes.
          </p>

          <h2>11. Contacto</h2>
          <p>Si tiene alguna pregunta sobre estos Términos, por favor contáctenos en info@grupoosyris.es.</p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

