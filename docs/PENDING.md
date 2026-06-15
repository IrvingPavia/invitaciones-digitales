# 📋 Pendientes y Mejoras — Vitely

## Bugs activos

- [x] **PDF tarjetas se cortan con márgenes de 10mm**: En el preview del layout se ve correcto, pero al generar el PDF las tarjetas se cortan (overflow). Ocurre cuando se usa margen de 10mm en la hoja y las tarjetas al tamaño máximo posible sin modificar el margen.
    > Fix: Se eliminó el doble margen (Puppeteer aplicaba 5mm extra + el CSS del `.page` aplicaba padding con el margen del usuario). Ahora Puppeteer usa `margin: 0` y el HTML maneja todo el layout con `@page { margin: 0; size: WxH }` + padding correcto en `.page`.
- [x] **Separación entre tarjetas no configurable**: Actualmente existe un gap fijo entre tarjetas en el layout. Debería ser configurable: permitir separación 0 (tarjetas pegadas) para que el cliente pueda cortar con guillotina, o definir un gap personalizado.
    > Fix: Se agregó propiedad `gap` al `pdfLayout` (0-10mm). Con gap=0 las tarjetas quedan pegadas para corte con guillotina. El control aparece en la pestaña "Tamaño / Layout" del editor.

## Bugs por verificar en dispositivo móvil físico

- [x] Sobre → Intro: verificar que no hay flash de fondo entre sobre e intro en mobile real
    > Fix aplicado: el gif de fondo ahora hace fade-in (1.2s) solo después de que sobre+intro terminan. Fondo sólido oscuro como fallback. ✅ Verificado en iPhone.
- [x] Fondo mobile: verificar fix de scroll en dispositivo real
    > Fix aplicado: `overscroll-behavior-y: contain` en `:host` del landing + bg extendido ±5vh. ✅ Verificado.
- [x] **Config responsive mobile**: Botones `.icon-type-btn` se cortan en pantallas angostas en algunas secciones.
- [x] **Toggles y labels homologados**: Todos los toggles "Fondo" usan `.toggle-switch` estándar, slider renombrado de "Radio" a "Esquinas", labels unificadas "Mostrar fondo" en todas las secciones. Opciones de venues (estilo icono + esquinas + fondo) movidas dentro de cada card individual.
## Features pendientes

### Alta prioridad
- [x] Vista simplificada para rol `client` (dashboard directo a su evento, selector cuando tiene múltiples)
- [x] **Templates predefinidos para tarjetas**: 4 templates (Elegante, Moderno, Floral, Infantil) con confirmación modal integrada antes de reemplazar diseño existente.
- [x] **Eventos abiertos v1 (backend)**: Campo `event_mode` (private/open) + `max_capacity` en eventos. Tabla `registrations`. Endpoints públicos de registro con validación de cupo + duplicados. Ruta dashboard para registrados. Modal de crear evento con selector de modo + cupo.
- [x] **Vista previa PDF en el editor de tarjetas**: Botón "Vista previa" que genera solo la primera página y la muestra en un popup/modal sin descargar archivo. Incluye auto-guardado antes de generar.
- [x] **Límites dinámicos de tamaño de tarjeta**: El alto/ancho máximo se adapta al tamaño de hoja, orientación y modo (solo frente / frente+reverso). Auto-clamp al cambiar configuración.
- [x] **Carrusel 3D de eventos en Dashboard**: Reemplazar el dropdown de selector de eventos por un carrusel 3D centrado. Card activa al centro (escalada), cards laterales con perspectiva rotada y reducidas. Fondo de cada card refleja los colores del tema del evento (o imagen/gif/video del hero si tiene). Textos usan colores de estilos globales del evento. Reflejo espejo debajo de cada card (`-webkit-box-reflect`). Flechas, dots, click en cards adyacentes para navegar. Al seleccionar se despliegan KPIs + acciones debajo. Responsive en mobile. Light mode completo.
- [x] **Editor de tarjetas mejorado**: Drag & drop para reordenar elementos (z-index), duplicar elementos, Undo/Redo (Ctrl+Z/Y + botones + historial 30 estados)
- [x] **Duplicar evento completo**: Botón en lista de eventos que clona config, tarjetas, itinerario y fotos a un nuevo evento con slug único
- [x] **Preview de landing en iframe**: Pestaña "📱 Preview" en configuración con mockup tipo celular que muestra la landing real embebida + botón recargar

### 🆕 Estilos por Sección (feature grande — int-006)

> **Contexto**: Permitir personalización visual individual por sección de la landing. Cada sección puede tener su propio fondo (color, degradado, imagen), colores de texto, y separadores orgánicos SVG entre secciones. La configuración global sigue siendo el default — solo se aplica override cuando el cliente activa la personalización en una sección específica.

> **Documentación completa**: `docs/FEATURE-SECTION-STYLES.md`
> **Plan de pruebas**: `docs/TESTING-INT006.md`

**Fases:**
- [x] **Fase 1 — Fondos + Dividers SVG**: Fondo configurable per-sección (inherit/solid/linear/image) + 7 tipos de separadores orgánicos SVG (wave, curve, slant, zigzag, mountains, drops, arrow) + toggle "✨ Estilo de sección" en TODAS las tabs del config (Detalles, Venues, Itinerario, Galería, Vestimenta, Regalos, Confirmación). Color, ángulo, overlay de imagen, alto del divider (20-100px), invertir.
- [x] **Fase 2 — Override de texto**: Colores de títulos y contenido configurables per-sección. Usa CSS custom properties para aplicar solo dentro del section-block. Botón "Limpiar" para volver a heredar del global.
- [x] **Fase 3 — Fuentes + Animaciones + Presets**: Override de fuentes per sección (heading/content font dropdowns 12 opciones). Animación de entrada individual (hereda/fade-up/fade-in/slide-left/slide-right/scale/none). 4 presets rápidos (☀ Claro, 🌙 Oscuro, 🍷 Vino, ◻ Transparente) que pre-configuran fondo+colores+divider.

**Pendiente próxima sesión:**
- [x] **Adornos de título per sección**: Implementado con 7 tipos SVG, posición configurable, color, tamaño.
- [x] **Verificar que la configuración de sección aplica correctamente en la landing** (fondos, dividers, colores de texto, fuentes)
- [x] **Stroke/borde opcional en la transición**: Controles de grosor (0-5px), color y opacidad del borde visible en la forma de la transición entre secciones. SVG overlay sincronizado con el clip-path. Disponible en todas las tabs.
- [x] **Preview del iframe se actualiza automáticamente**: Auto-refresh del iframe al guardar config exitosamente (sin necesidad de click en "Recargar").
- [ ] **Verificar landing real en dispositivo móvil**: Validar que clip-path de transiciones funciona en iOS Safari y Android Chrome

### 🆕 Sistema de Compartir Invitaciones (feature — int-006)

> **Contexto**: Permitir a los administradores compartir las invitaciones directamente por WhatsApp (mobile) o copiar links (desktop). Para eventos privados con lista de invitados, cada invitado tiene su link personalizado. Para eventos abiertos, se comparte un link genérico.

**Implementado:**
- [x] **Open Graph meta tags**: Endpoint `/api/public/og/:slug` genera HTML con OG tags para bots de redes sociales. Nginx detecta user-agents (WhatsApp, Facebook, Twitter) y redirige. Preview bonito al compartir links.
- [x] **Campo teléfono en invitados**: Columna `phone` en tabla guests. CRUD completo, import/export Excel (columnas "phone", "telefono", "celular"). Template actualizado.
- [x] **Tracking de envío**: Campos `invitation_sent` + `sent_at`. Endpoints mark-sent individual y bulk. Badge "✓ Enviado" en la tabla.
- [x] **Compartir individual**: Botón share por invitado. Mobile con teléfono → abre wa.me directo. Mobile sin teléfono → navigator.share. Desktop → copia link al clipboard.
- [x] **Envío masivo asistido**: Botón "Enviar invitaciones" filtra invitados con phone pendientes. Mobile → abre WhatsApp secuencial. Desktop → copia lista de links. Modal de confirmación previa.
- [x] **Mensaje configurable**: Campo `sharing.message` en config JSON con variables {nombre}, {evento}, {link}. Default con emojis.

### 🆕 Eventos abiertos / Conferencias (feature grande — versionado)

> **Contexto**: Actualmente Vitely solo soporta eventos con lista de invitados predefinida (bodas, XV años). Cada invitado tiene un código único, un QR personal, y la landing se personaliza con su nombre. Este feature extiende la plataforma para soportar eventos tipo conferencia, taller, o fiesta abierta donde NO hay una lista de invitados previa — cualquier persona con el link puede registrarse hasta llenar el cupo.

