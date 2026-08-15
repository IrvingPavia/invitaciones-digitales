# 📋 BUILDER-SPEC — Análisis Comparativo Configurador vs Builder

> Documento de especificación exhaustivo que mapea TODAS las propiedades configurables de la landing,
> comparando lo que existe en el Configurador antiguo vs lo implementado en el Builder visual.
> Sirve como guía para cerrar brechas y completar la migración al Builder.

---

## Resumen Ejecutivo

| Área | Configurador | Builder | Estado |
|------|:---:|:---:|--------|
| Tema Global (colores) | ✅ | ✅ | Completo + mejoras |
| Tema Global (fuentes por color) | ✅ | ✅ | Completo |
| Estilos Globales (headings/titles/content) | ✅ | ✅ | Completo |
| Fondo Landing | ✅ | ✅ | Completo |
| Navbar & Menu | ❌ | ✅ | Solo en Builder |
| Animación Scroll | ✅ | ✅ | Completo |
| Favicon | ✅ | ✅ | — |
| Pantalla Inicio (Envelope) | ✅ | ✅ | Completo |
| Intro | ✅ | ✅ | Completo + mejoras |
| Hero (Carátula) | ✅ | ✅ | Completo + mejoras |
| Invitación | ✅ | ✅ | Completo + mejoras |
| Detalles | ✅ | ✅ | Completo + mejoras |
| Lugares (Venues) | ✅ | ✅ | Completo + mejoras |
| Itinerario | ✅ | ✅ | Completo + mejoras |
| Galería | ✅ | ✅ | Completo |
| Vestimenta (Dresscode) | ✅ | ✅ | Completo + mejoras |
| Regalos (Gifts) | ✅ | ✅ | Parcial (falta sectionIcon) |
| RSVP/Confirmación | ✅ | ✅ | Completo |
| Estilo por Sección (SectionStyle) | ✅ | ✅ | Completo |
| Adornos de Título (HeadingOrnament) | ✅ | ✅ | Completo |
| Presets de Sección | ✅ | ✅ | Completo |


---

## 1. TEMA GLOBAL (`theme` + `globalStyles`)

### 1.1 Colores del Tema (`theme.*`)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `cardBg` | ✅ | ✅ | — |
| `cardBorder` | ✅ | ✅ | — |
| `textPrimary` | ✅ | ✅ | — |
| `textPrimaryFont` | ✅ (select) | ✅ | — |
| `textSecondary` | ✅ | ✅ | — |
| `textSecondaryFont` | ✅ (select) | ✅ | — |
| `navFooterText` | ✅ | ✅ | — |
| `navFooterFont` | ✅ (select) | ✅ | — |
| `buttonBg` | ✅ | ✅ | — |
| `buttonText` | ✅ | ✅ | — |
| `buttonFont` | ✅ (select) | ✅ | — |

### 1.2 Fondo de la Landing (`theme.landingBg*`)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `landingBgType` | ✅ (solid/linear/radial/mesh) | ✅ (via select) | Builder usa CustomSelect |
| `landingBgColor1` | ✅ | ✅ | — |
| `landingBgColor2` | ✅ (condicional) | ✅ | — |
| `landingBgAngle` | ✅ (range 1-360) | ✅ | Condicional (linear/mesh) |
| `landingBgIntensity` | ✅ (range 10-100 para radial/mesh) | ✅ | Condicional (radial/mesh) |
| `landingBgTexture` | ✅ (8 opciones) | ✅ | — |
| `landingBgTextureOpacity` | ✅ (range 1-20) | ✅ (range 1-30) | Builder tiene rango mayor |

### 1.3 Navbar y Menú (`theme.nav*`)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `navBarBg1` | ❌ | ✅ | **Solo Builder** |
| `navBarBg2` | ❌ | ✅ | **Solo Builder** |
| `navBarBlur` | ❌ | ✅ | **Solo Builder** |
| `navBarOpacity` | ❌ | ✅ | **Solo Builder** |
| `navBarBorder` | ❌ | ✅ | **Solo Builder** |
| `navBtnBg` | ❌ | ✅ | **Solo Builder** |
| `navBtnBorder` | ❌ | ✅ | **Solo Builder** |
| `navBtnIcon` | ❌ | ✅ | **Solo Builder** |
| `navMenuBg` | ❌ | ✅ | **Solo Builder** |
| `navMenuText` | ❌ | ✅ | **Solo Builder** |
| `navMenuBlur` | ❌ | ✅ | **Solo Builder** |


### 1.4 Estilos Globales de Texto (`globalStyles.*`)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `sectionHeadingStyle.fontFamily` | ✅ (15 fuentes) | ❌ | **FALTA** — Panel "Estilos" completo no existe en Builder |
| `sectionHeadingStyle.fontSize` | ✅ | ❌ | **FALTA** |
| `sectionHeadingStyle.color` | ✅ | ❌ | **FALTA** |
| `titleStyle.fontFamily` | ✅ | ❌ | **FALTA** |
| `titleStyle.fontSize` | ✅ | ❌ | **FALTA** |
| `titleStyle.color` (Color 1) | ✅ | ❌ | **FALTA** |
| `titleStyle.color2` (Color 2) | ✅ | ❌ | **FALTA** |
| `titleStyle.gradientAngle` | ✅ | ❌ | **FALTA** |
| `titleStyle.gradientIntensity` | ✅ | ❌ | **FALTA** |
| `titleStyle.fontWeight` | ✅ | ❌ | **FALTA** |
| `subtitleStyle.fontFamily` | ✅ | ❌ | **FALTA** |
| `subtitleStyle.fontSize` | ✅ | ❌ | **FALTA** |
| `subtitleStyle.color` | ✅ | ❌ | **FALTA** |
| `contentStyle.fontFamily` | ✅ | ❌ | **FALTA** |
| `contentStyle.fontSize` | ✅ | ❌ | **FALTA** |
| `contentStyle.color` | ✅ | ❌ | **FALTA** |
| `separatorStyle.type` | ✅ (7 estilos) | ❌ | **FALTA** |
| `separatorStyle.color` | ✅ | ❌ | **FALTA** |

### 1.5 Animación de Scroll

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `theme.scrollAnimation` | ✅ (6 opciones) | ✅ (6 opciones) | Completo |

### 1.6 Favicon

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `favicon` (upload) | ✅ | ✅ | — |


