// 🏠 CONFIGURACIÓN CON DATABASE MANAGER MEJORADO
const db = require('../config/db.config');
const Joi = require('joi');

/**
 * 🏠 CONTROLADOR DE PÁGINAS - SISTEMA CMS OSYRIS
 * Gestión de páginas de contenido web
 */

// Esquema de validación para crear página
const paginaCreateSchema = Joi.object({
  titulo: Joi.string().min(1).max(255).required(),
  slug: Joi.string().min(1).max(255).required(),
  contenido: Joi.string().allow(''),
  seccion: Joi.string().max(100).allow(''),
  categoria: Joi.string().max(100).allow(''),
  imagen_principal: Joi.string().allow(''),
  imagenes_galeria: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  visible: Joi.boolean(),
  orden: Joi.number().integer().min(0),
  meta_descripcion: Joi.string().allow('')
});

// Esquema de validación para actualizar página
const paginaUpdateSchema = Joi.object({
  titulo: Joi.string().min(1).max(255),
  slug: Joi.string().min(1).max(255),
  contenido: Joi.string().allow(''),
  seccion: Joi.string().max(100).allow(''),
  categoria: Joi.string().max(100).allow(''),
  imagen_principal: Joi.string().allow(''),
  imagenes_galeria: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  visible: Joi.boolean(),
  orden: Joi.number().integer().min(0),
  meta_descripcion: Joi.string().allow('')
}).min(1);

// 📋 Obtener todas las páginas
const getAll = async (req, res) => {
  try {
    console.log('📄 Obteniendo todas las páginas...');

    const { visible, seccion, categoria, limit, offset } = req.query;
    const filters = {};

    if (visible !== undefined) {
      filters.visible = visible === 'true' || visible === '1';
    }
    if (seccion) filters.seccion = seccion;
    if (categoria) filters.categoria = categoria;

    // Obtener páginas usando el database manager
    let paginas = await db.getAllPages(filters);

    // Aplicar paginación si es necesario
    if (limit || offset) {
      const start = parseInt(offset) || 0;
      const end = limit ? start + parseInt(limit) : undefined;
      paginas = paginas.slice(start, end);
    }

    console.log(`✅ ${paginas.length} páginas encontradas`);

    res.json({
      success: true,
      data: paginas,
      total: paginas.length
    });
  } catch (error) {
    console.error('❌ Error al obtener páginas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las páginas',
      error: error.message
    });
  }
};

// 📄 Obtener página por ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📄 Obteniendo página con ID: ${id}`);

    const pagina = await db.getPageById(id);

    if (!pagina) {
      return res.status(404).json({
        success: false,
        message: 'Página no encontrada'
      });
    }

    console.log(`✅ Página encontrada: ${pagina.titulo}`);

    res.json({
      success: true,
      data: pagina
    });
  } catch (error) {
    console.error('❌ Error al obtener página:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la página',
      error: error.message
    });
  }
};

// 📄 Obtener página por slug
const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`📄 Obteniendo página con slug: ${slug}`);

    const pagina = await db.getPageBySlug(slug);

    if (!pagina) {
      return res.status(404).json({
        success: false,
        message: 'Página no encontrada'
      });
    }

    console.log(`✅ Página encontrada: ${pagina.titulo}`);

    res.json({
      success: true,
      data: pagina
    });
  } catch (error) {
    console.error('❌ Error al obtener página por slug:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la página',
      error: error.message
    });
  }
};

// ➕ Crear nueva página
const create = async (req, res) => {
  try {
    console.log('➕ Creando nueva página...');

    // Validar datos
    const { error, value } = paginaCreateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        error: error.details[0].message
      });
    }

    const paginaData = value;

    // Verificar si el slug ya existe
    const existingPage = await db.getPageBySlug(paginaData.slug);
    if (existingPage) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una página con ese slug'
      });
    }

    // Procesar imágenes de galería
    if (Array.isArray(paginaData.imagenes_galeria)) {
      paginaData.imagenes_galeria = JSON.stringify(paginaData.imagenes_galeria);
    }

    // Agregar usuario que crea la página
    paginaData.actualizado_por = req.usuario?.id || null;

    // Crear la página
    const nuevaPagina = await db.createPage(paginaData);

    console.log(`✅ Página creada: ${nuevaPagina.titulo}`);

    res.status(201).json({
      success: true,
      message: 'Página creada correctamente',
      data: nuevaPagina
    });
  } catch (error) {
    console.error('❌ Error al crear página:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la página',
      error: error.message
    });
  }
};

