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

module.exports = {
  // Compatibilidad con código existente
  initializeDatabase,
  query,
  getConnection,
  closeDatabase,

  // Cliente Supabase directo
  supabase,
  supabasePublic,

  // Nuevas funciones específicas por tabla
  usuarios,
  secciones,
  actividades,
  documentos,
  mensajes
};