---

## 2. PANTALLA DE INICIO (Envelope)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `enabled` toggle | ✅ | N/A | Builder usa enable/disable de sección en sidebar |
| `template` (4 tipos) | ✅ (cards visuales) | ✅ (grid 2x2) | — |
| `style` (5 estilos sobre) | ✅ | ✅ (CustomSelect) | — |
| `sealStyle` (5 estilos sello) | ✅ | ✅ (CustomSelect) | — |
| `envelopeColor` | ✅ | ✅ | — |
| `sealColor` | ✅ | ✅ | — |
| `sealText` | ✅ | ✅ | — |
| `sealImage` (upload) | ✅ | ✅ | — |
| `instructionText` | ✅ | ✅ | — |
| `instructionAnimation` | ❌ | ✅ | **Solo Builder** |
| `bgColor` | ✅ | ✅ | — |
| `bgColor2` | ✅ | ✅ | — |
| `textColor` | ✅ | ✅ | — |
| `ticketTitle/Subtitle/Date` | ✅ | ✅ | — |
| `ticketAccentColor/BodyColor/TextColor` | ✅ | ✅ | — |
| `splashTitle/Subtitle/ButtonText/Image` | ✅ | ✅ | — |
| `plainTitle/Subtitle/Content` | ✅ | ✅ | — |

**Estado: ✅ Completo + mejoras**

---

## 3. INTRO

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `enabled` toggle | ✅ | N/A | Sidebar |
| `phrase` | ✅ | ✅ | — |
| `phraseStyle.fontFamily` | ✅ | ✅ | — |
| `phraseStyle.fontSize` | ✅ | ✅ | — |
| `phraseStyle.color` | ✅ | ✅ | — |
| `phraseStyle.fontWeight` | ✅ (range) | ✅ | — |
| `background` (upload) | ✅ | ✅ | — |
| `duration` | ✅ | ✅ (stepper) | — |
| `videoStart/videoEnd` (trimmer) | ✅ | ✅ | — |
| `useVideoDuration` | ❌ | ✅ | **Solo Builder** |
| `transition` | ❌ | ✅ | **Solo Builder** |
| `showSkip` | ❌ | ✅ | **Solo Builder** |
| `particles.enabled` | ✅ | ✅ | — |
| `particles.type` (6) | ✅ | ✅ | — |
| `particles.direction` (4) | ✅ | ✅ | — |
| `particles.color1/color2` | ✅ | ✅ | — |
| `particles.quantity` | ✅ | ✅ | — |
| `particles.speed` | ✅ | ✅ | — |
| `particles.size` | ✅ | ✅ | — |
| `particles.opacity` | ✅ | ✅ | — |

**Estado: ✅ Completo + mejoras (falta fontWeight de phraseStyle)**


---

## 4. HERO (Carátula)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `eventDescription` | ✅ | ✅ | — |
| `eventDescriptionStyle.fontFamily` | ✅ | ✅ | — |
| `eventDescriptionStyle.fontSize` | ✅ | ✅ (stepper) | — |
| `eventDescriptionStyle.color1/color2` | ✅ | ✅ | — |
| `eventDescriptionStyle.gradientAngle` | ✅ (range) | ✅ | — |
| `eventDescriptionStyle.gradientIntensity` | ✅ (range) | ✅ | — |
| `eventDescriptionStyle.fontWeight` | ✅ (range) | ✅ | — |
| `showCelebrantNames` toggle | ✅ | ✅ | — |
| `celebrantNames` | ✅ | ✅ | — |
| `celebrantNamesStyle.fontFamily` | ✅ | ✅ | — |
| `celebrantNamesStyle.fontSize` | ✅ | ✅ (stepper) | — |
| `celebrantNamesStyle.color1/color2` | ✅ | ✅ | — |
| `celebrantNamesStyle.gradientAngle` | ✅ (range) | ✅ | — |
| `celebrantNamesStyle.gradientIntensity` | ✅ (range) | ✅ | — |
| `celebrantNamesStyle.fontWeight` | ✅ (range) | ✅ | — |
| `showDescription` toggle | ✅ | ✅ | — |
| `description` | ✅ | ✅ | — |
| `heroPhrase` | ✅ | ✅ | — |
| `heroPhraseStyle.fontFamily` | ✅ | ✅ | — |
| `heroPhraseStyle.fontSize` | ✅ | ✅ (stepper) | — |
| `heroPhraseStyle.color` | ✅ | ✅ | — |
| `countdownDate` | ✅ (date + time picker custom) | ✅ (datetime-local) | Builder usa input nativo |
| `countdownShowCardBg` | ✅ | ✅ | — |
| `countdownCardBorderRadius` | ✅ | ✅ | — |
| `countdownCardBgOpacity` | ❌ | ✅ | **Solo Builder** |
| `countdownCardBorderStyle` | ❌ | ✅ | **Solo Builder** |
| `countdownCardBorderWidth` | ❌ | ✅ | **Solo Builder** |
| `countdownCardBorderColor` | ❌ | ✅ | **Solo Builder** |
| `countdownCardGlowColor` | ❌ | ✅ | **Solo Builder** |
| `countdownCardBgColor` | ❌ | ✅ | **Solo Builder** |
| `countdownCardShape` | ❌ | ✅ | **Solo Builder** |
| `backgroundGif` (upload) | ✅ | ✅ | — |
| `audioUrl` (upload) | ✅ | ✅ | — |

**Estado: ✅ Completo + mejoras (faltan gradientAngle/Intensity/fontWeight en estilos de texto)**


---

## 5. INVITACIÓN

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `title` | ✅ | ✅ | — |
| `subtitle` | ✅ | ✅ | — |
| `showCardBg` toggle | ✅ | ✅ | — |
| `cardBgOpacity` | ❌ | ✅ | **Solo Builder** |
| `cardBgColor` | ❌ | ✅ | **Solo Builder** |
| `cardBorderRadius` | ✅ | ✅ | — |
| `cardBorderStyle` | ❌ | ✅ | **Solo Builder** |
| `cardBorderWidth` | ❌ | ✅ | **Solo Builder** |
| `cardBorderColor` | ❌ | ✅ | **Solo Builder** |
| `cardGlowColor` | ❌ | ✅ | **Solo Builder** |
| `cardShape` | ❌ | ✅ | **Solo Builder** |

