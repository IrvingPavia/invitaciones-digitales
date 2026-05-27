# 📖 Contexto del Proyecto — Vitely

> Para retomar desarrollo, comparte este archivo o la carpeta `docs/` al iniciar sesión.

## ¿Qué es Vitely?

Plataforma SaaS para crear y gestionar invitaciones digitales (bodas, XV años, cumpleaños, etc.) con landing pages personalizables y tarjetas físicas imprimibles.

## Funcionalidades principales

### Landing Page (público)
- Sobre animado con sello (pre-intro)
- Intro con partículas configurables (6 tipos, dirección, colores, opacidad)
- Hero con countdown, nombres con degradado, audio
- Secciones: Invitación, Detalles, Lugares, Itinerario, Galería, Vestimenta, Regalos, RSVP
- Tema global configurable (colores, fuentes, 15 tipografías)
- Mobile-first (520px max-width)
- Favicon dinámico por evento

### Dashboard (admin)
- Gestión de eventos (CRUD)
- Gestión de invitados (CRUD, import/export Excel, QR)
- Configuración visual completa de la landing (12+ tabs)
- Editor de tarjetas físicas (drag & drop, elementos posicionables, PDF con Puppeteer)
- Gestión de usuarios (root/admin/client con permisos)
- Responsive (cards en mobile, tabla en desktop)
- Branding Vitely (púrpura, logo, favicon)

### Tarjetas de invitación (nuevo)
- Editor visual con canvas WYSIWYG
- Elementos: texto (con variables dinámicas), imagen, QR, separador
- Drag & drop con guías de alineación (snap)
- Resize con handle
- Fondo: color sólido, degradado bicolor (ángulo + intensidad), imagen
- PDF generado con Puppeteer (fidelidad 100% al preview)
- Layout configurable: tamaño tarjeta, página (Carta/A4/Oficio), orientación, márgenes, marcas de corte

## GitHub

- **Repo**: https://github.com/IrvingPavia/invitaciones-digitales
- **Rama activa**: `int-002`
- **Cuenta**: IrvingPavia

## Comandos útiles (local)

```bash
# Levantar todo
cd c:\Portafolio\invitaciones-digitales
docker-compose up -d --build

# Solo frontend
docker-compose up -d --build frontend

# Solo backend
docker-compose up -d --build backend

# Ver logs
docker-compose logs -f backend

# Acceso local
# Dashboard: http://localhost (login: root / admin123)
# Landing: http://localhost/invitacion/{slug}?t={codigo}
```

## Decisiones de diseño clave

- **Config como JSON**: Toda la configuración visual en `event_config.config_json` (flexibilidad sin migraciones)
- **Puppeteer para PDF**: HTML → PDF garantiza fidelidad visual
- **Roles en JWT**: Token incluye role + can_manage_users para decisiones en frontend
- **Uploads relativos**: Rutas `/uploads/...` en BD, resueltas por Nginx proxy
- **Volúmenes Docker nombrados**: Datos persistentes entre rebuilds
