# 🧭 Persistencia de contexto entre sesiones — Vitely

> Este archivo se carga automáticamente en TODAS las sesiones. Su objetivo es que
> ninguna sesión nueva empiece "en blanco" aunque la anterior se haya cortado o
> perdido el contexto.

## Regla #1 — Al INICIAR cualquier sesión de desarrollo

Antes de responder a la primera petición de trabajo, el agente debe leer, en este orden,
para reconstruir el estado del proyecto:

1. `DEVELOPMENT_LOG.md` — el bloque **"Estado actual del proyecto"** (lo más reciente arriba).
   Dice la rama activa, la feature en curso y qué quedó pendiente.
2. `docs/PENDING.md` — pendientes vivos (ítems `[ ]`) y bitácora de completados.
3. Cualquier archivo `docs/TAREA-*.md` que exista — son tareas puntuales en pausa con todo
   el contexto ya investigado listo para retomar.
4. Ejecutar `git branch --show-current` y `git status --short` para confirmar la rama real y
   si hay trabajo sin commitear (señal de una sesión que se cortó a medias).

Luego, resumir brevemente al usuario "dónde nos quedamos" ANTES de hacer cambios, y confirmar
con él si ese estado coincide con lo que recuerda.

## Regla #2 — Durante la sesión

- Si una tarea se va a dejar en pausa, registrar su estado en `docs/TAREA-<nombre>.md`
  (bloqueadores, decisiones acordadas, plan de ejecución ya investigado, rutas y comandos).
- No depender de "recordar" entre mensajes: lo importante va al disco (docs o steering).

## Regla #3 — Al CERRAR / terminar un bloque de trabajo

Antes de dar por terminada una tanda de cambios, actualizar la documentación para la próxima
sesión:
- `DEVELOPMENT_LOG.md`: nueva entrada "Estado actual" con fecha, rama, qué se hizo y qué queda.
- `docs/PENDING.md`: marcar `[x]` lo completado y añadir `[ ]` lo nuevo pendiente.
- Si era una `docs/TAREA-*.md`, actualizar su estado (o marcarla como terminada).

## Cómo pedirle al agente que retome (frase sugerida para el usuario)

> **"Retoma el contexto de la sesión anterior"** o **"¿En qué nos quedamos?"**

Con eso el agente ejecuta la Regla #1 y te dice el estado antes de tocar nada. Si quieres algo
más específico, puedes decir **"Retoma la tarea de la Invitación Valeria"** o
**"Continúa con el spec canvas-posicionamiento"**.

---

## 📍 Estado conocido al crear este steering (2026-10-08)

> Esto es una foto del momento. La fuente de verdad siempre es `DEVELOPMENT_LOG.md` +
> `docs/PENDING.md` + git. Si algo aquí contradice esos archivos, mandan ellos.

- **Rama activa:** `feature/fondos-independientes` (desde 2026-10-09).
- **Estructura de ramas (2026-10-09):**
  - `feature/canvas-posicionamiento` — tenía todo el trabajo acumulado hasta el commit `cce56be`.
  - `int-008` — CORTE de integración con todo lo último (desde `cce56be`). Reemplaza
    funcionalmente a la vieja `int-007` (que quedó muy desactualizada). Es el snapshot del estado
    actual del proyecto. El proyecto está publicado pero aún NO expuesto como producto.
  - `feature/fondos-independientes` — RAMA DE TRABAJO ACTUAL para el spec del mismo nombre.
    Nace de `cce56be`. Aquí se implementa el Tema 2 (fondos independientes).
- **Último commit base de las 3 ramas:** `cce56be` (spec fondos-independientes + steering).
- **Trabajo de la sesión 2026-10-08:** editor enriquecido + drag + línea de carga en la Intro;
  color de instrucción en el Plano; fix CRÍTICO de `ensureConfigDefaults` (hero y todas las
  secciones perdían campos en la landing pública → posiciones/colores de carátula ahora sí se
  ven); velo oscuro global eliminado; countdown en px fijo; `--canvas-vh` robusto; fondo de
  sección banner mobile = cover + min-height de pantalla. Todo ya commiteado.

