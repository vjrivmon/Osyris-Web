/**
 * Tests for Track 2: Secciones Automaticas
 *
 * Tests the rangos_secciones model logic:
 * - Section calculation by birth year
 * - Automatic range calculation
 * - "Terminar Ronda" logic
 * - Edge cases: boundary birth years between sections
 * - Date range respect
 */

// Mock the database query function before requiring the model
jest.mock('../src/config/db.config', () => ({
  query: jest.fn()
}));

const { query } = require('../src/config/db.config');
const RangosSecciones = require('../src/models/rangos_secciones.model');

// Default seed rangos (matching the model's seed data)
const defaultRangos = [
  { id: 1, seccion_id: 1, edad_min: 6,  edad_max: 8,  activo: true, seccion_nombre: 'Castores' },
  { id: 2, seccion_id: 2, edad_min: 9,  edad_max: 11, activo: true, seccion_nombre: 'Lobatos' },
  { id: 3, seccion_id: 3, edad_min: 12, edad_max: 14, activo: true, seccion_nombre: 'Tropa' },
  { id: 4, seccion_id: 4, edad_min: 15, edad_max: 17, activo: true, seccion_nombre: 'Pioneros' },
  { id: 5, seccion_id: 5, edad_min: 18, edad_max: 20, activo: true, seccion_nombre: 'Rutas' },
];

// Helper: create an active ronda ending in a specific year
function mockActiveRonda(yearEnd) {
  return [{ id: 1, fecha_fin: `${yearEnd}-08-31` }];
}