**Estado: ✅ Completo + mejoras extensivas en estilado de cards**

---

## 6. DETALLES

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `enabled` toggle | ✅ | N/A | Sidebar |
| `title` | ✅ | ✅ | — |
| `showCardBg` toggle | ❌ | ✅ | **Solo Builder** (global) |
| `cards[].iconType` (none/emoji/image) | ✅ | ✅ | — |
| `cards[].icon` (emoji) | ✅ | ✅ | — |
| `cards[].iconUrl` (image upload) | ✅ | ❌ | **FALTA** upload de icono imagen en Builder |
| `cards[].title` | ✅ | ✅ | — |
| `cards[].content` (rich text) | ✅ (RichTextEditor) | ✅ (textarea) | Builder usa textarea simple |
| `cards[].textAlign` | ✅ | ✅ | — |
| `cards[].showCardBg` (per card) | ✅ | ❌ | **FALTA** per-card bg toggle |
| `cards[].cardBorderRadius` (per card) | ✅ | ❌ | **FALTA** per-card radius |
| Card Appearance (extendido) | ❌ | ✅ | Builder tiene estilo avanzado |

**Estado: ⚠️ Parcial — Falta upload icono imagen, rich text editor, per-card bg/radius**

---

## 7. LUGARES (Venues)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `enabled` toggle | ✅ | N/A | Sidebar |
| `iconStyle` (none/circle/plain) | ✅ | ✅ | — |
| `showCardBg` toggle | ❌ | ✅ | **Solo Builder** |
| `cardBorderRadius` | ✅ | ✅ | — |
| `items[].title` | ✅ | ✅ | — |
| `items[].name` | ✅ | ✅ | — |
| `items[].address` | ✅ | ✅ | — |
| `items[].time` | ✅ (time picker arrows) | ✅ (WheelTimePicker) | Builder usa control custom |
| `items[].mapsUrl` | ✅ | ✅ | — |
| `items[].iconType` (none/emoji/image) | ✅ | ✅ | — |
| `items[].iconEmoji` | ✅ (emoji picker) | ✅ (emoji grid) | — |
| `items[].icon` (image upload) | ✅ | ✅ | — |
| `items[].showCardBg` (per venue) | ✅ | ❌ | **FALTA** per-venue bg toggle |
| Card Appearance (extendido) | ❌ | ✅ | Builder tiene estilo avanzado |

**Estado: ✅ Completo + mejoras (falta per-venue showCardBg)**


---

## 8. ITINERARIO

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `enabled` toggle | ✅ | N/A | Sidebar |
| `title` | ✅ | ✅ | — |
| `showCardBg` toggle | ✅ | ✅ | — |
| `cardBorderRadius` | ✅ | ✅ | — |
| `showIcons` | ❌ | ✅ | **Solo Builder** |
| `titleFontSize` | ❌ | ✅ | **Solo Builder** |
| `descFontSize` | ❌ | ✅ | **Solo Builder** |
| `timeFontSize` | ❌ | ✅ | **Solo Builder** |
| `textAlign` | ❌ | ✅ | **Solo Builder** |
| `timelineAlign` | ❌ | ✅ | **Solo Builder** |
| `lineStyle` (solid/dashed/dotted/none) | ❌ | ✅ | **Solo Builder** |
| `items[].iconType` (none/emoji/custom) | ✅ | ✅ | — |
| `items[].icon` (emoji) | ✅ (emoji picker) | ✅ (emoji grid) | — |
| `items[].iconUrl` (image upload) | ✅ | ✅ | — |
| `items[].time` | ✅ (time picker) | ✅ (hour/min/ampm selects) | — |
| `items[].title` | ✅ | ✅ | — |
| `items[].description` | ✅ | ✅ | — |
| Card Appearance (extendido) | ❌ | ✅ | Builder tiene estilo avanzado |

**Estado: ✅ Completo + mejoras significativas**

---

## 9. GALERÍA

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `enabled` toggle | ✅ | N/A | Sidebar |
| `title` | ✅ | ✅ | — |
| `description` | ✅ | ✅ | — |
| `displayStyle` (8 estilos) | ✅ (select) | ✅ (chips) | — |
| Fotos upload múltiple | ✅ | ✅ | — |
| Fotos grid + delete | ✅ | ✅ | — |

**Estado: ✅ Completo**

---

## 10. VESTIMENTA (Dresscode)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `enabled` toggle | ✅ | N/A | Sidebar |
| `title` | ✅ | ✅ | — |
| `description` | ❌ | ✅ | **Solo Builder** |
| `cards[].title` | ✅ | ✅ | — |
| `cards[].description` | ✅ | ✅ | — |
| `cards[].images[]` (hasta 4) | ✅ | ✅ | — |
| `cards[].showCardBg` | ✅ | ❌ | **FALTA** per-card bg en Builder |
| `cards[].cardBorderRadius` | ✅ | ❌ | **FALTA** per-card radius en Builder |
| Card Appearance (extendido) | ❌ | ✅ | Builder tiene estilo avanzado |

**Estado: ✅ Completo (falta per-card bg/radius del Config)**

---

## 11. REGALOS (Gifts)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `enabled` toggle | ✅ | N/A | Sidebar |
| `title` | ✅ | ✅ | — |
| `description` | ✅ | ✅ | — |
| `link` | ✅ | ✅ | — |
| `buttonText` | ✅ | ✅ | — |
| `showCardBg` toggle | ✅ | ❌ | **FALTA** en Builder |
| `cardBorderRadius` | ✅ | ❌ | **FALTA** en Builder |
| `sectionIcon.iconType` | ✅ (4 tipos) | ❌ | **FALTA** en Builder |
| `sectionIcon.icon` (emoji) | ✅ | ❌ | **FALTA** en Builder |
| `sectionIcon.iconUrl` (upload) | ✅ | ❌ | **FALTA** en Builder |
| `transfer.enabled` | ✅ | ✅ | — |
| `transfer.title` | ✅ | ✅ | — |
| `transfer.description` | ✅ | ✅ | — |
| `transfer.accountName` | ✅ | ✅ | — |
| `transfer.bank` | ✅ | ✅ | — |
| `transfer.accountType` | ✅ | ✅ | — |
| `transfer.accountNumber` | ✅ | ✅ | — |
| `transfer.animation` | ✅ | ✅ | — |
| `transfer.showCardBg` | ✅ | ❌ | **FALTA** en Builder |
| `transfer.cardBorderRadius` | ✅ | ❌ | **FALTA** en Builder |
| `transfer.sectionIcon.*` | ✅ | ❌ | **FALTA** en Builder |
| Card Appearance (extendido) | ❌ | ✅ | Builder tiene estilo avanzado |