> **Problema que resuelve**: Un cliente quiere hacer una invitación digital para un evento público (conferencia, workshop, inauguración) donde no conoce a los asistentes de antemano. Necesita una landing atractiva + un sistema de registro con cupo limitado + tarjetas físicas/digitales sin datos personalizados por invitado.

> **Diferencia con el flujo actual**:
> - Flujo actual: Admin crea invitados → cada uno recibe QR único → landing personalizada con su nombre → confirma asistencia
> - Flujo nuevo: Admin configura evento abierto con cupo → comparte link genérico → cualquiera se registra con sus datos → cuando se llena el cupo, se cierra el registro

**Versionamiento propuesto:**

- **v1 — Base**: ✅ Completo. Backend (event_mode, max_capacity, tabla registrations, endpoints registro/status/CRUD) + Frontend (landing con formulario de registro dinámico, mensaje "cupo lleno", vista de registrados en dashboard, KPIs adaptados, selector de lada con dropdown custom).
- **v2 — Campos dinámicos**: ✅ Completo. Campos configurables desde la pestaña Confirmaciones en config (nombre, email, teléfono, empresa, cargo). Cada campo puede activarse/desactivarse y marcarse como obligatorio. Selector de lada con banderas para teléfono.
- **v3 — Tarjetas genéricas**: ✅ Completo. Tarjetas sin variables de invitado + QR que apunta a la landing genérica (sin `?t=code`). Dos modos de impresión: "Hoja única" (folleto/flyer centrado en página, tamaño configurable) y "Múltiples copias" (N tarjetas idénticas maximizando espacio por hoja). Variables de texto filtradas (solo {evento}, {fecha}, {tipo}). Vista previa proporcional al tamaño real.

### Media prioridad
- [x] **Fondo de tarjetas individual**: Toggle "Fondo" en todas las secciones con cards. Per-item en: Detalles, Venues. Global en: Invitación, Itinerario, Vestimenta, Regalos (mesa + transferencia), Confirmación, Countdown.
- [x] **Border-radius configurable en cards de landing**: Slider 0–24px en todas las secciones. Per-item en Detalles. Global en el resto.
- [x] **Toggle dark/light mode para el dashboard**: Botón en sidebar, persiste en localStorage, tema light con overrides completos para todos los componentes.
- [x] **Sistema emoji/imagen para venues**: Selector tipo (sin icono/emoji/imagen) con picker de emojis, igual que itinerario.
- [x] **Fondo configurable de la landing**: 4 tipos (Color plano, Degradado, Foco central, Difuminado) + 8 texturas (noise, grain, dots, lines, cross, paper, linen, stars) + controles de ángulo, expansión, mezcla, opacidad. Se refleja en todos los previews del dashboard.
### Baja prioridad
- [x] Warnings de `?.` innecesarios en templates Angular (no afectan funcionalidad)
    > Fix: Se agregó `ensureConfigDefaults` en el backend (ruta pública) que normaliza todas las secciones del config con valores por defecto. Esto permitió eliminar los `?.` redundantes en la landing, hero, gifts y register components. 0 warnings NG8107 en build.
- [x] Mini cards con ejemplos de vestimenta (pendiente: esperar imágenes de referencia)
    > Fix: Se rediseñó la sección Vestimenta con cards dinámicas (N cards). Cada card tiene título, descripción, hasta 4 imágenes de ejemplo, fondo y esquinas individuales. Se eliminó la descripción global, icono de sección y controles globales. Retrocompatible con configs existentes.
- [x] Eliminar dependencia `fabric` del package.json (ya no se usa)
- [x] Eliminar dependencia `pdfkit` del backend (reemplazado por Puppeteer)
- [x] Probar video trimmer con video >5seg y verificar selección de sección intermedia

## Mejoras recomendadas

> Documentadas para atender en futuras iteraciones.

### Seguridad
- [x] Rate limiting específico para login (prevenir brute force)
- [x] Validación de input con Joi en backend (schemas para auth, events, users, guests, rsvp, registrations, suggestions)
- [x] Sanitización de HTML en campos de texto enriquecido (sanitize-html en config JSON save)
- [x] Forzar cambio de contraseña en primer login para clients
- [ ] Expiración de sesión configurable

