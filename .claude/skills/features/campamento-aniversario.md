# Feature: Campamento de Aniversario - Inscripción Familias Tropa

## Descripción

Implementar sistema de inscripción para el campamento de aniversario del grupo scout. Solo las familias con educandos en Tropa Brownsea (sección 3) pueden inscribirse.

## Alcance

- **Quién puede inscribirse**: Familias con educandos en Tropa (seccion_id = 3)
- **Qué hacen**: Llenar formulario de inscripción, confirmar datos, indicar forma de pago
- **Quién ve las inscripciones**: Kraal de Tropa y Comité

## Archivos a Crear

### Backend
1. `api-osyris/src/controllers/campamentos.controller.js`
2. `api-osyris/src/routes/campamentos.routes.js`
3. `api-osyris/src/models/campamentos.model.js`
4. `api-osyris/database/migrations/002_campamentos.sql`

### Frontend
5. `src/app/familia/campamentos/page.tsx`
6. `src/app/familia/campamentos/[id]/inscripcion/page.tsx`
7. `src/components/familia/campamentos/campamento-card.tsx`
8. `src/components/familia/campamentos/inscripcion-form.tsx`
9. `src/hooks/useCampamentos.ts`
10. `src/app/aula-virtual/campamentos/page.tsx` (vista Kraal)
11. `src/components/aula-virtual/campamentos/inscripciones-list.tsx`

## Base de Datos

### Tabla: campamentos

```sql
CREATE TABLE campamentos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  ubicacion VARCHAR(255),
  precio DECIMAL(10,2) DEFAULT 0,
  plazas_totales INT DEFAULT 0,
  seccion_id INT REFERENCES secciones(id),
  estado VARCHAR(50) DEFAULT 'abierto', -- abierto, cerrado, completo
  fecha_limite_inscripcion DATE,
  documentos_requeridos JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_campamentos_seccion ON campamentos(seccion_id);
CREATE INDEX idx_campamentos_estado ON campamentos(estado);
CREATE INDEX idx_campamentos_fechas ON campamentos(fecha_inicio, fecha_fin);
```

### Tabla: inscripciones_campamento

```sql
CREATE TABLE inscripciones_campamento (
  id SERIAL PRIMARY KEY,
  campamento_id INT NOT NULL REFERENCES campamentos(id),
  educando_id INT NOT NULL REFERENCES educandos(id),
  familia_id INT NOT NULL REFERENCES familias(id),

  -- Datos de inscripción
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, confirmada, cancelada, pagada
  metodo_pago VARCHAR(50), -- transferencia, efectivo, bizum
  notas_familia TEXT,

  -- Datos médicos/autorizaciones (copia en momento de inscripción)
  alergias TEXT,
  medicacion TEXT,
  observaciones_medicas TEXT,
  autorizacion_imagenes BOOLEAN DEFAULT false,
  autorizacion_salida BOOLEAN DEFAULT false,

  -- Contacto emergencia
  contacto_emergencia_nombre VARCHAR(255),
  contacto_emergencia_telefono VARCHAR(20),

  -- Timestamps
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_confirmacion TIMESTAMP,
  fecha_pago TIMESTAMP,

  -- Constraints
  UNIQUE(campamento_id, educando_id)
);

-- Índices
CREATE INDEX idx_inscripciones_campamento ON inscripciones_campamento(campamento_id);
CREATE INDEX idx_inscripciones_educando ON inscripciones_campamento(educando_id);
CREATE INDEX idx_inscripciones_familia ON inscripciones_campamento(familia_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones_campamento(estado);
```

## API Endpoints

### Campamentos (Público/Familia)

```
GET  /api/campamentos                    # Listar campamentos disponibles para familia
GET  /api/campamentos/:id                # Detalle de campamento
GET  /api/campamentos/:id/plazas         # Plazas disponibles
```

### Inscripciones (Familia)

```
POST /api/campamentos/:id/inscripcion    # Inscribirse
GET  /api/familia/inscripciones          # Mis inscripciones
PUT  /api/inscripciones/:id              # Actualizar inscripción
DELETE /api/inscripciones/:id            # Cancelar inscripción
```

### Admin/Kraal

```
GET  /api/admin/campamentos              # Listar todos los campamentos
POST /api/admin/campamentos              # Crear campamento
PUT  /api/admin/campamentos/:id          # Editar campamento
GET  /api/admin/campamentos/:id/inscripciones # Ver inscripciones
PUT  /api/admin/inscripciones/:id/estado # Cambiar estado inscripción
GET  /api/admin/campamentos/:id/export   # Exportar lista
```

## Implementación

### Paso 1: Migración de Base de Datos

Crear `api-osyris/database/migrations/002_campamentos.sql` con las tablas anteriores.

### Paso 2: Modelo y Controlador Backend

`api-osyris/src/models/campamentos.model.js`:

