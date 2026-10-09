# Requerimientos — Fondos independientes (global, carátula y secciones)

> Spec creado el 2026-10-09. Rama de trabajo: `feature/canvas-posicionamiento` (o la que se
> indique). Objetivo: separar el fondo global de la landing del fondo de la carátula, homologar
> el manejo de fondos (imagen/gif/video) en todas las secciones, y dar un modelo híbrido
> mobile/desktop versátil pero simple.

## Contexto / problema

Hoy el fondo de la landing funciona así (ver análisis en `DEVELOPMENT_LOG.md`):
- La imagen del **fondo global fijo** sale de `hero.backgroundGif` — es la MISMA imagen que se ve
  detrás de la **carátula**. No son independientes.
- La **carátula** (`.hero-section`) NO tiene fondo propio: es transparente y deja ver el fondo
  global fijo.
- Las **secciones** (invitation, details, etc.) SÍ tienen fondo propio (`sectionStyle.bgImage`)
  que scrollea con el contenido.
- El fondo global es `position: fixed` (se queda estático al scrollear).

Problemas que esto causa:
1. Como la carátula comparte el fondo global fijo, al scrollear hacia la siguiente sección (que
   tiene su propia imagen) se ve raro: el fondo global queda fijo detrás y la imagen de la
   sección se superpone.
2. No se puede lograr el efecto de "cada sección (incl. carátula) con su propia imagen que
   scrollea" + "una ambientación global fija y sutil".
3. El manejo de fondos no está homologado: global, carátula y sección usan mecanismos/etiquetas
   distintas. GIF/video no están soportados de forma uniforme.
4. Ajustar una sola imagen para que se vea bien en mobile Y desktop es difícil (proporciones
   opuestas: mobile vertical, desktop horizontal).

## Decisiones de diseño ya acordadas con el usuario

- **Fondos independientes:** la ÚNICA capa fija será el **fondo global de la landing**
  (ambientación). La **carátula** y **cada sección** tendrán su propia imagen que **scrollea**
  con su contenido (la carátula pasa a comportarse "como una sección más" en cuanto a fondo).
- **Modelo híbrido mobile/desktop (opción 2):**
  - Una **imagen base** que aplica a mobile Y desktop.
  - Un **toggle "Imagen distinta para escritorio"**: al activarlo se sube una imagen/gif/video
    alterna SOLO para desktop; mobile sigue con la base. Si no se activa, desktop usa la base.
  - Caso soportado: un cliente puede configurar una sola imagen fuerte fija para toda la landing
    sin override, o afinar desktop solo cuando la base no cuadra.
- **Todos los fondos aceptan imagen, GIF y video**, con los mismos controles y las mismas
  etiquetas (homologación). Pensado para elementos dinámicos.
- **Tooltips** en cada upload con formatos permitidos + dimensiones y peso recomendados.
- **Límites de tamaño por tipo de archivo** (decididos con el usuario):
  - Imagen (jpg/png/webp): **10 MB** (recomendado 300 KB – 2 MB).
  - GIF: **15 MB** (recomendado < 5 MB).
  - Video (mp4/webm): **25 MB** (recomendado < 10 MB, corto y en loop).
  - Hay que alinear estos límites en: Multer (backend), nginx del contenedor y nginx del HOST en
    prod (`client_max_body_size` ≥ 25m).
- **Retrocompatibilidad obligatoria:** invitaciones existentes (p. ej. Valeria, lo que está en
  prod) usan `hero.backgroundGif` como fondo global. No se deben romper.

## Requerimientos

### R1 — Separar fondo global de fondo de carátula
**Historia:** Como usuario, quiero que el fondo global de la landing y el fondo de la carátula
sean independientes, para poder combinar estilos (carátula con imagen propia + landing con
textura, o viceversa, o mezclas).

**Criterios de aceptación:**
1. CUANDO configuro una imagen de fondo para la carátula ENTONCES esa imagen se renderiza dentro
   de la sección carátula y **scrollea** con ella (no queda fija).
2. CUANDO configuro un fondo global de la landing ENTONCES esa capa queda **fija** detrás de todo
   el contenido mientras scrolleo.
3. CUANDO la carátula NO tiene fondo propio ENTONCES hereda/deja ver el fondo global (como hoy).
4. CUANDO una invitación existente solo tiene `hero.backgroundGif` ENTONCES sigue viéndose igual
   que antes (ese valor actúa como fondo global; la carátula lo deja ver). Sin regresión.

### R2 — Homologar el manejo de fondos (imagen/gif/video) en todas las secciones
**Historia:** Como usuario, quiero configurar el fondo de cualquier sección (global, carátula,
secciones de contenido) con los mismos controles y pudiendo usar imagen, GIF o video.

**Criterios de aceptación:**
1. CUANDO abro el control de "Fondo" de cualquier sección ENTONCES veo las mismas opciones y
   etiquetas (tipo de fondo, subir media, ajuste, override desktop).
2. CUANDO subo un GIF o un video a cualquier fondo ENTONCES se renderiza correctamente (video con
   autoplay/loop/muted/playsinline; gif como imagen animada).
3. CUANDO paso el cursor/toco el ícono de ayuda del upload ENTONCES veo un tooltip con formatos
   permitidos, dimensiones recomendadas y peso máximo/recomendado por tipo.

### R3 — Modelo híbrido mobile/desktop
**Historia:** Como usuario, quiero una imagen base para ambos dispositivos y poder, opcionalmente,
especificar una imagen distinta para escritorio, sin tener que duplicar toda la configuración.

**Criterios de aceptación:**
1. CUANDO configuro la imagen base de un fondo ENTONCES aplica a mobile y desktop por defecto.
2. CUANDO activo el toggle "Imagen distinta para escritorio" y subo una media ENTONCES en
   escritorio se usa esa media y en móvil se mantiene la base.
3. CUANDO el toggle está desactivado ENTONCES escritorio usa la base (sin duplicar config).
4. El ajuste de encuadre (fit cover/contain, position, modo banner en desktop) es consistente
   entre global, carátula y secciones.

### R4 — Límites de subida por tipo + validación
**Historia:** Como usuario, quiero que la plataforma me avise si un archivo excede el límite antes
de intentar subirlo, con un mensaje claro.

**Criterios de aceptación:**
1. CUANDO selecciono un archivo que excede el límite de su tipo (imagen 10MB / gif 15MB / video
   25MB) ENTONCES el frontend muestra una leyenda de error bajo el control y NO intenta subirlo.
2. CUANDO el archivo está dentro del límite ENTONCES se sube normalmente.
3. El backend (Multer) aplica los mismos límites por tipo como salvaguarda.
4. Documentar que el nginx del HOST en prod debe tener `client_max_body_size` ≥ 25m.

### R5 — Retrocompatibilidad y migración
**Historia:** Como dueño del producto, quiero que ninguna invitación existente se rompa al
introducir los nuevos campos de fondo.

**Criterios de aceptación:**
1. CUANDO el config no tiene los campos nuevos ENTONCES la landing usa `hero.backgroundGif` como
   fondo global y la carátula lo hereda (comportamiento actual).
2. `ensureConfigDefaults` preserva los nuevos campos (ya se homologó con spread raíz; verificar).
3. No se requiere migración destructiva de datos; los campos nuevos son opcionales y aditivos.

## Fuera de alcance (por ahora)
- Config totalmente separada mobile/desktop para TODOS los ajustes (solo el override de imagen).
- Recorte/edición de imagen en el builder.
- CDN / conversión automática a WebP (anotado en Performance, aparte).
