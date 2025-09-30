const Joi = require('joi');

/**
 * 🛡️ SISTEMA DE VALIDACIONES ROBUSTAS - OSYRIS
 * Validaciones avanzadas para integridad de datos
 */

// Esquemas de validación
const validationSchemas = {
  // 👤 Validaciones de Usuario
  usuario: {
    create: Joi.object({
      nombre: Joi.string()
        .min(2)
        .max(100)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .required()
        .messages({
          'string.pattern.base': 'El nombre solo puede contener letras y espacios',
          'string.min': 'El nombre debe tener al menos 2 caracteres',
          'string.max': 'El nombre no puede exceder 100 caracteres'
        }),

      apellidos: Joi.string()
        .min(2)
        .max(100)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .required()
        .messages({
          'string.pattern.base': 'Los apellidos solo pueden contener letras y espacios'
        }),

      email: Joi.string()
        .email({ tlds: { allow: false } })
        .max(100)
        .required()
        .messages({
          'string.email': 'Debe ser una dirección de email válida'
        }),

      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.pattern.base': 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo',
          'string.min': 'La contraseña debe tener al menos 8 caracteres'
        }),

      rol: Joi.string()
        .valid('admin', 'coordinador', 'scouter', 'padre', 'educando')
        .default('scouter'),

      fecha_nacimiento: Joi.date()
        .max('now')
        .min('1900-01-01')
        .optional()
        .messages({
          'date.max': 'La fecha de nacimiento no puede ser futura',
          'date.min': 'La fecha de nacimiento no es válida'
        }),

      telefono: Joi.string()
        .pattern(/^[+]?[\d\s-()]{9,15}$/)
        .optional()
        .messages({
          'string.pattern.base': 'El teléfono debe tener un formato válido'
        }),

      direccion: Joi.string()
        .max(500)
        .optional(),

      foto_perfil: Joi.string()
        .uri()
        .max(500)
        .optional(),

      seccion_id: Joi.number()
        .integer()
        .positive()
        .optional(),

      activo: Joi.boolean()
        .default(true)
    }),

    update: Joi.object({
      nombre: Joi.string()
        .min(2)
        .max(100)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .optional(),

      apellidos: Joi.string()
        .min(2)
        .max(100)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .optional(),

      email: Joi.string()
        .email({ tlds: { allow: false } })
        .max(100)
        .optional(),

      password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .optional(),

      rol: Joi.string()
        .valid('admin', 'coordinador', 'scouter', 'padre', 'educando')
        .optional(),

      fecha_nacimiento: Joi.date()
        .max('now')
        .min('1900-01-01')
        .optional(),

      telefono: Joi.string()
        .pattern(/^[+]?[\d\s-()]{9,15}$/)
        .optional(),

      direccion: Joi.string()
        .max(500)
        .optional(),

      foto_perfil: Joi.string()
        .uri()
        .max(500)
        .optional(),

      seccion_id: Joi.number()
        .integer()
        .positive()
        .optional()
        .allow(null),

      activo: Joi.boolean()
        .optional()
    }).min(1)
  },

  // 🏕️ Validaciones de Sección
  seccion: {
    create: Joi.object({
      nombre: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[a-zA-Z]+$/)
        .required()
        .messages({
          'string.pattern.base': 'El nombre de sección solo puede contener letras'
        }),

      nombre_completo: Joi.string()
        .min(5)
        .max(100)
        .required(),

      edad_minima: Joi.number()
        .integer()
        .min(0)
        .max(25)
        .required(),

      edad_maxima: Joi.number()
        .integer()
        .min(Joi.ref('edad_minima'))
        .max(25)
        .required()
        .messages({
          'number.min': 'La edad máxima debe ser mayor o igual a la edad mínima'
        }),

      color_primario: Joi.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .optional()
        .messages({
          'string.pattern.base': 'El color debe ser un código hexadecimal válido (#RRGGBB)'
        }),

      descripcion: Joi.string()
        .max(1000)
        .optional(),

      activa: Joi.boolean()
        .default(true)
    }),

    update: Joi.object({
      nombre: Joi.string()
        .min(3)
        .max(50)
        .pattern(/^[a-zA-Z]+$/)
        .optional(),

      nombre_completo: Joi.string()
        .min(5)
        .max(100)
        .optional(),

      edad_minima: Joi.number()
        .integer()
        .min(0)
        .max(25)
        .optional(),

      edad_maxima: Joi.number()
        .integer()
        .min(0)
        .max(25)
        .optional(),

      color_primario: Joi.string()
        .pattern(/^#[0-9A-Fa-f]{6}$/)
        .optional(),

      descripcion: Joi.string()
        .max(1000)
        .optional(),

      activa: Joi.boolean()
        .optional()
    }).min(1)
  },

  // 📅 Validaciones de Actividad
  actividad: {
    create: Joi.object({
      titulo: Joi.string()
        .min(5)
        .max(200)
        .required(),

      descripcion: Joi.string()
        .max(2000)
        .optional(),

      fecha_inicio: Joi.date()
        .min('now')
        .required()
        .messages({
          'date.min': 'La fecha de inicio no puede ser anterior a hoy'
        }),

      fecha_fin: Joi.date()
        .min(Joi.ref('fecha_inicio'))
        .optional()
        .messages({
          'date.min': 'La fecha de fin debe ser posterior a la fecha de inicio'
        }),

      ubicacion: Joi.string()
        .max(200)
        .optional(),

      seccion_id: Joi.number()
        .integer()
        .positive()
        .optional(),

      tipo: Joi.string()
        .valid('reunion', 'salida', 'campamento', 'servicio', 'formacion')
        .default('reunion'),

      estado: Joi.string()
        .valid('planificada', 'confirmada', 'cancelada', 'completada')
        .default('planificada'),

      creado_por: Joi.number()
        .integer()
        .positive()
        .required()
    }),

    update: Joi.object({
      titulo: Joi.string()
        .min(5)
        .max(200)
        .optional(),

      descripcion: Joi.string()
        .max(2000)
        .optional(),

      fecha_inicio: Joi.date()
        .optional(),

      fecha_fin: Joi.date()
        .optional(),

      ubicacion: Joi.string()
        .max(200)
        .optional(),

      seccion_id: Joi.number()
        .integer()
        .positive()
        .optional()
        .allow(null),

      tipo: Joi.string()
        .valid('reunion', 'salida', 'campamento', 'servicio', 'formacion')
        .optional(),

      estado: Joi.string()
        .valid('planificada', 'confirmada', 'cancelada', 'completada')
        .optional()
    }).min(1)
  },

  // 📄 Validaciones de Página
  pagina: {
    create: Joi.object({
      titulo: Joi.string()
        .min(3)
        .max(200)
        .required(),

      slug: Joi.string()
        .min(3)
        .max(200)
        .pattern(/^[a-z0-9-]+$/)
        .required()
        .messages({
          'string.pattern.base': 'El slug solo puede contener letras minúsculas, números y guiones'
        }),

      contenido: Joi.string()
        .min(10)
        .required(),

      resumen: Joi.string()
        .max(500)
        .optional(),

      meta_descripcion: Joi.string()
        .max(160)
        .optional(),

      imagen_destacada: Joi.string()
        .uri()
        .max(500)
        .optional(),

      estado: Joi.string()
        .valid('borrador', 'publicada', 'archivada')
        .default('borrador'),

      tipo: Joi.string()
        .valid('pagina', 'articulo', 'noticia')
        .default('pagina'),

      orden_menu: Joi.number()
        .integer()
        .min(0)
        .default(0),

      mostrar_en_menu: Joi.boolean()
        .default(true),

      permite_comentarios: Joi.boolean()
        .default(false),

      creado_por: Joi.number()
        .integer()
        .positive()
        .required()
    }),

    update: Joi.object({
      titulo: Joi.string()
        .min(3)
        .max(200)
        .optional(),

      slug: Joi.string()
        .min(3)
        .max(200)
        .pattern(/^[a-z0-9-]+$/)
        .optional(),

      contenido: Joi.string()
        .min(10)
        .optional(),

      resumen: Joi.string()
        .max(500)
        .optional(),

      meta_descripcion: Joi.string()
        .max(160)
        .optional(),

      imagen_destacada: Joi.string()
        .uri()
        .max(500)
        .optional(),

      estado: Joi.string()
        .valid('borrador', 'publicada', 'archivada')
        .optional(),

      tipo: Joi.string()
        .valid('pagina', 'articulo', 'noticia')
        .optional(),

      orden_menu: Joi.number()
        .integer()
        .min(0)
        .optional(),

      mostrar_en_menu: Joi.boolean()
        .optional(),

      permite_comentarios: Joi.boolean()
        .optional()
    }).min(1)
  },

  // 💬 Validaciones de Mensaje
  mensaje: {
    create: Joi.object({
      asunto: Joi.string()
        .min(5)
        .max(200)
        .required(),

      contenido: Joi.string()
        .min(10)
        .max(5000)
        .required(),

      remitente_id: Joi.number()
        .integer()
        .positive()
        .required(),

      destinatario_tipo: Joi.string()
        .valid('todos', 'seccion', 'rol', 'individual')
        .required(),

      destinatario_id: Joi.number()
        .integer()
        .positive()
        .when('destinatario_tipo', {
          is: Joi.valid('seccion', 'individual'),
          then: Joi.required(),
          otherwise: Joi.optional()
        }),

      prioridad: Joi.string()
        .valid('baja', 'normal', 'alta')
        .default('normal')
    })
  },

  // 📎 Validaciones de Documento
  documento: {
    create: Joi.object({
      titulo: Joi.string()
        .min(3)
        .max(200)
        .required(),

      descripcion: Joi.string()
        .max(1000)
        .optional(),

      archivo_nombre: Joi.string()
        .min(1)
        .max(255)
        .required(),

      archivo_ruta: Joi.string()
        .min(1)
        .max(500)
        .required(),

      tipo_archivo: Joi.string()
        .max(50)
        .optional(),

      tamaño_archivo: Joi.number()
        .integer()
        .positive()
        .max(10 * 1024 * 1024) // 10MB máximo
        .optional(),

      seccion_id: Joi.number()
        .integer()
        .positive()
        .optional(),

      subido_por: Joi.number()
        .integer()
        .positive()
        .required(),

      visible_para: Joi.string()
        .valid('todos', 'comite', 'kraal', 'seccion')
        .default('todos')
    })
  },

  // 🔍 Validaciones de consulta/filtros
  query: {
    pagination: Joi.object({
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),

      offset: Joi.number()
        .integer()
        .min(0)
        .default(0),

      page: Joi.number()
        .integer()
        .min(1)
        .optional()
    }),

    search: Joi.object({
      q: Joi.string()
        .min(2)
        .max(100)
        .optional(),

      orderBy: Joi.string()
        .valid('id', 'nombre', 'fecha_creacion', 'fecha_actualizacion')
        .default('fecha_creacion'),

      orderDirection: Joi.string()
        .valid('ASC', 'DESC', 'asc', 'desc')
        .default('DESC')
    }),

    dateRange: Joi.object({
      startDate: Joi.date()
        .optional(),

      endDate: Joi.date()
        .min(Joi.ref('startDate'))
        .optional()
        .messages({
          'date.min': 'La fecha final debe ser posterior a la fecha inicial'
        })
    })
  }
};

