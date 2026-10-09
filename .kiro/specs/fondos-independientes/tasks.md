# Tareas — Fondos independientes (global, carátula y secciones)

> Acompaña a `requirements.md` y `design.md`. Marcar `[x]` al completar. Mantener sincronizado
> con el steering de sesión.

## Fase 0 — Fix previo (Tema 1, independiente del spec)
- [x] 1. Cambiar `dvh`→`svh` en las capas de fondo global (`.landing-bg`, `.landing-bg-video`,
  `.landing-bg-overlay`, `.landing-bg-solid`, `.landing-bg-texture`) para eliminar el salto al
  mostrar/ocultar la barra del navegador en móvil. (landing.component.ts)
- [x] 2. Homologar `.hero-section` a `min-height: 100svh` (con fallback 100vh). (hero.component.ts)

## Fase 1 — Modelo
- [x] 3. Crear interfaz `MediaBackground` en `models.ts` (url, desktopOverride, urlDesktop, fit,
  bannerWidth, position, overlay).
- [x] 4. Añadir `theme.landingBg?: MediaBackground` a `ThemeConfig`.
- [x] 5. Añadir `hero.heroBackground?: MediaBackground` a `HeroConfig`.
- [x] 6. Añadir `sectionStyle.media?: MediaBackground` a `SectionStyle` (conservar bgImage/bgFit/
  bgBannerWidth/bgOverlay como fallback).

## Fase 2 — Helper de resolución (compartido landing + canvas)
- [x] 7. Crear `core/utils/media-background.util.ts` con `resolveMedia(mb, isDesktop)` →
  `{ url, isVideo, fit, position, overlay, bannerWidth, hasMedia }`. `isVideo` por extensión
  (mp4/webm/ogg) vía `isVideoUrl`.
- [x] 8. Helpers de fallback: `sectionStyleToMedia(ss)` (desde bgImage/bgFit/bgBannerWidth/
  bgOverlay legacy) y `resolveGlobalBackground(landingBg, heroBackgroundGif)` (fondo global con
  fallback a hero.backgroundGif).

## Fase 3 — Render landing
- [ ] 9. Fondo global: alimentar `.landing-bg`/`.landing-bg-video` desde `theme.landingBg` vía
  `resolveMedia`; fallback a `hero.backgroundGif` si vacío. Mantener fijo + svh.
- [ ] 10. Carátula: renderizar capa de fondo propia dentro de `.hero-section` (imagen/gif como
  background-image o `<video>` para video), que SCROLLEA con la carátula. Fallback: sin fondo
  propio deja ver el global. (hero.component.ts)
- [ ] 11. Secciones: extender el render para soportar VIDEO por sección (hoy solo imagen) usando
  `resolveMedia(sectionStyle.media ?? fallback)`. Mantener overlay y banner.

## Fase 4 — Builder (control reutilizable)
- [ ] 12. Crear `BackgroundControlComponent` (sub-componente del props-panel): tipo de fondo +
  upload media (img/gif/video) + toggle "Imagen distinta para escritorio" + upload alterno +
  ajuste (fit/position/bannerWidth/overlay) + tooltips por tipo.
- [ ] 13. Integrar el control en: Tema Global (→ `theme.landingBg`), Carátula (nuevo acordeón
  "Fondo" → `hero.heroBackground`), y cada sección (→ `sectionStyle.media`).
- [ ] 14. Canvas (`builder.component.ts`): replicar resolución de media (video + override desktop
  + carátula con fondo propio) usando el mismo helper, para fidelidad canvas↔landing.

## Fase 5 — Uploads: límites por tipo + validación
- [ ] 15. Frontend: validar tamaño por extensión antes de subir (img 10MB / gif 15MB / video
  25MB); leyenda de error bajo el control si excede; no subir.
- [ ] 16. Backend `uploads.js`: reemplazar `fileSize: 50MB` único por límites por tipo (10/15/25)
  con mensaje de error claro.
- [ ] 17. Tooltips de ayuda en cada upload con formatos permitidos + dimensiones + peso recomendado.
- [ ] 18. Documentar en `docs/DEPLOY.md` / `docs/MIGRATIONS.md`: `client_max_body_size 25m` en el
  nginx del HOST en prod + alinear nginx del contenedor.

## Fase 6 — Retrocompatibilidad y verificación
- [ ] 19. Verificar que `ensureConfigDefaults` preserva los nuevos sub-objetos (theme.landingBg,
  hero.heroBackground, sectionStyle.media) sin recortarlos.
- [ ] 20. Verificar que invitaciones existentes (Valeria) se ven igual (fondo global desde
  `backgroundGif`, carátula hereda) — sin regresión en canvas, preview y landing.
- [ ] 21. Build + reconstruir contenedores + verificación visual (canvas, preview, móvil real).

## Notas
- Mantener la lógica de `isDesktop` consistente con el banner actual (breakpoint 768px).
- Video: `autoplay muted loop playsinline` + `preload="metadata"`.
- No romper el modo banner existente del fondo global ni de secciones.
