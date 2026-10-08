export interface Event {
  id: number;
  slug: string;
  name: string;
  event_type: string;
  event_date: string;
  active: number;
  event_mode?: 'private' | 'open';
  max_capacity?: number | null;
  total_guests?: number;
  confirmed_guests?: number;
  created_at?: string;
}

export interface Registration {
  id: number;
  event_id: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  created_at: string;
}

export interface RegistrationStatus {
  mode: 'private' | 'open';
  registered?: number;
  capacity?: number | null;
  full?: boolean;
}

export interface Guest {
  id: number;
  event_id: number;
  unique_code: string;
  guest_type: 'individual' | 'family';
  family_name: string;
  guest_names: string;
  max_companions: number;
  phone?: string;
  confirmed: number;
  confirmed_names?: string;
  confirmed_count?: number;
  confirmed_at?: string;
  invitation_sent?: number;
  sent_at?: string;
  notes?: string;
}

export interface EventConfig {
  envelope: EnvelopeConfig;
  intro: IntroConfig;
  hero: HeroConfig;
  invitation: InvitationConfig;
  details: DetailsConfig;
  venues: VenuesConfig;
  itinerary: ItineraryConfig;
  gallery: GalleryConfig;
  dresscode: DresscodeConfig;
  gifts: GiftsConfig;
  rsvp: RsvpConfig;
  globalStyles: GlobalTextStyles;
  theme: ThemeConfig;
  favicon?: string;
}

export interface ThemeConfig {
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textPrimaryFont?: string;
  textSecondary: string;
  textSecondaryFont?: string;
  navFooterText: string;
  navFooterFont?: string;
  buttonBg: string;
  buttonText: string;
  buttonFont?: string;
  // Landing background
  landingBgColor1?: string;
  landingBgColor2?: string;
  landingBgType?: 'solid' | 'linear' | 'radial' | 'mesh';
  landingBgAngle?: number;
  landingBgIntensity?: number;
  landingBgTexture?: 'none' | 'noise' | 'grain' | 'dots' | 'lines' | 'cross' | 'paper' | 'linen' | 'stars';
  landingBgTextureOpacity?: number;
  // Ajuste del fondo global en DESKTOP: 'cover' (pantalla completa) o 'banner' (columna angosta centrada,
  // ideal para imagenes verticales). En movil siempre se comporta como 'cover'.
  landingBgFit?: 'cover' | 'banner';
  landingBgBannerWidth?: number; // ancho del banner como % del ancho de la ventana (10-100), default 70
  // Scroll animation
  scrollAnimation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale' | 'none';
  // Navbar & Menu
  navBarBg1?: string;
  navBarBg2?: string;
  navBarBlur?: number;
  navBarOpacity?: number;
  navBarBorder?: string;
  navBtnBg?: string;
  navBtnBorder?: string;
  navBtnIcon?: string;
  navMenuBg?: string;
  navMenuText?: string;
  navMenuBlur?: number;
}

export interface SectionStyle {
  // Background
  bgType: 'inherit' | 'solid' | 'linear' | 'radial' | 'image';
  bgColor1?: string;
  bgColor2?: string;
  bgAngle?: number;
  bgIntensity?: number;
  bgImage?: string;
  bgOverlay?: number;
  /** Ajuste de la imagen de fondo en escritorio: 'cover' (pantalla completa) o 'banner' (columna centrada). */
  bgFit?: 'cover' | 'banner';
  /** Ancho de la columna banner en % del ancho (solo escritorio). */
  bgBannerWidth?: number;
  // Divider
  dividerType: 'none' | 'wave' | 'curve' | 'slant' | 'zigzag' | 'mountains' | 'drops' | 'arrow';
  dividerColor?: string;
  dividerFlip?: boolean;
  dividerHeight?: number;
  // Divider stroke (visible border along the transition edge)
  dividerStrokeColor?: string;
  dividerStrokeWidth?: number;   // 0-5px, default 0 (off)
  dividerStrokeOpacity?: number; // 0-1, default 1
  // Text override - Section Heading (H2)
  sectionHeadingColor?: string;
  sectionHeadingFont?: string;
  sectionHeadingSize?: number;
  // Text override - Titles (h3, internal card titles)
  headingColor?: string;
  headingColor2?: string;
  headingGradientAngle?: number;
  headingGradientIntensity?: number;
  headingFontWeight?: number;
  headingFontSize?: number;
  headingFont?: string;
  contentColor?: string;
  contentFontSize?: number;
  contentFont?: string;
  // Animation override (per section)
  animation?: 'inherit' | 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale' | 'none';
  // Heading ornament (per section)
  headingOrnament?: HeadingOrnament;
  // Spacing
  paddingTop?: number;
  paddingBottom?: number;
}

