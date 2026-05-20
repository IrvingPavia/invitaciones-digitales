import { Component, inject, OnInit, OnDestroy, signal, HostListener, AfterViewInit, Directive, ElementRef } from '@angular/core';
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

  ngOnInit() {
    this.el.nativeElement.classList.add('scroll-hidden');
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.el.nativeElement.classList.add('scroll-visible');
        this.observer.unobserve(this.el.nativeElement);
      }
    }, { threshold: 0.15 });
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}
import { LandingIntroComponent } from './sections/intro/intro.component';
import { LandingHeroComponent } from './sections/hero/hero.component';
import { LandingInvitationComponent } from './sections/invitation/invitation.component';
import { LandingDetailsComponent } from './sections/details/details.component';
import { LandingVenuesComponent } from './sections/venues/venues.component';
import { LandingItineraryComponent } from './sections/itinerary/itinerary.component';
import { LandingGalleryComponent } from './sections/gallery/gallery.component';
import { LandingDresscodeComponent } from './sections/dresscode/dresscode.component';
import { LandingGiftsComponent } from './sections/gifts/gifts.component';
import { LandingRsvpComponent } from './sections/rsvp/rsvp.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, ScrollRevealDirective,
    LandingIntroComponent, LandingHeroComponent, LandingInvitationComponent,
    LandingDetailsComponent, LandingVenuesComponent, LandingItineraryComponent, LandingGalleryComponent,
    LandingDresscodeComponent, LandingGiftsComponent, LandingRsvpComponent
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
      <!-- Fixed background -->
      @if (data()!.config.hero?.backgroundGif) {
        <div class="landing-bg" [style.backgroundImage]="'url(' + data()!.config.hero.backgroundGif + ')'"></div>
        <div class="landing-bg-overlay"></div>
      }

      <!-- Intro -->
      @if (showIntro() && data()!.config.intro?.enabled) {
        <app-landing-intro [config]="data()!.config.intro" (done)="showIntro.set(false)" />
      }

      @if (!showIntro()) {
        <div class="landing-wrapper" [style.--theme-card-bg]="data()!.config.theme?.cardBg || 'rgba(255,255,255,0.05)'" [style.--theme-card-border]="data()!.config.theme?.cardBorder || 'rgba(212,160,23,0.3)'" [style.--theme-text-primary]="data()!.config.theme?.textPrimary || '#ffffff'" [style.--theme-text-secondary]="data()!.config.theme?.textSecondary || 'rgba(255,255,255,0.7)'" [style.--theme-nav-text]="data()!.config.theme?.navFooterText || '#d4a017'" [style.--theme-btn-bg]="data()!.config.theme?.buttonBg || '#d4a017'" [style.--theme-btn-text]="data()!.config.theme?.buttonText || '#1a1a2e'">
        <!-- Sticky nav -->
        <app-landing-hero [config]="data()!.config.hero" [event]="data()!.event" />

        <!-- Sections -->
        <div appScrollReveal>
          <app-landing-invitation [config]="data()!.config.invitation" [guest]="guest()" [styles]="data()!.config.globalStyles" />
        </div>
        @if (data()!.config.details?.enabled && data()!.config.details.cards.length > 0) {
          <div appScrollReveal>
            <app-landing-details [config]="data()!.config.details" [styles]="data()!.config.globalStyles" />
          </div>
        }
        @if (data()!.config.venues?.enabled && data()!.config.venues.items.length > 0) {
          <div appScrollReveal>
            <app-landing-venues [config]="data()!.config.venues" [styles]="data()!.config.globalStyles" />
          </div>
        }
        @if (data()!.config.itinerary?.enabled) {
          <div appScrollReveal>
            <app-landing-itinerary [config]="data()!.config.itinerary" [items]="data()!.itinerary" [styles]="data()!.config.globalStyles" />
          </div>
        }
        @if (data()!.config.gallery?.enabled) {
          <div appScrollReveal>
            <app-landing-gallery [config]="data()!.config.gallery" [photos]="data()!.photos" [styles]="data()!.config.globalStyles" />
          </div>
        }
        @if (data()!.config.dresscode?.enabled) {
          <div appScrollReveal>
            <app-landing-dresscode [config]="data()!.config.dresscode" [styles]="data()!.config.globalStyles" />
          </div>
        }
        @if (data()!.config.gifts?.enabled) {
          <div appScrollReveal>
            <app-landing-gifts [config]="data()!.config.gifts" [styles]="data()!.config.globalStyles" />
          </div>
        }
        @if (data()!.config.rsvp?.enabled && guest()) {
          <div appScrollReveal>
            <app-landing-rsvp [config]="data()!.config.rsvp" [guest]="guest()!" [slug]="slug" [styles]="data()!.config.globalStyles" />
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
    :host { display: block; }
    .landing-bg {
      position: fixed; inset: 0; z-index: -2;
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      width: 100%; height: 100%;
    }
    .landing-bg-overlay {
      position: fixed; inset: 0; z-index: -1;
      background: rgba(0,0,0,0.55);
    }
    .landing-wrapper {
      max-width: 520px;
      margin: 0 auto;
      position: relative;
    }
    .landing-footer {
      text-align: center;
      padding: 40px 20px 96px;
      color: rgba(255,255,255,0.3);
      font-size: 12px;
    }
    .footer-title {
      font-family: var(--font-script); font-size: 20px;
      color: var(--theme-nav-text, var(--gold)); margin-bottom: 8px;
    }
    .footer-sub { color: var(--theme-nav-text, rgba(255,255,255,0.3)); opacity: 0.6; }
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
      font-family: var(--font-script); font-size: 20px;
      color: var(--theme-nav-text, var(--gold)); letter-spacing: 2px;
    }
    @keyframes arrowPulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.15); }
    }
    :host ::ng-deep .scroll-hidden {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    :host ::ng-deep .scroll-visible {
      opacity: 1;
      transform: translateY(0);
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
  scrolled = false;
  slug = '';

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 300; }

  scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  ngOnInit() {
    this.slug = this.route.snapshot.params['slug'];
    const code = this.route.snapshot.queryParams['t'];

    this.api.getLandingData(this.slug).subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
        if (d.config.intro?.enabled) this.showIntro.set(true);
        this.applyScrollbarColor(d.config.theme?.cardBorder || '#d4a017');
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
  }

  private applyScrollbarColor(color: string) {
    this.scrollbarStyle = document.createElement('style');
    this.scrollbarStyle.textContent = `::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${color};border-radius:3px}html{scrollbar-color:${color} transparent}`;
    document.head.appendChild(this.scrollbarStyle);
  }
}