// Helper: create an educando record
function makeEducando(id, nombre, fechaNacimiento, seccionId) {
  return {
    id,
    nombre,
    apellidos: 'Test',
    fecha_nacimiento: fechaNacimiento,
    seccion_id: seccionId,
    activo: true,
    seccion_nombre: defaultRangos.find(r => r.seccion_id === seccionId)?.seccion_nombre || null
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Section Calculation by Birth Year ────────────────────────────────

describe('calcularSeccion - Section calculation by birth year', () => {
  test('a kid born in 2017 should be in Castores when ronda ends in 2024 (age 7)', async () => {
    // edad_efectiva = 2024 - 2017 = 7 => Castores (6-8)
    query
      // 1. Query for educando
      .mockResolvedValueOnce([{
        id: 1, nombre: 'Pedro', apellidos: 'Garcia',
        fecha_nacimiento: '2017-03-15', seccion_id: 1
      }])
      // 2. Query for active ronda
      .mockResolvedValueOnce(mockActiveRonda(2024))
      // 3. Query for active rangos
      .mockResolvedValueOnce(defaultRangos)
      // 4. Query for current seccion
      .mockResolvedValueOnce([{ id: 1, nombre: 'Castores' }]);

    const result = await RangosSecciones.calcularSeccion(1);

    expect(result.edad_efectiva).toBe(7);
    expect(result.seccion_calculada).toEqual({ id: 1, nombre: 'Castores' });
    expect(result.cambio_necesario).toBe(false);
  });

  test('a kid born in 2014 should be in Lobatos when ronda ends in 2024 (age 10)', async () => {
    // edad_efectiva = 2024 - 2014 = 10 => Lobatos (9-11)
    query
      .mockResolvedValueOnce([{
        id: 2, nombre: 'Maria', apellidos: 'Lopez',
        fecha_nacimiento: '2014-06-20', seccion_id: 1 // Currently in Castores (wrong)
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 1, nombre: 'Castores' }]);

    const result = await RangosSecciones.calcularSeccion(2);

    expect(result.edad_efectiva).toBe(10);
    expect(result.seccion_calculada).toEqual({ id: 2, nombre: 'Lobatos' });
    expect(result.cambio_necesario).toBe(true);
  });

  test('a kid born in 2012 should be in Tropa when ronda ends in 2024 (age 12)', async () => {
    // edad_efectiva = 2024 - 2012 = 12 => Tropa (12-14)
    query
      .mockResolvedValueOnce([{
        id: 3, nombre: 'Carlos', apellidos: 'Ruiz',
        fecha_nacimiento: '2012-01-10', seccion_id: 3
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 3, nombre: 'Tropa' }]);

    const result = await RangosSecciones.calcularSeccion(3);

    expect(result.edad_efectiva).toBe(12);
    expect(result.seccion_calculada).toEqual({ id: 3, nombre: 'Tropa' });
    expect(result.cambio_necesario).toBe(false);
  });

  test('a kid born in 2006 should be in Rutas when ronda ends in 2024 (age 18)', async () => {
    // edad_efectiva = 2024 - 2006 = 18 => Rutas (18-20)
    query
      .mockResolvedValueOnce([{
        id: 4, nombre: 'Ana', apellidos: 'Martinez',
        fecha_nacimiento: '2006-11-05', seccion_id: 4 // Currently in Pioneros
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 4, nombre: 'Pioneros' }]);

    const result = await RangosSecciones.calcularSeccion(4);

    expect(result.edad_efectiva).toBe(18);
    expect(result.seccion_calculada).toEqual({ id: 5, nombre: 'Rutas' });
    expect(result.cambio_necesario).toBe(true);
  });

  test('throws error when educando not found', async () => {
    query.mockResolvedValueOnce([]);

    await expect(RangosSecciones.calcularSeccion(999))
      .rejects.toThrow('Educando no encontrado');
  });

  test('throws error when educando has no birth date', async () => {
    query.mockResolvedValueOnce([{
      id: 5, nombre: 'Sin', apellidos: 'Fecha',
      fecha_nacimiento: null, seccion_id: 1
    }]);

    await expect(RangosSecciones.calcularSeccion(5))
      .rejects.toThrow('El educando no tiene fecha de nacimiento registrada');
  });

  test('throws error when no active ronda', async () => {
    query
      .mockResolvedValueOnce([{
        id: 6, nombre: 'Test', apellidos: 'Test',
        fecha_nacimiento: '2015-01-01', seccion_id: 1
      }])
      .mockResolvedValueOnce([]); // No active ronda

    await expect(RangosSecciones.calcularSeccion(6))
      .rejects.toThrow('No hay ronda activa');
  });

  test('returns null seccion_calculada when age is out of all ranges', async () => {
    // edad_efectiva = 2024 - 2020 = 4 => below all ranges (min is 6)
    query
      .mockResolvedValueOnce([{
        id: 7, nombre: 'Bebe', apellidos: 'Pequeno',
        fecha_nacimiento: '2020-01-01', seccion_id: 1
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 1, nombre: 'Castores' }]);

    const result = await RangosSecciones.calcularSeccion(7);

    expect(result.edad_efectiva).toBe(4);
    expect(result.seccion_calculada).toBeNull();
    expect(result.cambio_necesario).toBe(false);
  });
});

// ── Automatic Range Calculation (calcularTodos) ──────────────────────

describe('calcularTodos - Automatic range calculation for all educandos', () => {
  function setupCalcularTodosMocks(educandos, rondaYear = 2024) {
    query
      // 1. Active ronda
      .mockResolvedValueOnce(mockActiveRonda(rondaYear))
      // 2. Active rangos
      .mockResolvedValueOnce(defaultRangos)
      // 3. Rutas section ID
      .mockResolvedValueOnce([{ id: 5 }])
      // 4. All active educandos
      .mockResolvedValueOnce(educandos);
  }

  test('correctly categorizes educandos into movidos, sinCambio, sinRango', async () => {
    const educandos = [
      makeEducando(1, 'Bien',  '2017-05-01', 1), // age 7 => Castores (correct, sinCambio)
      makeEducando(2, 'Mover', '2014-03-01', 1), // age 10 => Lobatos (wrong, movidos)
      makeEducando(3, 'Viejo', '2000-01-01', 5), // age 24 => out of range (sinRango)
    ];

    setupCalcularTodosMocks(educandos);

    const result = await RangosSecciones.calcularTodos();

    expect(result.sinCambio).toHaveLength(1);
    expect(result.sinCambio[0].nombre).toBe('Bien');

    expect(result.movidos).toHaveLength(1);
    expect(result.movidos[0].nombre).toBe('Mover');
    expect(result.movidos[0].seccion_nueva_id).toBe(2); // Lobatos

    expect(result.sinRango).toHaveLength(1);
    expect(result.sinRango[0].nombre).toBe('Viejo');
    expect(result.sinRango[0].razon).toBe('Edad fuera de rangos');
  });

  test('educandos without fecha_nacimiento go to sinRango', async () => {
    const educandos = [
      { id: 10, nombre: 'SinFecha', apellidos: 'Test', fecha_nacimiento: null, seccion_id: 1, seccion_nombre: 'Castores', activo: true }
    ];

    setupCalcularTodosMocks(educandos);

    const result = await RangosSecciones.calcularTodos();

    expect(result.sinRango).toHaveLength(1);
    expect(result.sinRango[0].razon).toBe('Sin fecha de nacimiento');
  });

  test('educandos currently in Rutas go to pendientesRutas, not movidos', async () => {
    const educandos = [
      // In Rutas, calculated section would be different (e.g. age 15 => Pioneros)
      // But actually the Rutas check is: if seccion_id === rutasSeccionId, push to pendientesRutas
      makeEducando(20, 'RutasMember', '2009-01-01', 5), // age 15 => Pioneros, but in Rutas
    ];

    setupCalcularTodosMocks(educandos);

    const result = await RangosSecciones.calcularTodos();

    // This educando is in Rutas (seccion_id=5) and the calculated section is Pioneros (seccion_id=4)
    // Since they're different AND current is Rutas, they go to pendientesRutas
    expect(result.pendientesRutas).toHaveLength(1);
    expect(result.pendientesRutas[0].nombre).toBe('RutasMember');
    expect(result.movidos).toHaveLength(0);
  });

  test('throws error when no active ronda', async () => {
    query.mockResolvedValueOnce([]); // No active ronda

    await expect(RangosSecciones.calcularTodos())
      .rejects.toThrow('No hay ronda activa');
  });
});

// ── "Terminar Ronda" Logic ───────────────────────────────────────────

describe('aplicarMovimientos - Terminar Ronda logic', () => {
  test('updates seccion_id for each moved educando', async () => {
    const movidos = [
      { id: 1, nombre: 'Test1', seccion_nueva_id: 2 },
      { id: 2, nombre: 'Test2', seccion_nueva_id: 3 },
    ];

    query.mockResolvedValue(undefined);

    const result = await RangosSecciones.aplicarMovimientos(movidos);

    expect(result).toHaveLength(2);
    expect(query).toHaveBeenCalledTimes(2);

    // Verify the UPDATE query is called with correct params
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE educandos SET seccion_id'),
      [2, 1]
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE educandos SET seccion_id'),
      [3, 2]
    );
  });

  test('returns empty array when no movements needed', async () => {
    const result = await RangosSecciones.aplicarMovimientos([]);
    expect(result).toHaveLength(0);
    expect(query).not.toHaveBeenCalled();
  });
});

// ── Edge Cases: Birth Year at Boundary Between Sections ──────────────

describe('Edge cases - boundary birth years', () => {
  test('age exactly at edad_min boundary (6 years = start of Castores)', async () => {
    // edad_efectiva = 2024 - 2018 = 6 => Castores (6-8) -- exactly edad_min
    query
      .mockResolvedValueOnce([{
        id: 30, nombre: 'JustCastor', apellidos: 'Min',
        fecha_nacimiento: '2018-01-01', seccion_id: 1
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 1, nombre: 'Castores' }]);

    const result = await RangosSecciones.calcularSeccion(30);

    expect(result.edad_efectiva).toBe(6);
    expect(result.seccion_calculada).toEqual({ id: 1, nombre: 'Castores' });
  });

  test('age exactly at edad_max boundary (8 years = end of Castores)', async () => {
    // edad_efectiva = 2024 - 2016 = 8 => Castores (6-8) -- exactly edad_max
    query
      .mockResolvedValueOnce([{
        id: 31, nombre: 'LastCastor', apellidos: 'Max',
        fecha_nacimiento: '2016-01-01', seccion_id: 1
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 1, nombre: 'Castores' }]);

    const result = await RangosSecciones.calcularSeccion(31);

    expect(result.edad_efectiva).toBe(8);
    expect(result.seccion_calculada).toEqual({ id: 1, nombre: 'Castores' });
  });

  test('age at transition boundary: 8 (Castores max) to 9 (Lobatos min)', async () => {
    // edad_efectiva = 2024 - 2015 = 9 => Lobatos (9-11)
    query
      .mockResolvedValueOnce([{
        id: 32, nombre: 'NuevoLobato', apellidos: 'Trans',
        fecha_nacimiento: '2015-01-01', seccion_id: 1 // Still in Castores
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 1, nombre: 'Castores' }]);

    const result = await RangosSecciones.calcularSeccion(32);

    expect(result.edad_efectiva).toBe(9);
    expect(result.seccion_calculada).toEqual({ id: 2, nombre: 'Lobatos' });
    expect(result.cambio_necesario).toBe(true);
  });

  test('age below minimum range (5 years, below Castores min of 6)', async () => {
    // edad_efectiva = 2024 - 2019 = 5 => below all ranges
    query
      .mockResolvedValueOnce([{
        id: 33, nombre: 'MuyJoven', apellidos: 'Bebe',
        fecha_nacimiento: '2019-01-01', seccion_id: 1
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 1, nombre: 'Castores' }]);

    const result = await RangosSecciones.calcularSeccion(33);

    expect(result.edad_efectiva).toBe(5);
    expect(result.seccion_calculada).toBeNull();
  });

  test('age above maximum range (21 years, above Rutas max of 20)', async () => {
    // edad_efectiva = 2024 - 2003 = 21 => above all ranges
    query
      .mockResolvedValueOnce([{
        id: 34, nombre: 'MuyMayor', apellidos: 'Adulto',
        fecha_nacimiento: '2003-01-01', seccion_id: 5
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 5, nombre: 'Rutas' }]);

    const result = await RangosSecciones.calcularSeccion(34);

    expect(result.edad_efectiva).toBe(21);
    expect(result.seccion_calculada).toBeNull();
  });

  test('age exactly at Rutas max boundary (20 years)', async () => {
    // edad_efectiva = 2024 - 2004 = 20 => Rutas (18-20)
    query
      .mockResolvedValueOnce([{
        id: 35, nombre: 'UltimaRuta', apellidos: 'Max',
        fecha_nacimiento: '2004-01-01', seccion_id: 5
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 5, nombre: 'Rutas' }]);

    const result = await RangosSecciones.calcularSeccion(35);

    expect(result.edad_efectiva).toBe(20);
    expect(result.seccion_calculada).toEqual({ id: 5, nombre: 'Rutas' });
    expect(result.cambio_necesario).toBe(false);
  });
});

// ── Section Assignment Respects Ronda Date ───────────────────────────

describe('Section assignment respects ronda fecha_fin', () => {
  test('same birth year gives different section with different ronda end year', async () => {
    const fechaNacimiento = '2014-06-15';

    // Ronda ending 2024: edad_efectiva = 2024 - 2014 = 10 => Lobatos (9-11)
    query
      .mockResolvedValueOnce([{
        id: 40, nombre: 'Test', apellidos: 'Ronda',
        fecha_nacimiento: fechaNacimiento, seccion_id: 2
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 2, nombre: 'Lobatos' }]);

    const result2024 = await RangosSecciones.calcularSeccion(40);
    expect(result2024.edad_efectiva).toBe(10);
    expect(result2024.seccion_calculada.nombre).toBe('Lobatos');

    jest.clearAllMocks();

    // Ronda ending 2026: edad_efectiva = 2026 - 2014 = 12 => Tropa (12-14)
    query
      .mockResolvedValueOnce([{
        id: 40, nombre: 'Test', apellidos: 'Ronda',
        fecha_nacimiento: fechaNacimiento, seccion_id: 2
      }])
      .mockResolvedValueOnce(mockActiveRonda(2026))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 2, nombre: 'Lobatos' }]);

    const result2026 = await RangosSecciones.calcularSeccion(40);
    expect(result2026.edad_efectiva).toBe(12);
    expect(result2026.seccion_calculada.nombre).toBe('Tropa');
    expect(result2026.cambio_necesario).toBe(true);
  });

  test('birth month (Sep-Dec) does not alter year-based calculation', async () => {
    // Kid born December 2016, ronda ending 2024
    // edad_efectiva = 2024 - 2016 = 8 => Castores (6-8)
    // The code comments say Sep-Dec birthdays are handled by year-based calc
    query
      .mockResolvedValueOnce([{
        id: 41, nombre: 'Diciembre', apellidos: 'Test',
        fecha_nacimiento: '2016-12-31', seccion_id: 1
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 1, nombre: 'Castores' }]);

    const result = await RangosSecciones.calcularSeccion(41);

    expect(result.edad_efectiva).toBe(8);
    expect(result.mes_nacimiento).toBe(12);
    expect(result.seccion_calculada).toEqual({ id: 1, nombre: 'Castores' });
  });

  test('kid born January vs December same year get same effective age', async () => {
    // Both born 2015, ronda ending 2024 => edad_efectiva = 9 for both
    query
      .mockResolvedValueOnce([{
        id: 42, nombre: 'Enero', apellidos: 'Test',
        fecha_nacimiento: '2015-01-01', seccion_id: 2
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 2, nombre: 'Lobatos' }]);

    const resultJan = await RangosSecciones.calcularSeccion(42);

    jest.clearAllMocks();

    query
      .mockResolvedValueOnce([{
        id: 43, nombre: 'Diciembre', apellidos: 'Test',
        fecha_nacimiento: '2015-12-31', seccion_id: 2
      }])
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 2, nombre: 'Lobatos' }]);

    const resultDec = await RangosSecciones.calcularSeccion(43);

    // Both should have the same effective age regardless of month
    expect(resultJan.edad_efectiva).toBe(resultDec.edad_efectiva);
    expect(resultJan.seccion_calculada.nombre).toBe(resultDec.seccion_calculada.nombre);
  });
});

