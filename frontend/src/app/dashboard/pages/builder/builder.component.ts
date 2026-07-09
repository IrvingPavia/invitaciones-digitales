import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '../../../core/services/api.service';
import { ColorPickerComponent } from '../../../core/components/color-picker.component';
import { EventConfig, CanvasElementType, ELEMENT_DEFAULTS } from '../../../core/models/models';
import { CanvasStateService } from './services/canvas-state.service';
import { MigrationService } from './services/migration.service';
import { SectionCanvasComponent } from './components/section-canvas/section-canvas.component';
import { BuilderPropsPanelComponent } from './components/props-panel/props-panel.component';
import { LandingEnvelopeComponent } from '../../../landing/sections/envelope/envelope.component';
import { LandingIntroComponent } from '../../../landing/sections/intro/intro.component';
import { LandingHeroComponent } from '../../../landing/sections/hero/hero.component';
import { LandingInvitationComponent } from '../../../landing/sections/invitation/invitation.component';
import { LandingDetailsComponent } from '../../../landing/sections/details/details.component';
import { LandingVenuesComponent } from '../../../landing/sections/venues/venues.component';
import { LandingItineraryComponent } from '../../../landing/sections/itinerary/itinerary.component';
import { LandingGalleryComponent } from '../../../landing/sections/gallery/gallery.component';
import { LandingDresscodeComponent } from '../../../landing/sections/dresscode/dresscode.component';
import { LandingGiftsComponent } from '../../../landing/sections/gifts/gifts.component';

