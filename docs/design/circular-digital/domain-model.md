# Modelo de Dominio — Circular Digital

> Entidades nuevas y modificadas, diagrama de clases, y cambios en base de datos.

**Fecha:** 2026-02-01  
**Estado:** Draft  

---

## 1. Entidades del Dominio

### 1.1 Entidades Nuevas

| Entidad | Descripción | Responsabilidad |
|---------|-------------|-----------------|
| **PerfilSalud** | Datos médicos y de salud persistentes de un educando | Almacena alergias, medicación, dieta, grupo sanguíneo, tarjeta sanitaria, enfermedades crónicas |
| **ContactoEmergencia** | Persona de contacto en caso de emergencia | Nombre, teléfono, relación con el educando. Mínimo 1, máximo 3 |
| **PlantillaCircular** | Plantilla reutilizable para circulares | Define los campos estándar y el formato del PDF base |
| **CircularActividad** | Circular asociada a una actividad concreta | Configura la circular para una actividad: plantilla, fecha límite, campos custom, texto |
| **CampoCustomCircular** | Campo personalizado añadido a una circular | Permite al admin añadir preguntas/autorizaciones específicas de la actividad |
| **CircularRespuesta** | Respuesta de un familiar a una circular | Datos confirmados, firma, estado, metadatos de integridad |

### 1.2 Entidades Modificadas

| Entidad | Cambio | Motivo |
|---------|--------|--------|
| **Educando** | Se añade relación 1:1 con PerfilSalud | Centralizar datos médicos fuera de inscripciones |
| **InscripcionCampamento** | Se añade FK a CircularRespuesta | Vincular inscripción con respuesta digital |

---

## 2. Diagrama de Clases

```mermaid
classDiagram
    class Educando {
        +int id
        +string nombre
        +string apellidos
        +date fecha_nacimiento
        +string alergias
        +string notas_medicas
        +int seccion_id
        +datetime created_at
        +datetime updated_at
    }

    class PerfilSalud {
        +int id
        +int educando_id
        +string alergias
        +string intolerancias
        +string dieta_especial
        +string medicacion
        +string observaciones_medicas
        +string grupo_sanguineo
        +string tarjeta_sanitaria
        +string enfermedades_cronicas
        +boolean puede_hacer_deporte
        +string notas_adicionales
        +datetime ultima_actualizacion
        +datetime created_at
        +datetime updated_at
    }

    class ContactoEmergencia {
        +int id
        +int educando_id
        +string nombre_completo
        +string telefono
        +string relacion
        +int orden
        +datetime created_at
    }

    class PlantillaCircular {
        +int id
        +string nombre
        +string descripcion
        +string tipo
        +bytea plantilla_pdf_base
        +json campos_estandar
        +boolean activa
        +datetime created_at
        +datetime updated_at
    }

    class CircularActividad {
        +int id
        +int actividad_id
        +int plantilla_id
        +string titulo
        +text texto_introductorio
        +date fecha_limite_firma
        +string estado
        +json configuracion
        +int creado_por
        +datetime created_at
        +datetime updated_at
    }

    class CampoCustomCircular {
        +int id
        +int circular_actividad_id
        +string nombre_campo
        +string tipo_campo
        +string etiqueta
        +boolean obligatorio
        +json opciones
        +int orden
    }

    class CircularRespuesta {
        +int id
        +int circular_actividad_id
        +int educando_id
        +int familiar_id
        +json datos_medicos_snapshot
        +json contactos_emergencia_snapshot
        +json campos_custom_respuestas
        +text firma_base64
        +string firma_tipo
        +string ip_firma
        +string user_agent_firma
        +datetime fecha_firma
        +string estado
        +string pdf_drive_id
        +string pdf_hash_sha256
        +string pdf_local_path
        +int version
        +datetime created_at
        +datetime updated_at
    }

    class InscripcionCampamento {
        +int id
        +int actividad_id
        +int educando_id
        +int familiar_id
        +string estado
        +int circular_respuesta_id
        +string circular_firmada_drive_id
        ...campos existentes...
    }

    class Familiar {
        +int id
        +string nombre
        +string apellidos
        +string email
        +string telefono
    }

    class FamiliaresEducandos {
        +int familiar_id
        +int educando_id
        +string relacion
        +boolean es_contacto_principal
    }

    Educando "1" -- "0..1" PerfilSalud : tiene
    Educando "1" -- "1..3" ContactoEmergencia : tiene
    Educando "1" -- "*" InscripcionCampamento : participa en
    Educando "1" -- "*" CircularRespuesta : tiene respuestas

    Familiar "1" -- "*" CircularRespuesta : firma
    Familiar "*" -- "*" Educando : FamiliaresEducandos

    PlantillaCircular "1" -- "*" CircularActividad : usada en
    CircularActividad "1" -- "*" CampoCustomCircular : tiene campos
    CircularActividad "1" -- "*" CircularRespuesta : recibe respuestas

    InscripcionCampamento "1" -- "0..1" CircularRespuesta : vinculada a
```