```javascript
const pool = require('../config/db.config');

const CampamentosModel = {
  // Obtener campamentos disponibles para una familia
  async getDisponiblesParaFamilia(familiaId) {
    const query = `
      SELECT c.*,
             COUNT(ic.id) as inscritos,
             c.plazas_totales - COUNT(ic.id) as plazas_disponibles
      FROM campamentos c
      LEFT JOIN inscripciones_campamento ic ON c.id = ic.campamento_id
      WHERE c.estado = 'abierto'
        AND c.fecha_limite_inscripcion >= CURRENT_DATE
        AND c.seccion_id IN (
          SELECT seccion_id FROM educandos e
          JOIN familiar_educando fe ON e.id = fe.educando_id
          WHERE fe.familiar_id IN (
            SELECT id FROM familiares WHERE familia_id = $1
          )
        )
      GROUP BY c.id
      ORDER BY c.fecha_inicio
    `;
    const result = await pool.query(query, [familiaId]);
    return result.rows;
  },

  // Crear inscripción
  async crearInscripcion(data) {
    const {
      campamento_id, educando_id, familia_id,
      metodo_pago, notas_familia,
      alergias, medicacion, observaciones_medicas,
      autorizacion_imagenes, autorizacion_salida,
      contacto_emergencia_nombre, contacto_emergencia_telefono
    } = data;

    const query = `
      INSERT INTO inscripciones_campamento (
        campamento_id, educando_id, familia_id,
        metodo_pago, notas_familia,
        alergias, medicacion, observaciones_medicas,
        autorizacion_imagenes, autorizacion_salida,
        contacto_emergencia_nombre, contacto_emergencia_telefono
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await pool.query(query, [
      campamento_id, educando_id, familia_id,
      metodo_pago, notas_familia,
      alergias, medicacion, observaciones_medicas,
      autorizacion_imagenes, autorizacion_salida,
      contacto_emergencia_nombre, contacto_emergencia_telefono
    ]);

    return result.rows[0];
  },

  // Obtener inscripciones de un campamento (para Kraal)
  async getInscripcionesCampamento(campamentoId) {
    const query = `
      SELECT ic.*,
             e.nombre as educando_nombre,
             e.apellidos as educando_apellidos,
             f.email as familia_email
      FROM inscripciones_campamento ic
      JOIN educandos e ON ic.educando_id = e.id
      JOIN familias f ON ic.familia_id = f.id
      WHERE ic.campamento_id = $1
      ORDER BY ic.fecha_inscripcion
    `;
    const result = await pool.query(query, [campamentoId]);
    return result.rows;
  }
};

module.exports = CampamentosModel;
```

### Paso 3: Controlador

`api-osyris/src/controllers/campamentos.controller.js`:

```javascript
const CampamentosModel = require('../models/campamentos.model');

// GET /api/campamentos (para familias)
const getCampamentosDisponibles = async (req, res) => {
  try {
    const familiaId = req.familia.id; // Middleware de auth familia
    const campamentos = await CampamentosModel.getDisponiblesParaFamilia(familiaId);
    res.json(campamentos);
  } catch (error) {
    console.error('Error obteniendo campamentos:', error);
    res.status(500).json({ error: 'Error al obtener campamentos' });
  }
};

// POST /api/campamentos/:id/inscripcion
const inscribirse = async (req, res) => {
  try {
    const { id: campamentoId } = req.params;
    const familiaId = req.familia.id;
    const { educandoId, ...datosInscripcion } = req.body;

    // Validar que el educando pertenece a la familia
    const educandoValido = await validarEducandoFamilia(educandoId, familiaId);
    if (!educandoValido) {
      return res.status(403).json({ error: 'El educando no pertenece a tu familia' });
    }

    // Validar que el educando está en la sección del campamento
    const educandoEnSeccion = await validarEducandoSeccion(educandoId, campamentoId);
    if (!educandoEnSeccion) {
      return res.status(403).json({ error: 'El educando no está en la sección de este campamento' });
    }

    // Verificar plazas disponibles
    const plazasDisponibles = await verificarPlazas(campamentoId);
    if (plazasDisponibles <= 0) {
      return res.status(400).json({ error: 'No hay plazas disponibles' });
    }

    // Crear inscripción
    const inscripcion = await CampamentosModel.crearInscripcion({
      campamento_id: campamentoId,
      educando_id: educandoId,
      familia_id: familiaId,
      ...datosInscripcion
    });

    // Enviar notificación
    await enviarNotificacionInscripcion(inscripcion);

    res.status(201).json({
      message: 'Inscripción realizada exitosamente',
      inscripcion
    });

  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Este educando ya está inscrito' });
    }
    console.error('Error en inscripción:', error);
    res.status(500).json({ error: 'Error al procesar inscripción' });
  }
};

