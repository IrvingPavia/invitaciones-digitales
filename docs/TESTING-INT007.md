# 🧪 Plan de Pruebas — int-007 (UX Configurador + Dashboard)

> Checklist de verificación para todas las mejoras UX de la rama `int-007`.

---

## 1. Navegación del Configurador (Sidebar con Categorías)

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 1.1 | Sidebar visible en desktop | Abrir Config en pantalla >900px | Sidebar lateral izquierda con 4 categorías | ☐ | N/A |
| 1.2 | Categorías colapsables | Click en "Secciones" | Se expande mostrando los 8 sub-items | ☐ | ☐ |
| 1.3 | Item activo resaltado | Click en "Galería" | Se marca con borde izquierdo púrpura + color activo | ☐ | ☐ |
| 1.4 | Auto-expand categoría | Click en item de otra categoría | La categoría del item clickeado se expande | ☐ | ☐ |
| 1.5 | Overlay en mobile | Ventana <900px → click ☰ | Sidebar aparece como overlay fullscreen | ☐ | ☐ |
| 1.6 | Botón cerrar en overlay | Overlay abierto → click ← | Se cierra sin elegir opción | ☐ | ☐ |
| 1.7 | Selección cierra overlay | En overlay → click en item | Se cierra y muestra la sección | ☐ | ☐ |
| 1.8 | Sidebar sticky | Scrollear contenido largo | El sidebar permanece fijo | ☐ | N/A |

---

## 2. Cards Colapsables

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 2.1 | Card se colapsa | Click en header "Aplicar Template" | El body desaparece con transición suave | ☐ | ☐ |
| 2.2 | Card se expande | Click de nuevo en header colapsado | El body reaparece | ☐ | ☐ |
| 2.3 | Flecha indicadora | Card sin toggle-pill | Muestra ícono ∧/∨ a la derecha | ☐ | ☐ |
| 2.4 | Sin flecha duplicada | Card con toggle ON/OFF | NO muestra flecha extra | ☐ | ☐ |
| 2.5 | Toggle no colapsa | Click directamente en el toggle ON/OFF | Solo cambia el estado, no colapsa | ☐ | ☐ |
| 2.6 | Estilo de sección sin doble flecha | Card "✨ Estilo de sección" con ON | Solo su propio expand_more, sin ::after | ☐ | ☐ |

---

## 3. Header Contextual por Sección

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 3.1 | Banner visible | Navegar a "Tema y Colores" | Banner con ícono color_lens + título + descripción | ☐ | ☐ |
| 3.2 | Descripción útil | Ver cada sección | Texto explica qué configura esa sección | ☐ | ☐ |
| 3.3 | Todas las secciones | Navegar por las 14 secciones | Todas tienen su banner contextual | ☐ | ☐ |
| 3.4 | No aparece en Preview | Ir a Vista Previa | No debe mostrar banner redundante (verificar) | ☐ | ☐ |

---

## 4. Preview Flotante (FAB)

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 4.1 | FAB visible | Estar en cualquier sección excepto Preview | Botón circular púrpura abajo-derecha | ☐ | ☐ |
| 4.2 | FAB oculto en Preview | Navegar a "Vista Previa" | El FAB desaparece | ☐ | ☐ |
| 4.3 | Modal se abre | Click en FAB | Modal con mockup de celular + iframe | ☐ | ☐ |
| 4.4 | Preview funcional | Ver modal abierto | La landing se renderiza dentro del iframe | ☐ | ☐ |
| 4.5 | Botón Recargar | Click "Recargar" en modal | El iframe se refresca | ☐ | ☐ |
| 4.6 | Cerrar modal | Click en fondo oscuro o ✕ | Modal se cierra | ☐ | ☐ |
| 4.7 | No interfiere scroll | Scrollear con FAB visible | El FAB no tapa contenido importante | ☐ | ☐ |

---

## 5. Toggles Homologados

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 5.1 | Todos dicen ON/OFF | Revisar todos los toggles del config | Ninguno dice "Visible/Oculto" | ☐ | ☐ |
| 5.2 | Formato consistente | Verificar estructura del toggle | Siempre: dot primero, texto después | ☐ | ☐ |
| 5.3 | Toggle de Celebrantes | Sección Carátula → Nombres | Muestra ON/OFF (no Visible/Oculto) | ☐ | ☐ |
| 5.4 | Toggle Descripción adicional | Sección Carátula → Descripción | Muestra ON/OFF | ☐ | ☐ |

---

