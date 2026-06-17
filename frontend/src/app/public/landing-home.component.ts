import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-home">
      <!-- Navigation -->
      <nav class="lh-nav">
        <img src="assets/icons/vitely-logo.png" class="lh-nav-logo-img" alt="Vitely">
        <div class="lh-nav-links">
          <a href="#features">Funciones</a>
          <a href="#how">Cómo funciona</a>
          <a href="#showcase">Showcase</a>
          <a routerLink="/login" class="lh-nav-cta">Iniciar sesión</a>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="lh-hero">
        <div class="lh-hero-glow"></div>
        <div class="lh-hero-content" #heroContent>
          <p class="lh-hero-tag">Plataforma de invitaciones digitales</p>
          <h1 class="lh-hero-title" #heroTitle>
            Crea experiencias<br>
            <span class="lh-hero-accent">digitales inolvidables</span>
          </h1>
          <p class="lh-hero-sub" #heroSub>
            Diseña landing pages personalizadas para tus eventos. Bodas, XV años,
            bautizos, conferencias y más — con diseño profesional en minutos.
          </p>
          <div class="lh-hero-actions" #heroActions>
            <a routerLink="/login" class="lh-btn lh-btn-primary">
              <span class="material-icons">rocket_launch</span>
              Comenzar gratis
            </a>
            <a href="#how" class="lh-btn lh-btn-secondary">
              <span class="material-icons">play_circle</span>
              Ver cómo funciona
            </a>
          </div>
          <div class="lh-hero-stats">
            <div class="lh-stat"><strong>5+</strong><span>Templates</span></div>
            <div class="lh-stat"><strong>∞</strong><span>Invitados</span></div>
            <div class="lh-stat"><strong>100%</strong><span>Personalizable</span></div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="lh-features" id="features">
        <h2 class="lh-section-title">Todo lo que necesitas en un solo lugar</h2>
        <p class="lh-section-sub">Una plataforma completa para gestionar tus invitaciones de principio a fin</p>
        <div class="lh-features-grid">
          <div class="lh-feature-card">
            <div class="lh-feature-icon"><span class="material-icons">dashboard</span></div>
            <h3>Panel de Control</h3>
            <p>Dashboard intuitivo con carrusel 3D de eventos, KPIs en tiempo real y gestión completa de tus invitaciones.</p>
          </div>
          <div class="lh-feature-card">
            <div class="lh-feature-icon"><span class="material-icons">web</span></div>
            <h3>Landing Personalizable</h3>
            <p>Páginas de invitación con 15+ secciones configurables: countdown, galería, itinerario, vestimenta y más.</p>
          </div>
          <div class="lh-feature-card">
            <div class="lh-feature-icon"><span class="material-icons">people</span></div>
            <h3>Gestión de Invitados</h3>
            <p>Importa desde Excel, genera QR únicos por invitado y comparte por WhatsApp con un click.</p>
          </div>
          <div class="lh-feature-card">
            <div class="lh-feature-icon"><span class="material-icons">style</span></div>
            <h3>Tarjetas Imprimibles</h3>
            <p>Editor visual drag & drop para diseñar tarjetas físicas. Genera PDFs listos para imprenta.</p>
          </div>
          <div class="lh-feature-card">
            <div class="lh-feature-icon"><span class="material-icons">how_to_reg</span></div>
            <h3>Confirmación RSVP</h3>
            <p>Tus invitados confirman asistencia directamente desde la invitación digital. Tracking en tiempo real.</p>
          </div>
          <div class="lh-feature-card">
            <div class="lh-feature-icon"><span class="material-icons">palette</span></div>
            <h3>Temas y Estilos</h3>
            <p>5 templates predefinidos, 15 tipografías, colores ilimitados. Personalización visual completa por sección.</p>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="lh-how" id="how">
        <h2 class="lh-section-title">Cómo funciona</h2>
        <p class="lh-section-sub">En 3 simples pasos tu invitación estará lista</p>
        <div class="lh-steps">
          <div class="lh-step">
            <div class="lh-step-number">1</div>
            <h3>Crea tu evento</h3>
            <p>Elige el tipo de evento y selecciona un template. Todo se configura en minutos.</p>
          </div>
          <div class="lh-step-divider"></div>
          <div class="lh-step">
            <div class="lh-step-number">2</div>
            <h3>Personaliza tu landing</h3>
            <p>Configura colores, fuentes, secciones y sube tus fotos. Preview en tiempo real.</p>
          </div>
          <div class="lh-step-divider"></div>
          <div class="lh-step">
            <div class="lh-step-number">3</div>
            <h3>Comparte con tus invitados</h3>
            <p>Envía por WhatsApp, genera QRs o comparte el link. Cada invitado tiene su acceso único.</p>
          </div>
        </div>
      </section>

      <!-- Showcase Section -->
      <section class="lh-showcase" id="showcase">
        <h2 class="lh-section-title">Diseñado para cada ocasión</h2>
        <p class="lh-section-sub">Selecciona un tipo de evento y mira cómo se vería tu invitación</p>
        <div class="lh-showcase-tabs">
          @for (evt of eventTypes; track evt.key) {
            <button class="lh-showcase-tab" [class.active]="activeShowcase === evt.key" (click)="activeShowcase = evt.key">
              <span class="material-icons">{{ evt.icon }}</span>
              <span>{{ evt.label }}</span>
            </button>
          }
        </div>
        <div class="lh-showcase-preview">
          @for (evt of eventTypes; track evt.key) {
            @if (activeShowcase === evt.key) {
              <div class="lh-showcase-visual" [style.background]="evt.gradient">
                <div class="lh-showcase-mockup">
                  <p class="lh-mock-type" [style.color]="evt.accentLight">{{ evt.typeText }}</p>
                  <h3 class="lh-mock-title" [style.font-family]="evt.font" [style.color]="evt.titleColor">{{ evt.example }}</h3>
                  <div class="lh-mock-date" [style.color]="evt.accentLight">{{ evt.date }}</div>
                  <div class="lh-mock-divider" [style.background]="evt.accent"></div>
                  <p class="lh-mock-desc" [style.color]="evt.textColor">{{ evt.description }}</p>
                </div>
              </div>
            }
          }
        </div>
      </section>

      <!-- CTA Section -->
      <section class="lh-cta">
        <div class="lh-cta-glow"></div>
        <h2>¿Listo para crear tu invitación?</h2>
        <p>Empieza gratis. Sin límites. Sin tarjeta de crédito.</p>
        <a routerLink="/login" class="lh-btn lh-btn-primary lh-btn-lg">
          <span class="material-icons">rocket_launch</span>
          Crear mi invitación ahora
        </a>
      </section>

      <!-- Footer -->
      <footer class="lh-footer">
        <img src="assets/icons/vitely-logo.png" class="lh-footer-logo-img" alt="Vitely">
        <p>Invitaciones digitales profesionales</p>
        <p class="lh-footer-copy">© 2025 Vitely. Todos los derechos reservados.</p>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .landing-home { background: #06060e; color: white; min-height: 100vh; overflow-x: hidden; font-family: var(--font-sans); }

    /* Nav */
    .lh-nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; position: fixed; top: 0; left: 0; right: 0; z-index: 100; backdrop-filter: blur(16px); background: rgba(6,6,14,0.85); border-bottom: 1px solid rgba(139,92,246,0.1); }
    .lh-nav-logo-img { height: 36px; object-fit: contain; }
    .lh-nav-links { display: flex; align-items: center; gap: 28px; }
    .lh-nav-links a { color: rgba(255,255,255,0.65); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
    .lh-nav-links a:hover { color: white; }
    .lh-nav-cta { background: linear-gradient(135deg, var(--gold), var(--gold-light)) !important; color: white !important; padding: 9px 22px; border-radius: 10px; font-weight: 600 !important; }

    /* Hero */
    .lh-hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 140px 40px 100px; position: relative; text-align: center; }
    .lh-hero-glow { position: absolute; top: 30%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%); filter: blur(80px); pointer-events: none; }
    .lh-hero-content { position: relative; z-index: 1; max-width: 700px; }
    .lh-hero-tag { font-size: 13px; color: var(--gold-light); font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
    .lh-hero-title { font-family: var(--font-montserrat); font-size: clamp(38px, 5.5vw, 60px); font-weight: 800; line-height: 1.1; margin-bottom: 24px; letter-spacing: -1px; }
    .lh-hero-accent { background: linear-gradient(135deg, var(--gold-light), #c084fc, #e879f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .lh-hero-sub { font-size: 17px; color: rgba(255,255,255,0.55); line-height: 1.7; margin-bottom: 36px; max-width: 540px; margin-left: auto; margin-right: auto; }
    .lh-hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 48px; }
    .lh-hero-stats { display: flex; gap: 40px; justify-content: center; }
    .lh-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .lh-stat strong { font-size: 24px; font-weight: 700; color: var(--gold-light); }
    .lh-stat span { font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; }

    /* Buttons */
    .lh-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none; transition: all 0.3s; }
    .lh-btn-primary { background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: white; box-shadow: 0 4px 20px rgba(124,92,191,0.3); }
    .lh-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124,92,191,0.5); }
    .lh-btn-secondary { background: rgba(255,255,255,0.04); color: white; border: 1px solid rgba(139,92,246,0.3); }
    .lh-btn-secondary:hover { background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.6); }
    .lh-btn-lg { padding: 18px 40px; font-size: 17px; }
    .lh-btn .material-icons { font-size: 20px; }

    /* Sections common */
    .lh-section-title { font-family: var(--font-montserrat); font-size: clamp(28px, 4vw, 40px); font-weight: 700; text-align: center; margin-bottom: 12px; }
    .lh-section-sub { text-align: center; color: rgba(255,255,255,0.45); font-size: 16px; margin-bottom: 60px; max-width: 500px; margin-left: auto; margin-right: auto; }

    /* Features */
    .lh-features { padding: 120px 40px; }
    .lh-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto; }
    .lh-feature-card { background: rgba(12,12,24,0.5); border: 1px solid rgba(139,92,246,0.1); border-radius: 16px; padding: 32px; transition: all 0.3s; backdrop-filter: blur(4px); }
    .lh-feature-card:hover { border-color: rgba(139,92,246,0.35); transform: translateY(-4px); box-shadow: 0 8px 30px rgba(139,92,246,0.08); }
    .lh-feature-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(139,92,246,0.12); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .lh-feature-icon .material-icons { font-size: 24px; color: #c084fc; }
    .lh-feature-card h3 { font-size: 17px; font-weight: 600; margin-bottom: 10px; }
    .lh-feature-card p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; }

    /* How it works */
    .lh-how { padding: 120px 40px; background: rgba(139,92,246,0.03); }
    .lh-steps { display: flex; align-items: flex-start; justify-content: center; gap: 24px; max-width: 900px; margin: 0 auto; flex-wrap: wrap; }
    .lh-step { flex: 1; min-width: 200px; text-align: center; }
    .lh-step-number { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: white; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .lh-step h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
    .lh-step p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; }
    .lh-step-divider { width: 60px; height: 2px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent); align-self: center; margin-top: 24px; }

    /* Showcase */
    .lh-showcase { padding: 120px 40px; }
    .lh-showcase-tabs { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 40px; }
    .lh-showcase-tab {
      display: flex; align-items: center; gap: 8px; padding: 10px 20px;
      border-radius: 12px; border: 1px solid rgba(139,92,246,0.15);
      background: rgba(12,12,24,0.5); color: rgba(255,255,255,0.6);
      font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.3s;
      .material-icons { font-size: 18px; }
    }
    .lh-showcase-tab:hover { border-color: rgba(139,92,246,0.4); color: white; }
    .lh-showcase-tab.active { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.5); color: white; box-shadow: 0 0 16px rgba(139,92,246,0.15); }
    .lh-showcase-preview { max-width: 600px; margin: 0 auto; }
    .lh-showcase-visual {
      border-radius: 20px; padding: 48px 40px; text-align: center;
      border: 1px solid rgba(255,255,255,0.08);
      animation: contentFadeIn 0.4s ease-out;
      position: relative; overflow: hidden;
    }
    .lh-showcase-mockup { position: relative; z-index: 1; }
    .lh-mock-type { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; opacity: 0.8; }
    .lh-mock-title { font-size: clamp(28px, 4vw, 42px); margin-bottom: 8px; font-weight: 400; }
    .lh-mock-date { font-size: 14px; margin-bottom: 16px; opacity: 0.7; }
    .lh-mock-divider { width: 60px; height: 2px; margin: 0 auto 16px; border-radius: 2px; }
    .lh-mock-desc { font-size: 14px; line-height: 1.6; max-width: 360px; margin: 0 auto; opacity: 0.7; }

    /* CTA */
    .lh-cta { padding: 120px 40px; text-align: center; position: relative; }
    .lh-cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; height: 300px; background: radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 60%); filter: blur(60px); pointer-events: none; }
    .lh-cta h2 { font-family: var(--font-montserrat); font-size: 32px; font-weight: 700; margin-bottom: 12px; position: relative; }
    .lh-cta p { color: rgba(255,255,255,0.45); font-size: 16px; margin-bottom: 36px; position: relative; }

    /* Footer */
    .lh-footer { padding: 48px 40px; text-align: center; border-top: 1px solid rgba(139,92,246,0.08); }
    .lh-footer-logo-img { height: 28px; object-fit: contain; margin-bottom: 12px; }
    .lh-footer p { color: rgba(255,255,255,0.35); font-size: 13px; margin-bottom: 4px; }

    /* Responsive */
    @media (max-width: 768px) {
      .lh-nav { padding: 14px 20px; }
      .lh-nav-links a:not(.lh-nav-cta) { display: none; }
      .lh-hero { padding: 120px 20px 80px; }
      .lh-hero-stats { gap: 24px; }
      .lh-features, .lh-how, .lh-showcase, .lh-cta { padding: 80px 20px; }
      .lh-steps { flex-direction: column; align-items: center; }
      .lh-step-divider { width: 2px; height: 30px; background: linear-gradient(180deg, transparent, rgba(139,92,246,0.4), transparent); }
    }
  `]
})
export class LandingHomeComponent implements AfterViewInit {
  @ViewChild('heroTitle') heroTitle!: ElementRef;
  @ViewChild('heroSub') heroSub!: ElementRef;
  @ViewChild('heroActions') heroActions!: ElementRef;
  @ViewChild('heroContent') heroContent!: ElementRef;

  activeShowcase = 'boda';

  eventTypes = [
    { key: 'boda', label: 'Bodas', icon: 'favorite', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b3d 100%)', accent: '#d4a017', accentLight: '#f0c040', titleColor: '#ffffff', textColor: 'rgba(255,255,255,0.7)', font: 'var(--font-script)', typeText: 'Nuestra Boda', example: 'María & Carlos', date: '24 de Noviembre, 2025', description: 'Están cordialmente invitados a celebrar nuestra unión en amor.' },
    { key: 'xv', label: 'XV Años', icon: 'celebration', gradient: 'linear-gradient(135deg, #2d1b3d 0%, #4a1942 100%)', accent: '#f4a7c1', accentLight: '#ff69b4', titleColor: '#fff0f5', textColor: 'rgba(255,240,245,0.7)', font: 'var(--font-dancing)', typeText: 'Mis XV Años', example: 'Valentina', date: '15 de Marzo, 2025', description: 'Una noche mágica que marcará el inicio de una nueva etapa.' },
    { key: 'cumple', label: 'Cumpleaños', icon: 'cake', gradient: 'linear-gradient(135deg, #1a2a1a 0%, #2d3b1b 100%)', accent: '#fbbf24', accentLight: '#fde68a', titleColor: '#ffffff', textColor: 'rgba(255,255,255,0.7)', font: 'var(--font-raleway)', typeText: 'Cumpleaños', example: '¡Fiesta de Diego!', date: '8 de Julio, 2025', description: 'Acompáñanos a celebrar un año más de vida y aventuras.' },
    { key: 'bautizo', label: 'Bautizos', icon: 'child_care', gradient: 'linear-gradient(135deg, #1b2a3d 0%, #1a3d4a 100%)', accent: '#93c5fd', accentLight: '#bfdbfe', titleColor: '#f0f9ff', textColor: 'rgba(240,249,255,0.7)', font: 'var(--font-cormorant)', typeText: 'Bautizo', example: 'Pequeño Santiago', date: '12 de Mayo, 2025', description: 'Con alegría los invitamos a ser parte de este sacramento.' },
    { key: 'grad', label: 'Graduaciones', icon: 'school', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', accent: '#60a5fa', accentLight: '#93c5fd', titleColor: '#f1f5f9', textColor: 'rgba(241,245,249,0.6)', font: 'var(--font-montserrat)', typeText: 'Graduación', example: 'Generación 2025', date: '20 de Junio, 2025', description: 'Celebremos juntos el logro de una nueva generación.' },
    { key: 'conf', label: 'Conferencias', icon: 'business', gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3d 100%)', accent: '#a78bfa', accentLight: '#c4b5fd', titleColor: '#ffffff', textColor: 'rgba(255,255,255,0.6)', font: 'var(--font-josefin)', typeText: 'Conferencia', example: 'Tech Summit 2025', date: '3-5 de Septiembre', description: 'El evento de tecnología más importante del año. Regístrate ahora.' },
  ];

  ngAfterViewInit() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from(this.heroTitle.nativeElement, { y: 50, opacity: 0, duration: 0.9 })
      .from(this.heroSub.nativeElement, { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
      .from(this.heroActions.nativeElement, { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
      .from('.lh-hero-stats', { y: 20, opacity: 0, duration: 0.5 }, '-=0.2')
      .from('.lh-hero-tag', { y: -10, opacity: 0, duration: 0.4 }, '-=0.8');

    // Feature cards stagger on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.from(entry.target, { y: 30, opacity: 0, duration: 0.5, delay: 0.1 });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.lh-feature-card, .lh-step, .lh-showcase-card').forEach(el => observer.observe(el));
  }
}
