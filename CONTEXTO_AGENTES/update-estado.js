#!/usr/bin/env node

/**
 * Script Helper para Actualizar Estados de Roadmaps
 *
 * Uso:
 * node update-estado.js <roadmap_name> <comando> [opciones]
 *
 * Comandos:
 * - marcar-tarea-completada <fase_num> <tarea_id>
 * - iniciar-fase <fase_num>
 * - completar-fase <fase_num>
 * - actualizar-tiempo <horas_invertidas>
 * - ver-estado
 *
 * Ejemplos:
 * node update-estado.js DASHBOARD_ADMIN marcar-tarea-completada 1 1.1
 * node update-estado.js DASHBOARD_ADMIN iniciar-fase 3
 * node update-estado.js DASHBOARD_ADMIN completar-fase 1
 * node update-estado.js DASHBOARD_ADMIN actualizar-tiempo 1.5
 * node update-estado.js DASHBOARD_ADMIN ver-estado
 */

const fs = require('fs');
const path = require('path');

// Constantes
const CONTEXTO_DIR = __dirname;
const ESTADOS_POSIBLES = ['pendiente', 'en_progreso', 'completado'];
const ESTADOS_GENERALES = ['no_iniciado', 'en_progreso', 'completado'];

// Argumentos de línea de comandos
const [, , roadmapName, comando, ...args] = process.argv;

if (!roadmapName || !comando) {
  console.error('❌ Error: Faltan argumentos');
  console.log('\nUso:');
  console.log('  node update-estado.js <roadmap_name> <comando> [opciones]');
  console.log('\nComandos disponibles:');
  console.log('  marcar-tarea-completada <fase_num> <tarea_id>');
  console.log('  iniciar-fase <fase_num>');
  console.log('  completar-fase <fase_num>');
  console.log('  actualizar-tiempo <horas>');
  console.log('  ver-estado');
  process.exit(1);
}

// Construir path del archivo
const estadoPath = path.join(CONTEXTO_DIR, `ROADMAP_${roadmapName}_estado.json`);

// Verificar que el archivo existe
if (!fs.existsSync(estadoPath)) {
  console.error(`❌ Error: No se encontró el archivo ${estadoPath}`);
  process.exit(1);
}

// Leer el archivo de estado
function leerEstado() {
  try {
    const contenido = fs.readFileSync(estadoPath, 'utf-8');
    return JSON.parse(contenido);
  } catch (error) {
    console.error('❌ Error al leer el archivo de estado:', error.message);
    process.exit(1);
  }
}

// Guardar el archivo de estado
function guardarEstado(estado) {
  try {
    const contenido = JSON.stringify(estado, null, 2);
    fs.writeFileSync(estadoPath, contenido, 'utf-8');

    // Actualizar fecha de última actualización
    estado.ultima_actualizacion = new Date().toISOString().split('T')[0];
    fs.writeFileSync(estadoPath, JSON.stringify(estado, null, 2), 'utf-8');

    console.log('✅ Estado actualizado correctamente');
  } catch (error) {
    console.error('❌ Error al guardar el archivo de estado:', error.message);
    process.exit(1);
  }
}

// Buscar una fase por número
function buscarFase(estado, faseNum) {
  const fase = estado.fases.find(f => f.numero === parseInt(faseNum));
  if (!fase) {
    console.error(`❌ Error: No se encontró la fase ${faseNum}`);
    process.exit(1);
  }
  return fase;
}

// Comandos

function marcarTareaCompletada(faseNum, tareaId) {
  const estado = leerEstado();
  const fase = buscarFase(estado, faseNum);

  const tarea = fase.tareas.find(t => t.id === tareaId);
  if (!tarea) {
    console.error(`❌ Error: No se encontró la tarea ${tareaId} en la fase ${faseNum}`);
    process.exit(1);
  }

  tarea.completado = true;

  // Verificar si todas las tareas de la fase están completadas
  const todasCompletadas = fase.tareas.every(t => t.completado);
  if (todasCompletadas) {
    fase.estado = 'completado';
    console.log(`✅ Todas las tareas de la FASE ${faseNum} completadas. Fase marcada como completada.`);
  }

  // Actualizar estado general
  actualizarEstadoGeneral(estado);

  guardarEstado(estado);
  console.log(`✅ Tarea ${tareaId} marcada como completada`);
}

function iniciarFase(faseNum) {
  const estado = leerEstado();
  const fase = buscarFase(estado, faseNum);

  if (fase.estado === 'completado') {
    console.log(`⚠️  La FASE ${faseNum} ya está completada`);
    return;
  }

  fase.estado = 'en_progreso';

  // Actualizar estado general a "en_progreso" si estaba en "no_iniciado"
  if (estado.estado_general === 'no_iniciado') {
    estado.estado_general = 'en_progreso';
  }

  guardarEstado(estado);
  console.log(`✅ FASE ${faseNum} iniciada`);
}

