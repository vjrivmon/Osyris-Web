const db = require('./src/config/db.config');

console.log('🏗️ Inicializando base de datos y creando páginas de ejemplo...');

const samplePages = [
  {
    titulo: 'Página de Inicio',
    slug: 'inicio',
    contenido: `# Bienvenidos al Grupo Scout Osyris

Somos una organización scout comprometida con la formación integral de niños y jóvenes a través de la aventura, el juego y la vida en la naturaleza.

## Nuestras Secciones

- **Castores** (5-7 años): Colonia La Veleta
- **Lobatos** (7-10 años): Manada Waingunga
- **Tropa** (10-13 años): Tropa Brownsea
- **Pioneros** (13-16 años): Posta Kanhiwara
- **Rutas** (16-19 años): Ruta Walhalla

¡Únete a la aventura!`,
    resumen: 'Página principal del Grupo Scout Osyris',
    estado: 'publicada',
    tipo: 'pagina',
    mostrar_en_menu: 1
  },
  {
    titulo: 'Sobre Nosotros',
    slug: 'sobre-nosotros',
    contenido: `# Sobre el Grupo Scout Osyris

## Historia

El Grupo Scout Osyris fue fundado con el propósito de brindar una educación integral a través del método scout...

## Nuestra Misión

Contribuir a la educación de los jóvenes, a través de un sistema de valores basado en la Promesa y la Ley Scout...

## Nuestro Local

Contamos con instalaciones completas para el desarrollo de todas nuestras actividades.`,
    resumen: 'Conoce la historia y misión del Grupo Scout Osyris',
    estado: 'publicada',
    tipo: 'pagina',
    mostrar_en_menu: 1
  },
  {
    titulo: 'Contacto',
    slug: 'contacto',
    contenido: `# Contacto

## Información de Contacto

**Dirección:** [Dirección del local]
**Teléfono:** [Número de teléfono]
**Email:** info@grupoosyris.es

## Horarios de Actividades

- Sábados: 16:00 - 19:00
- Domingos: Actividades especiales (según calendario)

## Cómo Llegar

[Información de ubicación y transporte público]`,
    resumen: 'Información de contacto y ubicación',
    estado: 'publicada',
    tipo: 'pagina',
    mostrar_en_menu: 1
  },
  {
    titulo: 'Sección Castores',
    slug: 'castores',
    contenido: `# Colonia La Veleta - Castores

## Edades: 5 a 7 años

Los Castores son los más pequeños de la familia scout. A través del juego y las actividades adaptadas a su edad, los niños desarrollan sus primeras habilidades sociales y aprenden valores fundamentales.

### Actividades Típicas

- Juegos y dinámicas grupales
- Manualidades creativas
- Cuentos y representaciones
- Salidas familiares

### Reuniones

**Cuándo:** Sábados de 16:00 a 18:00
**Dónde:** Local del grupo`,
    resumen: 'Información sobre la sección Castores',
    estado: 'publicada',
    tipo: 'pagina',
    mostrar_en_menu: 1
  },
  {
    titulo: 'Galería de Fotos',
    slug: 'galeria',
    contenido: `# Galería de Fotos

Aquí puedes ver las mejores fotos de nuestras actividades y campamentos.

## Últimas Actividades

[Las imágenes se mostrarán aquí cuando se suban a través del sistema de archivos]

## Campamentos

[Fotos de campamentos y salidas]`,
    resumen: 'Galería de fotos de actividades',
    estado: 'borrador',
    tipo: 'pagina',
    mostrar_en_menu: 0
  }
];

async function setupPages() {
  try {
    // Inicializar base de datos
    console.log('📡 Inicializando conexión a base de datos...');
    await db.initializeDatabase();

    // Verificar páginas existentes
    console.log('🔍 Verificando páginas existentes...');
    const existingPages = await db.query('SELECT COUNT(*) as count FROM paginas');
    const pageCount = existingPages[0]?.count || 0;

    console.log(`📊 Páginas existentes: ${pageCount}`);

    if (pageCount === 0) {
      console.log('📝 Creando páginas de ejemplo...');

      // Crear un usuario admin para asociar las páginas
      const adminUsers = await db.query("SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1");
      let adminUserId = 1; // Default

      if (adminUsers.length === 0) {
        console.log('👤 Creando usuario admin para páginas...');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminResult = await db.query(`
          INSERT INTO usuarios (nombre, apellidos, email, password, rol)
          VALUES (?, ?, ?, ?, ?)
        `, ['Admin', 'Sistema', 'admin@grupoosyris.es', hashedPassword, 'admin']);

        adminUserId = adminResult.insertId;
        console.log(`✅ Usuario admin creado con ID: ${adminUserId}`);
      } else {
        adminUserId = adminUsers[0].id;
        console.log(`✅ Usuario admin encontrado con ID: ${adminUserId}`);
      }

      // Crear páginas de ejemplo
      for (const page of samplePages) {
        try {
          const result = await db.query(`
            INSERT INTO paginas (titulo, slug, contenido, resumen, estado, tipo, mostrar_en_menu, creado_por)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            page.titulo,
            page.slug,
            page.contenido,
            page.resumen,
            page.estado,
            page.tipo,
            page.mostrar_en_menu,
            adminUserId
          ]);

          console.log(`✅ Página creada: ${page.titulo} (ID: ${result.insertId})`);
        } catch (error) {
          console.error(`❌ Error creando página "${page.titulo}":`, error.message);
        }
      }

      console.log('\n🎉 ¡Páginas de ejemplo creadas correctamente!');
    } else {
      console.log('📄 Las páginas ya existen, mostrando las primeras 5:');
      const pages = await db.query('SELECT id, titulo, slug, estado FROM paginas LIMIT 5');
      pages.forEach(p => {
        console.log(`- ${p.id}: ${p.titulo} (/${p.slug}) - ${p.estado}`);
      });
    }

    // Mostrar estadísticas finales
    const finalCount = await db.query('SELECT COUNT(*) as count FROM paginas');
    console.log(`\n📊 Total de páginas en base de datos: ${finalCount[0]?.count || 0}`);

    await db.closeDatabase();
    console.log('\n✅ Setup completado exitosamente');

  } catch (error) {
    console.error('❌ Error durante setup:', error);
    process.exit(1);
  }
}

setupPages();