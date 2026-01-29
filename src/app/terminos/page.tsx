import { LegalPageTemplate, LegalList, LegalHighlight } from "@/components/legal"
import {
  FileText,
  BookOpen,
  Users,
  PenTool,
  Copyright,
  Shield,
  AlertTriangle,
  RefreshCw,
  XCircle,
  Scale,
  Mail,
} from "lucide-react"

import { SITE_URL } from "@/lib/seo-constants"

export const metadata = {
  title: "Términos de Servicio",
  description:
    "Términos de servicio del Grupo Scout Osyris. Conoce las condiciones de uso de nuestra plataforma.",
  alternates: {
    canonical: `${SITE_URL}/terminos`,
  },
}

const sections = [
  {
    id: "introduccion",
    title: "1. Introducción",
    icon: <FileText className="h-5 w-5" />,
    content: (
      <>
        <p>
          Bienvenido a la plataforma web del Grupo Scout Osyris. Estos Términos de
          Servicio (&ldquo;Términos&rdquo;) rigen tu acceso y uso de nuestro sitio web, servicios,
          aplicaciones y herramientas (colectivamente, los &ldquo;Servicios&rdquo;).
        </p>
        <LegalHighlight>
          <p className="font-medium">
            Al acceder o utilizar nuestros Servicios, aceptas estar sujeto a estos
            Términos. Si no estás de acuerdo, no debes acceder ni utilizar nuestros
            Servicios.
          </p>
        </LegalHighlight>
      </>
    ),
  },
  {
    id: "definiciones",
    title: "2. Definiciones",
    icon: <BookOpen className="h-5 w-5" />,
    content: (
      <LegalList>
        <li>
          <strong>&ldquo;Nosotros&rdquo;, &ldquo;nos&rdquo;, &ldquo;nuestro&rdquo;</strong> se refiere al Grupo Scout
          Osyris.
        </li>
        <li>
          <strong>&ldquo;Tú&rdquo;, &ldquo;usted&rdquo;</strong> se refiere a la persona que accede o utiliza los
          Servicios.
        </li>
        <li>
          <strong>&ldquo;Contenido&rdquo;</strong> se refiere a cualquier información, texto, gráficos,
          fotos, videos u otros materiales que se cargan, descargan o aparecen en
          nuestros Servicios.
        </li>
        <li>
          <strong>&ldquo;Usuario&rdquo;</strong> se refiere a cualquier persona que accede a nuestros
          Servicios, ya sea como visitante o usuario registrado.
        </li>
      </LegalList>
    ),
  },
  {
    id: "uso",
    title: "3. Uso de los Servicios",
    icon: <Users className="h-5 w-5" />,
    content: (
      <>
        <p>
          Nuestros Servicios están destinados a ser utilizados por miembros del Grupo
          Scout Osyris, incluyendo monitores, educandos, familias y comité.
        </p>
        <h3 className="text-lg font-medium mt-4 mb-2">Requisitos de edad</h3>
        <LegalList>
          <li>
            Debes tener al menos 18 años para crear una cuenta en nuestros Servicios.
          </li>
          <li>
            Los menores de edad pueden usar los Servicios con el consentimiento de un
            padre, madre o tutor legal.
          </li>
        </LegalList>
        <h3 className="text-lg font-medium mt-4 mb-2">Responsabilidad de la cuenta</h3>
        <p>
          Eres responsable de mantener la confidencialidad de tu contraseña y cuenta, y
          eres completamente responsable de todas las actividades que ocurran bajo tu
          cuenta.
        </p>
      </>
    ),
  },
  {
    id: "contenido",
    title: "4. Contenido y Conducta",
    icon: <PenTool className="h-5 w-5" />,
    content: (
      <>
        <p>
          Eres responsable de todo el Contenido que publiques, cargues o pongas a
          disposición a través de nuestros Servicios. <strong>No debes publicar Contenido que:</strong>
        </p>
        <LegalList>
          <li>
            Sea ilegal, difamatorio, obsceno, pornográfico, invasivo de la privacidad de
            otros, o abusivo.
          </li>
          <li>Infrinja los derechos de propiedad intelectual de terceros.</li>
          <li>
            Contenga virus, troyanos, gusanos, bombas de tiempo, o cualquier otro código
            diseñado para dañar sistemas informáticos.
          </li>
          <li>
            Promueva actividades ilegales o conductas que violen los valores del
            escultismo.
          </li>
          <li>
            Suplante la identidad de otra persona o entidad.
          </li>
        </LegalList>
        <LegalHighlight>
          <p>
            Nos reservamos el derecho de eliminar cualquier Contenido que viole estos
            Términos y de suspender o cancelar cuentas de usuarios infractores.
          </p>
        </LegalHighlight>
      </>
    ),
  },
  {
    id: "propiedad",
    title: "5. Propiedad Intelectual",
    icon: <Copyright className="h-5 w-5" />,
    content: (
      <>
        <p>
          El Contenido proporcionado por nosotros, incluyendo pero no limitado a textos,
          gráficos, logotipos, iconos, imágenes, clips de audio, descargas digitales y
          compilaciones de datos, es propiedad del Grupo Scout Osyris o de sus
          proveedores de contenido y está protegido por las leyes de propiedad
          intelectual.
        </p>
        <h3 className="text-lg font-medium mt-4 mb-2">Restricciones de uso</h3>
        <p>No puedes:</p>
        <LegalList>
          <li>
            Utilizar, reproducir, modificar, distribuir o almacenar ningún Contenido para
            cualquier otro propósito que no sea el uso permitido de los Servicios.
          </li>
          <li>
            Usar el nombre, logo o marcas del Grupo Scout Osyris sin autorización
            expresa por escrito.
          </li>
          <li>
            Realizar ingeniería inversa, descompilar o desensamblar cualquier parte de
            los Servicios.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: "privacidad",
    title: "6. Privacidad",
    icon: <Shield className="h-5 w-5" />,
    content: (
      <p>
        Tu privacidad es importante para nosotros. Nuestra{" "}
        <a href="/privacidad" className="text-primary hover:underline">
          Política de Privacidad
        </a>{" "}
        explica cómo recopilamos, usamos y protegemos tu información personal cuando
        utilizas nuestros Servicios. Al utilizar nuestros Servicios, aceptas la
        recopilación y uso de información de acuerdo con nuestra Política de Privacidad.
        También puedes consultar nuestra{" "}
        <a href="/cookies" className="text-primary hover:underline">
          Política de Cookies
        </a>{" "}
        para más información sobre el uso de cookies.
      </p>
    ),
  },
  {
    id: "limitacion",
    title: "7. Limitación de Responsabilidad",
    icon: <AlertTriangle className="h-5 w-5" />,
    content: (
      <>
        <p>
          En la medida permitida por la ley, el Grupo Scout Osyris no será responsable
          por cualquier daño indirecto, incidental, especial, consecuente o punitivo
          resultante de:
        </p>
        <LegalList>
          <li>
            Tu acceso o uso o incapacidad para acceder o usar los Servicios.
          </li>
          <li>Cualquier conducta o contenido de terceros en los Servicios.</li>
          <li>
            Acceso no autorizado, uso o alteración de tu contenido o transmisiones.
          </li>
          <li>
            Interrupciones, errores o defectos en los Servicios.
          </li>
        </LegalList>
        <LegalHighlight>
          <p>
            Los Servicios se proporcionan &ldquo;tal cual&rdquo; y &ldquo;según disponibilidad&rdquo;, sin
            garantías de ningún tipo, ya sean expresas o implícitas.
          </p>
        </LegalHighlight>
      </>
    ),
  },
  {
    id: "modificaciones",
    title: "8. Modificaciones",
    icon: <RefreshCw className="h-5 w-5" />,
    content: (
      <p>
        Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar
        estos Términos en cualquier momento. Si una revisión es material,
        proporcionaremos al menos 30 días de aviso antes de que los nuevos términos
        entren en vigor. Lo que constituye un cambio material será determinado a nuestra
        sola discreción. El uso continuado de los Servicios después de cualquier cambio
        constituye la aceptación de los nuevos Términos.
      </p>
    ),
  },
  {
    id: "terminacion",
    title: "9. Terminación",
    icon: <XCircle className="h-5 w-5" />,
    content: (
      <>
        <p>
          Podemos terminar o suspender tu acceso a nuestros Servicios inmediatamente,
          sin previo aviso o responsabilidad, por cualquier razón, incluyendo:
        </p>
        <LegalList>
          <li>Si incumples estos Términos.</li>
          <li>Si violas los derechos de otros usuarios.</li>
          <li>Si realizas actividades que dañen la reputación del grupo.</li>
          <li>Por decisión administrativa del Grupo Scout Osyris.</li>
        </LegalList>
        <p className="mt-4">
          Tras la terminación, tu derecho a usar los Servicios cesará inmediatamente.
        </p>
      </>
    ),
  },
  {
    id: "ley",
    title: "10. Ley Aplicable",
    icon: <Scale className="h-5 w-5" />,
    content: (
      <>
        <p>
          Estos Términos se regirán e interpretarán de acuerdo con las leyes de España,
          sin tener en cuenta sus disposiciones sobre conflictos de leyes.
        </p>
        <p className="mt-4">
          Cualquier disputa que surja en relación con estos Términos será sometida a la
          jurisdicción exclusiva de los tribunales de Valencia, España.
        </p>
      </>
    ),
  },
  {
    id: "contacto",
    title: "11. Contacto",
    icon: <Mail className="h-5 w-5" />,
    content: (
      <>
        <p>
          Si tienes alguna pregunta sobre estos Términos de Servicio, contáctanos en:
        </p>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="font-semibold">Grupo Scout Osyris</p>
          <p>Calle Poeta Ricard Sanmarti n3</p>
          <p>Barrio de Benimaclet, Valencia</p>
          <p className="mt-2">
            <strong>Email:</strong>{" "}
            <a href="mailto:web.osyris@gmail.com" className="text-primary hover:underline">
              web.osyris@gmail.com
            </a>
          </p>
          <p>
            <strong>Teléfono:</strong> +34 601 037 577
          </p>
        </div>
      </>
    ),
  },
]

import { JsonLd } from "@/components/seo/json-ld"
import { buildBreadcrumbs } from "@/lib/seo-constants"

export default function TerminosPage() {
  return (
    <>
    <JsonLd data={buildBreadcrumbs([{ name: 'Términos de Servicio', path: '/terminos' }])} />
    <LegalPageTemplate
      title="Términos de Servicio"
      description="Condiciones de uso de la plataforma web del Grupo Scout Osyris."
      lastUpdated="25 de enero de 2026"
      version="2.0"
      sections={sections}
    />
    </>
  )
}