**Estado: ⚠️ Parcial — Falta sectionIcon, showCardBg simple, per-section radius**


---

## 12. CONFIRMACIÓN (RSVP)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `enabled` toggle | ✅ | N/A | Sidebar |
| `title` | ✅ | ✅ | — |
| `showCardBg` toggle | ✅ | ❌ | **FALTA** en Builder |
| `cardBorderRadius` | ✅ | ❌ | **FALTA** en Builder |
| `sectionIcon.iconType` | ✅ (4 tipos) | ❌ | **FALTA** en Builder |
| `sectionIcon.icon` (emoji) | ✅ | ❌ | **FALTA** en Builder |
| `sectionIcon.iconUrl` (upload) | ✅ | ❌ | **FALTA** en Builder |
| `registrationFields[]` (dynamic) | ✅ (full CRUD) | ❌ | **FALTA** — campos de registro no configurables en Builder |
| Card Appearance (extendido) | ❌ | ✅ | Builder tiene estilo avanzado |

**Estado: ⚠️ Parcial — Falta sectionIcon, registrationFields, showCardBg/radius simples**

---

## 13. ESTILO POR SECCIÓN (`sectionStyle`)

El Configurador tiene un panel completo de SectionStyle en cada sección (inv, details, venues, itinerary, gallery, dresscode, gifts, rsvp). El Builder tiene una versión simplificada.

### 13.1 Fondo de Sección

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `bgType` (inherit/solid/linear/radial/image) | ✅ (solid/linear/image) | ✅ (inherit/solid/linear/image) | — |
| `bgColor1` | ✅ | ✅ | — |
| `bgColor2` | ✅ | ❌ | **FALTA** en Builder (solo muestra si linear) |
| `bgAngle` | ✅ (range + number) | ❌ | **FALTA** en Builder |
| `bgImage` (upload) | ✅ | ❌ | **FALTA** upload en Builder |
| `bgOverlay` | ✅ (range) | ❌ | **FALTA** en Builder |

### 13.2 Transición Superior (Divider)

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `dividerType` (8 tipos) | ✅ | ✅ (8 tipos) | Completo |
| `dividerFlip` | ✅ | ✅ | — |
| `dividerHeight` (range 20-100) | ✅ | ✅ | — |
| `dividerStrokeColor` | ✅ | ✅ | — |
| `dividerStrokeWidth` (range 0-5) | ✅ | ✅ | — |
| `dividerStrokeOpacity` (range 0-1) | ✅ | ✅ | — |

### 13.3 Override de Texto

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `sectionHeadingFont` | ✅ | ✅ | — |
| `sectionHeadingSize` | ✅ | ✅ | — |
| `sectionHeadingColor` | ✅ | ✅ | — |
| `headingFont` | ✅ | ✅ | — |
| `headingFontSize` | ✅ | ✅ | — |
| `headingColor` (Color 1) | ✅ | ✅ | — |
| `headingColor2` (Color 2) | ✅ | ✅ | — |
| `headingGradientAngle` | ✅ | ✅ | — |
| `headingGradientIntensity` | ✅ | ✅ | — |
| `headingFontWeight` | ✅ | ✅ | — |
| `contentFont` | ✅ | ✅ | — |
| `contentFontSize` | ✅ | ✅ | — |
| `contentColor` | ✅ | ✅ | — |

### 13.4 Animación por Sección

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `animation` (inherit/fade-up/fade-in/slide-left/slide-right/scale/none) | ✅ (7 opciones) | ✅ (7 opciones) | Completo |

### 13.5 Adornos de Título

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `headingOrnament.type` (8 tipos) | ✅ | ❌ | **FALTA** completamente |
| `headingOrnament.position` (above/below/both/sides) | ✅ | ❌ | **FALTA** |
| `headingOrnament.color` | ✅ | ❌ | **FALTA** |
| `headingOrnament.size` (0.5-2) | ✅ | ❌ | **FALTA** |

### 13.6 Presets Rápidos

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| Presets (Claro/Oscuro/Vino/Transparente) | ✅ | ❌ | **FALTA** |


---

## 14. PROPIEDADES EXCLUSIVAS DEL BUILDER (no en Configurador)

Estas propiedades solo existen en el Builder y representan mejoras:

### 14.1 Estilo Avanzado de Cards (por sección)
Disponible en: invitation, details, venues, itinerary, dresscode, gifts, rsvp, hero countdown

| Propiedad | Descripción |
|-----------|-------------|
| `cardBgOpacity` (0-100%) | Opacidad del fondo de card |
| `cardBgColor` | Color personalizado de fondo |
| `cardBorderStyle` | Estilo del borde (none, solid, dashed, dotted, glow, neon) |
| `cardBorderWidth` (1-5px) | Grosor del borde |
| `cardBorderColor` | Color del borde |
| `cardGlowColor` | Color de sombra (para glow/neon) |
| `cardShape` | Forma de card (standard, rounded, pill, etc.) |

### 14.2 Navbar y Menú (12 propiedades)
Ver sección 1.3

### 14.3 Intro — Controles extra
- `useVideoDuration` toggle
- `transition` select (fade, slide-up, slide-down, zoom-in, zoom-out, blur, none)
- `showSkip` toggle

### 14.4 Envelope — instructionAnimation
Animación del texto de instrucción (pulse, bounce, fade, slide-up, glow, none)

---

## 15. PRIORIDADES DE IMPLEMENTACIÓN

### 🔴 Alta Prioridad (afecta la experiencia de edición)

1. **Panel Estilos Globales** — Crear acordeón "Estilos Globales" dentro del Tema Global con:
   - Encabezados de Sección (font, size, color)
   - Títulos con degradado (font, size, color1, color2, angle, intensity, weight)
   - Subtítulos (font, size, color)
   - Contenido (font, size, color)
   - Separadores (type, color)