/**
 * 🛡️ Clase principal de validación
 */
class Validator {
  /**
   * Validar datos usando un esquema específico
   */
  static validate(data, schema, options = {}) {
    const defaultOptions = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    };

    const validationOptions = { ...defaultOptions, ...options };

    const { error, value } = schema.validate(data, validationOptions);

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      throw new ValidationError('Error de validación', errors);
    }

    return value;
  }

  /**
   * Validar usuario para creación
   */
  static validateUserCreate(data) {
    return this.validate(data, validationSchemas.usuario.create);
  }

  /**
   * Validar usuario para actualización
   */
  static validateUserUpdate(data) {
    return this.validate(data, validationSchemas.usuario.update);
  }

  /**
   * Validar sección
   */
  static validateSectionCreate(data) {
    return this.validate(data, validationSchemas.seccion.create);
  }

  static validateSectionUpdate(data) {
    return this.validate(data, validationSchemas.seccion.update);
  }

  /**
   * Validar actividad
   */
  static validateActivityCreate(data) {
    return this.validate(data, validationSchemas.actividad.create);
  }

  static validateActivityUpdate(data) {
    return this.validate(data, validationSchemas.actividad.update);
  }

  /**
   * Validar página
   */
  static validatePageCreate(data) {
    return this.validate(data, validationSchemas.pagina.create);
  }

  static validatePageUpdate(data) {
    return this.validate(data, validationSchemas.pagina.update);
  }

  /**
   * Validar mensaje
   */
  static validateMessageCreate(data) {
    return this.validate(data, validationSchemas.mensaje.create);
  }

  /**
   * Validar documento
   */
  static validateDocumentCreate(data) {
    return this.validate(data, validationSchemas.documento.create);
  }

  /**
   * Validar parámetros de consulta
   */
  static validatePagination(data) {
    return this.validate(data, validationSchemas.query.pagination);
  }

  static validateSearch(data) {
    return this.validate(data, validationSchemas.query.search);
  }

  static validateDateRange(data) {
    return this.validate(data, validationSchemas.query.dateRange);
  }

  /**
   * Validar ID de parámetro
   */
  static validateId(id) {
    const schema = Joi.number().integer().positive().required();
    const { error, value } = schema.validate(id);

    if (error) {
      throw new ValidationError('ID inválido', [{ field: 'id', message: 'Debe ser un número entero positivo' }]);
    }

    return value;
  }

  /**
   * Sanitizar texto para prevenir XSS básico
   */
  static sanitizeHtml(text) {
    if (typeof text !== 'string') return text;

    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validar archivo subido
   */
  static validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    } = options;

    if (!file) {
      throw new ValidationError('No se ha proporcionado archivo', []);
    }

    if (file.size > maxSize) {
      throw new ValidationError('Archivo demasiado grande', [
        { field: 'file', message: `El archivo no puede exceder ${maxSize / 1024 / 1024}MB` }
      ]);
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError('Tipo de archivo no permitido', [
        { field: 'file', message: `Tipos permitidos: ${allowedTypes.join(', ')}` }
      ]);
    }

    return true;
  }
}

/**
 * 🚨 Clase de error de validación personalizada
 */
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errors: this.errors,
      statusCode: this.statusCode
    };
  }
}

module.exports = {
  Validator,
  ValidationError,
  validationSchemas
};