import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"

export default function PrivacidadPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>

      <main className="flex-1 container py-12">
        <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

        <div className="prose max-w-none">
          <p>Última actualización: 21 de marzo de 2025</p>

          <h2>1. Introducción</h2>
          <p>
            El Grupo Scout Osyris ("nosotros", "nos", "nuestro") se compromete a proteger su privacidad. Esta Política
            de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza
            nuestro sitio web y servicios relacionados (colectivamente, los "Servicios").
          </p>
          <p>
            Al utilizar nuestros Servicios, usted acepta las prácticas descritas en esta Política de Privacidad. Si no
            está de acuerdo con esta Política de Privacidad, por favor no utilice nuestros Servicios.
          </p>

          <h2>2. Información que Recopilamos</h2>
          <h3>2.1 Información Personal</h3>
          <p>Podemos recopilar la siguiente información personal:</p>
          <ul>
            <li>
              <strong>Información de identificación:</strong> nombre, dirección de correo electrónico, número de
              teléfono, dirección postal, fecha de nacimiento.
            </li>
            <li>
              <strong>Información de cuenta:</strong> nombre de usuario, contraseña, preferencias de cuenta.
            </li>
            <li>
              <strong>Información de pago:</strong> detalles de tarjeta de crédito, información bancaria (para pagos de
              cuotas, campamentos, etc.).
            </li>
            <li>
              <strong>Información médica:</strong> alergias, condiciones médicas, medicamentos (para garantizar la
              seguridad durante las actividades).
            </li>
            <li>
              <strong>Imágenes y videos:</strong> fotografías y grabaciones de actividades y eventos.
            </li>
          </ul>

          <h3>2.2 Información Automática</h3>
          <p>También recopilamos automáticamente cierta información cuando utiliza nuestros Servicios, incluyendo:</p>
          <ul>
            <li>
              <strong>Información del dispositivo:</strong> tipo de dispositivo, sistema operativo, tipo de navegador.
            </li>
            <li>
              <strong>Información de uso:</strong> páginas visitadas, tiempo de permanencia en el sitio, clics,
              acciones.
            </li>
            <li>
              <strong>Información de ubicación:</strong> ubicación geográfica general basada en su dirección IP.
            </li>
            <li>
              <strong>Cookies y tecnologías similares:</strong> utilizamos cookies y tecnologías similares para
              recopilar información sobre su actividad, navegador y dispositivo.
            </li>
          </ul>

          <h2>3. Cómo Utilizamos su Información</h2>
          <p>Utilizamos la información que recopilamos para:</p>
          <ul>
            <li>Proporcionar, mantener y mejorar nuestros Servicios.</li>
            <li>Procesar inscripciones, pagos y gestionar su cuenta.</li>
            <li>Comunicarnos con usted, incluyendo enviar notificaciones, actualizaciones y alertas de seguridad.</li>
            <li>Organizar y gestionar actividades, eventos y campamentos.</li>
            <li>Garantizar la seguridad y bienestar de los participantes durante las actividades.</li>
            <li>Cumplir con obligaciones legales y reglamentarias.</li>
            <li>
              Detectar, investigar y prevenir actividades fraudulentas y accesos no autorizados a nuestros Servicios.
            </li>
            <li>Analizar y mejorar la eficacia de nuestros Servicios.</li>
          </ul>

          <h2>4. Compartición de Información</h2>
          <p>Podemos compartir su información personal en las siguientes circunstancias:</p>
          <ul>
            <li>
              <strong>Con su consentimiento:</strong> cuando nos ha dado su consentimiento para compartir su
              información.
            </li>
            <li>
              <strong>Con proveedores de servicios:</strong> compartimos información con proveedores de servicios que
              nos ayudan a operar, proporcionar, mejorar, integrar, personalizar y apoyar nuestros Servicios.
            </li>
            <li>
              <strong>Con organizaciones scout:</strong> podemos compartir información con la federación scout a la que
              pertenecemos para fines administrativos y de seguro.
            </li>
            <li>
              <strong>Por razones legales:</strong> podemos compartir información si creemos que es necesario para
              cumplir con una obligación legal, proteger la seguridad de cualquier persona, abordar fraude o seguridad,
              o proteger nuestros derechos legales.
            </li>
          </ul>

          <h2>5. Seguridad de la Información</h2>
          <p>
            Implementamos medidas de seguridad diseñadas para proteger su información personal contra acceso,
            divulgación, alteración y destrucción no autorizados. Sin embargo, ningún método de transmisión por Internet
            o método de almacenamiento electrónico es 100% seguro, por lo que no podemos garantizar su seguridad
            absoluta.
          </p>

          <h2>6. Derechos de Protección de Datos</h2>
          <p>
            Dependiendo de su ubicación, puede tener ciertos derechos con respecto a su información personal,
            incluyendo:
          </p>
          <ul>
            <li>Derecho a acceder a su información personal.</li>
            <li>Derecho a rectificar información inexacta o incompleta.</li>
            <li>Derecho a borrar su información personal.</li>
            <li>Derecho a restringir el procesamiento de su información personal.</li>
            <li>Derecho a la portabilidad de datos.</li>
            <li>Derecho a oponerse al procesamiento de su información personal.</li>
            <li>Derecho a retirar el consentimiento en cualquier momento.</li>
          </ul>
          <p>
            Para ejercer estos derechos, por favor contáctenos utilizando la información proporcionada en la sección
            "Contacto" a continuación.
          </p>

          <h2>7. Retención de Datos</h2>
          <p>
            Retendremos su información personal solo durante el tiempo que sea necesario para los fines establecidos en
            esta Política de Privacidad, a menos que se requiera o permita un período de retención más largo por ley.
          </p>

          <h2>8. Menores</h2>
          <p>
            Nuestros Servicios están destinados a ser utilizados por personas de todas las edades, incluidos menores.
            Recopilamos información de menores solo con el consentimiento verificable de un padre o tutor legal. Si
            descubrimos que hemos recopilado información personal de un menor sin el consentimiento parental
            verificable, tomaremos medidas para eliminar esa información de nuestros servidores.
          </p>

          <h2>9. Cambios a esta Política de Privacidad</h2>
          <p>
            Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio
            publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "última actualización"
            en la parte superior. Se le aconseja revisar esta Política de Privacidad periódicamente para cualquier
            cambio.
          </p>

          <h2>10. Contacto</h2>
          <p>Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos en:</p>
          <p>
            Grupo Scout Osyris
            <br />
            Calle Poeta Ricard Sanmartí nº3
            <br />
            Barrio de Benimaclet, Valencia
            <br />
            Email: info@grupoosyris.es
            <br />
            Teléfono: +34 600 123 456
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

