import { Injectable } from '@angular/core';
import { EventConfig } from '../../../../core/models/models';
import {
  EventConfigV2,
  CanvasElement,
  CanvasSectionData,
  TextCanvasElement,
  CountdownCanvasElement
} from '../../../../core/models/canvas.models';

/**
 * Migrates legacy V1 EventConfig to V2 format with canvas elements.
 * Each section's content is mapped to positioned elements with sensible defaults.
 * Migration is idempotent and lossless (original fields preserved).
 */
@Injectable({ providedIn: 'root' })
export class MigrationService {

  migrateConfig(config: EventConfig): EventConfigV2 {
    // Already V2? Ensure defaults and return
    if ((config as EventConfigV2)._version === 2) {
      return this.ensureDefaults(config as EventConfigV2);
    }

    const migrated = { ...config, _version: 2 } as EventConfigV2;

    try { migrated.hero = { ...config.hero, canvas: this.buildHeroCanvas(config) }; } catch (e) { console.warn('[Migration] Hero failed:', e); }
    try { migrated.invitation = { ...config.invitation, canvas: this.buildInvitationCanvas(config) }; } catch (e) { console.warn('[Migration] Invitation failed:', e); }

    if (config.details?.enabled) {
      try { migrated.details = { ...config.details, canvas: this.buildDetailsCanvas(config) }; } catch (e) { console.warn('[Migration] Details failed:', e); }
    }
    if (config.venues?.enabled) {
      try { migrated.venues = { ...config.venues, canvas: this.buildVenuesCanvas(config) }; } catch (e) { console.warn('[Migration] Venues failed:', e); }
    }
    if (config.itinerary?.enabled) {
      try { migrated.itinerary = { ...config.itinerary, canvas: this.buildGenericCanvas('itinerary', config.itinerary.title, 50) }; } catch (e) {} 
    }
    if (config.gallery?.enabled) {
      try { migrated.gallery = { ...config.gallery, canvas: this.buildGalleryCanvas(config) }; } catch (e) {} 
    }
    if (config.dresscode?.enabled) {
      try { migrated.dresscode = { ...config.dresscode, canvas: this.buildGenericCanvas('dresscode-block', config.dresscode.title, 45) }; } catch (e) {} 
    }
    if (config.gifts?.enabled) {
      try { migrated.gifts = { ...config.gifts, canvas: this.buildGiftsCanvas(config) }; } catch (e) {} 
    }
    if (config.rsvp?.enabled) {
      try { migrated.rsvp = { ...config.rsvp, canvas: this.buildGenericCanvas('rsvp-form', config.rsvp.title, 40) }; } catch (e) {} 
    }

    return this.ensureDefaults(migrated);
  }

  /** Migrate a single section (user-triggered) */
  migrateSection(config: EventConfigV2, sectionKey: string): EventConfigV2 {
    const updated = { ...config };
    switch (sectionKey) {
      case 'hero': updated.hero = { ...config.hero, canvas: this.buildHeroCanvas(config) }; break;
      case 'invitation': updated.invitation = { ...config.invitation, canvas: this.buildInvitationCanvas(config) }; break;
      case 'details': updated.details = { ...config.details, canvas: this.buildDetailsCanvas(config) }; break;
      case 'venues': updated.venues = { ...config.venues, canvas: this.buildVenuesCanvas(config) }; break;
      case 'gallery': updated.gallery = { ...config.gallery, canvas: this.buildGalleryCanvas(config) }; break;
      case 'gifts': updated.gifts = { ...config.gifts, canvas: this.buildGiftsCanvas(config) }; break;
      case 'itinerary': updated.itinerary = { ...config.itinerary, canvas: this.buildGenericCanvas('itinerary', config.itinerary.title, 50) }; break;
      case 'dresscode': updated.dresscode = { ...config.dresscode, canvas: this.buildGenericCanvas('dresscode-block', config.dresscode.title, 45) }; break;
      case 'rsvp': updated.rsvp = { ...config.rsvp, canvas: this.buildGenericCanvas('rsvp-form', config.rsvp.title, 40) }; break;
    }
    return updated;
  }

  // ===== Ensure Defaults =====

