const db = require('../config/db.config');

/**
 * 🏠 MODELO DE PÁGINAS - SISTEMA CMS OSYRIS
 * Gestión de páginas de contenido web
 */

class Paginas {
  // 🔍 Obtener todas las páginas
  static async findAll(filters = {}) {
    try {
      let sql = 'SELECT * FROM paginas WHERE 1=1';
      const params = [];

      if (filters.estado) {
        sql += ' AND estado = ?';
        params.push(filters.estado);
      }

      if (filters.tipo) {
        sql += ' AND tipo = ?';
        params.push(filters.tipo);
      }

      if (filters.mostrar_en_menu !== undefined) {
        sql += ' AND mostrar_en_menu = ?';
        params.push(filters.mostrar_en_menu ? 1 : 0);
      }

      sql += ' ORDER BY orden_menu ASC, fecha_actualizacion DESC';

      const pages = await db.query(sql, params);
      return pages;
    } catch (error) {
      throw new Error(`Error al obtener páginas: ${error.message}`);
    }
  }

  // 🔍 Obtener una página por ID
  static async findById(id) {
    try {
      const pages = await db.query('SELECT * FROM paginas WHERE id = ?', [id]);
      return pages[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener página por ID: ${error.message}`);
    }
  }

  // 🔍 Obtener una página por slug
  static async findBySlug(slug) {
    try {
      const pages = await db.query('SELECT * FROM paginas WHERE slug = ?', [slug]);
      return pages[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener página por slug: ${error.message}`);
    }
  }

  // ➕ Crear nueva página
  static async create(pageData) {
    try {
      const {
        titulo,
        slug,
        contenido,
        resumen = '',
        meta_descripcion = '',
        imagen_destacada = '',
        estado = 'borrador',
        tipo = 'pagina',
        orden_menu = 0,
        mostrar_en_menu = true,
        permite_comentarios = false,
        creado_por
      } = pageData;

      const result = await db.query(`
        INSERT INTO paginas (
          titulo, slug, contenido, resumen, meta_descripcion, imagen_destacada,
          estado, tipo, orden_menu, mostrar_en_menu, permite_comentarios, creado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        titulo,
        slug,
        contenido,
        resumen,
        meta_descripcion,
        imagen_destacada,
        estado,
        tipo,
        orden_menu,
        mostrar_en_menu ? 1 : 0,
        permite_comentarios ? 1 : 0,
        creado_por
      ]);

      // Obtener la página recién creada
      const newPage = await this.findById(result.insertId);
      return newPage;
    } catch (error) {
      throw new Error(`Error al crear página: ${error.message}`);
    }
  }

  // ✏️ Actualizar página existente
  static async update(id, pageData) {
    try {
      const {
        titulo,
        slug,
        contenido,
        resumen,
        meta_descripcion,
        imagen_destacada,
        estado,
        tipo,
        orden_menu,
        mostrar_en_menu,
        permite_comentarios
      } = pageData;

      const result = await db.query(`
        UPDATE paginas SET
          titulo = ?,
          slug = ?,
          contenido = ?,
          resumen = ?,
          meta_descripcion = ?,
          imagen_destacada = ?,
          estado = ?,
          tipo = ?,
          orden_menu = ?,
          mostrar_en_menu = ?,
          permite_comentarios = ?,
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        titulo,
        slug,
        contenido,
        resumen || '',
        meta_descripcion || '',
        imagen_destacada || '',
        estado || 'borrador',
        tipo || 'pagina',
        orden_menu || 0,
        mostrar_en_menu ? 1 : 0,
        permite_comentarios ? 1 : 0,
        id
      ]);

      if (result.changes === 0) {
        return null;
      }

      // Obtener la página actualizada
      const updatedPage = await this.findById(id);
      return updatedPage;
    } catch (error) {
      throw new Error(`Error al actualizar página: ${error.message}`);
    }
  }

  // 🗑️ Eliminar página
  static async remove(id) {
    try {
      const result = await db.query('DELETE FROM paginas WHERE id = ?', [id]);
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error al eliminar página: ${error.message}`);
    }
  }

  // 🔍 Obtener páginas para menú
  static async findMenuPages() {
    try {
      const pages = await db.query(`
        SELECT id, titulo, slug, orden_menu
        FROM paginas
        WHERE estado = 'publicada' AND mostrar_en_menu = 1
        ORDER BY orden_menu ASC, titulo ASC
      `);
      return pages;
    } catch (error) {
      throw new Error(`Error al obtener páginas del menú: ${error.message}`);
    }
  }

  // 📊 Obtener estadísticas de páginas
  static async getStats() {
    try {
      const totalPages = await db.query('SELECT COUNT(*) as count FROM paginas');
      const publishedPages = await db.query('SELECT COUNT(*) as count FROM paginas WHERE estado = "publicada"');
      const draftPages = await db.query('SELECT COUNT(*) as count FROM paginas WHERE estado = "borrador"');
      const pageTypes = await db.query(`
        SELECT tipo, COUNT(*) as count
        FROM paginas
        GROUP BY tipo
        ORDER BY count DESC
      `);

      return {
        total: totalPages[0]?.count || 0,
        publicadas: publishedPages[0]?.count || 0,
        borradores: draftPages[0]?.count || 0,
        por_tipo: pageTypes
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

module.exports = Paginas;