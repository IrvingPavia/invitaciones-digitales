# 📋 Pendientes y Mejoras — Vitely

## Bugs activos

- [x] **PDF tarjetas se cortan con márgenes de 10mm**: En el preview del layout se ve correcto, pero al generar el PDF las tarjetas se cortan (overflow). Ocurre cuando se usa margen de 10mm en la hoja y las tarjetas al tamaño máximo posible sin modificar el margen.
    > Fix: Se eliminó el doble margen (Puppeteer aplicaba 5mm extra + el CSS del `.page` aplicaba padding con el margen del usuario). Ahora Puppeteer usa `margin: 0` y el HTML maneja todo el layout con `@page { margin: 0; size: WxH }` + padding correcto en `.page`.
- [x] **Separación entre tarjetas no configurable**: Actualmente existe un gap fijo entre tarjetas en el layout. Debería ser configurable: permitir separación 0 (tarjetas pegadas) para que el cliente pueda cortar con guillotina, o definir un gap personalizado.
    > Fix: Se agregó propiedad `gap` al `pdfLayout` (0-10mm). Con gap=0 las tarjetas quedan pegadas para corte con guillotina. El control aparece en la pestaña "Tamaño / Layout" del editor.

## Bugs por verificar en dispositivo móvil físico

- [ ] Sobre → Intro: verificar que no hay flash de fondo entre sobre e intro en mobile real
    > Fix aplicado: el gif de fondo ahora hace fade-in (1.2s) solo después de que sobre+intro terminan. Fondo sólido oscuro como fallback.
- [ ] Fondo mobile: verificar fix de scroll en dispositivo real
    > Fix aplicado: `overscroll-behavior-y: contain` en `:host` del landing + bg extendido ±5vh.

## Features pendientes

### Alta prioridad
- [x] Vista simplificada para rol `client` (dashboard directo a su evento, selector cuando tiene múltiples)
- [x] **Templates predefinidos para tarjetas**: 4 templates (Elegante, Moderno, Floral, Infantil) con confirmación modal integrada antes de reemplazar diseño existente.
- [x] **Eventos abiertos v1 (backend)**: Campo `event_mode` (private/open) + `max_capacity` en eventos. Tabla `registrations`. Endpoints públicos de registro con validación de cupo + duplicados. Ruta dashboard para registrados. Modal de crear evento con selector de modo + cupo.
- [x] **Vista previa PDF en el editor de tarjetas**: Botón "Vista previa" que genera solo la primera página y la muestra en un popup/modal sin descargar archivo. Incluye auto-guardado antes de generar.
- [x] **Límites dinámicos de tamaño de tarjeta**: El alto/ancho máximo se adapta al tamaño de hoja, orientación y modo (solo frente / frente+reverso). Auto-clamp al cambiar configuración.

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
- [ ] Toggle dark/light mode para el dashboard
- [ ] Sistema emoji/imagen para venues (como itinerario)
- [ ] Drag & drop para reordenar elementos en la lista de tarjetas
- [ ] Duplicar elementos en el editor de tarjetas
- [ ] Undo/Redo en el editor de tarjetas

### Baja prioridad
- [ ] Warnings de `?.` innecesarios en templates Angular (no afectan funcionalidad)
- [ ] Mini cards con ejemplos de vestimenta (pendiente: esperar imágenes de referencia)
- [ ] Eliminar dependencia `fabric` del package.json (ya no se usa)
- [ ] Eliminar dependencia `pdfkit` del backend (reemplazado por Puppeteer)
- [ ] Probar video trimmer con video >5seg y verificar selección de sección intermedia

## Mejoras recomendadas

> Documentadas para atender en futuras iteraciones.

### Seguridad
- [ ] Rate limiting específico para login (prevenir brute force)
- [ ] Validación de input con Joi/Zod en backend
- [ ] Forzar cambio de contraseña en primer login para clients
- [ ] Expiración de sesión configurable
- [ ] Sanitización de HTML en campos de texto enriquecido (prevenir XSS)

### Performance
- [ ] Lazy loading de imágenes en landing (IntersectionObserver)
- [ ] Compresión de imágenes al subir (sharp/imagemin en backend)
- [ ] Cache de QR generados (evitar regenerar en cada request)
- [ ] CDN para assets estáticos (imágenes, videos, fuentes)
- [ ] Service Worker para cache offline de la landing
- [ ] Optimización de bundle Angular (tree-shaking, code splitting)

### UX
- [ ] Notificaciones push cuando un invitado confirma
- [ ] Dashboard con gráficas de confirmaciones en tiempo real (WebSocket/SSE)
- [ ] Preview de landing en iframe dentro del dashboard
- [ ] Exportar landing como imagen/screenshot (Puppeteer)
- [ ] Multi-idioma (español/inglés) — landing + dashboard
- [ ] Historial de cambios por evento (audit log)
- [ ] Duplicar evento completo (clonar configuración + tarjetas)

### Infraestructura
- [ ] CI/CD con GitHub Actions (build + test + deploy automático)
- [ ] Backups automáticos de BD (cron + mysqldump + S3/storage)
- [ ] Monitoreo con healthchecks y alertas (uptime, errores)
- [ ] Dominio propio para Vitely (vitely.app o similar)
- [ ] Staging environment (para probar antes de producción)
- [ ] Logs centralizados (errores backend, métricas de uso)
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
