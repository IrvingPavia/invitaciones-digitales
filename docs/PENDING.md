# 📋 Pendientes y Mejoras — Vitely

## Pendientes de deploy

- [ ] Ejecutar scripts SQL de `MIGRATIONS.md` en server (sistema de usuarios)
- [ ] Deploy rama `int-002` al server
- [ ] Verificar Puppeteer funciona en server (Dockerfile con Chromium)

## Bugs por verificar en producción

- [ ] Burbujas en landing (se ven en preview pero verificar en landing real)
- [ ] Sobre: verificar que no hay flash de fondo entre sobre e intro en mobile real
- [ ] Fondo mobile: verificar fix de scroll en dispositivo real (110dvh + overscroll-behavior)
- [ ] QR invitados: verificar que se genera correctamente con BASE_URL del servidor
- [ ] PDF tarjetas: verificar que Puppeteer genera correctamente en el server (Chromium Alpine)

## Features pendientes

### Alta prioridad
- [ ] Vista simplificada para rol `client` (dashboard directo a su evento)
- [ ] Cambio de contraseña desde el perfil del usuario logueado
- [ ] Templates predefinidos para tarjetas (diseños base que el usuario personaliza)

### Media prioridad
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

## Mejoras recomendadas

### Seguridad
- [ ] Rate limiting específico para login (prevenir brute force)
- [ ] Validación de input con Joi/Zod en backend
- [ ] Forzar cambio de contraseña en primer login para clients
- [ ] Expiración de sesión configurable

### Performance
- [ ] Lazy loading de imágenes en landing (IntersectionObserver)
- [ ] Compresión de imágenes al subir (sharp/imagemin)
- [ ] Cache de QR generados (evitar regenerar en cada request)
- [ ] CDN para assets estáticos

### UX
- [ ] Notificaciones push cuando un invitado confirma
- [ ] Dashboard con gráficas de confirmaciones en tiempo real
- [ ] Preview de landing en iframe dentro del dashboard
- [ ] Exportar landing como imagen/screenshot
- [ ] Multi-idioma (español/inglés)

### Infraestructura
- [ ] CI/CD con GitHub Actions o Jenkins pipeline
- [ ] Backups automáticos de BD
- [ ] Monitoreo con healthchecks y alertas
- [ ] Dominio propio para Vitely (vitely.app o similar)