- **Trabajo de la sesión 2026-10-09 (EN CURSO, revisar antes de seguir):**
  - **Tema 1 (fix salto de fondo en móvil) — HECHO, sin commitear aún:** cambiado `dvh`→`svh` en
    las capas de fondo global (`.landing-bg`, `.landing-bg-video`, `.landing-bg-overlay`,
    `.landing-bg-solid`, `.landing-bg-texture`) en `landing.component.ts`, y `.hero-section`
    homologada a `min-height:100svh` en `hero.component.ts`. Causa: `dvh` recalcula al
    mostrar/ocultar la barra del navegador en Chrome Android → saltaba el fondo fixed. Build OK.
    FALTA: reconstruir frontend + verificar en móvil real + commitear.
  - **Tema 2 (fondos independientes) — SPEC CREADO en `.kiro/specs/fondos-independientes/`
    (requirements.md, design.md, tasks.md). Implementación NO empezada.** Resumen de lo acordado:
    - Fondo GLOBAL de la landing = única capa FIJA (ambientación). Carátula y secciones tendrán
      su propia media que SCROLLEA con su contenido (la carátula pasa a tener fondo propio).
    - Modelo HÍBRIDO mobile/desktop (opción 2): imagen BASE para ambos + toggle "Imagen distinta
      para escritorio" (override solo desktop; mobile usa base). No duplicar toda la config.
    - Homologar TODOS los fondos (global, carátula, sección) con mismos controles y soporte
      imagen/GIF/VIDEO (hoy las secciones solo soportan imagen; el global sí distingue video).
    - Límites de subida POR TIPO: imagen 10MB, gif 15MB, video 25MB (recomendado mucho menos).
      Alinear Multer + nginx del contenedor + nginx del HOST prod (`client_max_body_size 25m`).
    - Validación en frontend antes de subir + tooltips con formatos/dimensiones/peso.
    - Retrocompatible: campos nuevos opcionales; si no hay `theme.landingBg`, usar
      `hero.backgroundGif` como global (como hoy). No romper Valeria ni prod.
    - Plan en `tasks.md`: Fase 0 (Tema1 ✅) → Fase 1 modelo ✅ → Fase 2 helper resolveMedia →
      Fase 3 render (global/carátula/secciones) → Fase 4 builder (BackgroundControlComponent
      reutilizable) → Fase 5 uploads límites+validación → Fase 6 retrocompat+verificación.
    - **Fase 1 HECHA (2026-10-09):** en `models.ts` se añadió `MediaBackground` + `theme.landingBg`
      + `hero.heroBackground` + `sectionStyle.media` (todos opcionales/retrocompatibles). Build OK.
    - **Fase 2 HECHA (2026-10-09):** `core/utils/media-background.util.ts` con `resolveMedia`,
      `isVideoUrl`, `sectionStyleToMedia` (fallback legacy) y `resolveGlobalBackground` (fallback a
      hero.backgroundGif). Build OK.
    - **Fase 3 HECHA (2026-10-09):** render de la landing. Fondo global usa `theme.landingBg` con
      fallback a `backgroundGif` (fijo). Carátula tiene fondo propio (`.hero-bg-media`) que
      SCROLLEA. Las 8 secciones soportan video (`.section-bg-video`). Todo vía `resolveMedia`.
    - **Fase 4 HECHA (2026-10-09):** `BackgroundControlComponent`
      (`builder/components/background-control/`) con upload img/gif/video + validación tamaño por
      tipo (10/15/25) + tooltip + toggle override desktop + ajuste. Integrado en Tema Global,
      Carátula y Fondo de Sección. Canvas: `canvasGlobalBg()`/`canvasSectionMedia()`.
      LIMITACIÓN: canvas no pinta video de fondo por sección (sí en preview/landing).
    - **Fase 5 HECHA (2026-10-09):** backend `uploads.js` con límites por tipo (SIZE_LIMITS_MB:
      image 10/gif 15/video 25/audio 15), valida y devuelve 413 si excede. Frontend ya validaba.
      `docs/DEPLOY.md` actualizado: nginx host `client_max_body_size 25m` + tabla de límites.
    - **Fase 6 HECHA (2026-10-09):** verificado que ensureConfigDefaults preserva los nuevos
      campos y que Valeria no tiene regresión (usa backgroundGif como fondo global fallback).
      Contenedores reconstruidos, landing HTTP 200.
    - **SPEC fondos-independientes COMPLETO (todas las fases 0-6).** Pendiente: verificación visual
      del usuario en navegador/móvil + ajustar `client_max_body_size 25m` en el nginx del server
      prod cuando se despliegue.

