/**
 * Modelo para gestionar la relación actividades <-> spreadsheets de asistencia
 * Osyris Scout Management System
 */

const { query } = require('../config/db.config');

const AsistenciaSheets = {
  /**
   * Busca el spreadsheet asociado a una actividad
   * @param {number} actividadId - ID de la actividad
   * @returns {Object|null} Datos del spreadsheet o null si no existe
   */
  async findByActividadId(actividadId) {
    try {
      const result = await query(
        'SELECT * FROM asistencia_sheets WHERE actividad_id = $1',
        [actividadId]
      );
      return result[0] || null;
    } catch (error) {
      console.error('Error buscando asistencia_sheets por actividad:', error);
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
        'SELECT * FROM asistencia_sheets WHERE spreadsheet_id = $1',
        [spreadsheetId]
      );
      return result[0] || null;
    } catch (error) {
      console.error('Error buscando asistencia_sheets por spreadsheet:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo registro de asistencia sheets
   * @param {Object} data - Datos del registro
   * @returns {Object} Registro creado
   */
  async create(data) {
    try {
      const {
        actividad_id,
        spreadsheet_id,
        carpeta_mes_id,
        carpeta_fecha_id,
        nombre_archivo,
        fecha_reunion
      } = data;

      const result = await query(
        `INSERT INTO asistencia_sheets
         (actividad_id, spreadsheet_id, carpeta_mes_id, carpeta_fecha_id, nombre_archivo, fecha_reunion)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [actividad_id, spreadsheet_id, carpeta_mes_id, carpeta_fecha_id, nombre_archivo, fecha_reunion]
      );
      return result[0];
    } catch (error) {
      console.error('Error creando asistencia_sheets:', error);
      throw error;
    }
  },

  /**
   * Actualiza la fecha de última actualización
   * @param {number} actividadId - ID de la actividad
   */
  async updateTimestamp(actividadId) {
    try {
      await query(
        'UPDATE asistencia_sheets SET ultima_actualizacion = CURRENT_TIMESTAMP WHERE actividad_id = $1',
        [actividadId]
      );
    } catch (error) {
      console.error('Error actualizando timestamp de asistencia_sheets:', error);
      throw error;
    }
  },

  /**
   * Busca spreadsheets por rango de fechas
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {Array} Lista de spreadsheets
   */
  async findByFechaRange(fechaInicio, fechaFin) {
    try {
      return await query(
        `SELECT * FROM asistencia_sheets
         WHERE fecha_reunion BETWEEN $1 AND $2
         ORDER BY fecha_reunion`,
        [fechaInicio, fechaFin]
      );
    } catch (error) {
      console.error('Error buscando asistencia_sheets por rango:', error);
      throw error;
    }
  },

  /**
   * Busca spreadsheets por mes y año
   * @param {number} year - Año
   * @param {number} month - Mes (1-12)
   * @returns {Array} Lista de spreadsheets
   */
  async findByMes(year, month) {
    try {
      const primerDia = `${year}-${month.toString().padStart(2, '0')}-01`;
      const ultimoDia = new Date(year, month, 0).getDate();
      const fechaFin = `${year}-${month.toString().padStart(2, '0')}-${ultimoDia}`;

      return await query(
        `SELECT * FROM asistencia_sheets
         WHERE fecha_reunion BETWEEN $1 AND $2
         ORDER BY fecha_reunion`,
        [primerDia, fechaFin]
      );
    } catch (error) {
      console.error('Error buscando asistencia_sheets por mes:', error);
      throw error;
    }
  },

  /**
   * Elimina un registro de asistencia sheets
   * @param {number} actividadId - ID de la actividad
   * @returns {boolean} true si se eliminó correctamente
   */
  async remove(actividadId) {
    try {
      const result = await query(
        'DELETE FROM asistencia_sheets WHERE actividad_id = $1',
        [actividadId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error eliminando asistencia_sheets:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los spreadsheets con información de la actividad
   * @param {number} limit - Límite de resultados
   * @returns {Array} Lista de spreadsheets con datos de actividad
   */
  async findAllWithActividad(limit = 50) {
    try {
      return await query(
        `SELECT as_s.*, a.titulo as actividad_titulo, a.fecha_inicio as actividad_fecha
         FROM asistencia_sheets as_s
         JOIN actividades a ON as_s.actividad_id = a.id
         ORDER BY as_s.fecha_reunion DESC
         LIMIT $1`,
        [limit]
      );
    } catch (error) {
      console.error('Error buscando asistencia_sheets con actividad:', error);
      throw error;
    }
  }
};

module.exports = AsistenciaSheets;
