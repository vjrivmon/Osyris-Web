# User Flows — Circular Digital

> Diagramas de flujo completos para todos los actores y escenarios de la feature Circular Digital.

**Fecha:** 2026-02-01  
**Estado:** Draft  

---

## 1. Comparativa: Flujo Actual (PDF) vs Flujo Nuevo (Digital)

### 1.1 Flujo Actual (PDF — a deprecar)

```mermaid
flowchart TD
    A[Admin crea actividad] --> B[Sistema genera PDF circular en blanco]
    B --> C[Padre accede al wizard de inscripción]
    C --> D[Padre descarga PDF circular]
    D --> E[Padre imprime PDF]
    E --> F[Padre rellena a mano:<br/>nombre, alergias, medicación,<br/>teléfono emergencia, etc.]
    F --> G[Padre firma a mano]
    G --> H[Padre escanea/fotografía documento]
    H --> I[Padre sube archivo al wizard]
    I --> J[Sistema sube a Google Drive]
    J --> K[Admin verifica documento manualmente]

    style E fill:#ff6b6b,color:#fff
    style F fill:#ff6b6b,color:#fff
    style H fill:#ff6b6b,color:#fff
    style K fill:#ff6b6b,color:#fff
```

**Tiempo estimado:** 15-20 minutos  
**Puntos de dolor:** Pasos en rojo son repetitivos, requieren hardware (impresora/escáner), propensos a errores.

### 1.2 Flujo Nuevo (Circular Digital)

```mermaid
flowchart TD
    A[Admin crea actividad] --> B[Sistema asocia plantilla de circular]
    B --> C[Padre accede al wizard de inscripción]
    C --> D[Sistema carga perfil de salud automáticamente]
    D --> E[Padre revisa datos pre-rellenados]
    E --> F{¿Datos correctos?}
    F -->|Sí| G[Padre acepta condiciones]
    F -->|No| H[Padre modifica campos necesarios]
    H --> E
    G --> I[Padre firma en canvas táctil]
    I --> J[Sistema envía datos + firma a API]
    J --> K[API genera PDF automáticamente]
    K --> L[API sube PDF a Google Drive]
    L --> M[Padre recibe confirmación por email]

    style D fill:#51cf66,color:#fff
    style E fill:#51cf66,color:#fff
    style K fill:#51cf66,color:#fff
    style L fill:#51cf66,color:#fff
```

**Tiempo estimado:** 1-2 minutos  
**Mejoras:** Pasos en verde son automáticos o simplificados.

---

## 2. Flujo del Padre: Confirmar Datos y Firmar Circular

```mermaid
flowchart TD
    Start([Padre inicia inscripción]) --> CheckPerfil{¿Existe perfil<br/>de salud?}

    CheckPerfil -->|No| CrearPerfil[Mostrar formulario<br/>de perfil de salud completo]
    CrearPerfil --> GuardarPerfil[Guardar perfil]
    GuardarPerfil --> CargarDatos

    CheckPerfil -->|Sí| CheckFreshness{¿Perfil actualizado<br/>en últimos 6 meses?}
    CheckFreshness -->|No| AvisoUpdate[Mostrar aviso:<br/>'Revisa tus datos, hace tiempo<br/>que no los actualizas']
    AvisoUpdate --> CargarDatos
    CheckFreshness -->|Sí| CargarDatos

    CargarDatos[Cargar datos pre-rellenados<br/>en formulario de circular]

    CargarDatos --> Paso1[PASO 1: Datos del educando<br/>Nombre, edad, sección — solo lectura]
    Paso1 --> Paso2[PASO 2: Datos médicos<br/>Alergias, medicación, dieta — editables]
    Paso2 --> Paso3[PASO 3: Contactos de emergencia<br/>Pre-rellenados desde perfil — editables]
    Paso3 --> Paso4[PASO 4: Autorizaciones específicas<br/>Campos propios de la actividad]
    Paso4 --> Paso5[PASO 5: Resumen y confirmación<br/>Vista previa de todos los datos]

    Paso5 --> Confirma{¿Padre confirma<br/>datos correctos?}
    Confirma -->|No| VueltaPaso[Volver al paso que necesita cambio]
    VueltaPaso --> Paso1

    Confirma -->|Sí| CheckboxLegal[Padre marca checkbox:<br/>'Confirmo que los datos son correctos<br/>y autorizo la participación']
    CheckboxLegal --> Firma[PASO 6: Firma digital<br/>Canvas táctil]

    Firma --> FirmaOK{¿Firma aceptable?<br/>Min 50 puntos de trazo}
    FirmaOK -->|No| LimpiarFirma[Limpiar canvas,<br/>reintentar]
    LimpiarFirma --> Firma

    FirmaOK -->|Sí| Enviar[Enviar al servidor]
    Enviar --> Procesando[Pantalla de carga:<br/>'Generando tu circular...']
    Procesando --> Resultado{¿Éxito?}
    Resultado -->|Sí| Exito[Pantalla de confirmación<br/>con enlace al PDF]
    Resultado -->|No| Error[Mostrar error<br/>con opción de reintentar]
    Error --> Enviar

    Exito --> End([Fin — Email de confirmación enviado])
```

