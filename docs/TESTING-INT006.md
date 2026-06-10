# 🧪 Plan de Pruebas — int-006

> Checklist de verificación para todas las características nuevas de la rama `int-006`.

---

## 1. Limpieza de Optional Chaining + ensureConfigDefaults

### Qué se hizo
Se agregó normalización de config en el backend (ruta pública) y se eliminaron `?.` redundantes en templates.

### Pruebas

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 1.1 | Landing carga sin errores | Abrir `/invitacion/{slug}` con un evento existente | La landing carga completa, sin errores en consola | ☐ | ☐ |
| 1.2 | Evento sin config previo | Crear un evento nuevo, no configurar nada, abrir la landing | Debe cargar con defaults (sin crash), secciones vacías no visibles | ☐ | ☐ |
| 1.3 | Evento legacy (config viejo) | Abrir landing de un evento creado antes de esta sesión | Debe funcionar igual que antes, sin regresiones | ☐ | ☐ |
| 1.4 | Consola limpia | En DevTools → Console, verificar que no hay errores de `undefined` ni warnings NG8107 | 0 errores, 0 warnings relacionados | ☐ | ☐ |

---

## 2. Dresscode Cards Dinámicas

### Qué se hizo
La sección Vestimenta ahora usa cards configurables (N cards) con título, descripción, hasta 4 imágenes, fondo y esquinas individuales.

### Pruebas — Dashboard

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 2.1 | Agregar card | Config → Vestimenta → "+ Agregar ejemplo" | Se agrega una card vacía con controles de título, descripción, imágenes | ☐ | ☐ |
| 2.2 | Subir imágenes | En una card, subir 1-4 imágenes | Las imágenes aparecen como thumbnails, contador se actualiza (1/4, 2/4...) | ☐ | ☐ |
| 2.3 | Eliminar imagen | Click en ✕ de un thumbnail | La imagen se elimina del array | ☐ | ☐ |
| 2.4 | Máximo 4 imágenes | Subir 4 imágenes | El botón "+" desaparece | ☐ | ☐ |
| 2.5 | Eliminar card | Click "Eliminar" en el header de la card | La card se remueve completamente | ☐ | ☐ |
| 2.6 | Fondo per-card | Toggle "Fondo" en una card individual | Se refleja en landing (con/sin fondo en esa card específica) | ☐ | ☐ |
| 2.7 | Esquinas per-card | Mover slider de esquinas (0-24px) | El border-radius cambia en la landing para esa card | ☐ | ☐ |
| 2.8 | Guardar y recargar | Guardar config, recargar página | Las cards persisten con todos sus datos | ☐ | ☐ |

### Pruebas — Landing

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 2.9 | Cards se renderizan | Abrir landing con cards configuradas | Se ven las cards con imágenes, título y descripción | ☐ | ☐ |
| 2.10 | Imágenes lado a lado | Card con 2+ imágenes | Las imágenes se muestran en fila centrada (flex wrap en mobile) | ☐ | ☐ |
| 2.11 | Retrocompatibilidad | Evento con config viejo (tenía descripción global + icono) | Se muestra la card legacy con icono + descripción | ☐ | ☐ |
| 2.12 | Hover en imágenes | Pasar mouse sobre imagen de ejemplo | Ligero zoom (scale 1.05) | ☐ | N/A |

---

## 3. Animaciones de Scroll (6 estilos)

### Qué se hizo
Las secciones de la landing ahora animan al entrar en viewport con 6 estilos configurables.

### Pruebas — Dashboard

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 3.1 | Selector visible | Config → Estilos → "Animación de Secciones" | Se ven 6 botones: Fade Up, Fade In, Slide Left, Slide Right, Scale, Ninguna | ☐ | ☐ |
| 3.2 | Cambiar estilo | Seleccionar cada opción y guardar | El botón activo se marca con borde dorado | ☐ | ☐ |

