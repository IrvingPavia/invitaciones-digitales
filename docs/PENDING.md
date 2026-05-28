# 📋 Pendientes y Mejoras — Vitely

## Bugs por verificar en dispositivo móvil físico

- [ ] Sobre → Intro: verificar que no hay flash de fondo entre sobre e intro en mobile real
    > Fix aplicado: el gif de fondo ahora hace fade-in (1.2s) solo después de que sobre+intro terminan. Fondo sólido oscuro como fallback.
- [ ] Fondo mobile: verificar fix de scroll en dispositivo real
    > Fix aplicado: `overscroll-behavior-y: contain` en `:host` del landing + bg extendido ±5vh.

## Features pendientes

### Alta prioridad
- [ ] Vista simplificada para rol `client` (dashboard directo a su evento)
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

---

## ✅ Completados (eliminar después de 1 semana sin regresión)

### 2025-05-27
- [x] Ejecutar scripts SQL de `MIGRATIONS.md` en server (sistema de usuarios)
- [x] Deploy rama `int-002` al server
- [x] Verificar Puppeteer funciona en server (Dockerfile con Chromium)
- [x] Burbujas en landing (se ven en preview y en landing real)
- [x] QR invitados: se genera correctamente con BASE_URL del servidor
- [x] PDF tarjetas: Puppeteer genera correctamente en el server (Chromium Alpine)
- [x] Cambio de contraseña desde el perfil del usuario logueado
- [x] Editor de tarjetas: nuevos items ya no se superponen (offset incremental de 12% vertical + 4% horizontal)
