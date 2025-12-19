/**
 * Modelo para gestionar la relación campamentos <-> spreadsheets de asistencia por sección
 * Osyris Scout Management System
 */

const { query } = require('../config/db.config');

const CampamentoAsistenciaSheets = {
  /**
   * Busca el spreadsheet asociado a un campamento
   * @param {number} actividadId - ID del campamento
   * @returns {Object|null} Datos del spreadsheet o null si no existe
   */
  async findByActividadId(actividadId) {
    try {
      const result = await query(
        'SELECT * FROM campamento_asistencia_sheets WHERE actividad_id = $1',
        [actividadId]
      );
      return result[0] || null;
    } catch (error) {
      console.error('Error buscando campamento_asistencia_sheets por actividad:', error);
      throw error;
    }
  },

  /**
   * Busca el spreadsheet por su ID de Google
   * @param {string} spreadsheetId - ID del spreadsheet de Google
   * @returns {Object|null} Datos del spreadsheet o null si no existe
   */
  async findBySpreadsheetId(spreadsheetId) {
    try {
      const result = await query(
        'SELECT * FROM campamento_asistencia_sheets WHERE spreadsheet_id = $1',
        [spreadsheetId]
      );
      return result[0] || null;
    } catch (error) {
      console.error('Error buscando campamento_asistencia_sheets por spreadsheet:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo registro de asistencia sheets de campamento
   * @param {Object} data - Datos del registro
   * @returns {Object} Registro creado
   */
  async create(data) {
    try {
      const {
        actividad_id,
        spreadsheet_id,
        carpeta_campamento_id,
        nombre_archivo,
        tipo_campamento
      } = data;

      const result = await query(
        `INSERT INTO campamento_asistencia_sheets
         (actividad_id, spreadsheet_id, carpeta_campamento_id, nombre_archivo, tipo_campamento)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [actividad_id, spreadsheet_id, carpeta_campamento_id, nombre_archivo, tipo_campamento]
      );
      return result[0];
    } catch (error) {
      console.error('Error creando campamento_asistencia_sheets:', error);
      throw error;
    }
  },

  /**
   * Actualiza la fecha de última actualización
   * @param {number} actividadId - ID del campamento
   */
  async updateTimestamp(actividadId) {
    try {
      await query(
        'UPDATE campamento_asistencia_sheets SET ultima_actualizacion = CURRENT_TIMESTAMP WHERE actividad_id = $1',
        [actividadId]
      );
    } catch (error) {
      console.error('Error actualizando timestamp de campamento_asistencia_sheets:', error);
      throw error;
    }
  },

  /**
   * Busca spreadsheets por tipo de campamento
   * @param {string} tipoCampamento - Tipo (INICIO, NAVIDAD, etc.)
   * @returns {Array} Lista de spreadsheets
   */
  async findByTipo(tipoCampamento) {
    try {
      return await query(
        `SELECT * FROM campamento_asistencia_sheets
         WHERE tipo_campamento = $1
         ORDER BY fecha_creacion DESC`,
        [tipoCampamento.toUpperCase()]
      );
    } catch (error) {
      console.error('Error buscando campamento_asistencia_sheets por tipo:', error);
      throw error;
    }
  },

  /**
   * Elimina un registro de asistencia sheets de campamento
   * @param {number} actividadId - ID del campamento
   * @returns {boolean} true si se eliminó correctamente
   */
  async remove(actividadId) {
    try {
      const result = await query(
        'DELETE FROM campamento_asistencia_sheets WHERE actividad_id = $1',
        [actividadId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error eliminando campamento_asistencia_sheets:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los spreadsheets con información del campamento
   * @param {number} limit - Límite de resultados
   * @returns {Array} Lista de spreadsheets con datos del campamento
   */
  async findAllWithActividad(limit = 50) {
    try {
      return await query(
        `SELECT cas.*, a.titulo as campamento_titulo, a.fecha_inicio as campamento_fecha
         FROM campamento_asistencia_sheets cas
         JOIN actividades a ON cas.actividad_id = a.id
         ORDER BY cas.fecha_creacion DESC
         LIMIT $1`,
        [limit]
      );
    } catch (error) {
      console.error('Error buscando campamento_asistencia_sheets con actividad:', error);
      throw error;
    }
  }
};

module.exports = CampamentoAsistenciaSheets;
