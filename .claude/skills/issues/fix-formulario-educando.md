# CRIT-004: Fix Formulario Educando No Se Envía

## Descripción del Problema

El formulario de creación/edición de educandos no se envía cuando el usuario hace click en "Guardar". El botón no responde o muestra un error genérico sin feedback claro.

## Causa Raíz

1. **Dependencia de CRIT-001**: La misma causa (falta de `seccion_id`) bloquea el envío
2. **Hook bloquea submit**: `useEducandosScouter.ts` líneas 214-219 bloquean el submit si no hay sección
3. **Sin feedback de error**: El formulario no muestra por qué no puede enviarse
4. **Validación silenciosa**: El botón se deshabilita sin tooltip explicativo

## Prerequisitos

**IMPORTANTE**: Este issue depende de CRIT-001. Resolver primero el error de sección asignada.

## Archivos a Modificar

### Frontend
1. `src/components/aula-virtual/educandos/educando-form-modal.tsx`
2. `src/hooks/useEducandosScouter.ts`
3. `src/components/ui/form-submit-button.tsx` (crear si no existe)

## Implementación

### Paso 1: Mejorar Detección de Sección en Hook

Modificar `src/hooks/useEducandosScouter.ts`:

```typescript
// Agregar estado para diagnóstico
const [diagnosticInfo, setDiagnosticInfo] = useState<{
  hasSectionId: boolean;
  sectionId: number | null;
  canSubmit: boolean;
  blockReason: string | null;
}>({
  hasSectionId: false,
  sectionId: null,
  canSubmit: false,
  blockReason: null,
});

// En useEffect de carga de usuario
useEffect(() => {
  const loadUserData = async () => {
    try {
      const userData = await getUserData();

      const hasSectionId = !!userData.seccion_id;
      const canSubmit = hasSectionId;
      const blockReason = !hasSectionId
        ? 'Tu cuenta no tiene una sección asignada. Contacta al administrador.'
        : null;

      setDiagnosticInfo({
        hasSectionId,
        sectionId: userData.seccion_id,
        canSubmit,
        blockReason,
      });

      if (!hasSectionId) {
        console.warn('Usuario sin sección:', userData.id, userData.email);
      }
    } catch (error) {
      setDiagnosticInfo(prev => ({
        ...prev,
        canSubmit: false,
        blockReason: 'Error al cargar datos del usuario',
      }));
    }
  };

  loadUserData();
}, []);

// En función de crear educando
const crearEducando = async (data: EducandoFormData) => {
  if (!diagnosticInfo.canSubmit) {
    throw new Error(diagnosticInfo.blockReason || 'No se puede crear educando');
  }

  // ... resto de la lógica
};

// Retornar información de diagnóstico
return {
  educandos,
  loading,
  error,
  diagnosticInfo,
  crearEducando,
  // ...
};
```

### Paso 2: Mejorar Feedback en Formulario

Modificar `src/components/aula-virtual/educandos/educando-form-modal.tsx`:

```typescript
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Info } from 'lucide-react';

const EducandoFormModal = ({ ... }) => {
  const { diagnosticInfo, crearEducando, loading } = useEducandosScouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determinar si el formulario puede enviarse
  const canSubmitForm = diagnosticInfo.canSubmit && !loading && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Verificar antes de intentar
    if (!diagnosticInfo.canSubmit) {
      setSubmitError(diagnosticInfo.blockReason);
      return;
    }

    setIsSubmitting(true);

    try {
      await crearEducando(formData);
      toast.success('Educando creado exitosamente');
      onClose();
    } catch (error: any) {
      console.error('Error submit:', error);
      setSubmitError(error.message || 'Error al guardar educando');
      toast.error('Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Educando</DialogTitle>
        </DialogHeader>

        {/* Alerta si no puede enviar */}
        {!diagnosticInfo.canSubmit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No puedes crear educandos</AlertTitle>
            <AlertDescription>
              {diagnosticInfo.blockReason}
            </AlertDescription>
          </Alert>
        )}

        {/* Error de submit */}
        {submitError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al guardar</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* ... campos del formulario ... */}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>

            {/* Botón con tooltip si está deshabilitado */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="submit"
                    disabled={!canSubmitForm}
                    className="relative"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Educando'
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {!canSubmitForm && (
                <TooltipContent>
                  <p>{diagnosticInfo.blockReason || 'Cargando...'}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </DialogFooter>
        </form>

        {/* Debug info en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-muted rounded text-xs">
            <p>Debug: canSubmit={String(diagnosticInfo.canSubmit)}</p>
            <p>sectionId={diagnosticInfo.sectionId}</p>
            {diagnosticInfo.blockReason && (
              <p className="text-destructive">Reason: {diagnosticInfo.blockReason}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

### Paso 3: Agregar Logging para Diagnóstico

```typescript
// En el hook o componente