---

## 3. Estados de CircularRespuesta

```mermaid
stateDiagram-v2
    [*] --> pendiente : Circular creada

    pendiente --> borrador : Padre abre formulario
    borrador --> pendiente : Padre abandona sin guardar
    borrador --> firmada : Padre confirma + firma

    firmada --> pdf_generado : PDF generado exitosamente
    pdf_generado --> archivada : PDF subido a Drive

    firmada --> error_pdf : Fallo generando PDF
    error_pdf --> firmada : Reintento exitoso

    pdf_generado --> error_drive : Fallo subiendo a Drive
    error_drive --> pdf_generado : Reintento exitoso

    archivada --> superseded : Padre re-firma (nueva versión)
    superseded --> [*]

    archivada --> anulada : Inscripción cancelada
    anulada --> [*]

    archivada --> [*]
```

---

## 4. Estados de CircularActividad

```mermaid
stateDiagram-v2
    [*] --> borrador : Admin crea circular
    borrador --> publicada : Admin publica
    publicada --> cerrada : Fecha límite alcanzada
    publicada --> cancelada : Admin cancela
    cerrada --> [*]
    cancelada --> [*]
```

---

## 5. Cambios en Base de Datos (Resumen)

### Tablas Nuevas

| Tabla | Descripción |
|-------|-------------|
| `perfil_salud` | Datos médicos persistentes por educando |
| `contactos_emergencia` | Contactos de emergencia por educando |
| `plantillas_circular` | Plantillas reutilizables de circulares |
| `circular_actividad` | Circular específica para una actividad |
| `campos_custom_circular` | Campos personalizados de una circular |
| `circular_respuesta` | Respuesta/firma de un familiar a una circular |
| `auditoria_datos_medicos` | Log de accesos a datos médicos (RGPD) |

### Tablas Modificadas

| Tabla | Cambio |
|-------|--------|
| `inscripciones_campamento` | Añadir columna `circular_respuesta_id` (FK) |

### Índices Clave

| Tabla | Índice | Tipo |
|-------|--------|------|
| `perfil_salud` | `(educando_id)` | UNIQUE |
| `contactos_emergencia` | `(educando_id, orden)` | UNIQUE |
| `circular_respuesta` | `(circular_actividad_id, educando_id, version)` | UNIQUE |
| `circular_respuesta` | `(estado)` | INDEX |
| `circular_actividad` | `(actividad_id)` | INDEX |
| `auditoria_datos_medicos` | `(educando_id, fecha)` | INDEX |

---

## 6. Migración de Datos Existentes

Los datos médicos ya existen dispersos en `inscripciones_campamento` y `educandos`. La migración debe:

1. **Crear `perfil_salud`** para cada educando usando los datos más recientes de `inscripciones_campamento`.
2. **Crear `contactos_emergencia`** usando `persona_emergencia` y `telefono_emergencia` de la inscripción más reciente.
3. **No borrar** los datos de las tablas originales — se mantienen como histórico.
4. Los campos en `educandos` (`alergias`, `notas_medicas`) se mantienen como fallback.

Consultar `migration.sql` para el script completo.
