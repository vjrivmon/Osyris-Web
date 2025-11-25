# Configuración de Google Drive API para Documentos de Familias

## Resumen

Este documento describe cómo configurar la integración con Google Drive para la gestión de documentos de educandos en el Portal de Familias.

## Requisitos Previos

- Cuenta de Google con acceso a Google Cloud Console
- Acceso a la carpeta "Documentación Educandos" en Google Drive del grupo
- Acceso al servidor de producción

## Paso 1: Crear Proyecto en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto o seleccionar uno existente
3. Nombre sugerido: `osyris-documentos`

## Paso 2: Habilitar Google Drive API

1. En el menú lateral, ir a **APIs & Services > Library**
2. Buscar "Google Drive API"
3. Hacer clic en **Enable**

## Paso 3: Crear Service Account

1. Ir a **APIs & Services > Credentials**
2. Clic en **Create Credentials > Service Account**
3. Configurar:
   - Nombre: `osyris-drive-service`
   - ID: `osyris-drive-service`
   - Descripción: `Service account para acceso a documentos de educandos`
4. Clic en **Create and Continue**
5. Rol: `Editor` (o crear rol personalizado con permisos de Drive)
6. Clic en **Done**

## Paso 4: Generar Clave JSON

1. En la lista de Service Accounts, clic en el email del service account creado
2. Ir a la pestaña **Keys**
3. Clic en **Add Key > Create new key**
4. Seleccionar **JSON**
5. Descargar el archivo y guardarlo de forma segura

## Paso 5: Compartir Carpetas con Service Account

1. Copiar el email del Service Account (formato: `xxx@xxx.iam.gserviceaccount.com`)
2. En Google Drive, ir a cada carpeta y compartirla:
   - **Documentación Educandos** (carpeta raíz)
   - **1. Documentos digitales** (plantillas)
   - Carpetas de secciones (Castores, Manada, Tropa, Pioneros, Rutas)
3. Compartir con permisos de **Editor**

## Paso 6: Obtener IDs de Carpetas

Para obtener el ID de una carpeta de Google Drive:
1. Abrir la carpeta en el navegador
2. El ID está en la URL: `https://drive.google.com/drive/folders/FOLDER_ID_AQUI`

Necesitas obtener los IDs de:
- Carpeta raíz "Documentación Educandos"
- Carpeta "1. Documentos digitales" (plantillas)
- Cada carpeta de sección

## Paso 7: Configurar Variables de Entorno

Añadir al archivo `.env` del backend (`api-osyris/.env`):

```env
# Google Drive API
GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/archivo/google-service-account.json
GOOGLE_DRIVE_ROOT_FOLDER_ID=id_carpeta_documentacion_educandos
GOOGLE_DRIVE_TEMPLATES_FOLDER_ID=id_carpeta_1_documentos_digitales

# IDs de carpetas de secciones
GOOGLE_DRIVE_CASTORES_FOLDER_ID=id_carpeta_castores
GOOGLE_DRIVE_MANADA_FOLDER_ID=id_carpeta_manada
GOOGLE_DRIVE_TROPA_FOLDER_ID=id_carpeta_tropa
GOOGLE_DRIVE_PIONEROS_FOLDER_ID=id_carpeta_pioneros
GOOGLE_DRIVE_RUTAS_FOLDER_ID=id_carpeta_rutas
```

## Paso 8: Colocar Archivo de Credenciales

1. Crear directorio de credenciales:
   ```bash
   mkdir -p api-osyris/credentials
   ```

2. Copiar el archivo JSON descargado:
   ```bash
   cp /ruta/descarga/archivo.json api-osyris/credentials/google-service-account.json
   ```

3. Asegurar que el archivo tenga permisos correctos:
   ```bash
   chmod 600 api-osyris/credentials/google-service-account.json
   ```

4. Añadir al `.gitignore`:
   ```
   api-osyris/credentials/
   *.json
   ```

## Paso 9: Instalar Dependencia

```bash
cd api-osyris
npm install googleapis
```

## Paso 10: Ejecutar Migración de Base de Datos

```bash
psql -U osyris_user -d osyris_db -f database/migrations/add_google_drive_fields.sql
```

## Paso 11: Verificar Configuración

1. Reiniciar el backend:
   ```bash
   pm2 restart osyris-api
   ```

2. Verificar logs:
   ```bash
   pm2 logs osyris-api
   ```

   Debe aparecer: `✅ Google Drive client inicializado correctamente`

3. Probar endpoint de plantillas:
   ```bash
   curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/drive/plantillas
   ```

## Estructura de Carpetas en Drive

```
Documentación Educandos/
├── 1. Documentos digitales/          # Plantillas
│   ├── DOC01_Ficha de inscripción.pdf
│   ├── DOC02_Ficha sanitaria.pdf
│   ├── DOC08_Regresar Solo_Ronda 24 25.pdf
│   ├── DOC09_Autorización grupos WhatsApp.pdf
│   └── DOC10_Baja asociado.pdf
├── Castores/
│   ├── 2017/
│   │   ├── Nombre Educando 1/
│   │   │   ├── DOC01_Ficha de inscripción_Nombre Educando 1.pdf
│   │   │   └── ...
│   │   └── Nombre Educando 2/
│   └── 2018/
├── Manada/
├── Tropa/
├── Pioneros/
└── Rutas/
```

## Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/drive/plantillas` | Lista plantillas disponibles |
| GET | `/api/drive/plantilla/:fileId/download` | Descarga una plantilla |
| GET | `/api/drive/educando/:id/documentos` | Documentos de un educando |
| POST | `/api/drive/documento/upload` | Sube documento (multipart) |
| PUT | `/api/drive/documento/:id/aprobar` | Aprueba documento (scouter) |
| PUT | `/api/drive/documento/:id/rechazar` | Rechaza documento (scouter) |
| GET | `/api/drive/documentos/pendientes` | Documentos pendientes revisión |

## Flujo de Documentos

```
1. Familia ve documento faltante
   ↓
2. Descarga plantilla (si aplica)
   ↓
3. Rellena documento
   ↓
4. Sube documento → Estado: "pendiente_revision"
   ↓
5. Notificación a scouters
   ↓
6. Scouter revisa
   ↓
7a. Aprueba → Estado: "aprobado" → Notifica familia
7b. Rechaza → Estado: "rechazado" + motivo → Notifica familia → Volver a paso 3
```

## Solución de Problemas

### Error: "Archivo de credenciales no encontrado"
- Verificar que el archivo JSON existe en la ruta especificada
- Verificar permisos del archivo

### Error: "Access denied" al acceder a carpetas
- Verificar que las carpetas están compartidas con el Service Account
- Verificar los IDs de carpetas en las variables de entorno

### Error: "API not enabled"
- Verificar que Google Drive API está habilitada en el proyecto

## Seguridad

- El archivo de credenciales **NUNCA** debe subirse a Git
- Los tokens de acceso tienen tiempo limitado
- El Service Account solo tiene acceso a las carpetas compartidas explícitamente
- Los familiares solo pueden ver documentos de sus educandos vinculados
