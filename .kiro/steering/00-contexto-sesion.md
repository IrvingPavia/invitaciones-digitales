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

- **Rama activa:** `feature/canvas-posicionamiento`
- **Último commit tras la sesión del 2026-10-08:** ver `git log` (se commiteó la tanda de
  revisión sección por sección de Valeria + fixes de fidelidad canvas↔landing).
- **Trabajo de la sesión 2026-10-08:** editor enriquecido + drag + línea de carga en la Intro;
  color de instrucción en el Plano; fix CRÍTICO de `ensureConfigDefaults` (hero y todas las
  secciones perdían campos en la landing pública → posiciones/colores de carátula ahora sí se
  ven); velo oscuro global eliminado; countdown en px fijo; `--canvas-vh` robusto; fondo de
  sección banner mobile = cover + min-height de pantalla. Todo ya commiteado.

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
