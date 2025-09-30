const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// 🏕️ CONFIGURACIÓN SUPABASE PARA OSYRIS SCOUT MANAGEMENT
// Migración desde SQLite a PostgreSQL

// URLs y Keys de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nwkopngnziocsczqkjra.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53a29wbmduemlvY3NjenFranJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTM5MzQsImV4cCI6MjA3NDY2OTkzNH0.lCitPUKcSqOBAMYiWnyLUwSvNFYEK-ExpYLRzOdXE9U';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // La necesitamos del usuario

// Cliente de Supabase con service role (para operaciones de backend)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente público (para frontend)
const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔌 Función para inicializar la base de datos (compatibilidad con código existente)
async function initializeDatabase() {
  try {
    console.log('🚀 Conectando a Supabase PostgreSQL...');

    // Verificar conexión consultando las secciones
    const { data, error } = await supabase
      .from('secciones')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('✅ Conexión a Supabase establecida correctamente');
    console.log(`🏕️ Base de datos: ${SUPABASE_URL}`);
    console.log('📊 Tablas PostgreSQL listas');

    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error.message);
    throw error;
  }
}

// 🔍 Función query compatible con el código SQLite existente
async function query(sql, params = []) {
  try {
    // Convertir consultas SQLite a consultas Supabase
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      // Para consultas SELECT, necesitamos parsearlo manualmente
      // Por ahora, haremos que lance un error para migrar tabla por tabla
      throw new Error(`⚠️ Consulta SQL directa no soportada en Supabase. Usar métodos .from().select(): ${sql}`);
    } else {
      // Para INSERT, UPDATE, DELETE tampoco podemos usar SQL directo
      throw new Error(`⚠️ Consulta SQL directa no soportada en Supabase. Usar métodos .from().insert/.update/.delete: ${sql}`);
    }
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
}

// 🔗 Función para obtener conexión (compatibilidad con código existente)
async function getConnection() {
  return {
    query: query,
    supabase: supabase, // Añadimos acceso directo al cliente Supabase
    release: () => {} // No-op para compatibilidad
  };
}

// 🔌 Función para cerrar conexión (no necesaria en Supabase, pero para compatibilidad)
function closeDatabase() {
  console.log('✅ Conexiones Supabase cerradas');
  return Promise.resolve();
}

// 📋 NUEVAS FUNCIONES ESPECÍFICAS PARA CADA TABLA

// 👥 USUARIOS
const usuarios = {
  // Obtener todos los usuarios
  async getAll() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*');

    if (error) throw error;
    return data;
  },

  // Obtener usuario por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Obtener usuario por email
  async getByEmail(email) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear usuario
  async create(userData) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar usuario
  async update(id, userData) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar usuario
  async delete(id) {
    const { data, error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  }
};

// 🧪 Test de conexión
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('secciones')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Error al conectar con Supabase:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

// 🏕️ SECCIONES
const secciones = {
  async getAll() {
    const { data, error } = await supabase
      .from('secciones')
      .select('*')
      .eq('activa', true);

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('secciones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getMembers(seccionId) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('seccion_id', seccionId)
      .eq('activo', true);

    if (error) throw error;
    return data;
  }
};

// 📅 ACTIVIDADES
const actividades = {
  async getAll() {
    const { data, error } = await supabase
      .from('actividades')
      .select(`
        *,
        seccion:secciones(*),
        creador:usuarios(nombre, apellidos)
      `)
      .order('fecha_inicio', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getBySeccion(seccionId) {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .eq('seccion_id', seccionId)
      .order('fecha_inicio', { ascending: true });

    if (error) throw error;
    return data;
  },

  async create(actividadData) {
    const { data, error } = await supabase
      .from('actividades')
      .insert(actividadData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// 📄 DOCUMENTOS
const documentos = {
  async getAll() {
    const { data, error } = await supabase
      .from('documentos')
      .select(`
        *,
        seccion:secciones(*),
        subido_por_usuario:usuarios(nombre, apellidos)
      `)
      .order('fecha_subida', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(documentoData) {
    const { data, error } = await supabase
      .from('documentos')
      .insert(documentoData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// 💬 MENSAJES
const mensajes = {
  async getAll() {
    const { data, error } = await supabase
      .from('mensajes')
      .select(`
        *,
        remitente:usuarios(nombre, apellidos)
      `)
      .eq('activo', true)
      .order('fecha_envio', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(mensajeData) {
    const { data, error } = await supabase
      .from('mensajes')
      .insert(mensajeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// 📄 PÁGINAS
const paginas = {
  async getAll(filters = {}) {
    let query = supabase
      .from('paginas')
      .select('*');

    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }

    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo);
    }

    if (filters.mostrar_en_menu !== undefined) {
      query = query.eq('mostrar_en_menu', filters.mostrar_en_menu);
    }

    // Ejecutar consulta con orden por ID (más robusto)
    const { data, error } = await query.order('id', { ascending: true });

    if (error) {
      // Si hay error por columna faltante, intentar consulta básica
      if (error.message && error.message.includes('does not exist')) {
        console.warn('⚠️ Columna no existe, usando consulta básica');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('paginas')
          .select('*')
          .order('id', { ascending: true });

        if (fallbackError) throw fallbackError;
        return fallbackData;
      }
      throw error;
    }
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('paginas')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('paginas')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  async create(pageData) {
    const { data, error } = await supabase
      .from('paginas')
      .insert(pageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, pageData) {
    // Add fecha_actualizacion to the data
    const updateData = {
      ...pageData,
      fecha_actualizacion: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('paginas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('paginas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  },

  async getMenuPages() {
    try {
      const { data, error } = await supabase
        .from('paginas')
        .select('id, titulo, slug')
        .eq('visible', true)
        .order('id', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.warn('⚠️ Error obteniendo páginas de menú:', error.message);
      return [];
    }
  },

  async getStats() {
    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('paginas')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get published count
    const { count: publishedCount, error: publishedError } = await supabase
      .from('paginas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'publicada');

    if (publishedError) throw publishedError;

    // Get draft count
    const { count: draftCount, error: draftError } = await supabase
      .from('paginas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'borrador');

    if (draftError) throw draftError;

    // Get types count
    const { data: typeData, error: typeError } = await supabase
      .from('paginas')
      .select('tipo')
      .order('tipo');

    if (typeError) throw typeError;

    // Group by type manually
    const typeCount = typeData.reduce((acc, row) => {
      acc[row.tipo] = (acc[row.tipo] || 0) + 1;
      return acc;
    }, {});

    const por_tipo = Object.entries(typeCount)
      .map(([tipo, count]) => ({ tipo, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: totalCount || 0,
      publicadas: publishedCount || 0,
      borradores: draftCount || 0,
      por_tipo
    };
  }
};

module.exports = {
  // Compatibilidad con código existente
  initializeDatabase,
  query,
  getConnection,
  closeDatabase,
  testConnection,

  // Cliente Supabase directo
  supabase,
  supabasePublic,

  // Nuevas funciones específicas por tabla
  usuarios,
  secciones,
  actividades,
  documentos,
  mensajes,
  paginas
};