// ✏️ Actualizar página
const update = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Actualizando página con ID: ${id}`);

    // Validar datos
    const { error, value } = paginaUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        error: error.details[0].message
      });
    }

    const paginaData = value;

    // Verificar que la página existe
    const paginaExistente = await db.getPageById(id);
    if (!paginaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Página no encontrada'
      });
    }

    // Si se actualiza el slug, verificar que no exista otro con el mismo
    if (paginaData.slug && paginaData.slug !== paginaExistente.slug) {
      const conflictPage = await db.getPageBySlug(paginaData.slug);
      if (conflictPage && conflictPage.id !== parseInt(id)) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otra página con ese slug'
        });
      }
    }

    // Procesar imágenes de galería
    if (Array.isArray(paginaData.imagenes_galeria)) {
      paginaData.imagenes_galeria = JSON.stringify(paginaData.imagenes_galeria);
    }

    // Agregar usuario que actualiza
    paginaData.actualizado_por = req.usuario?.id || null;

    // Actualizar la página
    const paginaActualizada = await db.updatePage(id, paginaData);

    console.log(`✅ Página actualizada: ${paginaActualizada.titulo}`);

    res.json({
      success: true,
      message: 'Página actualizada correctamente',
      data: paginaActualizada
    });
  } catch (error) {
    console.error('❌ Error al actualizar página:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la página',
      error: error.message
    });
  }
};

// 🗑️ Eliminar página
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando página con ID: ${id}`);

    // Verificar que la página existe
    const paginaExistente = await db.getPageById(id);
    if (!paginaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Página no encontrada'
      });
    }

    // Eliminar la página
    await db.deletePage(id);

    console.log(`✅ Página eliminada: ${paginaExistente.titulo}`);

    res.json({
      success: true,
      message: 'Página eliminada correctamente'
    });
  } catch (error) {
    console.error('❌ Error al eliminar página:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la página',
      error: error.message
    });
  }
};

// 📊 Obtener páginas para menú
const getMenuPages = async (req, res) => {
  try {
    console.log('📊 Obteniendo páginas para menú...');

    // Obtener páginas visibles
    const todasPaginas = await db.getAllPages({ visible: true });

    // Formatear para menú
    const paginas = todasPaginas
      .map(p => ({
        id: p.id,
        titulo: p.titulo,
        slug: p.slug,
        orden: p.orden || 0
      }))
      .sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo));

    console.log(`✅ ${paginas.length} páginas para menú`);

    res.json({
      success: true,
      data: paginas
    });
  } catch (error) {
    console.error('❌ Error al obtener páginas de menú:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las páginas del menú',
      error: error.message
    });
  }
};

// 📈 Obtener estadísticas
const getStats = async (req, res) => {
  try {
    console.log('📈 Obteniendo estadísticas de páginas...');

    // Obtener todas las páginas
    const todasPaginas = await db.getAllPages();

    // Calcular estadísticas
    const stats = {
      total: todasPaginas.length,
      publicadas: todasPaginas.filter(p => p.visible).length,
      borradores: todasPaginas.filter(p => !p.visible).length,
      por_categoria: {}
    };

    // Agrupar por categoría
    todasPaginas.forEach(p => {
      const cat = p.categoria || 'Sin categoría';
      stats.por_categoria[cat] = (stats.por_categoria[cat] || 0) + 1;
    });

    // Convertir a array ordenado
    stats.por_categoria = Object.entries(stats.por_categoria)
      .map(([categoria, cantidad]) => ({ categoria, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    console.log('✅ Estadísticas generadas');

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

module.exports = {
  getAll,
  getById,
  getBySlug,
  create,
  update,
  remove,
  getMenuPages,
  getStats
};