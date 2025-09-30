const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

/**
 * 🚀 SCRIPT DE INICIALIZACIÓN MEJORADO - BASE DE DATOS OSYRIS
 * Versión optimizada con datos de ejemplo y validaciones
 */

const DB_PATH = path.join(__dirname, '../../../database/osyris.db');
const DB_DIR = path.dirname(DB_PATH);

class DatabaseInitializer {
  constructor() {
    this.db = null;
  }

  // Conectar a la base de datos
  async connect() {
    return new Promise((resolve, reject) => {
      // Crear directorio si no existe
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ Error conectando a SQLite:', err);
          reject(err);
        } else {
          console.log('✅ Conectado a SQLite para inicialización');
          resolve();
        }
      });
    });
  }

  // Ejecutar query
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Ejecutar comando
  async exec(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({
          insertId: this.lastID,
          changes: this.changes
        });
      });
    });
  }

  // Configurar SQLite para rendimiento óptimo
  async configureSQLite() {
    console.log('⚙️ Configurando SQLite para rendimiento óptimo...');

    const configs = [
      'PRAGMA foreign_keys=ON',
      'PRAGMA journal_mode=WAL',
      'PRAGMA recursive_triggers=ON',
      'PRAGMA cache_size=-8000',
      'PRAGMA synchronous=NORMAL',
      'PRAGMA auto_vacuum=INCREMENTAL',
      'PRAGMA busy_timeout=30000'
    ];

    for (const config of configs) {
      try {
        await this.exec(config);
        console.log(`✅ ${config}`);
      } catch (error) {
        console.error(`❌ Error en ${config}:`, error.message);
      }
    }
  }

  // Crear todas las tablas con estructura optimizada
  async createTables() {
    console.log('🏗️ Creando estructura de tablas optimizada...');

    // Tabla de secciones
    await this.exec(`
      CREATE TABLE IF NOT EXISTS secciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        nombre_completo VARCHAR(100) NOT NULL,
        edad_minima INTEGER NOT NULL CHECK(edad_minima >= 0 AND edad_minima <= 25),
        edad_maxima INTEGER NOT NULL CHECK(edad_maxima >= edad_minima AND edad_maxima <= 25),
        color_primario VARCHAR(20),
        descripcion TEXT,
        activa BOOLEAN DEFAULT 1 NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de usuarios
    await this.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol TEXT CHECK(rol IN ('admin', 'coordinador', 'scouter', 'padre', 'educando')) NOT NULL DEFAULT 'scouter',
        seccion_id INTEGER,
        fecha_nacimiento DATE CHECK(fecha_nacimiento <= date('now')),
        telefono VARCHAR(20),
        direccion TEXT,
        foto_perfil VARCHAR(500),
        activo BOOLEAN DEFAULT 1 NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        ultimo_acceso DATETIME,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // Tabla de actividades
    await this.exec(`
      CREATE TABLE IF NOT EXISTS actividades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        fecha_inicio DATETIME NOT NULL,
        fecha_fin DATETIME CHECK(fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
        ubicacion VARCHAR(200),
        seccion_id INTEGER,
        tipo TEXT CHECK(tipo IN ('reunion', 'salida', 'campamento', 'servicio', 'formacion')) DEFAULT 'reunion',
        estado TEXT CHECK(estado IN ('planificada', 'confirmada', 'cancelada', 'completada')) DEFAULT 'planificada',
        creado_por INTEGER NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    // Tabla de documentos
    await this.exec(`
      CREATE TABLE IF NOT EXISTS documentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        archivo_nombre VARCHAR(255) NOT NULL,
        archivo_ruta VARCHAR(500) NOT NULL UNIQUE,
        tipo_archivo VARCHAR(50),
        tamaño_archivo INTEGER CHECK(tamaño_archivo > 0),
        seccion_id INTEGER,
        subido_por INTEGER NOT NULL,
        fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
        visible_para TEXT CHECK(visible_para IN ('todos', 'comite', 'kraal', 'seccion')) DEFAULT 'todos',
        activo BOOLEAN DEFAULT 1 NOT NULL,
        FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (subido_por) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    // Tabla de mensajes
    await this.exec(`
      CREATE TABLE IF NOT EXISTS mensajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asunto VARCHAR(200) NOT NULL,
        contenido TEXT NOT NULL,
        remitente_id INTEGER NOT NULL,
        destinatario_tipo TEXT CHECK(destinatario_tipo IN ('todos', 'seccion', 'rol', 'individual')) NOT NULL,
        destinatario_id INTEGER,
        fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_leido DATETIME,
        prioridad TEXT CHECK(prioridad IN ('baja', 'normal', 'alta')) DEFAULT 'normal',
        activo BOOLEAN DEFAULT 1 NOT NULL,
        FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Tabla de páginas
    await this.exec(`
      CREATE TABLE IF NOT EXISTS paginas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        contenido TEXT NOT NULL,
        resumen TEXT,
        meta_descripcion TEXT,
        imagen_destacada VARCHAR(500),
        estado TEXT CHECK(estado IN ('borrador', 'publicada', 'archivada')) DEFAULT 'borrador',
        tipo TEXT CHECK(tipo IN ('pagina', 'articulo', 'noticia')) DEFAULT 'pagina',
        orden_menu INTEGER DEFAULT 0 CHECK(orden_menu >= 0),
        mostrar_en_menu BOOLEAN DEFAULT 1 NOT NULL,
        permite_comentarios BOOLEAN DEFAULT 0 NOT NULL,
        creado_por INTEGER NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_publicacion DATETIME,
        FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    console.log('✅ Tablas creadas correctamente');
  }

  // Crear índices optimizados
  async createIndexes() {
    console.log('📊 Creando índices optimizados...');

    const indexes = [
      // Índices usuarios
      'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)',
      'CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol)',
      'CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo)',
      'CREATE INDEX IF NOT EXISTS idx_usuarios_seccion ON usuarios(seccion_id)',
      'CREATE INDEX IF NOT EXISTS idx_usuarios_ultimo_acceso ON usuarios(ultimo_acceso)',

      // Índices actividades
      'CREATE INDEX IF NOT EXISTS idx_actividades_fecha_inicio ON actividades(fecha_inicio)',
      'CREATE INDEX IF NOT EXISTS idx_actividades_estado ON actividades(estado)',
      'CREATE INDEX IF NOT EXISTS idx_actividades_tipo ON actividades(tipo)',
      'CREATE INDEX IF NOT EXISTS idx_actividades_seccion ON actividades(seccion_id)',

      // Índices documentos
      'CREATE INDEX IF NOT EXISTS idx_documentos_tipo_archivo ON documentos(tipo_archivo)',
      'CREATE INDEX IF NOT EXISTS idx_documentos_fecha_subida ON documentos(fecha_subida)',
      'CREATE INDEX IF NOT EXISTS idx_documentos_visible_para ON documentos(visible_para)',
      'CREATE INDEX IF NOT EXISTS idx_documentos_activo ON documentos(activo)',

      // Índices mensajes
      'CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id)',
      'CREATE INDEX IF NOT EXISTS idx_mensajes_fecha_envio ON mensajes(fecha_envio)',
      'CREATE INDEX IF NOT EXISTS idx_mensajes_activo ON mensajes(activo)',

      // Índices páginas
      'CREATE INDEX IF NOT EXISTS idx_paginas_slug ON paginas(slug)',
      'CREATE INDEX IF NOT EXISTS idx_paginas_estado ON paginas(estado)',
      'CREATE INDEX IF NOT EXISTS idx_paginas_tipo ON paginas(tipo)',
      'CREATE INDEX IF NOT EXISTS idx_paginas_mostrar_menu ON paginas(mostrar_en_menu)',

      // Índices compuestos
      'CREATE INDEX IF NOT EXISTS idx_usuarios_rol_activo ON usuarios(rol, activo)',
      'CREATE INDEX IF NOT EXISTS idx_actividades_fecha_estado ON actividades(fecha_inicio, estado)',
      'CREATE INDEX IF NOT EXISTS idx_paginas_estado_menu ON paginas(estado, mostrar_en_menu)'
    ];

    for (const indexSQL of indexes) {
      try {
        await this.exec(indexSQL);
      } catch (error) {
        console.error(`❌ Error creando índice: ${error.message}`);
      }
    }

    console.log('✅ Índices creados correctamente');
  }

  // Insertar datos básicos de secciones
  async insertSecciones() {
    console.log('🏕️ Insertando secciones scout...');

    const count = await this.query('SELECT COUNT(*) as count FROM secciones');
    if (count[0].count > 0) {
      console.log('✅ Secciones ya existen');
      return;
    }

    const secciones = [
      {
        nombre: 'castores',
        nombre_completo: 'Colonia La Veleta',
        edad_minima: 5,
        edad_maxima: 7,
        color_primario: '#FFA500',
        descripcion: 'Sección de los más pequeños del grupo, llena de juegos y diversión'
      },
      {
        nombre: 'lobatos',
        nombre_completo: 'Manada Waingunga',
        edad_minima: 7,
        edad_maxima: 10,
        color_primario: '#FFD700',
        descripcion: 'La manada donde los pequeños lobatos aprenden jugando'
      },
      {
        nombre: 'tropa',
        nombre_completo: 'Tropa Brownsea',
        edad_minima: 10,
        edad_maxima: 13,
        color_primario: '#228B22',
        descripcion: 'La tropa scout donde se forjan los verdaderos exploradores'
      },
      {
        nombre: 'pioneros',
        nombre_completo: 'Posta Kanhiwara',
        edad_minima: 13,
        edad_maxima: 16,
        color_primario: '#DC143C',
        descripcion: 'Los pioneros que se preparan para ser líderes del futuro'
      },
      {
        nombre: 'rutas',
        nombre_completo: 'Ruta Walhalla',
        edad_minima: 16,
        edad_maxima: 19,
        color_primario: '#006400',
        descripcion: 'La ruta final donde se completa la formación scout'
      }
    ];

    for (const seccion of secciones) {
      try {
        await this.exec(`
          INSERT INTO secciones (nombre, nombre_completo, edad_minima, edad_maxima, color_primario, descripcion)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          seccion.nombre,
          seccion.nombre_completo,
          seccion.edad_minima,
          seccion.edad_maxima,
          seccion.color_primario,
          seccion.descripcion
        ]);

        console.log(`✅ Sección ${seccion.nombre_completo} creada`);
      } catch (error) {
        console.error(`❌ Error creando sección ${seccion.nombre}:`, error.message);
      }
    }
  }

  // Insertar usuario administrador por defecto
  async insertAdminUser() {
    console.log('👤 Creando usuario administrador...');

    const existing = await this.query('SELECT id FROM usuarios WHERE email = ?', ['admin@osyris.com']);
    if (existing.length > 0) {
      console.log('✅ Usuario admin ya existe');
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash('admin123', 12);

      await this.exec(`
        INSERT INTO usuarios (
          nombre, apellidos, email, password, rol, activo
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'Administrador',
        'Sistema',
        'admin@osyris.com',
        hashedPassword,
        'admin',
        1
      ]);

      console.log('✅ Usuario administrador creado: admin@osyris.com / admin123');
    } catch (error) {
      console.error('❌ Error creando usuario admin:', error.message);
    }
  }

  // Insertar páginas de ejemplo
  async insertSamplePages() {
    console.log('📄 Creando páginas de ejemplo...');

    const existing = await this.query('SELECT COUNT(*) as count FROM paginas');
    if (existing[0].count > 0) {
      console.log('✅ Páginas ya existen');
      return;
    }

    // Obtener ID del admin
    const admin = await this.query('SELECT id FROM usuarios WHERE rol = "admin" LIMIT 1');
    if (admin.length === 0) {
      console.log('⚠️ No hay usuario admin para crear páginas');
      return;
    }

    const adminId = admin[0].id;

    const paginas = [
      {
        titulo: 'Inicio',
        slug: 'inicio',
        contenido: '<h1>Bienvenidos al Grupo Scout Osyris</h1><p>Un espacio donde los jóvenes crecen, aprenden y se divierten siguiendo el método scout.</p>',
        resumen: 'Página principal del grupo scout',
        meta_descripcion: 'Grupo Scout Osyris - Formación integral de jóvenes',
        estado: 'publicada',
        tipo: 'pagina',
        orden_menu: 1,
        mostrar_en_menu: 1
      },
      {
        titulo: 'Quiénes Somos',
        slug: 'quienes-somos',
        contenido: '<h2>Nuestra Historia</h2><p>El Grupo Scout Osyris es una comunidad comprometida con la formación integral de niños y jóvenes.</p>',
        resumen: 'Historia y misión del grupo',
        meta_descripcion: 'Conoce la historia y misión del Grupo Scout Osyris',
        estado: 'publicada',
        tipo: 'pagina',
        orden_menu: 2,
        mostrar_en_menu: 1
      },
      {
        titulo: 'Contacto',
        slug: 'contacto',
        contenido: '<h2>Contacta con Nosotros</h2><p>Email: info@osyris.com<br>Teléfono: 123-456-789</p>',
        resumen: 'Información de contacto',
        meta_descripcion: 'Contacta con el Grupo Scout Osyris',
        estado: 'publicada',
        tipo: 'pagina',
        orden_menu: 3,
        mostrar_en_menu: 1
      }
    ];

    for (const pagina of paginas) {
      try {
        await this.exec(`
          INSERT INTO paginas (
            titulo, slug, contenido, resumen, meta_descripcion,
            estado, tipo, orden_menu, mostrar_en_menu, creado_por, fecha_publicacion
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
          pagina.titulo,
          pagina.slug,
          pagina.contenido,
          pagina.resumen,
          pagina.meta_descripcion,
          pagina.estado,
          pagina.tipo,
          pagina.orden_menu,
          pagina.mostrar_en_menu,
          adminId
        ]);

        console.log(`✅ Página "${pagina.titulo}" creada`);
      } catch (error) {
        console.error(`❌ Error creando página ${pagina.titulo}:`, error.message);
      }
    }
  }

  // Verificar integridad final
  async verifyIntegrity() {
    console.log('🔍 Verificando integridad de la base de datos...');

    try {
      // Check de integridad
      const integrityCheck = await this.query('PRAGMA integrity_check');
      if (integrityCheck[0].integrity_check === 'ok') {
        console.log('✅ Integridad: OK');
      } else {
        console.error('❌ Problemas de integridad:', integrityCheck);
      }

      // Check de foreign keys
      const fkCheck = await this.query('PRAGMA foreign_key_check');
      if (fkCheck.length === 0) {
        console.log('✅ Foreign Keys: OK');
      } else {
        console.error('❌ Violaciones de foreign key:', fkCheck);
      }

      // Estadísticas
      const tables = ['usuarios', 'secciones', 'actividades', 'documentos', 'mensajes', 'paginas'];
      console.log('\n📊 Estadísticas de la base de datos:');

      for (const table of tables) {
        const count = await this.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${count[0].count} registros`);
      }

      // Configuración final
      const configs = await this.query(`
        SELECT
          (SELECT journal_mode FROM pragma_journal_mode()) as journal_mode,
          (SELECT foreign_keys FROM pragma_foreign_keys()) as foreign_keys,
          (SELECT cache_size FROM pragma_cache_size()) as cache_size
      `);

      console.log('\n⚙️ Configuración SQLite:');
      console.log(`   Journal Mode: ${configs[0].journal_mode}`);
      console.log(`   Foreign Keys: ${configs[0].foreign_keys ? 'Habilitadas' : 'Deshabilitadas'}`);
      console.log(`   Cache Size: ${configs[0].cache_size}`);

    } catch (error) {
      console.error('❌ Error verificando integridad:', error);
    }
  }

  // Ejecutar inicialización completa
  async initialize() {
    try {
      console.log('🚀 INICIANDO INICIALIZACIÓN COMPLETA DE BASE DE DATOS OSYRIS');
      console.log('='.repeat(70));

      await this.connect();
      await this.configureSQLite();
      await this.createTables();
      await this.createIndexes();
      await this.insertSecciones();
      await this.insertAdminUser();
      await this.insertSamplePages();
      await this.verifyIntegrity();

      console.log('='.repeat(70));
      console.log('✅ INICIALIZACIÓN COMPLETADA EXITOSAMENTE');
      console.log('📝 Credenciales admin: admin@osyris.com / admin123');
      console.log('='.repeat(70));

    } catch (error) {
      console.error('❌ Error durante la inicialización:', error);
      throw error;
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }

  // Cerrar conexión
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Ejecutar inicialización si se llama directamente
async function main() {
  const initializer = new DatabaseInitializer();
  try {
    await initializer.initialize();
  } catch (error) {
    console.error('💥 Inicialización fallida:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseInitializer;