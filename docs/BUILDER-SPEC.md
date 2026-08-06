# 📋 BUILDER-SPEC — Análisis Comparativo Configurador vs Builder

> Documento de especificación exhaustivo que mapea TODAS las propiedades configurables de la landing,
> comparando lo que existe en el Configurador antiguo vs lo implementado en el Builder visual.
> Sirve como guía para cerrar brechas y completar la migración al Builder.

---

## Resumen Ejecutivo

| Área | Configurador | Builder | Estado |
|------|:---:|:---:|--------|
| Tema Global (colores) | ✅ | ✅ | Completo + mejoras |
| Tema Global (fuentes por color) | ✅ | ❌ | FALTA |
| Estilos Globales (headings/titles/content) | ✅ | ✅ | Completo |
| Fondo Landing | ✅ | ⚠️ | Parcial (falta angle/intensity) |
| Navbar & Menu | ❌ | ✅ | Solo en Builder |
| Animación Scroll | ✅ | ✅ | Completo |
| Favicon | ✅ | ❌ | FALTA |
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
| RSVP/Confirmación | ✅ | ⚠️ | Parcial (falta sectionIcon, regFields) |
| Estilo por Sección (SectionStyle) | ✅ | ⚠️ | Simplificado en Builder |
| Adornos de Título (HeadingOrnament) | ✅ | ❌ | FALTA en Builder |
| Presets de Sección | ✅ | ❌ | FALTA en Builder |


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
| `dividerStrokeColor` | ✅ | ❌ | **FALTA** en Builder |
| `dividerStrokeWidth` (range 0-5) | ✅ | ❌ | **FALTA** en Builder |
| `dividerStrokeOpacity` (range 0-1) | ✅ | ❌ | **FALTA** en Builder |

### 13.3 Override de Texto

| Propiedad | Configurador | Builder | Notas |
|-----------|:---:|:---:|-------|
| `sectionHeadingFont` | ✅ | ❌ | **FALTA** |
| `sectionHeadingSize` | ✅ | ❌ | **FALTA** |
| `sectionHeadingColor` | ✅ | ✅ (como "Titulos") | — |
| `headingFont` | ✅ | ❌ | **FALTA** |
| `headingFontSize` | ✅ | ❌ | **FALTA** |
| `headingColor` (Color 1) | ✅ | ✅ | — |
| `headingColor2` (Color 2) | ✅ | ❌ | **FALTA** |
| `headingGradientAngle` | ✅ | ❌ | **FALTA** |
| `headingGradientIntensity` | ✅ | ❌ | **FALTA** |
| `headingFontWeight` | ✅ | ❌ | **FALTA** |
| `contentFont` | ✅ | ❌ | **FALTA** |
| `contentFontSize` | ✅ | ❌ | **FALTA** |
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

- [ ] **Parpadeo del canvas y panel de propiedades en Galería**: En dispositivo móvil físico (Android Chrome), al estar en la sección Galería con fotos cargadas, el canvas y el panel de propiedades parpadean de forma intermitente y repetitiva. El parpadeo ocurre:
  - Al cargar/subir imágenes nuevas
  - Al hacer scroll por el canvas cuando la galería tiene fotos
  - Es un parpadeo rápido que alterna entre el estado normal (canvas + panel visibles) y un estado donde el panel de propiedades colapsa y el canvas se redimensiona momentáneamente
  
  **Observaciones**: El bug no se reproduce al grabar la pantalla del dispositivo. Solo se percibe visualmente en uso directo. En la segunda captura se aprecia que el acordeón "Fotos" desaparece momentáneamente y el canvas ocupa más espacio, como si el panel se ocultara y volviera a aparecer.
  
  **Posible causa**: Podría ser un re-render excesivo provocado por el `lazy loading` de las imágenes de la galería que dispara eventos de resize/layout shift al cargar cada imagen, causando que Angular recalcule el layout del flex container (canvas + panel). Otra posibilidad: las señales (signals) del `photos()` se actualizan repetidamente provocando change detection cycles que redibujan el panel.

---

*Última actualización: Agosto 2026*