### Edge Cases — Flujo del Padre

| # | Edge Case | Comportamiento |
|---|-----------|----------------|
| 1 | **Padre con múltiples educandos en la misma actividad** | Wizard permite seleccionar educando. Al completar uno, ofrece "¿Firmar circular para otro educando?" con datos del siguiente pre-rellenados. |
| 2 | **Pérdida de conexión durante la firma** | Los datos del formulario se guardan en localStorage. Al reconectar, se restaura el estado. La firma debe rehacerse. |
| 3 | **Padre modifica datos médicos que difieren del perfil** | Se pregunta: "¿Quieres actualizar tu perfil de salud con estos cambios?" Sí → actualiza perfil + circular. No → solo aplica a esta circular. |
| 4 | **Canvas de firma no soportado (navegador antiguo)** | Fallback: checkbox "Confirmo mi autorización" + campo de texto con nombre completo del firmante. Se registra como firma tipo "text" en vez de "image". |
| 5 | **Circular ya firmada, padre quiere modificar** | Si la actividad no ha comenzado y el admin no ha bloqueado cambios: permite re-firmar (nueva versión). Se archiva la anterior como "superseded". |

---

## 3. Flujo del Admin: Crear Circular para Actividad

```mermaid
flowchart TD
    Start([Admin accede a gestión de actividad]) --> TieneActividad{¿Actividad ya creada?}

    TieneActividad -->|No| CrearActividad[Crear actividad<br/>nombre, fechas, sección, etc.]
    CrearActividad --> SeleccionarPlantilla

    TieneActividad -->|Sí| SeleccionarPlantilla[Seleccionar plantilla de circular]

    SeleccionarPlantilla --> TipoPlantilla{¿Tipo de plantilla?}
    TipoPlantilla -->|Estándar| PlantillaBase[Usar plantilla base<br/>— campos estándar]
    TipoPlantilla -->|Personalizada| PersonalizarPlantilla[Añadir campos específicos<br/>ej: 'Autorizo baño en río']
    PersonalizarPlantilla --> PlantillaBase

    PlantillaBase --> ConfigurarCircular[Configurar circular:<br/>- Fecha límite de firma<br/>- Texto introductorio<br/>- Documentos adjuntos<br/>- ¿Requiere pago?]

    ConfigurarCircular --> Preview[Vista previa del formulario<br/>como lo verá el padre]

    Preview --> Publicar{¿Publicar?}
    Publicar -->|No| Editar[Volver a editar]
    Editar --> ConfigurarCircular

    Publicar -->|Sí| Activar[Activar circular]
    Activar --> NotificarFamilias[Enviar email a todas las familias<br/>de la sección correspondiente]
    NotificarFamilias --> End([Circular activa — esperando firmas])
```

### Edge Cases — Flujo del Admin

| # | Edge Case | Comportamiento |
|---|-----------|----------------|
| 1 | **Admin modifica circular después de publicada** | Si algún padre ya firmó: los que firmaron mantienen su versión. Los pendientes ven la nueva. Se notifica a los ya firmados si hay cambios sustanciales con opción de re-firmar. |
| 2 | **Actividad cancelada con circulares firmadas** | Se marca la actividad como cancelada. Las circulares se mantienen en Drive como archivo. Se envía email notificando la cancelación. |
| 3 | **Fecha límite alcanzada con firmas pendientes** | Dashboard muestra en rojo los pendientes. Admin puede: (a) extender plazo, (b) enviar recordatorio urgente, (c) excluir de la actividad. |
| 4 | **Dos admins editando la misma circular** | Optimistic locking: se guarda `updated_at`. Si hay conflicto, el segundo recibe error "La circular fue modificada. Recarga para ver los cambios." |
| 5 | **Admin necesita campo no contemplado en plantilla** | Puede añadir campos personalizados tipo texto libre, checkbox o select. Máximo 10 campos custom por circular. |

---

## 4. Flujo de Generación Automática del PDF

