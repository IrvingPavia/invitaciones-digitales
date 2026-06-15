import { Component, inject, OnInit, OnDestroy, signal, HostListener, AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { LandingData, Guest } from '../core/models/models';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private observer!: IntersectionObserver;
  @Input() appScrollReveal: string = 'fade-up';

  ngOnInit() {
    const anim = this.appScrollReveal || 'fade-up';
    if (anim === 'none') return; // no animation
    this.el.nativeElement.classList.add('scroll-hidden', `scroll-anim-${anim}`);
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.el.nativeElement.classList.add('scroll-visible');
        this.observer.unobserve(this.el.nativeElement);
      }
    }, { threshold: 0.1 });
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}

@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyImgDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private observer!: IntersectionObserver;

  ngOnInit() {
    const img = this.el.nativeElement as HTMLImageElement;
    const src = img.getAttribute('src');
    if (!src) return;

    // Move src to data-src and clear src
    img.setAttribute('data-src', src);
    img.removeAttribute('src');
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const realSrc = img.getAttribute('data-src');
        if (realSrc) {
          img.src = realSrc;
          img.onload = () => { img.style.opacity = '1'; };
          img.onerror = () => { img.style.opacity = '1'; };
        }
        this.observer.unobserve(img);
      }
    }, { rootMargin: '200px' }); // Start loading 200px before visible
    this.observer.observe(img);
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}
import { LandingIntroComponent } from './sections/intro/intro.component';
import { LandingEnvelopeComponent } from './sections/envelope/envelope.component';
import { LandingHeroComponent } from './sections/hero/hero.component';
import { LandingInvitationComponent } from './sections/invitation/invitation.component';
import { LandingDetailsComponent } from './sections/details/details.component';
import { LandingVenuesComponent } from './sections/venues/venues.component';
import { LandingItineraryComponent } from './sections/itinerary/itinerary.component';
import { LandingGalleryComponent } from './sections/gallery/gallery.component';
import { LandingDresscodeComponent } from './sections/dresscode/dresscode.component';
import { LandingGiftsComponent } from './sections/gifts/gifts.component';
import { LandingRsvpComponent } from './sections/rsvp/rsvp.component';
import { LandingRegisterComponent } from './sections/register/register.component';
import { SectionDividerComponent } from './components/section-divider.component';
import { SectionStyle } from '../core/models/models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, ScrollRevealDirective, LazyImgDirective, SectionDividerComponent,
    LandingEnvelopeComponent, LandingIntroComponent, LandingHeroComponent, LandingInvitationComponent,
    LandingDetailsComponent, LandingVenuesComponent, LandingItineraryComponent, LandingGalleryComponent,
    LandingDresscodeComponent, LandingGiftsComponent, LandingRsvpComponent, LandingRegisterComponent
  ],
  template: `
    @if (loading()) {
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d1117">
        <div style="text-align:center">
          <div class="spinner" style="margin:0 auto 16px"></div>
          <p style="color:rgba(255,255,255,0.5)">Cargando invitación...</p>
        </div>
      </div>
    }

    @if (error()) {
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d1117;padding:20px">
        <div style="text-align:center">
          <span class="material-icons" style="font-size:64px;color:rgba(212,160,23,0.3)">sentiment_dissatisfied</span>
          <h2 style="color:rgba(255,255,255,0.7);margin:16px 0 8px">Invitación no encontrada</h2>
          <p style="color:rgba(255,255,255,0.4)">El enlace puede ser incorrecto o la invitación no está disponible.</p>
        </div>
      </div>
    }

    @if (data() && !loading()) {
      <!-- Fixed background: solid color always, media fades in after intro AND after preload -->
      @if (data()!.config.hero.backgroundGif) {
        <div class="landing-bg-solid" [style.background]="getLandingBg()"></div>
        @if (data()!.config.theme.landingBgTexture && data()!.config.theme.landingBgTexture !== 'none') {
          <div class="landing-bg-texture" [attr.data-texture]="data()!.config.theme.landingBgTexture" [style.opacity]="(data()!.config.theme.landingBgTextureOpacity || 5) / 100"></div>
        }
        @if (isVideoBackground()) {
          <video class="landing-bg-video" [class.visible]="!showEnvelope() && !showIntro() && bgLoaded" [src]="data()!.config.hero.backgroundGif" autoplay loop muted playsinline (canplaythrough)="onBgLoaded()"></video>
        } @else {
          <div class="landing-bg" [class.visible]="!showEnvelope() && !showIntro() && bgLoaded" [style.backgroundImage]="'url(' + data()!.config.hero.backgroundGif + ')'"></div>
        }
        <div class="landing-bg-overlay" [class.visible]="!showEnvelope() && !showIntro() && bgLoaded"></div>
      }

      <!-- Envelope -->
      @if (showEnvelope() && data()!.config.envelope.enabled) {
        <app-landing-envelope [config]="data()!.config.envelope" [globalStyles]="data()!.config.globalStyles" (done)="onEnvelopeOpened()" />
      }

      <!-- Intro -->
      @if (showIntro() && !showEnvelope() && data()!.config.intro.enabled) {
        <app-landing-intro [config]="data()!.config.intro" [themeColor]="data()!.config.theme.navFooterText || '#d4a017'" [themeBg]="data()!.config.theme.cardBg || ''" [themeBorder]="data()!.config.theme.cardBorder || ''" (done)="showIntro.set(false)" />
      }

      @if (!showIntro() && !showEnvelope()) {
        <div class="landing-wrapper" [style.--theme-card-bg]="data()!.config.theme.cardBg || 'rgba(255,255,255,0.05)'" [style.--theme-card-border]="data()!.config.theme.cardBorder || 'rgba(212,160,23,0.3)'" [style.--theme-text-primary]="data()!.config.theme.textPrimary || '#ffffff'" [style.--theme-text-secondary]="data()!.config.theme.textSecondary || 'rgba(255,255,255,0.7)'" [style.--theme-nav-text]="data()!.config.theme.navFooterText || '#d4a017'" [style.--theme-btn-bg]="data()!.config.theme.buttonBg || '#d4a017'" [style.--theme-btn-text]="data()!.config.theme.buttonText || '#1a1a2e'" [style.--theme-text-primary-font]="getThemeFont(data()!.config.theme.textPrimaryFont)" [style.--theme-text-secondary-font]="getThemeFont(data()!.config.theme.textSecondaryFont)" [style.--theme-nav-font]="getThemeFont(data()!.config.theme.navFooterFont)" [style.--theme-btn-font]="getThemeFont(data()!.config.theme.buttonFont)">
        <!-- Sticky nav -->
        <app-landing-hero [config]="data()!.config.hero" [event]="data()!.event" [enabledSections]="getEnabledSections()" />

        <!-- Sections -->
        <div class="section-block" [style]="getSectionBg(data()!.config.invitation.sectionStyle)" [style.padding-top.px]="data()!.config.invitation.sectionStyle?.paddingTop ?? 80" [style.padding-bottom.px]="data()!.config.invitation.sectionStyle?.paddingBottom ?? 80">
          @if (data()!.config.invitation.sectionStyle?.dividerType && data()!.config.invitation.sectionStyle?.dividerType !== 'none') {
            <app-section-divider [type]="data()!.config.invitation.sectionStyle!.dividerType" [color]="getLandingBgColor()" [height]="data()!.config.invitation.sectionStyle!.dividerHeight || 50" [flip]="data()!.config.invitation.sectionStyle!.dividerFlip || false" [strokeColor]="data()!.config.invitation.sectionStyle!.dividerStrokeColor || ''" [strokeWidth]="data()!.config.invitation.sectionStyle!.dividerStrokeWidth || 0" [strokeOpacity]="data()!.config.invitation.sectionStyle!.dividerStrokeOpacity ?? 1" />
          }
          @if (data()!.config.invitation.sectionStyle?.bgImage && data()!.config.invitation.sectionStyle?.bgType === 'image') {
            <div class="section-bg-overlay" [style.opacity]="(data()!.config.invitation.sectionStyle!.bgOverlay ?? 50) / 100"></div>
          }
          <div [appScrollReveal]="data()!.config.theme.scrollAnimation || 'fade-up'" class="section-inner">
            <app-landing-invitation [config]="data()!.config.invitation" [guest]="guest()" [styles]="data()!.config.globalStyles" />
          </div>
        </div>
        @if (data()!.config.details.enabled && data()!.config.details.cards.length > 0) {
          <div class="section-block" [style]="getSectionBg(data()!.config.details.sectionStyle)" [style.padding-top.px]="data()!.config.details.sectionStyle?.paddingTop ?? 80" [style.padding-bottom.px]="data()!.config.details.sectionStyle?.paddingBottom ?? 80">
            @if (data()!.config.details.sectionStyle?.dividerType && data()!.config.details.sectionStyle?.dividerType !== 'none') {
              <app-section-divider [type]="data()!.config.details.sectionStyle!.dividerType" [color]="getLandingBgColor()" [height]="data()!.config.details.sectionStyle!.dividerHeight || 50" [flip]="data()!.config.details.sectionStyle!.dividerFlip || false" [strokeColor]="data()!.config.details.sectionStyle!.dividerStrokeColor || ''" [strokeWidth]="data()!.config.details.sectionStyle!.dividerStrokeWidth || 0" [strokeOpacity]="data()!.config.details.sectionStyle!.dividerStrokeOpacity ?? 1" />
            }
            @if (data()!.config.details.sectionStyle?.bgImage && data()!.config.details.sectionStyle?.bgType === 'image') {
              <div class="section-bg-overlay" [style.opacity]="(data()!.config.details.sectionStyle!.bgOverlay ?? 50) / 100"></div>
            }
            <div [appScrollReveal]="data()!.config.theme.scrollAnimation || 'fade-up'" class="section-inner">
              <app-landing-details [config]="data()!.config.details" [styles]="data()!.config.globalStyles" [sectionStyle]="data()!.config.details.sectionStyle" />
            </div>
          </div>
        }
        @if (data()!.config.venues.enabled && data()!.config.venues.items.length > 0) {
          <div class="section-block" [style]="getSectionBg(data()!.config.venues.sectionStyle)" [style.padding-top.px]="data()!.config.venues.sectionStyle?.paddingTop ?? 80" [style.padding-bottom.px]="data()!.config.venues.sectionStyle?.paddingBottom ?? 80">
            @if (data()!.config.venues.sectionStyle?.dividerType && data()!.config.venues.sectionStyle?.dividerType !== 'none') {
              <app-section-divider [type]="data()!.config.venues.sectionStyle!.dividerType" [color]="getLandingBgColor()" [height]="data()!.config.venues.sectionStyle!.dividerHeight || 50" [flip]="data()!.config.venues.sectionStyle!.dividerFlip || false" [strokeColor]="data()!.config.venues.sectionStyle!.dividerStrokeColor || ''" [strokeWidth]="data()!.config.venues.sectionStyle!.dividerStrokeWidth || 0" [strokeOpacity]="data()!.config.venues.sectionStyle!.dividerStrokeOpacity ?? 1" />
            }
            @if (data()!.config.venues.sectionStyle?.bgImage && data()!.config.venues.sectionStyle?.bgType === 'image') {
              <div class="section-bg-overlay" [style.opacity]="(data()!.config.venues.sectionStyle!.bgOverlay ?? 50) / 100"></div>
            }
            <div [appScrollReveal]="data()!.config.theme.scrollAnimation || 'fade-up'" class="section-inner">
              <app-landing-venues [config]="data()!.config.venues" [styles]="data()!.config.globalStyles" [sectionStyle]="data()!.config.venues.sectionStyle" />
            </div>
          </div>
        }
        @if (data()!.config.itinerary.enabled) {
          <div class="section-block" [style]="getSectionBg(data()!.config.itinerary.sectionStyle)" [style.padding-top.px]="data()!.config.itinerary.sectionStyle?.paddingTop ?? 80" [style.padding-bottom.px]="data()!.config.itinerary.sectionStyle?.paddingBottom ?? 80">
            @if (data()!.config.itinerary.sectionStyle?.dividerType && data()!.config.itinerary.sectionStyle?.dividerType !== 'none') {
              <app-section-divider [type]="data()!.config.itinerary.sectionStyle!.dividerType" [color]="getLandingBgColor()" [height]="data()!.config.itinerary.sectionStyle!.dividerHeight || 50" [flip]="data()!.config.itinerary.sectionStyle!.dividerFlip || false" [strokeColor]="data()!.config.itinerary.sectionStyle!.dividerStrokeColor || ''" [strokeWidth]="data()!.config.itinerary.sectionStyle!.dividerStrokeWidth || 0" [strokeOpacity]="data()!.config.itinerary.sectionStyle!.dividerStrokeOpacity ?? 1" />
            }
            @if (data()!.config.itinerary.sectionStyle?.bgImage && data()!.config.itinerary.sectionStyle?.bgType === 'image') {
              <div class="section-bg-overlay" [style.opacity]="(data()!.config.itinerary.sectionStyle!.bgOverlay ?? 50) / 100"></div>
            }
            <div [appScrollReveal]="data()!.config.theme.scrollAnimation || 'fade-up'" class="section-inner">
              <app-landing-itinerary [config]="data()!.config.itinerary" [items]="data()!.itinerary" [styles]="data()!.config.globalStyles" [sectionStyle]="data()!.config.itinerary.sectionStyle" />
            </div>
          </div>
        }
        @if (data()!.config.gallery.enabled) {
          <div class="section-block" [style]="getSectionBg(data()!.config.gallery.sectionStyle)" [style.padding-top.px]="data()!.config.gallery.sectionStyle?.paddingTop ?? 80" [style.padding-bottom.px]="data()!.config.gallery.sectionStyle?.paddingBottom ?? 80">
            @if (data()!.config.gallery.sectionStyle?.dividerType && data()!.config.gallery.sectionStyle?.dividerType !== 'none') {
              <app-section-divider [type]="data()!.config.gallery.sectionStyle!.dividerType" [color]="getLandingBgColor()" [height]="data()!.config.gallery.sectionStyle!.dividerHeight || 50" [flip]="data()!.config.gallery.sectionStyle!.dividerFlip || false" [strokeColor]="data()!.config.gallery.sectionStyle!.dividerStrokeColor || ''" [strokeWidth]="data()!.config.gallery.sectionStyle!.dividerStrokeWidth || 0" [strokeOpacity]="data()!.config.gallery.sectionStyle!.dividerStrokeOpacity ?? 1" />
            }
            @if (data()!.config.gallery.sectionStyle?.bgImage && data()!.config.gallery.sectionStyle?.bgType === 'image') {
              <div class="section-bg-overlay" [style.opacity]="(data()!.config.gallery.sectionStyle!.bgOverlay ?? 50) / 100"></div>
            }
            <div [appScrollReveal]="data()!.config.theme.scrollAnimation || 'fade-up'" class="section-inner">
              <app-landing-gallery [config]="data()!.config.gallery" [photos]="data()!.photos" [styles]="data()!.config.globalStyles" [sectionStyle]="data()!.config.gallery.sectionStyle" />
            </div>
          </div>
        }
        @if (data()!.config.dresscode.enabled) {
          <div class="section-block" [style]="getSectionBg(data()!.config.dresscode.sectionStyle)" [style.padding-top.px]="data()!.config.dresscode.sectionStyle?.paddingTop ?? 80" [style.padding-bottom.px]="data()!.config.dresscode.sectionStyle?.paddingBottom ?? 80">
            @if (data()!.config.dresscode.sectionStyle?.dividerType && data()!.config.dresscode.sectionStyle?.dividerType !== 'none') {
              <app-section-divider [type]="data()!.config.dresscode.sectionStyle!.dividerType" [color]="getLandingBgColor()" [height]="data()!.config.dresscode.sectionStyle!.dividerHeight || 50" [flip]="data()!.config.dresscode.sectionStyle!.dividerFlip || false" [strokeColor]="data()!.config.dresscode.sectionStyle!.dividerStrokeColor || ''" [strokeWidth]="data()!.config.dresscode.sectionStyle!.dividerStrokeWidth || 0" [strokeOpacity]="data()!.config.dresscode.sectionStyle!.dividerStrokeOpacity ?? 1" />
            }
            @if (data()!.config.dresscode.sectionStyle?.bgImage && data()!.config.dresscode.sectionStyle?.bgType === 'image') {
              <div class="section-bg-overlay" [style.opacity]="(data()!.config.dresscode.sectionStyle!.bgOverlay ?? 50) / 100"></div>
            }
            <div [appScrollReveal]="data()!.config.theme.scrollAnimation || 'fade-up'" class="section-inner">
              <app-landing-dresscode [config]="data()!.config.dresscode" [styles]="data()!.config.globalStyles" [sectionStyle]="data()!.config.dresscode.sectionStyle" />
            </div>
          </div>
        }
        @if (data()!.config.gifts.enabled) {
          <div class="section-block" [style]="getSectionBg(data()!.config.gifts.sectionStyle)" [style.padding-top.px]="data()!.config.gifts.sectionStyle?.paddingTop ?? 80" [style.padding-bottom.px]="data()!.config.gifts.sectionStyle?.paddingBottom ?? 80">
            @if (data()!.config.gifts.sectionStyle?.dividerType && data()!.config.gifts.sectionStyle?.dividerType !== 'none') {
              <app-section-divider [type]="data()!.config.gifts.sectionStyle!.dividerType" [color]="getLandingBgColor()" [height]="data()!.config.gifts.sectionStyle!.dividerHeight || 50" [flip]="data()!.config.gifts.sectionStyle!.dividerFlip || false" [strokeColor]="data()!.config.gifts.sectionStyle!.dividerStrokeColor || ''" [strokeWidth]="data()!.config.gifts.sectionStyle!.dividerStrokeWidth || 0" [strokeOpacity]="data()!.config.gifts.sectionStyle!.dividerStrokeOpacity ?? 1" />
            }
            @if (data()!.config.gifts.sectionStyle?.bgImage && data()!.config.gifts.sectionStyle?.bgType === 'image') {
              <div class="section-bg-overlay" [style.opacity]="(data()!.config.gifts.sectionStyle!.bgOverlay ?? 50) / 100"></div>
            }
            <div [appScrollReveal]="data()!.config.theme.scrollAnimation || 'fade-up'" class="section-inner">
              <app-landing-gifts [config]="data()!.config.gifts" [styles]="data()!.config.globalStyles" [sectionStyle]="data()!.config.gifts.sectionStyle" />
            </div>
          </div>
        }
        @if (data()!.config.rsvp.enabled && guest()) {
          <div class="section-block" [style]="getSectionBg(data()!.config.rsvp.sectionStyle)" [style.padding-top.px]="data()!.config.rsvp.sectionStyle?.paddingTop ?? 80" [style.padding-bottom.px]="data()!.config.rsvp.sectionStyle?.paddingBottom ?? 80">
            @if (data()!.config.rsvp.sectionStyle?.dividerType && data()!.config.rsvp.sectionStyle?.dividerType !== 'none') {
              <app-section-divider [type]="data()!.config.rsvp.sectionStyle!.dividerType" [color]="getLandingBgColor()" [height]="data()!.config.rsvp.sectionStyle!.dividerHeight || 50" [flip]="data()!.config.rsvp.sectionStyle!.dividerFlip || false" [strokeColor]="data()!.config.rsvp.sectionStyle!.dividerStrokeColor || ''" [strokeWidth]="data()!.config.rsvp.sectionStyle!.dividerStrokeWidth || 0" [strokeOpacity]="data()!.config.rsvp.sectionStyle!.dividerStrokeOpacity ?? 1" />
            }
            @if (data()!.config.rsvp.sectionStyle?.bgImage && data()!.config.rsvp.sectionStyle?.bgType === 'image') {
              <div class="section-bg-overlay" [style.opacity]="(data()!.config.rsvp.sectionStyle!.bgOverlay ?? 50) / 100"></div>
            }
            <div [appScrollReveal]="data()!.config.theme.scrollAnimation || 'fade-up'" class="section-inner">
              <app-landing-rsvp [config]="data()!.config.rsvp" [guest]="guest()!" [slug]="slug" [styles]="data()!.config.globalStyles" [sectionStyle]="data()!.config.rsvp.sectionStyle" />
            </div>
          </div>
        }
        @if (isOpenEvent() && !guest()) {
          <div class="section-block" [style]="getSectionBg(data()!.config.rsvp.sectionStyle)" [style.padding-top.px]="data()!.config.rsvp.sectionStyle?.paddingTop ?? 80" [style.padding-bottom.px]="data()!.config.rsvp.sectionStyle?.paddingBottom ?? 80">
            @if (data()!.config.rsvp.sectionStyle?.dividerType && data()!.config.rsvp.sectionStyle?.dividerType !== 'none') {
              <app-section-divider [type]="data()!.config.rsvp.sectionStyle!.dividerType" [color]="getLandingBgColor()" [height]="data()!.config.rsvp.sectionStyle!.dividerHeight || 50" [flip]="data()!.config.rsvp.sectionStyle!.dividerFlip || false" [strokeColor]="data()!.config.rsvp.sectionStyle!.dividerStrokeColor || ''" [strokeWidth]="data()!.config.rsvp.sectionStyle!.dividerStrokeWidth || 0" [strokeOpacity]="data()!.config.rsvp.sectionStyle!.dividerStrokeOpacity ?? 1" />
            }
            <div [appScrollReveal]="data()!.config.theme.scrollAnimation || 'fade-up'" class="section-inner">
              <app-landing-register [config]="data()!.config.rsvp" [slug]="slug" [styles]="data()!.config.globalStyles" [sectionStyle]="data()!.config.rsvp.sectionStyle" />
            </div>
          </div>
        }

        <!-- Footer -->
        <footer class="landing-footer">
          <p class="footer-title">{{ data()!.event.name }}</p>
          <p class="footer-sub">Invitación Digital · {{ data()!.event.event_date | date:'yyyy' }}</p>
        </footer>

        <!-- Back to top bar -->
        <div class="back-to-top" [class.visible]="scrolled" (click)="scrollTop()">
          <span class="material-icons back-arrow">expand_less</span>
          <span class="material-icons back-arrow">expand_less</span>
          <span class="back-text">Volver</span>
          <span class="material-icons back-arrow">expand_less</span>
          <span class="material-icons back-arrow">expand_less</span>
        </div>
        </div><!-- /landing-wrapper -->
      }
    }
  `,
  styles: [`
    :host { display: block; overscroll-behavior-y: contain; -webkit-user-select: none; user-select: none; }
    .landing-bg-solid {
      position: fixed; inset: -10vh -5vw; z-index: -3;
      background: var(--landing-bg, #0d1117);
    }
    .landing-bg-texture {
      position: fixed; inset: -10vh -5vw; z-index: -3;
      pointer-events: none;
    }
    .landing-bg-texture[data-texture="noise"] {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
    .landing-bg-texture[data-texture="grain"] {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
    }
    .landing-bg-texture[data-texture="dots"] {
      background-image: radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px);
      background-size: 8px 8px;
    }
    .landing-bg-texture[data-texture="lines"] {
      background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 5px);
    }
    .landing-bg-texture[data-texture="cross"] {
      background-image: repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px),
                        repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px);
    }
    .landing-bg-texture[data-texture="paper"] {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E");
    }
    .landing-bg-texture[data-texture="linen"] {
      background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px),
                        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px);
    }
    .landing-bg-texture[data-texture="stars"] {
      background-image: radial-gradient(circle, rgba(255,255,255,0.8) 0.5px, transparent 0.5px);
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
    }
    .landing-bg {
      position: fixed; z-index: -2;
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      /* Extend well beyond viewport to cover rubber-band on all devices */
      top: -15vh;
      left: -5vw;
      right: -5vw;
      bottom: -15vh;
      width: 110vw;
      height: 130vh;
      height: 130dvh;
      /* Hidden by default, fades in after intro */
      opacity: 0;
      transition: opacity 1.2s ease;
    }
    .landing-bg.visible { opacity: 1; }
    .landing-bg-video {
      position: fixed; z-index: -2;
      top: -15vh; left: -5vw; right: -5vw; bottom: -15vh;
      width: 110vw; height: 130vh; height: 130dvh;
      object-fit: cover;
      opacity: 0;
      transition: opacity 1.2s ease;
    }
    .landing-bg-video.visible { opacity: 1; }
    .landing-bg-overlay {
      position: fixed; z-index: -1;
      background: rgba(0,0,0,0.55);
      /* Match bg extension */
      top: -15vh;
      left: -5vw;
      right: -5vw;
      bottom: -15vh;
      width: 110vw;
      height: 130vh;
      height: 130dvh;
      /* Hidden by default, fades in with bg */
      opacity: 0;
      transition: opacity 1.2s ease;
    }
    .landing-bg-overlay.visible { opacity: 1; }
    .landing-wrapper {
      max-width: 520px;
      margin: 0 auto;
      position: relative;
      overflow-x: hidden;
    }
    .section-block {
      position: relative;
      margin-left: -20px;
      margin-right: -20px;
      padding-left: 20px;
      padding-right: 20px;
      margin-top: -1px;
    }
    .section-block[style*="--section-h2-color"] ::ng-deep .section-heading,
    .section-block[style*="--section-h2-color"] ::ng-deep h2 {
      color: var(--section-h2-color) !important;
      -webkit-text-fill-color: var(--section-h2-color) !important;
      background-image: none !important;
    }
    .section-block[style*="--section-h2-font"] ::ng-deep .section-heading,
    .section-block[style*="--section-h2-font"] ::ng-deep h2 {
      font-family: var(--section-h2-font) !important;
    }
    .section-block[style*="--section-heading-color"] ::ng-deep h3,
    .section-block[style*="--section-heading-color"] ::ng-deep .example-title,
    .section-block[style*="--section-heading-color"] ::ng-deep .venue-title {
      color: var(--section-heading-color) !important;
      -webkit-text-fill-color: var(--section-heading-color) !important;
      background-image: none !important;
    }
    .section-block[style*="--section-heading-color2"] ::ng-deep h3,
    .section-block[style*="--section-heading-color2"] ::ng-deep .example-title,
    .section-block[style*="--section-heading-color2"] ::ng-deep .venue-title {
      background: linear-gradient(var(--section-heading-angle, 135deg), var(--section-heading-color) 0%, var(--section-heading-color2) var(--section-heading-intensity, 50%)) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    .section-block[style*="--section-heading-weight"] ::ng-deep h3,
    .section-block[style*="--section-heading-weight"] ::ng-deep .example-title,
    .section-block[style*="--section-heading-weight"] ::ng-deep .venue-title {
      font-weight: var(--section-heading-weight) !important;
    }
    .section-block[style*="--section-content-color"] ::ng-deep p,
    .section-block[style*="--section-content-color"] ::ng-deep .detail-content,
    .section-block[style*="--section-content-color"] ::ng-deep .dresscode-desc,
    .section-block[style*="--section-content-color"] ::ng-deep .example-desc,
    .section-block[style*="--section-content-color"] ::ng-deep .venue-name,
    .section-block[style*="--section-content-color"] ::ng-deep .venue-address {
      color: var(--section-content-color) !important;
    }
    .section-bg-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); pointer-events: none;
    }
    .section-inner { position: relative; z-index: 1; }
    .landing-footer {
      text-align: center;
      padding: 40px 20px 96px;
      color: rgba(255,255,255,0.3);
      font-size: 12px;
    }
    .footer-title {
      font-family: var(--theme-nav-font, var(--font-script)); font-size: 20px;
      color: var(--theme-nav-text, var(--gold)); margin-bottom: 8px;
    }
    .footer-sub { color: var(--theme-nav-text, rgba(255,255,255,0.3)); opacity: 0.6; font-family: var(--theme-nav-font, inherit); }
    .back-to-top {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 500;
      background: var(--theme-card-bg, rgba(13,17,23,0.85));
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--theme-card-border, rgba(212,160,23,0.2));
      display: flex; align-items: center; justify-content: center;
      gap: 4px; height: 48px; cursor: pointer;
      transform: translateY(100%);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .back-to-top.visible {
      transform: translateY(0);
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
    }
    .back-to-top:hover { background: var(--theme-card-bg, rgba(13,17,23,0.95)); }
    .back-to-top:hover .back-arrow { opacity: 1; }
    .back-to-top:hover .back-text { opacity: 1; }
    .back-arrow {
      font-size: 20px; color: var(--theme-nav-text, var(--gold));
      animation: arrowPulse 1.5s ease-in-out infinite;
    }
    .back-arrow:nth-child(2) { animation-delay: 0.15s; margin-right: 8px; }
    .back-arrow:nth-child(4) { animation-delay: 0.15s; margin-left: 8px; }
    .back-text {
      font-family: var(--theme-nav-font, var(--font-script)); font-size: 20px;
      color: var(--theme-nav-text, var(--gold)); letter-spacing: 2px;
    }
    @keyframes arrowPulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.15); }
    }
    :host ::ng-deep .scroll-hidden {
      opacity: 0;
      transition: opacity 1.4s cubic-bezier(0.22, 0.61, 0.36, 1), transform 1.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    }
    :host ::ng-deep .scroll-hidden.scroll-anim-fade-up { transform: translateY(80px); }
    :host ::ng-deep .scroll-hidden.scroll-anim-fade-in { transform: none; }
    :host ::ng-deep .scroll-hidden.scroll-anim-slide-left { transform: translateX(-100px); }
    :host ::ng-deep .scroll-hidden.scroll-anim-slide-right { transform: translateX(100px); }
    :host ::ng-deep .scroll-hidden.scroll-anim-scale { transform: scale(0.8); }
    :host ::ng-deep .scroll-hidden.scroll-anim-fade-up.scroll-visible { transform: translateY(0); }
    :host ::ng-deep .scroll-hidden.scroll-anim-fade-in.scroll-visible { transform: none; }
    :host ::ng-deep .scroll-hidden.scroll-anim-slide-left.scroll-visible { transform: translateX(0); }
    :host ::ng-deep .scroll-hidden.scroll-anim-slide-right.scroll-visible { transform: translateX(0); }
    :host ::ng-deep .scroll-hidden.scroll-anim-scale.scroll-visible { transform: scale(1); }
    :host ::ng-deep .scroll-visible {
      opacity: 1;
    }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private scrollbarStyle: HTMLStyleElement | null = null;
  data = signal<LandingData | null>(null);
  guest = signal<Guest | null>(null);
  loading = signal(true);
  error = signal(false);
  showIntro = signal(false);
  showEnvelope = signal(false);
  scrolled = false;
  bgLoaded = false;
  slug = '';

  isOpenEvent(): boolean {
    return this.data()?.event?.event_mode === 'open';
  }

  isVideoBackground(): boolean {
    const url = this.data()?.config.hero.backgroundGif || '';
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'ogg'].includes(ext);
  }

  getLandingBg(): string {
    const theme = this.data()?.config.theme;
    if (!theme) return '#0d1117';
    const color1 = theme.landingBgColor1 || '#0d1117';
    const color2 = theme.landingBgColor2 || '#1a1a2e';
    const type = theme.landingBgType || 'solid';
    const angle = theme.landingBgAngle || 135;
    const intensity = theme.landingBgIntensity || 50;

    switch (type) {
      case 'solid': return color1;
      case 'linear': return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
      case 'radial': return `radial-gradient(ellipse ${intensity}% ${intensity}% at center, ${color2}, ${color1})`;
      case 'mesh': {
        const s1 = Math.max(0, 50 - intensity / 2);
        const s2 = Math.min(100, 50 + intensity / 2);
        return `linear-gradient(${angle}deg, ${color1} ${s1}%, ${color2} ${s2}%)`;
      }
      default: return color1;
    }
  }

  /** Returns just the primary solid color for SVG fill (no gradients) */
  getLandingBgColor(): string {
    return this.data()?.config.theme?.landingBgColor1 || '#0d1117';
  }

  onBgLoaded() {
    this.bgLoaded = true;
  }

  getEnabledSections(): string[] {
    const d = this.data();
    if (!d) return [];
    const sections: string[] = [];
    // Invitation is always shown (it's the main content)
    sections.push('invitation');
    if (d.config.details.enabled && d.config.details.cards?.length > 0) sections.push('details');
    if (d.config.venues.enabled && d.config.venues.items?.length > 0) sections.push('venues');
    if (d.config.itinerary.enabled) sections.push('itinerary');
    if (d.config.gallery.enabled) sections.push('gallery');
    if (d.config.dresscode.enabled) sections.push('dresscode');
    if (d.config.gifts.enabled) sections.push('gifts');
    if ((d.config.rsvp.enabled && this.guest()) || this.isOpenEvent()) sections.push('rsvp');
    return sections;
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 300; }

  scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  onEnvelopeOpened() {
    this.showEnvelope.set(false);
    // Start audio (user interaction satisfied by envelope click)
    if (this.data()?.config.hero.audioUrl) {
      const audio = new Audio(this.data()!.config.hero.audioUrl);
      audio.loop = true;
      audio.play().catch(() => {});
      // Store reference so hero component can control it
      (window as any).__landingAudio = audio;
    }
    // Show intro if enabled, otherwise go straight to landing
    if (this.data()?.config.intro.enabled) {
      this.showIntro.set(true);
    }
  }

  ngOnInit() {
    this.slug = this.route.snapshot.params['slug'];
    const code = this.route.snapshot.queryParams['t'];

    this.api.getLandingData(this.slug).subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
        if (d.config.envelope.enabled) {
          this.showEnvelope.set(true);
        } else if (d.config.intro.enabled) {
          this.showIntro.set(true);
        }
        this.applyScrollbarColor(d.config.theme.cardBorder || '#d4a017');
        this.applyFavicon(d.config.favicon);
        this.applyTitle(d.event.name);
        // Preload background media so it doesn't render partially
        if (d.config.hero.backgroundGif) {
          const url = d.config.hero.backgroundGif;
          const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
          if (['mp4', 'webm', 'ogg'].includes(ext)) {
            // Video: bgLoaded will be set by (canplaythrough) event on the <video> element
          } else {
            // Image/GIF: preload with Image object
            const img = new Image();
            img.onload = () => { this.bgLoaded = true; };
            img.src = url;
          }
        } else {
          this.bgLoaded = true;
        }
        // Preload intro media (video/gif) while user sees envelope/splash
        if (d.config.intro.enabled && d.config.intro.background) {
          this.preloadMedia(d.config.intro.background);
        }
        // Preload hero background ahead of time
        if (d.config.hero.backgroundGif) {
          this.preloadMedia(d.config.hero.backgroundGif);
        }
        if (code) {
          this.api.getGuestByCode(this.slug, code).subscribe({
            next: (g) => this.guest.set(g),
            error: () => {}
          });
        }
      },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }

  ngOnDestroy() {
    this.scrollbarStyle?.remove();
    // Restore default favicon and title when leaving landing
    this.restoreFavicon();
  }

  /** Preload a media URL (image/gif/video) in background for faster display later */
  private preloadMedia(url: string) {
    if (!url) return;
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'webm', 'ogg'].includes(ext)) {
      // Video: create hidden video element to buffer
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.src = url;
      video.load();
    } else {
      // Image/GIF: preload with Image object
      const img = new Image();
      img.src = url;
    }
  }

  private applyScrollbarColor(color: string) {
    this.scrollbarStyle = document.createElement('style');
    const inIframe = window.self !== window.top;
    if (inIframe) {
      this.scrollbarStyle.textContent = `::-webkit-scrollbar{width:0;display:none}html{scrollbar-width:none}`;
    } else {
      this.scrollbarStyle.textContent = `::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${color};border-radius:3px}html{scrollbar-color:${color} transparent}`;
    }
    document.head.appendChild(this.scrollbarStyle);
  }

  private applyFavicon(favicon?: string) {
    if (!favicon) return;
    const link = document.getElementById('app-favicon') as HTMLLinkElement;
    if (link) {
      link.href = favicon;
      link.type = favicon.endsWith('.ico') ? 'image/x-icon' : 'image/png';
    }
  }

  private restoreFavicon() {
    const link = document.getElementById('app-favicon') as HTMLLinkElement;
    if (link) {
      link.href = 'assets/icons/vitely-favicon.ico';
      link.type = 'image/x-icon';
    }
    document.title = 'Vitely';
  }

  private applyTitle(eventName: string) {
    document.title = eventName || 'Invitación';
  }

  getThemeFont(key?: string): string {
    if (!key) return 'inherit';
    const map: Record<string, string> = {
      'sans': 'var(--font-sans)', 'serif': 'var(--font-serif)', 'script': 'var(--font-script)',
      'cormorant': 'var(--font-cormorant)', 'spumoni': 'var(--font-spumoni)', 'dancing': 'var(--font-dancing)',
      'montserrat': 'var(--font-montserrat)', 'raleway': 'var(--font-raleway)', 'cinzel': 'var(--font-cinzel)',
      'sacramento': 'var(--font-sacramento)', 'tangerine': 'var(--font-tangerine)', 'alexbrush': 'var(--font-alexbrush)',
      'pinyon': 'var(--font-pinyon)', 'josefin': 'var(--font-josefin)', 'baskerville': 'var(--font-baskerville)'
    };
    return map[key] || 'inherit';
  }

  getSectionBg(style?: SectionStyle): string {
    if (!style || style.bgType === 'inherit') return '';
    let css = '';
    switch (style.bgType) {
      case 'solid':
        css = `background: ${style.bgColor1 || '#ffffff'}`;
        break;
      case 'linear': {
        const intensity = style.bgIntensity || 50;
        css = `background: linear-gradient(${style.bgAngle || 180}deg, ${style.bgColor1 || '#ffffff'} ${50 - intensity / 2}%, ${style.bgColor2 || '#f0f0f0'} ${50 + intensity / 2}%)`;
        break;
      }
      case 'radial':
        css = `background: radial-gradient(ellipse at center, ${style.bgColor2 || '#f0f0f0'}, ${style.bgColor1 || '#ffffff'})`;
        break;
      case 'image':
        css = `background: url(${style.bgImage}) center/cover no-repeat`;
        break;
    }
    // Section Heading (H2) overrides
    if (style.sectionHeadingColor) css += `; --section-h2-color: ${style.sectionHeadingColor}`;
    if (style.sectionHeadingFont) css += `; --section-h2-font: ${this.getThemeFont(style.sectionHeadingFont)}`;
    // Titles (h3) overrides
    if (style.headingColor) css += `; --section-heading-color: ${style.headingColor}`;
    if (style.headingColor2) css += `; --section-heading-color2: ${style.headingColor2}`;
    if (style.headingGradientAngle) css += `; --section-heading-angle: ${style.headingGradientAngle}deg`;
    if (style.headingGradientIntensity) css += `; --section-heading-intensity: ${style.headingGradientIntensity}`;
    if (style.headingFontWeight) css += `; --section-heading-weight: ${style.headingFontWeight}`;
    if (style.contentColor) css += `; --section-content-color: ${style.contentColor}`;
    if (style.headingFont) css += `; --section-heading-font: ${this.getThemeFont(style.headingFont)}`;
    if (style.contentFont) css += `; --section-content-font: ${this.getThemeFont(style.contentFont)}`;
    // Organic section transition via clip-path
    if (style.dividerType && style.dividerType !== 'none') {
      const h = style.dividerHeight || 50;
      const clipValue = this.getClipPathValue(style.dividerType, h, style.dividerFlip || false);
      if (clipValue && clipValue !== 'none') {
        css += `; margin-top: -${h}px; clip-path: ${clipValue}`;
      }
    }
    return css;
  }

  /** Generates a CSS polygon() clip for the section's top edge using px values */
  private getClipPolygon(type: string, h: number, flip: boolean): string {
    switch (type) {
      case 'slant':
        return flip
          ? `0% 0px, 100% ${h}px, 100% 100%, 0% 100%`
          : `0% ${h}px, 100% 0px, 100% 100%, 0% 100%`;
      case 'arrow':
        return flip
          ? `0% 0px, 50% ${h}px, 100% 0px, 100% 100%, 0% 100%`
          : `0% ${h}px, 50% 0px, 100% ${h}px, 100% 100%, 0% 100%`;
      case 'zigzag': {
        const pts: string[] = [];
        for (let i = 0; i <= 12; i++) {
          const x = (i / 12) * 100;
          const y = i % 2 === 0 ? (flip ? 0 : h) : (flip ? h : 0);
          pts.push(`${x.toFixed(1)}% ${y}px`);
        }
        pts.push('100% 100%', '0% 100%');
        return pts.join(', ');
      }
      case 'mountains': {
        const mPts = [
          [0, 1], [12.5, 0.3], [25, 0.7], [42, 0], [58, 0.6], [75, 0.2], [87.5, 0.5], [100, 0.15]
        ];
        const pts = mPts.map(([x, ratio]) => {
          const y = flip ? h * (1 - ratio) : h * ratio;
          return `${x}% ${y.toFixed(1)}px`;
        });
        pts.push('100% 100%', '0% 100%');
        return pts.join(', ');
      }
      case 'wave':
      case 'curve':
      case 'drops':
        return '';
      default:
        return '';
    }
  }

  /** Generates clip-path CSS value - uses polygon for straight shapes, path for curves */
  private getClipPathValue(type: string, h: number, flip: boolean): string {
    const poly = this.getClipPolygon(type, h, flip);
    if (poly) return `polygon(${poly})`;
    
    // Use polygon with many points to simulate smooth curves
    switch (type) {
      case 'wave': {
        const pts = this.generateWavePoints(h, flip);
        return `polygon(${pts}, 100% 100%, 0% 100%)`;
      }
      case 'curve': {
        const pts = this.generateCurvePoints(h, flip);
        return `polygon(${pts}, 100% 100%, 0% 100%)`;
      }
      case 'drops': {
        const pts = this.generateDropsPoints(h, flip);
        return `polygon(${pts}, 100% 100%, 0% 100%)`;
      }
      default:
        return 'none';
    }
  }

  private generateWavePoints(h: number, flip: boolean): string {
    const points: string[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 100;
      const t = (i / steps) * Math.PI * 2;
      let y = (Math.sin(t) + 1) / 2 * h; // 0 to h
      if (flip) y = h - y;
      points.push(`${x.toFixed(1)}% ${y.toFixed(1)}px`);
    }
    return points.join(', ');
  }

  private generateCurvePoints(h: number, flip: boolean): string {
    const points: string[] = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 100;
      const t = (i / steps) * Math.PI;
      let y = Math.cos(t) * 0.5 + 0.5; // 1 at edges, 0 at center
      y = y * h;
      if (flip) y = h - y;
      points.push(`${x.toFixed(1)}% ${y.toFixed(1)}px`);
    }
    return points.join(', ');
  }

  private generateDropsPoints(h: number, flip: boolean): string {
    const points: string[] = [];
    const drops = 6;
    const stepsPerDrop = 10;
    const totalSteps = drops * stepsPerDrop;
    for (let i = 0; i <= totalSteps; i++) {
      const x = (i / totalSteps) * 100;
      const t = (i / totalSteps) * drops * Math.PI * 2;
      let y = (Math.cos(t) + 1) / 2 * h; // semicircles: h at edges, 0 at peaks
      if (flip) y = h - y;
      points.push(`${x.toFixed(1)}% ${y.toFixed(1)}px`);
    }
    return points.join(', ');
  }

  getSectionAnimation(style?: SectionStyle): string {
    if (!style || !style.animation || style.animation === 'inherit') {
      return this.data()?.config.theme.scrollAnimation || 'fade-up';
    }
    return style.animation;
  }
}
