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
- **Botones de acción**: Invitados, Configurar, Builder, Tarjetas.

### Navegación del Sidebar:
- 🏠 Inicio — Vista general con carrusel
- 📅 Eventos — Lista y crear nuevos eventos
- 👤 Usuarios — Gestionar usuarios (root/admin)
- 💡 Sugerencias — Retroalimentación de clientes

---

## 3. Crear un Evento

1. Ve a **Eventos** en el sidebar
2. Click en **"+ Nuevo Evento"**
3. Completa:
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
- Nombres de celebrantes
- Frase del hero
- Descripción del evento
- Fecha del countdown
- Fondo (imagen/video/GIF) — con botón de upload
- Audio de fondo — con botón de upload

#### Invitación:
- Título
- Subtítulo (mensaje principal)

#### Detalles:
- Título de la sección
- Cards editables (título + contenido)
- **+ Agregar** nueva card / **✕** eliminar

#### Lugares:
- Items editables (nombre, dirección, hora, link de Maps)
- **+ Agregar** nuevo lugar / **✕** eliminar

#### Galería:
- Título
- Estilo de visualización (8 opciones: Carrusel 3D, Coverflow, Stack, etc.)

#### Vestimenta:
- Título
- Cards editables (título + descripción)
- **+ Agregar** / **✕** eliminar

#### Regalos:
- Título
- Descripción
- Link de mesa de regalos
- Texto del botón

#### Pantalla de Inicio:
- Textos de instrucción y sello
- Color del sobre y del sello

#### Intro:
- Frase animada
- Duración (segundos)
- Fondo (imagen/video)

#### Estilo de fondo (en todas las secciones):
- Tipo: Hereda del tema / Sólido / Degradado / Imagen
- Color pickers
- Upload de imagen de fondo

### 5.7 Tema Global

Click en **"🎨 Tema Global"** en el panel izquierdo para editar:

- **Colores principales**: Texto primario, secundario, acento
- **Botones**: Color de fondo y texto
- **Cards**: Fondo y borde
- **Fondo de la landing**: Color principal, secundario, tipo (sólido/lineal/radial)
- **Animación de scroll**: Fade Up, Fade In, Scale, Ninguna

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
| Rapidez para cambios simples | ⚡ Rápido | Más lento |
| Control granular | Básico | Total |

**Recomendación**: Usa el Builder para edición rápida y el Configurador para ajustes finos.

---

## 6. Gestión de Invitados

### Eventos Privados (con lista)

1. Ve a **Invitados** desde el dashboard
2. Opciones:
   - **+ Nuevo**: Agregar invitado manualmente (nombre, tipo, teléfono)
   - **📥 Importar Excel**: Subir lista masiva
   - **📤 Exportar**: Descargar lista en Excel
   - **QR**: Ver código QR de cada invitado

### Tipos de invitado:
- **Individual**: 1 persona
- **Pareja**: 2 personas (titular + acompañante)
- **Familia**: N personas (titular + lista de nombres)

### Eventos Abiertos (con registro)

No hay lista previa — los asistentes se registran solos desde la landing. Desde el dashboard puedes:
- Ver la lista de registrados
- Ver estadísticas de cupo (registrados / capacidad máxima)
- Eliminar registros

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
No hay límite técnico, pero se recomienda máximo 15-20 para carga rápida en dispositivos móviles.

### ¿Builder o Configurador?
- **Builder** para cambios rápidos visuales (textos, colores, activar/desactivar secciones)
- **Configurador** para ajustes finos (fuentes específicas, tamaños, partículas, separadores, adornos)
