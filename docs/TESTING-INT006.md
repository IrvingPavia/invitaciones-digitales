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

---

## 10. Stroke/Borde Opcional en la Transición

### Qué se hizo
Cada transición (clip-path) entre secciones ahora puede tener un borde visible (SVG stroke) con color, grosor y opacidad configurables. El stroke se renderiza como un SVG superpuesto que sigue la misma forma del clip-path.

### Pruebas — Dashboard

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 10.1 | Controles visibles | Activar estilo + seleccionar divider tipo "Onda" | Aparece bloque "Borde de transición" con Grosor, Color | ☐ | ☐ |
| 10.2 | Sin divider = sin controles | Con divider "Ninguno" seleccionado | No se muestra el bloque "Borde de transición" | ☐ | ☐ |
| 10.3 | Grosor default 0 | Abrir controles de borde por primera vez | Slider de grosor inicia en 0px | ☐ | ☐ |
| 10.4 | Slider de grosor | Mover slider de 0 a 3px | El valor se muestra al lado del slider | ☐ | ☐ |
| 10.5 | Color picker | Cambiar el color del stroke a rojo | El picker actualiza correctamente | ☐ | ☐ |
| 10.6 | Opacidad visible solo con grosor | Con grosor = 0 | El slider de opacidad NO aparece | ☐ | ☐ |
| 10.7 | Opacidad visible | Con grosor > 0 | El slider de opacidad aparece (0 a 1) | ☐ | ☐ |
| 10.8 | Disponible en todas las tabs | Verificar en: Details, Venues, Itinerary, Gallery, Dresscode, Gifts, RSVP | Todas tienen "Borde de transición" cuando hay divider activo | ☐ | ☐ |
| 10.9 | Guardar y persistir | Configurar stroke, guardar, recargar página | Los valores persisten correctamente | ☐ | ☐ |

