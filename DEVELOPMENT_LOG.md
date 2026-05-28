# 📋 DEVELOPMENT LOG — Vitely

> **Documentación distribuida en `docs/`**
> - `docs/CONTEXT.md` — Contexto general del proyecto (compartir al iniciar sesión)
> - `docs/ARCHITECTURE.md` — Stack, estructura, BD, roles
> - `docs/DEPLOY.md` — Instrucciones de despliegue al server
> - `docs/MIGRATIONS.md` — Scripts SQL para aplicar en producción
> - `docs/PENDING.md` — Pendientes, bugs, mejoras recomendadas

---

## Última sesión: 2025-05-27 (sesión 2)

### Vista simplificada para rol Client
- **Home client**: Cards de acceso rápido (Invitados, Configurar, Tarjetas, Ver Landing) en vez del selector genérico
- **Sidebar dinámico**: Para clients con 1 evento muestra links directos a sus secciones
- **Sin acceso a Eventos/Usuarios**: Ocultos en sidebar y sin botón "Nuevo Evento"
- **Mensaje vacío personalizado**: Si no tiene eventos asignados, indica contactar al admin

### Módulo de Sugerencias
- **Backend**: Tabla `suggestions` + CRUD en `/api/suggestions` (filtrado por rol)
- **Frontend**: Componente con formulario (categoría + texto) + lista con estados
- **Client**: Envía sugerencias, ve estado y respuesta del admin
- **Admin/Root**: Ve todas, filtra por estado, cambia estado, responde con nota, elimina
- **Categorías**: Landing, Tarjetas, Invitados, General
- **Estados**: nueva → leída → implementada/descartada

### Bug fixes
- **Editor tarjetas**: Nuevos elementos ya no se superponen (offset 12% vertical + 4% horizontal)
- **Landing bg flash**: Gif de fondo hace fade-in (1.2s) solo después de sobre+intro (fondo sólido como fallback)
- **Landing scroll mobile**: `overscroll-behavior-y: contain` en `:host` del landing

### Rama: `int-003`
- Push a GitHub: `origin/int-003`
- Migración pendiente: tabla `suggestions` (ver `docs/MIGRATIONS.md`)

---

## Sesión anterior: 2025-05-27

### Módulo de Tarjetas de Invitación (Rediseño completo)
- **Arquitectura**: Eliminado fabric.js + PDFKit, reemplazado por HTML/CSS editor + Puppeteer
- **Editor visual**: Canvas WYSIWYG con elementos posicionables (texto, imagen, QR, separador)
- **Drag & drop**: Mover elementos con mouse/touch, valores redondeados
- **Resize**: Handle en esquina inferior-derecha
- **Guías de alineación**: Snap al centro y a otros elementos (±2%)
- **Fondo**: Color sólido, degradado bicolor (ángulo 0-360° + intensidad 0-100%), imagen
- **QR**: Color configurable, fondo transparente (SVG), label on/off con color
- **Separadores**: Estilo (sólida/guiones/puntos/doble/degradado), grosor, color
- **Layout PDF**: Tamaño tarjeta (mm), página (Carta/A4/Oficio), orientación, márgenes, marcas de corte
- **Preview dinámico**: Aspect-ratio real según dimensiones configuradas
- **Variables de texto**: {nombre}, {evento}, {fecha}, {tipo}, {asistentes}, {codigo}, {invitados}
- **Feedback de guardado**: Botón cambia a verde "Guardado ✓" o rojo "Error" (3s)
- **Backend Puppeteer**: Chromium en Alpine Docker, genera PDF desde HTML con fuentes Google

### Otros cambios de la sesión
- Font de títulos del dashboard: Montserrat (antes Playfair)
- Login: logo Vitely actualizado
- Documentación distribuida en `docs/`

---

## Sesión anterior: 2025-05-26

### Sistema de usuarios y roles
- Roles: root, admin, client
- Tabla user_events (muchos-a-muchos)
- Middleware de roles (requireRole, requireUserManagement, requireEventAccess)
- CRUD usuarios con reset password, contraseña visible (plain_password)
- Import dedup de invitados
- Sidebar condicional por rol

### Branding Vitely
- Paleta púrpura (#7c5cbf / #9d6ee7)
- Logo + favicon
- Favicon dinámico por evento en landing

### Landing improvements
- Sobre de invitación (5 estilos)
- Partículas configurables (6 tipos, size, opacity, direction)
- Mobile cards para eventos/invitados
- Navegación con scrollIntoView
- Fix fondo mobile (110dvh)
