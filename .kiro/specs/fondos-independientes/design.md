# Diseño — Fondos independientes (global, carátula y secciones)

> Acompaña a `requirements.md`. Define el modelo, el render y la estrategia de homologación.

## Estado actual (resumen del análisis)

- Fondo global fijo: capas `position: fixed` en `landing.component.ts` (`.landing-bg-solid` z0,
  `.landing-bg-texture` z1, `.landing-bg`/`.landing-bg-video` z2, `.landing-bg-overlay` z3). La
  imagen sale de `hero.backgroundGif`. Distingue imagen/gif (background-image) vs video (`<video>`)
  con `isVideoBackground()`.
- Carátula (`.hero-section` en `hero.component.ts`): transparente, sin fondo propio. Deja ver el
  fondo global.
- Secciones (`.section-block`): fondo propio vía `sectionStyle` → `getSectionBg()`. SOLO soportan
  imagen (bgType `image` + `bgImage` como `background-image`). GIF funciona por ser background-image;
  video `.mp4` NO se renderiza (no hay `<video>` por sección). Overlay por sección con `bgOverlay`.
- `SectionStyle` ya tiene: `bgType`, `bgImage`, `bgOverlay`, `bgFit` (cover/banner), `bgBannerWidth`.
- Uploads: `backend/src/routes/uploads.js` con Multer `fileSize: 50MB` global (un solo límite).
  `sanitize.js` ya permite estilos del editor. nginx del contenedor: `client_max_body_size 50m`.
  nginx del HOST en prod: 1 MB por defecto (causa del 413) → hay que subirlo a ≥ 25m.

## Modelo de datos (nuevo)

### Tipo reutilizable `MediaBackground`
Un sub-objeto único que representa un fondo de media con soporte imagen/gif/video + override
desktop + ajuste. Se usará en global, carátula y secciones para homologar (R2).

```ts
export interface MediaBackground {
  /** URL de la media base (imagen/gif/video). Aplica a mobile y desktop. */
  url?: string;
  /** Si true, usa `urlDesktop` en escritorio en lugar de `url`. */
  desktopOverride?: boolean;
  /** URL alterna solo para escritorio (cuando desktopOverride = true). */
  urlDesktop?: string;
  /** Encuadre. 'cover' (llena) | 'contain' (completa) | 'banner' (columna centrada, solo desktop). */
  fit?: 'cover' | 'contain' | 'banner';
  /** Ancho de la columna banner en % (solo desktop, cuando fit='banner'). */
  bannerWidth?: number;
  /** Posición del encuadre (p. ej. 'center center', 'top center'). */
  position?: string;
  /** Oscurecer (0-100), capa negra sobre la media para legibilidad. */
  overlay?: number;
}
```
> `isVideo(url)` se decide por extensión (mp4/webm/ogg), igual que hoy.

### ThemeConfig (fondo GLOBAL de la landing)
Añadir imagen propia del fondo global, separada de `hero.backgroundGif`:
```ts
// theme
landingBg?: MediaBackground;   // NUEVO: media del fondo global fijo (ambientación)
```
Los campos existentes `landingBgColor1/2/Type/...` (color/gradiente/textura) se conservan: son la
base de la capa `.landing-bg-solid`/`.landing-bg-texture` sobre la que puede ir (o no) la imagen.

### HeroConfig (fondo de la CARÁTULA)
Añadir fondo propio de la carátula que scrollea con ella:
```ts
// hero
heroBackground?: MediaBackground;  // NUEVO: fondo propio de la carátula (scrollea)
```
`backgroundGif` se CONSERVA para retrocompatibilidad (ver migración).

### SectionStyle (fondo de SECCIONES)
Homologar al mismo modelo. Opción elegida: añadir un `MediaBackground` opcional y migrar la
lógica, manteniendo los campos actuales como fallback:
```ts
// sectionStyle
media?: MediaBackground;  // NUEVO: homologa imagen/gif/video + override desktop
// (bgImage/bgFit/bgBannerWidth/bgOverlay actuales quedan como fallback retrocompatible)
```

## Resolución de la media efectiva (lógica compartida)

Un helper puro reutilizable (p. ej. `core/utils/media-background.util.ts`):
```
resolveMedia(mb: MediaBackground, isDesktop: boolean): { url, isVideo, fit, position, overlay, bannerWidth }
```
- Elige `urlDesktop` si `desktopOverride && isDesktop && urlDesktop`, si no `url`.
- `isVideo` por extensión.
- Devuelve el resto de props para que el render arme CSS/`<video>`.
Se usa en landing (global), hero (carátula) y en el render de secciones, para comportamiento
idéntico. `isDesktop` se evalúa por media query / ancho (igual que el banner hoy, breakpoint 768).

## Render

### Fondo global (fijo) — `landing.component.ts`
- La capa `.landing-bg` / `.landing-bg-video` pasa a alimentarse de `theme.landingBg` (via
  `resolveMedia`). Mantiene `position: fixed` y las capas de color/textura debajo.