## 6. Estilo de Sección en Invitación

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 6.1 | Panel existe | Navegar a Secciones → Invitación | Se ve "✨ Estilo de sección" con toggle | ☐ | ☐ |
| 6.2 | Activar estilo | Toggle ON | Aparecen controles (fondo, divider, presets) | ☐ | ☐ |
| 6.3 | Fondo se aplica | Configurar fondo sólido rosa → Guardar → Ver landing | La sección invitación tiene fondo rosa | ☐ | ☐ |
| 6.4 | Presets funcionan | Click "☀ Claro" | Se aplica preset correctamente | ☐ | ☐ |

---

## 7. Landing Full-Width Sections

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 7.1 | Fondo cubre viewport | Desktop → sección con fondo sólido configurado | El color/imagen cubre 100% del ancho | ☐ | N/A |
| 7.2 | Contenido centrado | Desktop fullscreen | Cards/texto centrados a max ~680px | ☐ | N/A |
| 7.3 | Responsive reduce ancho | Reducir ventana a <1040px | Contenido baja a ~520px | ☐ | N/A |
| 7.4 | Mobile sin cambios | Ver en celular/320-520px | Se ve como antes, sin overflow horizontal | N/A | ☐ |
| 7.5 | GIF/Video de fondo funciona | Landing con backgroundGif configurado | El GIF/video se muestra correctamente | ☐ | ☐ |
| 7.6 | No scroll horizontal | Desktop y mobile | No hay barra de scroll horizontal | ☐ | ☐ |

---

## 8. Toolbar del Config

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 8.1 | Layout correcto | Ver toolbar en desktop | ← Volver | Configuración | 💾 Guardar | ☐ | N/A |
| 8.2 | Mobile compacto | Ver en <900px | ← | Configuración | ☰ 💾 | N/A | ☐ |
| 8.3 | Sticky al scroll | Scrollear contenido largo | Toolbar se queda fijo arriba | ☐ | ☐ |
| 8.4 | Guardar cambia estado | Click Guardar exitoso | Botón se pone verde "Guardado" | ☐ | ☐ |
| 8.5 | Volver funciona | Click ← Volver | Navega al dashboard | ☐ | ☐ |
| 8.6 | Título con estilo | Verificar fuente/color del título | Montserrat 18px, púrpura/dorado | ☐ | ☐ |

---

## 9. Page Header Global (flex-between)

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 9.1 | Eventos | Ir a /dashboard/events | Header con card contenedora, título púrpura | ☐ | ☐ |
| 9.2 | Usuarios | Ir a /dashboard/users | Mismo estilo de header | ☐ | ☐ |
| 9.3 | Invitados | Ir a /dashboard/guests/:id | Header con "Volver" + título | ☐ | ☐ |
| 9.4 | Registrados | Ir a /dashboard/registrations/:id | Header contenido | ☐ | ☐ |
| 9.5 | Sugerencias | Ir a /dashboard/suggestions | Header con título púrpura | ☐ | ☐ |
| 9.6 | Light mode | Activar modo claro | Headers con fondo blanco, borde gris | ☐ | ☐ |
| 9.7 | Responsive | Reducir ventana | El header hace wrap sin romperse | ☐ | ☐ |

---

## 10. Estilos Visuales Generales

| # | Caso | Pasos | Esperado | Desktop | Mobile |
|---|------|-------|----------|---------|--------|
| 10.1 | Sidebar hover | Pasar mouse sobre nav links | Hover sutil diferente del active | ☐ | N/A |
| 10.2 | Sidebar active | Link activo | Borde izquierdo púrpura + fondo | ☐ | N/A |
| 10.3 | Cards con hover | Pasar mouse sobre .card | Borde se hace ligeramente más visible | ☐ | N/A |
| 10.4 | Section-card collapsed | Colapsar un section-card | Header se redondea completamente (sin border-bottom) | ☐ | ☐ |
| 10.5 | Uploads cargan | Landing con imágenes configuradas | Todas las imágenes de /uploads/ se muestran | ☐ | ☐ |
| 10.6 | Nginx gzip | DevTools → Network → verificar headers | Content-Encoding: gzip en JS/CSS | ☐ | N/A |

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

### Verificar light mode
Toggle en el sidebar del dashboard → "Modo claro"

### Verificar responsive
Chrome DevTools → Toggle device toolbar → Resize manual del viewport

---

## Notas
- Ctrl+Shift+R después de cada deploy para limpiar cache
- El FAB preview aparece sobre todo contenido (z-index 900) — verificar que no tapa modales
- Los section-cards se colapsan con CSS class toggle (no Angular state) — el estado se pierde al cambiar de tab
- El `overflow-x: clip` en el `:host` de la landing es necesario para no crear stacking context (compatible con z-index negativo de fondos fixed)
