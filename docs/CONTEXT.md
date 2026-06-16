# 📖 Contexto del Proyecto — Vitely

> Para retomar desarrollo, comparte este archivo o la carpeta `docs/` al iniciar sesión.

## ¿Qué es Vitely?

Plataforma SaaS para crear y gestionar invitaciones digitales (bodas, XV años, cumpleaños, conferencias, etc.) con landing pages personalizables y tarjetas físicas imprimibles. Soporta eventos privados (con lista de invitados) y eventos abiertos (registro público con cupo).

## Funcionalidades principales

### Landing Page (público)
- Sobre animado con sello (pre-intro)
- Intro con partículas configurables (6 tipos, dirección, colores, opacidad)
- Hero con countdown, nombres con degradado (ocultables), descripción opcional, audio
- Secciones: Invitación, Detalles, Lugares, Itinerario, Galería (8 estilos: Carrusel 3D, Vertical 3D, Coverflow, Stack, Flip, Polaroid, Grid, Slideshow), Vestimenta, Regalos, RSVP/Registro
- Tema global configurable (colores, fuentes, 15 tipografías)
- 5 templates de landing predefinidos (Elegante, Moderno, Romántico, Festivo, Corporativo)
- Menú de navegación dinámico (solo muestra secciones habilitadas)
- Formulario de registro público para eventos abiertos (campos configurables + selector de lada)
- Opciones por sección: ocultar icono, quitar fondo de card
- Mobile-first (520px max-width)
- Favicon dinámico por evento
- Spellcheck habilitado globalmente (lang="es")
- **Fondo de tarjetas configurable**: per-item en Detalles y Venues, global en el resto
- **Border-radius configurable** (0–24px) en todas las secciones con cards
- **Animaciones de scroll configurables** (6 estilos): Fade Up, Fade In, Slide Left, Slide Right, Scale, Ninguna. Configurable desde pestaña Estilos. Threshold 10%, duración 1.4s, cubic-bezier suave.
- **Estilos por sección (fondos)**: Cada sección puede tener su propio fondo (sólido, degradado lineal, imagen con overlay) independiente del tema global. Toggle "✨ Estilo de sección" en cada pestaña del config.
- **Dividers SVG entre secciones**: 7 tipos de separadores orgánicos (onda, curva, diagonal, zigzag, montañas, gotas, flecha). Color, alto (20-100px) e inversión configurables.
- **Override de colores de texto per sección**: Cada sección con estilo custom puede sobreescribir el color de títulos y contenido (Fase 2). Usa CSS custom properties para aplicar solo dentro de la sección.
- **Vestimenta con cards dinámicas**: N cards con título, descripción, hasta 4 imágenes de ejemplo, fondo y esquinas individuales por card. Reemplaza la configuración estática anterior.
- **PDF compatible con Android Chrome**: Preview abre en nueva pestaña en mobile (window.open con blob URL), descarga usa appendChild para compatibilidad cross-browser.
### Dashboard (admin)
- Gestión de eventos (CRUD, tipos: Boda, Cumpleaños, XV Años, Bautizo, Graduación, Empresarial, Conferencia)
- **Carrusel 3D de eventos**: Selector visual con cards verticales estilizadas, card activa al centro con perspectiva 3D, fondo refleja el tema del evento (colores/degradado/imagen/gif/video del hero), reflejo espejo, navegación con flechas/dots/click. **Drag continuo iPhone-style** (cards se mueven 1:1 con cursor, snap al soltar con momentum). Botones de acción centrados debajo del carrusel — en mobile aparecen como iconos integrados con backdrop blur.
- **Duplicar evento**: Botón que clona configuración completa (config, tarjetas, itinerario, fotos) a un nuevo evento. Slug secuencial (`-copia-01`, `-copia-02`).
- Selector de template al crear evento
- Modo de evento: privado (invitados) / abierto (registro con cupo)
- Gestión de invitados (CRUD, import/export Excel, QR) — solo eventos privados
- Vista de registrados (lista, stats, eliminar) — solo eventos abiertos
- KPIs adaptados según tipo de evento (invitados vs registrados)
- Configuración visual completa de la landing (13 tabs + preview en iframe tipo celular)
- Campos de registro configurables: diseño add/remove dinámico — campo "Nombre" fijo, campos adicionales como cards con icono, etiqueta editable, badge obligatorio/opcional, botón eliminar + formulario inline "Agregar campo"
- Editor de tarjetas físicas (drag & drop, elementos posicionables, PDF con Puppeteer)
- **Compresión automática de imágenes** al subir (sharp: max 1920px, JPEG 80%)
- **Rate limiting en login** (5 intentos/15min por IP)
- Gestión de usuarios (root/admin/client con permisos)
- **Compartir invitaciones**: Botón share individual (WhatsApp en mobile, copiar link en desktop). Envío masivo asistido. Tracking de enviados. Campo teléfono en invitados + import Excel.
- **Exportar landing como screenshot**: Captura PNG full-page con Puppeteer desde pestaña Preview.
- **Validación de input con Joi**: Schemas centralizados para todas las rutas del backend.
- **Sanitización HTML**: Prevención XSS al guardar config JSON.
- **Audit log**: Historial de cambios por evento (config_save, event_create, update, delete, duplicate).
- **Forzar cambio de contraseña**: Usuarios client deben cambiar contraseña en primer login.
- Gestión de usuarios (root/admin/client con permisos)
- Diálogos personalizados (sin confirm/alert nativos del navegador)
- Selector de hora personalizado (sin datetime-local nativo)
- Responsive (cards en mobile, tabla en desktop)
- Branding Vitely (púrpura, logo, favicon)
- Módulo de sugerencias (retroalimentación de clientes)
- **Pantalla de inicio configurable**: 4 templates (Sobre, Ticket, Splash, Plano) con colores y textos personalizables
- **Soporte video MP4/WebM** en fondo de landing e intro (con precarga y tooltips de ayuda)