### Performance
- [x] Lazy loading de imágenes en landing (native `loading="lazy"` en galería, dresscode)
- [x] Compresión de imágenes al subir (sharp en backend — resize max 1920px + JPEG 80%)
- [x] Cache de QR generados (LRU in-memory, max 500 entradas)
- [x] Optimización de bundle Angular (removido qrcode unused dep, Material Icons con display=swap, Nginx gzip nivel 6 + security headers + image caching 30d)
- [ ] CDN para assets estáticos (imágenes, videos, fuentes)
- [ ] Service Worker para cache offline de la landing (bloqueado por incompatibilidad esbuild/Alpine Docker — requiere refactor del Dockerfile)

### UX
- [ ] Notificaciones push cuando un invitado confirma
- [ ] Dashboard con gráficas de confirmaciones en tiempo real (WebSocket/SSE)
- [x] Preview de landing en iframe dentro del dashboard
- [x] Exportar landing como imagen/screenshot (Puppeteer)
- [ ] Multi-idioma (español/inglés) — landing + dashboard
- [x] Historial de cambios por evento (audit log)
- [x] Duplicar evento completo (clonar configuración + tarjetas)

### Infraestructura
- [ ] CI/CD con GitHub Actions (build + test + deploy automático)
- [ ] Backups automáticos de BD (cron + mysqldump + S3/storage)
- [x] Monitoreo con healthchecks y alertas (uptime, errores)
- [ ] Dominio propio para Vitely (vitely.app o similar)
- [ ] Staging environment (para probar antes de producción)
- [x] Logs centralizados (Morgan HTTP logging + error handler mejorado)
- [ ] Monitoreo con healthchecks y alertas
- [ ] Dominio propio para Vitely (vitely.app o similar)

---

## ✅ Completados (eliminar después de 1 semana sin regresión)

### 2025-05-28
- [x] Fix PDF tarjetas: eliminado doble margen, tarjetas centradas, layout inteligente (side-by-side o stacked)
- [x] Gap configurable entre tarjetas (0-10mm, 0 = corte con guillotina)
- [x] Colores del dashboard migrados de dorado a púrpura (tema Vitely)
- [x] Botón "Quitar imagen" compacto + títulos de secciones con color del tema
- [x] Preview de intro: mini celular a escala (9:16, cover, 225px max)
- [x] Fix tabs con borde bracket en focus (reset outline en buttons)
- [x] Modo "Solo Frente" en tarjetas (selector de caras, oculta reverso, PDF genera solo frente)
- [x] QR disponible en el frente (antes solo en reverso)
- [x] QR con max-size 50mm en PDF (evita que se haga gigante en tarjetas grandes)
- [x] Límites dinámicos de tamaño de tarjeta según hoja/orientación/modo
- [x] Auto-clamp de dimensiones al cambiar orientación/página/caras
- [x] Vista previa PDF en modal (primera página, sin descarga, con auto-guardado)
- [x] Preview de layout limitado al número real de invitados
- [x] Templates predefinidos para tarjetas (4 diseños + modal de confirmación)
- [x] Eventos abiertos v1 backend (event_mode, max_capacity, tabla registrations, endpoints)
- [x] Removido botón "Nuevo Evento" del dashboard (se crea desde sección Eventos)
- [x] Fix KPI grid responsive (auto-fit minmax)
- [x] Preview PDF con invitados demo cuando no hay invitados reales

### 2025-05-29
- [x] Eventos abiertos v1 frontend completo (landing + formulario registro + vista registrados + KPIs adaptados)
- [x] Campos de registro configurables (v2): nombre, email, teléfono, empresa, cargo — activables/obligatorios desde config
- [x] Selector de lada con dropdown custom y banderas (22 países LATAM + Europa)
- [x] Diálogos personalizados: reemplazo de confirm()/alert() nativos por modales estilizados
- [x] Selector de hora personalizado en modal de eventos (reemplazo de datetime-local nativo)
- [x] Secciones apagadas por defecto en eventos nuevos (venues sin items predefinidos)
- [x] Toggle para ocultar "Nombres de celebrantes" en carátula + campo "Descripción adicional"
- [x] Botón "Volver" consistente (siempre arriba del título) en todas las páginas
- [x] Tipo de evento default cambiado a "Boda" + opciones reordenadas + Bautizo/Conferencia agregados
- [x] Spellcheck habilitado globalmente (lang="es" + spellcheck="true")
- [x] Dashboard: botón Invitados/Registrados contextual según event_mode
- [x] Fix NaN% en progreso cuando evento no tiene invitados
- [x] **Eventos abiertos v3 — Tarjetas genéricas**: Tarjetas sin variables de invitado, QR apunta a landing genérica. Dos modos: "Hoja única" (folleto centrado, tamaño configurable) y "Múltiples copias" (N copias, maximiza espacio por hoja). Variables filtradas para eventos abiertos. Vista previa proporcional.