2. **SectionStyle completo** — Expandir el panel de estilo por sección:
   - Agregar mountains/drops/arrow a dividerType
   - Agregar dividerFlip, dividerHeight, dividerStroke (color, width, opacity)
   - Agregar headingFont, headingFontSize, headingColor2, gradientAngle/Intensity/Weight
   - Agregar contentFont, contentFontSize
   - Agregar sectionHeadingFont, sectionHeadingSize
   - Agregar bgAngle, bgImage upload, bgOverlay
   - Agregar headingOrnament completo (8 tipos, position, color, size)
   - Agregar presets (Claro/Oscuro/Vino/Transparente)

3. **Font selects** en colores del tema — Agregar 4 selectores de fuente junto a los color pickers

### 🟡 Media Prioridad

4. **Hero gradientAngle/Intensity/fontWeight** — Agregar sliders para eventDescriptionStyle y celebrantNamesStyle
5. **Intro phraseStyle.fontWeight** — Agregar range
6. **RSVP registrationFields** — Configuración de campos dinámicos
7. **sectionIcon** para Gifts y RSVP — Selector tipo icono con emoji/imagen
8. **Landing bg angle/intensity** — Sliders condicionales según tipo
9. **Scroll animation** opciones faltantes (slide-left, slide-right)
10. **Favicon** upload

### 🟢 Baja Prioridad

11. **Details** — Rich text editor en cards (en vez de textarea)
12. **Details** — Per-card showCardBg y cardBorderRadius
13. **Venues** — Per-venue showCardBg
14. **Dresscode** — Per-card showCardBg y cardBorderRadius del Config antiguo
15. **Gifts** — showCardBg simple y cardBorderRadius del Config (ya tiene el extendido)

---

## 16. NOTAS TÉCNICAS

- El backend (`ensureConfigDefaults.js`) ya soporta TODAS las propiedades de ambas interfaces. No necesita cambios.
- Las propiedades exclusivas del Builder (cardBorderStyle, cardBorderWidth, etc.) ya están en el modelo de datos y se persisten correctamente.
- Al agregar propiedades al Builder, NO se necesitan migraciones — los defaults se aplican via `ensureConfigDefaults`.
- Los componentes de la landing (`venues.component`, `gifts.component`, etc.) ya consumen todas las propiedades del modelo, por lo que los cambios son solo en el panel de propiedades del Builder.

---

## 17. REDISEÑO DEL COLOR PICKER

El componente `ColorPickerComponent` actual debe rediseñarse para tener un estilo profesional tipo app de diseño. El nuevo diseño aplica a TODOS los color pickers del Builder y del Configurador, incluyendo dispositivos móviles.

### Diseño objetivo

