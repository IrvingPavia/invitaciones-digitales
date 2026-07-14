/**
 * Canvas Models — Builder Free Position System
 * 
 * These interfaces define the data model for the free-position canvas editor.
 * Elements within sections are positioned using percentage-based coordinates.
 */

// ===== Base Types =====

export type CanvasElementType =
  | 'text'
  | 'image'
  | 'icon'
  | 'decorator'
  | 'countdown'
  | 'gallery'
  | 'detail-cards'
  | 'venue-cards'
  | 'itinerary'
  | 'rsvp-form'
  | 'gifts-block'
  | 'dresscode-block'
  | 'separator'
  | 'spacer';

export interface ResponsiveOverride {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  visible?: boolean;
}

export interface SnapGuides {
  vertical: number | null;   // x% position for vertical guide line
  horizontal: number | null; // y% position for horizontal guide line
}

// ===== Base Canvas Element =====

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;           // Left position (0-100%)
  y: number;           // Top position (0-100%)
  width: number;       // Width (5-100%)
  height: number;      // Height (5-100%)
  zIndex: number;      // Stacking order within section
  locked?: boolean;    // Prevent accidental moves
  visible?: boolean;   // Hide without deleting (default true)
  mobileOverride?: ResponsiveOverride;
}

// ===== Type-Specific Elements =====

export interface TextCanvasElement extends CanvasElement {
  type: 'text';
  content: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  color2?: string;               // For gradient text
  gradientAngle?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export interface ImageCanvasElement extends CanvasElement {
  type: 'image';
  imageUrl: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  borderRadius?: number;
  opacity?: number;
}

export interface IconCanvasElement extends CanvasElement {
  type: 'icon';
  iconType: 'emoji' | 'material' | 'image';
  icon: string;
  iconColor?: string;
  iconSize?: number;
}

export interface DecoratorCanvasElement extends CanvasElement {
  type: 'decorator';
  decoratorType: 'flourish' | 'line' | 'dots' | 'sparkles' | 'wave' | 'custom';
  decoratorUrl?: string;
  color?: string;
  opacity?: number;
  rotation?: number;
}

export interface CountdownCanvasElement extends CanvasElement {
  type: 'countdown';
  targetDate: string;
  showCardBg?: boolean;
  cardBorderRadius?: number;
  labelColor?: string;
  valueColor?: string;
  valueFont?: string;
}

export interface GalleryCanvasElement extends CanvasElement {
  type: 'gallery';
  displayStyle: 'carousel-3d' | 'carousel-vertical' | 'stack' | 'coverflow' | 'flip' | 'polaroid' | 'grid' | 'slideshow';
  title?: string;
  description?: string;
}

export interface DetailCardsCanvasElement extends CanvasElement {
  type: 'detail-cards';
  cards: any[];    // Uses existing DetailCard interface from models.ts
  layout: 'grid' | 'list' | 'free';
  showCardBg?: boolean;
  cardBorderRadius?: number;
}

export interface VenueCardsCanvasElement extends CanvasElement {
  type: 'venue-cards';
  items: any[];    // Uses existing VenueItem interface from models.ts
  iconStyle?: 'circle' | 'plain' | 'none';
  showCardBg?: boolean;
}

export interface ItineraryCanvasElement extends CanvasElement {
  type: 'itinerary';
  title?: string;
  showCardBg?: boolean;
}

export interface RsvpFormCanvasElement extends CanvasElement {
  type: 'rsvp-form';
  title?: string;
  showCardBg?: boolean;
}

export interface GiftsBlockCanvasElement extends CanvasElement {
  type: 'gifts-block';
  title?: string;
  description?: string;
}

export interface DresscodeBlockCanvasElement extends CanvasElement {
  type: 'dresscode-block';
  title?: string;
}

export interface SeparatorCanvasElement extends CanvasElement {
  type: 'separator';
  separatorStyle?: 'line' | 'dots' | 'flourish' | 'wave';
  color?: string;
}

export interface SpacerCanvasElement extends CanvasElement {
  type: 'spacer';
}

// ===== Canvas Section Config =====

export interface CanvasSectionData {
  version: 2;
  minHeight: number;             // Minimum section height in vh units
  elements: CanvasElement[];
}

// ===== Event Config V2 =====

import { EventConfig, SectionStyle } from './models';

/**
 * Extended EventConfig with optional canvas data per section.
 * Backward-compatible: sections without 'canvas' key render using legacy components.
 */
export interface EventConfigV2 extends EventConfig {
  _version?: 2;
  hero: EventConfig['hero'] & { canvas?: CanvasSectionData };
  invitation: EventConfig['invitation'] & { canvas?: CanvasSectionData };
  details: EventConfig['details'] & { canvas?: CanvasSectionData };
  venues: EventConfig['venues'] & { canvas?: CanvasSectionData };
  itinerary: EventConfig['itinerary'] & { canvas?: CanvasSectionData };
  gallery: EventConfig['gallery'] & { canvas?: CanvasSectionData };
  dresscode: EventConfig['dresscode'] & { canvas?: CanvasSectionData };
  gifts: EventConfig['gifts'] & { canvas?: CanvasSectionData };
  rsvp: EventConfig['rsvp'] & { canvas?: CanvasSectionData };
}

// ===== Utility Types =====

export type AnyCanvasElement =
  | TextCanvasElement
  | ImageCanvasElement
  | IconCanvasElement
  | DecoratorCanvasElement
  | CountdownCanvasElement
  | GalleryCanvasElement
  | DetailCardsCanvasElement
  | VenueCardsCanvasElement
  | ItineraryCanvasElement
  | RsvpFormCanvasElement
  | GiftsBlockCanvasElement
  | DresscodeBlockCanvasElement
  | SeparatorCanvasElement
  | SpacerCanvasElement;

/** Default element dimensions for new elements */
export const ELEMENT_DEFAULTS: Record<CanvasElementType, { width: number; height: number }> = {
  'text': { width: 60, height: 12 },
  'image': { width: 40, height: 30 },
  'icon': { width: 10, height: 10 },
  'decorator': { width: 30, height: 8 },
  'countdown': { width: 70, height: 18 },
  'gallery': { width: 90, height: 50 },
  'detail-cards': { width: 90, height: 40 },
  'venue-cards': { width: 90, height: 40 },
  'itinerary': { width: 85, height: 45 },
  'rsvp-form': { width: 80, height: 35 },
  'gifts-block': { width: 80, height: 30 },
  'dresscode-block': { width: 85, height: 35 },
  'separator': { width: 60, height: 5 },
  'spacer': { width: 100, height: 10 },
};
