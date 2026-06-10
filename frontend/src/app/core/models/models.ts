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
  confirmed: number;
  confirmed_names?: string;
  confirmed_count?: number;
  confirmed_at?: string;
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
  // Scroll animation
  scrollAnimation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale' | 'none';
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
  // Divider
  dividerType: 'none' | 'wave' | 'curve' | 'slant' | 'zigzag' | 'mountains' | 'drops' | 'arrow';
  dividerColor?: string;
  dividerFlip?: boolean;
  dividerHeight?: number;
  // Text override
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
  // Spacing
  paddingTop?: number;
  paddingBottom?: number;
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
  // Plain template
  plainTitle?: string;
  plainSubtitle?: string;
  plainContent?: string;
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

export interface IntroConfig {
  enabled: boolean;
  background: string;
  phrase: string;
  duration: number;
  videoStart?: number;
  videoEnd?: number;
  videoDuration?: number;
  phraseStyle?: {
    fontFamily: string;
    fontSize: number;
    color: string;
    fontWeight?: number;
  };
  particles?: IntroParticlesConfig;
}

export interface HeroTextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
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
  countdownShowCardBg?: boolean;
  countdownCardBorderRadius?: number;
}

export interface InvitationConfig {
  title: string;
  subtitle: string;
  showCardBg?: boolean;
  cardBorderRadius?: number;
  sectionStyle?: SectionStyle;
}

export interface DetailsConfig {
  enabled: boolean;
  title: string;
  showCardBg?: boolean;
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
  cardBorderRadius?: number;
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
  sort_order: number;
}
