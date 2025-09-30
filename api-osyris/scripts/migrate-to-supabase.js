#!/usr/bin/env node
/**
 * 🚀 MIGRACIÓN COMPLETA DE SQLite A SUPABASE
 * Este script migra todos los datos del sistema local a Supabase
 */

require('dotenv').config();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuración
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.log('Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_KEY en tu .env');
  process.exit(1);
}

// Cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Database Manager local (SQLite)
const dbManager = require('../src/config/database.manager');

async function migrateData() {
  console.log('🚀 Iniciando migración completa a Supabase...\n');

  try {
    // Verificar conexión a Supabase
    console.log('🔍 Verificando conexión a Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('secciones')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Error conectando a Supabase:', testError.message);
      return;
    }

    console.log('✅ Conexión a Supabase verificada\n');

    // Inicializar base de datos local
    console.log('🔍 Conectando a base de datos SQLite local...');
    await dbManager.initialize();
    console.log('✅ Conexión a SQLite establecida\n');

    // 1. MIGRAR SECCIONES
    console.log('📋 1. Migrando secciones...');
    const secciones = await dbManager.getAllSections();

    if (secciones.length > 0) {
      const { data: supabaseSecciones, error: seccionesError } = await supabase
        .from('secciones')
        .upsert(secciones.map(s => ({
          id: s.id,
          nombre: s.nombre,
          descripcion: s.descripcion,
          edad_minima: s.edad_minima,
          edad_maxima: s.edad_maxima,
          color_principal: s.color_principal,
          color_secundario: s.color_secundario,
          logo_url: s.logo_url,
          activa: s.activa || true,
          orden: s.orden || 0
        })))
        .select();

      if (seccionesError) {
        console.error('❌ Error migrando secciones:', seccionesError.message);
      } else {
        console.log(`✅ ${secciones.length} secciones migradas`);
      }
    } else {
      console.log('⚠️  No hay secciones para migrar');
    }

    // 2. MIGRAR USUARIOS
    console.log('\n👥 2. Migrando usuarios...');
    const usuarios = await dbManager.getAllUsers();

    if (usuarios.length > 0) {
      const { data: supabaseUsuarios, error: usuariosError } = await supabase
        .from('usuarios')
        .upsert(usuarios.map(u => ({
          id: u.id,
          nombre: u.nombre,
          apellidos: u.apellidos,
          email: u.email,
          telefono: u.telefono,
          contraseña: u.contraseña || u.password,
          rol: u.rol,
          seccion_id: u.seccion_id,
          activo: u.activo === 1 || u.activo === true,
          fecha_registro: u.fecha_registro || new Date().toISOString(),
          ultimo_acceso: u.ultimo_acceso,
          foto_perfil: u.foto_perfil,
          fecha_nacimiento: u.fecha_nacimiento,
          direccion: u.direccion,
          dni: u.dni
        })))
        .select();

      if (usuariosError) {
        console.error('❌ Error migrando usuarios:', usuariosError.message);
      } else {
        console.log(`✅ ${usuarios.length} usuarios migrados`);
      }
    }

    // 3. MIGRAR PÁGINAS
    console.log('\n📄 3. Migrando páginas...');
    const paginas = await dbManager.getAllPages();

    if (paginas.length > 0) {
      const { data: supabasePaginas, error: paginasError } = await supabase
        .from('paginas')
        .upsert(paginas.map(p => ({
          id: p.id,
          titulo: p.titulo,
          slug: p.slug,
          contenido: p.contenido,
          seccion: p.seccion,
          categoria: p.categoria,
          imagen_principal: p.imagen_principal,
          imagenes_galeria: p.imagenes_galeria,
          visible: p.visible === 1 || p.visible === true,
          orden: p.orden || 0,
          meta_descripcion: p.meta_descripcion,
          actualizado_por: p.actualizado_por,
          fecha_creacion: p.fecha_creacion,
          fecha_actualizacion: p.fecha_actualizacion
        })))
        .select();

      if (paginasError) {
        console.error('❌ Error migrando páginas:', paginasError.message);
      } else {
        console.log(`✅ ${paginas.length} páginas migradas`);
      }
    }

    // 4. MIGRAR DOCUMENTOS/ARCHIVOS
    console.log('\n📁 4. Migrando documentos...');
    const documentos = await dbManager.getAllDocuments();

    if (documentos.length > 0) {
      const { data: supabaseDocumentos, error: documentosError } = await supabase
        .from('documentos')
        .upsert(documentos.map(d => ({
          id: d.id,
          titulo: d.titulo,
          descripcion: d.descripcion,
          archivo_nombre: d.archivo_nombre,
          archivo_ruta: d.archivo_ruta,
          tipo_archivo: d.tipo_archivo,
          tamaño_archivo: d.tamaño_archivo || d.size,
          categoria: d.categoria,
          visible_para: d.visible_para || 'todos',
          subido_por: d.subido_por,
          fecha_subida: d.fecha_subida,
          descargas: d.descargas || 0,
          version: d.version
        })))
        .select();

      if (documentosError) {
        console.error('❌ Error migrando documentos:', documentosError.message);
      } else {
        console.log(`✅ ${documentos.length} documentos migrados`);
      }
    }

    // 5. MIGRAR ACTIVIDADES
    console.log('\n📅 5. Migrando actividades...');
    const actividades = await dbManager.getAllActivities();

    if (actividades.length > 0) {
      const { data: supabaseActividades, error: actividadesError } = await supabase
        .from('actividades')
        .upsert(actividades.map(a => ({
          id: a.id,
          titulo: a.titulo,
          descripcion: a.descripcion,
          fecha_inicio: a.fecha_inicio,
          fecha_fin: a.fecha_fin,
          lugar: a.lugar,
          tipo: a.tipo,
          seccion_id: a.seccion_id,
          responsable_id: a.responsable_id,
          cupo_maximo: a.cupo_maximo,
          precio: a.precio,
          inscripcion_abierta: a.inscripcion_abierta === 1 || a.inscripcion_abierta === true,
          material_necesario: a.material_necesario,
          observaciones: a.observaciones,
          fecha_creacion: a.fecha_creacion,
          creado_por: a.creado_por,
          estado: a.estado || 'planificada'
        })))
        .select();

      if (actividadesError) {
        console.error('❌ Error migrando actividades:', actividadesError.message);
      } else {
        console.log(`✅ ${actividades.length} actividades migradas`);
      }
    }

    // 6. MIGRAR MENSAJES
    console.log('\n💬 6. Migrando mensajes...');
    const mensajes = await dbManager.getAllMessages();

    if (mensajes.length > 0) {
      const { data: supabaseMensajes, error: mensajesError } = await supabase
        .from('mensajes')
        .upsert(mensajes.map(m => ({
          id: m.id,
          asunto: m.asunto,
          contenido: m.contenido,
          remitente_id: m.remitente_id,
          tipo_destinatario: m.tipo_destinatario,
          destinatario_id: m.destinatario_id,
          seccion_id: m.seccion_id,
          leido: m.leido === 1 || m.leido === true,
          fecha_envio: m.fecha_envio,
          fecha_lectura: m.fecha_lectura,
          prioridad: m.prioridad || 'normal',
          archivo_adjunto: m.archivo_adjunto
        })))
        .select();

      if (mensajesError) {
        console.error('❌ Error migrando mensajes:', mensajesError.message);
      } else {
        console.log(`✅ ${mensajes.length} mensajes migrados`);
      }
    }

    // RESUMEN
    console.log('\n' + '='.repeat(50));
    console.log('🎉 MIGRACIÓN COMPLETADA');
    console.log('='.repeat(50));

    // Obtener estadísticas finales de Supabase
    const [
      { count: countUsuarios },
      { count: countSecciones },
      { count: countPaginas },
      { count: countDocumentos },
      { count: countActividades },
      { count: countMensajes }
    ] = await Promise.all([
      supabase.from('usuarios').select('*', { count: 'exact', head: true }),
      supabase.from('secciones').select('*', { count: 'exact', head: true }),
      supabase.from('paginas').select('*', { count: 'exact', head: true }),
      supabase.from('documentos').select('*', { count: 'exact', head: true }),
      supabase.from('actividades').select('*', { count: 'exact', head: true }),
      supabase.from('mensajes').select('*', { count: 'exact', head: true })
    ]);

    console.log(`👥 Usuarios en Supabase: ${countUsuarios || 0}`);
    console.log(`🏕️ Secciones en Supabase: ${countSecciones || 0}`);
    console.log(`📄 Páginas en Supabase: ${countPaginas || 0}`);
    console.log(`📁 Documentos en Supabase: ${countDocumentos || 0}`);
    console.log(`📅 Actividades en Supabase: ${countActividades || 0}`);
    console.log(`💬 Mensajes en Supabase: ${countMensajes || 0}`);

    console.log('\n✅ Todos los datos han sido migrados exitosamente a Supabase');
    console.log('\n🔄 Próximo paso: Cambiar configuración a Supabase usando:');
    console.log('   ./scripts/switch-database.sh supabase');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error(error.stack);
  } finally {
    // Cerrar conexión local
    if (dbManager.close) {
      await dbManager.close();
    }
    process.exit(0);
  }
}

// Ejecutar migración
migrateData();