import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Event, KPIs } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <div class="flex-between mb-24">
        <div>
          <h2 class="section-title">{{ isClient ? 'Mi Evento' : 'Dashboard' }}</h2>
          <p class="section-subtitle">{{ isClient ? 'Resumen de tu invitación digital' : 'Selecciona un evento para ver su resumen' }}</p>
        </div>
      </div>

      <!-- 3D Carousel -->
      @if (events().length > 0) {
        <div class="carousel-3d mb-24">
          <button class="nav-arrow nav-left" (click)="navigate(-1)" [disabled]="activeIndex() === 0">
            <span class="material-icons">chevron_left</span>
          </button>

          <div class="carousel-stage" (mousedown)="onSwipeStart($event)" (touchstart)="onSwipeTouchStart($event)">
            @for (event of events(); track event.id; let i = $index) {
              <div
                class="carousel-card-wrapper"
                [style.transform]="getCardTransform(i)"
                [style.opacity]="getCardOpacity(i)"
                [style.z-index]="getCardZIndex(i)"
                [style.pointer-events]="getCardPointerEvents(i)"
                [style.transition]="isDragging ? 'none' : ''"
                (click)="onCardClick(i)">
                <div class="carousel-card" [style.background]="getCardBackground(event.id)"
                     [style.filter]="getCardFilter(i)"
                     [style.border-color]="getCardBorderColor(i)"
                     [style.box-shadow]="getCardShadow(i)">
                  <!-- Hero media only on active card -->
                  @if (i === activeIndex() && getHeroMedia(event.id)) {
                    @if (isVideo(getHeroMedia(event.id)!)) {
                      <video class="card-media" autoplay muted loop playsinline [src]="getMediaUrl(getHeroMedia(event.id)!)"></video>
                    } @else {
                      <div class="card-media card-media-img" [style.background-image]="'url(' + getMediaUrl(getHeroMedia(event.id)!) + ')'"></div>
                    }
                  }

                  <div class="card-gradient"></div>
                  <div class="card-body">
                    <div class="card-badge">
                      <span class="material-icons">{{ getEventIcon(event.event_type) }}</span>
                    </div>
                    <h4 class="card-title" [style.color]="getTitleColor(event.id)">{{ event.name }}</h4>
                    <span class="card-type" [style.color]="getSubtitleColor(event.id)">{{ event.event_type }}</span>
                    <span class="card-date" [style.color]="getSubtitleColor(event.id)">{{ formatDate(event.event_date) }}</span>
                    <div class="card-mode">
                      <span class="material-icons">{{ event.event_mode === 'open' ? 'public' : 'lock' }}</span>
                      {{ event.event_mode === 'open' ? 'Abierto' : 'Privado' }}
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <button class="nav-arrow nav-right" (click)="navigate(1)" [disabled]="activeIndex() === events().length - 1">
            <span class="material-icons">chevron_right</span>
          </button>

          <!-- Dots -->
          @if (events().length > 1) {
            <div class="carousel-dots">
              @for (event of events(); track event.id; let i = $index) {
                <button class="dot" [class.active]="i === activeIndex()" (click)="goTo(i)"></button>
              }
            </div>
          }
        </div>
      }

      <!-- Selected event panel -->
      @if (selectedEvent()) {
        <div class="selected-panel">
          <div class="actions-bar mb-20">
            @if (selectedEvent()!.event_mode === 'open') {
              <a [routerLink]="['/dashboard/registrations', selectedEvent()!.id]" class="action-btn">
                <span class="material-icons">how_to_reg</span> Registrados
              </a>
            } @else {
              <a [routerLink]="['/dashboard/guests', selectedEvent()!.id]" class="action-btn">
                <span class="material-icons">people</span> Invitados
              </a>
            }
            <a [routerLink]="['/dashboard/config', selectedEvent()!.id]" class="action-btn">
              <span class="material-icons">settings</span> Configurar
            </a>
            <a [routerLink]="['/dashboard/cards', selectedEvent()!.id]" class="action-btn">
              <span class="material-icons">style</span> Tarjetas
            </a>
            <a [href]="environment.baseUrl + '/invitacion/' + selectedEvent()!.slug" target="_blank" class="action-btn highlight">
              <span class="material-icons">open_in_new</span> Ver Landing
            </a>
          </div>

          @if (kpis()) {
            @if (isOpenEvent()) {
              <div class="kpi-grid mb-16">
                <div class="kpi-card">
                  <div class="kpi-icon" style="background:rgba(23,162,184,0.15);color:#17a2b8"><span class="material-icons">how_to_reg</span></div>
                  <div><div class="kpi-value" style="color:#17a2b8">{{ registrationStats().registered }}</div><div class="kpi-label">Registrados</div></div>
                </div>
                @if (registrationStats().capacity) {
                  <div class="kpi-card">
                    <div class="kpi-icon" style="background:rgba(40,167,69,0.15);color:#5cb85c"><span class="material-icons">event_seat</span></div>
                    <div><div class="kpi-value" style="color:#5cb85c">{{ registrationStats().capacity! - registrationStats().registered }}</div><div class="kpi-label">Disponibles</div></div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-icon"><span class="material-icons">groups</span></div>
                    <div><div class="kpi-value">{{ registrationStats().capacity }}</div><div class="kpi-label">Cupo total</div></div>
                  </div>
                }
              </div>
              @if (registrationStats().capacity) {
                <div class="progress-section">
                  <div class="flex-between mb-16">
                    <span class="progress-label">Progreso de registro</span>
                    <span class="text-gold" style="font-weight:700">{{ registrationPct() }}%</span>
                  </div>
                  <div class="progress-track"><div [style.width.%]="registrationPct()" class="progress-fill"></div></div>
                  <div class="flex-between mt-16 progress-detail">
                    <span>{{ registrationStats().registered }} / {{ registrationStats().capacity }} registrados</span>
                    <span>{{ registrationStats().capacity! - registrationStats().registered }} disponibles</span>
                  </div>
                </div>
              }
            } @else {
              <div class="kpi-grid mb-16">
                <div class="kpi-card">
                  <div class="kpi-icon"><span class="material-icons">mail</span></div>
                  <div><div class="kpi-value">{{ kpis()!.total_invitations }}</div><div class="kpi-label">Invitaciones</div></div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-icon" style="background:rgba(40,167,69,0.15);color:#5cb85c"><span class="material-icons">check_circle</span></div>
                  <div><div class="kpi-value" style="color:#5cb85c">{{ kpis()!.confirmed_invitations }}</div><div class="kpi-label">Confirmadas</div></div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-icon" style="background:rgba(255,193,7,0.15);color:#ffc107"><span class="material-icons">pending</span></div>
                  <div><div class="kpi-value" style="color:#ffc107">{{ kpis()!.pending_invitations }}</div><div class="kpi-label">Pendientes</div></div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-icon" style="background:rgba(23,162,184,0.15);color:#17a2b8"><span class="material-icons">groups</span></div>
                  <div><div class="kpi-value" style="color:#17a2b8">{{ kpis()!.total_confirmed_guests }}</div><div class="kpi-label">Asistentes</div></div>
                </div>
              </div>
              @if (kpis()!.total_seats > 0) {
                <div class="progress-section">
                  <div class="flex-between mb-16">
                    <span class="progress-label">Progreso de confirmaciones</span>
                    <span class="text-gold" style="font-weight:700">{{ confirmPct() }}%</span>
                  </div>
                  <div class="progress-track"><div [style.width.%]="confirmPct()" class="progress-fill"></div></div>
                  <div class="flex-between mt-16 progress-detail">
                    <span>{{ kpis()!.total_confirmed_guests }} / {{ kpis()!.total_seats }} asientos confirmados</span>
                    <span>{{ kpis()!.total_seats - kpis()!.total_confirmed_guests }} disponibles</span>
                  </div>
                </div>
              }
            }
          }
        </div>
      }

      @if (events().length === 0 && !loading()) {
        <div class="card text-center" style="padding:60px">
          <span class="material-icons" style="font-size:64px;color:rgba(124,92,191,0.3)">event_note</span>
          <h3 class="empty-title">{{ isClient ? 'No tienes eventos asignados' : 'No hay eventos creados' }}</h3>
          <p class="text-muted" style="margin-bottom:24px">{{ isClient ? 'Contacta al administrador para que te asigne un evento' : 'Crea tu primer evento para comenzar' }}</p>
          @if (!isClient) {
            <a routerLink="/dashboard/events" class="btn btn-primary"><span class="material-icons">add</span> Crear Evento</a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    /* === 3D CAROUSEL === */
    .carousel-3d {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 0 40px;
    }
    .carousel-stage {
      position: relative;
      width: 100%;
      height: 340px;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1000px;
      user-select: none;
      -webkit-user-select: none;
      cursor: grab;
    }
    .carousel-stage:active { cursor: grabbing; }
    .carousel-stage::after {
      content: '';
      position: absolute;
      bottom: 0; left: 10%; right: 10%;
      height: 80px;
      background: linear-gradient(to bottom, rgba(124,92,191,0.06) 0%, transparent 100%);
      border-radius: 50%;
      filter: blur(2px);
      pointer-events: none;
    }

    /* === CARD === */
    .carousel-card-wrapper {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.4s ease, opacity 0.4s ease;
      will-change: transform;
      -webkit-box-reflect: below 6px linear-gradient(to bottom, transparent 65%, rgba(255,255,255,0.18) 100%);
    }
    .carousel-card {
      width: 190px; height: 270px;
      border-radius: 20px;
      overflow: hidden;
      border: 2px solid rgba(255,255,255,0.06);
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      transition: filter 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
      position: relative;
    }

    /* Card hover (non-active) — disabled to prevent reflection flicker */

    /* === CARD MEDIA === */
    .card-media {
      position: absolute; inset: 0; z-index: 0;
      width: 100%; height: 100%; object-fit: cover;
      animation: mediaIn 0.6s ease;
    }
    .card-media-img { background-size: cover; background-position: center; }
    @keyframes mediaIn { from { opacity: 0; } to { opacity: 1; } }

    /* === GRADIENT OVERLAY === */
    .card-gradient {
      position: absolute; inset: 0; z-index: 1;
      background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.7) 100%);
    }

    /* === CARD BODY === */
    .card-body {
      position: relative; z-index: 2;
      height: 100%; display: flex; flex-direction: column;
      align-items: center; justify-content: flex-end;
      padding: 16px 14px; text-align: center;
    }
    .card-badge {
      position: absolute; top: 14px; right: 14px;
      width: 32px; height: 32px; border-radius: 10px;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
    }
    .card-badge .material-icons { font-size: 17px; color: #fff; }
    .card-title {
      font-size: 15px; font-weight: 700; color: #fff;
      margin-bottom: 4px; text-shadow: 0 2px 8px rgba(0,0,0,0.6);
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;
    }
    .card-type {
      font-size: 11px; color: rgba(255,255,255,0.85);
      text-transform: uppercase; letter-spacing: 0.6px; font-weight: 600;
    }
    .card-date { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 2px; }
    .card-mode {
      display: flex; align-items: center; gap: 3px;
      font-size: 10px; color: rgba(255,255,255,0.7);
      margin-top: 6px; padding: 3px 8px; border-radius: 10px;
      background: rgba(255,255,255,0.1); backdrop-filter: blur(4px);
    }
    .card-mode .material-icons { font-size: 11px; }

    /* === NAV ARROWS === */
    .nav-arrow {
      position: absolute; top: 50%; transform: translateY(-50%);
      z-index: 20; width: 44px; height: 44px; border-radius: 50%;
      border: 1px solid rgba(124,92,191,0.3);
      background: rgba(26,26,42,0.9); color: var(--gold-light);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; backdrop-filter: blur(8px);
    }
    .nav-arrow:hover:not(:disabled) { background: rgba(124,92,191,0.2); border-color: var(--gold); transform: translateY(-50%) scale(1.1); }
    .nav-arrow:disabled { opacity: 0.3; cursor: default; }
    .nav-left { left: 10px; }
    .nav-right { right: 10px; }
    .nav-arrow .material-icons { font-size: 24px; }

    /* === DOTS === */
    .carousel-dots {
      display: flex; justify-content: center; gap: 8px;
      position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
    }
    .dot {
      width: 10px; height: 10px; border-radius: 50%; border: none;
      background: rgba(124,92,191,0.3); cursor: pointer; transition: all 0.3s;
    }
    .dot.active { background: var(--gold); transform: scale(1.2); }
    .dot:hover:not(.active) { background: rgba(124,92,191,0.6); }

    /* === SELECTED PANEL === */
    .selected-panel { animation: fadeUp 0.3s ease; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .actions-bar { display: flex; gap: 10px; flex-wrap: wrap; }
    .mb-20 { margin-bottom: 20px; }
    .action-btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 10px 18px; border-radius: 12px;
      font-size: 13px; font-weight: 500; text-decoration: none;
      border: 1px solid rgba(124,92,191,0.2);
      background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.8);
      transition: all 0.2s; cursor: pointer;
    }
    .action-btn:hover {
      border-color: var(--gold); background: rgba(124,92,191,0.08);
      color: var(--gold-light); transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(124,92,191,0.15);
    }
    .action-btn .material-icons { font-size: 18px; color: var(--gold); }
    .action-btn.highlight {
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      border-color: transparent; color: #fff;
    }
    .action-btn.highlight .material-icons { color: #fff; }
    .action-btn.highlight:hover { box-shadow: 0 6px 20px rgba(124,92,191,0.4); }

    /* === KPI / PROGRESS === */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; }
    .progress-section {
      background: rgba(255,255,255,0.02); border: 1px solid rgba(124,92,191,0.12);
      border-radius: 14px; padding: 20px;
    }
    .progress-label { font-size: 14px; color: rgba(255,255,255,0.7); }
    .progress-track { background: rgba(255,255,255,0.08); border-radius: 8px; height: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-light)); border-radius: 8px; transition: width 0.6s ease; }
    .progress-detail { font-size: 13px; color: rgba(255,255,255,0.5); }
    .empty-title { margin: 16px 0 8px; color: rgba(255,255,255,0.7); }

    /* === LIGHT MODE === */
    :host-context(body.light-mode) .nav-arrow { background: #fff; border-color: #e0e0e8; color: var(--gold); }
    :host-context(body.light-mode) .nav-arrow:hover:not(:disabled) { background: #f8f8fc; border-color: var(--gold); }
    :host-context(body.light-mode) .carousel-card { border-color: rgba(0,0,0,0.06); box-shadow: 0 10px 40px rgba(0,0,0,0.12); }
    :host-context(body.light-mode) .carousel-card-wrapper.is-active .carousel-card { border-color: var(--gold); box-shadow: 0 20px 60px rgba(124,92,191,0.15), 0 0 0 1px var(--gold); }
    :host-context(body.light-mode) .card-reflect { opacity: 0.08; }
    :host-context(body.light-mode) .dot { background: rgba(124,92,191,0.2); }
    :host-context(body.light-mode) .dot.active { background: var(--gold); }
    :host-context(body.light-mode) .action-btn { background: #fff; border-color: #e0e0e8; color: #555; }
    :host-context(body.light-mode) .action-btn:hover { background: #fafafa; border-color: var(--gold); color: var(--gold); }
    :host-context(body.light-mode) .progress-section { background: #fff; border-color: #e0e0e8; }
    :host-context(body.light-mode) .progress-label { color: #555; }
    :host-context(body.light-mode) .progress-track { background: rgba(0,0,0,0.06); }
    :host-context(body.light-mode) .progress-detail { color: #888; }
    :host-context(body.light-mode) .empty-title { color: #555; }

    /* === RESPONSIVE === */
    @media (max-width: 768px) {
      .carousel-stage { height: 290px; }
      .carousel-card { width: 155px; height: 225px; border-radius: 16px; }
      .nav-arrow { width: 36px; height: 36px; }
      .nav-left { left: 2px; }
      .nav-right { right: 2px; }
      .kpi-grid { grid-template-columns: 1fr 1fr; }
      .actions-bar { gap: 8px; }
      .action-btn { padding: 8px 14px; font-size: 12px; }
      .card-title { font-size: 13px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  events = signal<Event[]>([]);
  selectedEvent = signal<Event | null>(null);
  kpis = signal<KPIs | null>(null);
  loading = signal(true);
  activeIndex = signal(0);
  environment = environment;
  user = this.auth.getUser();
  isClient = this.user?.role === 'client';
  themes = signal<Record<number, { theme: any; heroBackground: string | null; globalStyles: any }>>({});
  registrationStats = signal<{ registered: number; capacity: number | null }>({ registered: 0, capacity: null });

  ngOnInit() {
    this.api.getEvents().subscribe(events => {
      this.events.set(events);
      this.loading.set(false);
      if (events.length > 0) this.goTo(0);
    });
    this.api.getEventThemes().subscribe(themes => this.themes.set(themes));
  }

  navigate(dir: number) {
    const next = this.activeIndex() + dir;
    if (next >= 0 && next < this.events().length) {
      this.goTo(next);
    }
  }

  // === CONTINUOUS DRAG CAROUSEL ===
  isDragging = false;
  dragOffset = signal(0); // continuous offset in px during drag
  private swipeStartX = 0;
  private swipeStartTime = 0;
  private readonly CARD_SPACING = 200; // px between cards

  onSwipeStart(e: MouseEvent) {
    e.preventDefault();
    this.isDragging = true;
    this.swipeStartX = e.clientX;
    this.swipeStartTime = Date.now();

    const onMove = (ev: MouseEvent) => {
      ev.preventDefault();
      this.dragOffset.set(ev.clientX - this.swipeStartX);
    };
    const onUp = (ev: MouseEvent) => {
      this.finishDrag(ev.clientX);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  onSwipeTouchStart(e: TouchEvent) {
    this.isDragging = true;
    this.swipeStartX = e.touches[0].clientX;
    this.swipeStartTime = Date.now();

    const onMove = (ev: TouchEvent) => {
      this.dragOffset.set(ev.touches[0].clientX - this.swipeStartX);
    };
    const onEnd = (ev: TouchEvent) => {
      if (ev.changedTouches.length) {
        this.finishDrag(ev.changedTouches[0].clientX);
      }
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd);
  }

  private finishDrag(endX: number) {
    const dist = endX - this.swipeStartX;
    const elapsed = Date.now() - this.swipeStartTime;
    const velocity = dist / Math.max(elapsed, 1); // px/ms (signed)

    // Determine how many cards to advance based on drag distance + velocity
    let cardsMoved = Math.round(-dist / this.CARD_SPACING);
    // Add momentum based on velocity
    if (Math.abs(velocity) > 0.5) {
      cardsMoved += velocity < 0 ? 1 : -1;
    }

    // Clamp to valid range
    const target = Math.max(0, Math.min(this.events().length - 1, this.activeIndex() + cardsMoved));

    this.isDragging = false;
    this.dragOffset.set(0);
    this.goTo(target);
  }

  // === CARD POSITIONING (continuous) ===
  private getCardOffset(index: number): number {
    const baseOffset = (index - this.activeIndex()) * this.CARD_SPACING;
    return baseOffset + (this.isDragging ? this.dragOffset() : 0);
  }

  getCardTransform(index: number): string {
    const offset = this.getCardOffset(index);
    const normalized = offset / this.CARD_SPACING; // -N..0..+N
    const scale = Math.max(0.6, 1.1 - Math.abs(normalized) * 0.15);
    const rotateY = normalized * -8;
    return `translateX(${offset}px) scale(${scale}) rotateY(${rotateY}deg)`;
  }

  getCardOpacity(index: number): number {
    const offset = this.getCardOffset(index);
    const normalized = Math.abs(offset) / this.CARD_SPACING;
    if (normalized > 3) return 0;
    return Math.max(0, 1 - normalized * 0.25);
  }

  getCardZIndex(index: number): number {
    const offset = this.getCardOffset(index);
    return 100 - Math.round(Math.abs(offset) / 10);
  }

  getCardPointerEvents(index: number): string {
    const offset = this.getCardOffset(index);
    const normalized = Math.abs(offset) / this.CARD_SPACING;
    return normalized > 2 ? 'none' : 'auto';
  }

  getCardFilter(index: number): string {
    const offset = this.getCardOffset(index);
    const normalized = Math.abs(offset) / this.CARD_SPACING;
    const brightness = Math.max(0.4, 1 - normalized * 0.25);
    return normalized < 0.1 ? 'none' : `brightness(${brightness})`;
  }

  getCardBorderColor(index: number): string {
    const offset = this.getCardOffset(index);
    const normalized = Math.abs(offset) / this.CARD_SPACING;
    return normalized < 0.3 ? 'var(--gold)' : 'rgba(255,255,255,0.06)';
  }

  getCardShadow(index: number): string {
    const offset = this.getCardOffset(index);
    const normalized = Math.abs(offset) / this.CARD_SPACING;
    if (normalized < 0.3) return '0 20px 60px rgba(124,92,191,0.3), 0 0 0 1px var(--gold)';
    return '0 10px 40px rgba(0,0,0,0.4)';
  }

  onCardClick(index: number) {
    if (!this.isDragging && Math.abs(this.dragOffset()) < 5) {
      this.goTo(index);
    }
  }

  goTo(index: number) {
    this.activeIndex.set(index);
    const event = this.events()[index];
    if (event) {
      this.selectedEvent.set(event);
      this.kpis.set(null);
      this.api.getKPIs(event.id).subscribe(k => this.kpis.set(k));
      if (event.event_mode === 'open') {
        this.api.getRegistrationStats(event.id).subscribe(s => this.registrationStats.set(s));
      }
    }
  }

  getCardBackground(eventId: number): string {
    const t = this.themes()[eventId];
    if (t?.theme) {
      const theme = t.theme;
      const c1 = theme.landingBgColor1 || theme.buttonBg || '#2d2b55';
      const c2 = theme.landingBgColor2 || theme.navFooterText || '#1a1a2a';
      const type = theme.landingBgType || 'linear';
      const angle = theme.landingBgAngle || 135;
      if (type === 'solid') return c1;
      if (type === 'radial') return `radial-gradient(circle, ${c1}, ${c2})`;
      return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
    }
    return 'linear-gradient(135deg, #2d2b55, #1a1a2a)';
  }

  getHeroMedia(eventId: number): string | null {
    const t = this.themes()[eventId];
    return t?.heroBackground || null;
  }

  getMediaUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Build absolute URL using current origin (e.g. http://localhost)
    return window.location.origin + '/' + path;
  }

  isVideo(url: string): boolean {
    const lower = url.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm');
  }

  getTitleColor(eventId: number): string {
    const t = this.themes()[eventId];
    if (t?.globalStyles?.sectionHeadingStyle?.color) {
      return t.globalStyles.sectionHeadingStyle.color;
    }
    if (t?.theme?.textPrimary) return t.theme.textPrimary;
    return '#ffffff';
  }

  getSubtitleColor(eventId: number): string {
    const t = this.themes()[eventId];
    if (t?.globalStyles?.subtitleStyle?.color) {
      return t.globalStyles.subtitleStyle.color;
    }
    if (t?.theme?.textSecondary) return t.theme.textSecondary;
    return 'rgba(255,255,255,0.8)';
  }

  getEventIcon(type: string): string {
    const icons: Record<string, string> = {
      'Boda': 'favorite',
      'XV Años': 'cake',
      'Cumpleaños': 'celebration',
      'Bautizo': 'child_care',
      'Graduación': 'school',
      'Empresarial': 'business',
      'Conferencia': 'groups',
    };
    return icons[type] || 'event';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }

  isOpenEvent(): boolean {
    return this.selectedEvent()?.event_mode === 'open';
  }

  registrationPct(): number {
    const s = this.registrationStats();
    if (!s.capacity || s.capacity === 0) return 0;
    return Math.round((s.registered / s.capacity) * 100);
  }

  confirmPct() {
    const k = this.kpis();
    if (!k || !k.total_seats || k.total_seats === 0) return 0;
    return Math.round((k.total_confirmed_guests / k.total_seats) * 100);
  }
}
