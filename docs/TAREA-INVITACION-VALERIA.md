# Tarea pendiente — Crear "Invitación Valeria" (tema Totoro / bosque Ghibli)

> **Estado:** EN PAUSA. Se retoma. Investigación completa; falta ejecutar.
> **Fecha de registro:** 2026-10-07

## Objetivo

Crear una invitación/evento NUEVO llamado **"Invitación Valeria"** (XV años, estética
Studio Ghibli / Totoro / bosque mágico) y configurar su landing para que se vea como las
7 imágenes de ejemplo que el usuario proporcionó.

Requisitos clave:
- **Mobile-first**: diseño pensado para vertical.
- **Desktop = banner**: al abrir en escritorio debe verse como banner (columna vertical
  centrada) y verse bien, sin deformar las imágenes verticales.
- **NO modificar ninguna invitación/evento existente** en la BD. Solo se crea uno nuevo.

## BLOQUEADOR actual (lo primero a resolver mañana)

Las 7 imágenes se adjuntaron en el chat, pero el agente NO puede leerlas como archivo en disco
para subirlas (solo las ve en el prompt). No hay herramienta chat-imagen → archivo.

**DECISIÓN (Opción A):** el usuario deja las 7 imágenes SIN TEXTO en una carpeta FUERA del
repo para no ensuciar el proyecto ni git. Ruta acordada:

```
C:\temp\valeria\
```

Nombres de archivo acordados (las 7 sin texto, pueden ser .png/.jpg/.webp):
- `1-intro-noche.png`  → fondo nocturno: Totoro, luna, farol, kodamas (río)
- `2-caratula.png`     → marco bosque con Totoro grande + niños en el tronco
- `3-detalles.png`     → fondo verde claro con wisteria y Totoros (padres/padrinos)
- `4-ceremonia.png`    → marco bosque, Totoro con sombrilla azul, kodamas, río
- `5-recepcion.png`    → arco dorado + letrero japonés + Totoro + hongos morados
- `6-rsvp.png`         → arco con sombrilla morada, Totoro azul y gris (confirmación)
- `7-vestimenta.png`   → marco con parada de autobús + Totoros abajo

Destino final (NO el proyecto): las imágenes se trepan vía `POST /api/uploads/images` a
`backend/uploads/images/` (volumen Docker `invitaciones_backend_uploads`, ya en .gitignore).
La carpeta `C:\temp\valeria\` es solo el origen de lectura; no se copia al repo.

(También faltan las ubicaciones reales de los lugares: el usuario las pasará después. Por ahora
usar los links de Maps de las imágenes 4 y 5.)

## Mapeo imágenes CON texto → secciones de la landing

| # | Imagen con texto | Sección | Fondo (imagen sin texto) |
|---|---|---|---|
| 1 | Noche + luna + "Quizá la magia siempre estuvo ahí…, escondida entre los árboles, esperando este momento." | **Intro** | 1-intro-noche |
| 2 | "MIS XV / Valeria Alejandra / «como una tarde en el bosque, llena de magia, sueños y sonrisas…… así comienza mi gran día» / 14 ~ Noviembre ~ 2026" | **Carátula** (envelope template `plain`) | 2-caratula |
| 3 | "Con el amor de las personas que hicieron posible esta noche" / **Mis Padres**: Rogelio Alejandro Zapata Alvarado & Karla Iran Azacoya Lopez / **Mis Padrinos**: Martha Lopez Ramirez ~ Eddie Gualberto Zapata Alvarado & Rosa Margarita Poot Gonzalez | **Detalles** (cards padres/padrinos) | 3-detalles |
| 4 | "Ceremonia religiosa" / Parroquia - El Buen Pastor / 8:30 PM / Como llegar / https://share.google/VJWj66kfeetEXNxEn | **Venues** (lugar 1) | 4-ceremonia |
| 5 | "Recepcion" / Casa F & F Banquetes / Dirección Calle 50 #578 x 61 y 65 Colonia Reparto Granjas 97198 Mérida, Mexico / https://share.google/IiCAdk1fhhnsG19d4 / Inicio de recepción 9:30 pm / Entrada de Quinceañera 10:00 pm | **Venues** (lugar 2) + posiblemente **Itinerario** | 5-recepcion |
| 6 | "«Bajo la sombra de los árboles y junto a la magia del bosque, quiero celebrar contigo mis XV»" / Pases disponibles / Fecha máxima para confirmar: 15 de Octubre 2026 | **RSVP / Confirmación** | 6-rsvp |
| 7 | "Codigo de vestimenta" / Formal Elegante / "Los colores Azules y Grises son exclusivamente para la quinceañera" | **Dresscode** | 7-vestimenta |

> Nota: las ubicaciones/direcciones finales de los lugares las enviará el usuario. Por ahora
> usar los links de Google Maps tal cual aparecen en las imágenes 4 y 5.

## Plan de ejecución (ya investigado — listo para correr)

1. **Login**: `POST /api/auth/login` con `root` / `admin123` (usuario seed). Guardar el token
   JWT → usar como `Authorization: Bearer <token>`.
2. **Crear evento**: `POST /api/events` (requiere rol root/admin) con body:
   `{ name: "Invitación Valeria", event_type: "XV Años", event_date: "2026-11-14 20:00:00", slug: "invitacion-valeria", event_mode: "private" }`.
   Guardar el `id` devuelto. Esto crea el evento + un `event_config` por defecto (NO afecta otros eventos).
3. **Subir imágenes**: por cada archivo, `POST /api/uploads/images` (multipart, campo `file`,
   header auth). Devuelve `{ url: "/uploads/images/....", filename }`. Recolectar las 7 URLs.
4. **Construir `config_json`** (interfaz `EventConfig` en `frontend/src/app/core/models/models.ts`):
   - `envelope`: template `plain`, `splashImage` = fondo 2-caratula, `splashBgFit: 'banner'`,
     `splashBgBannerWidth: ~42`, `plainTitle: "Mis XV"`, `plainSubtitle: "Valeria Alejandra"`,
     `plainContent: "como una tarde en el bosque…"`, instrucción. (Alternativa: usar `hero`.)
   - `intro`: `enabled: true`, `background` = fondo 1-intro-noche, `phrase` = frase de la magia,
     partículas tipo fireflies/sparkles tenues.
   - `hero`: nombres/countdown al 14-nov-2026 (o integrarlo en la carátula plain).
   - `invitation`: título + colores propios de chips/contador (acordeón "Invitados y Asistentes").
   - `details`: `enabled: true`, cards para "Mis Padres" y "Mis Padrinos"; `sectionStyle.bgType='image'`,
     `bgImage` = 3-detalles, `bgFit: 'banner'`, `bgBannerWidth: ~42`, `bgOverlay` bajo (~15-25).
   - `venues`: 2 items (Ceremonia, Recepción) con `mapsUrl` = links; `sectionStyle` con fondo
     4-ceremonia / 5-recepcion en banner. (Puede requerir dividir en 2 secciones o 2 cards.)
   - `dresscode`: `enabled: true`, card con "Formal Elegante" + nota de colores; fondo 7-vestimenta banner.
   - `rsvp`: `enabled: true`, título + fecha máxima confirmar; fondo 6-rsvp banner.
   - `theme`: paleta bosque Ghibli (verdes suaves, dorado #c9a24a aprox, texto gris oscuro
     #4a4a3f), `landingBgFit: 'banner'`, `landingBgBannerWidth: ~42`. Fuentes script para títulos.
   - `globalStyles`: títulos en fuente script (allura/alexbrush/dancing), contenido serif/sans.
5. **Guardar config**: `PUT /api/config/:id` con body `{ config_json: {...} }`
   (pasa por `sanitizeConfigJson`; limpia uploads huérfanos — cuidado al reemplazar).
6. (Opcional) Itinerario como tabla: `POST /api/config/:id/itinerary` (recepción 9:30 / entrada 10:00).
7. **Verificar**: `GET /api/public/invitation/invitacion-valeria` (público, sin token) y abrir
   `http://localhost/invitacion/invitacion-valeria` en el navegador (mobile + desktop).

