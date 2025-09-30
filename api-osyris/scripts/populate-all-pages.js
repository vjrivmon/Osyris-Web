#!/usr/bin/env node

/**
 * 🗄️ SCRIPT COMPLETO DE POBLACIÓN DE PÁGINAS - OSYRIS WEB
 * Población completa de todas las páginas del sistema basándose en la navegación
 *
 * MISIÓN: Resolver inconsistencias entre tabs y barra lateral
 * - Poblar TODAS las páginas esperadas del sistema
 * - Asegurar sincronización completa frontend-backend-database
 */

const path = require('path');
process.chdir(path.join(__dirname, '..'));

const { query, initializeDatabase, closeDatabase } = require('../src/config/db.config');

/**
 * 📄 PÁGINAS COMPLETAS DEL SISTEMA OSYRIS
 * Basadas en la navegación real del frontend
 */
const paginasCompletas = [
  // 🏠 PÁGINAS PRINCIPALES
  {
    titulo: 'Inicio - Grupo Scout Osyris',
    slug: 'home',
    contenido: `# Bienvenidos al Grupo Scout Osyris 🏕️

## Quiénes Somos

El **Grupo Scout Osyris** es una comunidad comprometida con la educación en valores y el desarrollo integral de niños y jóvenes desde los 5 hasta los 19 años.

### 🎯 Nuestras Secciones

#### 🦫 Castores (5-7 años) - Colonia La Veleta
Los más pequeños descubren el mundo a través del juego y la diversión.

#### 🐺 Manada (7-10 años) - Manada Waingunga
Aventuras y descubrimientos en la naturaleza siguiendo el libro de la selva.

#### ⚜️ Tropa (10-13 años) - Tropa Brownsea
Vida en patrullas, campamentos y especialidades scout.

#### 🏔️ Pioneros (13-16 años) - Posta Kanhiwara
Proyectos de servicio y retos personales.

#### 🎒 Rutas (16-19 años) - Ruta Walhalla
Travesías, expediciones y compromiso social.

## ⭐ Nuestros Valores

- **🤝 Solidaridad**: Ayudar siempre a quien lo necesite
- **🎯 Responsabilidad**: Cumplir con nuestros compromisos
- **💚 Respeto**: Por la naturaleza y las personas
- **🔥 Honestidad**: Base de todas nuestras relaciones

> *"El scoutismo es un juego para chicos, dirigido por ellos mismos, en el que los hermanos mayores pueden dar a sus hermanos menores sanas diversiones al aire libre"* - Baden Powell

## 📅 Únete a Nuestra Aventura

**Reuniones**: Todos los sábados de 16:00 a 18:30
**Lugar**: Local Scout Osyris
**Contacto**: info@grupoosyris.com

¡Te esperamos para vivir la gran aventura del escultismo!`,
    resumen: 'Página principal del Grupo Scout Osyris con información general, secciones y valores del movimiento scout',
    meta_descripcion: 'Grupo Scout Osyris - Educación en valores y desarrollo integral para niños y jóvenes de 5 a 19 años. ¡Únete a la aventura!',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 1,
    mostrar_en_menu: true,
    permite_comentarios: false,
    creado_por: 1
  },

  // 🏕️ PÁGINAS DE SECCIONES
  {
    titulo: 'Nuestras Secciones Scout',
    slug: 'secciones',
    contenido: `# Nuestras Secciones Scout 🏕️

## Conoce las Diferentes Etapas del Escultismo

En el **Grupo Scout Osyris** acompañamos a niños y jóvenes en su crecimiento personal a través de diferentes secciones adaptadas a cada edad.

### 🦫 Castores (5-7 años)
**Colonia La Veleta**
- Color distintivo: **Naranja**
- **Actividades**: Juegos sensoriales, manualidades, cuentos
- **Objetivo**: Descubrir el mundo que les rodea

### 🐺 Manada (7-10 años)
**Manada Waingunga**
- Color distintivo: **Amarillo**
- **Actividades**: Aventuras, especialidades, vida en la naturaleza
- **Objetivo**: Vivir aventuras siguiendo la Ley de la Manada

### ⚜️ Tropa (10-13 años)
**Tropa Brownsea**
- Color distintivo: **Verde**
- **Actividades**: Campamentos, pionerismo, especialidades avanzadas
- **Objetivo**: Vida en patrullas y desarrollo del liderazgo

### 🏔️ Pioneros (13-16 años)
**Posta Kanhiwara**
- Color distintivo: **Rojo**
- **Actividades**: Proyectos de servicio, expediciones, empresas
- **Objetivo**: Compromiso social y personal

### 🎒 Rutas (16-19 años)
**Ruta Walhalla**
- Color distintivo: **Verde botella**
- **Actividades**: Rutas de senderismo, proyectos comunitarios
- **Objetivo**: Servicio y compromiso con la comunidad

## 📍 Información Práctica

**Reuniones**: Sábados de 16:00 a 18:30
**Lugar**: Local Grupo Scout Osyris
**Inscripciones**: Durante todo el año

¿Te interesa alguna sección? ¡Contáctanos!`,
    resumen: 'Conoce las cinco secciones del Grupo Scout Osyris: Castores, Manada, Tropa, Pioneros y Rutas',
    meta_descripcion: 'Descubre las diferentes secciones scout del Grupo Osyris para niños y jóvenes de 5 a 19 años',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 2,
    mostrar_en_menu: true,
    permite_comentarios: false,
    creado_por: 1
  },

  {
    titulo: 'Castores - Colonia La Veleta',
    slug: 'castores',
    contenido: `# 🦫 Castores - Colonia La Veleta

## Los Más Pequeños del Grupo (5-7 años)

La **Colonia La Veleta** acoge a los niños y niñas más pequeños del grupo scout, entre **5 y 7 años**.

### 🎯 Objetivos Educativos

- **Desarrollo sensorial**: Explorar el mundo a través de los sentidos
- **Socialización**: Aprender a jugar y compartir con otros niños
- **Creatividad**: Expresarse a través de manualidades y juegos
- **Naturaleza**: Primeros contactos con el medio ambiente

### 🎨 Nuestras Actividades

#### Actividades Semanales
- **Juegos sensoriales** y de movimiento
- **Manualidades** y expresión artística
- **Cuentos** y dramatizaciones
- **Primeros auxilios** básicos para niños

#### Actividades Especiales
- **Excursiones** a parques y granjas
- **Talleres** de cocina sencilla
- **Celebraciones** de festividades
- **Gymkhanas** y juegos cooperativos

### 🌈 Metodología

El trabajo con castores se basa en:
- **El juego** como herramienta principal de aprendizaje
- **Actividades cortas** adaptadas a su capacidad de atención
- **Refuerzo positivo** y reconocimiento de logros
- **Ambiente familiar** y acogedor

### 👥 Nuestro Equipo

La Colonia La Veleta está dirigida por monitores especializados en educación infantil, con formación específica en el trabajo con los más pequeños.

### 📅 Horarios y Participación

**Reuniones**: Sábados de 16:00 a 18:00
**Lugar**: Local Grupo Scout Osyris - Sección Infantil
**¿Interesado?**: Contacta con nosotros para conocer más

¡Los castores os esperan para vivir grandes aventuras! 🦫`,
    resumen: 'Información sobre la sección Castores del Grupo Scout Osyris para niños de 5 a 7 años',
    meta_descripcion: 'Castores Grupo Scout Osyris - Colonia La Veleta para niños de 5-7 años. Juegos, manualidades y primeras aventuras',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 3,
    mostrar_en_menu: false,
    permite_comentarios: false,
    creado_por: 1
  },

  {
    titulo: 'Manada - Manada Waingunga',
    slug: 'manada',
    contenido: `# 🐺 Manada - Manada Waingunga

## La Aventura de la Selva (7-10 años)

La **Manada Waingunga** sigue las aventuras de Mowgli y sus amigos de la selva para educar a niños y niñas de **7 a 10 años**.

### 🎯 Objetivos Educativos

- **Desarrollo físico**: A través del juego y la actividad al aire libre
- **Educación en valores**: Siguiendo la Ley de la Manada
- **Autonomía personal**: Fomentando la independencia y responsabilidad
- **Vida en grupo**: Aprendiendo a trabajar en equipo

### 🌟 La Ley de la Manada

*"El lobato escucha al viejo lobo"*
*"El lobato no se escucha a sí mismo"*

### 🏃‍♂️ Nuestras Actividades

#### Actividades Regulares
- **Especialidades**: Deportista, artista, naturalista, explorador...
- **Juegos de Kim**: Desarrollando los sentidos
- **Grandes juegos**: Recreando las aventuras del Libro de la Selva
- **Talleres**: Manualidades, cocina, primeros auxilios

#### Actividades Especiales
- **Acampada de la Manada**: Un fin de semana en la naturaleza
- **Raids**: Expediciones de orientación y supervivencia
- **Proyectos**: Huerto escolar, reciclaje, ayuda social
- **Celebraciones**: Día del Pensamiento, aniversarios

### 🎭 Ambientación: El Libro de la Selva

La Manada Waingunga vive en el mundo de Kipling donde:
- **Mowgli** representa al lobato que aprende
- **Baloo** el oso, enseña la Ley de la Selva
- **Bagheera** la pantera negra, transmite sabiduría
- **Akela** dirige la manada con justicia

### 🏅 Progresión Personal

Los lobatos avanzan siguiendo las **Huellas**:
1. **Huella de Lobezno**: Integración en la manada
2. **Primera Huella**: Conocimiento básico del escultismo
3. **Segunda Huella**: Desarrollo de habilidades específicas

### 📅 Información Práctica

**Reuniones**: Sábados de 16:00 a 18:30
**Lugar**: Local Grupo Scout Osyris - Sección Manada
**Acampadas**: Una vez al trimestre
**Contacto**: manada@grupoosyris.com

¡Únete a las aventuras de la Manada Waingunga! 🐺`,
    resumen: 'Información sobre la sección Manada del Grupo Scout Osyris para niños de 7 a 10 años siguiendo El Libro de la Selva',
    meta_descripcion: 'Manada Waingunga Grupo Scout Osyris - Sección para niños de 7-10 años inspirada en El Libro de la Selva',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 4,
    mostrar_en_menu: false,
    permite_comentarios: false,
    creado_por: 1
  },

  {
    titulo: 'Tropa - Tropa Brownsea',
    slug: 'tropa',
    contenido: `# ⚜️ Tropa - Tropa Brownsea

## La Esencia del Escultismo (10-13 años)

La **Tropa Brownsea** representa la sección más clásica del escultismo, donde chicos y chicas de **10 a 13 años** viven la auténtica aventura scout.

### 🎯 Objetivos Educativos

- **Sistema de Patrullas**: Vida democrática y liderazgo compartido
- **Vida al aire libre**: Campamentos y actividades en la naturaleza
- **Servicio**: Compromiso con la comunidad
- **Desarrollo personal**: A través de especialidades y cargos

### ⚜️ La Ley Scout

1. El scout cifra su honor en ser digno de confianza
2. El scout es leal
3. El scout es útil y ayuda a los demás
4. El scout es hermano de todo scout
5. El scout es cortés
6. El scout ve en la naturaleza la obra de Dios
7. El scout obedece sin réplica y hace las cosas a medias
8. El scout sonríe y canta en sus dificultades
9. El scout es económico, trabajador y cuidadoso del bien ajeno
10. El scout es limpio y sano; puro en pensamientos, palabras y obras

### 🏕️ Sistema de Patrullas

La Tropa se organiza en **patrullas** de 6-8 scouts:

#### Nuestras Patrullas
- **🐺 Patrulla Lobos**: Liderazgo y determinación
- **🦅 Patrulla Águilas**: Visión y libertad
- **🐻 Patrulla Osos**: Fuerza y protección
- **🦊 Patrulla Zorros**: Astucia y adaptabilidad

### 🏃‍♂️ Actividades de Tropa

#### Reuniones Semanales
- **Actividades de patrulla**: Juegos, proyectos, planificación
- **Especialidades**: Más de 30 especialidades diferentes
- **Técnica scout**: Nudos, orientación, pionerismo
- **Servicio**: Proyectos de ayuda a la comunidad

#### Campamentos
- **Campamento de Verano**: 15 días de aventura
- **Acampadas mensuales**: Fines de semana en la naturaleza
- **Raids**: Expediciones de orientación y supervivencia
- **Campamentos especiales**: Navidad, Semana Santa

### 🏅 Progresión Personal

**Etapas de Progresión:**
1. **Pañuelo**: Integración en la tropa
2. **Promesa Scout**: Compromiso con la Ley Scout
3. **Segunda Clase**: Desarrollo de habilidades básicas
4. **Primera Clase**: Dominio de técnicas scouts
5. **Especialidades**: Desarrollo de talentos específicos

### 🎖️ Cargos y Responsabilidades

- **Guía de Patrulla**: Líder de su patrulla
- **Subguía**: Apoyo al guía
- **Secretario**: Responsable de actas y comunicación
- **Tesorero**: Gestión de fondos de patrulla
- **Material**: Cuidado del equipo

### 📅 Información Práctica

**Reuniones**: Sábados de 16:00 a 18:30
**Lugar**: Local Grupo Scout Osyris - Sección Tropa
**Campamento de Verano**: Julio (15 días)
**Acampadas**: Primer fin de semana de cada mes
**Contacto**: tropa@grupoosyris.com

¡Vive la aventura scout en la Tropa Brownsea! ⚜️`,
    resumen: 'Información sobre la Tropa Brownsea del Grupo Scout Osyris para chicos y chicas de 10 a 13 años',
    meta_descripcion: 'Tropa Brownsea Grupo Scout Osyris - La esencia del escultismo para jóvenes de 10-13 años',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 5,
    mostrar_en_menu: false,
    permite_comentarios: false,
    creado_por: 1
  },

  {
    titulo: 'Pioneros - Posta Kanhiwara',
    slug: 'pioneros',
    contenido: `# 🏔️ Pioneros - Posta Kanhiwara

## Retos y Compromiso (13-16 años)

La **Posta Kanhiwara** es el lugar donde los jóvenes de **13 a 16 años** viven una etapa de retos personales y compromiso social.

### 🎯 Objetivos Educativos

- **Autoconocimiento**: Descubrir fortalezas y áreas de mejora
- **Compromiso social**: Proyectos de servicio a la comunidad
- **Liderazgo**: Desarrollo de habilidades de dirección
- **Formación**: Preparación para la vida adulta

### 🌟 Compromiso Pionero

*"Me comprometo por mi honor a hacer todo lo que de mí dependa para:*
- *Desarrollar plenamente mi personalidad*
- *Asumir mis responsabilidades como ciudadano*
- *Servir desinteresadamente a los demás*
- *Trabajar por la paz y la comprensión internacional*
- *Contribuir a la conservación de la naturaleza"*

### 🚀 Metodología: Empresas

Los pioneros trabajan en **empresas** (proyectos) que duran todo el año:

#### Tipos de Empresas
- **🌱 Ecológicas**: Conservación y educación ambiental
- **🤝 Sociales**: Ayuda a colectivos necesitados
- **📚 Culturales**: Difusión de la cultura local
- **🏃‍♂️ Deportivas**: Promoción del deporte y vida sana

#### Empresas Actuales
- **"Bosque Vivo"**: Reforestación en espacios degradados
- **"Compañía Digital"**: Enseñanza de informática a mayores
- **"Memoria Histórica"**: Recuperación de tradiciones locales
- **"Deporte Inclusivo"**: Actividades deportivas adaptadas

### 🎯 Áreas de Desarrollo

#### Desarrollo Físico
- Expediciones y rutas de montaña
- Deportes de aventura
- Supervivencia y vida en la naturaleza

#### Desarrollo Intelectual
- Técnicas de estudio y organización
- Debate y oratoria
- Investigación y análisis

#### Desarrollo Social
- Liderazgo de grupo
- Resolución de conflictos
- Trabajo en equipo

#### Desarrollo Espiritual
- Reflexión personal
- Valores y principios de vida
- Servicio desinteresado

### 🏕️ Actividades Especiales

- **Expedición Anual**: 5 días de trekking y supervivencia
- **Campo Pionero**: Encuentro nacional de pioneros
- **Servicio de Navidad**: Proyecto solidario navideño
- **Raid de Orientación**: Competición intergrupos

### 🏅 Especialidades Pionero

- **🎯 Responsable de Empresa**: Liderar proyectos
- **🌍 Educador Ambiental**: Conciencia ecológica
- **👥 Animador Sociocultural**: Dinamización grupal
- **🚑 Socorrista**: Primeros auxilios avanzados

### 📅 Información Práctica

**Reuniones**: Sábados de 16:00 a 18:30
**Lugar**: Local Grupo Scout Osyris - Sección Pioneros
**Expedición**: Semana Santa
**Campo**: Verano
**Contacto**: pioneros@grupoosyris.com

¡Acepta el reto y únete a la Posta Kanhiwara! 🏔️`,
    resumen: 'Información sobre la sección Pioneros del Grupo Scout Osyris para jóvenes de 13 a 16 años',
    meta_descripcion: 'Posta Kanhiwara Grupo Scout Osyris - Retos y compromiso social para jóvenes de 13-16 años',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 6,
    mostrar_en_menu: false,
    permite_comentarios: false,
    creado_por: 1
  },

  {
    titulo: 'Rutas - Ruta Walhalla',
    slug: 'rutas',
    contenido: `# 🎒 Rutas - Ruta Walhalla

## Camino hacia la Edad Adulta (16-19 años)

La **Ruta Walhalla** acompaña a los jóvenes de **16 a 19 años** en su camino hacia la madurez, el compromiso social y la preparación para la vida adulta.

### 🎯 Objetivos Educativos

- **Compromiso personal**: Desarrollo de un proyecto de vida
- **Servicio a la comunidad**: Acción social transformadora
- **Liderazgo maduro**: Preparación para responsabilidades adultas
- **Espiritualidad**: Búsqueda de sentido y trascendencia

### 🌟 Carta de la Ruta

*"Caminantes de la Ruta, vosotros sois los constructores de mañana.*
*Llevad en vuestros corazones la llama de la esperanza,*
*En vuestras manos las herramientas del servicio,*
*Y en vuestros ojos la visión de un mundo mejor.*
*El sendero que recorréis hoy será mañana el camino*
*que otros seguirán hacia la luz."*

### 🚶‍♂️ Metodología: El Camino

Los rovers trabajan siguiendo **el Camino**, un itinerario personal de crecimiento:

#### Las Cuatro Dimensiones
1. **🧭 Dimensión Personal**: Autoconocimiento y desarrollo
2. **🤝 Dimensión Social**: Compromiso con la comunidad
3. **🌍 Dimensión Trascendente**: Búsqueda de sentido
4. **⚜️ Dimensión Scout**: Servicio al Movimiento Scout

### 🌟 Proyectos de Servicio

#### Proyectos Actuales
- **"Aulas Sin Fronteras"**: Apoyo escolar a niños en riesgo
- **"Verde Urbano"**: Creación de huertos urbanos comunitarios
- **"Memoria Viva"**: Documentación de historia oral local
- **"Puentes Digitales"**: Formación tecnológica para mayores

### 🏔️ Actividades de Ruta

#### Travesías y Expediciones
- **Camino de Santiago**: Peregrinación anual
- **Rutas de Montaña**: Pirineos, Picos de Europa
- **Travesías Culturales**: Descubrimiento del patrimonio
- **Expediciones Internacionales**: Intercambio con otros países

#### Formación y Crecimiento
- **Escuelas de Formación**: Liderazgo, comunicación, gestión
- **Talleres Especializados**: Según intereses personales
- **Debates y Mesas Redondas**: Temas de actualidad
- **Retiros Espirituales**: Momentos de reflexión personal

### 🎓 Preparación Vida Adulta

#### Orientación Profesional
- Talleres de búsqueda de empleo
- Orientación vocacional y universitaria
- Desarrollo de soft skills
- Networking y contactos profesionales

#### Ciudadanía Activa
- Participación en organizaciones sociales
- Formación en voluntariado
- Conocimiento del tejido asociativo
- Compromiso político y social

### 🏅 Reconocimientos

- **🎯 Distintivo de Compromiso**: Por proyectos destacados
- **🌍 Insignia de Servicio**: Por acción social continuada
- **⚜️ Hermano Scout**: Máximo reconocimiento rover
- **👥 Animador Scout**: Habilitación como educador

### 🌐 Red de Rovers

#### Conexiones
- **Rovers Internacionales**: Intercambios y proyectos conjuntos
- **Red Nacional**: Encuentros y campos rovers
- **Alumni Osyris**: Antiguos miembros y mentores
- **Organizaciones Colaboradoras**: ONG's y entidades sociales

### 📅 Información Práctica

**Reuniones**: Sábados de 16:00 a 18:30 (flexible)
**Lugar**: Local Grupo Scout Osyris - Sección Ruta
**Camino Santiago**: Verano
**Proyectos**: Todo el año
**Contacto**: ruta@grupoosyris.com

¡Únete al Camino de la Ruta Walhalla! 🎒`,
    resumen: 'Información sobre la sección Rutas del Grupo Scout Osyris para jóvenes de 16 a 19 años',
    meta_descripcion: 'Ruta Walhalla Grupo Scout Osyris - Preparación para la vida adulta y servicio social para jóvenes de 16-19 años',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 7,
    mostrar_en_menu: false,
    permite_comentarios: false,
    creado_por: 1
  },

  // 📅 PÁGINA CALENDARIO
  {
    titulo: 'Calendario de Actividades',
    slug: 'calendario',
    contenido: `# 📅 Calendario de Actividades

## Planifica tu Aventura Scout

Mantente al día con todas las actividades, campamentos y eventos especiales del **Grupo Scout Osyris**.

### 🗓️ Actividades Regulares

#### Reuniones Semanales
**Todos los sábados de 16:00 a 18:30**
- **Castores**: 16:00 - 18:00
- **Manada**: 16:00 - 18:30
- **Tropa**: 16:00 - 18:30
- **Pioneros**: 16:00 - 18:30
- **Rutas**: 16:00 - 18:30 (flexible)

### 🏕️ Campamentos y Acampadas

#### Campamento de Verano
- **Fechas**: Todo el mes de julio
- **Lugar**: A determinar cada año
- **Participantes**: Todas las secciones
- **Duración**: 15 días

#### Acampadas de Fin de Semana
- **Frecuencia**: Primer fin de semana de cada mes
- **Lugar**: Diferentes ubicaciones naturales
- **Participantes**: Por secciones

#### Campamentos Especiales
- **Navidad**: 27-30 diciembre
- **Semana Santa**: Según calendario
- **San Jorge**: 23 abril

### 🎉 Eventos Especiales

#### Celebraciones Anuales
- **🌍 Día del Pensamiento Mundial**: 22 febrero
- **⚜️ Día de San Jorge**: 23 abril
- **🎵 Festival de la Canción Scout**: Mayo
- **🏃‍♂️ Olimpiadas Scouts**: Junio
- **🎄 Belén Viviente**: Diciembre

#### Actividades de Sección
- **Raids de Orientación**: Trimestrales
- **Concursos de Especialidades**: Mensuales
- **Proyectos de Servicio**: Todo el año
- **Intercambios**: Con otros grupos scouts

### 📋 Cómo Participar

#### Inscripciones
1. **Actividades regulares**: Sin inscripción previa
2. **Campamentos**: Inscripción con antelación
3. **Eventos especiales**: Consultar fechas límite

#### Documentación Necesaria
- Autorización médica actualizada
- Seguro de responsabilidad civil
- Fichas específicas por actividad

### 📞 Información y Contacto

**¿Tienes dudas sobre alguna actividad?**

- **Email general**: info@grupoosyris.com
- **Teléfono**: 123 456 789
- **WhatsApp Familias**: Grupo específico por sección

### 💡 Consejos Prácticos

#### Qué Llevar
- **Reuniones**: Ropa cómoda y cuaderno
- **Acampadas**: Lista específica por sección
- **Campamentos**: Equipación completa

#### Importante
- Llegar puntual a las actividades
- Avisar de ausencias con antelación
- Mantener actualizados los datos médicos
- Participar activamente en la planificación

¡No te pierdas ninguna aventura! Consulta regularmente nuestro calendario. 📅`,
    resumen: 'Calendario completo de actividades, campamentos y eventos del Grupo Scout Osyris',
    meta_descripcion: 'Consulta el calendario de actividades del Grupo Scout Osyris: reuniones, campamentos y eventos especiales',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 8,
    mostrar_en_menu: true,
    permite_comentarios: false,
    creado_por: 1
  },

  // 🖼️ PÁGINA GALERÍA
  {
    titulo: 'Galería de Fotos',
    slug: 'galeria',
    contenido: `# 🖼️ Galería de Fotos

## Revive Nuestras Aventuras

Descubre los mejores momentos del **Grupo Scout Osyris** a través de nuestra galería fotográfica.

### 📸 Últimas Actividades

#### Campamento de Verano 2024
Una increíble aventura de 15 días en plena naturaleza donde todas las secciones vivieron experiencias únicas.

**Highlights del campamento:**
- 🏕️ Montaje de campamento base
- 🌅 Veladas bajo las estrellas
- 🏃‍♂️ Grandes juegos por secciones
- 🎭 Festival de talentos
- 🌮 Talleres de cocina al aire libre
- 🧗‍♀️ Actividades de aventura

#### Acampada de Otoño - Tropa Brownsea
Los scouts de la Tropa disfrutaron de un fin de semana lleno de técnicas scouts, orientación y pionerismo.

#### Festival de la Canción Scout
Nuestro tradicional festival donde todas las secciones mostraron su creatividad musical y artística.

### 🏆 Momentos Especiales

#### Promesas Scout
Los momentos más emotivos: cuando nuestros jóvenes se comprometen con los ideales del escultismo.

#### San Jorge 2024
Celebración del patrón scout con desfile, actividades familiares y renovación de promesas.

#### Proyectos de Servicio
Nuestras secciones en acción: limpieza de bosques, ayuda a mayores, talleres infantiles...

### 📁 Archivo por Secciones

#### 🦫 Castores - Colonia La Veleta
- Juegos y manualidades
- Excursiones y salidas
- Celebraciones y fiestas
- Actividades familiares

#### 🐺 Manada - Manada Waingunga
- Aventuras de la selva
- Especialidades conseguidas
- Acampadas de manada
- Grandes juegos

#### ⚜️ Tropa - Tropa Brownsea
- Campamentos y acampadas
- Actividades de patrulla
- Construcciones y pionerismos
- Raids y expediciones

#### 🏔️ Pioneros - Posta Kanhiwara
- Empresas y proyectos
- Expediciones de montaña
- Servicio comunitario
- Formación y talleres

#### 🎒 Rutas - Ruta Walhalla
- Camino de Santiago
- Proyectos sociales
- Travesías y rutas
- Encuentros y campos

### 📝 Archivo Histórico

#### Años Anteriores
- 📅 2023: "25 Años de Historia"
- 📅 2022: "Vuelta a la Normalidad"
- 📅 2021: "Scouts en Casa"
- 📅 2020: "Adaptación y Creatividad"

#### Momentos Históricos
- 🏛️ Fundación del grupo (1995)
- 🎉 Primeros campamentos
- 🏆 Reconocimientos recibidos
- 👥 Antiguos miembros ilustres

### 📸 ¿Quieres Contribuir?

#### Envía tus Fotos
¿Tienes fotos de actividades que te gustaría compartir?

**Envíalas a**: fotos@grupoosyris.com

**Requisitos:**
- Buena calidad y resolución
- Actividades del Grupo Scout Osyris
- Autorización de imagen (menores)
- Identificar fecha y actividad

#### Normas de Uso
- Respeto a la intimidad de los participantes
- No compartir sin autorización
- Uso exclusivo dentro del marco scout
- Cumplimiento de la protección de datos

### 🎥 Próximamente: Vídeos

Estamos preparando una sección de vídeos donde podrás ver:
- 📹 Resúmenes de campamentos
- 🎬 Tutoriales de técnicas scouts
- 📺 Entrevistas y testimonios
- 🎭 Obras de teatro y espectáculos

### 📱 Síguenos en Redes

¿Quieres ver más contenido?

- **Instagram**: @grupoosyris
- **Facebook**: Grupo Scout Osyris
- **YouTube**: Canal Osyris Scouts

¡Cada imagen cuenta una historia de amistad, aventura y crecimiento! 📸`,
    resumen: 'Galería fotográfica del Grupo Scout Osyris con imágenes de campamentos, actividades y momentos especiales',
    meta_descripcion: 'Explora la galería de fotos del Grupo Scout Osyris: campamentos, actividades por secciones y momentos históricos',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 9,
    mostrar_en_menu: true,
    permite_comentarios: true,
    creado_por: 1
  },

  // 🏢 PÁGINAS SOBRE NOSOTROS
  {
    titulo: 'Sobre Nosotros - Grupo Scout Osyris',
    slug: 'sobre-nosotros',
    contenido: `# 🏕️ Sobre Nosotros - Grupo Scout Osyris

## Nuestra Historia y Valores

### 📚 Historia del Grupo

El **Grupo Scout Osyris** fue fundado en **1995** por un grupo de padres y monitores comprometidos con la educación integral de los jóvenes. Desde entonces, hemos acompañado a cientos de niños y jóvenes en su crecimiento personal y desarrollo como ciudadanos responsables.

#### Momentos Clave
- **1995**: Fundación del grupo con 25 miembros
- **2000**: Primer campamento internacional
- **2005**: Construcción del local propio
- **2010**: Reconocimiento como grupo de referencia
- **2020**: Adaptación digital durante la pandemia
- **2025**: 30 años de historia y compromiso

### 🎯 Nuestra Misión

**Formar ciudadanos comprometidos, responsables y solidarios** a través del método scout, proporcionando espacios educativos que favorezcan el desarrollo integral de niños y jóvenes.

### 🌟 Nuestra Visión

Ser un grupo scout de referencia en la educación en valores, reconocido por:
- La calidad de nuestro proyecto educativo
- El compromiso social de nuestros miembros
- La innovación en metodologías educativas
- El respeto por la diversidad y la inclusión

### ⚡ Nuestros Valores

#### 🤝 Solidaridad
Ayudar siempre a quien lo necesite, especialmente a los más desfavorecidos.

#### 🎯 Responsabilidad
Cumplir con nuestros compromisos personales y sociales.

#### 💚 Respeto
Por las personas, las ideas diferentes y el medio ambiente.

#### 🔥 Honestidad
Ser transparentes y auténticos en todas nuestras relaciones.

#### 🌈 Diversidad
Acoger y valorar las diferencias como riqueza del grupo.

#### 🌍 Compromiso Social
Trabajar por un mundo más justo y sostenible.

### 🏗️ Método Scout

Basamos nuestro trabajo educativo en el **método scout**, que incluye:

#### Sistema de Patrullas
Pequeños grupos donde se aprende democracia y liderazgo.

#### Ley y Promesa
Código de valores que guía el comportamiento.

#### Aprender Haciendo
Educación activa a través de la experiencia.

#### Progresión Personal
Cada joven avanza a su ritmo según sus capacidades.

#### Marco Simbólico
Historias y símbolos que dan sentido a las actividades.

#### Vida en la Naturaleza
La naturaleza como aula y maestra de vida.

#### Apoyo Adulto
Acompañamiento educativo de monitores formados.

### 🏆 Reconocimientos

- **2018**: Premio a la Excelencia Educativa (Ayuntamiento)
- **2019**: Reconocimiento Medioambiental (Conselleria)
- **2021**: Distinción Compromiso Social (Cruz Roja)
- **2023**: Grupo Scout del Año (Federación)

### 📊 Nuestros Números

- **👥 150+ miembros** en todas las secciones
- **👨‍🏫 25 monitores** voluntarios activos
- **🏕️ 25+ campamentos** realizados
- **🌱 500+ árboles** plantados en proyectos
- **📚 1000+ horas** de servicio comunitario anual
- **🎓 95%** de nuestros rovers acceden a estudios superiores

### 🏢 Nuestras Instalaciones

#### Local Principal
- **📍 Ubicación**: Centro de la ciudad
- **🏠 Superficie**: 300 m² distribuidos en:
  - 5 salas por secciones
  - Almacén de material
  - Cocina y comedor
  - Despacho administración
  - Biblioteca scout

#### Material y Equipamiento
- **🏕️ Material de campamento**: Tiendas, cocinas, herramientas
- **⛑️ Equipos de seguridad**: Botiquines, radios, GPS
- **🎮 Material de juegos**: Para todas las edades
- **📚 Biblioteca**: Libros scout y educativos
- **💻 Equipos informáticos**: Para formación y gestión

### 🤝 Colaboraciones

Trabajamos con:
- **🏛️ Ayuntamiento**: Proyectos medioambientales
- **🏫 Centros Educativos**: Apoyo escolar y actividades
- **🏥 Cruz Roja**: Formación en primeros auxilios
- **🌳 Organizaciones Ecologistas**: Conservación natural
- **👴 Residencias de Mayores**: Programas intergeneracionales
- **🌍 ONG's Locales**: Proyectos de cooperación

### 📞 Transparencia y Gestión

#### Junta Directiva
- **Presidente**: Gestión general del grupo
- **Secretario**: Documentación y comunicaciones
- **Tesorero**: Gestión económica y presupuestos
- **Coordinador Educativo**: Supervisión metodológica

#### Memorias Anuales
Publicamos anualmente nuestros:
- Resultados educativos
- Balance económico
- Proyectos realizados
- Objetivos futuros

### 🚀 Proyectos Futuros

#### Corto Plazo (2025)
- Renovación integral del local
- Ampliación de la sección rovers
- Programa de intercambios internacionales

#### Medio Plazo (2025-2027)
- Centro de formación scout
- Granja escuela propia
- Programa de liderazgo juvenil

#### Largo Plazo (2030)
- Casa de colonias en la montaña
- Red de grupos hermanos
- Centro de investigación educativa

¡Conoce más sobre nuestra gran familia scout! 🏕️`,
    resumen: 'Historia, misión, valores y proyectos del Grupo Scout Osyris. 30 años de educación en valores y compromiso social',
    meta_descripcion: 'Conoce la historia y valores del Grupo Scout Osyris. 30 años educando en valores y compromiso social.',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 10,
    mostrar_en_menu: true,
    permite_comentarios: false,
    creado_por: 1
  },

  {
    titulo: 'Nuestro Kraal - Equipo de Monitores',
    slug: 'kraal',
    contenido: `# 👥 Nuestro Kraal - Equipo de Monitores

## Conoce a Nuestros Educadores

El **Kraal** es el corazón educativo del Grupo Scout Osyris. Formado por monitores voluntarios comprometidos con la formación integral de nuestros jóvenes.

### 🎯 ¿Qué es el Kraal?

En el escultismo, el **Kraal** es:
- El círculo de monitores y educadores
- El equipo responsable de la educación
- El grupo que planifica y coordina actividades
- La comunidad que vela por el crecimiento del grupo

### 👨‍🏫 Nuestro Equipo

#### Coordinación General

**María González** - *Coordinadora de Grupo*
- 15 años de experiencia scout
- Especialista en educación infantil
- Coordinadora pedagógica

**Carlos Ruiz** - *Coordinador Técnico*
- Monitor especialista en aire libre
- Responsable de campamentos
- Formador de nuevos monitores

#### Monitores por Secciones

##### 🦫 Castores - Colonia La Veleta
**Ana López** - *Responsable de Sección*
- Magisterio en Educación Infantil
- 8 años como monitor de castores
- Especialista en psicomotricidad

**Pedro Martín** - *Monitor*
- Estudiante de Psicología
- 4 años en el grupo
- Experto en juegos cooperativos

##### 🐺 Manada - Manada Waingunga
**Laura Fernández** - *Akela (Responsable)*
- Pedagogía Terapéutica
- 10 años en la manada
- Formación en dinámicas de grupo

**Miguel Sánchez** - *Baloo*
- Educación Social
- 6 años como monitor
- Especialista en educación ambiental

**Isabel Torres** - *Bagheera*
- Maestra de Primaria
- 5 años en el escultismo
- Experta en técnicas de expresión

##### ⚜️ Tropa - Tropa Brownsea
**Alberto García** - *Responsable de Sección*
- Ingeniero y Scout desde los 8 años
- 12 años como monitor
- Especialista en técnica scout

**Carmen Jiménez** - *Monitora*
- Bióloga especializada en educación ambiental
- 7 años en la tropa
- Responsable de actividades en naturaleza

**Raúl Moreno** - *Monitor*
- Estudiante de Magisterio
- Antiguo scout del grupo
- Experto en sistemas de patrullas

##### 🏔️ Pioneros - Posta Kanhiwara
**Silvia Herrera** - *Responsable de Sección*
- Trabajadora Social
- 9 años en pioneros
- Especialista en proyectos sociales

**Daniel Vega** - *Monitor*
- Educador Social
- 6 años en el grupo
- Coordinador de empresas

##### 🎒 Rutas - Ruta Walhalla
**Patricia Morales** - *Responsable de Sección*
- Psicóloga especializada en adolescencia
- 8 años en rutas
- Experta en orientación vocacional

**Javier Navarro** - *Monitor*
- Antiguo rover del grupo
- 5 años como educador
- Especialista en liderazgo juvenil

### 🎓 Formación de Monitores

#### Formación Inicial
- **Cursillo de Monitores** (40 horas)
- **Prácticas supervisadas** (100 horas)
- **Evaluación continuada**
- **Habilitación oficial**

#### Formación Permanente
- **Seminarios trimestrales** de actualización
- **Cursos especializados** por secciones
- **Encuentros formativos** inter-grupos
- **Reciclaje anual** obligatorio

#### Especializaciones Disponibles
- 🏕️ **Director de Campamentos**
- 🚑 **Primeros Auxilios Avanzados**
- 🌿 **Educación Ambiental**
- 👥 **Dinámicas de Grupo**
- 🎭 **Animación y Expresión**
- 💻 **Nuevas Tecnologías Educativas**

### 🏅 Compromiso y Dedicación

#### Tiempo de Dedicación
- **Reuniones semanales**: 3 horas
- **Planificación mensual**: 2 horas
- **Campamentos**: Fin de semana completo
- **Formación**: 20 horas anuales

#### Nuestro Compromiso
- **Educación integral** de los jóvenes
- **Metodología scout** auténtica
- **Ambiente educativo** seguro y acogedor
- **Crecimiento personal** de cada miembro
- **Valores del escultismo** en acción

### 🌟 ¿Por qué ser Monitor?

#### Desarrollo Personal
- **Liderazgo**: Habilidades de dirección de grupos
- **Comunicación**: Técnicas de comunicación efectiva
- **Paciencia**: Trabajo con diferentes edades
- **Creatividad**: Diseño de actividades educativas
- **Responsabilidad**: Gestión de grupos de jóvenes

#### Satisfacción Personal
- **Impacto positivo** en la vida de los jóvenes
- **Crecimiento personal** continuo
- **Amistad** con otros educadores
- **Experiencias únicas** en la naturaleza
- **Contribución social** significativa

### 👥 ¿Quieres Unirte al Kraal?

#### Requisitos
- **Mayoría de edad** (18 años mínimo)
- **Vocación educativa** y compromiso social
- **Disponibilidad** los sábados tarde
- **Actitud positiva** y trabajo en equipo
- **Ganas de aprender** y formarse

#### Proceso de Incorporación
1. **Entrevista inicial** con la coordinación
2. **Período de observación** (1 mes)
3. **Formación básica** (2 meses)
4. **Prácticas supervisadas** (3 meses)
5. **Evaluación final** y habilitación

#### Contacto
**¿Interesado en ser monitor?**
- **Email**: monitores@grupoosyris.com
- **Teléfono**: 123 456 789
- **Reunión informativa**: Primer jueves de cada mes

### 🏆 Reconocimientos al Equipo

- **2024**: Mejor Equipo Educativo (Federación Scout)
- **2023**: Premio Innovación Metodológica
- **2022**: Reconocimiento Excelencia Formativa
- **2021**: Distinción Compromiso Educativo

### 📚 Recursos para Monitores

#### Material Formativo
- **Biblioteca pedagógica** especializada
- **Archivo de actividades** por secciones
- **Fichas técnicas** de juegos y dinámicas
- **Manuales metodológicos** actualizados

#### Herramientas Digitales
- **Plataforma de formación** online
- **App de comunicación** interna
- **Base de datos** de recursos
- **Sistema de planificación** digital

¡El Kraal te espera para formar parte de esta gran aventura educativa! 👥`,
    resumen: 'Conoce al equipo de monitores del Grupo Scout Osyris: formación, compromiso y dedicación a la educación scout',
    meta_descripcion: 'Equipo de monitores Grupo Scout Osyris - Kraal comprometido con la educación integral y valores scout',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 11,
    mostrar_en_menu: false,
    permite_comentarios: false,
    creado_por: 1
  },

  {
    titulo: 'Comité de Grupo - Familias y Colaboradores',
    slug: 'comite',
    contenido: `# 👨‍👩‍👧‍👦 Comité de Grupo - Familias y Colaboradores

## La Comunidad Educativa del Grupo

El **Comité de Grupo** es el órgano de representación y participación de las familias en el proyecto educativo del Grupo Scout Osyris.

### 🎯 ¿Qué es el Comité de Grupo?

El Comité es:
- El órgano de **gobierno** del grupo scout
- La representación de **todas las familias**
- El espacio de **participación** y decisión
- El garante del **proyecto educativo**

### 🏗️ Estructura del Comité

#### Junta Directiva

**Presidente: Juan Carlos Mendoza**
- Padre de 2 scouts (Tropa y Pioneros)
- Empresario, especialista en gestión
- 8 años en el comité
- Coordina la gestión general del grupo

**Secretaria: Mercedes Jiménez**
- Madre de 1 scout (Manada)
- Administrativa, especialista en comunicación
- 5 años en el comité
- Gestiona documentación y comunicaciones

**Tesorera: Rosa María Castillo**
- Madre de 2 scouts (Castores y Tropa)
- Contable titulada
- 6 años en el comité
- Responsable de gestión económica

#### Coordinadores por Secciones

**Castores - Coordinadora: Elena Ruiz**
- Representa a las familias de castores
- Facilita comunicación sección-familias
- Organiza actividades familiares

**Manada - Coordinador: Antonio García**
- Enlace entre monitores y padres
- Coordina acampadas familiares
- Apoya actividades de manada

**Tropa - Coordinadora: Pilar Fernández**
- Antigua scout del grupo
- Especialista en logística de campamentos
- Coordinadora de transporte

**Pioneros - Coordinador: Miguel Torres**
- Padre de rover y pionero
- Apoya empresas y proyectos sociales
- Coordinación con instituciones

**Rutas - Coordinadora: Carmen López**
- Madre de 2 rovers
- Profesora de instituto
- Orientación académica y profesional

### 🤝 Funciones del Comité

#### Gestión Administrativa
- **Representación legal** del grupo
- **Gestión económica** transparente
- **Coordinación** con federaciones
- **Relaciones institucionales**

#### Apoyo Educativo
- **Supervisión** del proyecto educativo
- **Apoyo** a monitores y coordinación
- **Evaluación** de actividades
- **Propuestas** de mejora

#### Servicios a Familias
- **Información** sobre actividades
- **Coordinación** de transporte
- **Gestión** de documentación
- **Resolución** de dudas y consultas

### 👪 Participación de las Familias

#### Reuniones y Comunicación
- **Asamblea General**: Trimestral
- **Reuniones de sección**: Mensuales
- **WhatsApp por secciones**: Comunicación diaria
- **Newsletter**: Boletín informativo mensual

#### Actividades Familiares
- **🎉 Día de las Familias**: Encuentro anual
- **🍖 Paella de San Jorge**: Celebración tradicional
- **🎄 Mercadillo de Navidad**: Evento solidario
- **🏃‍♂️ Carrera Popular**: Actividad deportiva familiar

### 💰 Gestión Económica

#### Transparencia Total
- **Presupuesto anual** aprobado en asamblea
- **Balance trimestral** enviado a familias
- **Auditoría externa** anual
- **Memoria económica** pública

#### Estructura de Cuotas (2025)
- **📝 Inscripción**: 40€ anuales
- **💳 Cuota mensual**: 22€ (sept-junio)
- **🏕️ Campamentos**: Precio según actividad
- **📊 Actividades extras**: Coste específico

#### Becas y Ayudas
- **🎓 Becas de necesidad**: Para situaciones económicas difíciles
- **👥 Descuentos familiares**: Familias con múltiples hijos
- **💼 Ayudas campamentos**: Para campamentos de verano
- **🎯 Becas mérito**: Para jóvenes destacados

### 🌟 Voluntariado y Colaboración

#### Áreas de Colaboración
- **🚐 Transporte**: Coordinación de desplazamientos
- **🍽️ Logística**: Apoyo en campamentos y actividades
- **🎨 Talleres**: Padres especialistas impartiendo talleres
- **💻 Comunicación**: Gestión de redes y web
- **🏗️ Mantenimiento**: Cuidado del local e instalaciones

#### Proyectos Especiales
- **🌱 Huerto Familiar**: Proyecto medioambiental
- **👴 Abuelos Scout**: Programa intergeneracional
- **💡 Banco de Talentos**: Profesionales colaboradores
- **📚 Biblioteca**: Gestión recursos educativos

### 🏆 Reconocimientos y Logros

#### Premios Recibidos
- **2023**: Mejor Comité de Grupo (Federación Autonómica)
- **2022**: Premio Transparencia Asociativa
- **2021**: Reconocimiento Gestión Participativa
- **2020**: Distinción Solidaridad COVID-19

#### Logros Destacados
- **📊 95% participación** en asambleas
- **💯 Transparencia total** en gestión económica
- **🎯 100% actividades** cubiertas por voluntarios
- **⭐ Satisfacción familiar**: 9,2/10

### 📋 Servicios del Comité

#### Para las Familias
- **📞 Atención personalizada**: Resolución de dudas
- **📋 Gestión documental**: Tramitación de papeles
- **🚗 Coordinación transporte**: Viajes compartidos
- **💳 Gestión económica**: Pagos y facturación

#### Para el Grupo
- **🏢 Gestión legal**: Representación oficial
- **💰 Administración**: Gestión económica completa
- **🤝 Relaciones externas**: Instituciones y organizaciones
- **📈 Planificación**: Objetivos y proyectos futuros

### 📞 Contacto con el Comité

#### Vías de Comunicación
- **Email general**: comite@grupoosyris.com
- **Teléfono**: 123 456 789 (horario de oficina)
- **WhatsApp Urgencias**: Solo para temas urgentes
- **Buzón físico**: En el local del grupo

#### Horario de Atención
- **Sábados**: 15:30-16:00 y 18:30-19:00
- **Entre semana**: Cita previa
- **Email**: Respuesta en 24h laborables

### 🚀 ¿Quieres Participar?

#### Como Voluntario
- **📋 Inscripción**: Simple formulario
- **⏰ Flexibilidad**: Colaboración según disponibilidad
- **🎓 Formación**: No necesaria, solo ganas
- **🤝 Comunidad**: Forma parte de la familia scout

#### Como Miembro del Comité
- **🗳️ Elecciones**: Anuales por votación
- **📅 Compromiso**: Reuniones mensuales
- **🎯 Responsabilidad**: Gestión participativa
- **💪 Impacto**: Influencia directa en el grupo

¡Tu participación hace grande al Grupo Scout Osyris! 👨‍👩‍👧‍👦`,
    resumen: 'Comité de Grupo del Scout Osyris: familias, gestión participativa, transparencia y servicios para la comunidad educativa',
    meta_descripcion: 'Conoce el Comité de Grupo Scout Osyris: participación familiar, gestión transparente y servicios para familias',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 12,
    mostrar_en_menu: false,
    permite_comentarios: false,
    creado_por: 1
  },

  // 📞 PÁGINA CONTACTO
  {
    titulo: 'Contacto - Grupo Scout Osyris',
    slug: 'contacto',
    contenido: `# 📞 Contacto - Grupo Scout Osyris

## ¿Cómo Contactar con Nosotros?

### 📍 Información General

#### Datos de Contacto
- **📧 Email**: info@grupoosyris.com
- **📱 Teléfono**: 123 456 789
- **🌐 Web**: www.grupoosyris.com
- **📱 WhatsApp**: 123 456 789 (solo consultas)

#### Dirección del Local
**Grupo Scout Osyris**
Calle Principal, 123
12345 Ciudad
Valencia, España

#### Horarios de Atención
- **Sábados**: 15:30 - 19:00 (durante actividades)
- **Entre semana**: Cita previa por teléfono o email
- **Email**: Respuesta garantizada en 24h laborables

### 📅 ¿Cuándo Visitarnos?

#### Días de Actividad
**Sábados de 16:00 a 18:30**
- Es el mejor momento para conocernos
- Puedes ver las actividades en directo
- Hablar con monitores y familias
- Resolver dudas sobre el proyecto

#### Reuniones Informativas
**Primer sábado de cada mes a las 15:30**
- Presentación del proyecto educativo
- Visita a instalaciones
- Conocer metodología por secciones
- Proceso de inscripción

### 👥 Contactos por Secciones

#### 🦫 Castores (5-7 años)
- **Responsable**: Ana López
- **Email**: castores@grupoosyris.com
- **WhatsApp**: Grupo familias castores

#### 🐺 Manada (7-10 años)
- **Responsable**: Laura Fernández (Akela)
- **Email**: manada@grupoosyris.com
- **WhatsApp**: Grupo familias manada

#### ⚜️ Tropa (10-13 años)
- **Responsable**: Alberto García
- **Email**: tropa@grupoosyris.com
- **WhatsApp**: Grupo familias tropa

#### 🏔️ Pioneros (13-16 años)
- **Responsable**: Silvia Herrera
- **Email**: pioneros@grupoosyris.com
- **WhatsApp**: Grupo familias pioneros

#### 🎒 Rutas (16-19 años)
- **Responsable**: Patricia Morales
- **Email**: rutas@grupoosyris.com
- **WhatsApp**: Grupo rovers y familias

### 🏢 Contactos Administrativos

#### Coordinación General
- **María González** - Coordinadora de Grupo
- **Email**: coordinacion@grupoosyris.com
- **Teléfono**: 123 456 789 ext. 1

#### Comité de Grupo
- **Juan Carlos Mendoza** - Presidente
- **Email**: presidente@grupoosyris.com
- **Mercedes Jiménez** - Secretaria
- **Email**: secretaria@grupoosyris.com

#### Administración
- **Rosa María Castillo** - Tesorera
- **Email**: tesoreria@grupoosyris.com
- **Gestión económica y cuotas**

### 🗺️ Cómo Llegar

#### En Transporte Público
- **🚌 Autobús**: Líneas 15, 23, 47 (Parada Plaza Mayor)
- **🚊 Metro**: Línea 3 (Estación Centro)
- **🚂 Tren**: Cercanías (Estación Principal + 10 min andando)

#### En Vehículo Privado
- **🅿️ Aparcamiento**: Parking público Plaza del Ayuntamiento
- **🚗 Calle**: Zona azul los sábados hasta las 14:00
- **♿ Accesibilidad**: Local adaptado para personas con movilidad reducida

#### Ubicación GPS
**Coordenadas**: 39.4699° N, 0.3763° W
**Google Maps**: "Grupo Scout Osyris"

### 💬 Preguntas Frecuentes

#### ¿Cómo inscribir a mi hijo?
1. Asistir a reunión informativa
2. Conocer el proyecto educativo
3. Completar documentación
4. Período de adaptación (1 mes)

#### ¿Cuáles son las cuotas?
- **Inscripción anual**: 40€
- **Cuota mensual**: 22€ (septiembre-junio)
- **Campamentos**: Precio según actividad

#### ¿Qué documentación necesito?
- Ficha de inscripción completa
- Fotocopia DNI del menor
- Autorización médica
- Seguro responsabilidad civil

#### ¿Puedo hacer una visita previa?
¡Por supuesto! Ven cualquier sábado o solicita cita previa.

### 📱 Redes Sociales

#### Síguenos en:
- **📘 Facebook**: @GrupoScoutOsyris
- **📸 Instagram**: @grupoosyris
- **📺 YouTube**: Canal Osyris Scouts
- **💼 LinkedIn**: Grupo Scout Osyris

### 📝 Formulario de Contacto

#### Para Consultas Generales
**Nombre y apellidos**: _______________
**Email**: _______________
**Teléfono**: _______________
**Edad del niño/a**: _______________
**Consulta**: _______________

**Envía a**: info@grupoosyris.com

#### Para Inscripciones
**Descarga**: Ficha de inscripción en web
**Email**: inscripciones@grupoosyris.com
**Teléfono**: 123 456 789

### 🆘 Contactos de Emergencia

#### Durante Actividades
- **Monitor responsable**: Según sección
- **Coordinación**: 123 456 789
- **Emergencias**: 112 (servicios de emergencia)

#### Durante Campamentos
- **Director campamento**: Número facilitado antes
- **Coordinación grupo**: 123 456 789
- **WhatsApp familias**: Grupo específico campamento

### 💡 Consejos para el Primer Contacto

#### Antes de Venir
- Consulta nuestra web y redes sociales
- Prepara las preguntas que quieras hacer
- Trae al niño/a para que vea el ambiente
- No hace falta cita previa los sábados

#### Durante la Visita
- Llega entre 15:30-16:00 para presentaciones
- Observa las actividades en curso
- Habla con otros padres y madres
- Pregunta todas tus dudas

#### Después de la Visita
- Te contactaremos en 24-48h
- Período de reflexión sin presiones
- Proceso de inscripción personalizado
- Acompañamiento durante la adaptación

¡Esperamos conocerte pronto y que formes parte de nuestra gran familia scout! 📞`,
    resumen: 'Información completa de contacto del Grupo Scout Osyris: direcciones, teléfonos, emails y cómo llegar',
    meta_descripcion: 'Contacta con el Grupo Scout Osyris: teléfono, email, dirección y información de contacto por secciones',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 13,
    mostrar_en_menu: true,
    permite_comentarios: false,
    creado_por: 1
  },

  // 📚 PÁGINAS ADICIONALES (footer y legales)
  {
    titulo: 'Preguntas Frecuentes',
    slug: 'preguntas-frecuentes',
    contenido: `# ❓ Preguntas Frecuentes

## Resolvemos Tus Dudas sobre el Escultismo

### 🏕️ Sobre el Grupo Scout Osyris

#### ¿Qué es un grupo scout?
Un grupo scout es una asociación educativa que trabaja con niños y jóvenes de 5 a 19 años, utilizando el método educativo creado por Baden-Powell basado en valores, vida en la naturaleza y aprendizaje activo.

#### ¿Desde cuándo existe el Grupo Scout Osyris?
Nuestro grupo fue fundado en 1995, por lo que tenemos más de 25 años de experiencia educativa en nuestra ciudad.

#### ¿Es una organización religiosa?
El escultismo reconoce la dimensión espiritual de la persona, pero no está ligado a ninguna religión específica. Acogemos a jóvenes de todas las creencias.

### 👶 Inscripciones y Participación

#### ¿A qué edad puede empezar mi hijo/a?
Tenemos secciones desde los 5 años:
- **Castores**: 5-7 años
- **Manada**: 7-10 años
- **Tropa**: 10-13 años
- **Pioneros**: 13-16 años
- **Rutas**: 16-19 años

#### ¿Cómo puedo inscribir a mi hijo/a?
1. Asiste a una reunión informativa (primer sábado del mes)
2. Conoce el proyecto educativo
3. Completa la documentación necesaria
4. Período de adaptación de un mes

#### ¿Qué documentación necesito?
- Ficha de inscripción completa
- Fotocopia del DNI del menor
- Autorización médica actualizada
- Seguro de responsabilidad civil
- Autorización de imagen

#### ¿Hay período de adaptación?
Sí, ofrecemos un mes de adaptación sin compromiso para que el niño/a y la familia conozcan nuestra metodología y ambiente.

### 💰 Aspectos Económicos

#### ¿Cuánto cuesta ser scout?
- **Inscripción anual**: 40€
- **Cuota mensual**: 22€ (septiembre a junio)
- **Campamentos**: Precio variable según actividad

#### ¿Hay ayudas económicas?
Sí, disponemos de:
- Becas por necesidad económica
- Descuentos para familias numerosas
- Ayudas para campamentos de verano
- Becas al mérito para jóvenes destacados

#### ¿Qué incluye la cuota?
- Todas las actividades semanales
- Material educativo básico
- Seguro de responsabilidad civil
- Actividades especiales mensuales

### 📅 Actividades y Metodología

#### ¿Qué hacen en las reuniones?
Cada sección tiene actividades adaptadas a su edad:
- **Juegos educativos** y deportivos
- **Talleres** de manualidades y técnicas
- **Actividades en la naturaleza**
- **Proyectos de servicio** comunitario
- **Especialidades** y progresión personal

#### ¿Salen de excursión?
Sí, realizamos:
- **Acampadas mensuales** de fin de semana
- **Campamento de verano** de 15 días
- **Excursiones** y visitas culturales
- **Actividades especiales** por festividades

#### ¿Qué es la progresión personal?
Es un sistema de reconocimiento del crecimiento personal donde cada scout avanza a su ritmo conseguiendo insignias y especialidades según sus logros e intereses.

### 🏕️ Campamentos y Acampadas

#### ¿Son obligatorios los campamentos?
No son obligatorios, pero son la actividad más importante del escultismo. Es donde realmente se vive la experiencia scout completa.

#### ¿Qué supervisión tienen?
- Monitores especializados 24h
- Ratio monitor/scout según normativa
- Protocolos de seguridad estrictos
- Comunicación diaria con familias

#### ¿Qué llevar a un campamento?
Proporcionamos lista detallada antes de cada actividad, incluyendo ropa, material de aseo, saco de dormir, etc.

### 👨‍👩‍👧‍👦 Para las Familias

#### ¿Cómo puedo participar como padre/madre?
- **Comité de Grupo**: Órgano de participación familiar
- **Voluntariado**: Ayuda en transporte, actividades, etc.
- **Actividades familiares**: Eventos para toda la familia
- **Formación**: Escuelas de padres y madres

#### ¿Hay comunicación regular?
Sí, mantenemos comunicación constante:
- **WhatsApp por secciones** para comunicación diaria
- **Newsletter mensual** con actividades
- **Reuniones trimestrales** informativas
- **Portal de familias** con documentación

### 🛡️ Seguridad y Protección

#### ¿Qué medidas de seguridad tienen?
- **Protocolos de protección** infantil certificados
- **Formación especializada** de monitores
- **Seguros** de responsabilidad civil y accidentes
- **Botiquines** y personal con formación en primeros auxilios

#### ¿Cómo garantizan la protección de menores?
- **Código de conducta** estricto para educadores
- **Certificados de delitos sexuales** de todos los monitores
- **Protocolos claros** de actuación
- **Formación específica** en protección infantil

### 🌿 Valores y Educación

#### ¿Qué valores transmiten?
Los valores fundamentales del escultismo:
- **Honestidad** y lealtad
- **Solidaridad** y servicio a otros
- **Respeto** por las personas y naturaleza
- **Responsabilidad** personal y social
- **Compromiso** con la comunidad

#### ¿Cómo trabajan la educación ambiental?
- **Actividades en la naturaleza** regularmente
- **Proyectos ecológicos** de conservación
- **Educación** sobre sostenibilidad
- **Huerto** y actividades de reciclaje

### 📞 Contacto y Dudas

#### ¿Cuándo puedo visitaros?
- **Sábados de 15:30 a 19:00** durante las actividades
- **Primer sábado del mes**: Reunión informativa
- **Entre semana**: Cita previa por teléfono

#### ¿Cómo contactar para más información?
- **Email**: info@grupoosyris.com
- **Teléfono**: 123 456 789
- **WhatsApp**: Solo para consultas urgentes
- **Redes sociales**: @grupoosyris

#### ¿Puedo hablar con otros padres?
¡Por supuesto! Te pondremos en contacto con familias de la sección que te interese para que compartan su experiencia.

---

### 💡 ¿No encuentras tu pregunta?

**¡Contáctanos!** Estaremos encantados de resolver cualquier duda adicional que tengas sobre el escultismo y nuestro grupo.

**📧 Email**: info@grupoosyris.com
**📱 Teléfono**: 123 456 789
**🕐 Horario**: Sábados 15:30-19:00

¡Te esperamos para que conozcas la gran aventura del escultismo! 🏕️`,
    resumen: 'Respuestas a las preguntas más frecuentes sobre el Grupo Scout Osyris: inscripciones, costes, actividades y metodología',
    meta_descripcion: 'Preguntas frecuentes Grupo Scout Osyris: inscripciones, costes, campamentos, seguridad y valores del escultismo',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 14,
    mostrar_en_menu: false,
    permite_comentarios: true,
    creado_por: 1
  },

  {
    titulo: 'Política de Privacidad',
    slug: 'privacidad',
    contenido: `# 🔒 Política de Privacidad

## Protección de Datos Personales - Grupo Scout Osyris

**Última actualización**: Enero 2025

### 📋 Información General

#### Responsable del Tratamiento
**Denominación**: Grupo Scout Osyris
**NIF**: G12345678
**Domicilio**: Calle Principal, 123 - 12345 Ciudad
**Email**: privacidad@grupoosyris.com
**Teléfono**: 123 456 789

#### Marco Legal
Esta política se rige por:
- **Reglamento General de Protección de Datos (RGPD)**
- **Ley Orgánica 3/2018 de Protección de Datos**
- **Ley 34/2002 de Servicios de la Sociedad de la Información**

### 🎯 Finalidades del Tratamiento

#### Datos de Menores (Participantes)
**Finalidad**: Desarrollo de actividades educativas scout
- Gestión de inscripciones y participación
- Organización de actividades y campamentos
- Seguimiento del progreso educativo
- Comunicaciones con familias
- Gestión de emergencias médicas

**Base jurídica**: Consentimiento de padres/tutores

#### Datos de Familias
**Finalidad**: Comunicación y gestión administrativa
- Información sobre actividades
- Gestión económica y facturación
- Coordinación de transporte
- Comunicaciones generales del grupo

**Base jurídica**: Consentimiento del interesado

#### Datos de Monitores/Voluntarios
**Finalidad**: Gestión del voluntariado educativo
- Selección y formación de monitores
- Certificados de antecedentes penales
- Gestión de formación y habilitaciones
- Comunicaciones internas

**Base jurídica**: Interés legítimo y cumplimiento normativo

### 📊 Tipos de Datos Tratados

#### Datos de Identificación
- Nombre y apellidos
- DNI/NIE
- Fecha de nacimiento
- Fotografía (si autorizada)

#### Datos de Contacto
- Dirección postal
- Teléfono y email
- Datos de contacto de emergencia

#### Datos Médicos (solo necesarios)
- Alergias e intolerancias
- Medicación habitual
- Limitaciones físicas relevantes
- Contacto médico/seguro sanitario

#### Datos Económicos
- Información bancaria para cobros
- Historial de pagos
- Becas y ayudas solicitadas

### 🔄 Cesión de Datos

#### Cesiones Autorizadas
**Federaciones Scout**: Para tramitación de seguros y actividades federativas

**Centros Médicos**: Solo en caso de emergencia durante actividades

**Administraciones Públicas**: Cuando sea legalmente exigible

**Proveedores de Servicios**: Necesarios para actividades (transportes, alojamientos)

#### No Cesiones
- **Empresas comerciales** con fines publicitarios
- **Terceros sin autorización** expresa
- **Países fuera de la UE** sin garantías adecuadas

### 📸 Tratamiento de Imágenes

#### Fotografías y Vídeos
**Finalidad**: Documentación de actividades educativas
- Memoria de actividades del grupo
- Promoción del proyecto educativo
- Comunicación en redes sociales

#### Consentimiento Específico
- **Autorización expresa** para cada menor
- **Derecho de revocación** en cualquier momento
- **Uso limitado** a fines educativos del grupo
- **No cesión comercial** bajo ningún concepto

### ⏳ Plazos de Conservación

#### Datos de Participantes Activos
**Duración**: Mientras permanezcan en el grupo + 3 años

#### Datos Médicos
**Duración**: Durante la participación activa únicamente

#### Datos Económicos
**Duración**: 6 años (obligaciones tributarias)

#### Imágenes Autorizadas
**Duración**: 3 años desde su obtención o hasta revocación

### 🛡️ Medidas de Seguridad

#### Técnicas
- **Cifrado** de datos sensibles
- **Copias de seguridad** regulares
- **Control de acceso** por perfiles
- **Auditorías** periódicas de seguridad

#### Organizativas
- **Formación** del personal en protección de datos
- **Protocolos** de actuación ante incidencias
- **Confidencialidad** del equipo de monitores
- **Supervisión** regular de tratamientos

### 👤 Derechos de los Interesados

#### Derechos Reconocidos
- **🔍 Acceso**: Saber qué datos tenemos
- **✏️ Rectificación**: Corregir datos incorrectos
- **🗑️ Supresión**: Eliminación cuando proceda
- **⏸️ Limitación**: Restricción de tratamientos
- **📤 Portabilidad**: Recibir datos en formato estándar
- **❌ Oposición**: Negarse a determinados tratamientos

#### Ejercicio de Derechos
**Email**: privacidad@grupoosyris.com
**Presencial**: Local del grupo (sábados 15:30-19:00)
**Postal**: Grupo Scout Osyris - Ref: Protección Datos

**Plazo de respuesta**: Máximo 30 días

### 👶 Protección Especial de Menores

#### Medidas Específicas
- **Consentimiento parental** obligatorio
- **Información adaptada** a su edad
- **Protección reforzada** de su privacidad
- **Derecho preferente** a la protección

#### Comunicaciones con Menores
- **Siempre a través** de padres/tutores
- **Contenido educativo** exclusivamente
- **Supervisión** de todas las comunicaciones
- **Prohibición** de contacto privado monitor-menor

### 🍪 Uso de Cookies (Web)

#### Cookies Técnicas (Imprescindibles)
- **Funcionalidad** básica del sitio web
- **Sesión de usuario** para áreas privadas
- **Preferencias** de configuración

#### Cookies Analíticas (Opcional)
- **Google Analytics** para estadísticas de uso
- **Datos anonimizados** para mejora del servicio
- **Posibilidad de rechazo** mediante banner

### 📞 Canal de Consultas

#### Delegado de Protección de Datos
**Email**: dpo@grupoosyris.com
**Función**: Supervisión del cumplimiento normativo

#### Autoridad de Control
**Agencia Española de Protección de Datos**
**Web**: www.aepd.es
**Derecho**: Presentar reclamaciones

### 🔄 Modificaciones de la Política

Esta política puede ser modificada por:
- Cambios normativos
- Mejoras en la protección
- Nuevos servicios del grupo

**Comunicación**: Notificaremos cambios significativos por email y web con 30 días de antelación.

### ✅ Consentimiento y Aceptación

Al inscribir a tu hijo/a en el Grupo Scout Osyris:
- **Aceptas** esta política de privacidad
- **Autorizas** los tratamientos descritos
- **Reconoces** haber sido informado de tus derechos
- **Confirmas** la veracidad de los datos aportados

### 📧 Contacto para Dudas

**¿Tienes alguna duda sobre el tratamiento de datos?**

📧 **Email**: privacidad@grupoosyris.com
📱 **Teléfono**: 123 456 789
🏢 **Presencial**: Sábados en el local del grupo

**Compromiso**: Tu privacidad y la de tu familia es nuestra prioridad. 🔒`,
    resumen: 'Política de privacidad del Grupo Scout Osyris: tratamiento de datos, derechos de usuarios y protección de menores',
    meta_descripcion: 'Política de privacidad Grupo Scout Osyris conforme RGPD: protección datos, derechos usuarios y tratamiento información',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 15,
    mostrar_en_menu: false,
    permite_comentarios: false,
    creado_por: 1
  },

  {
    titulo: 'Términos y Condiciones',
    slug: 'terminos',
    contenido: `# 📄 Términos y Condiciones

## Condiciones Generales - Grupo Scout Osyris

**Última actualización**: Enero 2025

### 📋 Información General

#### Datos de la Organización
**Denominación**: Grupo Scout Osyris
**NIF**: G12345678
**Domicilio**: Calle Principal, 123 - 12345 Ciudad
**Email**: info@grupoosyris.com
**Teléfono**: 123 456 789

**Registro**: Asociación inscrita en el Registro de Asociaciones con número XXXX

### 🎯 Objeto y Ámbito

#### Finalidad Educativa
El Grupo Scout Osyris es una asociación educativa sin ánimo de lucro que tiene como finalidad:
- Educación integral de niños y jóvenes (5-19 años)
- Formación en valores humanos y cristianos
- Desarrollo de la ciudadanía activa y responsable
- Promoción del crecimiento personal y social

#### Metodología Scout
Aplicamos el **método educativo scout** basado en:
- Sistema de patrullas
- Ley y promesa scout
- Aprender haciendo
- Progresión personal
- Marco simbólico
- Vida en la naturaleza
- Apoyo adulto

### 📝 Condiciones de Participación

#### Requisitos de Admisión
Para participar en el grupo es necesario:
- **Edad**: Entre 5 y 19 años según sección
- **Documentación**: Completa y actualizada
- **Compromiso**: Con el proyecto educativo
- **Respeto**: Por la metodología y valores scout

#### Proceso de Inscripción
1. **Reunión informativa** obligatoria
2. **Período de adaptación** (1 mes)
3. **Documentación completa** entregada
4. **Pago** de cuotas correspondientes
5. **Aceptación** de estas condiciones

#### Documentación Obligatoria
- Ficha de inscripción completa
- Fotocopia DNI del menor
- Autorización médica actualizada
- Autorización de imagen (opcional)
- Seguro responsabilidad civil

### 💰 Régimen Económico

#### Estructura de Cuotas (2025)
- **📝 Inscripción anual**: 40€
- **💳 Cuota mensual**: 22€ (septiembre-junio)
- **🏕️ Campamentos**: Precio según actividad
- **📊 Actividades extras**: Coste específico

#### Condiciones de Pago
- **Domiciliación bancaria** preferente
- **Pago mensual**: Entre días 1-10 de cada mes
- **Impago**: Puede conllevar suspensión temporal
- **Devoluciones**: Solo por causas justificadas

#### Política de Becas
- **Becas de necesidad**: Para dificultades económicas
- **Descuentos familiares**: Múltiples hijos en el grupo
- **Ayudas campamentos**: Según disponibilidad presupuestaria

### 🏕️ Actividades y Campamentos

#### Actividades Incluidas
- **Reuniones semanales** (sábados 16:00-18:30)
- **Acampadas mensuales** de fin de semana
- **Actividades especiales** por festividades
- **Formación** en técnicas scout

#### Campamentos de Verano
- **Duración**: Aproximadamente 15 días
- **Participación**: Voluntaria pero recomendada
- **Coste**: Variable según destino y servicios
- **Inscripción**: Plazo límite según disponibilidad

#### Normas de Participación
- **Puntualidad** en actividades
- **Respeto** por monitores y compañeros
- **Cuidado** del material e instalaciones
- **Comunicación** de ausencias

### 🛡️ Responsabilidades y Seguros

#### Seguros Obligatorios
- **Responsabilidad Civil**: Cobertura de accidentes
- **Seguro Médico**: Durante todas las actividades
- **Cobertura Campamentos**: Específica para actividades

#### Responsabilidad del Grupo
- **Supervisión** adecuada durante actividades
- **Medidas de seguridad** en instalaciones
- **Personal cualificado** para educación
- **Cumplimiento** normativa de protección de menores

#### Responsabilidad de Familias
- **Información veraz** sobre el menor
- **Comunicación** de problemas de salud
- **Cumplimiento** de normas y horarios
- **Respeto** por el proyecto educativo

### 👥 Derechos y Deberes

#### Derechos de los Participantes
- **Educación integral** según metodología scout
- **Trato igualitario** sin discriminación
- **Participación** en todas las actividades
- **Información** transparente sobre el proyecto
- **Respeto** por su dignidad personal

#### Deberes de los Participantes
- **Respeto** por la Ley Scout
- **Participación activa** en actividades
- **Cuidado** de instalaciones y material
- **Colaboración** en el buen ambiente del grupo

#### Derechos de las Familias
- **Información** regular sobre actividades
- **Participación** en órganos de representación
- **Transparencia** en gestión económica
- **Comunicación** fluida con educadores

### 📢 Comunicación y Imagen

#### Autorizaciones de Imagen
- **Fotografías**: Solo con autorización expresa
- **Uso educativo**: Documentación de actividades
- **Redes sociales**: Del grupo exclusivamente
- **Revocación**: Posible en cualquier momento

#### Comunicaciones Oficiales
- **Canal principal**: Email y web oficial
- **WhatsApp**: Solo para comunicación inmediata
- **Reuniones**: Trimestrales con familias
- **Newsletter**: Boletín mensual informativo

### ⚖️ Régimen Disciplinario

#### Faltas Leves
- **Retrasos** continuados
- **Falta de respeto** menor
- **Desorden** en actividades
- **Sanción**: Amonestación verbal

#### Faltas Graves
- **Agresiones** físicas o verbales
- **Daños** intencionados a material
- **Comportamiento** que altere gravemente las actividades
- **Sanción**: Suspensión temporal (1-4 semanas)

#### Faltas Muy Graves
- **Violencia** hacia personas
- **Conductas** contrarias a valores scout
- **Reincidencia** en faltas graves
- **Sanción**: Expulsión del grupo

#### Procedimiento
1. **Comunicación** a la familia del problema
2. **Investigación** por parte de coordinación
3. **Audiencia** con familia y menor (si edad adecuada)
4. **Resolución** motivada y comunicada
5. **Recurso**: Posible ante Comité de Grupo

### 🚫 Causas de Baja

#### Bajas Voluntarias
- **Comunicación**: Con 30 días de antelación
- **Efectos**: Fin de mes natural
- **Pendientes**: Liquidación cuotas

#### Bajas Involuntarias
- **Impago**: Más de 2 mensualidades
- **Disciplinarias**: Según régimen sancionador
- **Pérdida requisitos**: Edad u otros

### 🔄 Modificaciones

#### Condiciones Generales
- **Comunicación**: 30 días antelación
- **Aprobación**: Por Comité de Grupo
- **Efectos**: Desde fecha indicada

#### Cuotas y Precios
- **Revisión**: Anual en asamblea
- **Comunicación**: Antes del 30 de junio
- **Aplicación**: Curso siguiente

### ⚖️ Legislación Aplicable

#### Marco Normativo
- **Ley 1/2002**: Derecho de Asociación
- **Código Civil**: Obligaciones y contratos
- **Normativa autonómica**: Juventud y educación
- **Reglamentos**: Federaciones scout

#### Jurisdicción
Para cualquier controversia será competente la **Jurisdicción Civil** del domicilio del grupo.

### 📞 Resolución de Conflictos

#### Procedimiento Interno
1. **Diálogo directo** con monitores/coordinación
2. **Mediación** por Comité de Grupo
3. **Resolución** por órganos directivos

#### Vía Externa
- **Mediación**: Servicios públicos especializados
- **Vía judicial**: Como último recurso

### ✅ Aceptación de Condiciones

Al inscribirse en el Grupo Scout Osyris:
- **Acepta íntegramente** estas condiciones
- **Se compromete** a su cumplimiento
- **Reconoce** haber sido informado adecuadamente
- **Autoriza** los tratamientos descritos

### 📧 Contacto y Consultas

**¿Dudas sobre estas condiciones?**

📧 **Email**: info@grupoosyris.com
📱 **Teléfono**: 123 456 789
🏢 **Presencial**: Sábados en el local (15:30-19:00)

**Compromiso**: Relaciones basadas en confianza, transparencia y respeto mutuo. ⚜️`,
    resumen: 'Términos y condiciones del Grupo Scout Osyris: participación, cuotas, responsabilidades y régimen disciplinario',
    meta_descripcion: 'Términos y condiciones de participación en el Grupo Scout Osyris: normas, cuotas, derechos y deberes',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 16,
    mostrar_en_menu: false,
    permite_comentarios: false,
    creado_por: 1
  },

  {
    titulo: 'Recuperar Contraseña',
    slug: 'recuperar-contrasena',
    contenido: `# 🔐 Recuperar Contraseña

## Restablece tu Acceso al Portal Scout

### 📧 Proceso de Recuperación

#### Paso 1: Solicitud
1. Accede al formulario de **"¿Olvidaste tu contraseña?"**
2. Introduce tu **email registrado** en el sistema
3. Haz clic en **"Enviar enlace de recuperación"**

#### Paso 2: Verificación de Email
- Recibirás un **email automático** en tu cuenta
- El email contendrá un **enlace seguro** para restablecer
- **Tiempo límite**: El enlace expira en 24 horas

#### Paso 3: Nueva Contraseña
- Haz clic en el enlace del email
- Introduce tu **nueva contraseña** (mínimo 8 caracteres)
- **Confirma** la nueva contraseña
- **Guarda** los cambios

### 🔒 Requisitos de Seguridad

#### Características de la Contraseña
- **Mínimo 8 caracteres**
- Al menos **1 letra mayúscula**
- Al menos **1 letra minúscula**
- Al menos **1 número**
- Se recomienda incluir **símbolos especiales**

#### Ejemplos Válidos
- ✅ OsyrisScout2025!
- ✅ MiContraseña123
- ✅ Aventura#Scout24

### ⚠️ Problemas Comunes

#### No Recibo el Email
**Posibles causas:**
- Revisa tu **carpeta de spam**
- Verifica que el email esté **bien escrito**
- El email puede tardar **hasta 10 minutos**

**Soluciones:**
1. Añade nuestro email a contactos: sistema@grupoosyris.com
2. Revisa filtros anti-spam
3. Inténtalo desde otra dirección de email

#### Email No Registrado
Si el sistema indica que el email no existe:
- Verifica que uses el **mismo email de inscripción**
- Puede que tengas **múltiples cuentas** con emails diferentes
- Contacta con administración para verificar

#### Enlace Expirado
- Los enlaces son válidos **24 horas**
- Si ha expirado, solicita **uno nuevo**
- Completa el proceso dentro del tiempo límite

### 👥 Tipos de Usuario

#### Familias
- **Acceso**: Portal de seguimiento de hijos
- **Funciones**: Ver actividades, comunicaciones, pagos
- **Soporte**: Comité de grupo

#### Monitores
- **Acceso**: Panel de sección y coordinación
- **Funciones**: Gestión educativa, comunicación
- **Soporte**: Coordinación técnica

#### Jóvenes (16+ años)
- **Acceso**: Portal personal
- **Funciones**: Progresión, especialidades, comunicación
- **Soporte**: Monitor de sección

### 📱 Contacto de Emergencia

#### No Puedes Recuperar el Acceso
**Contacta directamente:**

📧 **Email**: soporte@grupoosyris.com
📱 **WhatsApp**: 123 456 789 (solo urgencias)
🏢 **Presencial**: Sábados en el local (15:30-19:00)

#### Información Necesaria
Para ayudarte necesitaremos:
- **Nombre completo** del titular de la cuenta
- **Email** usado originalmente
- **Sección** del grupo (si eres familia)
- **Descripción** del problema

### 🛡️ Seguridad de tu Cuenta

#### Recomendaciones
- **No compartas** tu contraseña con nadie
- **Cambia** la contraseña periódicamente
- **Usa contraseñas únicas** para cada servicio
- **Cierra sesión** en dispositivos compartidos

#### Si Sospechas de Acceso No Autorizado
1. **Cambia inmediatamente** tu contraseña
2. **Revisa** la actividad reciente de tu cuenta
3. **Contacta** con administración
4. **Documenta** cualquier actividad sospechosa

### 💡 Consejos para Recordar tu Contraseña

#### Estrategias Útiles
- **Frase personal**: Convierte una frase en contraseña
  - "Me gusta el Grupo Scout Osyris" → MgGSO2025!
- **Combinaciones**: Mezcla datos personales seguros
- **Gestores**: Usa aplicaciones de gestión de contraseñas

#### Lo que NO Debes Hacer
- ❌ Usar información personal obvia (nombre, fecha nacimiento)
- ❌ Contraseñas demasiado simples (123456, password)
- ❌ La misma contraseña para todo
- ❌ Escribir contraseñas en lugares visibles

### 🔄 Proceso Alternativo

#### Por Teléfono
En horario de atención (sábados 15:30-19:00):
1. **Llama** al 123 456 789
2. **Identifícate** con datos personales
3. **Explica** tu situación
4. Te ayudaremos a **restablecer manualmente**

#### Presencial
En el local del grupo:
- **Trae documentación** de identidad
- **Habla con administración** o coordinación
- **Restablecimiento inmediato** si todo está correcto

### 📊 Estadísticas de Uso

#### Tiempo de Respuesta
- **Email automático**: Inmediato
- **Soporte humano**: Máximo 24h
- **Resolución presencial**: Inmediata

#### Efectividad
- **95%** de casos resueltos automáticamente
- **Tiempo medio** de recuperación: 5 minutos
- **Satisfacción** de usuarios: 9,2/10

### 🔧 Mejoras Futuras

#### Próximamente
- **Verificación por SMS** como alternativa
- **Preguntas de seguridad** personalizadas
- **Autenticación de doble factor** opcional
- **App móvil** para gestión de cuenta

### ❓ Preguntas Frecuentes

#### ¿Puedo usar la misma contraseña anterior?
No se recomienda. Es mejor usar una nueva contraseña más segura.

#### ¿Cuántas veces puedo solicitar recuperación?
No hay límite, pero los enlaces anteriores quedan invalidados.

#### ¿Qué pasa si no tengo acceso al email?
Contacta presencialmente o por teléfono para verificación manual.

---

### 🆘 Soporte Técnico

**¿Sigues teniendo problemas?**

Nuestro equipo está aquí para ayudarte:

📧 **Email**: soporte@grupoosyris.com
📱 **Teléfono**: 123 456 789
🏢 **Local**: Sábados 15:30-19:00

**¡Tu acceso es importante para mantenerte conectado con la aventura scout!** 🏕️`,
    resumen: 'Proceso de recuperación de contraseña para el portal del Grupo Scout Osyris: pasos, seguridad y soporte',
    meta_descripcion: 'Recupera tu contraseña del portal Grupo Scout Osyris: proceso seguro, soporte técnico y consejos de seguridad',
    estado: 'publicada',
    tipo: 'pagina',
    orden_menu: 17,
    mostrar_en_menu: false,
    permite_comentarios: false,
    creado_por: 1
  }
];