module.exports = {
  getCampamentosDisponibles,
  inscribirse,
  // ... otros métodos
};
```

### Paso 4: Rutas

`api-osyris/src/routes/campamentos.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { authFamilia, authScouter } = require('../middleware/auth.middleware');
const campamentosController = require('../controllers/campamentos.controller');

// Rutas familia
router.get('/', authFamilia, campamentosController.getCampamentosDisponibles);
router.get('/:id', authFamilia, campamentosController.getCampamentoDetalle);
router.post('/:id/inscripcion', authFamilia, campamentosController.inscribirse);

// Rutas admin/kraal
router.get('/admin', authScouter, campamentosController.getAllCampamentos);
router.get('/admin/:id/inscripciones', authScouter, campamentosController.getInscripciones);
router.put('/admin/inscripciones/:id/estado', authScouter, campamentosController.cambiarEstado);

module.exports = router;
```

### Paso 5: Frontend - Página de Campamentos

`src/app/familia/campamentos/page.tsx`:

```typescript
'use client';

import { useCampamentos } from '@/hooks/useCampamentos';
import { CampamentoCard } from '@/components/familia/campamentos/campamento-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Info } from 'lucide-react';

export default function CampamentosPage() {
  const { campamentos, loading, error } = useCampamentos();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Campamentos</h1>
        <p className="text-muted-foreground">
          Inscribe a tus hijos en los próximos campamentos
        </p>
      </div>

      {campamentos.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No hay campamentos disponibles para inscripción en este momento.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {campamentos.map((campamento) => (
            <CampamentoCard key={campamento.id} campamento={campamento} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Paso 6: Componente de Tarjeta de Campamento

`src/components/familia/campamentos/campamento-card.tsx`:

```typescript
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CampamentoCardProps {
  campamento: {
    id: number;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    ubicacion: string;
    precio: number;
    plazas_disponibles: number;
    fecha_limite_inscripcion: string;
  };
}

export function CampamentoCard({ campamento }: CampamentoCardProps) {
  const fechaInicio = new Date(campamento.fecha_inicio);
  const fechaFin = new Date(campamento.fecha_fin);
  const fechaLimite = new Date(campamento.fecha_limite_inscripcion);

  const diasRestantes = Math.ceil(
    (fechaLimite.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{campamento.nombre}</CardTitle>
          {campamento.plazas_disponibles <= 5 && (
            <Badge variant="destructive">
              {campamento.plazas_disponibles} plazas
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{campamento.descripcion}</p>

        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(fechaInicio, "d 'de' MMMM", { locale: es })} -{' '}
              {format(fechaFin, "d 'de' MMMM yyyy", { locale: es })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{campamento.ubicacion}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{campamento.plazas_disponibles} plazas disponibles</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {diasRestantes > 0
                ? `${diasRestantes} días para inscribirse`
                : 'Último día para inscribirse'}
            </span>
          </div>
        </div>

        {campamento.precio > 0 && (
          <div className="text-lg font-semibold">
            {campamento.precio.toFixed(2)} €
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/familia/campamentos/${campamento.id}/inscripcion`} className="w-full">
          <Button className="w-full">Inscribirse</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
```

## Criterios de Completitud

- [ ] Migración SQL ejecutada
- [ ] API endpoints funcionando
- [ ] Familia de Tropa ve campamento de aniversario
- [ ] Puede seleccionar educando de Tropa para inscribir
- [ ] Formulario de inscripción completo
- [ ] Inscripción se guarda en BD
- [ ] Kraal de Tropa puede ver lista de inscritos
- [ ] Notificación enviada tras inscripción
- [ ] Validación de plazas disponibles
- [ ] Build pasa sin errores
- [ ] Tests E2E funcionan

## Tests E2E

```typescript
test('familia tropa puede inscribirse a campamento', async ({ page }) => {
  // Login como familia con educando en Tropa
  await login(page, 'familia-tropa@test.com', 'password');

  // Ir a campamentos
  await page.goto('/familia/campamentos');

  // Verificar que ve el campamento de aniversario
  await expect(page.locator('text=Campamento Aniversario')).toBeVisible();

  // Click en inscribirse
  await page.click('text=Inscribirse');

  // Llenar formulario
  await page.selectOption('[name="educandoId"]', { label: 'Juan García' });
  await page.selectOption('[name="metodoPago"]', 'transferencia');
  await page.check('[name="autorizacionImagenes"]');
  await page.check('[name="autorizacionSalida"]');

  // Submit
  await page.click('button:has-text("Confirmar Inscripción")');

  // Verificar éxito
  await expect(page.locator('.toast')).toContainText('Inscripción realizada');
});
```

## Notas Adicionales

- Solo familias con educandos en Tropa ven este campamento
- Kraal de Tropa puede exportar lista a Excel
- Considerar integración con sistema de pagos en futuro
- Notificaciones automáticas recordatorias antes del campamento