### Pruebas — Landing

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 3.3 | Fade Up | Seleccionar "Fade Up", abrir landing, scrollear | Las secciones suben desde abajo (80px) con fade in | ☐ | ☐ |
| 3.4 | Fade In | Seleccionar "Fade In" | Las secciones aparecen solo con opacidad, sin movimiento | ☐ | ☐ |
| 3.5 | Slide Left | Seleccionar "Slide Left" | Las secciones entran desde la izquierda (-100px) | ☐ | ☐ |
| 3.6 | Slide Right | Seleccionar "Slide Right" | Las secciones entran desde la derecha (+100px) | ☐ | ☐ |
| 3.7 | Scale | Seleccionar "Scale" | Las secciones crecen desde 0.8 con fade | ☐ | ☐ |
| 3.8 | Ninguna | Seleccionar "Ninguna" | Las secciones aparecen directamente sin animación | ☐ | ☐ |
| 3.9 | Timing perceptible | Scrollear lento por la landing | La animación se nota claramente (1.4s de duración, threshold 10%) | ☐ | ☐ |
| 3.10 | No scroll horizontal | Con slide-left/right activado | No aparece barra de scroll horizontal | ☐ | ☐ |

---

## 4. Estilos por Sección — Fondos

### Qué se hizo
Cada sección puede tener su propio fondo (sólido, degradado, imagen) independiente del tema global.

### Pruebas — Dashboard

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 4.1 | Toggle OFF por defecto | Abrir cualquier tab de sección | "✨ Estilo de sección" aparece con toggle OFF | ☐ | ☐ |
| 4.2 | Activar estilo | Toggle ON en "Estilo de sección" | Aparecen controles de fondo (Sólido/Degradado/Imagen) | ☐ | ☐ |
| 4.3 | Fondo sólido | Elegir "Sólido" + color blanco | El picker muestra el color seleccionado | ☐ | ☐ |
| 4.4 | Fondo degradado | Elegir "Degradado" + 2 colores + ángulo | Aparecen Color 1, Color 2, slider de ángulo | ☐ | ☐ |
| 4.5 | Fondo imagen | Elegir "Imagen" + subir archivo | Aparece "Imagen cargada ✔" + slider de overlay | ☐ | ☐ |
| 4.6 | Desactivar estilo | Toggle OFF | Los controles desaparecen, la sección vuelve a heredar global | ☐ | ☐ |
| 4.7 | Disponible en todas las tabs | Verificar en: Detalles, Venues, Itinerario, Galería, Vestimenta, Regalos, Confirmación | Todas tienen el panel "✨ Estilo de sección" | ☐ | ☐ |

### Pruebas — Landing

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 4.8 | Fondo sólido | Configurar una sección con fondo blanco | La sección se ve con fondo blanco completo (full-width) | ☐ | ☐ |
| 4.9 | Fondo degradado | Configurar con degradado 2 colores | Se ve el degradado en la dirección del ángulo configurado | ☐ | ☐ |
| 4.10 | Fondo imagen + overlay | Subir imagen + overlay al 60% | La imagen se ve con oscurecimiento, el texto es legible | ☐ | ☐ |
| 4.11 | Hereda global si OFF | Sección sin sectionStyle | Se ve transparente (hereda fondo global de la landing) | ☐ | ☐ |
| 4.12 | Alternancia de fondos | Configurar secciones alternadas (claro/oscuro) | Se ven las secciones con fondos distintos como en la referencia | ☐ | ☐ |
| 4.13 | Full-width del fondo | En mobile (520px) | El fondo abarca todo el ancho de pantalla, no solo el contenido | ☐ | ☐ |

---

## 5. Estilos por Sección — Dividers SVG

### Qué se hizo
7 tipos de separadores orgánicos SVG entre secciones.

### Pruebas — Dashboard

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 5.1 | Selector de divider | Activar estilo → ver "Separador superior" | Se ven 8 botones: Ninguno, Onda, Curva, Diagonal, Zigzag, Montañas, Gotas, Flecha | ☐ | ☐ |
| 5.2 | Seleccionar tipo | Click en "∿ Onda" | Se marca como activo, aparecen controles de color/alto/invertir | ☐ | ☐ |
| 5.3 | Color del divider | Cambiar color con picker | El SVG debería usar ese color en la landing | ☐ | ☐ |
| 5.4 | Alto configurable | Mover slider 20-100px | Controla la altura del SVG | ☐ | ☐ |
| 5.5 | Invertir | Toggle "Invertir" | El SVG se espeja horizontalmente | ☐ | ☐ |