## Notas técnicas importantes (de la investigación)

- **Tablas**: evento en `events`, diseño en `event_config` (1:1, config_json LONGTEXT).
  Itinerario y fotos de galería viven en tablas aparte (`itinerary`, `photos`), NO en config_json.
- **El modo banner por sección** (`sectionStyle.bgFit='banner'` + `bgBannerWidth`) se aplica en
  desktop ≥768px como columna vertical centrada; en móvil cae a `cover`. Esto es exactamente lo
  que pide el usuario para desktop. Render en `landing.component.ts > getSectionBg()` + CSS
  `.section-block` con `--sec-bg-image` / `--sec-banner-w` (media query 768px).
- **Fondo de imagen SOLO por sección** (`SectionStyle.bgImage`). El `theme` global solo soporta
  color/gradiente/textura, no imagen. El fondo "global" tipo imagen se logra poniendo bgImage
  por sección.
- **`bgOverlay`** (0-100, se divide /100) oscurece la imagen de fondo para legibilidad del texto.
  Como las imágenes de ejemplo ya tienen zona clara central para el texto, usar overlay bajo.
- **`ensureConfigDefaults`** (backend) solo corre al LEER el landing público; rellena defaults,
  así que se puede enviar config parcial. Al guardar se persiste tal cual (tras sanitizar).
- **Credenciales seed**: `root` / `admin123` (definidas en `database.js initDB`).
- **Uploads**: carpeta `backend/uploads/images`, servidas en `/uploads/...`. Límite 50MB,
  recomprime jpg/png/webp con sharp (preserva transparencia PNG/WebP).
- **Posicionamiento asistido** (feature de `canvas-posicionamiento`): si hace falta reubicar
  textos de carátula/intro para que calcen con el espacio libre de cada imagen, se puede usar
  `envelope.plainPositions` / `intro.positions` / `hero.positions` (coords en % por dispositivo
  mobile/desktop). Útil porque cada imagen tiene su "hueco" de texto en distinta posición.

## Decisiones ya acordadas con el usuario
- Banner angosto en desktop (~40-45% de ancho). ✅
- Paleta bosque Ghibli. ✅
- Links de Maps: usar los de las imágenes por ahora; ubicaciones finales las pasa el usuario después.
