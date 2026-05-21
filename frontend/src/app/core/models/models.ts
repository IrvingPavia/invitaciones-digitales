export interface Event {
  id: number;
  slug: string;
  name: string;
  event_type: string;
  event_date: string;
  active: number;
  total_guests?: number;
  confirmed_guests?: number;
  created_at?: string;
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

export interface IntroConfig {
  enabled: boolean;
  background: string;
  phrase: string;
  duration: number;
  phraseStyle?: {
    fontFamily: string;
    fontSize: number;
    color: string;
    fontWeight?: number;
  };
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
  celebrantNamesStyle: HeroGradientStyle;
  heroPhrase: string;
  heroPhraseStyle: HeroTextStyle;
  countdownDate: string;
}

export interface InvitationConfig {
  title: string;
  subtitle: string;
}

export interface DetailsConfig {
  enabled: boolean;
  title: string;
  cards: DetailCard[];
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
  iconType: 'emoji' | 'image';
  icon: string;
  iconUrl: string;
  title: string;
  content: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface VenuesConfig {
  enabled: boolean;
  items: VenueItem[];
}

export interface VenueItem {
  id: string;
  title: string;
  icon: string;
  name: string;
  address: string;
  time: string;
  mapsUrl: string;
}

export interface ItineraryConfig {
  enabled: boolean;
  title: string;
  items: ItineraryItem[];
}

export interface ItineraryItem {
  id?: number;
  icon: string;
  iconType: 'emoji' | 'custom';
  iconUrl?: string;
  time: string;
  title: string;
  description: string;
  sort_order: number;
}

export interface GalleryConfig {
  enabled: boolean;
  title: string;
  description: string;
}

export interface DresscodeConfig {
  enabled: boolean;
  title: string;
  description: string;
}

export interface GiftsConfig {
  enabled: boolean;
  title: string;
  description: string;
  link: string;
  buttonText: string;
  transfer: TransferConfig;
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
}

export interface RsvpConfig {
  enabled: boolean;
  title: string;
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