```
┌─────────────────────────────────────┐
│                                     │
│   ┌─────────────────────────────┐   │
│   │                             │   │
│   │    Área de saturación /     │   │
│   │    luminosidad (2D)         │   │
│   │         ○ (selector)        │   │
│   │                             │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│                            100      │  ← Opacidad (%)
│   ┌═══════════════════════════○─┐   │  ← Slider de opacidad
│   └─────────────────────────────┘   │     (gradiente del color → transparente)
│                                     │
│   ◉◉  FFFFFF              ⊕        │  ← Paleta presets | Hex input | Agregar
│   ◉◉                               │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ | █████████████████████████ │   │  ← Slider de Hue (arcoíris horizontal)
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Componentes del picker

1. **Área 2D (saturación + luminosidad)**: Cuadrado/rectángulo grande con gradiente. Eje X = saturación (izq gris → der puro). Eje Y = luminosidad (arriba claro → abajo oscuro). Selector circular blanco con borde.

2. **Slider de opacidad**: Barra horizontal con gradiente del color seleccionado hacia transparente (cuadrícula de fondo). Thumb circular blanco. Valor numérico (0-100) a la derecha.

3. **Barra inferior**:
   - Izquierda: Botón de paleta de presets (4 círculos pequeños que muestran colores guardados)
   - Centro: Input hexadecimal editable (sin #, 6 caracteres)
   - Derecha: Botón "+" para guardar color a presets

4. **Slider de Hue**: Barra arcoíris horizontal (rojo→amarillo→verde→cian→azul→magenta→rojo). Indicador vertical tipo línea o thumb delgado.

### Requisitos funcionales

- El picker se abre al hacer click en el swatch de color (comportamiento actual)
- **Aplicación en tiempo real**: El color se aplica/renderiza en vivo conforme el usuario mueve el selector en el área 2D, el slider de hue o el de opacidad. No hay botón de confirmar.
- **Cerrar**: Click fuera del picker (click outside dismiss). No se necesita botón de aceptar.
- El botón "+" guarda el color actual en la paleta de presets/favoritos, NO es para confirmar.
- Soporte touch completo: arrastrar en área 2D, sliders, todo funcional en mobile
- El área 2D debe ser suficientemente grande para precisión en mobile (mínimo 200px de alto)
- Border-radius en esquinas del contenedor del picker
- Fondo oscuro/negro (#000 o near-black) para el área de controles
- Los sliders deben tener thumb circular con borde blanco
- El input hex debe ser editable directamente (teclado)
- Paleta de presets: máximo 8 colores guardados, persisten por sesión
- El picker debe posicionarse correctamente (no cortarse por overflow del panel)
- En mobile: el picker podría abrirse como modal/overlay centrado en pantalla

### Diferencias con el picker actual

| Aspecto | Actual | Nuevo |
|---------|--------|-------|
| Layout | Vertical compacto | Profesional con área 2D grande |
| Área de color | Strip vertical pequeño | Cuadrado 2D (sat × lum) |
| Hue | Integrado en el área | Slider horizontal separado abajo |
| Opacidad | Toggle opcional | Siempre visible como slider |
| Presets | No tiene | 8 colores guardables |
| Hex input | Existe | Centrado, más prominente |
| Mobile | Se corta a veces | Modal centrado, touch-friendly |

---

## 18. AJUSTES Y BUGS PENDIENTES (Checklist)

Sección para ir registrando detalles visuales, bugs y ajustes menores que se detectan durante el uso del Builder.

### Canvas (Desktop)

- [x] **Excedente de BG en laterales del canvas**: Después de agregar los bordes laterales para marcar la sección activa, se nota un excedente del fondo (background) que se desborda por los costados izquierdo y derecho. Afecta a:
  - Pantalla de Inicio (envelope)
  - Intro
  - Navbar del menú
  - Botón "Volver" (al hacer scroll hacia abajo)
  
  El fondo de esas secciones se extiende más allá del ancho del canvas, dejando una franja visible entre el borde del contenido y el borde lateral de selección. Hay que asegurar que los componentes full-width respeten el ancho del canvas sin overflow lateral.
  > **Fix**: Se reemplazó `border-left/right: 3px solid` por `box-shadow: inset 3px 0 0` — el indicador ya no ocupa espacio real en el layout.

- [ ] **Textos del Hero se muestran como bloques de color sin texto**: Al cambiar entre eventos (navegando de un evento a otro y entrando al Builder), los textos con gradiente del Hero (nombres de celebrantes, descripción del evento) se renderizan como rectángulos sólidos de color sin el texto visible. El gradiente `-webkit-background-clip: text` no se aplica correctamente.
  - Ocurre intermitentemente al cambiar entre eventos
  - Posible causa: el componente Hero se reutiliza sin re-renderizar los estilos del gradiente, o las CSS custom properties quedan en estado inconsistente durante la transición
  - Posible fix: forzar re-render del hero al cambiar de evento (destruir/recrear con `*ngIf` o invalidar los estilos)
  > **Fix parcial**: Se cambió `[style.background]` por `[style.background-image]` en hero.component.ts — el shorthand `background` reseteaba `background-clip` al reasignarse. Con `background-image` el clip se preserva. Ahora al cambiar colores en el builder el texto siempre muestra el gradiente correctamente. El bug intermitente al cambiar de evento podría persistir (race condition de navegación).

### Mobile (dispositivo físico)

- [ ] **Parpadeo del canvas y panel de propiedades en Galería**: En dispositivo móvil físico (Samsung Galaxy S24 Ultra, Android Chrome y Samsung Browser), al estar en la sección Galería con fotos cargadas, el canvas y el panel de propiedades parpadean con cuadros negros de forma intermitente y repetitiva. El parpadeo ocurre:
  - Al expandir el acordeón "Fotos" en el panel de propiedades
  - Una vez que las fotos terminan de cargar en los thumbnails
  - Al colapsar y re-expandir el acordeón
  - NO ocurre en modo "Escritorio" del navegador mobile, solo en modo mobile real
  - NO se reproduce al grabar la pantalla del dispositivo
  
  **Diagnóstico avanzado (intentos realizados sin éxito completo)**:
  - CSS `contain: content/layout/strict` en acordeones, panel, photo-grid ❌
  - `will-change: transform`, `backface-visibility: hidden`, `transform: translateZ(0)` en panel ❌
  - `decoding="async"`, `loading="lazy"`, dimensiones fijas en thumbnails — redujo pero no eliminó ❌
  - Gallery en modo estático (`staticMode=true`, sin autoTimer) ❌
  - Fotos cacheadas (no usar signal directo) ❌
  - Reemplazar `position: fixed` por `position: absolute` en panel mobile ❌
  - Eliminar animación `slideInRight` (transform) ❌
  - `overscroll-behavior: contain` en panel ❌
  - `height: 100dvh` en host ❌
  - `max-height: 200px; overflow-y: auto` en photo-grid — redujo frecuencia ⚠️
  - Placeholder estático en vez de galería real — no resolvió (el problema es el panel, no el canvas) ⚠️
  
  **Causa raíz probable**: La barra de dirección del navegador mobile se auto-oculta/muestra al detectar cambios de contenido en un panel con scroll. Cuando el acordeón expande y el panel crece, el browser lo interpreta como actividad de scroll → oculta la barra → cambia viewport height → recalcula layout → muestra la barra → loop de repaint. Solo ocurre en viewport mobile real, no en "modo escritorio" del mismo dispositivo.
  
  **Estado**: Parcialmente mitigado (menos frecuente) pero no eliminado. Bug específico de Android/Chromium — NO ocurre en iOS Safari. Posibles siguientes pasos:
  - Investigar si un `<meta name="viewport" content="interactive-widget=resizes-content">` o `interactive-widget=overlays-content` resuelve
  - Probar con `env(safe-area-inset-*)` y viewport-fit=cover
  - Considerar no mostrar thumbnails en mobile y usar solo lista de nombres de archivo
  - Investigar si es un bug específico del WebView/Chromium de Samsung
  - Aceptar como limitación de Android Chromium y documentar para el usuario

- [ ] **iOS: Dimensiones incorrectas del Builder**: En iOS Safari, el builder no se adapta correctamente al viewport del dispositivo. Requiere hacer zoom out manual para ver el sitio completo. El contenido se renderiza más grande que la pantalla.

- [ ] **Toolbar Canvas/Preview oculto en mobile**: El segundo toolbar (con los botones Mobile/Desktop y Canvas/Preview) queda debajo del toolbar principal (Volver + Título + Guardar). No se puede acceder al botón de Preview en dispositivos móviles.

- [ ] **Background animado "brinca" al scrollear en mobile**: En el canvas y preview, la imagen de fondo (GIF/video) se mueve con el scroll y luego regresa a su posición, causando un efecto de "brinco" continuo. Ocurre porque `background-attachment: fixed` no funciona correctamente en mobile browsers. Solo afecta canvas y preview, no la landing real.
  > **Fix**: Se eliminó `background-attachment: fixed` del canvas.

- [x] **Canvas: delay en carga de imagenes de galeria** — las fotos cargan lento de forma progresiva. Se resolvió usando `loading="eager"` + `gallery_url` (600px) en modo `staticMode` (canvas del builder).
- [x] **Canvas: parpadeo al cambiar estilo de galeria (Polaroid/Mosaico)** — el parpadeo era causado por imágenes de 1920px que saturaban la GPU. Se resolvió con variantes `gallery_url` de 600px que reducen la memoria GPU de ~295MB a ~28MB.
- [x] **Canvas mobile: panel se abre automatico al tocar seccion** — ya estaba implementado el guard `isMobileView()` en `selectSection()` que previene auto-apertura del panel en mobile. Solo se abre con el FAB button.
- [x] **Canvas: no se puede interactuar con el carrusel** — pointer-events:none bloquea gestos. Esto es por diseño (click selecciona seccion), interaccion real solo en Preview.
- [x] **Landing/Preview: parpadeo en galería al scrollear o abrir lightbox (Android)** — Resuelto con variantes `gallery_url` (600px JPEG 75%) generadas en el backend. Las cards de galería usan la variante optimizada, el lightbox usa la imagen full (1920px, solo 1 a la vez). Memoria GPU reducida de ~295MB a ~28MB para 20 fotos.
- [ ] **Canvas: secciones se superponen** — el fondo wave/ondas de la sección siguiente (ej: Vestimenta) se sale y se superpone con la galería en el Canvas. En Preview/Landing se ve bien.
- [ ] **Canvas: decoradores de títulos no se muestran** — las líneas decorativas a los lados del título de sección no se renderizan en el Canvas (sí se ven en Preview/Landing).
- [ ] **Preview/Landing: textura de fondo (dots) no se aplica** — el Canvas muestra la textura de puntos del BG correctamente, pero en Preview y Landing no se renderiza.
- [x] **Desktop: Color Picker no se visualiza** — Resuelto: picker ahora se renderiza inline dentro del panel de propiedades con animación slideDown. Botón de copiar hex con transición morado→verde. Bicolor pickers homologados (todos verticales).
- [x] **Desktop: scrollbar extra en builder** — Resuelto: se bloquea `overflow: hidden` en body, html, `.page-content` y `.main-content` al abrir el builder. Se restaura al salir.
- [x] **Acordeones: solo uno abierto a la vez** — Al abrir un acordeón los demás se colapsan automáticamente. Animación slideDown suave (0.25s ease-out).
- [x] **Props panel auto-open solo en desktop** — `isMobileView()` ahora solo chequea `window.innerWidth <= 768` (antes requería touch + ancho).
- [ ] **Desktop: cards del dashboard se superponen** — en el dashboard principal, cuando la ventana está en fullscreen, las cards de eventos crecen y se superponen con los botones de acción debajo. Al reducir el tamaño de ventana se ven bien. No es causado por cambios en esta rama (no se tocó el dashboard).

---

## 19. Rediseño de Upload de Fotos (Galería + Vestimenta)

### Galería (máx. 20 fotos)

**Instrucciones visibles:**
- "Máx. 20 fotos, 10MB c/u"
- "Resolución recomendada: 1080×1350px (vertical) o 1920×1080px (horizontal)"
- "Formatos: JPG, PNG, WebP. Las fotos se suben en calidad original."

**Grid fijo de 20 slots:**
- Mostrar siempre 20 cuadros en un grid (ej: 4 columnas × 5 filas, o auto-fill)
- Cuadros con foto → thumbnail con borde sólido
- Cuadros vacíos → borde dashed + ícono de imagen + botón "+"
- Click en cuadro vacío → abre selector de archivos

**Selección para eliminar (mobile-friendly):**
- Tap/click en un thumbnail → lo selecciona (borde de color, checkmark overlay)
- Puede seleccionar múltiples fotos
- Cuando hay fotos seleccionadas: el botón "Subir" cambia a "Eliminar (N)"
- Cuando no hay selección: el botón vuelve a "Subir"
- En desktop: también funciona con hover + checkbox overlay

### Vestimenta (máx. 4 fotos por ejemplo)

**Grid fijo de 4 slots por cada card de ejemplo:**
- Mostrar siempre 4 cuadros horizontales por card
- Cuadros con imagen → thumbnail
- Cuadros vacíos → borde dashed + ícono "+"
- Misma lógica de selección para eliminar

**Instrucciones:**
- "Máx. 4 imágenes por ejemplo"
- "Formatos: JPG, PNG, WebP"

### Implementación

- El grid de slots se renderiza completo desde el inicio (20 o 4 según la sección)
- No hay layout shift al cargar fotos porque los slots ya existen
- El botón "+" de cada slot vacío dispara el upload
- Las fotos ocupan los primeros N slots, el resto queda como placeholder

**Estado: ✅ Implementado** — Galería usa `photo-slots-grid` con 20 slots fijos y selección múltiple. Vestimenta usa `dress-slots-grid` con 4 slots fijos por card, misma UX de selección tap-to-select + botón "Eliminar (N)".

---

## 20. Fix Parpadeo Galería en Android Mobile (Plan de Implementación)

### Problema

En dispositivos Android físicos (Samsung Galaxy S24 Ultra, Chrome y Samsung Browser), la galería produce cuadros negros intermitentes (flickering) al:
- Scrollear la landing page cuando la galería es visible
- Navegar entre fotos del carrusel
- Abrir el lightbox para ver una foto completa

**Afecta a todos los estilos**, pero es más notorio en Polaroid y Mosaico porque muestran TODAS las fotos simultáneamente.

**NO ocurre en:** desktop, modo "Escritorio" del browser mobile, iOS Safari, ni al grabar pantalla.

### Causa Raíz Identificada

El problema NO es solo CSS. Es una combinación de:

1. **Imágenes demasiado grandes en memoria GPU**: El backend redimensiona a máx 1920x1920 JPEG 80%. Una imagen de 1920×1920 ocupa ~14.7MB en RGBA decodificada. Con 20 fotos = **~295MB de texturas GPU** que Chromium Android tiene que mantener simultáneamente.

2. **Presión de memoria del compositor**: Cuando la GPU no puede mantener todas las texturas, Chromium recicla layers → aparecen cuadros negros momentáneos mientras re-rasteriza.

3. **Viewport dinámico de Android**: La barra de dirección auto-hide causa recálculos de layout que fuerzan re-composición de las texturas de imágenes.

4. **Lightbox agrava el problema**: Al abrir `position: fixed` con una imagen de 1920px, se agrega otra textura grande + cambio de overflow del body que causa relayout global.

### Solución: Variantes de Imagen Optimizadas

#### Backend: Generar variante `gallery_url` (~600px)

**Archivo:** `backend/src/routes/uploads.js`

Al subir fotos en la ruta `POST /uploads/photos/:eventId`, además del thumbnail (100x100) generar una variante para galería:

```javascript
// Variante galería: 600px, JPEG 75%
const galleryFilename = 'gallery_' + file.filename.replace(path.extname(file.filename), '.jpg');
const galleryPath = path.join(file.destination, galleryFilename);
sharp(file.path)
  .rotate()
  .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 75 })
  .toFile(galleryPath)
  .catch(() => {});