### 2025-06-04
- [x] **Carrusel 3D de eventos en Dashboard**: Reemplazó el dropdown por un carrusel 3D centrado con perspective. Card activa escalada al centro, laterales rotadas con profundidad. Fondo usa colores del tema del evento (landingBgColor1/2, landingBgType). Si tiene imagen/gif/video en el hero, se muestra en la card activa. Textos usan colores de `globalStyles` del evento. Reflejo espejo con `-webkit-box-reflect`. Navegación con flechas + dots + click en cards. Animación suave entre cards. Responsive.
- [x] Fix light mode en home dashboard: textos invisibles del selector de eventos (reemplazados estilos inline por clases CSS con `:host-context(body.light-mode)`)
- [x] Nuevo endpoint `GET /api/events/themes`: devuelve theme + heroBackground + globalStyles de todos los eventos del usuario en una sola llamada
- [x] Fix URL de media en dashboard: usa `window.location.origin` para construir URLs absolutas de uploads (resuelto ERR_NAME_NOT_RESOLVED)
- [x] Fix parpadeo de reflejo: `filter` movido al hijo `.carousel-card` + `will-change: transform` en wrapper + transiciones explícitas sin `all`
- [x] **Editor de tarjetas — Drag & Drop**: Reordenar elementos en la lista lateral con drag handles. El orden define el z-index visual.
- [x] **Editor de tarjetas — Duplicar**: Botón copiar en cada elemento, crea clon con offset +5% en X/Y
- [x] **Editor de tarjetas — Undo/Redo**: Ctrl+Z/Y + botones visuales, historial de 30 estados, cubre add/delete/move/resize/reorder
- [x] Eliminadas dependencias muertas: `fabric` (frontend) y `pdfkit` (backend)
- [x] **Duplicar evento completo**: Endpoint `POST /api/events/:id/duplicate` + botón en UI. Clona: event_config, card_templates, itinerary, photos
- [x] **Rate limiting en login**: 5 intentos por IP cada 15 min (express-rate-limit)
- [x] **Compresión de imágenes**: sharp en backend, resize max 1920px + JPEG quality 80% al subir
- [x] **Preview de landing en iframe**: Nueva pestaña "📱 Preview" en config con mockup celular (320×580px), iframe con landing real, botón recargar
- [x] **Carrusel drag continuo (iPhone-style)**: Cards se mueven 1:1 con el cursor al arrastrar. Al soltar hace snap a la card más cercana con momentum. Cursor grab/grabbing. Sin selección de texto.
- [x] Fix dialog "Duplicar evento": botón de confirmación ahora dice "Duplicar" en vez de "Eliminar"
- [x] Fix duplicar evento: error `Unknown column 'card_width'` resuelto (solo copia front/back_config)
- [x] Fix slug de copia: ahora genera `-copia-01`, `-copia-02` secuencial en vez de timestamp base36
- [x] **Botones de acciones mobile dashboard**: En mobile se oculta la barra de texto y aparecen iconos integrados debajo del carrusel (backdrop blur, borde redondeado)
- [x] Reflejo del carrusel visible en mobile: stage height 300px + padding-top para dejar espacio al reflejo
- [x] **Config responsive mobile**: botones icon-type-btn con flex-wrap, campos de registro rediseñados
- [x] **Dropdowns de fuente vacíos**: inicializados con `''` en ensureDefaults → muestran "Hereda" por defecto
- [x] **Campos de formulario de registro rediseñados**: Nuevo UX de agregar/eliminar dinámicamente. Campo "Nombre" fijo, resto como cards con icono + etiqueta editable + badge obligatorio/opcional clickeable + botón eliminar. Botón "+ Agregar campo" con form inline (etiqueta, tipo, obligatorio).
- [x] **Botones de acción en dashboard centrados**: actions-bar centrada + botones más prominentes (padding mayor, font-weight 600)
- [x] **Fix sidebar iOS**: barra de navegación del navegador tapaba los botones inferiores del sidebar. Solución: `100dvh` + `env(safe-area-inset-bottom)` + `viewport-fit=cover` en meta viewport
- [x] **Preload media en landing**: al cargar datos del evento, precarga inmediata del video de intro + GIF/imagen del hero mientras el usuario ve la pantalla de inicio. Verificado en iPhone — carga instantánea.
- [x] **Galería rediseñada con 8 estilos**: Carrusel 3D horizontal, Carrusel 3D vertical, Coverflow, Stack/Abanico, Flip/Album, Polaroid, Mosaico, Slideshow. Selector tipo dropdown en config. Drag continuo en mobile con detección de dirección (no interfiere scroll). Slideshow con flechas estilo chevron sin fondo.
- [x] **Lightbox mejorado**: fondo negro sólido, foto más grande (95vw × 75vh), botón cerrar visible debajo de la foto, pinch-to-zoom en mobile.
- [x] **No selección de texto en landing**: `user-select: none` global en la landing para prevenir selección accidental en botones/textos que dispara búsqueda en mobile.
- [x] **Fotos galería sin compresión**: las fotos de galería se suben en calidad original (sharp solo comprime uploads generales). Specs de resolución mostradas en el config.

