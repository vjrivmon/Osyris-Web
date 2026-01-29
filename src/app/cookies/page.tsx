import { LegalPageTemplate, LegalList, LegalHighlight } from "@/components/legal"
import {
  Cookie,
  Info,
  Layers,
  Table,
  Globe,
  Settings,
  Mail,
} from "lucide-react"

import { SITE_URL } from "@/lib/seo-constants"

export const metadata = {
  title: "Política de Cookies",
  description:
    "Política de cookies del Grupo Scout Osyris. Conoce qué cookies utilizamos y cómo gestionarlas.",
  alternates: {
    canonical: `${SITE_URL}/cookies`,
  },
}

// Tabla de cookies
function CookieTable() {
  const cookies = [
    {
      name: "osyris-cookie-consent",
      type: "Necesaria",
      duration: "1 año",
      purpose: "Almacena tus preferencias de cookies para recordar tu elección.",
    },
    {
      name: "theme",
      type: "Necesaria",
      duration: "1 año",
      purpose: "Guarda tu preferencia de tema (claro/oscuro) para la interfaz.",
    },
    {
      name: "sidebar:state",
      type: "Necesaria",
      duration: "7 días",
      purpose: "Recuerda el estado del menú lateral (abierto/cerrado).",
    },
    {
      name: "_ga",
      type: "Analítica",
      duration: "2 años",
      purpose: "Google Analytics: Distingue usuarios únicos asignando un ID.",
    },
    {
      name: "_gid",
      type: "Analítica",
      duration: "24 horas",
      purpose: "Google Analytics: Almacena y actualiza un valor único por página visitada.",
    },
    {
      name: "_gat",
      type: "Analítica",
      duration: "1 minuto",
      purpose: "Google Analytics: Limita la tasa de solicitudes al servidor.",
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Cookie</th>
            <th className="text-left p-3 font-medium">Tipo</th>
            <th className="text-left p-3 font-medium">Duración</th>
            <th className="text-left p-3 font-medium">Propósito</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie) => (
            <tr key={cookie.name} className="border-b">
              <td className="p-3 font-mono text-xs">{cookie.name}</td>
              <td className="p-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    cookie.type === "Necesaria"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {cookie.type}
                </span>
              </td>
              <td className="p-3 text-muted-foreground">{cookie.duration}</td>
              <td className="p-3">{cookie.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const sections = [
  {
    id: "que-son",
    title: "1. Qué son las Cookies",
    icon: <Cookie className="h-5 w-5" />,
    content: (
      <>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo
          (ordenador, tablet o móvil) cuando visitas un sitio web. Se utilizan
          ampliamente para hacer que los sitios web funcionen de manera más eficiente,
          así como para proporcionar información a los propietarios del sitio.
        </p>
        <LegalHighlight>
          <p>
            Las cookies no pueden dañar tu dispositivo ni acceder a otros archivos
            almacenados en el mismo. Son simplemente datos de texto que los sitios web
            utilizan para recordar información sobre tu visita.
          </p>
        </LegalHighlight>
      </>
    ),
  },
  {
    id: "tipos",
    title: "2. Tipos de Cookies",
    icon: <Layers className="h-5 w-5" />,
    content: (
      <>
        <h3 className="text-lg font-medium mt-4 mb-2">Según su finalidad:</h3>
        <LegalList>
          <li>
            <strong>Cookies necesarias:</strong> Esenciales para el funcionamiento básico
            del sitio web. Sin estas cookies, el sitio no funcionaría correctamente.
          </li>
          <li>
            <strong>Cookies analíticas:</strong> Nos ayudan a entender cómo los
            visitantes interactúan con el sitio web, recopilando información de forma
            anónima.
          </li>
          <li>
            <strong>Cookies de marketing:</strong> Se utilizan para rastrear visitantes
            y mostrar anuncios relevantes. Actualmente no las utilizamos.
          </li>
        </LegalList>

        <h3 className="text-lg font-medium mt-6 mb-2">Según su duración:</h3>
        <LegalList>
          <li>
            <strong>Cookies de sesión:</strong> Se eliminan cuando cierras el navegador.
          </li>
          <li>
            <strong>Cookies persistentes:</strong> Permanecen en tu dispositivo durante
            un período determinado o hasta que las eliminas manualmente.
          </li>
        </LegalList>

        <h3 className="text-lg font-medium mt-6 mb-2">Según su origen:</h3>
        <LegalList>
          <li>
            <strong>Cookies propias:</strong> Establecidas por este sitio web.
          </li>
          <li>
            <strong>Cookies de terceros:</strong> Establecidas por otros dominios, como
            Google Analytics.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: "cookies-utilizadas",
    title: "3. Cookies que Utilizamos",
    icon: <Table className="h-5 w-5" />,
    content: (
      <>
        <p className="mb-4">
          A continuación se detallan las cookies que utilizamos en nuestro sitio web:
        </p>
        <CookieTable />
      </>
    ),
  },
  {
    id: "terceros",
    title: "4. Cookies de Terceros",
    icon: <Globe className="h-5 w-5" />,
    content: (
      <>
        <p>
          Utilizamos servicios de terceros que pueden establecer sus propias cookies en
          tu dispositivo:
        </p>

        <h3 className="text-lg font-medium mt-4 mb-2">Google Analytics</h3>
        <p>
          Utilizamos Google Analytics para analizar el uso de nuestro sitio web. Google
          Analytics genera información estadística sobre las visitas al sitio mediante
          cookies. La información generada se utiliza para crear informes sobre el uso
          del sitio.
        </p>
        <p className="mt-2">
          Google almacena la información recopilada por las cookies en servidores en
          Estados Unidos. Google puede transferir esta información a terceros cuando así
          lo exija la ley, o cuando dichos terceros procesen la información por cuenta de
          Google.
        </p>
        <p className="mt-2">
          Puedes consultar la política de privacidad de Google en:{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://policies.google.com/privacy
          </a>
        </p>

        <LegalHighlight>
          <p>
            <strong>Nota:</strong> Hemos configurado Google Analytics para que anonimice
            tu dirección IP antes de almacenarla, lo que significa que no se almacenan
            datos personales identificables.
          </p>
        </LegalHighlight>
      </>
    ),
  },
  {
    id: "gestionar",
    title: "5. Cómo Gestionar las Cookies",
    icon: <Settings className="h-5 w-5" />,
    content: (
      <>
        <h3 className="text-lg font-medium mt-4 mb-2">Desde nuestro sitio web</h3>
        <p>
          Puedes configurar tus preferencias de cookies en cualquier momento utilizando
          nuestro panel de configuración de cookies. Haz clic en &ldquo;Configurar Cookies&rdquo; en
          el pie de página para acceder a las opciones.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-2">Desde tu navegador</h3>
        <p>
          La mayoría de los navegadores te permiten gestionar las cookies. Puedes
          configurar tu navegador para:
        </p>
        <LegalList>
          <li>Rechazar todas las cookies</li>
          <li>Aceptar solo cookies de sitios que visitas</li>
          <li>Eliminar cookies al cerrar el navegador</li>
          <li>Recibir una alerta antes de que se almacene una cookie</li>
        </LegalList>

        <h3 className="text-lg font-medium mt-6 mb-2">
          Enlaces a configuración de navegadores
        </h3>
        <LegalList>
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Microsoft Edge
            </a>
          </li>
        </LegalList>

        <LegalHighlight>
          <p>
            <strong>Importante:</strong> Si desactivas las cookies necesarias, algunas
            funciones del sitio web pueden no funcionar correctamente.
          </p>
        </LegalHighlight>
      </>
    ),
  },
  {
    id: "contacto",
    title: "6. Contacto",
    icon: <Mail className="h-5 w-5" />,
    content: (
      <>
        <p>
          Si tienes alguna pregunta sobre nuestra Política de Cookies, contáctanos en:
        </p>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="font-semibold">Grupo Scout Osyris</p>
          <p>Calle Poeta Ricard Sanmarti n3</p>
          <p>Barrio de Benimaclet, Valencia</p>
          <p className="mt-2">
            <strong>Email:</strong>{" "}
            <a
              href="mailto:web.osyris@gmail.com"
              className="text-primary hover:underline"
            >
              web.osyris@gmail.com
            </a>
          </p>
          <p>
            <strong>Teléfono:</strong> +34 601 037 577
          </p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          También puedes consultar nuestra{" "}
          <a href="/privacidad" className="text-primary hover:underline">
            Política de Privacidad
          </a>{" "}
          y nuestros{" "}
          <a href="/terminos" className="text-primary hover:underline">
            Términos de Servicio
          </a>{" "}
          para más información.
        </p>
      </>
    ),
  },
]

import { JsonLd } from "@/components/seo/json-ld"
import { buildBreadcrumbs } from "@/lib/seo-constants"

export default function CookiesPage() {
  return (
    <>
    <JsonLd data={buildBreadcrumbs([{ name: 'Cookies', path: '/cookies' }])} />
    <LegalPageTemplate
      title="Política de Cookies"
      description="Información sobre las cookies que utilizamos y cómo gestionarlas."
      lastUpdated="25 de enero de 2026"
      version="1.0"
      sections={sections}
    />
    </>
  )
}