### Pruebas — Landing

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 10.10 | Sin stroke (default) | Sección con divider pero sin stroke configurado | No se ve ningún borde visible (como antes) | ☐ | ☐ |
| 10.11 | Stroke visible | Configurar grosor 2px + color blanco | Se ve una línea blanca siguiendo la forma de la transición | ☐ | ☐ |
| 10.12 | Opacidad funciona | Configurar stroke + opacidad 0.5 | El borde se ve semi-transparente | ☐ | ☐ |
| 10.13 | Color correcto | Poner stroke color dorado (#d4a017) | El borde se ve dorado | ☐ | ☐ |
| 10.14 | Forma sincronizada | Wave + stroke 2px | El SVG stroke sigue exactamente la forma ondulada del clip-path | ☐ | ☐ |
| 10.15 | Invertir afecta stroke | Toggle "Invertir" activo + stroke | El stroke se invierte junto con la forma | ☐ | ☐ |
| 10.16 | Responsive | Ver en mobile 320-520px | El stroke se escala con el divider, no se desborda | ☐ | ☐ |
| 10.17 | Cada tipo con stroke | Probar stroke en los 7 tipos (wave, curve, slant, zigzag, mountains, drops, arrow) | Todos renderizan el stroke correctamente siguiendo su forma | ☐ | ☐ |

---

## 11. Auto-Refresh del Preview (iframe)

### Qué se hizo
El iframe de preview en la pestaña "📱 Preview" ahora se recarga automáticamente después de guardar exitosamente la configuración. El botón "Recargar" manual sigue disponible como fallback.

### Pruebas

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 11.1 | Auto-refresh al guardar | Estar en tab Preview → cambiar algo en otra tab → Guardar | El iframe se recarga automáticamente sin tocar "Recargar" | ☐ | ☐ |
| 11.2 | Cambios visibles | Cambiar color de fondo de sección + Guardar + ver Preview | El nuevo color aparece en el iframe sin acción extra | ☐ | ☐ |
| 11.3 | Texto actualizado | Verificar texto debajo del mockup | Dice "Se actualiza automáticamente al guardar." | ☐ | ☐ |
| 11.4 | Botón Recargar sigue | Verificar que el botón "Recargar" sigue disponible | Botón presente y funcional (refresca manualmente) | ☐ | ☐ |
| 11.5 | No refresh si error | Desconectar red → intentar guardar → error | El iframe NO se recarga cuando el guardado falla | ☐ | ☐ |
| 11.6 | Múltiples guardados | Guardar 3 veces seguidas rápidamente | El iframe se recarga cada vez sin errores ni acumulación | ☐ | ☐ |


---

## 12. Validación de Input con Joi

### Qué se hizo
Se agregó middleware centralizado de validación con Joi en todas las rutas que aceptan input del usuario. Los schemas validan tipos, longitudes, formatos y valores permitidos. Input inválido retorna 400 con mensajes descriptivos.

### Pruebas

| # | Caso | Endpoint | Pasos | Esperado |
|---|------|----------|-------|----------|
| 12.1 | Login sin username | POST /api/auth/login | Enviar `{ password: "x" }` | 400: "Username es requerido" |
| 12.2 | Login username largo | POST /api/auth/login | Username >50 chars | 400: "Username muy largo" |
| 12.3 | Crear evento sin slug | POST /api/events | Sin campo slug | 400: error de validación |
| 12.4 | Slug con espacios | POST /api/events | slug: "mi evento" | 400: "solo puede contener letras minúsculas, números y guiones" |
| 12.5 | Crear invitado sin nombres | POST /api/guests | Sin guest_names | 400: "Nombres del invitado es requerido" |
| 12.6 | max_companions negativo | POST /api/guests | max_companions: -1 | 400: error de validación |
| 12.7 | Registro público sin nombre | POST /api/public/register/:slug | `{ email: "x@y.z" }` | 400: "El nombre es requerido" |
| 12.8 | Email inválido en registro | POST /api/public/register/:slug | `{ name: "Test", email: "no-es-email" }` | 400: error de email |
| 12.9 | Cambiar contraseña corta | PUT /api/auth/change-password | newPassword: "12345" | 400: "al menos 6 caracteres" |
| 12.10 | Sugerencia vacía | POST /api/suggestions | `{ text: "" }` | 400: "El texto es requerido" |
| 12.11 | Categoría inválida | POST /api/suggestions | `{ text: "x", category: "hack" }` | 400: error de validación |
| 12.12 | Flujo normal funciona | POST /api/auth/login | Credenciales correctas | 200: token devuelto |

---

## 13. Lazy Loading de Imágenes

### Qué se hizo
Se agregó `loading="lazy"` nativo a todas las imágenes de la galería (6 estilos + slideshow) y de la sección vestimenta (imágenes de ejemplo).

### Pruebas

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 13.1 | Galería no carga todo | Abrir landing con galería de 20+ fotos → DevTools → Network → Img | Solo las fotos visibles/cercanas se cargan inicialmente | ☐ | ☐ |
| 13.2 | Fotos cargan al scrollear | Scrollear hasta la galería | Las imágenes se cargan conforme entran al viewport | ☐ | ☐ |
| 13.3 | Atributo presente | Inspeccionar `<img>` de galería | Tiene `loading="lazy"` | ☐ | ☐ |
| 13.4 | Lightbox funciona | Click en foto de galería | Lightbox abre con la imagen correcta cargada | ☐ | ☐ |
| 13.5 | Dresscode lazy | Sección vestimenta con imágenes de ejemplo | Las imágenes se cargan lazy (no bloquean carga inicial) | ☐ | ☐ |
| 13.6 | Primera foto visible | Con galería estilo carousel/coverflow | La foto activa/central se ve inmediatamente sin delay | ☐ | ☐ |

---

## 14. Sanitización HTML (XSS)

### Qué se hizo
Se implementó sanitización de campos de texto en el config JSON al guardar. Previene inyección de scripts maliciosos manteniendo formato básico permitido.

### Pruebas

| # | Caso | Pasos | Esperado |
|---|------|-------|----------|
| 14.1 | Script eliminado | En título de sección poner: `<script>alert('xss')</script>Hola` → Guardar → Verificar en BD | Solo queda "Hola", sin tag script |
| 14.2 | Formato preservado | Poner `<b>Negrita</b> y <i>cursiva</i>` en descripción | Se preserva el formato |
| 14.3 | onclick eliminado | Poner `<a onclick="alert(1)" href="#">Link</a>` | Se elimina onclick, se preserva href con target=_blank |
| 14.4 | Campos no-texto intactos | Configurar colores (#ff0000), URLs de uploads | No se modifican — solo se sanitizan campos de texto |
| 14.5 | Config normal funciona | Guardar un config normal sin HTML malicioso | Se guarda sin ningún cambio |
| 14.6 | img tag eliminado | Poner `<img src=x onerror=alert(1)>` en campo de texto | El tag img se elimina completamente |


---

## 15. Cache de QR Generados

### Qué se hizo
Los códigos QR se cachean en memoria (LRU, max 500 entradas). Requests repetidos devuelven el QR desde cache sin regenerarlo.

### Pruebas

| # | Caso | Pasos | Esperado |
|---|------|-------|----------|
| 15.1 | QR se genera | Pedir QR de un invitado nuevo | Se genera y devuelve correctamente |
| 15.2 | Cache funciona | Pedir el mismo QR 2 veces → medir tiempo | Segunda request es significativamente más rápida |
| 15.3 | URL correcta | Verificar campo `url` en response | Apunta a `/invitacion/{slug}?t={code}` |
| 15.4 | QR escanenable | Escanear el QR con celular | Abre la URL correcta de la landing |

---

## 16. Exportar Landing como Screenshot

### Qué se hizo
Nuevo endpoint `GET /api/events/:id/screenshot` que usa Puppeteer para capturar la landing completa como PNG (viewport mobile 390×844 @2x). Botón "Captura PNG" en pestaña Preview del config.

### Pruebas

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 16.1 | Botón visible | Ir a Config → Preview | Se ve botón "Captura PNG" junto a "Recargar" y "Abrir" | ☐ | ☐ |
| 16.2 | Screenshot se descarga | Click "Captura PNG" | Se descarga un archivo `landing-{slug}.png` | ☐ | N/A |
| 16.3 | Loading state | Click en botón | Muestra "Generando..." y se deshabilita mientras procesa | ☐ | ☐ |
| 16.4 | Imagen completa | Abrir el PNG descargado | Se ve la landing completa (full-page, no solo viewport) | ☐ | N/A |
| 16.5 | Resolución alta | Verificar dimensiones del PNG | Ancho ~780px (390×2) por el deviceScaleFactor 2 | ☐ | N/A |
| 16.6 | Error handling | Con backend apagado → click captura | No crash, vuelve al estado normal | ☐ | ☐ |

---

## 17. Forzar Cambio de Contraseña en Primer Login

### Qué se hizo
Los usuarios tipo `client` se crean con `must_change_password = 1`. Al hacer login, si el flag está activo, se muestra un formulario de cambio de contraseña obligatorio antes de acceder al dashboard.

### Pruebas

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 17.1 | Client nuevo con flag | Crear usuario client → verificar en BD | `must_change_password = 1` | ☐ | ☐ |
| 17.2 | Admin/root sin flag | Crear usuario admin | `must_change_password = 0` | ☐ | ☐ |
| 17.3 | Login muestra cambio | Login con client nuevo | En vez de ir al dashboard, muestra formulario "Cambio de contraseña requerido" | ☐ | ☐ |
| 17.4 | Contraseñas no coinciden | Ingresar contraseñas diferentes | Error: "Las contraseñas no coinciden" | ☐ | ☐ |
| 17.5 | Contraseña corta | Ingresar 5 caracteres | Error: "al menos 6 caracteres" | ☐ | ☐ |
| 17.6 | Cambio exitoso | Cambiar contraseña correctamente | Navega al dashboard, flag se limpia | ☐ | ☐ |
| 17.7 | Segundo login normal | Login con contraseña nueva | Entra directamente al dashboard sin pedir cambio | ☐ | ☐ |
| 17.8 | Root/admin login normal | Login como root o admin | Entra directamente, sin formulario de cambio | ☐ | ☐ |


---

## 18. Healthcheck + Logs + Audit Log + Expiración de Sesión

### 18a. Healthcheck mejorado

| # | Caso | Pasos | Esperado |
|---|------|-------|----------|
| 18.1 | Health OK | GET /health | `{ status: "ok", db: "connected", uptime: N, timestamp: "..." }` |
| 18.2 | Health degraded | Detener MySQL → GET /health | 503 con `{ status: "degraded", db: "disconnected" }` |

### 18b. Logs HTTP (Morgan)

| # | Caso | Pasos | Esperado |
|---|------|-------|----------|
| 18.3 | Logs visibles | `docker-compose logs -f backend` → hacer request | Se ve "GET /api/events 200 ... - Xms" |
| 18.4 | Health no se logea | GET /health repetidas veces | No aparece en los logs |

### 18c. Audit Log

| # | Caso | Pasos | Esperado |
|---|------|-------|----------|
| 18.5 | Config save registrado | Guardar config de un evento → GET /api/events/:id/audit | Aparece entry con action "config_save" |
| 18.6 | Event create registrado | Crear evento → consultar audit | Entry "event_create" con slug en details |
| 18.7 | Event delete registrado | Eliminar evento → verificar en BD audit_log | Entry "event_delete" registrado |
| 18.8 | Duplicate registrado | Duplicar evento → consultar audit del nuevo | Entry "event_duplicate" con referencia al original |
| 18.9 | Últimos 50 | Generar >50 entries → GET audit | Solo devuelve los 50 más recientes |

### 18d. Expiración de sesión

| # | Caso | Pasos | Esperado |
|---|------|-------|----------|
| 18.10 | Token expirado | Modificar token en localStorage (cambiar exp a pasado) → navegar | Redirige automáticamente al login |
| 18.11 | Token válido | Login normal → navegar por el dashboard | Funciona sin interrupciones |
| 18.12 | 401 del backend | Token válido pero backend rechaza (ej: usuario eliminado) | Redirige al login |


---

## 19. Sistema de Compartir Invitaciones

### Qué se hizo
Sistema completo para compartir invitaciones por WhatsApp (mobile) o copiar link (desktop). Incluye: Open Graph meta tags, campo de teléfono, tracking de envío, envío individual y masivo asistido.

### 19a. Open Graph Meta Tags

| # | Caso | Pasos | Esperado |
|---|------|-------|----------|
| 19.1 | Preview en WhatsApp | Compartir link de landing en un chat de WhatsApp | Se muestra título del evento + descripción + imagen del hero |
| 19.2 | Preview en Facebook | Pegar link en Facebook | Muestra OG card con título, descripción e imagen |
| 19.3 | Bot redirect | Acceder a `/invitacion/{slug}` con user-agent "WhatsApp" | Devuelve HTML con meta tags + redirect |
| 19.4 | Normal user | Acceder con navegador normal | Carga la SPA Angular normalmente |

### 19b. Campo Teléfono en Invitados

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 19.5 | Campo en modal | Abrir modal "Nuevo Invitado" | Se ve campo "Teléfono (WhatsApp)" con hint de formato | ☐ | ☐ |
| 19.6 | Guardar teléfono | Crear invitado con phone "521234567890" | Se guarda y muestra en la tabla | ☐ | ☐ |
| 19.7 | Editar teléfono | Editar invitado existente → agregar teléfono | Se actualiza correctamente | ☐ | ☐ |
| 19.8 | Import Excel con teléfono | Subir Excel con columna "phone" o "telefono" | Los teléfonos se importan correctamente | ☐ | ☐ |
| 19.9 | Export incluye teléfono | Exportar Excel | Columna "Telefono" presente con datos | ☐ | ☐ |
| 19.10 | Template actualizado | Descargar plantilla | Incluye columna "phone" con ejemplo | ☐ | ☐ |

### 19c. Compartir Individual

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 19.11 | Botón share visible | Ver tabla de invitados | Botón "share" en columna acciones | ☐ | ☐ |
| 19.12 | Desktop → copiar | Click share en desktop | Copia URL al clipboard + toast "Copiado" | ☐ | N/A |
| 19.13 | Mobile con phone → WhatsApp | Click share en mobile (invitado con teléfono) | Abre wa.me/{phone} con mensaje pre-llenado | N/A | ☐ |
| 19.14 | Mobile sin phone → share API | Click share en mobile (sin teléfono) | Usa navigator.share o copia link | N/A | ☐ |
| 19.15 | Marca como enviado | Después de compartir | Badge "✓ Enviado" aparece en la fila | ☐ | ☐ |

### 19d. Envío Masivo

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 19.16 | Botón habilitado | Con invitados que tienen teléfono y no están enviados | Botón "Enviar invitaciones" habilitado | ☐ | ☐ |
| 19.17 | Botón deshabilitado | Todos sin teléfono o todos ya enviados | Botón deshabilitado | ☐ | ☐ |
| 19.18 | Confirmar antes de enviar | Click "Enviar invitaciones" | Modal de confirmación con conteo | ☐ | ☐ |
| 19.19 | Desktop masivo | Confirmar en desktop | Copia todos los links como lista al clipboard | ☐ | N/A |
| 19.20 | Mobile masivo | Confirmar en mobile | Abre wa.me secuencialmente (cada 1.5s) | N/A | ☐ |
| 19.21 | Tracking masivo | Después de envío masivo | Todos marcados como "✓ Enviado" | ☐ | ☐ |


---

## 20. Optimizaciones de Performance y Bundle

### Qué se hizo
Optimizaciones de bundle (removed unused dep), meta tags SEO, Nginx con gzip mejorado + security headers + cache de imágenes 30d, Material Icons con display=swap.

### Pruebas

| # | Caso | Pasos | Esperado |
|---|------|-------|----------|
| 20.1 | Bundle sin qrcode | Verificar que `qrcode` no está en package.json del frontend | No está presente |
| 20.2 | Gzip activo | DevTools → Network → verificar `Content-Encoding: gzip` en JS/CSS | Respuestas comprimidas |
| 20.3 | Cache de imágenes | DevTools → Network → cargar imagen de /uploads/ | Header `Cache-Control: public, max-age=2592000` (30d) |
| 20.4 | Cache de JS/CSS | DevTools → cargar asset .js | Header `Cache-Control: public, immutable` |
| 20.5 | Security headers | DevTools → Response headers de cualquier request | `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` |
| 20.6 | Material Icons sin FOIT | Recargar página cold | Los iconos aparecen con text swap, no flash invisible |
| 20.7 | Meta description | Ver source HTML de index.html | Tiene meta description y theme-color |
| 20.8 | Título actualizado | Título de la pestaña del navegador | "Vitely — Invitaciones Digitales" |