### Features en curso / pendientes concretos

1. **Spec `canvas-posicionamiento`**: drag en Plano/Intro/Carátula ✅, reset de tamaño ✅.
   - ⏳ **Único pendiente:** botón **"Restablecer posiciones"** en el props-panel (tareas 18-19
     del spec). Baja prioridad.

2. **Tarea `docs/TAREA-INVITACION-VALERIA.md`** — invitación Totoro/Ghibli (evento `id=17`).
   - ✅ Creada y configurada; se está revisando sección por sección con el usuario (ver abajo).
   - ⏳ **Pendiente de esa tarea:**
     - Ubicaciones/direcciones reales de los lugares (ahora links de Maps de las imágenes).
     - Decidir y colocar la **Recepción** (imagen 5, Casa F&F Banquetes, 9:30/10:00 pm):
       ¿segundo venue o itinerario?
     - Seguir la revisión visual sección por sección.

3. **Pendientes abiertos (ver `docs/PENDING.md` para el detalle completo):**
   - ⏳ Flechas del scroll-indicator de la carátula: usuario las vio descentradas; sin causa clara
     en CSS. Reconfirmar en navegador.
   - ⏳ Modo banner en DESKTOP: afinar anchos laterales uniformes por sección (esta sesión se
     enfocó en mobile).
   - ⏳ **Título de sección se desborda en landing mobile real** (ej. "Lugares del Evento" en
     Galaxy A55 se sale por los lados; en canvas se ve bien). El `<h2>` script no se ajusta en
     pantallas angostas. Falta `word-break`/`overflow-wrap` o reducir tamaño en móvil.
   - ⏳ Subida de imágenes: bajar Multer a ~10 MB + validación en frontend con leyenda de error.
   - ✅ Toggle "Fondo" por card arreglado en Detalles/Vestimenta/Lugares (commit 53d9c8f).

4. **DEUDA TÉCNICA — sincronización de esquema BD en deploys (importante):**
   El esquema del server prod se desincroniza del local porque `initDB()` no registra todas las
   columnas/tablas nuevas. Se homologó el server el 2026-10-08 migrando estructura completa +
   datos de admin/Karla/Valeria (root OMITIDO). Pendiente: completar `initDB()` con los
   ALTER/CREATE faltantes para que cada deploy auto-sincronice. Ver `docs/PENDING.md`.
   - ⚠️ En prod el `root` de la plataforma NO quedó al recrear `users`; crear con INSERT (hash de
     Bonie123). `admin`/`admin123` sí quedó. Login tiene rate limit 5/15min por IP (reiniciar
     backend lo resetea).

### Estado del server prod (2026-10-08)
- Esquema homologado con el local (16 tablas recreadas). Datos: admin, KarlaAzarcoya, invitación
  Valeria (evento 17 + config). Faltan: crear usuario root, subir las 7 imágenes de Valeria a
  `/uploads/images/` con sus nombres exactos, y poner `client_max_body_size 10m` en el nginx del
  host (da 413 al subir imágenes hasta que se ajuste).

### Datos útiles del entorno

- **Credenciales reales:** `root` / `Bonie123` · `admin` / `admin123` (seed). El pass de root
  NO es admin123 (ya fue cambiado). Están en la tabla `users.plain_password`.
- **Levantar frontend:** `docker-compose up -d --build frontend` en la raíz. Si nginx del
  frontend crashea con `host not found in upstream "backend"`, es porque el backend no está
  arriba: levantar `backend` y reiniciar `frontend`.
- **El endpoint de screenshot** (`/api/events/:id/screenshot`) falla en local porque Puppeteer
  corre dentro del contenedor backend y `http://localhost` ahí es el backend, no el frontend.
  No es un bug de las invitaciones; la verificación visual la hace el usuario en el navegador.
- **Recordatorio:** el **autoguardado del builder está deshabilitado** — hay que pulsar "Guardar"
  para persistir a Preview/landing.

### Mejora de UX anotada (pendiente, no empezada)
- Botón de **"ojito"** en el login para mostrar/ocultar la contraseña.