export interface HeadingOrnament {
  type: 'none' | 'line' | 'dots' | 'sparkles' | 'flourish' | 'dash' | 'arrows' | 'wave';
  position: 'above' | 'below' | 'both' | 'sides';
  color?: string;
  size?: number; // scale 0.5–2, default 1
}

export interface GlobalTextStyles {
  titleStyle: DetailTextStyle;
  subtitleStyle: DetailTextStyle;
  contentStyle: DetailTextStyle;
  sectionHeadingStyle: DetailTextStyle;
  separatorStyle: SeparatorStyle;
}

export interface SeparatorStyle {
  type: 'elegant' | 'formal' | 'executive' | 'festive' | 'animated' | 'minimal' | 'ornamental';
  color: string;
}

/** Posición relativa de un elemento dentro de su sección (centro del elemento, en %). */
export interface ElementPosition {
  x: number; // 0-100 (% del ancho de la sección)
  y: number; // 0-100 (% del alto de la sección)
  w?: number; // ancho del elemento en % del ancho de la sección (opcional)
  h?: number; // alto del elemento en % del alto de la sección (opcional)
}

/** Mapa de posiciones por dispositivo. key = id del elemento (ej: 'title', 'names'). */
export interface ElementPositions {
  desktop?: Record<string, ElementPosition>;
  mobile?: Record<string, ElementPosition>;
}

export interface EnvelopeConfig {
  enabled: boolean;
  template: 'envelope' | 'ticket' | 'minimal-splash' | 'plain';
  style: 'classic' | 'elegant' | 'vertical' | 'minimal' | 'wax';
  sealStyle: 'wax-circle' | 'wax-heart' | 'ribbon' | 'stamp' | 'monogram';
  envelopeColor: string;
  sealColor: string;
  sealText: string;
  sealImage: string;
  instructionText: string;
  instructionAnimation?: 'pulse' | 'bounce' | 'fade' | 'slide-up' | 'glow' | 'none';
  /** Color propio del texto de instruccion (independiente de textColor). Si no se define,
      hereda el comportamiento previo (textColor / default CSS). */
  instructionColor?: string;
  bgColor: string;
  bgColor2: string;
  textColor: string;
  // Ticket template
  ticketTitle?: string;
  ticketSubtitle?: string;
  ticketDate?: string;
  ticketAccentColor?: string;
  ticketBodyColor?: string;
  ticketTextColor?: string;
  // Minimal/Splash template
  splashTitle?: string;
  splashSubtitle?: string;
  splashImage?: string;
  splashButtonText?: string;
  // Ajuste de la imagen de fondo en DESKTOP: 'cover' (pantalla completa) o 'banner' (columna
  // angosta centrada, ideal para imagenes verticales). En movil siempre 'cover'.
  splashBgFit?: 'cover' | 'banner';
  splashBgBannerWidth?: number; // ancho del banner como % del ancho de la ventana (10-100), default 70
  // Plain template
  plainTitle?: string;
  plainSubtitle?: string;
  plainContent?: string;
  /** Posiciones personalizadas de los elementos del template Plano (title, subtitle, content, instruction). */
  plainPositions?: ElementPositions;
}

export interface IntroParticlesConfig {
  enabled: boolean;
  type: 'sparkles' | 'snow' | 'fireflies' | 'bubbles' | 'stars' | 'confetti';
  color1: string;
  color2: string;
  direction: 'up' | 'down' | 'left' | 'right';
  quantity: number;   // 5-80
  speed: number;      // 1-10
  size: number;       // 1-20
  opacity: number;    // 0.1-1
}

