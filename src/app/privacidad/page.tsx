import { LegalPageTemplate, LegalList, LegalHighlight } from "@/components/legal"
import {
  FileText,
  Database,
  Shield,
  Share2,
  Lock,
  Scale,
  Clock,
  Users,
  RefreshCw,
  Mail,
} from "lucide-react"

import { SITE_URL } from "@/lib/seo-constants"

export const metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad del Grupo Scout Osyris. Conoce cómo protegemos y utilizamos tu información personal.",
  alternates: {
    canonical: `${SITE_URL}/privacidad`,
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
          El Grupo Scout Osyris (&ldquo;nosotros&rdquo;, &ldquo;nos&rdquo;, &ldquo;nuestro&rdquo;) se compromete a
          proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos,
          usamos, divulgamos y protegemos tu información cuando utilizas nuestro sitio
          web y servicios relacionados (colectivamente, los &ldquo;Servicios&rdquo;).
        </p>
        <LegalHighlight>
          <p className="font-medium">
            Al utilizar nuestros Servicios, aceptas las prácticas descritas en esta
            Política de Privacidad. Si no estás de acuerdo, por favor no utilices
            nuestros Servicios.
          </p>
        </LegalHighlight>
      </>
    ),
  },
  {
    id: "informacion",
    title: "2. Información que Recopilamos",
    icon: <Database className="h-5 w-5" />,
    content: (
      <>
        <h3 className="text-lg font-medium mt-4 mb-2">2.1 Información Personal</h3>
        <p>Podemos recopilar la siguiente información personal:</p>
        <LegalList>
          <li>
            <strong>Información de identificación:</strong> nombre, dirección de correo
            electrónico, número de teléfono, dirección postal, fecha de nacimiento.
          </li>
          <li>
            <strong>Información de cuenta:</strong> nombre de usuario, contraseña,
            preferencias de cuenta.
          </li>
          <li>
            <strong>Información de pago:</strong> detalles de tarjeta de crédito,
            información bancaria (para pagos de cuotas, campamentos, etc.).
          </li>
          <li>
            <strong>Información médica:</strong> alergias, condiciones médicas,
            medicamentos (para garantizar la seguridad durante las actividades).
          </li>
          <li>
            <strong>Imágenes y videos:</strong> fotografías y grabaciones de actividades
            y eventos.
          </li>
        </LegalList>

        <h3 className="text-lg font-medium mt-6 mb-2">2.2 Información Automática</h3>
        <p>
          También recopilamos automáticamente cierta información cuando utilizas
          nuestros Servicios:
        </p>
        <LegalList>
          <li>
            <strong>Información del dispositivo:</strong> tipo de dispositivo, sistema
            operativo, tipo de navegador.
          </li>
          <li>
            <strong>Información de uso:</strong> páginas visitadas, tiempo de
            permanencia, clics, acciones.
          </li>
          <li>
            <strong>Información de ubicación:</strong> ubicación geográfica general
            basada en tu dirección IP.
          </li>
          <li>
            <strong>Cookies:</strong> utilizamos cookies y tecnologías similares. Consulta
            nuestra{" "}
            <a href="/cookies" className="text-primary hover:underline">
              Política de Cookies
            </a>{" "}
            para más detalles.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: "uso",
    title: "3. Cómo Utilizamos tu Información",
    icon: <Shield className="h-5 w-5" />,
    content: (
      <>
        <p>Utilizamos la información que recopilamos para:</p>
        <LegalList>
          <li>Proporcionar, mantener y mejorar nuestros Servicios.</li>
          <li>Procesar inscripciones, pagos y gestionar tu cuenta.</li>
          <li>
            Comunicarnos contigo, incluyendo enviar notificaciones, actualizaciones y
            alertas de seguridad.
          </li>
          <li>Organizar y gestionar actividades, eventos y campamentos.</li>
          <li>
            Garantizar la seguridad y bienestar de los participantes durante las
            actividades.
          </li>
          <li>Cumplir con obligaciones legales y reglamentarias.</li>
          <li>
            Detectar, investigar y prevenir actividades fraudulentas y accesos no
            autorizados.
          </li>
          <li>Analizar y mejorar la eficacia de nuestros Servicios.</li>
        </LegalList>
      </>
    ),
  },
  {
    id: "comparticion",
    title: "4. Compartición de Información",
    icon: <Share2 className="h-5 w-5" />,
    content: (
      <>
        <p>Podemos compartir tu información personal en las siguientes circunstancias:</p>
        <LegalList>
          <li>
            <strong>Con tu consentimiento:</strong> cuando nos has dado permiso para
            compartir tu información.
          </li>
          <li>
            <strong>Con proveedores de servicios:</strong> compartimos información con
            proveedores que nos ayudan a operar y mejorar nuestros Servicios.
          </li>
          <li>
            <strong>Con organizaciones scout:</strong> podemos compartir información con
            la federación scout (MSC-ASDE) para fines administrativos y de seguro.
          </li>
          <li>
            <strong>Por razones legales:</strong> podemos compartir información si es
            necesario para cumplir con una obligación legal, proteger la seguridad de
            cualquier persona, o proteger nuestros derechos legales.
          </li>
        </LegalList>
      </>
    ),
  },
  {
    id: "seguridad",
    title: "5. Seguridad de la Información",
    icon: <Lock className="h-5 w-5" />,
    content: (
      <>
        <p>
          Implementamos medidas de seguridad diseñadas para proteger tu información
          personal contra acceso, divulgación, alteración y destrucción no autorizados.
        </p>
        <LegalHighlight>
          <p>
            Sin embargo, ningún método de transmisión por Internet o método de
            almacenamiento electrónico es 100% seguro, por lo que no podemos garantizar
            su seguridad absoluta.
          </p>
        </LegalHighlight>
        <p className="mt-4">Nuestras medidas de seguridad incluyen:</p>
        <LegalList>
          <li>Cifrado de datos en tránsito y en reposo</li>
          <li>Acceso restringido a datos personales</li>
          <li>Copias de seguridad regulares</li>
          <li>Monitoreo continuo de seguridad</li>
        </LegalList>
      </>
    ),
  },
  {
    id: "derechos",
    title: "6. Tus Derechos",
    icon: <Scale className="h-5 w-5" />,
    content: (
      <>
        <p>
          De acuerdo con el Reglamento General de Protección de Datos (RGPD), tienes los
          siguientes derechos:
        </p>
        <LegalList>
          <li>
            <strong>Derecho de acceso:</strong> solicitar una copia de tus datos
            personales.
          </li>
          <li>
            <strong>Derecho de rectificación:</strong> corregir datos inexactos o
            incompletos.
          </li>
          <li>
            <strong>Derecho de supresión:</strong> solicitar la eliminación de tus datos
            personales.
          </li>
          <li>
            <strong>Derecho de limitación:</strong> restringir el procesamiento de tus
            datos.
          </li>
          <li>
            <strong>Derecho de portabilidad:</strong> recibir tus datos en formato
            estructurado.
          </li>
          <li>
            <strong>Derecho de oposición:</strong> oponerte al procesamiento de tus datos.
          </li>
          <li>
            <strong>Derecho a retirar el consentimiento:</strong> en cualquier momento,
            sin afectar la licitud del tratamiento previo.
          </li>
        </LegalList>
        <p className="mt-4">
          Para ejercer estos derechos, contáctanos utilizando la información en la
          sección &ldquo;Contacto&rdquo;.
        </p>
      </>
    ),
  },
  {
    id: "retencion",
    title: "7. Retención de Datos",
    icon: <Clock className="h-5 w-5" />,
    content: (
      <p>
        Retendremos tu información personal solo durante el tiempo necesario para los
        fines establecidos en esta Política de Privacidad, a menos que se requiera un
        período de retención más largo por ley. Los datos de miembros activos se
        conservan durante su pertenencia al grupo y hasta 5 años después de su baja para
        fines históricos y legales.
      </p>
    ),
  },
  {
    id: "menores",
    title: "8. Menores",
    icon: <Users className="h-5 w-5" />,
    content: (
      <>
        <p>
          Nuestros Servicios están destinados a ser utilizados por personas de todas las
          edades, incluidos menores. Como grupo scout, trabajamos principalmente con
          jóvenes de 5 a 19 años.
        </p>
        <LegalHighlight>
          <p>
            <strong>Importante:</strong> Recopilamos información de menores solo con el
            consentimiento verificable de un padre, madre o tutor legal. Si descubrimos
            que hemos recopilado información personal de un menor sin el consentimiento
            parental adecuado, tomaremos medidas para eliminar esa información.
          </p>
        </LegalHighlight>
      </>
    ),
  },
  {
    id: "cambios",
    title: "9. Cambios a esta Política",
    icon: <RefreshCw className="h-5 w-5" />,
    content: (
      <p>
        Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos
        cualquier cambio publicando la nueva Política en esta página y actualizando la
        fecha de &ldquo;última actualización&rdquo;. Te recomendamos revisar esta Política
        periódicamente.
      </p>
    ),
  },
  {
    id: "contacto",
    title: "10. Contacto",
    icon: <Mail className="h-5 w-5" />,
    content: (
      <>
        <p>
          Si tienes alguna pregunta sobre esta Política de Privacidad o deseas ejercer
          tus derechos, contáctanos en:
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
        <p className="mt-4 text-sm text-muted-foreground">
          También puedes presentar una reclamación ante la Agencia Española de Protección
          de Datos (AEPD) si consideras que tus derechos han sido vulnerados.
        </p>
      </>
    ),
  },
]

import { JsonLd } from "@/components/seo/json-ld"
import { buildBreadcrumbs } from "@/lib/seo-constants"

export default function PrivacidadPage() {
  return (
    <>
    <JsonLd data={buildBreadcrumbs([{ name: 'Privacidad', path: '/privacidad' }])} />
    <LegalPageTemplate
      title="Política de Privacidad"
      description="Conoce cómo el Grupo Scout Osyris protege y utiliza tu información personal."
      lastUpdated="25 de enero de 2026"
      version="2.0"
      sections={sections}
    />
    </>
  )
}