// ── Model CRUD Operations ────────────────────────────────────────────

describe('Model CRUD operations', () => {
  test('findAll returns rangos with section info', async () => {
    query.mockResolvedValueOnce(defaultRangos);

    const result = await RangosSecciones.findAll();

    expect(result).toHaveLength(5);
    expect(result[0].seccion_nombre).toBe('Castores');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('JOIN secciones'));
  });

  test('findById returns single rango or null', async () => {
    query.mockResolvedValueOnce([defaultRangos[0]]);
    const result = await RangosSecciones.findById(1);
    expect(result.seccion_nombre).toBe('Castores');

    jest.clearAllMocks();

    query.mockResolvedValueOnce([]);
    const resultNull = await RangosSecciones.findById(999);
    expect(resultNull).toBeNull();
  });

  test('update modifies and returns updated rango', async () => {
    // update calls query then findById
    query
      .mockResolvedValueOnce(undefined) // UPDATE query
      .mockResolvedValueOnce([{ ...defaultRangos[0], edad_min: 5 }]); // findById after update

    const result = await RangosSecciones.update(1, { edad_min: 5 });

    expect(result.edad_min).toBe(5);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE rangos_secciones'),
      expect.arrayContaining([5, 1])
    );
  });

  test('update with no fields returns current value via findById', async () => {
    query.mockResolvedValueOnce([defaultRangos[0]]);

    const result = await RangosSecciones.update(1, {});

    expect(result.seccion_nombre).toBe('Castores');
    // Should only call findById, not UPDATE
    expect(query).toHaveBeenCalledTimes(1);
  });

  test('update handles multiple fields', async () => {
    query
      .mockResolvedValueOnce(undefined) // UPDATE
      .mockResolvedValueOnce([{ ...defaultRangos[0], edad_min: 5, edad_max: 9, activo: false }]);

    const result = await RangosSecciones.update(1, { edad_min: 5, edad_max: 9, activo: false });

    expect(result.edad_min).toBe(5);
    expect(result.edad_max).toBe(9);
    expect(result.activo).toBe(false);
  });
});

// ── calcularTodos with Rutas boundary ────────────────────────────────

describe('calcularTodos - Rutas special handling', () => {
  test('educandos in Rutas whose calculated section differs go to pendientesRutas', async () => {
    const educandos = [
      // In Rutas (seccion_id=5), but age 15 => Pioneros. Should go to pendientesRutas.
      makeEducando(50, 'RutaViejo', '2009-01-01', 5),
      // In Rutas (seccion_id=5), age 19 => Rutas. Should go to sinCambio.
      makeEducando(51, 'RutaBien', '2005-01-01', 5),
    ];

    query
      .mockResolvedValueOnce(mockActiveRonda(2024))
      .mockResolvedValueOnce(defaultRangos)
      .mockResolvedValueOnce([{ id: 5 }]) // Rutas section ID
      .mockResolvedValueOnce(educandos);

    const result = await RangosSecciones.calcularTodos();

    expect(result.pendientesRutas).toHaveLength(1);
    expect(result.pendientesRutas[0].nombre).toBe('RutaViejo');

    expect(result.sinCambio).toHaveLength(1);
    expect(result.sinCambio[0].nombre).toBe('RutaBien');

    expect(result.movidos).toHaveLength(0);
  });
});