interface BuilderSection {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, ColorPickerComponent, SectionCanvasComponent, BuilderPropsPanelComponent,
    LandingEnvelopeComponent, LandingIntroComponent, LandingHeroComponent, LandingInvitationComponent,
    LandingDetailsComponent, LandingVenuesComponent, LandingItineraryComponent, LandingGalleryComponent,
    LandingDresscodeComponent, LandingGiftsComponent],
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
        <button class="builder-tb-btn" (click)="canvasState.undo()" [disabled]="!canvasState.canUndo" title="Deshacer">
          <span class="material-icons">undo</span>
        </button>
        <button class="builder-tb-btn" (click)="canvasState.redo()" [disabled]="!canvasState.canRedo" title="Rehacer">
          <span class="material-icons">redo</span>
        </button>
        <div class="builder-tb-sep"></div>
        <button class="builder-device-btn" [class.active]="previewDevice() === 'mobile'" (click)="previewDevice.set('mobile')">
          <span class="material-icons">phone_iphone</span>
        </button>
        <button class="builder-device-btn" [class.active]="previewDevice() === 'desktop'" (click)="previewDevice.set('desktop')">
          <span class="material-icons">monitor</span>
        </button>
        <div class="builder-tb-sep"></div>
        <button class="builder-mode-toggle" [class.preview]="canvasMode() === 'preview'" (click)="toggleCanvasMode()">
          <span class="material-icons">{{ canvasMode() === 'canvas' ? 'edit' : 'visibility' }}</span>
          <span>{{ canvasMode() === 'canvas' ? 'Canvas' : 'Preview' }}</span>
        </button>
        @if (canvasMode() === 'preview') {
          <button class="builder-tb-btn" (click)="reloadPreview()" title="Recargar preview">
            <span class="material-icons">refresh</span>
          </button>
        }
      </div>
      <div class="builder-toolbar-right">
        <button class="builder-save-btn" [class.saved]="saveStatus() === 'saved'" (click)="save()" [disabled]="saving()">
          <span class="material-icons">{{ saveStatus() === 'saved' ? 'check_circle' : 'save' }}</span>
          <span class="builder-save-text">{{ saving() ? 'Guardando...' : saveStatus() === 'saved' ? 'Guardado' : 'Guardar' }}</span>
        </button>
      </div>
    </div>

    <div class="builder-layout" [class.preview-layout]="canvasMode() === 'preview'" [class.panel-hidden]="!panelVisible()" [class.props-open]="showProps() && canvasMode() === 'canvas'">
      <!-- Left Panel: Sections + Elements (hidden in preview) -->
      @if (canvasMode() === 'canvas' && panelVisible()) {
      <aside class="builder-panel builder-panel-left" [class.mobile-open]="showLeftPanel()">
        <div class="builder-panel-header">
          <span class="material-icons">layers</span>
          <span>Secciones</span>
          <button class="panel-toggle-btn" (click)="panelVisible.set(false)" title="Ocultar secciones">
            <span class="material-icons">chevron_left</span>
          </button>
        </div>
        <!-- Theme Global button -->
        <div class="builder-theme-btn" [class.active]="canvasState.selectedSection() === '_theme'" (click)="selectTheme()">
          <span class="material-icons">palette</span>
          <span>Tema Global</span>
        </div>
        <div class="builder-sections-list" cdkDropList (cdkDropListDropped)="onSectionDrop($event)">
          @for (section of sections(); track section.key) {
            <div class="builder-section-item" cdkDrag
                 [class.active]="canvasState.selectedSection() === section.key"
                 [class.disabled]="!section.enabled"
                 (click)="selectSection(section.key)">
              <span class="material-icons drag-handle" cdkDragHandle>drag_indicator</span>
              <span class="material-icons section-icon">{{ section.icon }}</span>
              <span class="section-label">{{ section.label }}</span>
              <button class="section-toggle" (click)="toggleSection(section.key); $event.stopPropagation()">
                <span class="material-icons">{{ section.enabled ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
          }
        </div>

        <!-- Add Element buttons (hidden — see docs/BUILDER-FREE-ELEMENTS.md for future implementation) -->
      </aside>
      }

      <!-- Center: Canvas or Preview iframe -->
      @if (canvasMode() === 'canvas') {
      <div class="builder-canvas-area" (click)="onCanvasAreaClick()">
        <div class="builder-canvas-viewport" [class.mobile]="previewDevice() === 'mobile'" [class.desktop]="previewDevice() === 'desktop'" [class.live-preview]="canvasMode() === 'preview'">          @if (canvasState.config()) {
              <div class="preview-mode-canvas" [style.--theme-card-bg]="canvasState.config()?.theme?.cardBg || 'rgba(255,255,255,0.05)'" [style.--theme-card-border]="canvasState.config()?.theme?.cardBorder || 'rgba(212,160,23,0.3)'" [style.--theme-text-primary]="canvasState.config()?.theme?.textPrimary || '#ffffff'" [style.--theme-text-secondary]="canvasState.config()?.theme?.textSecondary || 'rgba(255,255,255,0.7)'" [style.--theme-nav-text]="canvasState.config()?.theme?.navFooterText || '#d4a017'" [style.--theme-btn-bg]="canvasState.config()?.theme?.buttonBg || '#d4a017'" [style.--theme-btn-text]="canvasState.config()?.theme?.buttonText || '#1a1a2e'" [style.background]="getCanvasLandingBg()">
                @if (canvasState.config()?.hero?.backgroundGif) {
                  @if (isCanvasBgVideo()) {
                    <video class="canvas-bg-media" autoplay loop muted playsinline [src]="canvasState.config()!.hero.backgroundGif"></video>
                  } @else {
                    <div class="canvas-bg-image" [style.backgroundImage]="'url(' + canvasState.config()!.hero.backgroundGif + ')'"></div>
                  }
                  <div class="canvas-bg-overlay"></div>
                }
                @if (canvasState.config()?.envelope?.enabled) {
                  <div class="preview-section-click" data-section="envelope" [class.section-active]="canvasState.selectedSection() === 'envelope'" (click)="selectSection('envelope'); $event.stopPropagation()">
                    <app-landing-envelope [config]="canvasState.config()!.envelope" [globalStyles]="canvasState.config()?.globalStyles!" [previewLoop]="canvasMode() === 'preview'" />
                  </div>
                }
                @if (canvasState.config()?.intro?.enabled) {
                  <div class="preview-section-click" data-section="intro" [class.section-active]="canvasState.selectedSection() === 'intro'" (click)="selectSection('intro'); $event.stopPropagation()">
                    <app-landing-intro [config]="canvasState.config()!.intro" [themeColor]="canvasState.config()?.theme?.navFooterText || '#d4a017'" [themeBg]="canvasState.config()?.theme?.cardBg || ''" [themeBorder]="canvasState.config()?.theme?.cardBorder || ''" [previewLoop]="true" />
                  </div>
                }
                <div class="preview-section-click" data-section="hero" [class.section-active]="canvasState.selectedSection() === 'hero'" (click)="selectSection('hero'); $event.stopPropagation()">
                  @if (canvasState.config()!.hero) {
                    <app-landing-hero [config]="canvasState.config()!.hero" [event]="eventData()" [enabledSections]="getPreviewEnabledSections()" />
                  }
                </div>
                <div class="preview-section-click" data-section="invitation" [class.section-active]="canvasState.selectedSection() === 'invitation'" [attr.style]="getSectionBgStyle('invitation')" (click)="selectSection('invitation'); $event.stopPropagation()">
                  @if (canvasState.config()!.invitation) {
                    <app-landing-invitation [config]="canvasState.config()!.invitation" [guest]="null" [styles]="canvasState.config()?.globalStyles!" />
                  }
                </div>
                @if (canvasState.config()?.details?.enabled) {
                  <div class="preview-section-click" data-section="details" [class.section-active]="canvasState.selectedSection() === 'details'" [attr.style]="getSectionBgStyle('details')" (click)="selectSection('details'); $event.stopPropagation()">
                    <app-landing-details [config]="canvasState.config()!.details" [styles]="canvasState.config()?.globalStyles!" />
                  </div>
                }
                @if (canvasState.config()?.venues?.enabled) {
                  <div class="preview-section-click" data-section="venues" [class.section-active]="canvasState.selectedSection() === 'venues'" [attr.style]="getSectionBgStyle('venues')" (click)="selectSection('venues'); $event.stopPropagation()">
                    <app-landing-venues [config]="canvasState.config()!.venues" [styles]="canvasState.config()?.globalStyles!" />
                  </div>
                }
                @if (canvasState.config()?.itinerary?.enabled) {
                  <div class="preview-section-click" data-section="itinerary" [class.section-active]="canvasState.selectedSection() === 'itinerary'" [attr.style]="getSectionBgStyle('itinerary')" (click)="selectSection('itinerary'); $event.stopPropagation()">
                    <app-landing-itinerary [config]="canvasState.config()!.itinerary" [items]="itineraryItems()" [styles]="canvasState.config()?.globalStyles!" />
                  </div>
                }
                @if (canvasState.config()?.gallery?.enabled) {
                  <div class="preview-section-click" data-section="gallery" [class.section-active]="canvasState.selectedSection() === 'gallery'" [attr.style]="getSectionBgStyle('gallery')" (click)="selectSection('gallery'); $event.stopPropagation()">
                    <app-landing-gallery [config]="canvasState.config()!.gallery" [photos]="photos()" [styles]="canvasState.config()?.globalStyles!" />
                  </div>
                }
                @if (canvasState.config()?.dresscode?.enabled) {
                  <div class="preview-section-click" data-section="dresscode" [class.section-active]="canvasState.selectedSection() === 'dresscode'" [attr.style]="getSectionBgStyle('dresscode')" (click)="selectSection('dresscode'); $event.stopPropagation()">
                    <app-landing-dresscode [config]="canvasState.config()!.dresscode" [styles]="canvasState.config()?.globalStyles!" />
                  </div>
                }
                @if (canvasState.config()?.gifts?.enabled) {
                  <div class="preview-section-click" data-section="gifts" [class.section-active]="canvasState.selectedSection() === 'gifts'" [attr.style]="getSectionBgStyle('gifts')" (click)="selectSection('gifts'); $event.stopPropagation()">
                    <app-landing-gifts [config]="canvasState.config()!.gifts" [styles]="canvasState.config()?.globalStyles!" />
                  </div>
                }
              </div>
          }
        </div>
      </div>
      }

      <!-- Preview mode: iframe with real landing -->
      @if (canvasMode() === 'preview') {
      <div class="builder-preview-area">
        <div class="builder-preview-frame" [class.mobile]="previewDevice() === 'mobile'" [class.desktop]="previewDevice() === 'desktop'">
          <iframe [src]="previewUrl()" class="preview-iframe" allow="autoplay"></iframe>
        </div>
      </div>
      }

      <!-- FAB toggle sections panel -->
      <button class="builder-sections-fab" [class.show-desktop]="!panelVisible()" (click)="panelVisible.set(true); showLeftPanel.set(!showLeftPanel())" title="Secciones">
        <span class="material-icons">layers</span>
      </button>

      <!-- FAB toggle props (hidden in preview mode) -->
      @if (canvasMode() === 'canvas') {
      <button class="builder-props-fab" [class.active]="showProps()" (click)="showProps.set(!showProps())" title="Propiedades">
        <span class="material-icons">{{ showProps() ? 'close' : 'tune' }}</span>
      </button>
      }

      <!-- Right Panel: Properties (only in canvas mode) -->
      @if (showProps() && canvasMode() === 'canvas') {
        <aside class="builder-panel builder-panel-right panel-visible">
          <div class="builder-panel-header">
            <span class="material-icons">tune</span>
            <span>Propiedades</span>
          </div>
          <app-builder-props-panel
            [selectedSection]="currentSection()"
            [config]="canvasState.config()"
            [eventId]="eventId"
            [photos]="photos"
            [itineraryItems]="itineraryItems"
          />
        </aside>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      position: fixed;
      inset: 0;
      z-index: 200;
      overflow: hidden;
      background: #0a0a14;
    }
    .builder-toolbar {
      display: flex; align-items: center;
      padding: 8px 16px; background: rgba(10,10,20,0.95);
      border-bottom: 1px solid rgba(139,92,246,0.15);
      z-index: 10; position: relative; min-height: 48px; flex-wrap: wrap; gap: 4px 12px;
    }
    .builder-toolbar-left { display: flex; align-items: center; gap: 12px; flex: 1 0 100%; }
    .builder-toolbar-center { display: flex; align-items: center; gap: 4px; order: 1; }
    .builder-toolbar-right { display: flex; align-items: center; order: 2; margin-left: auto; }
    @media (min-width: 850px) {
      .builder-toolbar-left { flex: 0 0 auto; }
      .builder-toolbar-center { flex: 1; justify-content: center; }
    }
    .builder-back {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 8px; color: rgba(255,255,255,0.6);
      text-decoration: none; transition: all 0.2s;
      &:hover { color: white; background: rgba(139,92,246,0.15); }
    }
    .builder-event-name { font-size: 14px; font-weight: 600; color: white; }
    .builder-toolbar-center { display: flex; align-items: center; gap: 4px; }
    .builder-tb-btn {
      width: 32px; height: 32px; border-radius: 8px; border: none;
      background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      .material-icons { font-size: 18px; }
      &:hover:not(:disabled) { background: rgba(139,92,246,0.15); color: white; }
      &:disabled { opacity: 0.3; cursor: default; }
    }
    .builder-tb-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 8px; }
    .builder-mode-toggle {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(139,92,246,0.3);
      background: rgba(139,92,246,0.08); color: rgba(255,255,255,0.7);
      font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { background: rgba(139,92,246,0.15); color: white; }
      &.preview { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #10b981; }
    }
    .builder-device-btn {
      width: 32px; height: 32px; border-radius: 8px; border: none;
      background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      .material-icons { font-size: 18px; }
      &.active { background: rgba(139,92,246,0.2); color: #c084fc; border: 1px solid rgba(139,92,246,0.4); }
      &:hover:not(.active) { background: rgba(255,255,255,0.1); color: white; }
    }
    .builder-save-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 7px 14px; min-width: 120px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.4s, box-shadow 0.4s;
      .material-icons { font-size: 16px; }
      &:hover { box-shadow: 0 4px 12px rgba(124,92,191,0.4); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
      &.saved { background: #28a745; box-shadow: 0 4px 12px rgba(40,167,69,0.3); }
    }
    .builder-save-text { }

    .builder-layout {
      display: grid; grid-template-columns: 220px 1fr;
      flex: 1; overflow: hidden; position: relative;
    }
    .builder-layout.panel-hidden { grid-template-columns: 1fr; }
    .builder-layout.preview-layout { grid-template-columns: 1fr; }
    .builder-layout.props-open { grid-template-columns: 220px 1fr 280px; }
    .builder-layout.props-open.panel-hidden { grid-template-columns: 1fr 280px; }
    .builder-preview-area {
      display: flex; align-items: flex-start; justify-content: center;
      background: #06060e; padding: 16px; overflow: hidden; height: 100%;
    }
    .builder-preview-frame {
      border-radius: 16px; overflow: hidden; height: 100%;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.06);
      background: #0d1117;
      &.mobile { width: 375px; }
      &.desktop { width: 100%; max-width: 900px; }
    }
    .preview-iframe { width: 100%; height: 100%; border: none; }
    .builder-panel {
      background: rgba(10,10,20,0.9); backdrop-filter: blur(12px);
      border-right: 1px solid rgba(139,92,246,0.1);
      overflow-y: auto;
    }
    .builder-panel-right {
      border-right: none; border-left: 1px solid rgba(139,92,246,0.1);
      width: 280px; z-index: 20;
      display: none; flex-direction: column; overflow: hidden;
    }
    .builder-panel-right.panel-visible { display: flex; }
    .builder-panel-right app-builder-props-panel { flex: 1; overflow-y: auto; display: block; }
    .builder-panel-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 14px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7);
      border-bottom: 1px solid rgba(139,92,246,0.08);
      .material-icons { font-size: 16px; color: var(--gold-light); }
    }
    .builder-sections-list { padding: 6px; }
    .builder-section-item {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 10px; border-radius: 8px; margin-bottom: 2px;
      cursor: pointer; transition: all 0.15s;
      border: 1px solid transparent; font-size: 12px;
      &:hover { background: rgba(139,92,246,0.06); }
      &.active { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.3); }
      &.disabled { opacity: 0.35; }
    }
    .drag-handle { font-size: 14px; color: rgba(255,255,255,0.2); cursor: grab; }
    .section-icon { font-size: 16px; color: var(--gold-light); }
    .section-label { flex: 1; color: rgba(255,255,255,0.8); }
    .builder-theme-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 14px; margin: 6px 6px 4px;
      border-radius: 8px; cursor: pointer; transition: all 0.2s;
      border: 1px solid rgba(139,92,246,0.15);
      background: rgba(139,92,246,0.04);
      .material-icons { font-size: 16px; color: #c084fc; }
      span:last-child { font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500; }
      &:hover { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.3); }
      &.active { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.4); }
      &.active span:last-child { color: white; }
    }
    .section-toggle {
      background: none; border: none; cursor: pointer; padding: 2px;
      color: rgba(255,255,255,0.3); display: flex; transition: color 0.2s;
      .material-icons { font-size: 14px; }
      &:hover { color: var(--gold-light); }
    }
    .builder-add-elements { padding-bottom: 8px; }
    .add-el-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 6px; }
    .add-el-btn {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 8px 4px; border-radius: 8px; border: 1px solid rgba(139,92,246,0.1);
      background: rgba(139,92,246,0.03); color: rgba(255,255,255,0.6);
      font-size: 10px; cursor: pointer; transition: all 0.2s;
      .material-icons { font-size: 18px; color: rgba(139,92,246,0.5); }
      &:hover { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.3); color: white; }
    }

    .builder-canvas-area {
      display: flex; align-items: flex-start; justify-content: center;
      background: #06060e; padding: 16px; overflow-y: auto;
    }
    .builder-canvas-viewport {
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.06);
      background: #0d1117;
      &.mobile { width: 375px; }
      &.desktop { width: 100%; max-width: 680px; }
    }
    .canvas-section-wrapper {
      position: relative; cursor: default;
      border: 1px solid transparent; transition: border-color 0.15s;
      &:hover { border-color: rgba(139,92,246,0.15); }
      &.active-section { border-color: rgba(139,92,246,0.4); }
    }
    .canvas-section-label {
      position: absolute; top: 2px; left: 2px; z-index: 10;
      font-size: 9px; padding: 1px 6px; border-radius: 3px;
      background: rgba(139,92,246,0.8); color: white; font-weight: 600;
      opacity: 0; transition: opacity 0.2s; pointer-events: none;
    }
    .canvas-section-wrapper:hover .canvas-section-label,
    .canvas-section-wrapper.active-section .canvas-section-label { opacity: 1; }
    .canvas-section-disabled {
      display: flex; align-items: center; gap: 8px; padding: 12px 16px;
      color: rgba(255,255,255,0.25); font-size: 11px; cursor: pointer;
      border: 1px dashed rgba(139,92,246,0.1); transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { background: rgba(139,92,246,0.03); border-color: rgba(139,92,246,0.2); color: rgba(255,255,255,0.4); }
    }
    .canvas-preview-envelope {
      min-height: 180px; display: flex; align-items: center; justify-content: center;
      position: relative; border-radius: 4px;
    }
    .preview-mode-canvas {
      min-height: 100%; position: relative;
      --font-sans: 'Lato', sans-serif;
      --font-serif: 'Playfair Display', serif;
      --font-script: 'Great Vibes', cursive;
      --gold: #d4a017; --gold-light: #e6c655;
    }
    .canvas-bg-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
    .canvas-bg-image { position: absolute; inset: 0; width: 100%; height: 100%; background-size: cover; background-position: center; background-attachment: fixed; z-index: 0; }
    .canvas-bg-overlay { position: absolute; inset: 0; z-index: 0; background: rgba(0,0,0,0.2); pointer-events: none; }
    .preview-mode-canvas > .preview-section-click { position: relative; z-index: 1; }
    .preview-mode-canvas ::ng-deep .landing-nav { position: relative !important; z-index: 10 !important; background: var(--theme-card-bg, rgba(13,17,23,0.85)) !important; backdrop-filter: blur(12px) !important; border-bottom: 1px solid var(--theme-card-border, rgba(212,160,23,0.2)) !important; }
    .preview-mode-canvas ::ng-deep .hero-section { min-height: 500px !important; padding-top: 60px !important; }
    .preview-mode-canvas ::ng-deep .countdown { justify-content: center !important; }
    .preview-mode-canvas ::ng-deep .countdown-item { display: flex !important; align-items: center !important; justify-content: center !important; text-align: center !important; }
    .preview-mode-canvas ::ng-deep .countdown-value { display: block !important; text-align: center !important; }
    .preview-mode-canvas ::ng-deep .timeline-item { opacity: 1 !important; transform: none !important; }
    .preview-mode-canvas ::ng-deep .timeline-dot { opacity: 1 !important; animation: none !important; }
    .preview-mode-canvas ::ng-deep .timeline-title { letter-spacing: 0 !important; word-break: break-word !important; }
    .preview-mode-canvas ::ng-deep .timeline-time { }
    .preview-mode-canvas ::ng-deep .timeline-content { word-break: break-word !important; overflow-wrap: break-word !important; }
    .preview-mode-canvas ::ng-deep .timeline-item { max-width: 100% !important; }
    .preview-mode-canvas ::ng-deep .reveal { animation: none !important; opacity: 1 !important; transform: none !important; }
    .preview-mode-canvas ::ng-deep .scroll-hidden { opacity: 1 !important; transform: none !important; }
    .preview-mode-canvas ::ng-deep .intro-overlay { position: relative !important; z-index: 1 !important; height: 500px; min-height: auto !important; inset: auto !important; overflow: hidden; }
    .preview-mode-canvas ::ng-deep .intro-overlay.fade-out[data-transition="fade"] { animation: builderFade 1s ease forwards !important; }
    .preview-mode-canvas ::ng-deep .intro-overlay.fade-out[data-transition="slide-up"] { animation: builderSlideUp 1s ease forwards !important; }
    .preview-mode-canvas ::ng-deep .intro-overlay.fade-out[data-transition="slide-down"] { animation: builderSlideDown 1s ease forwards !important; }
    .preview-mode-canvas ::ng-deep .intro-overlay.fade-out[data-transition="zoom-in"] { animation: builderZoomIn 1s ease forwards !important; }
    .preview-mode-canvas ::ng-deep .intro-overlay.fade-out[data-transition="zoom-out"] { animation: builderZoomOut 1s ease forwards !important; }
    .preview-mode-canvas ::ng-deep .intro-overlay.fade-out[data-transition="blur"] { animation: builderBlur 1s ease forwards !important; }
    .preview-mode-canvas ::ng-deep .intro-overlay.fade-out[data-transition="none"] { animation: builderFade 0.05s linear forwards !important; }
    @keyframes builderFade { from { opacity: 1; } to { opacity: 0; } }
    @keyframes builderSlideUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-100%); } }
    @keyframes builderSlideDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(100%); } }
    @keyframes builderZoomIn { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(1.4); } }
    @keyframes builderZoomOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.3); } }
    @keyframes builderBlur { from { opacity: 1; filter: blur(0); } to { opacity: 0; filter: blur(15px); } }
    .preview-mode-canvas ::ng-deep .intro-bg-overlay { opacity: 0.4 !important; }
    .preview-mode-canvas ::ng-deep .intro-bg-overlay { opacity: 0.4 !important; }
    .preview-mode-canvas ::ng-deep .intro-bg-video,
    .preview-mode-canvas ::ng-deep .intro-bg { animation: none !important; }
    .preview-mode-canvas ::ng-deep .envelope-overlay { position: relative !important; z-index: 1 !important; height: 500px; min-height: auto !important; inset: auto !important; overflow: hidden; }
    /* In canvas mode, prevent envelope from disappearing after being opened */
    .preview-mode-canvas ::ng-deep .envelope-overlay.opened { opacity: 1 !important; pointer-events: auto !important; }
    /* In live preview, overlays stay same height but are fully interactive */
    .live-preview .preview-mode-canvas ::ng-deep .envelope-overlay { height: 500px; cursor: pointer; }
    .live-preview .preview-mode-canvas ::ng-deep .envelope-overlay.opened { opacity: 0 !important; pointer-events: none !important; }
    .live-preview .preview-mode-canvas ::ng-deep .intro-overlay { height: 500px; cursor: pointer; }
    .preview-mode-canvas ::ng-deep * { max-width: 100% !important; }
    .preview-mode-canvas ::ng-deep .back-to-top { display: none !important; }
    .preview-mode-canvas ::ng-deep [style*="position: fixed"],
    .preview-mode-canvas ::ng-deep [style*="position:fixed"] { position: relative !important; }
    .preview-section-click {
      cursor: pointer; transition: outline 0.2s; position: relative; overflow: hidden;
      &:hover { outline: 2px dashed rgba(139,92,246,0.3); outline-offset: -2px; }
      &.section-active { outline: 2px solid rgba(139,92,246,0.6); outline-offset: -2px; }
    }
    .preview-section-click[data-section="hero"] { overflow: visible; }
    /* Block pointer events on inner content so clicks go to the wrapper */
    .preview-section-click > * { pointer-events: none; }
    /* Live preview mode — enable interactions, remove selection UI */
    .live-preview .preview-section-click { cursor: default; }
    .live-preview .preview-section-click > * { pointer-events: all; }
    .live-preview .preview-section-click:hover { outline: none; }
    .live-preview .preview-section-click.section-active { outline: none; }
    .envelope-preview-inner {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }
    .envelope-icon {
      width: 48px; height: 48px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }
    .envelope-preview-text { font-size: 12px; color: rgba(255,255,255,0.6); }
    .envelope-template-badge {
      font-size: 9px; padding: 2px 8px; border-radius: 4px;
      background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.4);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .canvas-preview-intro {
      min-height: 140px; display: flex; align-items: center; justify-content: center;
      position: relative; background: #0d1117; border-radius: 4px; overflow: hidden;
    }
    .intro-preview-bg {
      position: absolute; inset: 0; background-size: cover; background-position: center;
      opacity: 0.4;
    }
    .intro-preview-phrase {
      position: relative; z-index: 1; font-family: var(--font-script, 'Great Vibes');
      font-size: 20px; color: rgba(255,255,255,0.8); text-align: center;
      padding: 0 20px; line-height: 1.4;
    }
    .intro-preview-duration {
      position: absolute; bottom: 6px; right: 8px;
      font-size: 9px; color: rgba(255,255,255,0.3);
      background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 3px;
    }
    .btn-enable {
      margin-left: auto; padding: 3px 8px; border-radius: 4px;
      border: 1px solid rgba(139,92,246,0.3); background: rgba(139,92,246,0.1);
      color: #c084fc; font-size: 10px; cursor: pointer;
      &:hover { background: rgba(139,92,246,0.2); }
    }

    .builder-props-fab {
      position: absolute; top: 8px; right: 8px; z-index: 25;
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: rgba(139,92,246,0.9); color: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(139,92,246,0.4);
      transition: transform 0.3s, background 0.2s;
      .material-icons { font-size: 18px; transition: transform 0.3s; }
      &:hover { transform: scale(1.1); }
      &.active { background: rgba(239,68,68,0.85); }
      &.active .material-icons { transform: rotate(90deg); }
    }
    .builder-sections-fab {
      position: absolute; top: 8px; left: 8px; z-index: 25;
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: rgba(139,92,246,0.9); color: white;
      cursor: pointer; display: none; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(139,92,246,0.4);
      transition: transform 0.3s, background 0.2s;
      .material-icons { font-size: 18px; }
      &:hover { transform: scale(1.1); }
      &.show-desktop { display: flex; }
    }
    .panel-toggle-btn { margin-left: auto; background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; padding: 2px; border-radius: 4px; transition: all 0.2s; .material-icons { font-size: 18px; } }
    .panel-toggle-btn:hover { color: white; background: rgba(139,92,246,0.15); }

    .builder-props { padding: 14px; }
    .builder-section-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; margin-bottom: 12px;
      background: rgba(139,92,246,0.08); border-radius: 8px;
      border: 1px solid rgba(139,92,246,0.2);
      .material-icons { font-size: 16px; color: var(--gold-light); }
      span:last-child { font-size: 13px; font-weight: 600; color: white; }
    }
    .builder-prop-category {
      font-size: 10px; color: rgba(139,92,246,0.8); text-transform: uppercase;
      letter-spacing: 0.8px; font-weight: 700; margin: 14px 0 8px; padding-left: 2px;
    }
    .prop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .prop-field {
      display: flex; flex-direction: column; gap: 3px;
      label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
      input, textarea, select {
        width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(139,92,246,0.2);
        border-radius: 6px; padding: 7px 9px; color: white; font-size: 12px;
        font-family: var(--font-sans);
        &:focus { outline: none; border-color: rgba(139,92,246,0.5); }
      }
      textarea { min-height: 60px; resize: vertical; }
    }
    .prop-field.full { grid-column: 1 / -1; margin-bottom: 10px; }
    .prop-btn-row {
      display: flex; gap: 4px;
      button {
        padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5);
        cursor: pointer; display: flex; align-items: center; transition: all 0.2s;
        .material-icons { font-size: 16px; }
        &:hover { background: rgba(139,92,246,0.1); color: white; }
        &.active { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.5); color: #c084fc; }
      }
    }
    .builder-prop-divider { height: 1px; background: rgba(139,92,246,0.1); margin: 14px 0; }
    .prop-actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .prop-action-btn {
      width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { background: rgba(139,92,246,0.1); color: white; border-color: rgba(139,92,246,0.3); }
      &.danger:hover { background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.3); }
    }
    .builder-props-empty {
      padding: 40px 14px; text-align: center;
      .material-icons { font-size: 32px; color: rgba(139,92,246,0.3); margin-bottom: 10px; }
      p { font-size: 12px; color: rgba(255,255,255,0.3); }
    }
    .props-hint { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.6; }
    .builder-input {
      width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(139,92,246,0.2);
      border-radius: 6px; padding: 8px 10px; color: white; font-size: 12px;
      font-family: var(--font-sans);
      &:focus { outline: none; border-color: rgba(139,92,246,0.5); }
    }
    .builder-upload-row { display: flex; align-items: center; gap: 8px; }
    .builder-upload-ok { font-size: 11px; color: #10b981; }
    .builder-btn-small {
      padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(139,92,246,0.3);
      background: rgba(139,92,246,0.1); color: rgba(255,255,255,0.8);
      font-size: 11px; cursor: pointer; transition: all 0.2s;
      &:hover { background: rgba(139,92,246,0.2); }
      &.danger { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); color: #ef4444; }
    }
    .prop-toggle {
      display: flex; align-items: center; gap: 6px; cursor: pointer;
      color: rgba(255,255,255,0.7); font-size: 12px;
      .material-icons { font-size: 18px; color: var(--gold-light); }
    }
    .block-items-header {
      display: flex; align-items: center; justify-content: space-between;
      margin: 12px 0 8px; padding: 0 2px;
      span { font-size: 11px; color: rgba(139,92,246,0.8); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
    }
    .block-item {
      padding: 8px; margin-bottom: 6px; border-radius: 6px;
      background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
      display: flex; flex-direction: column; gap: 5px;
    }
    .block-item-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .block-item-num {
      font-size: 10px; color: rgba(255,255,255,0.3); font-weight: 600;
      width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
      border-radius: 50%; background: rgba(139,92,246,0.1);
    }
    .photo-mini-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(48px, 1fr)); gap: 4px;
      margin-top: 8px;
    }
    .photo-mini-item {
      position: relative; aspect-ratio: 1; border-radius: 4px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .photo-mini-delete {
      position: absolute; top: 1px; right: 1px;
      width: 16px; height: 16px; border-radius: 50%;
      background: rgba(0,0,0,0.7); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s;
      .material-icons { font-size: 10px; color: #ef4444; }
    }
    .photo-mini-item:hover .photo-mini-delete { opacity: 1; }
    .builder-advanced-link {
      display: flex; align-items: center; gap: 8px; font-size: 12px;
      color: var(--gold-light); text-decoration: none; padding: 8px 10px;
      border-radius: 6px; transition: all 0.2s; margin-top: 12px;
      .material-icons { font-size: 14px; }
      &:hover { background: rgba(139,92,246,0.1); }
    }

    /* CDK Drag */
    .cdk-drag-preview { border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .cdk-drag-placeholder { opacity: 0.3; }

    @media (max-width: 768px) {
      .builder-layout, .builder-layout.props-open, .builder-layout.props-open.panel-hidden { grid-template-columns: 1fr; }
      .builder-panel-left {
        display: none;
        position: fixed; top: 48px; bottom: 0; left: 0; z-index: 100;
        width: 260px; box-shadow: 4px 0 24px rgba(0,0,0,0.5);
      }
      .builder-panel-left.mobile-open { display: block; }
      .builder-sections-fab { display: flex; }
      .builder-save-text { display: none; }
      .builder-canvas-viewport.mobile { width: 375px; max-width: 100%; border-radius: 8px; }
    }
  `]
})
export class BuilderComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  canvasState = inject(CanvasStateService);
  private migration = inject(MigrationService);

  eventId = 0;
  eventName = signal('');
  sections = signal<BuilderSection[]>([]);
  previewDevice = signal<'mobile' | 'desktop'>('mobile');
  canvasMode = signal<'canvas' | 'preview'>('canvas');
  viewMode = signal<'edit' | 'preview'>('edit');
  saving = signal(false);
  saveStatus = signal<'idle' | 'saved'>('idle');
  showProps = signal(false);
  showLeftPanel = signal(false);
  panelVisible = signal(true);
  eventData = signal<any>({ name: '', event_date: '', slug: '' });
  previewKey = signal(0);
  previewUrl = computed<SafeResourceUrl>(() => {
    const slug = this.eventData()?.slug || '';
    const baseUrl = window.location.origin;
    const key = this.previewKey();
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}/invitacion/${slug}?preview=1&_=${key}`);
  });
  currentSection = signal<string | null>(null);
  currentConfig = signal<any>(null);
  private autoSaveTimer: any = null;

  /** Shortcut to active element for template */
  activeEl = this.canvasState.activeElement;

  hasUnsavedChanges(): boolean { return this.canvasState.isDirty(); }

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    this.api.getEvent(this.eventId).subscribe(e => {
      this.eventName.set(e.name);
      this.eventData.set(e);
    });
    this.api.getConfig(this.eventId).subscribe(c => {
      const cfg = c.config_json;
      const v2 = this.migration.migrateConfig(cfg);
      this.canvasState.initializeState(v2);
      this.currentConfig.set(v2);
      this.buildSections(v2);
    });
    // Load related data
    this.loadItinerary();
    this.loadPhotos();
  }

  ngOnDestroy() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
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

  selectSection(key: string) {
    if (this.canvasMode() === 'preview') return; // In preview mode, don't select
    this.canvasState.selectSection(key);
    this.currentSection.set(key);
    this.showProps.set(true);
    this.scrollToSection(key);
  }

  private scrollToSection(key: string) {
    setTimeout(() => {
      const el = document.querySelector(`.preview-section-click[data-section="${key}"]`);
      const container = document.querySelector('.builder-canvas-area');
      if (el && container) {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = elRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }, 50);
  }

  toggleCanvasMode() {
    if (this.canvasMode() === 'canvas') {
      // Switching to preview: save first so iframe shows latest
      if (this.canvasState.isDirty()) {
        this.save();
      }
      this.canvasMode.set('preview');
      this.reloadPreview();
      this.canvasState.selectSection(null);
      this.currentSection.set(null);
    } else {
      this.canvasMode.set('canvas');
      // Reset envelope overlay when back to canvas
      const envelopeEl = document.querySelector('.preview-mode-canvas .envelope-overlay');
      if (envelopeEl) {
        envelopeEl.classList.remove('opened');
      }
    }
  }

  reloadPreview() {
    this.previewKey.set(Date.now());
  }

  selectTheme() {
    this.canvasState.selectSection('_theme');
    this.currentSection.set('_theme');
    this.showProps.set(true);
  }

  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'edit' ? 'preview' : 'edit');
  }

  getCanvasLandingBg(): string {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return '#0d1117';
    const theme = cfg.theme;
    const c1 = theme.landingBgColor1 || '#0d1117';
    const c2 = theme.landingBgColor2 || '#1a1a2e';
    const type = theme.landingBgType || 'solid';
    const angle = theme.landingBgAngle || 135;

    let colorBg = c1;
    switch (type) {
      case 'solid': colorBg = c1; break;
      case 'linear': colorBg = `linear-gradient(${angle}deg, ${c1}, ${c2})`; break;
      case 'radial': colorBg = `radial-gradient(ellipse at center, ${c2}, ${c1})`; break;
      default: colorBg = c1;
    }

    // If there's a non-video background image, use color only (image rendered via absolute div)
    const bgGif = cfg.hero?.backgroundGif;
    // Image backgrounds are handled by the canvas-bg-media element, not CSS background
    return colorBg;
  }

  isCanvasBgVideo(): boolean {
    const url = this.canvasState.getConfig()?.hero?.backgroundGif || '';
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'ogg'].includes(ext);
  }

  getSectionBgStyle(sectionKey: string): string {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return '';
    const ss = (cfg as any)[sectionKey]?.sectionStyle;
    if (!ss || ss.bgType === 'inherit' || !ss.bgType) return '';
    switch (ss.bgType) {
      case 'solid': return `background: ${ss.bgColor1 || '#1a1a2e'}`;
      case 'linear': return `background: linear-gradient(${ss.bgAngle || 180}deg, ${ss.bgColor1 || '#1a1a2e'}, ${ss.bgColor2 || '#0d1117'})`;
      case 'image': return ss.bgImage ? `background: url(${ss.bgImage}) center/cover` : '';
      default: return '';
    }
  }

  getPreviewEnabledSections(): string[] {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return [];
    const s: string[] = ['invitation'];
    if (cfg.details?.enabled) s.push('details');
    if (cfg.venues?.enabled) s.push('venues');
    if (cfg.itinerary?.enabled) s.push('itinerary');
    if (cfg.gallery?.enabled) s.push('gallery');
    if (cfg.dresscode?.enabled) s.push('dresscode');
    if (cfg.gifts?.enabled) s.push('gifts');
    if (cfg.rsvp?.enabled) s.push('rsvp');
    return s;
  }

  getSecIcon2(key: string): string {
    const m: Record<string,string> = {_theme:'palette',hero:'image',invitation:'card_giftcard',details:'info',venues:'place',itinerary:'schedule',gallery:'photo_library',dresscode:'checkroom',gifts:'redeem',rsvp:'how_to_reg',envelope:'mail',intro:'auto_awesome'};
    return m[key] || 'layers';
  }

  getSecLabel2(key: string): string {
    const m: Record<string,string> = {_theme:'Tema Global',hero:'Carátula',invitation:'Invitación',details:'Detalles',venues:'Lugares',itinerary:'Itinerario',gallery:'Galería',dresscode:'Vestimenta',gifts:'Regalos',rsvp:'Confirmación',envelope:'Pantalla de Inicio',intro:'Intro'};
    return m[key] || key;
  }

  setThemeProp(prop: string, value: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    (cfg.theme as any)[prop] = value;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  applyTemplate(key: string) {
    const templates: Record<string, any> = {
      elegante: { landingBgColor1: '#0d1117', landingBgColor2: '#1a1a2e', landingBgType: 'linear', textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.7)', navFooterText: '#d4a017', buttonBg: '#d4a017', buttonText: '#1a1a2e', cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(212,160,23,0.3)' },
      moderno: { landingBgColor1: '#1e1e32', landingBgColor2: '#2d2d44', landingBgType: 'linear', textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.7)', navFooterText: '#a78bfa', buttonBg: '#a78bfa', buttonText: '#1a1a2e', cardBg: 'rgba(167,139,250,0.08)', cardBorder: 'rgba(167,139,250,0.3)' },
      romantico: { landingBgColor1: '#2d1525', landingBgColor2: '#1a0a14', landingBgType: 'linear', textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.7)', navFooterText: '#f4a7c1', buttonBg: '#f4a7c1', buttonText: '#1a0a14', cardBg: 'rgba(244,167,193,0.08)', cardBorder: 'rgba(244,167,193,0.3)' },
      festivo: { landingBgColor1: '#1a1a2e', landingBgColor2: '#2d2200', landingBgType: 'linear', textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.7)', navFooterText: '#fbbf24', buttonBg: '#fbbf24', buttonText: '#1a1a2e', cardBg: 'rgba(251,191,36,0.08)', cardBorder: 'rgba(251,191,36,0.3)' },
      corporativo: { landingBgColor1: '#0f172a', landingBgColor2: '#1e293b', landingBgType: 'linear', textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.7)', navFooterText: '#60a5fa', buttonBg: '#60a5fa', buttonText: '#0f172a', cardBg: 'rgba(96,165,250,0.08)', cardBorder: 'rgba(96,165,250,0.3)' },
    };
    const tpl = templates[key];
    if (!tpl) return;
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    Object.assign(cfg.theme, tpl);
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  onCanvasAreaClick() {
    if (this.canvasMode() === 'preview') return;
    this.canvasState.selectSection(null);
  }

  toggleSection(key: string) {
    const s = this.sections();
    const idx = s.findIndex(x => x.key === key);
    if (idx >= 0) {
      s[idx].enabled = !s[idx].enabled;
      this.sections.set([...s]);
      // Update config
      const cfg = this.canvasState.getConfig();
      if (cfg && (cfg as any)[key]) {
        (cfg as any)[key].enabled = s[idx].enabled;
        this.canvasState.isDirty.set(true);
      }
      this.scheduleAutoSave();
    }
  }

  onSectionDrop(event: CdkDragDrop<BuilderSection[]>) {
    const s = this.sections();
    moveItemInArray(s, event.previousIndex, event.currentIndex);
    this.sections.set([...s]);
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  addElement(type: CanvasElementType) {
    const sectionKey = this.canvasState.selectedSection();
    if (!sectionKey) return;
    const id = this.canvasState.addElement(sectionKey, type);
    if (id) {
      this.canvasState.selectElement(sectionKey, id);
      this.showProps.set(true);
    }
    this.scheduleAutoSave();
  }

  // ===== Properties Panel =====

  updatePos(axis: 'x' | 'y', value: number) {
    const sec = this.canvasState.selectedSection();
    const el = this.canvasState.activeElement();
    if (!sec || !el) return;
    const x = axis === 'x' ? value : el.x;
    const y = axis === 'y' ? value : el.y;
    this.canvasState.updateElementPosition(sec, el.id, x, y);
    this.scheduleAutoSave();
  }

  updateSize(dim: 'width' | 'height', value: number) {
    const sec = this.canvasState.selectedSection();
    const el = this.canvasState.activeElement();
    if (!sec || !el) return;
    const w = dim === 'width' ? value : el.width;
    const h = dim === 'height' ? value : el.height;
    this.canvasState.resizeElement(sec, el.id, w, h);
    this.scheduleAutoSave();
  }

  updateProp(prop: string, value: any) {
    const sec = this.canvasState.selectedSection();
    const el = this.canvasState.activeElement();
    if (!sec || !el) return;
    this.canvasState.updateElementProperties(sec, el.id, { [prop]: value } as any);
    this.scheduleAutoSave();
  }

  uploadForElement(prop: string, type: 'images' | 'audio' | 'gifs') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'audio' ? 'audio/*' : 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      this.api.uploadFile(type, file).subscribe({
        next: (res) => { this.updateProp(prop, res.url); }
      });
    };
    input.click();
  }

  // ===== Canvas Helpers =====

  getSectionElements(key: string): any[] {
    const cfg = this.canvasState.config();
    if (!cfg) return [];
    const section = (cfg as any)[key];
    return section?.canvas?.elements || [];
  }

  getSectionMinHeight(key: string): number {
    const cfg = this.canvasState.config();
    if (!cfg) return 60;
    const section = (cfg as any)[key];
    return section?.canvas?.minHeight || 60;
  }

  getSectionBg(key: string): string {
    const cfg = this.canvasState.config();
    if (!cfg) return '';
    const section = (cfg as any)[key];
    const style = section?.sectionStyle;
    if (!style || style.bgType === 'inherit') {
      // Use landing bg
      const theme = cfg.theme;
      const c1 = theme?.landingBgColor1 || '#0d1117';
      return c1;
    }
    switch (style.bgType) {
      case 'solid': return style.bgColor1 || '#0d1117';
      case 'linear': return `linear-gradient(${style.bgAngle || 180}deg, ${style.bgColor1 || '#fff'}, ${style.bgColor2 || '#eee'})`;
      default: return '';
    }
  }

  getElIcon(type: string): string {
    const m: Record<string, string> = {
      'text': 'text_fields', 'image': 'image', 'icon': 'emoji_emotions', 'decorator': 'auto_awesome',
      'countdown': 'timer', 'gallery': 'photo_library', 'detail-cards': 'info', 'venue-cards': 'place',
      'itinerary': 'schedule', 'rsvp-form': 'how_to_reg', 'gifts-block': 'redeem',
      'dresscode-block': 'checkroom', 'separator': 'horizontal_rule', 'spacer': 'height'
    };
    return m[type] || 'widgets';
  }

  getElLabel(type: string): string {
    const m: Record<string, string> = {
      'text': 'Texto', 'image': 'Imagen', 'icon': 'Icono', 'decorator': 'Decorador',
      'countdown': 'Countdown', 'gallery': 'Galería', 'detail-cards': 'Detalles', 'venue-cards': 'Lugares',
      'itinerary': 'Itinerario', 'rsvp-form': 'Confirmación', 'gifts-block': 'Regalos',
      'dresscode-block': 'Vestimenta', 'separator': 'Separador', 'spacer': 'Espacio'
    };
    return m[type] || type;
  }

  getSecIcon(): string {
    const sec = this.sections().find(s => s.key === this.canvasState.selectedSection());
    return sec?.icon || 'layers';
  }

  getSecLabel(): string {
    const sec = this.sections().find(s => s.key === this.canvasState.selectedSection());
    return sec?.label || '';
  }

  // ===== Section-level Properties =====

  getSecProp(sectionKey: string, prop: string): any {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return null;
    return (cfg as any)[sectionKey]?.[prop] ?? null;
  }

  setSecProp(sectionKey: string, prop: string, value: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    (cfg as any)[sectionKey][prop] = value;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  /** Get section data object for reading block properties */
  getSecData(sectionKey: string): any {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return null;
    return (cfg as any)[sectionKey] || null;
  }

  /** Set a property on a section's config (not canvas element) */
  setSecData(sectionKey: string, prop: string, value: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    (cfg as any)[sectionKey][prop] = value;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  /** Set nested property (e.g., gifts.transfer.bank) */
  setSecNestedData(sectionKey: string, nestedKey: string, prop: string, value: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    const section = (cfg as any)[sectionKey];
    if (!section[nestedKey]) section[nestedKey] = {};
    section[nestedKey][prop] = value;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  // ===== Detail Cards =====

  addDetailCard() {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    if (!cfg.details.cards) cfg.details.cards = [];
    cfg.details.cards.push({
      id: 'card-' + Date.now(), iconType: 'none', icon: '', iconUrl: '',
      title: 'Nuevo detalle', content: '', textAlign: 'center'
    });
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  removeDetailCard(index: number) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    cfg.details.cards.splice(index, 1);
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  updateDetailCard(index: number, prop: string, value: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg || !cfg.details.cards[index]) return;
    (cfg.details.cards[index] as any)[prop] = value;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  // ===== Venues =====

  addVenue() {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    if (!cfg.venues.items) cfg.venues.items = [];
    cfg.venues.items.push({
      id: 'venue-' + Date.now(), title: '', icon: 'place',
      name: 'Nuevo lugar', address: '', time: '', mapsUrl: ''
    });
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  removeVenue(index: number) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    cfg.venues.items.splice(index, 1);
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  updateVenueItem(index: number, prop: string, value: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg || !cfg.venues.items[index]) return;
    (cfg.venues.items[index] as any)[prop] = value;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  // ===== Itinerary =====

  itineraryItems = signal<any[]>([]);

  addItineraryItem() {
    this.api.addItineraryItem(this.eventId, {
      time: '', title: 'Nueva actividad', description: '', icon: 'â°', iconType: 'emoji', sort_order: this.itineraryItems().length
    }).subscribe(() => this.loadItinerary());
  }

  removeItineraryItem(index: number) {
    const item = this.itineraryItems()[index];
    if (!item?.id) return;
    this.api.deleteItineraryItem(this.eventId, item.id).subscribe(() => this.loadItinerary());
  }

  updateItineraryItem(index: number, prop: string, value: any) {
    const item = this.itineraryItems()[index];
    if (!item?.id) return;
    (item as any)[prop] = value;
    this.api.updateItineraryItem(this.eventId, item.id, item).subscribe();
  }

  private loadItinerary() {
    this.api.getItinerary(this.eventId).subscribe(items => this.itineraryItems.set(items));
  }

  // ===== Dresscode =====

  addDresscodeCard() {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    if (!cfg.dresscode.cards) cfg.dresscode.cards = [];
    cfg.dresscode.cards.push({ id: 'dc-' + Date.now(), title: 'Nuevo ejemplo', description: '', images: [] });
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  removeDresscodeCard(index: number) {
    const cfg = this.canvasState.getConfig();
    if (!cfg || !cfg.dresscode.cards) return;
    cfg.dresscode.cards.splice(index, 1);
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  updateDresscodeCard(index: number, prop: string, value: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg || !cfg.dresscode.cards?.[index]) return;
    (cfg.dresscode.cards[index] as any)[prop] = value;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  // ===== Photos =====

  photos = signal<any[]>([]);

  uploadPhotos() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*'; input.multiple = true;
    input.onchange = () => {
      if (!input.files?.length) return;
      this.api.uploadPhotos(this.eventId, input.files).subscribe(() => this.loadPhotos());
    };
    input.click();
  }

  deletePhoto(photoId: number) {
    this.api.deletePhoto(this.eventId, photoId).subscribe(() => this.loadPhotos());
  }

  private loadPhotos() {
    this.api.getPhotos(this.eventId).subscribe(p => this.photos.set(p));
  }

  uploadSecProp(sectionKey: string, prop: string, type: 'images' | 'audio' | 'gifs') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'audio' ? 'audio/*' : 'image/*,video/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      this.api.uploadFile(type, file).subscribe({
        next: (res) => { this.setSecProp(sectionKey, prop, res.url); }
      });
    };
    input.click();
  }

  getSecStyleProp(prop: string): any {
    const key = this.canvasState.selectedSection();
    if (!key) return null;
    const cfg = this.canvasState.getConfig();
    if (!cfg) return null;
    return (cfg as any)[key]?.sectionStyle?.[prop] ?? null;
  }

  setSecStyleProp(prop: string, value: any) {
    const key = this.canvasState.selectedSection();
    if (!key) return;
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    const section = (cfg as any)[key];
    if (!section.sectionStyle) section.sectionStyle = { bgType: 'inherit', dividerType: 'none' };
    section.sectionStyle[prop] = value;
    if (prop === 'bgColor1' && !section.sectionStyle.bgType) section.sectionStyle.bgType = 'solid';
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  clearSecTextOverrides() {
    const key = this.canvasState.selectedSection();
    if (!key) return;
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    const section = (cfg as any)[key];
    if (section?.sectionStyle) {
      section.sectionStyle.headingColor = '';
      section.sectionStyle.contentColor = '';
    }
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  uploadSecBgImage() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      this.api.uploadFile('images', file).subscribe({
        next: (res) => {
          this.setSecStyleProp('bgImage', res.url);
          this.setSecStyleProp('bgType', 'image');
        }
      });
    };
    input.click();
  }

  // ===== Save =====

  save() {
    this.saving.set(true);
    const cfg = this.canvasState.getConfig();
    if (!cfg) { this.saving.set(false); return; }
    // Sync enabled states
    const s = this.sections();
    for (const sec of s) {
      if ((cfg as any)[sec.key] && typeof (cfg as any)[sec.key] === 'object') {
        (cfg as any)[sec.key].enabled = sec.enabled;
      }
    }
    const startTime = Date.now();
    this.api.saveConfig(this.eventId, cfg).subscribe({
      next: () => {
        // Ensure "Guardando..." shows at least 800ms
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 800 - elapsed);
        setTimeout(() => {
          this.saving.set(false);
          this.saveStatus.set('saved');
          this.canvasState.isDirty.set(false);
          setTimeout(() => this.saveStatus.set('idle'), 2500);
        }, delay);
      },
      error: () => { this.saving.set(false); }
    });
  }

  private scheduleAutoSave() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      if (this.canvasState.isDirty() && !this.saving()) {
        this.save();
      }
    }, 4000);
  }
}