### Pruebas — Landing

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 5.6 | Divider visible | Configurar onda en una sección | Se ve el SVG ondulado entre la sección anterior y esta | ☐ | ☐ |
| 5.7 | Cada tipo funciona | Probar cada uno de los 7 tipos | Todos renderizan correctamente su forma SVG | ☐ | ☐ |
| 5.8 | Color correcto | Poner color del fondo de sección anterior | Se crea ilusión de continuidad orgánica entre secciones | ☐ | ☐ |
| 5.9 | Responsive | Ver en mobile (320-520px) | Los dividers se escalan proporcionalmente, no se cortan | ☐ | ☐ |
| 5.10 | No divider si "Ninguno" | Dejar "Ninguno" seleccionado | No aparece ningún SVG entre secciones (como antes) | ☐ | ☐ |
| 5.11 | Posición correcta | Observar el divider | Debe estar en la parte superior de la sección, superpuesto al final de la anterior | ☐ | ☐ |

---

## 6. Estilos por Sección — Override de Texto (Fase 2)

### Qué se hizo
Cada sección puede sobreescribir el color de títulos y contenido independientemente del tema global.

### Pruebas — Dashboard

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 6.1 | Controles de color visibles | Activar estilo de sección | Aparece "Colores de texto (override)" con pickers de Títulos y Contenido | ☐ | ☐ |
| 6.2 | Elegir color oscuro | Poner heading color negro (#333) sobre fondo blanco | El picker guarda el valor | ☐ | ☐ |
| 6.3 | Botón limpiar | Click "Limpiar" | Ambos colores se resetean a vacío (hereda global) | ☐ | ☐ |
| 6.4 | Nota informativa | Ver debajo de los pickers | Dice "Deja vacío para heredar del tema global." | ☐ | ☐ |

### Pruebas — Landing

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 6.5 | Override de heading | Sección con fondo claro + heading oscuro | Los títulos de esa sección se ven en el color configurado | ☐ | ☐ |
| 6.6 | Override de contenido | Sección con fondo claro + contenido oscuro | Los textos de contenido de esa sección usan el color custom | ☐ | ☐ |
| 6.7 | Solo afecta esa sección | Configurar override en Details pero no en Venues | Details usa colores custom, Venues usa colores globales | ☐ | ☐ |
| 6.8 | Sin override | Dejar pickers vacíos | La sección usa los colores del tema global normalmente | ☐ | ☐ |
| 6.9 | Legibilidad | Fondo claro + textos oscuros | El contenido es perfectamente legible | ☐ | ☐ |

---

## 7. Regresiones Generales

### Verificar que las funcionalidades existentes no se rompieron

| # | Caso | Esperado | Desktop | Mobile |
|---|------|----------|---------|--------|
| 7.1 | Sobre/Intro/Hero cargan | Pantalla inicio → Intro → Hero funciona como antes | ☐ | ☐ |
| 7.2 | Countdown funciona | El reloj cuenta regresivamente sin errores | ☐ | ☐ |
| 7.3 | Audio se reproduce | Click en play → la música suena | ☐ | ☐ |
| 7.4 | Galería funciona | Los 8 estilos de galería renderizan, drag funciona | ☐ | ☐ |
| 7.5 | RSVP/Registro funciona | Formulario de confirmación/registro envía datos | ☐ | ☐ |
| 7.6 | Navegación sticky | Nav aparece al scrollear, menú abre/cierra | ☐ | ☐ |
| 7.7 | Botón "Volver" funciona | Bar inferior sube al tope al tocarla | ☐ | ☐ |
| 7.8 | Templates de landing | Aplicar un template no rompe nada | ☐ | ☐ |
| 7.9 | Preview en iframe | Pestaña "📱 Preview" carga la landing embebida | ☐ | ☐ |
| 7.10 | Guardar config | Botón "Guardar" guarda sin error, muestra "Guardado ✓" | ☐ | ☐ |

---

## 8. Puntos de Atención Mobile

Verificar específicamente en dispositivo móvil real (iPhone/Android):

| # | Qué verificar | Por qué |
|---|---------------|---------|
| 8.1 | Fondos de sección no se cortan | Rubber-band scroll en iOS puede revelar bordes |
| 8.2 | Dividers SVG se escalan bien | En pantallas angostas no deben generar overflow |
| 8.3 | Botones "icon-type-btn" del config no se cortan | En el dashboard, los botones de selección deben hacer wrap |
| 8.4 | Imágenes de vestimenta hacen wrap | Con 3-4 imágenes, deben bajar a segunda fila si no caben |
| 8.5 | Animaciones de scroll fluidas | No deben generar jank/lag en dispositivos de gama media |
| 8.6 | No scroll horizontal | Especialmente con slide-left/right y dividers |
| 8.7 | Color pickers funcionales en mobile | Los pickers de color deben ser tappables |
| 8.8 | Fondos full-width en 520px | El fondo custom debe cubrir todo el viewport, no solo el max-width |

---

## 9. Fase 3 — Override de Fuentes + Animaciones Individuales + Presets

### Qué se hizo
Cada sección ahora puede configurar fuentes independientes para títulos y contenido, una animación de entrada individual (override del global), y presets rápidos que pre-configuran combinaciones comunes.

### Pruebas — Dashboard

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 9.1 | Dropdown fuente títulos | Activar estilo → "Colores y fuentes de texto" → dropdown "Fuente títulos" | Se ve selector con 12 opciones (Hereda, Lato, Montserrat, etc.) | ☐ | ☐ |
| 9.2 | Dropdown fuente contenido | Mismo panel → dropdown "Fuente contenido" | Se ve selector con 9 opciones | ☐ | ☐ |
| 9.3 | Selector animación individual | "Animación de entrada" visible con 7 botones | Hereda, Fade Up, Fade In, Slide Left/Right, Scale, Ninguna | ☐ | ☐ |
| 9.4 | Preset Claro | Click ☀ Claro | Fondo crema, textos oscuros, divider wave se configuran automáticamente | ☐ | ☐ |
| 9.5 | Preset Oscuro | Click 🌙 Oscuro | Fondo #1a1a2e, heading dorado, contenido blanco, divider curve | ☐ | ☐ |
| 9.6 | Preset Vino | Click 🍷 Vino | Degradado burdeos, textos crema, divider slant diagonal | ☐ | ☐ |
| 9.7 | Preset Transparente | Click ◻ Transparente | Todo se resetea, bgType='inherit', colores vacíos, divider=none | ☐ | ☐ |
| 9.8 | Limpiar todo | Click "Limpiar todo" en texto | Ambos colores y fuentes se vacían | ☐ | ☐ |
| 9.9 | Disponible en todas las tabs | Verificar en: Details, Venues, Itinerary, Gallery, Dresscode, Gifts, RSVP | Todas tienen fuentes + animación + presets | ☐ | ☐ |

### Pruebas — Landing

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 9.10 | Override de fuente heading | Configurar "Cinzel" como fuente títulos en una sección | Los títulos de esa sección usan Cinzel | ☐ | ☐ |
| 9.11 | Override de fuente contenido | Configurar "Montserrat" como fuente contenido | Los textos de contenido usan Montserrat | ☐ | ☐ |
| 9.12 | Fuentes solo en esa sección | Configurar fuente en Details pero no en Venues | Details usa fuente custom, Venues hereda global | ☐ | ☐ |
| 9.13 | Animación individual | Poner "scale" en Details y "slide-left" en Venues | Cada sección anima diferente al scrollear | ☐ | ☐ |
| 9.14 | Animación "hereda" | Dejar "Hereda" en una sección | Usa la animación global configurada en Estilos | ☐ | ☐ |
| 9.15 | Preset aplica todo junto | Aplicar preset "Vino" y verificar en landing | Fondo burdeos + textos crema + divider diagonal visibles | ☐ | ☐ |
| 9.16 | Combinación mixta | Sección 1: Claro, Sección 2: Vino, Sección 3: hereda global | Se ven las 3 secciones con estilos distintos alternados | ☐ | ☐ |

---

## Cómo probar

### Local (Desktop)
```
http://localhost
Login: root / admin123
```

### Landing de prueba
```
http://localhost/invitacion/{slug}
```

### Mobile (opción 1 — DevTools)
Chrome → F12 → Toggle device toolbar → iPhone 14 / Samsung Galaxy

### Mobile (opción 2 — dispositivo real)
Conectar al mismo WiFi → navegar a `http://{IP-PC}:80/invitacion/{slug}`

---

## Notas
- Después de cada cambio en config: **Ctrl+Shift+R** en la landing para limpiar cache
- Los dividers SVG usan `position: absolute; top: 0; transform: translateY(-99%)` — si se ven mal, verificar que no hay `overflow: hidden` en el padre
- Los text overrides usan CSS custom properties + `!important` para sobreescribir los estilos inline que cada sección aplica
