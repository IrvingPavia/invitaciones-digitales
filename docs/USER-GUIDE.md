# 📖 Guía de Usuario — Vitely

> Tutorial completo para configurar invitaciones digitales usando Vitely.
> Esta guía cubre el Dashboard, el Configurador avanzado y el Builder visual.

---

## Tabla de Contenidos

1. [Inicio de Sesión](#1-inicio-de-sesión)
2. [Dashboard Principal](#2-dashboard-principal)
3. [Crear un Evento](#3-crear-un-evento)
4. [Configurador Avanzado (Config)](#4-configurador-avanzado)
5. [Builder Visual](#5-builder-visual)
6. [Gestión de Invitados](#6-gestión-de-invitados)
7. [Tarjetas de Invitación (PDF)](#7-tarjetas-de-invitación)
8. [Compartir Invitaciones](#8-compartir-invitaciones)
9. [Tips y Atajos](#9-tips-y-atajos)

---

## 1. Inicio de Sesión

1. Abre `http://localhost` (local) o `https://invitaciones.jbdev.pro` (producción)
2. Ingresa tu usuario y contraseña
3. Si es tu primera vez como cliente, se te pedirá cambiar la contraseña

### Roles disponibles:
| Rol | Acceso |
|-----|--------|
| **Root** | Todo el sistema, gestión de usuarios |
| **Admin** | Todos los eventos, puede gestionar usuarios |
| **Client** | Solo sus eventos asignados |

---

## 2. Dashboard Principal

Al entrar verás:

- **Carrusel 3D de eventos**: Tus eventos como tarjetas interactivas. Navega con flechas, dots o arrastrando.
- **KPIs del evento activo**: Invitados confirmados, pendientes, capacidad.
- **Botones de acción**: Invitados, Configurar, Builder, Tarjetas, Ver Landing.

### Navegación del Sidebar:
- 🏠 Dashboard — Vista general con carrusel
- 📅 Eventos — Lista y crear nuevos eventos
- 👤 Usuarios — Gestionar usuarios (root/admin)
- 💡 Sugerencias — Retroalimentación de clientes

### Tablas con AG Grid (Desktop)

Los módulos de Eventos, Usuarios, Invitados y Registrados usan **AG Grid** con:
- **Paginación**: 50 registros por página (configurable: 25, 50, 100)
- **Ordenar**: Click en cualquier header de columna
- **Filtrar**: Click en el ícono de filtro en cada columna
- **Buscar**: Input de búsqueda arriba del grid (filtra todas las columnas en tiempo real)
- **Scroll horizontal**: Si la ventana es angosta, las columnas mantienen su tamaño mínimo
- **Acciones**: Botón ⋮ en la última columna abre menú contextual

### Vista Mobile (Cards)

En pantallas menores a 768px, los grids se reemplazan por **cards** optimizadas para touch:
- **Header fijo**: Título, botones y búsqueda se mantienen arriba siempre
- **Cards scrollables**: Solo las tarjetas se desplazan (sin scrollbar visible)
- **Búsqueda dinámica**: Filtra las cards en tiempo real conforme escribes
- **Botón "Acciones"**: Un solo botón centrado por card que despliega menú con todas las opciones
- **Botón "Volver"**: Aparece fijo abajo al scrollear, regresa al inicio suavemente
- **Sin scrollbar**: Estilo app nativa — scroll por touch sin barra visible

### Temas

- **Modo Oscuro** (default): Fondo negro con acentos púrpura/dorado
- **Modo Claro**: Fondo blanco con acentos púrpura. Cambia con el ícono ☀/🌙 en la topbar.
- El nombre de usuario siempre es visible en la topbar (incluso en mobile)

---

## 3. Crear un Evento

### Lista de Eventos

El módulo de Eventos muestra todos tus eventos en un grid interactivo:

**Desktop (AG Grid):**
| Columna | Descripción |
|---------|-------------|
| Nombre | Nombre + slug del evento |
| Tipo | Badge del tipo (Boda, XV Años, etc.) — centrado |
| Fecha | Formato dd/mm/yyyy — centrado |
| Invitados | Total de invitados — centrado |
| Confirm. | Confirmados — centrado |
| Estado | Activo/Inactivo (badge) — centrado |
| ⋮ | Menú de acciones |

**Mobile (Cards):**
- Cada evento como card con nombre, tipo, fecha, invitados y URL
- Botón "Acciones" para: Invitados, Configurar, Builder, Tarjetas, Ver Landing, Editar, Duplicar, Eliminar

### Crear nuevo evento

1. Click en **"+ Nuevo Evento"**
2. Completa:
   - **Nombre** del evento (ej: "Boda de Ana y Carlos")
   - **Slug** (URL amigable, ej: `boda-ana-carlos`)
   - **Tipo** (Boda, XV Años, Cumpleaños, Bautizo, Graduación, Empresarial, Conferencia)
   - **Fecha y hora**
   - **Modo**: Privado (con lista de invitados) o Abierto (registro público con cupo)
   - **Template**: Elegante, Moderno, Romántico, Festivo, Corporativo
4. Click en **Crear**

> 💡 El template aplica colores y fuentes predefinidas. Puedes personalizar todo después.

---

## 4. Configurador Avanzado

Accede desde el Dashboard → botón **"Configurar"** en el evento activo.

### Layout del Configurador

```
┌─────────────────────────────────────────────────────┐
│  ← Volver    Configuración              ☰  💾 Guardar │
├──────────┬──────────────────────────────────────────┤
│ SIDEBAR  │                                          │
│          │       CONTENIDO DE LA SECCIÓN            │
│ Apariencia│       (controles y opciones)            │
│ Inicio   │                                          │
│ Secciones│                                          │
│ Preview  │                                          │
└──────────┴──────────────────────────────────────────┘
```

### 4.1 Categorías del Sidebar

#### 🎨 Apariencia
- **Tema y Colores**: Colores principales de la landing (texto, botones, cards, fondo)
- **Estilos Globales**: Fuentes, tamaños, separadores, animación de scroll

#### 🚪 Pantalla de Inicio
- **Pantalla de Inicio**: Template (Sobre, Ticket, Splash, Plano), colores, textos
- **Intro**: Frase animada, fondo de video/imagen, partículas, duración
- **Carátula (Hero)**: Nombres, frase, countdown, fondo, audio

#### 📄 Secciones
- **Invitación**: Título y subtítulo del mensaje
- **Detalles**: Cards con información del evento
- **Lugares**: Ubicaciones con dirección y mapa
- **Itinerario**: Timeline de actividades
- **Galería**: Fotos con 8 estilos de visualización
- **Vestimenta**: Cards con ejemplos de dress code
- **Regalos**: Mesa de regalos + transferencia bancaria
- **Confirmación (RSVP)**: Formulario de asistencia

#### 📱 Vista Previa
- **Preview**: Mockup de celular con la landing real embebida

### 4.2 Estilos por Sección

Cada sección tiene un panel **"✨ Estilo de sección"** que permite:

1. **Fondo personalizado**: Color sólido, degradado, o imagen con overlay
2. **Transición entre secciones**: 7 formas orgánicas (onda, curva, diagonal, zigzag, montañas, gotas, flecha)
3. **Borde de transición**: Línea visible con color, grosor y opacidad
4. **Colores de texto**: Override de títulos y contenido por sección
5. **Fuentes**: Override de fuente para títulos y contenido
6. **Animación de entrada**: Override individual (fade-up, fade-in, slide, scale)
7. **Adornos de título**: 7 tipos SVG decorativos
8. **Presets rápidos**: ☀ Claro, 🌙 Oscuro, 🍷 Vino, ◻ Transparente

### 4.3 Flujo de trabajo recomendado

1. **Primero**: Elige un template al crear el evento (aplica colores base)
2. **Segundo**: Ajusta el Tema y Colores globales
3. **Tercero**: Configura la Carátula (nombres, fecha, fondo, audio)
4. **Cuarto**: Activa y configura las secciones que necesites
5. **Quinto**: Personaliza estilos por sección si quieres diferenciación visual
6. **Último**: Revisa en el Preview

### 4.4 Guardar

- Click en **💾 Guardar** en la toolbar superior
- El preview se actualiza automáticamente al guardar
- Si sales sin guardar, se te mostrará un diálogo de confirmación

---

## 5. Builder Visual

Accede desde el Dashboard → botón **"Builder"** en el evento activo.

### 5.1 ¿Qué es el Builder?

Es un editor visual donde puedes ver tu invitación en tiempo real mientras editas. Más intuitivo que el configurador de tabs — ideal para edición rápida de textos, activar/desactivar secciones, y ajustar el tema.

### 5.2 Layout del Builder

```
┌───────────────────────────────────────────────────────────┐
│  ← Volver  "Mi Evento"  📱 💻 🖥️         💾 Guardar     │
├─────────┬─────────────────────────────┬───────────────────┤
│ 🎨 Tema │                             │  PROPIEDADES      │
│         │      PREVIEW EN VIVO        │                   │
│ SECCIONES│     (landing real)          │  Controles de la  │
│ ☰ Inicio│                             │  sección activa   │
│ ✨ Intro │                             │                   │
│ 🖼 Hero  │  ← click aquí para         │  Título: ____     │
│ 💌 Invit.│     seleccionar sección     │  Color: ████      │
│ ℹ️ Detal.│                             │  Fondo: ____      │
│ 📍 Lugar │                             │                   │
│ ...      │                             │  [Config avanzada]│
└─────────┴─────────────────────────────┴───────────────────┘
```

### 5.3 Panel Izquierdo — Secciones

- **Tema Global** (botón especial arriba): Edita colores principales sin ir al config
- **Lista de secciones**: Muestra todas las secciones del landing
  - 👁 Click en el ojo → activa/desactiva la sección
  - ☰ Arrastra para reordenar (drag & drop)
  - Click → selecciona y resalta en el preview

### 5.4 Panel Central — Preview en Vivo

- Muestra tu invitación tal como la verán los invitados
- **3 modos de visualización**:
  - 📱 Mobile (375px) — como se ve en celular
  - 📱 Tablet (768px)
  - 🖥️ Desktop (ancho completo)
- **Click en una sección** del preview → la selecciona automáticamente
- **Edición directa**: Click en títulos/textos para editarlos directamente en el preview

### 5.5 Edición Inline (directa en el preview)

Puedes editar estos textos haciendo click directamente sobre ellos en el preview:

| Elemento | Dónde aparece |
|----------|---------------|
| Nombres de celebrantes | Hero (carátula) |
| Frase del hero | Debajo del countdown |
| Título de invitación | Sección "Invitación" |
| Subtítulo de invitación | Debajo del título |
| Título de cada sección | Detalles, Itinerario, Galería, Vestimenta, Regalos, RSVP |

**Cómo funciona:**
1. Pasa el mouse sobre el texto — se ilumina en púrpura sutil
2. Haz click — el texto se vuelve editable (cursor de texto)
3. Escribe el nuevo texto
4. Haz click fuera (o Enter en títulos) — se guarda automáticamente

### 5.6 Panel Derecho — Propiedades

Al seleccionar una sección, muestra controles específicos:

#### Carátula (Hero):
- Nombres de celebrantes (con degradado de color configurable, ocultables)
- Frase del hero (descripción opcional)
- Fecha del countdown (con formato dinámico)
- Fondo (imagen/video/GIF) — con botón de upload
- Audio de fondo — con botón de upload y controles de reproducción
- Estilo de frase configurable (fuente, tamaño, color)

#### Invitación:
- Título
- Subtítulo (mensaje principal)

#### Detalles:
- Título de la sección
- Cards editables (título + contenido + ícono)
- Fondo y border-radius individual por card
- **+ Agregar** nueva card / **✕** eliminar

#### Lugares:
- Items editables (nombre, dirección, hora, link de Maps)
- Fondo y border-radius individual por venue
- **+ Agregar** nuevo lugar / **✕** eliminar

#### Itinerario:
- Título de la sección
- Items del timeline: hora, título, descripción, ícono
- **Tipos de ícono**: Material Icons, Emoji, Imagen personalizada, o ninguno
- **Estilo del timeline**: Alineación (centro, izquierda, derecha), tipo de línea (sólida, punteada, segmentada, ninguna)
- **Personalización visual**: Tamaño de fuentes (hora, título, descripción), fondo de cards on/off, border-radius
- **Selector de hora**: Time picker visual con AM/PM
- **Grid de emojis**: Selector rápido de emojis temáticos
- Los iconos se centran verticalmente sobre la línea del timeline

#### Galería:
- Título
- Estilo de visualización (8 opciones: Carrusel 3D, Vertical 3D, Coverflow, Stack, Flip, Polaroid, Grid, Slideshow)
- Upload múltiple de fotos (calidad original, sin compresión)

#### Vestimenta:
- Título
- Cards dinámicas (ilimitadas)
- Cada card: título, descripción, hasta 4 imágenes de ejemplo
- Fondo y border-radius individuales por card
- **+ Agregar** / **✕** eliminar

#### Regalos:
- Título
- Descripción
- Link de mesa de regalos
- Texto del botón

#### Pantalla de Inicio:
- Textos de instrucción y sello
- Color del sobre y del sello
- Template: Sobre, Ticket, Splash, Plano

#### Intro:
- Frase animada (texto que aparece durante la intro)
- Duración (segundos con stepper)
- Fondo (imagen/video/GIF)
- **Partículas**: 6 tipos (confeti, estrellas, corazones, burbujas, nieve, polvo)
  - Dirección, cantidad, velocidad, colores, opacidad
- **Transición de salida**: 7 tipos de animación al terminar la intro
- **Loop**: Opción de repetir la intro continuamente

#### Estilo de fondo (en todas las secciones):
- Tipo: Hereda del tema / Sólido / Degradado / Imagen
- Color pickers
- Upload de imagen de fondo con overlay configurable

### 5.7 Tema Global

Click en **"🎨 Tema Global"** en el panel izquierdo para editar:

- **Colores principales**: Texto primario, secundario, acento
- **Botones**: Color de fondo y texto
- **Cards**: Fondo y borde
- **Fondo de la landing**: Color principal, secundario, tipo (sólido/lineal/radial)
- **Animación de scroll**: Fade Up, Fade In, Slide Left, Slide Right, Scale, Ninguna
- **Fuentes globales**: 15 tipografías disponibles para títulos, subtítulos y contenido
- **Separadores**: Estilo (elegante, formal, festivo, minimal, ornamental), color, grosor

### 5.8 Auto-guardado

El builder guarda automáticamente **3 segundos después de tu último cambio**. También puedes forzar el guardado con el botón 💾.

Después de guardar, el preview se recarga para mostrar los cambios.

### 5.9 Builder en Mobile

En pantallas pequeñas (<900px):
- Los paneles se ocultan automáticamente
- Usa los botones ☰ y 🔧 en la toolbar para abrir los paneles como drawers
- El preview ocupa toda la pantalla

### 5.10 Builder vs Configurador

| Característica | Builder | Configurador |
|---------------|---------|--------------|
| Edición visual directa | ✅ | ❌ |
| Preview en vivo | ✅ (siempre visible) | ✅ (tab separado) |
| Edición de textos | Click directo | Campos de formulario |
| Agregar/eliminar items | ✅ | ✅ |
| Estilos avanzados (fuentes, tamaños, gradientes) | Parcial | ✅ Completo |
| Partículas, separadores, adornos | ❌ | ✅ |
| Estilos por sección (fondos, dividers, transiciones) | ❌ | ✅ |
| Itinerario (iconos, emojis, estilo timeline) | ❌ | ✅ |
| Vestimenta (cards con imágenes) | Parcial | ✅ |
| Rapidez para cambios simples | ⚡ Rápido | Más lento |
| Control granular | Básico | Total |

**Recomendación**: Usa el Builder para edición rápida de textos y colores. Usa el Configurador para personalización profunda (partículas, dividers, estilos per sección, itinerario avanzado).

---

## 6. Gestión de Invitados

### Eventos Privados (con lista)

1. Ve a **Invitados** desde el dashboard
2. Opciones (iconos compactos en mobile, botones con label en desktop):
   - **📥 Plantilla**: Descargar template Excel para llenar
   - **📄 Importar**: Subir lista masiva desde Excel
   - **📊 Exportar**: Descargar lista actual en Excel
   - **📤 Enviar**: Envío masivo por WhatsApp
   - **+ Agregar**: Nuevo invitado manualmente

### Búsqueda y filtrado:
- **Desktop**: Input de búsqueda arriba del AG Grid — filtra por nombre, familia o código
- **Mobile**: Input arriba de las cards — filtra en tiempo real conforme escribes

### Tipos de invitado:
- **Individual**: 1 persona + acompañantes opcionales
- **Familia**: N personas (nombre de familia + lista de integrantes)

### Columnas del Grid (Desktop):
| Columna | Descripción |
|---------|-------------|
| Código | Código único del invitado (centrado) |
| Tipo | Individual/Familia (badge, centrado) |
| Familia/Nombre | Nombre principal + integrantes |
| Teléfono | Número WhatsApp (centrado) |
| Estado | Pendiente/Confirmado (badge, centrado) |
| Enviado | Si ya se compartió la invitación (centrado) |
| ⋮ | Menú: Compartir, QR, Editar, Eliminar |

### Eventos Abiertos (con registro)

No hay lista previa — los asistentes se registran solos desde la landing. Desde el dashboard puedes:
- Ver la lista de registrados en AG Grid (con paginación y filtros)
- Ver estadísticas de cupo (registrados / capacidad máxima)
- Buscar por nombre o email
- Eliminar registros individuales

---

## 7. Tarjetas de Invitación

Editor visual para diseñar tarjetas físicas imprimibles.

1. Accede desde el Dashboard → botón **"Tarjetas"**
2. Elige un template (Elegante, Moderno, Floral, Infantil) o empieza en blanco
3. Agrega elementos:
   - **Texto**: Con variables dinámicas ({nombre}, {evento}, {fecha})
   - **Imagen**: Logo, decoraciones
   - **QR**: Código QR personalizado por invitado
   - **Separador**: Líneas decorativas
4. Arrastra y posiciona los elementos
5. Configura el layout de impresión (tamaño de tarjeta, hoja, márgenes, gap)
6. **Vista Previa PDF** → genera la primera página para revisar
7. **Descargar PDF** → genera el archivo completo

### Atajos del editor:
- `Ctrl+Z` — Deshacer
- `Ctrl+Y` — Rehacer
- Drag en lista → reordenar (z-index)
- Botón duplicar → clon con offset

---

## 8. Compartir Invitaciones

### Eventos Privados

Cada invitado tiene un **link personalizado** con su código único:
```
https://invitaciones.jbdev.pro/invitacion/{slug}?t={código}
```

**Compartir individual:**
- En mobile con teléfono → abre WhatsApp directamente
- En mobile sin teléfono → usa el menú compartir del sistema
- En desktop → copia el link al portapapeles

**Envío masivo:**
- Filtra invitados con teléfono que no han sido enviados
- En mobile → abre WhatsApp para cada uno secuencialmente
- En desktop → copia la lista de links

### Eventos Abiertos

Se comparte un link genérico (sin código de invitado):
```
https://invitaciones.jbdev.pro/invitacion/{slug}
```

### Preview en redes sociales

Al compartir el link en WhatsApp, Facebook, o Twitter, se muestra un preview bonito con:
- Título del evento
- Descripción
- Imagen del hero (si tiene)

---

## 9. Tips y Atajos

### General
- **Ctrl+Shift+R** en el navegador para limpiar cache después de cambios
- Los cambios requieren **Guardar** para reflejarse en la landing real
- El **modo oscuro/claro** del dashboard se cambia con el ícono sol/luna en la barra superior
- El nombre del usuario logueado siempre es visible en la topbar

### Gestión de Usuarios
- Los usuarios se ordenan automáticamente: **root** primero, luego **admin**, luego **client**
- Búsqueda dinámica por nombre de usuario o rol
- Columnas del grid: Usuario, Rol, Contraseña (oculta), Gestión, Eventos, Creado, Acciones
- En mobile: Cards con botón "Acciones" → Editar, Restablecer contraseña, Eliminar

### Configurador
- Las **cards son colapsables** — click en el header para expandir/colapsar
- El botón **flotante 📱** (esquina inferior derecha) abre un preview rápido sin cambiar de tab
- Los **presets rápidos** en estilos de sección te ahorran configuración manual

### Builder
- **Click en el preview** = seleccionar sección
- **Click en un texto** del preview = editar directamente
- **Drag en el panel izquierdo** = reordenar secciones
- Los cambios se guardan automáticamente (3 segundos después del último cambio)

### Landing
- La landing es **mobile-first** (520px max-width, se expande en desktop)
- El **audio se inicia** al abrir el sobre (requiere interacción del usuario)
- Las **animaciones de scroll** tienen threshold 10% — se activan cuando la sección entra al viewport

### Imágenes
- Las imágenes se **comprimen automáticamente** al subir (max 1920px, JPEG 80%)
- Las fotos de **galería NO se comprimen** (calidad original)
- Formatos recomendados: JPG/PNG para imágenes, MP4/WebM para video, GIF para animaciones

---

## Preguntas Frecuentes

### ¿Puedo tener múltiples eventos?
Sí. Los admins ven todos los eventos. Los clientes solo los asignados.

### ¿Puedo duplicar un evento?
Sí. Desde la lista de eventos, usa el botón "Duplicar". Clona toda la configuración, tarjetas, itinerario y fotos.

### ¿Puedo cambiar de template después de configurar?
Sí, pero se reemplazan los colores y fuentes actuales. El contenido (textos, fotos, invitados) se mantiene.

### ¿Los invitados necesitan cuenta para confirmar?
No. Cada invitado accede con su link único (con código QR) y confirma sin login.

### ¿Se puede personalizar el mensaje de WhatsApp?
Sí. En la sección de Configuración → RSVP → "Mensaje para compartir". Admite variables como {nombre}, {evento}, {link}.

### ¿Cuántas fotos puedo subir a la galería?
No hay límite técnico, pero se recomienda máximo 15-20 para carga rápida en dispositivos móviles. Las fotos se mantienen en calidad original.

### ¿Builder o Configurador?
- **Builder** para cambios rápidos visuales (textos, colores, activar/desactivar secciones)
- **Configurador** para ajustes finos (fuentes específicas, tamaños, partículas, separadores, adornos, estilos por sección, itinerario avanzado)

### ¿Cómo funciona el modo oscuro/claro?
Click en el ícono ☀/🌙 en la topbar. Afecta solo al dashboard — la landing siempre usa su propio tema configurado.

### ¿Puedo buscar en las tablas?
Sí. Todos los módulos (Eventos, Usuarios, Invitados) tienen un input de búsqueda que filtra en tiempo real tanto el grid desktop como las cards mobile.

### ¿El itinerario acepta emojis como iconos?
Sí. En el Configurador → Itinerario → cada item tiene un selector de tipo de ícono (Material Icon, Emoji, Imagen, o ninguno). Los emojis se seleccionan de un grid temático.