export interface IntroProgressBarConfig {
  /** Mostrar u ocultar la linea de carga. */
  enabled?: boolean;
  /** Color de la barra (sobrescribe el color del tema). */
  color?: string;
  /** Estilo visual de la linea. */
  style?: 'solid' | 'glow' | 'gradient' | 'dashed';
  /** Grosor en px (1-12). */
  thickness?: number;
  /** Ancho de la linea en px (80-400). */
  width?: number;
}

export interface IntroConfig {
  enabled: boolean;
  background: string;
  phrase: string;
  /** Contenido de la frase como HTML enriquecido (editor homologado). Si existe, manda
      sobre `phrase` + `phraseStyle`. Retrocompatible: configs viejos siguen usando `phrase`. */
  phraseHtml?: string;
  duration: number;
  videoStart?: number;
  videoEnd?: number;
  videoDuration?: number;
  useVideoDuration?: boolean;
  showSkip?: boolean;
  transition?: 'fade' | 'slide-up' | 'slide-down' | 'zoom-in' | 'zoom-out' | 'blur' | 'none';
  phraseStyle?: {
    fontFamily: string;
    fontSize: number;
    color: string;
    fontWeight?: number;
  };
  particles?: IntroParticlesConfig;
  /** Configuracion de la linea de carga (progress bar). */
  progressBar?: IntroProgressBarConfig;
  /** Posiciones personalizadas de los elementos de la intro (phrase). */
  positions?: ElementPositions;
}

export interface HeroTextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight?: number; // 100-900
}

export interface HeroGradientStyle {
  fontFamily: string;
  fontSize: number;
  color1: string;
  color2: string;
  gradientAngle: number;
  gradientIntensity?: number;
  fontWeight?: number;
}

export interface HeroConfig {
  backgroundGif: string;
  audioUrl: string;
  eventDescription: string;
  eventDescriptionStyle: HeroGradientStyle;
  celebrantNames: string;
  showCelebrantNames?: boolean;
  celebrantNamesStyle: HeroGradientStyle;
  heroPhrase: string;
  heroPhraseStyle: HeroTextStyle;
  showDescription?: boolean;
  description?: string;
  countdownDate: string;
  /** Mostrar u ocultar la cuenta regresiva. Por defecto visible si hay fecha. */
  showCountdown?: boolean;
  countdownShowCardBg?: boolean;
  countdownCardBorderRadius?: number;
  countdownCardBgOpacity?: number;
  countdownCardBgColor?: string;
  countdownCardBorderStyle?: string;
  countdownCardBorderWidth?: number;
  countdownCardBorderColor?: string;
  countdownCardGlowColor?: string;
  countdownCardShape?: string;
  /** Colores personalizados del texto de la cuenta regresiva. */
  countdownValueColor?: string;
  countdownLabelColor?: string;
  /** Posiciones personalizadas de los elementos de la caratula (eventType, names, description, phrase, countdown). */
  positions?: ElementPositions;
}

export interface InvitationConfig {
  title: string;
  subtitle: string;
  showCardBg?: boolean;
  cardBgOpacity?: number;
  cardBorderRadius?: number;
  sectionStyle?: SectionStyle;
  /** Colores propios de los chips de invitados y del contador de asistentes (independientes del tema). */
  guestChipBg?: string;
  guestChipText?: string;
  guestChipBorder?: string;
  countBg?: string;
  countText?: string;
  countBorder?: string;
}

export interface DetailsConfig {
  enabled: boolean;
  title: string;
  showCardBg?: boolean;
  cardBgOpacity?: number;
  cardBorderRadius?: number;
  cards: DetailCard[];
  sectionStyle?: SectionStyle;
}

export interface DetailTextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  color2?: string;
  gradientAngle?: number;
  gradientIntensity?: number;
  fontWeight?: number; // 100-900
}

export interface DetailCard {
  id: string;
  iconType: 'emoji' | 'image' | 'none';
  icon: string;
  iconUrl: string;
  title: string;
  content: string;
  textAlign: 'left' | 'center' | 'right';
  showCardBg?: boolean;
  cardBorderRadius?: number;
}

