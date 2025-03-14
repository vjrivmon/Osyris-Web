# Grupo Scout Osyris - Plataforma Web

## Descripción del Proyecto

Esta plataforma web sirve como sitio oficial del Grupo Scout Osyris, proporcionando información sobre las actividades, secciones y eventos del grupo. La aplicación está diseñada para servir tanto a miembros actuales como a posibles nuevos integrantes, ofreciendo información relevante sobre el escultismo y las actividades del grupo.

## Tecnologías Utilizadas

- **Frontend**: Next.js 15 (App Router), React 19
- **Estilizado**: Tailwind CSS, Radix UI components
- **Temas**: Sistema de temas claro/oscuro con next-themes
- **Iconos**: Lucide React
- **Formularios**: React Hook Form con validación Zod
- **Calendario**: React Big Calendar
- **Utilidades**: date-fns, moment.js

## Estructura del Proyecto

```
osyris_web/
├── app/                    # Estructura de rutas basada en App Router
│   ├── calendario/         # Página del calendario de actividades
│   ├── dashboard/          # Panel de control para usuarios autenticados
│   ├── login/              # Página de inicio de sesión
│   ├── sobre-nosotros/     # Información sobre el grupo scout
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página de inicio
├── components/             # Componentes reutilizables
│   ├── auth/               # Componentes relacionados con la autenticación
│   ├── dashboard/          # Componentes del panel de control
│   ├── ui/                 # Componentes UI genéricos
│   ├── event-card.tsx      # Tarjeta de eventos
│   ├── footer.tsx          # Pie de página
│   ├── header.tsx          # Encabezado
│   ├── icons.tsx           # Iconos personalizados
│   ├── mode-toggle.tsx     # Selector de tema claro/oscuro
│   └── theme-provider.tsx  # Proveedor de temas
├── hooks/                  # Hooks personalizados
├── lib/                    # Utilidades y funciones auxiliares
├── public/                 # Archivos estáticos
├── styles/                 # Estilos adicionales
└── ...
```

## Características Principales

- **Diseño Responsivo**: Adaptado para móviles, tablets y escritorio
- **Modo Oscuro**: Soporte para tema claro y oscuro
- **Calendario de Actividades**: Visualización de eventos y actividades
- **Autenticación**: Sistema de inicio de sesión para miembros
- **Panel de Control**: Para la gestión interna del grupo
- **Información Organizativa**: Detalles sobre las diferentes secciones del grupo


## Implementaciones Futuras

1. **Sistema de Notificaciones**: Para informar a los miembros sobre próximas actividades
2. **Área de Documentos**: Sección para compartir documentos importantes
3. **Galería de Fotos**: Para compartir momentos de campamentos y actividades
4. **Foro Interno**: Para comunicación entre miembros
5. **Sistema de Pagos**: Integración para gestionar cuotas y pagos
6. **App Móvil**: Versión nativa para dispositivos móviles
7. **Integración con Redes Sociales**: Automatización de publicaciones
8. **Sistema de Progresión**: Seguimiento del progreso de los scouts

## Cómo Ejecutar el Proyecto

### Requisitos Previos
- Node.js 18 o superior
- PNPM (recomendado) o NPM

### Instalación

```bash
# Clonar el repositorio
git clone https://tu-repositorio/osyris_web.git
cd osyris_web

# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

### Construcción para Producción

```bash
# Construir la aplicación
pnpm build

# Iniciar la aplicación en modo producción
pnpm start
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Autores y Reconocimientos

- **Equipo de Desarrollo**: Grupo Scout Osyris
- **Diseño**: Basado en los colores y valores del escultismo

## Licencia

Este proyecto está licenciado bajo [especificar licencia] - ver el archivo LICENSE para más detalles. 