### Tarjetas de invitación
- Editor visual con canvas WYSIWYG
- Elementos: texto (con variables dinámicas), imagen, QR, separador
- Drag & drop con guías de alineación (snap)
- **Reordenar elementos** con drag & drop en la lista (controla z-index)
- **Duplicar elementos** (clon exacto con offset)
- **Undo/Redo** (Ctrl+Z/Y, 30 estados de historial)
- Resize con handle
- Fondo: color sólido, degradado bicolor (ángulo + intensidad), imagen
- 4 templates predefinidos (Elegante, Moderno, Floral, Infantil)
- PDF generado con Puppeteer (fidelidad 100% al preview)
- Vista previa PDF en modal (sin descarga)
- Layout configurable: tamaño tarjeta, página (Carta/A4/Oficio), orientación, márgenes, gap, marcas de corte
- **Tarjetas genéricas (eventos abiertos)**: Dos modos de impresión:
  - "Hoja única" (folleto/flyer): diseño centrado en página, tamaño configurable
  - "Múltiples copias": N tarjetas idénticas, maximiza espacio por hoja
  - QR apunta a landing genérica (sin código de invitado)
  - Variables de texto filtradas: solo {evento}, {fecha}, {tipo}

### Eventos abiertos (v1 + v2 completos)
- Campo `event_mode` (private/open) + `max_capacity` en eventos
- Tabla `registrations` (name, email, phone, company, position)
- Endpoints públicos de registro con validación de cupo + duplicados
- Landing con formulario dinámico (campos configurables desde dashboard)
- Selector de lada con dropdown custom y banderas (22 países)
- Dashboard: vista de registrados con stats de cupo
- KPIs: registrados / lugares disponibles / cupo total + barra de progreso

## GitHub

- **Repo**: https://github.com/IrvingPavia/invitaciones-digitales
- **Rama activa**: `int-007`
- **Cuenta**: IrvingPavia

## Comandos útiles (local)

```bash
# Levantar todo (rebuild)
cd c:\Portafolio\invitaciones-digitales
docker-compose up -d --build --force-recreate frontend backend

# Solo frontend
docker-compose up -d --build --force-recreate frontend

# Solo backend
docker-compose up -d --build --force-recreate backend

# Ver logs
docker-compose logs -f backend

# Acceso local
# Dashboard: http://localhost (login: root / admin123)
# Landing privada: http://localhost/invitacion/{slug}?t={codigo}
# Landing abierta: http://localhost/invitacion/{slug}
```

