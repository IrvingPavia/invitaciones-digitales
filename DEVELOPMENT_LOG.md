# 📋 DEVELOPMENT LOG — Vitely

> **Documentación distribuida en `docs/`**
> - `docs/CONTEXT.md` — Contexto general del proyecto (compartir al iniciar sesión)
> - `docs/ARCHITECTURE.md` — Stack, estructura, BD, roles
> - `docs/DEPLOY.md` — Instrucciones de despliegue al server
> - `docs/MIGRATIONS.md` — Scripts SQL para aplicar en producción
> - `docs/PENDING.md` — Pendientes, bugs, mejoras recomendadas

---

## Última sesión: 2025-05-27

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