```

**Memoria GPU por variante:**
| Variante | Dimensiones | RGBA en GPU | 20 fotos |
|---|---|---|---|
| Original (actual) | 1920×1920 | ~14.7 MB | ~295 MB |
| Gallery (nueva) | 600×600 | ~1.4 MB | ~28 MB |
| Thumbnail (actual) | 100×100 | ~40 KB | ~800 KB |

#### Base de datos: Agregar columna `gallery_url`

```sql
ALTER TABLE photos ADD COLUMN gallery_url VARCHAR(500) AFTER thumb_url;
```

#### Frontend: Usar la variante correcta según contexto

**Archivo:** `frontend/src/app/landing/sections/gallery/gallery.component.ts`

| Contexto | URL a usar | Razón |
|---|---|---|
| Canvas del builder (staticMode) | `thumb_url` (100px) | Solo preview, no necesita calidad |
| Galería en landing/preview | `gallery_url` (600px) | Suficiente para cards de 140-300px |
| Lightbox (foto completa) | `url` (1920px) | Solo 1 imagen a la vez |

```html
<!-- En las cards de la galería (Polaroid, Grid, Carousel, etc.) -->
<img [src]="getDisplayUrl(photo)" ...>

<!-- En el lightbox -->
<img [src]="photos[lightboxIndex()!].url" ...>
```

```typescript
getDisplayUrl(photo: Photo): string {
  if (this.staticMode) return photo.thumb_url || photo.url;
  return photo.gallery_url || photo.url;
}
```

#### Modelo: Agregar `gallery_url` a la interfaz Photo

**Archivo:** `frontend/src/app/core/models/models.ts`

```typescript
export interface Photo {
  id: number;
  event_id: number;
  filename: string;
  url: string;
  thumb_url?: string;
  gallery_url?: string;  // <-- NUEVO
  sort_order: number;
}
```

### Migración de Fotos Existentes

Script para generar la variante gallery de las fotos que ya existen:

**Archivo:** `backend/src/migrations/generate-gallery-variants.js`

```javascript
// Recorre todas las fotos en la BD
// Para cada una: leer el archivo original → generar variante gallery_600px → actualizar gallery_url
// Ejecutar: node src/migrations/generate-gallery-variants.js
```

### Optimizaciones Adicionales (misma sesión)

#### 1. Dimensiones explícitas en imágenes

Agregar `width` y `height` a todas las `<img>` de la galería para evitar layout shift durante la carga:

```html
<!-- Polaroid cards: ~140px de ancho, aspect-ratio 1:1 -->
<img [src]="getDisplayUrl(photo)" width="140" height="140" ...>