### 2025-06-01
- [x] Fondo de tarjetas individual: toggle per-item en Detalles y Venues, global en Invitación, Itinerario, Vestimenta, Regalos, Confirmación, Countdown
- [x] Border-radius configurable (0–24px) en todas las secciones con cards: per-item en Detalles, global en el resto
- [x] Transferencia Bancaria: agregado toggle fondo + radius independiente de Mesa de Regalos
- [x] Fix fondo mobile rubber-band: extensión a ±15vh + precarga de GIF/video antes de mostrar
- [x] Soporte video MP4/WebM en fondo de landing e intro (detección por extensión, `<video>` con autoplay/loop/muted)
- [x] Tooltips de ayuda (?) en uploads de media con formatos, resolución y tamaño recomendados
- [x] Fix upload backend: aceptar MP4/WebM en tipo `gifs`
- [x] Cache headers en Nginx para `/uploads/` (7 días)
- [x] Pantalla de inicio: renombrada de "Sobre" a "Inicio", 4 templates (Sobre, Ticket, Splash, Plano)
- [x] Template Ticket: colores configurables (acento, fondo boleto, texto boleto), sin código de barras
- [x] Template Splash: logo + título + botón con colores configurables
- [x] Template Plano: textos que respetan fuentes de pestaña Estilos (título, subtítulo, contenido)
- [x] Selector de templates como cards visuales (mini preview de cada estilo)
- [x] Intro: fade-in suave al aparecer (transición desde pantalla de inicio)
- [x] Intro video: play forzado + hint "Toca para iniciar" si autoplay bloqueado
- [x] Fix field-row responsive: flex-wrap + min-width en campos de Estilos
- [x] Fix color texto sobre cortado en mobile (flex-wrap en fila de colores)

### 2025-05-27
- [x] Ejecutar scripts SQL de `MIGRATIONS.md` en server (sistema de usuarios)
- [x] Deploy rama `int-002` al server
- [x] Verificar Puppeteer funciona en server (Dockerfile con Chromium)
- [x] Burbujas en landing (se ven en preview y en landing real)
- [x] QR invitados: se genera correctamente con BASE_URL del servidor
- [x] PDF tarjetas: Puppeteer genera correctamente en el server (Chromium Alpine)
- [x] Cambio de contraseña desde el perfil del usuario logueado
- [x] Editor de tarjetas: nuevos items ya no se superponen (offset incremental de 12% vertical + 4% horizontal)