- **Retrocompat:** si `theme.landingBg?.url` está vacío pero existe `hero.backgroundGif`, usar
  `hero.backgroundGif` como fondo global (comportamiento actual). Así nada se rompe.
- Mantener el fix de `svh` (Tema 1) ya aplicado.

### Fondo de carátula (scrollea) — `hero.component.ts`
- `.hero-section` (hoy transparente) renderiza una capa de fondo propia DENTRO de la sección:
  una capa absolute `inset:0; z-index:0` con la media (imagen/gif como background-image, o
  `<video>` para video), y el contenido del hero por encima (`z-index:1`).
- Scrollea con la carátula (es parte del flujo, no fixed).
- **Retrocompat:** si `hero.heroBackground?.url` está vacío, la carátula NO pinta fondo propio y
  deja ver el fondo global (comportamiento actual). Opcional: permitir "heredar la del global".

### Fondo de secciones — `landing.component.ts` + componentes de sección
- Extender el render para soportar **video** por sección (hoy solo imagen). Donde hoy se pinta el
  `background-image` + `.section-bg-overlay`, añadir una capa `<video>` cuando la media es video.
- Usar `resolveMedia(sectionStyle.media ?? fallback)`; el fallback arma un `MediaBackground` desde
  los campos actuales (`bgImage`/`bgFit`/`bgBannerWidth`/`bgOverlay`) para no romper lo existente.

### Canvas del builder (`builder.component.ts`)
- Replicar la misma resolución en `getSectionBgStyle` y en el fondo del canvas, para que el canvas
  se vea igual que la landing (ya se hizo un primer paso con banner/overlay; extender a video +
  override desktop + carátula con fondo propio).

## Builder / props-panel (homologación de controles)

Crear un bloque de control de fondo reutilizable (sub-componente Angular, p. ej.
`BackgroundControlComponent`) que renderice:
- Selector de tipo de fondo (hereda / color / gradiente / imagen-media).
- Upload de media (imagen/gif/video) con tooltip de formatos/dimensiones/peso por tipo.
- Toggle "Imagen distinta para escritorio" + upload alterno (solo si el toggle está activo).
- Ajuste: fit (cover/contain/banner), position, bannerWidth (si banner), overlay (oscurecer).

Se usa en:
- **Tema Global → Fondo de la Landing** (alimenta `theme.landingBg`).
- **Carátula → Fondo** (alimenta `hero.heroBackground`). Nuevo acordeón en la sección Carátula.
- **Cada sección → Fondo de Sección** (alimenta `sectionStyle.media`). Reemplaza/能envuelve los
  controles actuales de imagen.

## Uploads: límites por tipo + validación (R4)

- **Frontend:** antes de subir, validar tamaño según extensión:
  - imagen (jpg/jpeg/png/webp): 10 MB
  - gif: 15 MB
  - video (mp4/webm): 25 MB
  Si excede → leyenda de error bajo el control, no sube.
- **Backend (`uploads.js`):** reemplazar el `fileSize: 50MB` único por validación por tipo
  (en `fileFilter` o tras recibir, según mimetype/extensión) con los mismos topes. Devolver error
  claro si excede.
- **Infra (doc):** `client_max_body_size 25m` en nginx del HOST en prod + en el nginx del
  contenedor (ya está en 50m, bajar a 25m o dejar en 50m; alinear). Documentar en `docs/MIGRATIONS.md`
  o `docs/DEPLOY.md`.
- **Tooltips:** por tipo, con dimensiones recomendadas (p. ej. fondos verticales ~1080×1920,
  horizontales ~1920×1080) y peso recomendado (imagen 300KB–2MB, gif <5MB, video <10MB).

## Retrocompatibilidad / migración (R5)

- Todos los campos nuevos (`theme.landingBg`, `hero.heroBackground`, `sectionStyle.media`) son
  OPCIONALES. Config viejo sin ellos funciona igual.
- Orden de resolución del fondo global: `theme.landingBg?.url` → si vacío, `hero.backgroundGif`.
- `ensureConfigDefaults` ya preserva campos extra por spread raíz (verificado en sesión 2026-10-08);
  confirmar que no recorta los nuevos sub-objetos.
- No se migran datos existentes de forma destructiva. Si en algún momento se quiere "promover"
  `hero.backgroundGif` a `theme.landingBg`, sería un paso opcional y no urgente.

## Riesgos / consideraciones

- **Rendimiento con video:** videos por sección + global pueden ser pesados. Mitiga: límites por
  tipo, `preload="metadata"`, autoplay muted, y recomendación fuerte en tooltips.
- **Canvas vs landing:** histórico de divergencias; mantener la lógica de resolución en un helper
  compartido para que ambos usen lo mismo.
- **iOS Safari:** video autoplay requiere `muted` + `playsinline` (ya se usa en el global).
- **Mobile banner:** `fit='banner'` es solo desktop; en mobile cae a cover (ya definido).