function completarFase(faseNum) {
  const estado = leerEstado();
  const fase = buscarFase(estado, faseNum);

  // Marcar todas las tareas como completadas
  fase.tareas.forEach(t => t.completado = true);
  fase.estado = 'completado';

  // Actualizar estado general
  actualizarEstadoGeneral(estado);

  guardarEstado(estado);
  console.log(`✅ FASE ${faseNum} completada`);
}

function actualizarTiempo(horas) {
  const estado = leerEstado();

  const horasNum = parseFloat(horas);
  if (isNaN(horasNum)) {
    console.error('❌ Error: Las horas deben ser un número');
    process.exit(1);
  }

  estado.tiempo_invertido = `${horasNum} horas`;

  guardarEstado(estado);
  console.log(`✅ Tiempo invertido actualizado a ${horasNum} horas`);
}

function verEstado() {
  const estado = leerEstado();

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`📊 ESTADO: ${estado.nombre_proyecto}`);
  console.log('════════════════════════════════════════════════════════════\n');

  console.log(`Estado general:     ${obtenerEmojiEstado(estado.estado_general)} ${estado.estado_general}`);
  console.log(`Estimación total:   ${estado.estimacion_total}`);
  console.log(`Tiempo invertido:   ${estado.tiempo_invertido}`);
  console.log(`Última actualización: ${estado.ultima_actualizacion}\n`);

  console.log('Fases:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  estado.fases.forEach(fase => {
    const tareasCompletadas = fase.tareas.filter(t => t.completado).length;
    const totalTareas = fase.tareas.length;
    const porcentaje = Math.round((tareasCompletadas / totalTareas) * 100);

    console.log(`${obtenerEmojiEstado(fase.estado)} FASE ${fase.numero}: ${fase.titulo}`);
    console.log(`   Prioridad: ${fase.prioridad}`);
    console.log(`   Estado: ${fase.estado}`);
    console.log(`   Tareas: ${tareasCompletadas}/${totalTareas} (${porcentaje}%)`);
    console.log(`   Estimación: ${fase.estimacion}\n`);
  });

  console.log('════════════════════════════════════════════════════════════\n');

  // Calcular progreso general
  const totalFases = estado.fases.length;
  const fasesCompletadas = estado.fases.filter(f => f.estado === 'completado').length;
  const progresoGeneral = Math.round((fasesCompletadas / totalFases) * 100);

  console.log(`📈 Progreso general: ${fasesCompletadas}/${totalFases} fases (${progresoGeneral}%)\n`);
}

function actualizarEstadoGeneral(estado) {
  const totalFases = estado.fases.length;
  const fasesCompletadas = estado.fases.filter(f => f.estado === 'completado').length;

  if (fasesCompletadas === 0) {
    estado.estado_general = 'no_iniciado';
  } else if (fasesCompletadas === totalFases) {
    estado.estado_general = 'completado';
  } else {
    estado.estado_general = 'en_progreso';
  }
}

function obtenerEmojiEstado(estado) {
  const emojis = {
    'no_iniciado': '⏳',
    'pendiente': '⏳',
    'en_progreso': '🔄',
    'completado': '✅'
  };
  return emojis[estado] || '❓';
}

// Ejecutar comando
switch (comando) {
  case 'marcar-tarea-completada':
    if (args.length < 2) {
      console.error('❌ Error: Faltan argumentos. Uso: marcar-tarea-completada <fase_num> <tarea_id>');
      process.exit(1);
    }
    marcarTareaCompletada(args[0], args[1]);
    break;

  case 'iniciar-fase':
    if (args.length < 1) {
      console.error('❌ Error: Falta el número de fase. Uso: iniciar-fase <fase_num>');
      process.exit(1);
    }
    iniciarFase(args[0]);
    break;

  case 'completar-fase':
    if (args.length < 1) {
      console.error('❌ Error: Falta el número de fase. Uso: completar-fase <fase_num>');
      process.exit(1);
    }
    completarFase(args[0]);
    break;

  case 'actualizar-tiempo':
    if (args.length < 1) {
      console.error('❌ Error: Falta las horas. Uso: actualizar-tiempo <horas>');
      process.exit(1);
    }
    actualizarTiempo(args[0]);
    break;

  case 'ver-estado':
    verEstado();
    break;

  default:
    console.error(`❌ Error: Comando desconocido '${comando}'`);
    console.log('\nComandos disponibles:');
    console.log('  marcar-tarea-completada <fase_num> <tarea_id>');
    console.log('  iniciar-fase <fase_num>');
    console.log('  completar-fase <fase_num>');
    console.log('  actualizar-tiempo <horas>');
    console.log('  ver-estado');
    process.exit(1);
}
