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
}

export interface IntroConfig {
  enabled: boolean;
  background: string;
  phrase: string;
  duration: number;
}

export interface HeroTextStyle {
  fontFamily: 'serif' | 'sans' | 'script';
  fontSize: number;
  color: string;
}

export interface HeroGradientStyle {
  fontFamily: 'serif' | 'sans' | 'script';
  fontSize: number;
  color1: string;
  color2: string;
  gradientAngle: number;
}

export interface HeroConfig {
  backgroundGif: string;
  audioUrl: string;
  eventDescription: string;
  eventDescriptionStyle: HeroTextStyle;
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
  titleStyle: DetailTextStyle;
  contentStyle: DetailTextStyle;
  cards: DetailCard[];
}

export interface DetailTextStyle {
  fontFamily: 'serif' | 'sans' | 'script';
  fontSize: number;
  color: string;
}

export interface DetailCard {
  id: string;
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
