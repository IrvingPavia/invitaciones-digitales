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
- [x] 9. Fondo global: `.landing-bg`/`.landing-bg-video` desde `theme.landingBg` vía
  `resolveMedia`/`resolveGlobalBackground`; fallback a `hero.backgroundGif`. Fijo + svh. Overlay
  global configurable (clase `.landing-bg-dark`). Preload actualizado a la media resuelta.
- [x] 10. Carátula: capa `.hero-bg-media` (+`.hero-bg-overlay`) dentro de `.hero-section` que
  SCROLLEA; imagen/gif como background-image o `<video>` para video; banner en desktop. Fallback:
  sin `heroBackground` deja ver el global. `.hero-content` z-index 1. (hero.component.ts)
- [x] 11. Secciones: soporte de VIDEO por sección (`.section-bg-video`) en las 8 secciones, vía
  `sectionMedia()` (= `resolveMedia(sectionStyleToMedia(ss))`). `getSectionBg` no pinta imagen si
  la media es video. Overlay y banner conservados.

## Fase 4 — Builder (control reutilizable)
- [x] 12. `BackgroundControlComponent` creado (`builder/components/background-control/`): upload
  media (img/gif/video) con validación de tamaño por tipo + tooltip, toggle "Imagen distinta para
  escritorio" + upload alterno, ajuste (fit cover/contain/banner, position, bannerWidth, overlay).
  Trabaja sobre un `MediaBackground` vía [model]/(modelChange).
- [x] 13. Integrado en: Tema Global ('bg' → `theme.landingBg`, con color/textura debajo como
  ambientación), Carátula ('hero-media' → `hero.heroBackground`, con audio aparte), y Fondo de
  Sección ('sec-bg', bgType='image' → `sectionStyle.media` con fallback legacy en el getter).
- [x] 14. Canvas (`builder.component.ts`): `canvasGlobalBg()` (theme.landingBg + fallback) alimenta
  el fondo global sticky; `getSectionBgStyle` usa `canvasSectionMedia()` (no pinta si es video).
  Carátula con fondo propio y video por sección funcionan vía los componentes compartidos.
  LIMITACIÓN menor: el canvas no pinta `<video>` de fondo POR SECCIÓN (se ve en preview/landing);
  si la sección usa video, en el canvas queda transparente (deja ver el global). Aceptable.

## Fase 5 — Uploads: límites por tipo + validación
- [x] 15. Frontend: `BackgroundControlComponent` valida tamaño por extensión antes de subir
  (img 10MB / gif 15MB / video 25MB); leyenda de error bajo el control; no sube si excede.
- [x] 16. Backend `uploads.js`: `SIZE_LIMITS_MB` por tipo (image 10/gif 15/video 25/audio 15);
  multer tope en el mayor y validación específica por tipo en el handler (borra y 413 si excede).
- [x] 17. Tooltips de ayuda en el control (formatos + dimensiones + peso recomendado por tipo).
- [x] 18. Documentado en `docs/DEPLOY.md`: `client_max_body_size 25m` en nginx del HOST + nota
  del 413 + tabla de límites por tipo.

## Fase 6 — Retrocompatibilidad y verificación
- [x] 19. Verificado: `ensureConfigDefaults` preserva theme.landingBg, hero.heroBackground y
  sectionStyle.media (probado con node).
- [x] 20. Verificado: Valeria NO tiene los campos nuevos y sigue usando `hero.backgroundGif` como
  fondo global (fallback). Landing HTTP 200. Sin regresión.
- [x] 21. Build OK + backend/frontend reconstruidos + endpoint público verificado. (Verificación
  visual en navegador/móvil la hace el usuario.)

## Notas
- Mantener la lógica de `isDesktop` consistente con el banner actual (breakpoint 768px).
- Video: `autoplay muted loop playsinline` + `preload="metadata"`.
- No romper el modo banner existente del fondo global ni de secciones.