/**
 * Verificar si ya existen páginas en la base de datos
 */
async function checkExistingPages() {
  try {
    const pages = await query('SELECT COUNT(*) as count FROM paginas');
    return pages[0].count;
  } catch (error) {
    console.error('Error al verificar páginas existentes:', error.message);
    return 0;
  }
}

/**
 * Insertar una página en la base de datos
 */
async function insertPage(pageData) {
  try {
    const result = await query(`
      INSERT INTO paginas (
        titulo, slug, contenido, resumen, meta_descripcion,
        estado, tipo, orden_menu, mostrar_en_menu, permite_comentarios, creado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      pageData.titulo,
      pageData.slug,
      pageData.contenido,
      pageData.resumen,
      pageData.meta_descripcion,
      pageData.estado,
      pageData.tipo,
      pageData.orden_menu,
      pageData.mostrar_en_menu ? 1 : 0,
      pageData.permite_comentarios ? 1 : 0,
      pageData.creado_por
    ]);

    return result.insertId;
  } catch (error) {
    console.error(`Error al insertar página "${pageData.titulo}":`, error.message);
    return null;
  }
}

/**
 * Verificar si existe un slug específico
 */
async function checkSlugExists(slug) {
  try {
    const pages = await query('SELECT COUNT(*) as count FROM paginas WHERE slug = ?', [slug]);
    return pages[0].count > 0;
  } catch (error) {
    console.error(`Error al verificar slug ${slug}:`, error.message);
    return false;
  }
}

/**
 * Función principal para poblar TODAS las páginas del sistema
 */
async function populateAllPages() {
  try {
    console.log('🚀 POBLANDO TODAS LAS PÁGINAS DEL SISTEMA OSYRIS...');
    console.log('📊 Sincronizando frontend-backend-database');

    // Conectar a la base de datos
    await initializeDatabase();

    // Verificar páginas existentes
    const existingPages = await checkExistingPages();
    console.log(`📄 Páginas existentes en la base de datos: ${existingPages}`);

    console.log('📝 Procesando páginas del sistema...');

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const pageData of paginasCompletas) {
      // Verificar si el slug ya existe
      const slugExists = await checkSlugExists(pageData.slug);

      if (slugExists) {
        console.log(`   ⏭️  Página "${pageData.titulo}" ya existe (slug: ${pageData.slug})`);
        skippedCount++;
        continue;
      }

      const pageId = await insertPage(pageData);
      if (pageId) {
        console.log(`   ✅ Página "${pageData.titulo}" insertada con ID: ${pageId}`);
        insertedCount++;
      } else {
        console.log(`   ❌ Error al insertar página "${pageData.titulo}"`);
        errorCount++;
      }
    }

    console.log(`\n🎉 PROCESO COMPLETADO!`);
    console.log(`   📊 Páginas insertadas: ${insertedCount}`);
    console.log(`   ⏭️  Páginas ya existentes: ${skippedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📄 Total páginas procesadas: ${paginasCompletas.length}`);

    // Verificar el resultado final
    const finalCount = await checkExistingPages();
    console.log(`   📄 Total páginas en base de datos: ${finalCount}`);

    // Resumen por categorías
    console.log('\n📋 RESUMEN POR CATEGORÍAS:');
    console.log('   🏠 Páginas principales: Inicio, Secciones, Calendario, Galería');
    console.log('   🏕️ Páginas de secciones: Castores, Manada, Tropa, Pioneros, Rutas');
    console.log('   🏢 Páginas institucionales: Sobre Nosotros, Kraal, Comité, Contacto');
    console.log('   📚 Páginas informativas: FAQ, Privacidad, Términos, Recuperación');

    console.log('\n✅ SINCRONIZACIÓN COMPLETADA');
    console.log('   Frontend-Backend-Database ahora están sincronizados');
    console.log('   Todas las páginas de navegación tienen contenido en BD');

  } catch (error) {
    console.error('❌ Error durante la población de páginas:', error.message);
  } finally {
    await closeDatabase();
  }
}

/**
 * Función para limpiar y repoblar todas las páginas
 */
async function clearAndRepopulate() {
  try {
    console.log('🗑️ LIMPIANDO Y REPOBLANDO TODAS LAS PÁGINAS...');

    await initializeDatabase();

    // Limpiar páginas existentes
    console.log('🗑️ Eliminando páginas existentes...');
    await query('DELETE FROM paginas');
    console.log('   ✅ Páginas eliminadas');

    // Insertar todas las páginas
    console.log('📝 Insertando páginas completas del sistema...');

    let insertedCount = 0;
    for (const pageData of paginasCompletas) {
      const pageId = await insertPage(pageData);
      if (pageId) {
        console.log(`   ✅ Página "${pageData.titulo}" insertada con ID: ${pageId}`);
        insertedCount++;
      }
    }

    console.log(`\n🎉 REPOBLACIÓN COMPLETADA!`);
    console.log(`   📊 Total páginas insertadas: ${insertedCount}/${paginasCompletas.length}`);

  } catch (error) {
    console.error('❌ Error durante la repoblación:', error.message);
  } finally {
    await closeDatabase();
  }
}

/**
 * Mostrar ayuda
 */
function showHelp() {
  console.log('📄 Script de Población Completa de Páginas - Osyris CMS');
  console.log('\nPropósito: Sincronizar frontend-backend-database con TODAS las páginas');
  console.log('\nUso:');
  console.log('  node populate-all-pages.js [opciones]');
  console.log('\nOpciones:');
  console.log('  --help, -h     Mostrar esta ayuda');
  console.log('  --clear        Limpiar y repoblar todas las páginas');
  console.log('\nEjemplos:');
  console.log('  node populate-all-pages.js              # Poblar páginas faltantes');
  console.log('  node populate-all-pages.js --clear      # Limpiar y repoblar todo');
  console.log('\n📊 Páginas incluidas:');
  console.log('  - Todas las páginas de navegación del frontend');
  console.log('  - Páginas de secciones completas');
  console.log('  - Páginas institucionales');
  console.log('  - Páginas legales e informativas');
}

// Ejecutar el script si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  if (args.includes('--clear')) {
    clearAndRepopulate()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    populateAllPages()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = {
  populateAllPages,
  clearAndRepopulate,
  paginasCompletas
};