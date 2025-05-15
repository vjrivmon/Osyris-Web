# Configuración Docker para Osyris Web

Este documento explica cómo configurar y ejecutar la aplicación Osyris Web utilizando Docker.

## Requisitos

- Docker
- Docker Compose

## Instrucciones

### 1. Iniciar el entorno completo

Para iniciar toda la aplicación (frontend, backend y base de datos) con un solo comando:

```bash
docker-compose up -d
```

Este comando construirá e iniciará todos los servicios en modo detached (en segundo plano).

### 2. Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Base de datos**: localhost:3306 (accesible solo desde los contenedores o usando una herramienta como MySQL Workbench)

### 3. Ver logs de los servicios

Para ver los logs de un servicio específico:

```bash
# Para el frontend
docker-compose logs -f frontend

# Para el backend
docker-compose logs -f backend

# Para la base de datos
docker-compose logs -f db
```

### 4. Detener los servicios

Para detener todos los servicios:

```bash
docker-compose down
```

Para detener y eliminar volúmenes (¡esto borrará los datos de la base de datos!):

```bash
docker-compose down -v
```

### 5. Reconstruir servicios

Si realizas cambios en el código y necesitas reconstruir los servicios:

```bash
docker-compose build
docker-compose up -d
```

## Variables de entorno

Las variables de entorno están configuradas en el archivo `docker-compose.yml`. Si necesitas modificarlas, puedes hacerlo directamente en ese archivo o crear un archivo `.env` en la raíz del proyecto.

## Solución de problemas comunes

1. **Error de conexión a la base de datos**: Asegúrate de que el servicio de base de datos esté funcionando correctamente con `docker-compose ps`.

2. **El frontend no puede conectar con el backend**: Verifica que las URLs estén correctamente configuradas en las variables de entorno.

3. **Cambios en el código no se reflejan**: Asegúrate de reconstruir los servicios después de hacer cambios con `docker-compose build`.

4. **Problemas de permisos de volúmenes**: En algunos sistemas Linux pueden surgir problemas con los permisos de los volúmenes. Usa `sudo` antes de los comandos de Docker si es necesario. 