```mermaid
flowchart TD
    Start([API recibe datos confirmados + firma]) --> Validar[Validar datos:<br/>- Campos obligatorios presentes<br/>- Firma tiene min. 50 puntos<br/>- Educando pertenece al familiar]

    Validar --> ValidOK{¿Validación OK?}
    ValidOK -->|No| ReturnError[Retornar error 400<br/>con campos faltantes]

    ValidOK -->|Sí| PersistirDatos[Guardar en circular_respuesta:<br/>datos_confirmados, firma_base64,<br/>ip_firma, timestamp]

    PersistirDatos --> CargarPlantilla[Cargar plantilla PDF<br/>desde plantillas_circular]

    CargarPlantilla --> GenerarPDF[Generar PDF con pdf-lib:<br/>1. Cargar plantilla base<br/>2. Rellenar campos de texto<br/>3. Insertar firma como imagen<br/>4. Añadir metadatos de integridad]

    GenerarPDF --> HashPDF[Calcular SHA-256 del PDF]
    HashPDF --> GuardarHash[Guardar hash en circular_respuesta]

    GuardarHash --> SubirDrive[Subir PDF a Google Drive<br/>Carpeta: /Circulares/{Actividad}/{Sección}/]

    SubirDrive --> DriveOK{¿Subida OK?}
    DriveOK -->|No| Retry{¿Intentos < 3?}
    Retry -->|Sí| Wait[Esperar backoff exponencial<br/>1s, 2s, 4s]
    Wait --> SubirDrive
    Retry -->|No| GuardarLocal[Guardar PDF localmente<br/>Marcar para reintento posterior]
    GuardarLocal --> NotificarAdmin[Notificar admin:<br/>'Fallo subida Drive para X']
    NotificarAdmin --> ConfirmPadre

    DriveOK -->|Sí| ActualizarDB[Actualizar inscripción:<br/>circular_firmada_drive_id = file_id]

    ActualizarDB --> ConfirmPadre[Enviar email confirmación al padre<br/>con enlace al PDF en Drive]

    ConfirmPadre --> End([PDF generado y archivado])
```

### Edge Cases — Generación de PDF

| # | Edge Case | Comportamiento |
|---|-----------|----------------|
| 1 | **Plantilla PDF corrupta o no encontrada** | Log de error. Se usa plantilla genérica de backup. Se notifica al admin para corregir. |
| 2 | **Firma con muy pocos trazos (garabato)** | Validación frontend: mínimo 50 puntos. Validación backend: se comprueba que la imagen no esté vacía (>1KB). |
| 3 | **PDF generado excede límite de Drive (5MB)** | Comprimir imagen de firma a JPEG 80% calidad. Si aún excede, reducir resolución de la plantilla. |
| 4 | **Generación de PDF tarda >5s** | Timeout configurable. Si se excede, se encola como tarea asíncrona y se notifica al padre por email cuando esté listo. |
| 5 | **Dos peticiones simultáneas para el mismo educando/actividad** | Idempotencia: comprobar si ya existe circular_respuesta con estado 'firmada'. Si existe, retornar la existente. Si ambas llegan "a la vez", lock optimista con versión. |

---

## 5. Flujo del Admin: Consultar Estado de Circulares

```mermaid
flowchart TD
    Start([Admin accede al Dashboard]) --> SeleccionarActividad[Seleccionar actividad<br/>del listado]

    SeleccionarActividad --> CargarEstado[Cargar estado de circulares<br/>para todos los inscritos]

    CargarEstado --> MostrarDashboard[Mostrar tabla:<br/>Educando | Sección | Estado | Fecha firma]

    MostrarDashboard --> Filtrar{¿Aplicar filtros?}
    Filtrar -->|Sí| AplicarFiltro[Filtrar por:<br/>- Estado: pendiente/firmada/caducada<br/>- Sección<br/>- Búsqueda por nombre]
    AplicarFiltro --> MostrarDashboard

    Filtrar -->|No| Acciones{¿Acción?}

    Acciones -->|Ver detalle| VerDetalle[Ver datos confirmados<br/>+ firma + enlace PDF]
    Acciones -->|Enviar recordatorio| RecordatorioIndividual[Enviar email recordatorio<br/>a padre del educando]
    Acciones -->|Recordatorio masivo| RecordatorioMasivo[Enviar email a TODOS<br/>los pendientes de la actividad]
    Acciones -->|Descargar PDFs| DescargarZIP[Generar ZIP con todos<br/>los PDFs firmados]
    Acciones -->|Vista emergencia| VistaEmergencia[Mostrar resumen médico<br/>de todos los inscritos<br/>— vista optimizada para imprimir]

    VerDetalle --> MostrarDashboard
    RecordatorioIndividual --> MostrarDashboard
    RecordatorioMasivo --> MostrarDashboard
    DescargarZIP --> MostrarDashboard
    VistaEmergencia --> MostrarDashboard
```

### Edge Cases — Dashboard Admin

| # | Edge Case | Comportamiento |
|---|-----------|----------------|
| 1 | **Actividad sin ninguna inscripción** | Mostrar mensaje: "No hay inscritos en esta actividad todavía." Con botón para enviar invitación a la sección. |
| 2 | **Admin intenta enviar recordatorio a familia que ya firmó** | Botón deshabilitado para familias con estado "firmada". Si se intenta por API, retornar 409. |
| 3 | **Descarga masiva con >50 PDFs** | Generación asíncrona del ZIP. Se muestra progreso y se envía enlace de descarga por email cuando esté listo. |
| 4 | **Padre firmó pero luego se da de baja de la actividad** | Estado cambia a "anulada". El PDF se mantiene en Drive pero se mueve a subcarpeta "Anuladas". No se cuenta en estadísticas. |
| 5 | **Admin sin permisos para ver datos médicos** | Solo el coordinador de la actividad y super-admin ven datos médicos completos. Otros admins ven solo estado (pendiente/firmada). |