<!-- Grid items: variable pero aspect-ratio 1:1 -->
<img [src]="getDisplayUrl(photo)" style="aspect-ratio:1" ...>

<!-- Carousel cards: 240×300 -->
<img [src]="getDisplayUrl(photo)" width="240" height="300" ...>
```

#### 2. Rotaciones estables en Polaroid

Verificar que `polaroidRotations` se calcula UNA sola vez en `ngOnInit` y no se recalcula en cada change detection. Actualmente ya se hace así — pero confirmar que no hay `Math.random()` en el template.

#### 3. Lightbox optimizado

- Usar imagen completa (`url` 1920px) SOLO para el lightbox
- No precargar la imagen full hasta que el usuario toque la foto
- Al cerrar el lightbox, liberar la referencia (Angular ya lo hace con `@if`)

#### 4. Carrusel: limitar imágenes decodificadas

Para estilos de carrusel (3D, Vertical, Coverflow, Stack), donde solo se ven 2-3 fotos a la vez, considerar usar `loading="lazy"` en las fotos lejanas (>3 posiciones del current). Con `gallery_url` de 600px esto ya debería ser suficiente, pero si persiste se puede agregar.

### Checklist de Implementación

- [x] SQL: `ALTER TABLE photos ADD COLUMN gallery_url VARCHAR(500) AFTER thumb_url`
- [x] Backend: generar `gallery_` al subir fotos nuevas (await para que estén listas antes de responder)
- [x] Backend: migración para fotos existentes (`generate-gallery-variants.js`)
- [x] Frontend modelo: agregar `gallery_url` a interfaz Photo
- [x] Frontend galería: usar `getDisplayUrl(photo)` en todos los estilos
- [x] Frontend lightbox: usa `photo.url` (full 1920px) — solo 1 imagen a la vez
- [x] Lightbox fullscreen: DOM portal en body, blur de fondo, swipe entre fotos, pinch-zoom, double-tap, mouse wheel zoom, drag pan, flechas desktop, keyboard nav
- [x] Lightbox en Vestimenta: misma funcionalidad al tocar imágenes de ejemplo
- [x] Loading spinners en slots durante upload de fotos
- [x] Carrusel Vertical: cards portrait (220x280), solo 3 visibles, dots laterales, sin contador
- [x] Estilo Flip: botón fullscreen para abrir lightbox sin interferir con el gesto de avance
- [x] Probar en Android físico: scroll, navegar carrusel, abrir/cerrar lightbox — ✅ SIN PARPADEO
- [x] Verificar que todos los estilos se ven correctos visualmente

### Pruebas en Dispositivo (Samsung Galaxy S24 Ultra) — ✅ COMPLETADAS

1. ✅ Scroll lento por la landing con galería en Polaroid → sin cuadros negros
2. ✅ Scroll rápido → sin cuadros negros
3. ✅ Cambiar a Mosaico → sin cuadros negros
4. ✅ Abrir lightbox → sin flickering en la página detrás
5. ✅ Cerrar lightbox → sin flickering
6. ✅ Carrusel 3D: navegar entre fotos → transiciones fluidas
7. ✅ Stack/Flip/Slideshow → sin parpadeo
8. ✅ Chrome modo escritorio → sigue funcionando (no regresión)
9. Pendiente: iOS Safari

### Notas Importantes

- **NO reemplazar Polaroid por Grid, ni usar Swiper.js** — el diseño visual actual es correcto
- **NO modificar propiedades CSS experimentales** sin evidencia de que resuelvan algo (ya se intentó `will-change`, `contain`, `backface-visibility`, etc. sin éxito)
- La solución fue **reducir el peso de las texturas GPU** (de ~295MB a ~28MB con gallery_url de 600px)
- El `LightboxService` es un servicio compartido reutilizable por cualquier componente que necesite visor de imágenes

---

*Última actualización: Agosto 2026*