### 2025-06-08 (int-006)
- [x] **ensureConfigDefaults en backend**: Función que normaliza config JSON con defaults para todas las secciones. Aplicada en ruta pública `/api/public/invitation/:slug`. Permite eliminar `?.` redundantes.
- [x] **Limpieza de optional chaining**: Eliminados `?.` innecesarios en landing.component, hero.component, gifts.component, register.component. 0 warnings NG8107 en build.
- [x] **Dresscode cards dinámicas**: N cards con título, descripción, hasta 4 imágenes, fondo y esquinas individuales. Eliminada configuración global (descripción, icono). Retrocompatible con configs legacy.
- [x] **Animaciones de scroll configurables**: 6 estilos (Fade Up, Fade In, Slide Left, Slide Right, Scale, Ninguna). Selector en pestaña Estilos. Threshold 0.1, duración 1.4s, cubic-bezier. Movimientos amplificados (80px, 100px, scale 0.8).
- [x] **Estilos por sección — Fase 1 (Fondos + Dividers SVG)**: Interface `SectionStyle` + `sectionStyle?` en todos los configs. Fondos: sólido, degradado, imagen con overlay. 7 dividers SVG (wave, curve, slant, zigzag, mountains, drops, arrow). Color, alto (20-100px), invertir. UI en TODAS las tabs: Details, Venues, Itinerary, Gallery, Dresscode, Gifts, RSVP. Componente `SectionDividerComponent`.
- [x] **Estilos por sección — Fase 2 (Override de texto)**: Color de títulos y contenido per sección. CSS custom properties `--section-heading-color` y `--section-content-color`. Aplicados con `::ng-deep` + `!important`. Botón "Limpiar" para volver a heredar del global. Controles implementados en tab Detalles (patrón para replicar en las demás).
- [x] **Estilos por Sección — Fase 3 (Fuentes + Animaciones + Presets)**: Override de fuentes per sección (heading font + content font), animación de entrada individual per sección (override del global), 4 presets rápidos (Claro, Oscuro, Vino, Transparente). Controles completos en TODAS las tabs.
- [x] **Fix PDF en Android Chrome**: Preview PDF ahora abre en nueva pestaña en mobile (blob URL + window.open) en vez de iframe que no funciona. Descarga corregida con appendChild/removeChild para compatibilidad Android.

### 2025-06-12 (int-006 — Fase 4 + Mejoras)
- [x] **Fase 4 — Adornos de título per sección**: Nuevo `HeadingOrnamentComponent` con 7 tipos SVG (line, dots, sparkles, flourish, dash, arrows, wave). Interface `HeadingOrnament` en `SectionStyle`. Posición configurable (arriba/abajo/ambos/lados). Color y tamaño (0.5x–2x) configurables. Controles en TODAS las tabs del config. Fallback a separadores globales cuando posición es "sides".
- [x] **Rediseño del separador superior → Transición entre secciones (clip-path)**: Cambio arquitectónico completo. El divider ya NO es un SVG relleno con color — ahora es un `clip-path: polygon()` aplicado al section-block. La sección se superpone a la anterior con `margin-top` negativo y la forma orgánica recorta el borde superior. Soporte completo para fondos de imagen/degradado sin franjas de color artificial. Formas curvas (wave, curve, drops) generadas con Math.sin/cos (40-60 puntos para suavidad). Toggle "Invertir" funciona correctamente invirtiendo coordenadas Y.
- [x] **Eliminado campo "Color" del separador**: Ya no es necesario — el clip-path hereda automáticamente el fondo de la sección. Solo queda: tipo de forma, invertir, y alto.
- [x] **Preview de estilo de sección mejorado**: Usa clip-path real en el preview (misma lógica que la landing). Franja superior dinámica (`height = dividerHeight`). Padding-top dinámico para que el contenido no se solape con el corte. Escala proporcional con el valor de "Alto".
- [x] **Separación de Encabezado de sección vs Títulos**: Nuevo bloque "Encabezado de sección" (fuente, tamaño, color) controla el H2 grande. "Títulos de sección" controla los h3/títulos internos. CSS custom properties separados (`--section-h2-color`/`--section-h2-font` vs `--section-heading-color`). Campos `sectionHeadingColor`, `sectionHeadingFont`, `sectionHeadingSize` agregados al modelo `SectionStyle`.
- [x] **Fix controles responsive en config**: Inputs numéricos de sliders ampliados a 72px con padding reducido. Los campos de "Tamaño" (font) no se ven afectados. Sliders con max-width limitado.
- [x] **Fix texto "Invertir" diminuto**: Font-size 13px, sin transform scale, color más visible (0.6 opacidad).
- [x] **Fix adornos — escalado proporcional**: El SVG del preview ahora escala tanto width como height con el factor de tamaño.
- [x] **Método `getLandingBgColor()`**: Retorna solo el color sólido primario para uso en SVG fills (evita pasar gradientes CSS a SVG).

