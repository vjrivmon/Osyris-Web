# /actualizar-seccion

Skill interactiva para actualizar el contenido de las secciones scout.

## Descripcion

Esta skill guia al usuario paso a paso para actualizar el contenido de cualquier seccion scout (Castores, Manada, Tropa, Pioneros, Rutas).

## Flujo de Trabajo

### Paso 1: Seleccionar seccion
Pregunta al usuario que seccion desea actualizar:
- Castores
- Manada
- Tropa
- Pioneros
- Rutas

### Paso 2: Seleccionar campos a modificar
Pregunta que campos desea modificar (puede seleccionar varios):
- **description**: Descripcion principal de la seccion
- **details**: Detalles adicionales (historia, contexto)
- **frame**: Marco simbolico
- **activities**: Lista de actividades (titulo, icono, descripcion)
- **methodology**: Metodologia educativa
- **team**: Equipo de monitores (nombres y fotos)
- **image**: Imagen principal de la seccion

### Paso 3: Recibir contenido
Para cada campo seleccionado, solicita el nuevo contenido al usuario.

### Paso 4: Aplicar cambios
Edita el archivo `src/components/ui/dynamic-section-page.tsx` con los nuevos datos.

## Archivo a Modificar

El contenido de las secciones se encuentra en:
```
src/components/ui/dynamic-section-page.tsx
```

En el objeto `fallbackSections` (linea ~62), cada seccion tiene su propia estructura.

## Estructura de Datos por Seccion

```typescript
{
  name: string,           // Nombre corto (ej: "Castores")
  fullName: string,       // Nombre completo (ej: "Colonia La Veleta")
  slug: string,           // Identificador URL (ej: "castores")
  emoji: string,          // Emoji de la seccion
  logo: string,           // Ruta al logo
  motto: string,          // Lema scout
  ageRange: string,       // Rango de edad
  colors: {               // Colores del tema
    from: string,
    to: string,
    accent: string
  },
  description: string,    // Descripcion principal
  details: string,        // Detalles adicionales
  frame: string,          // Marco simbolico
  activities: [           // Lista de actividades
    { icon: string, title: string, description: string }
  ],
  methodology: [          // Metodologia
    { title: string, description: string }
  ],
  team: [                 // Equipo
    { name: string, role: string, photo: string }
  ],
  navigation: {           // Enlaces navegacion
    prev: { href: string, title: string },
    next: { href: string, title: string }
  }
}
```

## Notas Importantes

1. **Las imagenes del equipo** deben estar en `/public/images/kraal/`
2. **Las imagenes de seccion** deben estar en `/public/images/secciones/`
3. **Los roles del equipo** actualmente estan ocultos (campo `role` vacio)
4. **No modificar** la estructura del objeto, solo los valores

## Ejemplo de Uso

Usuario: `/actualizar-seccion`

Claude: "Que seccion deseas actualizar?"
- [ ] Castores
- [ ] Manada
- [ ] Tropa
- [ ] Pioneros
- [ ] Rutas

Usuario: "Tropa"

Claude: "Que campos deseas modificar?"
- [ ] Descripcion principal
- [ ] Detalles/Historia
- [ ] Marco simbolico
- [ ] Actividades
- [ ] Metodologia
- [ ] Equipo
- [ ] Imagen principal

Usuario: "Descripcion y actividades"

Claude: "Por favor, proporciona la nueva descripcion para la Tropa:"

Usuario: [proporciona texto]

Claude: "Ahora proporciona las actividades. Para cada una indica: icono, titulo y descripcion"

Usuario: [proporciona actividades]

Claude: [Aplica los cambios y confirma]
