import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '../../../core/services/api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventConfig } from '../../../core/models/models';

interface BuilderSection {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, RouterLink, DragDropModule],
  template: `
    <!-- Toolbar -->
    <div class="builder-toolbar">
      <div class="builder-toolbar-left">
        <a routerLink="/dashboard" class="builder-back" title="Volver">
          <span class="material-icons">arrow_back</span>
        </a>
        <span class="builder-event-name">{{ eventName() }}</span>
      </div>
      <div class="builder-toolbar-center">
        <button class="builder-device-btn" [class.active]="previewDevice() === 'mobile'" (click)="previewDevice.set('mobile')">
          <span class="material-icons">phone_iphone</span>
        </button>
        <button class="builder-device-btn" [class.active]="previewDevice() === 'tablet'" (click)="previewDevice.set('tablet')">
          <span class="material-icons">tablet</span>
        </button>
        <button class="builder-device-btn" [class.active]="previewDevice() === 'desktop'" (click)="previewDevice.set('desktop')">
          <span class="material-icons">monitor</span>
        </button>
      </div>
      <div class="builder-toolbar-right">
        <button class="builder-save-btn" (click)="save()" [disabled]="saving()">
          <span class="material-icons">{{ saveStatus() === 'saved' ? 'check_circle' : 'save' }}</span>
          <span>{{ saving() ? 'Guardando...' : saveStatus() === 'saved' ? 'Guardado' : 'Guardar' }}</span>
        </button>
      </div>
    </div>

    <div class="builder-layout">
      <!-- Left Panel: Components -->
      <aside class="builder-panel builder-panel-left">
        <div class="builder-panel-header">
          <span class="material-icons">widgets</span>
          <span>Secciones</span>
        </div>
        <div class="builder-sections-list" cdkDropList (cdkDropListDropped)="onDrop($event)">
          @for (section of sections(); track section.key) {
            <div class="builder-section-item" cdkDrag [class.active]="selectedSection() === section.key" [class.disabled]="!section.enabled" (click)="selectSection(section.key)">
              <span class="material-icons drag-handle" cdkDragHandle>drag_indicator</span>
              <span class="material-icons section-icon">{{ section.icon }}</span>
              <span class="section-label">{{ section.label }}</span>
              <button class="section-toggle" (click)="toggleSection(section.key); $event.stopPropagation()">
                <span class="material-icons">{{ section.enabled ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
          }
        </div>
      </aside>

      <!-- Center: Preview -->
      <div class="builder-preview">
        <div class="builder-preview-frame" [class.mobile]="previewDevice() === 'mobile'" [class.tablet]="previewDevice() === 'tablet'" [class.desktop]="previewDevice() === 'desktop'">
          <iframe [src]="previewUrl()" class="builder-iframe"></iframe>
        </div>
      </div>

      <!-- Right Panel: Properties -->
      <aside class="builder-panel builder-panel-right">
        <div class="builder-panel-header">
          <span class="material-icons">tune</span>
          <span>Propiedades</span>
        </div>
        @if (selectedSection() && config()) {
          <div class="builder-props">
            <div class="builder-prop-group">
              <label class="builder-prop-label">Sección</label>
              <p class="builder-prop-value">{{ getSelectedLabel() }}</p>
            </div>

            @if (getSelectedConfig(); as secCfg) {
              @if (secCfg.title !== undefined) {
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Título</label>
                  <input type="text" class="builder-input" [value]="secCfg.title" (input)="updateProp('title', $event)">
                </div>
              }
              @if (secCfg.subtitle !== undefined) {
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Subtítulo</label>
                  <input type="text" class="builder-input" [value]="secCfg.subtitle" (input)="updateProp('subtitle', $event)">
                </div>
              }
              @if (secCfg.description !== undefined) {
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Descripción</label>
                  <textarea class="builder-input builder-textarea" [value]="secCfg.description" (input)="updateProp('description', $event)"></textarea>
                </div>
              }
            }

            <div class="builder-prop-divider"></div>
            <a [routerLink]="['/dashboard/config', eventId]" class="builder-advanced-link">
              <span class="material-icons">settings</span>
              Abrir configuración avanzada
            </a>
          </div>
        } @else {
          <div class="builder-props-empty">
            <span class="material-icons">touch_app</span>
            <p>Selecciona una sección para ver sus propiedades</p>
          </div>
        }
      </aside>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 24px); overflow: hidden; }

    .builder-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px; background: rgba(10,10,20,0.9);
      border-bottom: 1px solid rgba(139,92,246,0.15);
      backdrop-filter: blur(12px); z-index: 10; position: relative;
    }
    .builder-toolbar-left { display: flex; align-items: center; gap: 12px; }
    .builder-back {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 8px; color: rgba(255,255,255,0.6);
      text-decoration: none; transition: all 0.2s;
      &:hover { color: white; background: rgba(139,92,246,0.15); }
    }
    .builder-event-name { font-size: 14px; font-weight: 600; color: white; }
    .builder-toolbar-center { display: flex; gap: 4px; }
    .builder-device-btn {
      width: 32px; height: 32px; border-radius: 8px; border: none;
      background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      .material-icons { font-size: 18px; }
      &.active { background: rgba(139,92,246,0.2); color: #c084fc; border: 1px solid rgba(139,92,246,0.4); }
      &:hover:not(.active) { background: rgba(255,255,255,0.1); color: white; }
    }
    .builder-toolbar-right { display: flex; align-items: center; }
    .builder-save-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,92,191,0.4); }
      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    }

    .builder-layout {
      display: grid; grid-template-columns: 240px 1fr 260px;
      height: calc(100% - 53px); overflow: hidden;
    }

    .builder-panel {
      background: rgba(10,10,20,0.85); backdrop-filter: blur(12px);
      border-right: 1px solid rgba(139,92,246,0.1);
      overflow-y: auto;
    }
    .builder-panel-right { border-right: none; border-left: 1px solid rgba(139,92,246,0.1); }
    .builder-panel-header {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 16px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7);
      border-bottom: 1px solid rgba(139,92,246,0.08);
      .material-icons { font-size: 18px; color: var(--gold-light); }
    }

    .builder-sections-list { padding: 8px; }
    .builder-section-item {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; border-radius: 10px; margin-bottom: 4px;
      cursor: pointer; transition: all 0.2s;
      border: 1px solid transparent;
      &:hover { background: rgba(139,92,246,0.06); }
      &.active { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.3); }
      &.disabled { opacity: 0.4; }
    }
    .drag-handle { font-size: 16px; color: rgba(255,255,255,0.25); cursor: grab; }
    .section-icon { font-size: 18px; color: var(--gold-light); }
    .section-label { flex: 1; font-size: 13px; color: rgba(255,255,255,0.8); }
    .section-toggle {
      background: none; border: none; cursor: pointer; padding: 2px;
      color: rgba(255,255,255,0.4); display: flex; transition: color 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { color: var(--gold-light); }
    }

    .builder-preview {
      display: flex; align-items: center; justify-content: center;
      background: #0a0a14; padding: 20px; overflow: hidden;
    }
    .builder-preview-frame {
      background: #000; border-radius: 24px; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.08);
      transition: all 0.3s;
      &.mobile { width: 375px; height: calc(100vh - 120px); max-height: 780px; }
      &.tablet { width: 768px; height: calc(100vh - 120px); max-height: 900px; }
      &.desktop { width: 100%; height: calc(100vh - 120px); border-radius: 12px; }
    }
    .builder-iframe { width: 100%; height: 100%; border: none; border-radius: inherit; }

    .builder-props { padding: 16px; }
    .builder-prop-group { margin-bottom: 16px; }
    .builder-prop-label { font-size: 11px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }
    .builder-prop-value { font-size: 14px; color: var(--gold-light); font-weight: 600; }
    .builder-input {
      width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(139,92,246,0.2);
      border-radius: 8px; padding: 10px 12px; color: white; font-size: 13px;
      font-family: var(--font-sans); transition: border-color 0.2s;
      &:focus { outline: none; border-color: rgba(139,92,246,0.5); }
    }
    .builder-textarea { min-height: 80px; resize: vertical; }
    .builder-prop-divider { height: 1px; background: rgba(139,92,246,0.1); margin: 20px 0; }
    .builder-advanced-link {
      display: flex; align-items: center; gap: 8px; font-size: 13px;
      color: var(--gold-light); text-decoration: none; padding: 10px 12px;
      border-radius: 8px; transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { background: rgba(139,92,246,0.1); }
    }
    .builder-props-hint { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 8px; strong { color: var(--gold-light); } }
    .builder-props-desc { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.6; a { color: var(--gold-light); } }
    .builder-props-empty {
      padding: 40px 16px; text-align: center;
      .material-icons { font-size: 36px; color: rgba(139,92,246,0.3); margin-bottom: 12px; }
      p { font-size: 13px; color: rgba(255,255,255,0.35); }
    }

    /* CDK Drag styles */
    .cdk-drag-preview { border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .cdk-drag-placeholder { opacity: 0.3; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }

    @media (max-width: 900px) {
      .builder-layout { grid-template-columns: 1fr; }
      .builder-panel { display: none; }
    }
  `]
})
export class BuilderComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  eventId = 0;
  eventName = signal('');
  eventSlug = '';
  config = signal<EventConfig | null>(null);
  sections = signal<BuilderSection[]>([]);
  selectedSection = signal<string | null>(null);
  previewDevice = signal<'mobile' | 'tablet' | 'desktop'>('mobile');
  saving = signal(false);
  saveStatus = signal<'idle' | 'saved'>('idle');
  private isDirty = false;

  hasUnsavedChanges(): boolean { return this.isDirty; }

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    this.api.getEvent(this.eventId).subscribe(e => { this.eventName.set(e.name); this.eventSlug = e.slug; });
    this.api.getConfig(this.eventId).subscribe(c => {
      const cfg = c.config_json;
      this.config.set(cfg);
      this.buildSections(cfg);
    });
  }

  private buildSections(cfg: any) {
    this.sections.set([
      { key: 'envelope', label: 'Pantalla de Inicio', icon: 'mail', enabled: cfg.envelope?.enabled ?? false },
      { key: 'intro', label: 'Intro', icon: 'auto_awesome', enabled: cfg.intro?.enabled ?? false },
      { key: 'hero', label: 'Carátula', icon: 'image', enabled: true },
      { key: 'invitation', label: 'Invitación', icon: 'card_giftcard', enabled: true },
      { key: 'details', label: 'Detalles', icon: 'info', enabled: cfg.details?.enabled ?? false },
      { key: 'venues', label: 'Lugares', icon: 'place', enabled: cfg.venues?.enabled ?? false },
      { key: 'itinerary', label: 'Itinerario', icon: 'schedule', enabled: cfg.itinerary?.enabled ?? false },
      { key: 'gallery', label: 'Galería', icon: 'photo_library', enabled: cfg.gallery?.enabled ?? false },
      { key: 'dresscode', label: 'Vestimenta', icon: 'checkroom', enabled: cfg.dresscode?.enabled ?? false },
      { key: 'gifts', label: 'Regalos', icon: 'redeem', enabled: cfg.gifts?.enabled ?? false },
      { key: 'rsvp', label: 'Confirmación', icon: 'how_to_reg', enabled: cfg.rsvp?.enabled ?? false },
    ]);
  }

  previewUrl(): SafeResourceUrl {
    if (!this.eventSlug) return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    const url = window.location.origin + '/invitacion/' + this.eventSlug;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  selectSection(key: string) {
    this.selectedSection.set(this.selectedSection() === key ? null : key);
  }

  getSelectedLabel(): string {
    return this.sections().find(s => s.key === this.selectedSection())?.label || '';
  }

  getSelectedConfig(): any {
    const key = this.selectedSection();
    if (!key || !this.config()) return null;
    return (this.config() as any)[key] || null;
  }

  updateProp(prop: string, event: any) {
    const key = this.selectedSection();
    if (!key || !this.config()) return;
    const value = event.target.value;
    (this.config() as any)[key][prop] = value;
    this.isDirty = true;
  }

  toggleSection(key: string) {
    const s = this.sections();
    const idx = s.findIndex(x => x.key === key);
    if (idx >= 0) {
      s[idx].enabled = !s[idx].enabled;
      this.sections.set([...s]);
      this.isDirty = true;
    }
  }

  onDrop(event: CdkDragDrop<BuilderSection[]>) {
    const s = this.sections();
    moveItemInArray(s, event.previousIndex, event.currentIndex);
    this.sections.set([...s]);
    this.isDirty = true;
  }

  save() {
    this.saving.set(true);
    // For now, save enabled/disabled states back to config
    const cfg = this.config();
    if (!cfg) return;
    const s = this.sections();
    for (const sec of s) {
      if (sec.key in cfg && typeof (cfg as any)[sec.key] === 'object') {
        (cfg as any)[sec.key].enabled = sec.enabled;
      }
    }
    this.api.saveConfig(this.eventId, cfg).subscribe({
      next: () => { this.saving.set(false); this.saveStatus.set('saved'); this.isDirty = false; setTimeout(() => this.saveStatus.set('idle'), 3000); },
      error: () => { this.saving.set(false); }
    });
  }
}