### 2025-06-15 (int-006 — Mejoras de seguridad, performance, UX + Sistema de compartir)
- [x] **Stroke/borde en transiciones**: Nuevas propiedades `dividerStrokeColor`, `dividerStrokeWidth` (0-5px), `dividerStrokeOpacity` (0-1) en `SectionStyle`. SVG overlay renderiza un path con stroke siguiendo la forma del clip-path. Controles "Borde de transición" en TODAS las tabs. Default 0 (sin borde) — retrocompatible.
- [x] **Auto-refresh del preview iframe**: El iframe se recarga automáticamente al guardar config exitosamente (`refreshPreview()` llamado en callback de éxito del `save()`). Texto actualizado. Botón "Recargar" manual conservado como fallback.
- [x] **Validación de input con Joi**: Middleware `validate.js` centralizado con schemas para: login, change-password, create/update event, create/update user, create/update guest, confirm RSVP, public registration, create/update suggestion. `stripUnknown: true` + `abortEarly: false`. Elimina validaciones manuales ad-hoc de las rutas.
- [x] **Lazy loading de imágenes**: Atributo nativo `loading="lazy"` en todas las imágenes de galería (6 estilos + slideshow) y dresscode (example images). Cero dependencias extra, soporte browser nativo.
- [x] **Sanitización HTML (prevención XSS)**: Paquete `sanitize-html` aplicado al guardar config JSON. Función `sanitizeConfigJson` recorre el JSON y sanitiza campos de texto que contengan HTML. Permite tags de formato básico (b, i, em, strong, a, ul, ol, li) pero elimina scripts y atributos peligrosos. Links forzados a `target="_blank" rel="noopener noreferrer"`.
- [x] **Cache de QR generados**: LRU in-memory (Map) con máximo 500 entradas. Evita regenerar el mismo QR en requests repetidos. Eviction automática del entry más antiguo al llegar al límite.
- [x] **Exportar landing como screenshot**: Endpoint `GET /api/events/:id/screenshot` usa Puppeteer con viewport 390×844 @2x para capturar la landing completa como PNG. Botón "Captura PNG" en pestaña Preview del config con descarga automática.
- [x] **Forzar cambio de contraseña en primer login**: Campo `must_change_password` en tabla users. Se activa automáticamente al crear usuarios client. Al hacer login, si el flag está activo muestra formulario de cambio obligatorio. Después de cambiar, el flag se limpia y navega al dashboard.
- [x] **Healthcheck mejorado**: Endpoint `/health` verifica conexión a MySQL y reporta `status: ok|degraded`, DB state, uptime. Retorna 503 si la BD está caída.
- [x] **Logs HTTP con Morgan**: Logging de todas las requests HTTP (método, URL, status, tiempo de respuesta). Excluye `/health` para no contaminar logs.
- [x] **Audit log (historial de cambios)**: Tabla `audit_log` con user, action, entity, timestamp. Se registran: config_save, event_create, event_update, event_delete, event_duplicate. Endpoint `GET /api/events/:id/audit` para consultar historial (últimos 50).
- [x] **Expiración de sesión**: Interceptor frontend detecta tokens JWT expirados antes de enviar requests. Si el token expiró, redirige automáticamente al login. Limpia el storage.
- [x] **Open Graph meta tags**: Endpoint `/api/public/og/:slug` sirve HTML con OG meta tags (título, descripción, imagen) para bots de WhatsApp/Facebook/Twitter. Nginx detecta user-agents de bots y redirige automáticamente. Preview de link bonito al compartir.
- [x] **Sistema de compartir invitaciones**: Campo `phone` en tabla guests + import/export Excel. Campo `invitation_sent` + `sent_at` para tracking. Endpoints `PUT /:id/mark-sent` y `PUT /bulk-mark-sent/:eventId`. Mensaje configurable en config JSON (`sharing.message` con variables {nombre}, {evento}, {link}). Lógica: en mobile usa `wa.me/{phone}?text=`, en desktop solo copiar URL.
- [x] **Optimización de bundle y Nginx**: Removido `qrcode` (unused dep). Material Icons con `display=swap`. Nginx: gzip level 6, imágenes cache 30d, security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy). Meta description + theme-color en index.html.