  /**
   * Ensures all required sub-properties have sensible defaults.
   * This prevents "Cannot read properties of undefined" errors when
   * landing components access nested config properties.
   */
  private ensureDefaults(config: EventConfigV2): EventConfigV2 {
    // Hero: ensure style objects exist
    if (!config.hero) {
      config.hero = {
        backgroundGif: '', audioUrl: '', eventDescription: '', celebrantNames: '',
        heroPhrase: '', countdownDate: '',
        eventDescriptionStyle: { fontFamily: 'sans', fontSize: 22, color1: '#ffffff', color2: '', gradientAngle: 0 },
        celebrantNamesStyle: { fontFamily: 'script', fontSize: 80, color1: '#d4a017', color2: '#b8860b', gradientAngle: 0 },
        heroPhraseStyle: { fontFamily: 'serif', fontSize: 16, color: '#ffffff' }
      } as any;
    } else {
      if (!config.hero.eventDescriptionStyle) {
        config.hero.eventDescriptionStyle = { fontFamily: 'sans', fontSize: 22, color1: '#ffffff', color2: '', gradientAngle: 0 };
      }
      if (!config.hero.celebrantNamesStyle) {
        config.hero.celebrantNamesStyle = { fontFamily: 'script', fontSize: 80, color1: '#d4a017', color2: '#b8860b', gradientAngle: 0 };
      }
      if (!config.hero.heroPhraseStyle) {
        config.hero.heroPhraseStyle = { fontFamily: 'serif', fontSize: 16, color: '#ffffff' };
      }
    }

    // Invitation: ensure exists
    if (!config.invitation) {
      config.invitation = { title: '', subtitle: '' } as any;
    }

    // Envelope: ensure exists
    if (!config.envelope) {
      config.envelope = {
        enabled: false, template: 'envelope', style: 'classic', sealStyle: 'wax-circle',
        envelopeColor: '#1a1a2e', sealColor: '#d4a017', sealText: '', sealImage: '',
        instructionText: 'Desliza para abrir', bgColor: '#0d1117', bgColor2: '#1a1a2e', textColor: '#ffffff'
      } as any;
    }

    // Intro: ensure exists
    if (!config.intro) {
      config.intro = {
        enabled: false, background: '', phrase: '', duration: 5
      } as any;
    }

    // Details: ensure exists
    if (!config.details) {
      config.details = { enabled: false, title: 'Detalles', cards: [] } as any;
    }
    if (!config.details.cards) config.details.cards = [];

    // Venues: ensure exists
    if (!config.venues) {
      config.venues = { enabled: false, items: [] } as any;
    }
    if (!config.venues.items) config.venues.items = [];

    // Itinerary: ensure exists
    if (!config.itinerary) {
      config.itinerary = { enabled: false, title: 'Itinerario', items: [] } as any;
    }
    if (!config.itinerary.items) config.itinerary.items = [];

    // Gallery: ensure exists
    if (!config.gallery) {
      config.gallery = { enabled: false, title: 'Galería', description: '' } as any;
    }

    // Dresscode: ensure exists
    if (!config.dresscode) {
      config.dresscode = { enabled: false, title: 'Código de Vestimenta', cards: [] } as any;
    }
    if (!config.dresscode.cards) config.dresscode.cards = [];

    // Gifts: ensure exists WITH transfer sub-object
    if (!config.gifts) {
      config.gifts = {
        enabled: false, title: 'Regalos', description: '', link: '', buttonText: 'Ver Lista',
        transfer: { enabled: false, title: '', description: '', accountName: '', bank: '', accountType: 'cuenta', accountNumber: '', animation: 'none' }
      } as any;
    } else if (!config.gifts.transfer) {
      config.gifts.transfer = { enabled: false, title: '', description: '', accountName: '', bank: '', accountType: 'cuenta', accountNumber: '', animation: 'none' };
    }

    // RSVP: ensure exists
    if (!config.rsvp) {
      config.rsvp = { enabled: false, title: 'Confirmación' } as any;
    }

    // GlobalStyles: ensure exists
    if (!config.globalStyles) {
      config.globalStyles = {
        titleStyle: { fontFamily: 'script', fontSize: 36, color: '#d4a017' },
        subtitleStyle: { fontFamily: 'serif', fontSize: 18, color: '#ffffff' },
        contentStyle: { fontFamily: 'sans', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
        sectionHeadingStyle: { fontFamily: 'script', fontSize: 32, color: '#d4a017' },
        separatorStyle: { type: 'elegant', color: '#d4a017' }
      } as any;
    }

    // Theme: ensure exists
    if (!config.theme) {
      config.theme = {
        cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(212,160,23,0.3)',
        textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.7)',
        navFooterText: '#d4a017', buttonBg: '#d4a017', buttonText: '#1a1a2e'
      };
    }

    return config;
  }

  // ===== Section Builders =====

  private buildHeroCanvas(config: EventConfig): CanvasSectionData {
    const hero = config.hero;
    const elements: CanvasElement[] = [];
    let z = 1;

    // Event description
    if (hero.eventDescription) {
      elements.push({
        id: this.id(), type: 'text', x: 10, y: 20, width: 80, height: 12, zIndex: z++,
        content: hero.eventDescription,
        fontSize: hero.eventDescriptionStyle?.fontSize || 18,
        color: hero.eventDescriptionStyle?.color1 || '#ffffff',
        textAlign: 'center'
      } as TextCanvasElement);
    }

    // Celebrant names
    if (hero.celebrantNames && hero.showCelebrantNames !== false) {
      elements.push({
        id: this.id(), type: 'text', x: 5, y: 35, width: 90, height: 20, zIndex: z++,
        content: hero.celebrantNames,
        fontSize: hero.celebrantNamesStyle?.fontSize || 48,
        fontFamily: hero.celebrantNamesStyle?.fontFamily,
        color: hero.celebrantNamesStyle?.color1 || '#ffffff',
        textAlign: 'center'
      } as TextCanvasElement);
    }

    // Hero phrase
    if (hero.heroPhrase) {
      elements.push({
        id: this.id(), type: 'text', x: 15, y: 58, width: 70, height: 10, zIndex: z++,
        content: hero.heroPhrase,
        fontSize: hero.heroPhraseStyle?.fontSize || 16,
        color: hero.heroPhraseStyle?.color || 'rgba(255,255,255,0.7)',
        textAlign: 'center'
      } as TextCanvasElement);
    }

    // Countdown
    if (hero.countdownDate) {
      elements.push({
        id: this.id(), type: 'countdown', x: 15, y: 72, width: 70, height: 18, zIndex: z++,
        targetDate: hero.countdownDate,
        showCardBg: hero.countdownShowCardBg
      } as CountdownCanvasElement);
    }

    return { version: 2, minHeight: 100, elements };
  }