export interface VenuesConfig {
  enabled: boolean;
  iconStyle?: 'circle' | 'plain' | 'none';
  showCardBg?: boolean;
  cardBgOpacity?: number;
  cardBorderRadius?: number;
  items: VenueItem[];
  sectionStyle?: SectionStyle;
}

export interface VenueItem {
  id: string;
  title: string;
  icon: string;
  iconType?: 'emoji' | 'image' | 'none';
  iconEmoji?: string;
  name: string;
  address: string;
  time: string;
  mapsUrl: string;
  showCardBg?: boolean;
}

export interface ItineraryConfig {
  enabled: boolean;
  title: string;
  showCardBg?: boolean;
  cardBgOpacity?: number;
  cardBorderRadius?: number;
  showIcons?: boolean;
  titleFontSize?: number;
  descFontSize?: number;
  timeFontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  timelineAlign?: 'left' | 'center' | 'right';
  lineStyle?: 'solid' | 'beam' | 'wave' | 'zigzag' | 'none';
  lineColor?: string;
  dotBgColor?: string;
  dotBorderColor?: string;
  dotStyle?: 'diamond' | 'circle' | 'star' | 'none';
  items: ItineraryItem[];
  sectionStyle?: SectionStyle;
}

export interface ItineraryItem {
  id?: number;
  icon: string;
  iconType: 'emoji' | 'custom' | 'none';
  iconUrl?: string;
  time: string;
  title: string;
  description: string;
  sort_order: number;
  showCardBg?: boolean;
}

export interface GalleryConfig {
  enabled: boolean;
  title: string;
  description: string;
  displayStyle?: 'carousel-3d' | 'carousel-vertical' | 'stack' | 'coverflow' | 'flip' | 'polaroid' | 'grid' | 'slideshow';
  sectionStyle?: SectionStyle;
}

export interface SectionIconConfig {
  iconType: 'material' | 'emoji' | 'image' | 'none';
  icon: string;
  iconUrl: string;
}

export interface DresscodeCard {
  id: string;
  title: string;
  description: string;
  images: string[];  // URLs of dresscode example images
  showCardBg?: boolean;
  cardBorderRadius?: number;
}

export interface DresscodeConfig {
  enabled: boolean;
  title: string;
  description?: string;
  showCardBg?: boolean;
  cardBgOpacity?: number;
  cardBorderRadius?: number;
  sectionIcon?: SectionIconConfig;
  cards?: DresscodeCard[];
  sectionStyle?: SectionStyle;
}

export interface GiftsConfig {
  enabled: boolean;
  title: string;
  description: string;
  link: string;
  buttonText: string;
  showCardBg?: boolean;
  cardBgOpacity?: number;
  cardBorderRadius?: number;
  sectionIcon?: SectionIconConfig;
  transfer: TransferConfig;
  sectionStyle?: SectionStyle;
}

export interface TransferConfig {
  enabled: boolean;
  title: string;
  description: string;
  accountName: string;
  bank: string;
  accountType: 'tarjeta' | 'cuenta' | 'clabe';
  accountNumber: string;
  animation: 'coins' | 'bills' | 'none';
  showCardBg?: boolean;
  cardBorderRadius?: number;
  sectionIcon?: SectionIconConfig;
}

export interface RsvpConfig {
  enabled: boolean;
  title: string;
  showCardBg?: boolean;
  cardBgOpacity?: number;
  cardBorderRadius?: number;
  sectionIcon?: SectionIconConfig;
  registrationFields?: RegistrationFieldConfig[];
  sectionStyle?: SectionStyle;
}

export interface RegistrationFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'phone';
  enabled: boolean;
  required: boolean;
}

export interface KPIs {
  total_invitations: number;
  confirmed_invitations: number;
  pending_invitations: number;
  total_confirmed_guests: number;
  total_seats: number;
}

export interface LandingData {
  event: Event;
  config: EventConfig;
  itinerary: ItineraryItem[];
  photos: Photo[];
}

export interface Photo {
  id: number;
  event_id: number;
  filename: string;
  url: string;
  thumb_url?: string;
  gallery_url?: string;
  sort_order: number;
}

// Re-export canvas models for convenience
export * from './canvas.models';
