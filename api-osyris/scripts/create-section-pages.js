// Script para crear páginas de secciones en la base de datos
const { supabase } = require('../src/config/supabase.config');

async function createSectionPages() {
  console.log('📝 Creando páginas de secciones en la base de datos...');

  const sectionPages = [
    {
      titulo: 'Manada - Manada Waingunga',
      slug: 'manada',
      contenido: '# Manada Waingunga\n\nLa sección de Manada del Grupo Scout Osyris.',
      resumen: 'Página de la sección Manada Waingunga',
      estado: 'publicada',
      tipo: 'seccion',
      orden_menu: 2
    },
    {
      titulo: 'Tropa - Tropa Brownsea',
      slug: 'tropa',
      contenido: '# Tropa Brownsea\n\nLa sección de Tropa del Grupo Scout Osyris.',
      resumen: 'Página de la sección Tropa Brownsea',
      estado: 'publicada',
      tipo: 'seccion',
      orden_menu: 3
    },
    {
      titulo: 'Pioneros - Posta Kanhiwara',
      slug: 'pioneros',
      contenido: '# Posta Kanhiwara\n\nLa sección de Pioneros del Grupo Scout Osyris.',
      resumen: 'Página de la sección Posta Kanhiwara',
      estado: 'publicada',
      tipo: 'seccion',
      orden_menu: 4
    },
    {
      titulo: 'Rutas - Ruta Walhalla',
      slug: 'rutas',
      contenido: '# Ruta Walhalla\n\nLa sección de Rutas del Grupo Scout Osyris.',
      resumen: 'Página de la sección Ruta Walhalla',
      estado: 'publicada',
      tipo: 'seccion',
      orden_menu: 5
    }
  ];

  for (const page of sectionPages) {
    try {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('paginas')
        .select('id')
        .eq('slug', page.slug)
        .single();

      if (!existing) {
        const { data, error } = await supabase
          .from('paginas')
          .insert([page]);

        if (error) {
          console.error(`❌ Error creando página ${page.slug}:`, error.message);
        } else {
          console.log(`✅ Página ${page.slug} creada exitosamente`);
        }
      } else {
        console.log(`⚠️ La página ${page.slug} ya existe`);
      }
    } catch (error) {
      console.error(`❌ Error procesando ${page.slug}:`, error.message);
    }
  }

  console.log('✨ Proceso completado');
}

// Ejecutar
createSectionPages().catch(console.error);