## Decisiones de diseño clave

- **Config como JSON**: Toda la configuración visual en `event_config.config_json` (flexibilidad sin migraciones)
- **Templates como objetos JS**: Definidos en backend (`events.js`) y frontend (`config.component.ts`). No requieren BD.
- **Campos de registro en config JSON**: `rsvp.registrationFields` dentro del config_json del evento (sin tabla extra)
- **Puppeteer para PDF**: HTML → PDF garantiza fidelidad visual
- **Roles en JWT**: Token incluye role + can_manage_users para decisiones en frontend
- **Uploads relativos**: Rutas `/uploads/...` en BD, resueltas por Nginx proxy
- **URLs de uploads en frontend**: Usa `window.location.origin + '/' + path` para construir URLs absolutas (Nginx hace proxy de `/uploads/` al backend)
- **Endpoint `/api/events/themes`**: Devuelve theme + heroBackground + globalStyles de todos los eventos del usuario en una sola llamada (evita N requests individuales)
- **Volúmenes Docker nombrados**: Datos persistentes entre rebuilds
- **Secciones apagadas por defecto**: Eventos nuevos inician con todas las secciones en `enabled: false`
- **DialogService global**: Reemplaza confirm()/alert() nativos en todo el dashboard
- **ensureConfigDefaults en backend**: La ruta pública `/api/public/invitation/:slug` normaliza el config JSON con todos los defaults antes de enviarlo al frontend. Esto garantiza que todas las secciones existen y permite eliminar optional chaining redundante en templates.
- **SectionStyle como override**: Cada sección puede tener `sectionStyle?: SectionStyle` opcional. Si no existe o `bgType === 'inherit'`, hereda todo del tema global. Solo se aplica override cuando el usuario activa la personalización. Zero breaking changes con configs existentes.
- **Dividers SVG como componente**: `SectionDividerComponent` recibe tipo/color/alto/flip y genera el path SVG dinámicamente. Se posiciona con `position: absolute; top: 0; transform: translateY(-99%)` para superponerse al final de la sección anterior.
- **Text overrides con CSS custom properties**: Los overrides de color de texto usan `--section-heading-color` y `--section-content-color` en el `.section-block`, aplicados con `::ng-deep` + `!important` para sobreescribir estilos inline de cada componente hijo.
- **Open Graph para bots**: Nginx detecta user-agents de redes sociales y redirige a `/api/public/og/:slug` que sirve HTML con meta tags + redirect. Usuarios normales reciben la SPA Angular.
- **Compartir WhatsApp (sin API de pago)**: Se usa `wa.me/{phone}?text=` (deep link) que abre WhatsApp con mensaje pre-llenado. El usuario confirma envío manualmente. No requiere WhatsApp Business API.
- **Validación con Joi + sanitización**: Input se valida en middleware antes del handler (schemas tipados). Config JSON se sanitiza al guardar (sanitize-html). Doble capa de protección.
- **Audit log non-blocking**: Los registros de auditoría se insertan con try/catch que loguea errores sin interrumpir la operación principal.

## Base de datos (11 tablas)

| Tabla | Propósito |
|-------|-----------|
| `users` | Autenticación con roles (root/admin/client) |
| `user_events` | Relación muchos-a-muchos usuario↔evento |
| `events` | Eventos con slug, tipo, fecha, event_mode, max_capacity |
| `event_config` | JSON blob con toda la configuración visual |
| `guests` | Invitados con código único, tipo, confirmación |
| `registrations` | Registros públicos para eventos abiertos (name, email, phone, company, position) |
| `itinerary` | Items del itinerario (normalizado) |
| `photos` | Galería de fotos por evento |
| `card_templates` | Plantillas de tarjetas (front/back JSON) |
| `suggestions` | Sugerencias/retroalimentación de clientes |
| `audit_log` | Historial de cambios (user, action, entity, timestamp) |

## Notas para desarrollo local

- Cualquier cambio en código requiere rebuild de Docker (`docker-compose up -d --build --force-recreate frontend backend`)
- Después del rebuild, hacer Ctrl+Shift+R en el navegador para limpiar cache
- El steering file `.kiro/steering/docker-rebuild.md` instruye al agente a hacer rebuilds automáticamente