const logFormState = () => {
  console.group('Educando Form State');
  console.log('canSubmit:', diagnosticInfo.canSubmit);
  console.log('sectionId:', diagnosticInfo.sectionId);
  console.log('blockReason:', diagnosticInfo.blockReason);
  console.log('isSubmitting:', isSubmitting);
  console.log('formData:', formData);
  console.groupEnd();
};

// Llamar antes de submit para debugging
const handleSubmit = async (e: React.FormEvent) => {
  if (process.env.NODE_ENV === 'development') {
    logFormState();
  }
  // ... resto
};
```

### Paso 4: Agregar Indicador de Sección Actual

```typescript
// Mostrar qué sección tiene el usuario
{diagnosticInfo.hasSectionId && (
  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
    <Info className="h-4 w-4" />
    <span>
      Creando educando para:{' '}
      <strong>{getSectionName(diagnosticInfo.sectionId)}</strong>
    </span>
  </div>
)}

// Helper function
const getSectionName = (id: number | null) => {
  const sections: Record<number, string> = {
    1: 'Castores',
    2: 'Manada',
    3: 'Tropa',
    4: 'Pioneros',
    5: 'Rutas',
  };
  return id ? sections[id] || 'Desconocida' : 'Sin sección';
};
```

## Criterios de Completitud

- [ ] CRIT-001 resuelto primero (prerequisito)
- [ ] Hook expone información de diagnóstico
- [ ] Alerta visible cuando no puede enviarse
- [ ] Tooltip en botón deshabilitado explica por qué
- [ ] Botón muestra estado de carga durante envío
- [ ] Error de submit se muestra claramente
- [ ] Indicador de sección actual visible
- [ ] Formulario se envía correctamente cuando hay sección
- [ ] Build pasa sin errores
- [ ] No hay errores en consola

## Comandos de Verificación

```bash
# Build
npm run build

# Tests relacionados
npm run test -- --grep "educando"

# Verificar en navegador
# 1. Login como Rodrigo (después de CRIT-001)
# 2. Ir a crear educando
# 3. Verificar que muestra "Creando para: Pioneros"
# 4. Llenar formulario y guardar
# 5. Verificar toast de éxito
```

## Tests E2E

```typescript
test('formulario educando se envía correctamente', async ({ page }) => {
  // Login como scouter con sección
  await login(page, 'rodrigo@test.com', 'password');

  // Ir a educandos
  await page.goto('/aula-virtual/educandos');

  // Click en crear nuevo
  await page.click('[data-testid="crear-educando"]');

  // Verificar indicador de sección
  await expect(page.locator('text=Creando educando para:')).toBeVisible();

  // Llenar formulario
  await page.fill('[name="nombre"]', 'Test');
  await page.fill('[name="apellidos"]', 'Educando');
  await page.fill('[name="fecha_nacimiento"]', '2015-05-15');
  // ... otros campos obligatorios

  // Verificar botón habilitado
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeEnabled();

  // Click en guardar
  await submitButton.click();

  // Esperar toast de éxito
  await expect(page.locator('.toast')).toContainText('exitosamente');

  // Verificar que el modal se cerró
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});

test('formulario muestra error sin sección', async ({ page }) => {
  // Login como usuario sin sección (antes de CRIT-001)
  await login(page, 'user-sin-seccion@test.com', 'password');

  // Ir a crear educando
  await page.goto('/aula-virtual/educandos/nuevo');

  // Verificar alerta de error
  await expect(page.locator('.alert-destructive')).toContainText(
    'No puedes crear educandos'
  );

  // Verificar botón deshabilitado
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeDisabled();

  // Verificar tooltip
  await submitButton.hover();
  await expect(page.locator('[role="tooltip"]')).toContainText(
    'sección asignada'
  );
});
```

## Orden de Resolución

1. ✅ Resolver CRIT-001 primero
2. Implementar cambios en hook
3. Implementar cambios en componente
4. Probar con usuario que tiene sección
5. Verificar que se crea educando

## Rollback

Si hay problemas:
1. Revertir cambios en los archivos modificados
2. El comportamiento anterior se restaura

## Notas Adicionales

- Este fix mejora significativamente la UX del formulario
- La información de diagnóstico ayuda a identificar problemas
- Considerar agregar validación de campos antes del submit
- El debug info solo aparece en desarrollo