  private buildInvitationCanvas(config: EventConfig): CanvasSectionData {
    const inv = config.invitation;
    const elements: CanvasElement[] = [];
    let z = 1;

    elements.push({
      id: this.id(), type: 'text', x: 10, y: 10, width: 80, height: 15, zIndex: z++,
      content: inv.title || 'Están cordialmente invitados',
      fontSize: 36, textAlign: 'center', color: '#d4a017'
    } as TextCanvasElement);

    if (inv.subtitle) {
      elements.push({
        id: this.id(), type: 'text', x: 10, y: 30, width: 80, height: 20, zIndex: z++,
        content: inv.subtitle,
        fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.7)'
      } as TextCanvasElement);
    }

    return { version: 2, minHeight: 60, elements };
  }

  private buildDetailsCanvas(config: EventConfig): CanvasSectionData {
    const det = config.details;
    const elements: CanvasElement[] = [];
    let z = 1;

    elements.push({
      id: this.id(), type: 'text', x: 20, y: 5, width: 60, height: 10, zIndex: z++,
      content: det.title || 'Detalles',
      fontSize: 32, textAlign: 'center'
    } as TextCanvasElement);

    // Reference existing cards — don't duplicate data
    elements.push({
      id: this.id(), type: 'detail-cards', x: 5, y: 20, width: 90, height: 70, zIndex: z++,
      layout: 'grid', showCardBg: det.showCardBg, cardBorderRadius: det.cardBorderRadius
    } as any);

    return { version: 2, minHeight: 60, elements };
  }

  private buildVenuesCanvas(config: EventConfig): CanvasSectionData {
    const ven = config.venues;
    const elements: CanvasElement[] = [];
    let z = 1;

    // Reference existing items — don't duplicate data
    elements.push({
      id: this.id(), type: 'venue-cards', x: 5, y: 5, width: 90, height: 85, zIndex: z++,
      iconStyle: ven.iconStyle, showCardBg: ven.showCardBg, cardBorderRadius: ven.cardBorderRadius
    } as any);

    return { version: 2, minHeight: 50, elements };
  }

  private buildGalleryCanvas(config: EventConfig): CanvasSectionData {
    const gal = config.gallery;
    const elements: CanvasElement[] = [];
    let z = 1;

    if (gal.title) {
      elements.push({
        id: this.id(), type: 'text', x: 20, y: 3, width: 60, height: 10, zIndex: z++,
        content: gal.title, fontSize: 32, textAlign: 'center'
      } as TextCanvasElement);
    }

    // Reference — photos come from config.gallery + photos table, not duplicated
    elements.push({
      id: this.id(), type: 'gallery', x: 5, y: 15, width: 90, height: 75, zIndex: z++,
      displayStyle: gal.displayStyle || 'carousel-3d'
    } as any);

    return { version: 2, minHeight: 55, elements };
  }

  private buildGiftsCanvas(config: EventConfig): CanvasSectionData {
    const gifts = config.gifts;
    const elements: CanvasElement[] = [];
    let z = 1;

    elements.push({
      id: this.id(), type: 'text', x: 15, y: 5, width: 70, height: 10, zIndex: z++,
      content: gifts.title || 'Regalos', fontSize: 32, textAlign: 'center'
    } as TextCanvasElement);

    // Reference — data comes from config.gifts directly
    elements.push({
      id: this.id(), type: 'gifts-block', x: 10, y: 20, width: 80, height: 70, zIndex: z++,
    } as any);

    return { version: 2, minHeight: 45, elements };
  }

  private buildGenericCanvas(type: string, title: string, minHeight: number): CanvasSectionData {
    const elements: CanvasElement[] = [];
    let z = 1;

    if (title) {
      elements.push({
        id: this.id(), type: 'text', x: 20, y: 5, width: 60, height: 10, zIndex: z++,
        content: title, fontSize: 32, textAlign: 'center'
      } as TextCanvasElement);
    }

    elements.push({
      id: this.id(), type, x: 5, y: 18, width: 90, height: 75, zIndex: z++,
    } as any);

    return { version: 2, minHeight, elements };
  }

  private id(): string {
    return crypto.randomUUID();
  }
}
