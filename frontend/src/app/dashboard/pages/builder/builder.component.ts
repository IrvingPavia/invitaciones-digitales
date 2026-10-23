import { Component, inject, OnInit, OnDestroy, AfterViewInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '../../../core/services/api.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ColorPickerComponent } from '../../../core/components/color-picker.component';
import { CustomSelectComponent, SelectOption } from '../../../core/components/custom-select.component';
import { EventConfig, CanvasElementType, ELEMENT_DEFAULTS, SectionStyle } from '../../../core/models/models';
import { resolveMedia, resolveGlobalBackground, sectionStyleToMedia, ResolvedMedia } from '../../../core/utils/media-background.util';
import { CanvasStateService } from './services/canvas-state.service';
import { MigrationService } from './services/migration.service';
import { SectionCanvasComponent } from './components/section-canvas/section-canvas.component';
import { BuilderPropsPanelComponent } from './components/props-panel/props-panel.component';
import { LandingEnvelopeComponent } from '../../../landing/sections/envelope/envelope.component';
import { LandingIntroComponent } from '../../../landing/sections/intro/intro.component';
import { LandingHeroComponent } from '../../../landing/sections/hero/hero.component';
import { LandingInvitationComponent } from '../../../landing/sections/invitation/invitation.component';
import { LandingRsvpComponent } from '../../../landing/sections/rsvp/rsvp.component';
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
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, ColorPickerComponent, CustomSelectComponent, SectionCanvasComponent, BuilderPropsPanelComponent,
    LandingEnvelopeComponent, LandingIntroComponent, LandingHeroComponent, LandingInvitationComponent,
    LandingDetailsComponent, LandingVenuesComponent, LandingItineraryComponent, LandingGalleryComponent,
    LandingDresscodeComponent, LandingGiftsComponent, LandingRsvpComponent],
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
        <button class="builder-device-btn" [class.active]="previewDevice() === 'mobile'" (click)="setPreviewDevice('mobile')">
          <span class="material-icons">phone_iphone</span>
        </button>
        <button class="builder-device-btn" [class.active]="previewDevice() === 'desktop'" (click)="setPreviewDevice('desktop')">
          <span class="material-icons">monitor</span>
        </button>
        <!-- Selector de dispositivo (solo modo mobile). En escritorio va aquí en la toolbar;
             en pantallas angostas se oculta y aparece en el panel de Secciones (ver abajo). -->
        @if (previewDevice() === 'mobile') {
          <div class="builder-device-select">
            <app-custom-select [options]="canvasDeviceOptions" [value]="canvasDevice()" [compact]="true" (valueChange)="setCanvasDevice($event)"></app-custom-select>
          </div>
        }
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

    <div class="builder-layout" [class.preview-layout]="canvasMode() === 'preview'" [class.panel-hidden]="!panelVisible()" [class.props-open]="showProps() && canvasMode() === 'canvas'" [class.wide]="isWide()">
      <!-- Left Panel: Sections + Elements (hidden in preview) -->
      @if (canvasMode() === 'canvas' && panelVisible()) {
      <aside class="builder-panel builder-panel-left" [class.mobile-open]="showLeftPanel()">
        <div class="builder-panel-header">
          <span>Secciones</span>
        </div>
        <!-- Selector de dispositivo para móvil: aparece aquí (sobre "Tema Global") cuando NO cabe
             en la toolbar (pantalla angosta), solo en modo mobile. En escritorio va en la toolbar. -->
        @if (previewDevice() === 'mobile' && !isWide()) {
          <div class="builder-device-select-panel">
            <span class="device-select-label"><span class="material-icons">smartphone</span> Dispositivo</span>
            <app-custom-select [options]="canvasDeviceOptions" [value]="canvasDevice()" (valueChange)="setCanvasDevice($event)"></app-custom-select>
          </div>
        }
        <!-- Theme Global button -->
        <div class="builder-theme-btn" [class.active]="canvasState.selectedSection() === '_theme'" (click)="selectTheme()">
          <span class="material-icons">palette</span>
          <span>Tema Global</span>
        </div>
        <div class="builder-sections-list" cdkDropList (cdkDropListDropped)="onSectionDrop($event)">
          @for (section of sections(); track section.key) {
            <div class="builder-section-item" cdkDrag
                 [class.active]="canvasState.selectedSection() === section.key && !(section.key === 'details' && canvasState.selectedDetailIndex() >= 0) && !(section.key === 'venues' && canvasState.selectedVenueIndex() >= 0) && !(section.key === 'dresscode' && canvasState.selectedDresscodeIndex() >= 0)"
                 [class.disabled]="!section.enabled"
                 [class.is-group]="section.key === 'details' || section.key === 'venues' || section.key === 'dresscode'"
                 (click)="selectSection(section.key)">
              <span class="material-icons drag-handle" cdkDragHandle>drag_indicator</span>
              <span class="material-icons section-icon">{{ section.icon }}</span>
              <span class="section-label">{{ section.label }}</span>
              @if (section.key === 'details' || section.key === 'venues' || section.key === 'dresscode') {
                <!-- Chevron de colapso del grupo (independiente por grupo). -->
                <button class="section-collapse" [title]="groupExpanded()[section.key === 'details' ? 'details' : section.key === 'venues' ? 'venues' : 'dresscode'] ? 'Colapsar' : 'Expandir'" (click)="toggleGroup(section.key === 'details' ? 'details' : section.key === 'venues' ? 'venues' : 'dresscode'); $event.stopPropagation()">
                  <span class="material-icons">{{ groupExpanded()[section.key === 'details' ? 'details' : section.key === 'venues' ? 'venues' : 'dresscode'] ? 'expand_more' : 'chevron_right' }}</span>
                </button>
              }
              @if (isPermanentSection(section.key)) {
                <!-- Secciones permanentes (Carátula): no se pueden ocultar, es la sección principal -->
                <span class="section-permanent material-icons" title="Sección principal, siempre visible">push_pin</span>
              } @else {
                <button class="section-toggle" (click)="toggleSection(section.key); $event.stopPropagation()">
                  <span class="material-icons">{{ section.enabled ? 'visibility' : 'visibility_off' }}</span>
                </button>
              }
            </div>

            <!-- ===== Sub-entradas de DETALLES: cada card = "Detalle N" (mini-sección) ===== -->
            @if (section.key === 'details' && groupExpanded().details) {
              <div class="builder-subsections" cdkDropList (cdkDropListDropped)="onDetailDrop($event)">
                @for (card of detailCards(); track card.id; let di = $index) {
                  <div class="builder-subsection-item" cdkDrag
                       [class.active]="canvasState.selectedSection() === 'details' && canvasState.selectedDetailIndex() === di"
                       (click)="selectDetail(di); $event.stopPropagation()">
                    <span class="material-icons sub-drag-handle" cdkDragHandle>drag_indicator</span>
                    <span class="subsection-label">{{ card.label || ('Detalle ' + (di + 1)) }}</span>
                    <button class="subsection-delete" title="Eliminar detalle" (click)="removeDetail(di); $event.stopPropagation()">
                      <span class="material-icons">delete_outline</span>
                    </button>
                  </div>
                }
                <button class="builder-add-detail" (click)="addDetail(); $event.stopPropagation()">
                  <span class="material-icons">add</span><span>Agregar Detalle</span>
                </button>
              </div>
            }

            <!-- ===== Sub-entradas de LUGARES: cada venue = "Lugar N" (mini-sección) ===== -->
            @if (section.key === 'venues' && groupExpanded().venues) {
              <div class="builder-subsections" cdkDropList (cdkDropListDropped)="onVenueDrop($event)">
                @for (venue of venueItems(); track venue.id; let vi = $index) {
                  <div class="builder-subsection-item" cdkDrag
                       [class.active]="canvasState.selectedSection() === 'venues' && canvasState.selectedVenueIndex() === vi"
                       (click)="selectVenue(vi); $event.stopPropagation()">
                    <span class="material-icons sub-drag-handle" cdkDragHandle>drag_indicator</span>
                    <span class="subsection-label">{{ venue.label || ('Lugar ' + (vi + 1)) }}</span>
                    <button class="subsection-delete" title="Eliminar lugar" (click)="removeVenueMini(vi); $event.stopPropagation()">
                      <span class="material-icons">delete_outline</span>
                    </button>
                  </div>
                }
                <button class="builder-add-detail" (click)="addVenueMini(); $event.stopPropagation()">
                  <span class="material-icons">add</span><span>Agregar Lugar</span>
                </button>
              </div>
            }

            <!-- ===== Sub-entradas de VESTIMENTA: cada card = "Vestimenta N" (mini-sección) ===== -->
            @if (section.key === 'dresscode' && groupExpanded().dresscode) {
              <div class="builder-subsections" cdkDropList (cdkDropListDropped)="onDresscodeDrop($event)">
                @for (dcard of dresscodeCards(); track dcard.id; let di = $index) {
                  <div class="builder-subsection-item" cdkDrag
                       [class.active]="canvasState.selectedSection() === 'dresscode' && canvasState.selectedDresscodeIndex() === di"
                       (click)="selectDresscode(di); $event.stopPropagation()">
                    <span class="material-icons sub-drag-handle" cdkDragHandle>drag_indicator</span>
                    <span class="subsection-label">{{ dcard.label || ('Vestimenta ' + (di + 1)) }}</span>
                    <button class="subsection-delete" title="Eliminar vestimenta" (click)="removeDresscodeMini(di); $event.stopPropagation()">
                      <span class="material-icons">delete_outline</span>
                    </button>
                  </div>
                }
                <button class="builder-add-detail" (click)="addDresscodeMini(); $event.stopPropagation()">
                  <span class="material-icons">add</span><span>Agregar Vestimenta</span>
                </button>
              </div>
            }
          }
        </div>

        <!-- Add Element buttons (hidden — see docs/BUILDER-FREE-ELEMENTS.md for future implementation) -->
      </aside>
      }

      <!-- Center: Canvas or Preview iframe -->
      @if (canvasMode() === 'canvas') {
      <div class="builder-canvas-area" [class.center-frame]="previewDevice() === 'mobile'" (click)="onCanvasAreaClick()">
        <div class="builder-canvas-viewport" [class.mobile]="previewDevice() === 'mobile'" [class.desktop]="previewDevice() === 'desktop'" [class.live-preview]="canvasMode() === 'preview'" [style.width.px]="previewDevice() === 'mobile' ? canvasDeviceWidth() : null" [style.height.px]="previewDevice() === 'mobile' ? canvasDeviceHeight() : null">          @if (canvasState.config()) {
              <div class="preview-mode-canvas" [style.--theme-card-bg]="canvasState.config()?.theme?.cardBg || 'rgba(255,255,255,0.05)'" [style.--theme-card-border]="canvasState.config()?.theme?.cardBorder || 'rgba(212,160,23,0.3)'" [style.--theme-text-primary]="canvasState.config()?.theme?.textPrimary || '#ffffff'" [style.--theme-text-secondary]="canvasState.config()?.theme?.textSecondary || 'rgba(255,255,255,0.7)'" [style.--theme-nav-text]="canvasState.config()?.theme?.navFooterText || '#d4a017'" [style.--theme-btn-bg]="canvasState.config()?.theme?.buttonBg || '#d4a017'" [style.--theme-btn-text]="canvasState.config()?.theme?.buttonText || '#1a1a2e'" [style.--theme-nav-btn-bg]="canvasState.config()?.theme?.navBtnBg || 'rgba(255,255,255,0.1)'" [style.--theme-nav-btn-border]="canvasState.config()?.theme?.navBtnBorder || 'rgba(255,255,255,0.2)'" [style.--theme-nav-btn-icon]="canvasState.config()?.theme?.navBtnIcon || '#ffffff'" [style.--theme-nav-menu-bg]="canvasState.config()?.theme?.navMenuBg || 'rgba(13,17,23,0.95)'" [style.--theme-nav-menu-text]="canvasState.config()?.theme?.navMenuText || 'rgba(255,255,255,0.8)'" [style.--theme-nav-menu-blur]="(canvasState.config()?.theme?.navMenuBlur || 12) + 'px'" [style.--theme-nav-bar-bg]="getNavBarBg()" [style.--theme-nav-bar-blur]="(canvasState.config()?.theme?.navBarBlur ?? 12) + 'px'" [style.--theme-nav-bar-border]="canvasState.config()?.theme?.navBarBorder || 'rgba(212,160,23,0.2)'" [style.background]="getCanvasLandingBg()">
                <!-- Pantalla de inicio (envelope) e Intro van ANTES del fondo: el fondo
                     configurado (GIF/imagen/video) solo aplica desde la carátula hacia abajo,
                     igual que en la landing real (que oculta el bg mientras hay envelope/intro). -->
                @if (canvasState.config()?.envelope?.enabled) {
                  <div class="preview-section-click" [class.drag-enabled]="canvasMode() === 'canvas' && canvasState.config()!.envelope.template === 'plain'" data-section="envelope" [class.section-active]="canvasState.selectedSection() === 'envelope'" (click)="selectSection('envelope'); $event.stopPropagation()">
                    <app-landing-envelope [config]="canvasState.config()!.envelope" [globalStyles]="canvasState.config()?.globalStyles!" [previewLoop]="canvasMode() === 'preview'" bannerUnit="%" [forceCover]="previewDevice() === 'mobile'" [editable]="canvasMode() === 'canvas'" [previewDevice]="previewDevice()" (positionsChange)="onEnvelopePositionsChange($event)" />
                  </div>
                }
                @if (canvasState.config()?.intro?.enabled) {
                  <div class="preview-section-click" [class.drag-enabled]="canvasMode() === 'canvas'" data-section="intro" [class.section-active]="canvasState.selectedSection() === 'intro'" (click)="selectSection('intro'); $event.stopPropagation()">
                    <app-landing-intro [config]="canvasState.config()!.intro" [themeColor]="canvasState.config()?.theme?.navFooterText || '#d4a017'" [themeBg]="canvasState.config()?.theme?.landingBgColor1 || '#0d1117'" [themeBorder]="canvasState.config()?.theme?.landingBgColor2 || '#1a1a2e'" [themeBgType]="canvasState.config()?.theme?.landingBgType || 'radial'" [themeTexture]="canvasState.config()?.theme?.landingBgTexture || 'none'" [themeTextureOpacity]="canvasState.config()?.theme?.landingBgTextureOpacity || 5" [previewLoop]="canvasMode() === 'preview'" [editable]="canvasMode() === 'canvas'" [previewDevice]="previewDevice()" (positionsChange)="onIntroPositionsChange($event)" />
                  </div>
                }

                <!-- Wrapper que contiene el fondo + carátula + resto de secciones. El fondo se
                     posiciona respecto a ESTE contenedor (que empieza en la carátula), por eso
                     no se ve detrás de la pantalla de inicio ni de la intro. -->
                <div class="canvas-bg-scope">
                  <!-- Capa de fondo sticky: se mantiene fija respecto al viewport visible del
                       canvas mientras el contenido scrollea por encima, replicando el
                       position:fixed de la landing real. Así el fondo es CONTINUO desde la
                       carátula hasta el final del scope, y el GIF no se estira (se dimensiona
                       al viewport visible, no a la altura total del documento). -->
                  <!-- TEXTURA: capa propia que cubre TODO el scope (de la carátula al final), NO el
                       sticky de un solo viewport. La textura es un patrón que debe cubrir toda la
                       altura scrolleable (igual que el color de fondo), por eso va absolute inset:0
                       sobre el .canvas-bg-scope. Antes vivía dentro del sticky y se "despegaba" al
                       scrollear, dejando la parte baja sin textura. -->
                  @if (canvasState.config()?.theme?.landingBgTexture && canvasState.config()?.theme?.landingBgTexture !== 'none') {
                    <div class="canvas-bg-texture canvas-bg-texture-full" [attr.data-texture]="canvasState.config()!.theme.landingBgTexture" [style.opacity]="(canvasState.config()!.theme.landingBgTextureOpacity || 5) / 100"></div>
                  }
                  <!-- Capa de fondo sticky: GIF/imagen/video (fondo fijo a un viewport, como la
                       landing real). La textura ya NO va aquí (ver arriba). -->
                  @if (canvasGlobalBg().hasMedia) {
                    <div class="canvas-bg-sticky">
                      @if (canvasGlobalBg().isVideo) {
                        <video class="canvas-bg-media" [class.bg-banner]="canvasGlobalBg().fit === 'banner' && previewDevice() !== 'mobile'" [style.--banner-w]="canvasGlobalBg().bannerWidth + '%'" autoplay loop muted playsinline [src]="canvasGlobalBg().url"></video>
                      } @else {
                        <div class="canvas-bg-image" [class.bg-banner]="canvasGlobalBg().fit === 'banner' && previewDevice() !== 'mobile'" [style.--banner-w]="canvasGlobalBg().bannerWidth + '%'" [style.backgroundImage]="'url(' + canvasGlobalBg().url + ')'"></div>
                      }
                      @if (canvasGlobalBg().overlay > 0) {
                        <div class="canvas-bg-overlay" [class.bg-banner]="canvasGlobalBg().fit === 'banner' && previewDevice() !== 'mobile'" [style.--banner-w]="canvasGlobalBg().bannerWidth + '%'" [style.background]="'rgba(0,0,0,' + (canvasGlobalBg().overlay / 100) + ')'"></div>
                      }
                    </div>
                  }
                <div class="preview-section-click" [class.drag-enabled]="canvasMode() === 'canvas'" data-section="hero" [class.section-active]="canvasState.selectedSection() === 'hero'" (click)="selectSection('hero'); $event.stopPropagation()">
                  @if (canvasState.config()!.hero) {
                    <app-landing-hero [config]="canvasState.config()!.hero" [event]="eventData()" [enabledSections]="getPreviewEnabledSections()" [editable]="canvasMode() === 'canvas'" [previewDevice]="previewDevice()" (positionsChange)="onHeroPositionsChange($event)" />
                  }
                </div>
                <div class="preview-section-click" [class.drag-enabled]="canvasMode() === 'canvas'" data-section="invitation" [class.section-active]="canvasState.selectedSection() === 'invitation'" [attr.style]="getSectionBgStyle('invitation')" (click)="selectSection('invitation'); $event.stopPropagation()">
                  @if (canvasState.config()!.invitation) {
                    <app-landing-invitation [config]="canvasState.config()!.invitation" [guest]="previewGuest" [styles]="canvasState.config()?.globalStyles!" [sectionStyle]="canvasState.config()!.invitation.sectionStyle" [editable]="canvasMode() === 'canvas'" [previewDevice]="previewDevice()" (positionsChange)="onInvitationPositionsChange($event)" />
                  }
                </div>
                @if (canvasState.config()?.details?.enabled) {
                  <!-- Cada card de Detalles = una mini-sección seleccionable independiente. El
                       componente details renderiza SOLO esa card (onlyIndex). El fondo/estilo por
                       card se resuelven dentro del componente, por eso aquí NO se inyecta getSectionBgStyle. -->
                  @for (dcard of detailCards(); track dcard.id; let di = $index) {
                    <div class="preview-section-click" [class.drag-enabled]="canvasMode() === 'canvas'" [attr.data-section]="'details:' + dcard.id"
                         [class.section-active]="canvasState.selectedSection() === 'details' && canvasState.selectedDetailIndex() === di"
                         (click)="selectDetail(di); $event.stopPropagation()">
                      <app-landing-details [config]="canvasState.config()!.details" [styles]="canvasState.config()?.globalStyles!" [sectionStyle]="canvasState.config()!.details.sectionStyle" [onlyIndex]="di" [previewDevice]="previewDevice()" [editable]="canvasMode() === 'canvas'" (positionsChange)="onDetailPositionsChange($event)" />
                    </div>
                  }
                }
                @if (canvasState.config()?.venues?.enabled) {
                  <!-- Cada venue = mini-sección seleccionable independiente (como Detalles). -->
                  @for (vitem of venueItems(); track vitem.id; let vi = $index) {
                    <div class="preview-section-click" [class.drag-enabled]="canvasMode() === 'canvas'" [attr.data-section]="'venues:' + vitem.id"
                         [class.section-active]="canvasState.selectedSection() === 'venues' && canvasState.selectedVenueIndex() === vi"
                         (click)="selectVenue(vi); $event.stopPropagation()">
                      <app-landing-venues [config]="canvasState.config()!.venues" [styles]="canvasState.config()?.globalStyles!" [sectionStyle]="canvasState.config()!.venues.sectionStyle" [onlyIndex]="vi" [previewDevice]="previewDevice()" [editable]="canvasMode() === 'canvas'" (positionsChange)="onVenuePositionsChange($event)" />
                    </div>
                  }
                }
                @if (canvasState.config()?.itinerary?.enabled) {
                  <div class="preview-section-click" data-section="itinerary" [class.section-active]="canvasState.selectedSection() === 'itinerary'" [attr.style]="getSectionBgStyle('itinerary')" (click)="selectSection('itinerary'); $event.stopPropagation()">
                    <app-landing-itinerary [config]="canvasState.config()!.itinerary" [items]="itineraryItems()" [styles]="canvasState.config()?.globalStyles!" />
                  </div>
                }
                @if (canvasState.config()?.gallery?.enabled) {
                  <div class="preview-section-click" data-section="gallery" [class.section-active]="canvasState.selectedSection() === 'gallery'" [attr.style]="getSectionBgStyle('gallery')" (click)="selectSection('gallery'); $event.stopPropagation()">
                    <app-landing-gallery [config]="canvasState.config()!.gallery" [photos]="photos()" [styles]="canvasState.config()?.globalStyles!" [sectionStyle]="canvasState.config()!.gallery.sectionStyle" [staticMode]="true" />
                  </div>
                }
                @if (canvasState.config()?.dresscode?.enabled) {
                  <!-- Cada vestimenta = mini-sección seleccionable independiente (como Detalles/Lugares). -->
                  @for (dcard of dresscodeCards(); track dcard.id; let di = $index) {
                    <div class="preview-section-click" [class.drag-enabled]="canvasMode() === 'canvas'" [attr.data-section]="'dresscode:' + dcard.id"
                         [class.section-active]="canvasState.selectedSection() === 'dresscode' && canvasState.selectedDresscodeIndex() === di"
                         (click)="selectDresscode(di); $event.stopPropagation()">
                      <app-landing-dresscode [config]="canvasState.config()!.dresscode" [styles]="canvasState.config()?.globalStyles!" [sectionStyle]="canvasState.config()!.dresscode.sectionStyle" [onlyIndex]="di" [previewDevice]="previewDevice()" [editable]="canvasMode() === 'canvas'" (positionsChange)="onDresscodePositionsChange($event)" />
                    </div>
                  }
                }
                @if (canvasState.config()?.gifts?.enabled) {
                  <div class="preview-section-click" [class.drag-enabled]="canvasMode() === 'canvas'" data-section="gifts" [class.section-active]="canvasState.selectedSection() === 'gifts'" [attr.style]="getSectionBgStyle('gifts')" (click)="selectSection('gifts'); $event.stopPropagation()">
                    <app-landing-gifts [config]="canvasState.config()!.gifts" [styles]="canvasState.config()?.globalStyles!" [sectionStyle]="canvasState.config()!.gifts.sectionStyle" [editable]="canvasMode() === 'canvas'" [previewDevice]="previewDevice()" (positionsChange)="onGiftsPositionsChange($event)" />
                  </div>
                }
                @if (canvasState.config()?.rsvp?.enabled) {
                  <div class="preview-section-click" data-section="rsvp" [class.section-active]="canvasState.selectedSection() === 'rsvp'" [attr.style]="getSectionBgStyle('rsvp')" (click)="selectSection('rsvp'); $event.stopPropagation()">
                    <app-landing-rsvp [config]="canvasState.config()!.rsvp" [guest]="previewGuest" slug="preview" [styles]="canvasState.config()?.globalStyles!" />
                  </div>
                }
                </div><!-- /.canvas-bg-scope -->
              </div>
          }
        </div>
        <!-- No external glow indicators needed -->
      </div>
      }

      <!-- Preview mode: iframe with real landing -->
      @if (canvasMode() === 'preview') {
      <div class="builder-preview-area" [class.center-frame]="previewDevice() === 'mobile'">
        <div class="preview-guest-selector">
          <span class="preview-guest-label">Previsualizar invitación:</span>
          <app-custom-select [options]="getPreviewGuestOptions()" [value]="previewGuestCode()" [compact]="true" placeholder="Selecciona una invitación" (valueChange)="selectPreviewGuest($event)"></app-custom-select>
        </div>
        <div class="builder-preview-frame" [class.mobile]="previewDevice() === 'mobile'" [class.desktop]="previewDevice() === 'desktop'" [style.width.px]="previewDevice() === 'mobile' ? canvasDeviceWidth() : null" [style.height.px]="previewDevice() === 'mobile' ? canvasDeviceHeight() : null">
          <iframe [src]="previewUrl()" class="preview-iframe" allow="autoplay"></iframe>
        </div>
      </div>
      }

      <!-- FAB toggle sections panel (hidden in preview mode) -->
      @if (canvasMode() === 'canvas') {
      <button class="builder-sections-fab" [class.active]="isSectionsPanelOpen()" (click)="toggleSectionsPanel()" title="Secciones">
        <span class="material-icons">layers</span>
      </button>
      }

      <!-- FAB toggle props (hidden in preview mode) -->
      @if (canvasMode() === 'canvas') {
      <button class="builder-props-fab" [class.active]="showProps()" (click)="showProps() ? showProps.set(false) : toggleProps()" title="Propiedades">
        <span class="material-icons">tune</span>
      </button>
      }

      <!-- Right Panel: Properties (only in canvas mode) -->
      @if (showProps() && canvasMode() === 'canvas') {
        <aside class="builder-panel builder-panel-right panel-visible">
          <div class="builder-panel-header">
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
      height: 100%;
      height: 100dvh;
      max-height: 100dvh;
      overscroll-behavior: none;
    }
    .builder-toolbar {
      display: flex; align-items: center;
      padding: 8px 16px; background: rgba(10,10,20,0.95);
      border-bottom: 1px solid rgba(139,92,246,0.15);
      z-index: 10; position: relative; min-height: 48px; gap: 12px;
    }
    /* Tres grupos en una sola fila: izquierda (ancho natural), centro (crece y centra),
       derecha (empujada al borde por margin-left:auto del propio grupo via flex). */
    .builder-toolbar-left { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; min-width: 0; }
    .builder-toolbar-center { display: flex; align-items: center; justify-content: center; gap: 4px; flex: 1 1 auto; }
    .builder-toolbar-right { display: flex; align-items: center; flex: 0 0 auto; }
    .builder-event-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
    /* Selector de dispositivo en la toolbar (escritorio). Compacto para no robar espacio. */
    .builder-device-select { min-width: 180px; max-width: 220px; }
    /* Selector de dispositivo en el panel de Secciones (móvil, sobre "Tema Global"). */
    .builder-device-select-panel {
      margin: 8px 6px 4px; padding: 8px 10px; border-radius: 10px;
      background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.18);
      display: flex; flex-direction: column; gap: 6px;
    }
    .builder-device-select-panel .device-select-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.5px;
      .material-icons { font-size: 15px; color: var(--gold-light); }
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
      flex: 1; overflow: hidden; position: relative; min-height: 0;
    }
    .builder-layout.panel-hidden { grid-template-columns: 1fr; }
    .builder-layout.preview-layout { grid-template-columns: 1fr; }
    /* Panel de propiedades con ancho fluido: minimo 280px (el ancho original, para que al
       achicar la ventana no ocupe de mas), escala con el viewport, tope 400px. El canvas
       (1fr) absorbe el resto. */
    .builder-layout.props-open { grid-template-columns: 220px 1fr clamp(280px, 26vw, 400px); }
    .builder-layout.props-open.panel-hidden { grid-template-columns: 1fr clamp(280px, 26vw, 400px); }

    /* === MODO AMPLIO (>=1280px): ambos paneles a la vez, propiedades mas ancho === */
    .builder-layout.wide { grid-template-columns: 240px 1fr; }
    .builder-layout.wide.panel-hidden { grid-template-columns: 1fr; }
    .builder-layout.wide.props-open { grid-template-columns: 240px 1fr clamp(280px, 24vw, 480px); }
    .builder-layout.wide.props-open.panel-hidden { grid-template-columns: 1fr clamp(280px, 24vw, 480px); }
    .builder-layout.wide.preview-layout { grid-template-columns: 1fr; }
    /* El ancho lo controla la columna del grid; el panel se estira al 100% de su columna. */
    .builder-layout.wide .builder-panel-right { width: 100%; }

    .builder-preview-area {
      display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
      background: #06060e; padding: 8px; overflow: hidden; flex: 1; min-height: 0;
    }
    /* MOBILE: el marco del preview tiene alto fijo del dispositivo; si no cabe en el área, se
       permite scroll (overflow:auto) y se centra, igual que el canvas con .center-frame. En desktop
       el iframe ocupa el área (flex) y no scrollea aquí. */
    .builder-preview-area.center-frame { justify-content: center; overflow: auto; }
    .preview-guest-selector {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      margin-bottom: 8px; width: 100%; max-width: 400px; align-self: center;
    }
    .preview-guest-label { font-size: 12px; color: rgba(255,255,255,0.6); white-space: nowrap; }
    .preview-guest-selector app-custom-select { flex: 1; }
    .builder-preview-frame {
      border-radius: 12px; overflow: hidden; flex: 1; width: 100%; min-height: 0;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      /* MOBILE: el marco toma el ancho×ALTO EXACTO del dispositivo seleccionado (vía [style.width/
         height.px] inline). NO debe estirarse por flex ni forzar width:100% —eso ignoraba el tamaño
         del dispositivo y hacía que el preview no respetara el selector—. flex:0 + margin:auto lo
         deja al tamaño del dispositivo y centrado, igual que el canvas mobile. */
      &.mobile { flex: 0 0 auto; width: auto; max-width: 100%; margin: 0 auto; align-self: center; }
      &.desktop { width: 100%; max-width: 900px; }
    }
    .preview-iframe { width: 100%; height: 100%; border: none; display: block; }
    .builder-panel {
      background: rgba(10,10,20,0.98);
      border-right: 1px solid rgba(139,92,246,0.1);
      overflow-y: auto;
    }
    .builder-panel-right {
      border-right: none; border-left: 1px solid rgba(139,92,246,0.1);
      width: 100%; z-index: 20;
      display: none; flex-direction: column;
      min-height: 0; height: 100%;
    }
    .builder-panel-right.panel-visible { display: flex; }
    .builder-panel-right app-builder-props-panel { flex: 1; overflow-y: auto; display: block; min-height: 0; }
    .builder-panel-header {
      display: flex; align-items: center; justify-content: center;
      padding: 12px 14px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7);
      border-bottom: 1px solid rgba(139,92,246,0.08);
      text-transform: uppercase; letter-spacing: 1px;
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
    /* "Detalles" actúa como encabezado agrupador: su label se ve un poco más tenue. */
    .builder-section-item.is-group .section-label { color: rgba(255,255,255,0.6); font-weight: 600; letter-spacing: 0.3px; }
    /* Botón de colapso (chevron) del grupo (Detalles/Lugares). */
    .section-collapse {
      display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; cursor: pointer; padding: 2px; border-radius: 5px;
      color: rgba(255,255,255,0.45); transition: background 0.15s, color 0.15s;
      .material-icons { font-size: 18px; }
      &:hover { background: rgba(139,92,246,0.15); color: rgba(255,255,255,0.85); }
    }
    /* ===== Sub-entradas "Detalle N" (mini-secciones de Detalles) ===== */
    .builder-subsections { margin: 0 0 4px 18px; padding-left: 8px; border-left: 1px solid rgba(139,92,246,0.15); display: flex; flex-direction: column; gap: 2px; }
    .builder-subsection-item {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 8px; border-radius: 7px; cursor: pointer;
      border: 1px solid transparent; font-size: 11.5px; transition: all 0.15s;
      &:hover { background: rgba(139,92,246,0.06); }
      &.active { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.3); }
    }
    .sub-drag-handle { font-size: 13px; color: rgba(255,255,255,0.18); cursor: grab; }
    .subsection-label { flex: 1; color: rgba(255,255,255,0.75); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .subsection-delete {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
      border-radius: 6px; cursor: pointer; padding: 3px; display: flex; flex-shrink: 0;
      color: #ff8585; transition: all 0.2s;
      .material-icons { font-size: 15px; }
      &:hover { background: rgba(239,68,68,0.85); border-color: rgba(239,68,68,0.9); color: #fff; }
    }
    .builder-add-detail {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      margin-top: 2px; padding: 6px 8px; border-radius: 7px;
      background: rgba(139,92,246,0.06); border: 1px dashed rgba(139,92,246,0.25);
      color: #c084fc; font-size: 11px; cursor: pointer; transition: all 0.2s;
      .material-icons { font-size: 15px; }
      &:hover { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.45); }
    }
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
    .section-permanent {
      font-size: 13px; padding: 2px;
      color: rgba(139,92,246,0.6);
      transform: rotate(45deg);
      cursor: default;
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
      background: #06060e; padding: 16px; overflow: hidden; min-height: 0;
    }
    /* En modo mobile el marco del canvas tiene alto fijo (del dispositivo) y suele ser más corto
       que el área: lo centramos vertical y horizontalmente. En desktop el canvas es alto y
       scrollea, por eso ahí se mantiene flex-start (no se centra). */
    .builder-canvas-area.center-frame { align-items: center; overflow: auto; }
    /* El VIEWPORT es ahora el contenedor scrolleable (antes lo era .builder-canvas-area).
       Esto permite que el fondo (position:sticky) se ancle al viewport y quede fijo mientras
       las secciones scrollean por encima — replicando el fondo fijo de la landing real. */
    .builder-canvas-viewport {
      border-radius: 16px; overflow-y: auto; overflow-x: hidden;
      max-height: 100%;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.06);
      background: #0d1117;
      &.mobile { width: var(--canvas-mobile-w, 360px); }
      &.desktop { width: 100%; max-width: 900px; }
    }
    /* Ocultar la barra de scroll del viewport para que el mockup se vea limpio */
    .builder-canvas-viewport::-webkit-scrollbar { width: 0; height: 0; }
    .builder-canvas-viewport { scrollbar-width: none; }
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
    /* Contenedor de fondo sticky: se pega al tope del canvas y ocupa solo la altura del
       viewport visible. Antes el GIF (position:absolute; inset:0 sobre .preview-mode-canvas
       de altura completa) se estiraba a miles de px de alto y background-size:cover lo
       escalaba de forma extrema → pixelado. Con sticky + altura acotada, el GIF se dimensiona
       como en la landing (position:fixed) y se ve nítido. */
    /* Contenedor del fondo: empieza en la carátula (hero), por eso el fondo no cubre
       la pantalla de inicio ni la intro (que quedan fuera de este scope). */
    .canvas-bg-scope { position: relative; }
    /* Fondo FIJO como en la landing real: sticky al tope del viewport scrolleable, con alto
       del área visible. Al scrollear las secciones pasan por encima y el fondo permanece
       estático (no se repite ni se estira). El margin-bottom negativo evita que ocupe espacio
       en el flujo para que el contenido se pinte sobre él. */
    .canvas-bg-sticky {
      position: sticky; top: 0; z-index: 0;
      /* Altura relativa al alto visible del viewport del canvas (medido por JS en
         --canvas-vh). Así el fondo cubre exactamente la ventana visible, como el 100vh
         de la landing, y se adapta al alto del canvas. */
      width: 100%; height: var(--canvas-vh, 640px);
      margin-bottom: calc(-1 * var(--canvas-vh, 640px));
      overflow: hidden;
      pointer-events: none;
    }
    /* Orden de capas igual que la landing real: textura (1) < GIF (2) < overlay (3) < secciones (4). */
    .canvas-bg-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 2; pointer-events: none; }
    .canvas-bg-image { position: absolute; inset: 0; width: 100%; height: 100%; background-size: cover; background-position: center; z-index: 2; pointer-events: none; }
    .canvas-bg-overlay { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
    .canvas-bg-texture { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
    /* Textura que cubre TODO el scope scrolleable (de la carátula al final), no un solo viewport.
       Va absolute inset:0 sobre .canvas-bg-scope (position:relative con altura completa), así el
       patrón se repite/cubre toda la altura igual que el color de fondo. */
    .canvas-bg-texture-full { position: absolute; inset: 0; height: 100%; z-index: 0; pointer-events: none; }
    /* Modo banner en el canvas: la imagen se dibuja a un TAMAÑO FIJO (alto = 100% de la ventana,
       ancho proporcional -> "auto 100%"). El slider solo cambia el ancho de la ventana/mascara
       centrada: recorta mas o menos la imagen SIN re-escalarla. */
    .canvas-bg-media.bg-banner,
    .canvas-bg-image.bg-banner,
    .canvas-bg-overlay.bg-banner {
      left: 50%; right: auto;
      transform: translateX(-50%);
      width: var(--banner-w, 70%);
    }
    .canvas-bg-image.bg-banner { background-size: auto 100%; background-position: center center; background-repeat: no-repeat; }
    .canvas-bg-media.bg-banner { object-fit: cover; object-position: center center; }
    .canvas-bg-texture[data-texture="noise"] { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
    .canvas-bg-texture[data-texture="grain"] { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E"); }
    .canvas-bg-texture[data-texture="dots"] { background-image: radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 8px 8px; }
    .canvas-bg-texture[data-texture="lines"] { background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 5px); }
    .canvas-bg-texture[data-texture="cross"] { background-image: repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px), repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px); }
    .canvas-bg-texture[data-texture="paper"] { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E"); }
    .canvas-bg-texture[data-texture="linen"] { background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px); }
    .canvas-bg-texture[data-texture="stars"] { background-image: radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 24px 24px; }
    .preview-mode-canvas > .preview-section-click,
    .canvas-bg-scope > .preview-section-click { position: relative; z-index: 4; }
    .preview-mode-canvas ::ng-deep .landing-nav { position: relative !important; z-index: 10 !important; background: var(--theme-nav-bar-bg, rgba(13,17,23,0.85)) !important; backdrop-filter: blur(var(--theme-nav-bar-blur, 12px)) !important; border-bottom: 1px solid var(--theme-nav-bar-border, rgba(212,160,23,0.2)) !important; }
    /* En el canvas el navbar es position:relative (ocupa espacio), por lo que la carátula
       empezaba DEBAJO de él y su fondo también. Con margin-top negativo = alto del navbar (72px),
       la sección (y su fondo) suben para quedar DETRÁS del navbar; el padding-top mantiene el
       contenido por debajo del navbar. El navbar (z-index:10) queda por encima del fondo. */
    .preview-mode-canvas ::ng-deep .hero-section { min-height: var(--canvas-vh, 640px) !important; margin-top: -72px !important; padding-top: 132px !important; }
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
    .preview-mode-canvas ::ng-deep .intro-overlay { position: relative !important; z-index: 1 !important; height: var(--canvas-vh, 640px); min-height: auto !important; inset: auto !important; overflow: hidden; }
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
    .preview-mode-canvas ::ng-deep .intro-bg-overlay { /* preserve landing overlay for GIF quality */ }
    .preview-mode-canvas ::ng-deep .intro-bg-video,
    .preview-mode-canvas ::ng-deep .intro-bg { animation: none !important; }
    .preview-mode-canvas ::ng-deep .envelope-overlay { position: relative !important; z-index: 1 !important; height: var(--canvas-vh, 640px); min-height: auto !important; inset: auto !important; overflow: hidden; }
    /* En el canvas, el fondo banner del envelope debe llenar el alto de la seccion (500px) y
       acotar su ancho al contenedor del canvas (no al viewport). Neutraliza el 96vw heredado
       y el max-width:100% global para que cover recorte a los lados manteniendo el alto. */
    .preview-mode-canvas ::ng-deep .envelope-bg-image.bg-banner {
      width: var(--banner-w, 70%) !important;
      height: 100% !important; top: 0 !important; bottom: 0 !important;
      background-size: auto 100% !important; background-position: center center !important; background-repeat: no-repeat !important;
    }
    /* In canvas mode, prevent envelope from disappearing after being opened */
    .preview-mode-canvas ::ng-deep .envelope-overlay.opened { opacity: 1 !important; pointer-events: auto !important; }
    /* In live preview, overlays stay same height but are fully interactive */
    .live-preview .preview-mode-canvas ::ng-deep .envelope-overlay { height: var(--canvas-vh, 640px); cursor: pointer; }
    .live-preview .preview-mode-canvas ::ng-deep .envelope-overlay.opened { opacity: 0 !important; pointer-events: none !important; }
    .live-preview .preview-mode-canvas ::ng-deep .intro-overlay { height: var(--canvas-vh, 640px); cursor: pointer; }
    .preview-mode-canvas ::ng-deep * { max-width: 100% !important; }
    /* EXCEPCIONES al max-width:100% universal: los LIENZOS de drag (data-drag-bounds) de las
       secciones de apertura deben conservar su ancho de referencia FIJO por dispositivo
       (--canvas-desktop-w / --canvas-mobile-w), para que un objeto en % mida igual en canvas,
       preview (iframe) y landing, y NO se reescale al cambiar el dispositivo del selector (que solo
       agranda el MARCO). La regla universal de arriba los recortaba al ancho del viewport del
       canvas; las restablecemos con mayor especificidad.
       Pines MOBILE + DESKTOP para plano/intro/hero/invitación. */
    .preview-mode-canvas ::ng-deep .plain-container.plain-desktop { width: var(--canvas-desktop-w, 600px) !important; max-width: var(--canvas-desktop-w, 600px) !important; }
    .preview-mode-canvas ::ng-deep .plain-container.plain-mobile { width: var(--canvas-mobile-w, 360px) !important; max-width: var(--canvas-mobile-w, 360px) !important; }
    .preview-mode-canvas ::ng-deep .intro-fg.intro-fg-desktop { width: var(--canvas-desktop-w, 600px) !important; max-width: var(--canvas-desktop-w, 600px) !important; }
    .preview-mode-canvas ::ng-deep .intro-fg.intro-fg-mobile { width: var(--canvas-mobile-w, 360px) !important; max-width: var(--canvas-mobile-w, 360px) !important; }
    .preview-mode-canvas ::ng-deep .hero-fg.hero-fg-desktop { width: var(--canvas-desktop-w, 600px) !important; max-width: var(--canvas-desktop-w, 600px) !important; }
    .preview-mode-canvas ::ng-deep .hero-fg.hero-fg-mobile { width: var(--canvas-mobile-w, 360px) !important; max-width: var(--canvas-mobile-w, 360px) !important; }
    .preview-mode-canvas ::ng-deep .inv-fg.canvas-desktop { width: var(--canvas-desktop-w, 600px) !important; max-width: var(--canvas-desktop-w, 600px) !important; }
    .preview-mode-canvas ::ng-deep .inv-fg.canvas-mobile { width: var(--canvas-mobile-w, 360px) !important; max-width: var(--canvas-mobile-w, 360px) !important; }
    .preview-mode-canvas ::ng-deep .details-mini.positioned .details-mini-inner.canvas-desktop { width: var(--canvas-desktop-w, 600px) !important; max-width: var(--canvas-desktop-w, 600px) !important; }
    .preview-mode-canvas ::ng-deep .details-mini.positioned .details-mini-inner.canvas-mobile { width: var(--canvas-mobile-w, 360px) !important; max-width: var(--canvas-mobile-w, 360px) !important; }
    .preview-mode-canvas ::ng-deep .venues-mini.positioned .venues-mini-inner.canvas-desktop { width: var(--canvas-desktop-w, 600px) !important; max-width: var(--canvas-desktop-w, 600px) !important; }
    .preview-mode-canvas ::ng-deep .venues-mini.positioned .venues-mini-inner.canvas-mobile { width: var(--canvas-mobile-w, 360px) !important; max-width: var(--canvas-mobile-w, 360px) !important; }
    .preview-mode-canvas ::ng-deep .back-to-top { display: none !important; }
    .preview-mode-canvas ::ng-deep .gallery-section { min-height: 300px; contain: content; overflow: hidden; padding-bottom: 60px; }
    .gallery-canvas-preview { padding: 30px 16px 60px; text-align: center; }
    .gallery-canvas-title { font-size: 28px; margin-bottom: 20px; }
    .gallery-canvas-carousel { display: flex; align-items: center; justify-content: center; gap: 8px; height: 180px; overflow: hidden; }
    .gallery-canvas-card {
      width: 120px; height: 160px; border-radius: 12px;
      border: 1px dashed rgba(139,92,246,0.3); background: rgba(139,92,246,0.04);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 500;
      transition: transform 0.5s ease, opacity 0.5s ease, border-color 0.3s;
      transform: scale(0.85); opacity: 0.5;
    }
    .gallery-canvas-card.active {
      transform: scale(1); opacity: 1;
      border-color: rgba(139,92,246,0.6); background: rgba(139,92,246,0.08);
      box-shadow: 0 4px 20px rgba(139,92,246,0.15);
    }
    .gallery-canvas-style { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 12px; }
    .preview-mode-canvas ::ng-deep [style*="position: fixed"],
    .preview-mode-canvas ::ng-deep [style*="position:fixed"] { position: relative !important; }

    /* ===== Override de texto por sección en el CANVAS (paridad con la landing) =====
       getSectionBgStyle() inyecta las variables --section-* en .preview-section-click;
       estas reglas las aplican a los h2/h3/p internos de los componentes de sección.
       Selectores espejo de los de landing.component.ts, pero scopeados a .preview-section-click. */
    /* BANNER imagen (canvas): columna centrada cover de ancho --sec-banner-w + overlay --sec-ov. */
    .preview-section-click[style*="--sec-banner-w"]{position:relative}
    .preview-section-click[style*="--sec-banner-w"]::before{content:'';position:absolute;top:0;bottom:0;left:50%;width:var(--sec-banner-w,70%);transform:translateX(-50%);background:var(--sec-bg-image) center/auto 100% no-repeat;z-index:0;pointer-events:none}
    .preview-section-click[style*="--sec-banner-w"]::after{content:'';position:absolute;top:0;bottom:0;left:50%;width:var(--sec-banner-w,70%);transform:translateX(-50%);background:rgba(0,0,0,var(--sec-ov,0));z-index:0;pointer-events:none}
    .preview-section-click[style*="--section-h2-color"] ::ng-deep .section-heading,
    .preview-section-click[style*="--section-h2-color"] ::ng-deep h2,
    .preview-section-click[style*="--section-h2-color"] ::ng-deep .invitation-title {
      color: var(--section-h2-color) !important;
      -webkit-text-fill-color: var(--section-h2-color) !important;
      background-image: none !important;
    }
    .preview-section-click[style*="--section-h2-font"] ::ng-deep .section-heading,
    .preview-section-click[style*="--section-h2-font"] ::ng-deep h2,
    .preview-section-click[style*="--section-h2-font"] ::ng-deep .invitation-title {
      font-family: var(--section-h2-font) !important;
    }
    .preview-section-click[style*="--section-h2-size"] ::ng-deep .section-heading,
    .preview-section-click[style*="--section-h2-size"] ::ng-deep h2,
    .preview-section-click[style*="--section-h2-size"] ::ng-deep .invitation-title {
      font-size: var(--section-h2-size) !important;
    }
    .preview-section-click[style*="--section-heading-color"] ::ng-deep h3:not(.transfer-card-title),
    .preview-section-click[style*="--section-heading-color"] ::ng-deep .example-title,
    .preview-section-click[style*="--section-heading-color"] ::ng-deep .venue-title,
    .preview-section-click[style*="--section-heading-color"] ::ng-deep .timeline-title,
    .preview-section-click[style*="--section-heading-color"] ::ng-deep .transfer-title,
    .preview-section-click[style*="--section-heading-color"] ::ng-deep .rsvp-name,
    .preview-section-click[style*="--section-heading-color"] ::ng-deep .invitation-name,
    .preview-section-click[style*="--section-heading-color"] ::ng-deep .invitation-subtitle,
    .preview-section-click[style*="--section-heading-color"] ::ng-deep .gallery-desc,
    .preview-section-click[style*="--section-heading-color"] ::ng-deep .gifts-desc {
      color: var(--section-heading-color) !important;
      -webkit-text-fill-color: var(--section-heading-color) !important;
      background-image: none !important;
    }
    .preview-section-click[style*="--section-heading-color2"] ::ng-deep h3:not(.transfer-card-title),
    .preview-section-click[style*="--section-heading-color2"] ::ng-deep .example-title,
    .preview-section-click[style*="--section-heading-color2"] ::ng-deep .venue-title,
    .preview-section-click[style*="--section-heading-color2"] ::ng-deep .timeline-title,
    .preview-section-click[style*="--section-heading-color2"] ::ng-deep .transfer-title,
    .preview-section-click[style*="--section-heading-color2"] ::ng-deep .rsvp-name,
    .preview-section-click[style*="--section-heading-color2"] ::ng-deep .invitation-name,
    .preview-section-click[style*="--section-heading-color2"] ::ng-deep .invitation-subtitle {
      background: linear-gradient(var(--section-heading-angle, 135deg), var(--section-heading-color) 0%, var(--section-heading-color) var(--section-heading-mid-a, 25%), var(--section-heading-color2) var(--section-heading-mid-b, 75%), var(--section-heading-color2) 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    .preview-section-click[style*="--section-heading-weight"] ::ng-deep h3:not(.transfer-card-title),
    .preview-section-click[style*="--section-heading-weight"] ::ng-deep .example-title,
    .preview-section-click[style*="--section-heading-weight"] ::ng-deep .venue-title,
    .preview-section-click[style*="--section-heading-weight"] ::ng-deep .timeline-title,
    .preview-section-click[style*="--section-heading-weight"] ::ng-deep .transfer-title,
    .preview-section-click[style*="--section-heading-weight"] ::ng-deep .rsvp-name,
    .preview-section-click[style*="--section-heading-weight"] ::ng-deep .invitation-name,
    .preview-section-click[style*="--section-heading-weight"] ::ng-deep .invitation-subtitle {
      font-weight: var(--section-heading-weight) !important;
    }
    .preview-section-click[style*="--section-heading-font"] ::ng-deep h3:not(.transfer-card-title),
    .preview-section-click[style*="--section-heading-font"] ::ng-deep .example-title,
    .preview-section-click[style*="--section-heading-font"] ::ng-deep .venue-title,
    .preview-section-click[style*="--section-heading-font"] ::ng-deep .timeline-title,
    .preview-section-click[style*="--section-heading-font"] ::ng-deep .transfer-title,
    .preview-section-click[style*="--section-heading-font"] ::ng-deep .rsvp-name,
    .preview-section-click[style*="--section-heading-font"] ::ng-deep .invitation-name,
    .preview-section-click[style*="--section-heading-font"] ::ng-deep .invitation-subtitle,
    .preview-section-click[style*="--section-heading-font"] ::ng-deep .gallery-desc,
    .preview-section-click[style*="--section-heading-font"] ::ng-deep .gifts-desc {
      font-family: var(--section-heading-font) !important;
    }
    .preview-section-click[style*="--section-heading-size"] ::ng-deep h3:not(.transfer-card-title),
    .preview-section-click[style*="--section-heading-size"] ::ng-deep .example-title,
    .preview-section-click[style*="--section-heading-size"] ::ng-deep .venue-title,
    .preview-section-click[style*="--section-heading-size"] ::ng-deep .timeline-title,
    .preview-section-click[style*="--section-heading-size"] ::ng-deep .transfer-title,
    .preview-section-click[style*="--section-heading-size"] ::ng-deep .rsvp-name,
    .preview-section-click[style*="--section-heading-size"] ::ng-deep .invitation-name,
    .preview-section-click[style*="--section-heading-size"] ::ng-deep .invitation-subtitle {
      font-size: var(--section-heading-size) !important;
    }
    .preview-section-click[style*="--section-content-color"] ::ng-deep p,
    .preview-section-click[style*="--section-content-color"] ::ng-deep .detail-content,
    .preview-section-click[style*="--section-content-color"] ::ng-deep .dresscode-desc,
    .preview-section-click[style*="--section-content-color"] ::ng-deep .example-desc,
    .preview-section-click[style*="--section-content-color"] ::ng-deep .venue-name,
    .preview-section-click[style*="--section-content-color"] ::ng-deep .venue-address,
    .preview-section-click[style*="--section-content-color"] ::ng-deep .timeline-desc {
      color: var(--section-content-color) !important;
    }
    .preview-section-click[style*="--section-content-font"] ::ng-deep p,
    .preview-section-click[style*="--section-content-font"] ::ng-deep .detail-content,
    .preview-section-click[style*="--section-content-font"] ::ng-deep .dresscode-desc,
    .preview-section-click[style*="--section-content-font"] ::ng-deep .example-desc,
    .preview-section-click[style*="--section-content-font"] ::ng-deep .venue-name,
    .preview-section-click[style*="--section-content-font"] ::ng-deep .venue-address,
    .preview-section-click[style*="--section-content-font"] ::ng-deep .timeline-desc {
      font-family: var(--section-content-font) !important;
    }
    .preview-section-click[style*="--section-content-size"] ::ng-deep p,
    .preview-section-click[style*="--section-content-size"] ::ng-deep .detail-content,
    .preview-section-click[style*="--section-content-size"] ::ng-deep .dresscode-desc,
    .preview-section-click[style*="--section-content-size"] ::ng-deep .example-desc,
    .preview-section-click[style*="--section-content-size"] ::ng-deep .venue-name,
    .preview-section-click[style*="--section-content-size"] ::ng-deep .venue-address,
    .preview-section-click[style*="--section-content-size"] ::ng-deep .timeline-desc {
      font-size: var(--section-content-size) !important;
    }
    .preview-section-click {
      cursor: pointer; position: relative; transition: box-shadow 0.2s;
      /* Alto mínimo = alto visible del canvas (--canvas-vh, recalculado por el ResizeObserver
         al redimensionar). Replica el 100svh de la landing: secciones cortas se estiran a la
         ventana del canvas y centran su contenido; las extensibles crecen más allá del mínimo. */
      min-height: var(--canvas-vh, 640px);
      display: flex; flex-direction: column; justify-content: center;
      &:hover { box-shadow: inset 3px 0 0 rgba(139,92,246,0.4), inset -3px 0 0 rgba(139,92,246,0.4), inset 4px 0 6px -3px rgba(139,92,246,0.2), inset -4px 0 6px -3px rgba(139,92,246,0.2); }
      &.section-active { box-shadow: inset 3px 0 0 rgba(139,92,246,0.7), inset -3px 0 0 rgba(139,92,246,0.7), inset 6px 0 10px -3px rgba(139,92,246,0.3), inset -6px 0 10px -3px rgba(139,92,246,0.3); }
    }
    /* Hero/envelope/intro manejan su propio alto (margin negativo / overlays); no imponer el
       min-height genérico ni el centrado flex. Las mini-secciones de DETALLES/LUGARES/VESTIMENTA
       (data-section "details:<id>" / "venues:<id>" / "dresscode:<id>") también: cada card
       (.details-mini / .venue-mini / .dress-mini) gestiona su propio min-height (var --canvas-vh /
       100svh) y crece con su contenido, así que el wrapper no debe imponer otro alto ni centrar. */
    .preview-section-click[data-section="hero"],
    .preview-section-click[data-section="envelope"],
    .preview-section-click[data-section="intro"],
    .preview-section-click[data-section="gifts"],
    .preview-section-click[data-section^="details:"],
    .preview-section-click[data-section^="venues:"],
    .preview-section-click[data-section^="dresscode:"] { min-height: 0; display: block; }
    .preview-section-click[data-section="hero"] { overflow: visible; }
    /* Block pointer events on inner content so clicks go to the wrapper.
       Se excluye el envelope editable (.drag-enabled) para que el drag funcione. */
    .preview-section-click > * { pointer-events: none; }
    .preview-section-click.drag-enabled > * { pointer-events: auto; }
    .preview-section-click[style*="--sec-banner-w"]>*{position:relative;z-index:1}
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
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(139,92,246,0.4);
      transition: transform 0.3s, background 0.3s;
      .material-icons { font-size: 18px; transition: transform 0.3s; }
      &:hover { transform: scale(1.1); }
      &.active { background: rgba(239,68,68,0.85); box-shadow: 0 4px 12px rgba(239,68,68,0.4); }
      &.active .material-icons { transform: rotate(90deg); }
    }
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
        position: fixed; top: 90px; bottom: 0; left: 0; z-index: 100;
        width: 260px; box-shadow: 4px 0 24px rgba(0,0,0,0.5);
      }
      .builder-panel-left.mobile-open { display: block; }
      .builder-sections-fab { display: flex; z-index: 150; top: 92px; left: 8px; position: fixed; }
      .builder-save-text { display: none; }
      .builder-save-btn { min-width: auto !important; padding: 7px 10px !important; }
      .builder-toolbar-left { flex: 0 0 auto !important; max-width: none; overflow: visible; order: 0; }
      .builder-event-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100px; }
      .builder-toolbar {
        flex-wrap: nowrap !important;
        padding: 6px 8px !important;
        gap: 4px !important;
        min-height: auto !important;
      }
      .builder-toolbar-left { flex: 0 0 auto !important; }
      .builder-toolbar-right { order: 0; margin-left: auto; }
      .builder-toolbar-center { order: 0; flex: 1; justify-content: center; gap: 2px !important; }
      .builder-toolbar-center .builder-tb-sep { display: none; }
      .builder-toolbar-center .builder-device-btn { display: none; }
      .builder-toolbar-center .builder-device-select { display: none; }
      .builder-canvas-viewport.mobile { width: var(--canvas-mobile-w, 360px); max-width: 100%; border-radius: 8px; }
      .builder-panel-right.panel-visible {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: auto;
        width: 280px;
        max-width: 80vw;
        height: 100%;
        z-index: 150;
        border-radius: 0;
        border-left: 1px solid rgba(139,92,246,0.3);
        box-shadow: -4px 0 24px rgba(0,0,0,0.5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .builder-panel-right.panel-visible app-builder-props-panel {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
      }
      .builder-canvas-area { padding: 8px; }
      .builder-props-fab { top: 92px; right: 8px; z-index: 160; position: fixed; }
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `]
})
export class BuilderComponent implements OnInit, OnDestroy, AfterViewInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private dialog = inject(DialogService);
  canvasState = inject(CanvasStateService);
  private migration = inject(MigrationService);

  eventId = 0;
  eventName = signal('');
  sections = signal<BuilderSection[]>([]);
  previewDevice = signal<'mobile' | 'desktop'>('mobile');

  /** Catálogo de dispositivos MOBILE para simular el marco del canvas (ancho×alto CSS reales).
      El MARCO (fondo + secciones) adopta estas dimensiones; el LIENZO de drag se mantiene a
      --canvas-mobile-w (360px) centrado, así los objetos no se salen del área segura aunque el
      dispositivo sea más ancho. Rango: gama baja (360) a gama alta (440). */
  readonly canvasDevices: { id: string; label: string; w: number; h: number }[] = [
    { id: 'android-360', label: 'Android (gama baja/media) · 360', w: 360, h: 800 },
    { id: 'iphone-se', label: 'iPhone SE · 375', w: 375, h: 667 },
    { id: 'android-384', label: 'Android (gama media-alta) · 384', w: 384, h: 854 },
    { id: 'iphone-390', label: 'iPhone 14/15/16 · 390', w: 390, h: 844 },
    { id: 'android-412', label: 'Android (gama alta) · 412', w: 412, h: 915 },
    { id: 'iphone-414', label: 'iPhone XR/11 · 414', w: 414, h: 896 },
    { id: 'iphone-max', label: 'iPhone 16 Pro Max · 440', w: 440, h: 956 },
  ];
  /** Dispositivo mobile seleccionado para el marco del canvas. Default = Android 360 (base). */
  canvasDevice = signal<string>('android-360');
  /** Opciones del selector (app-custom-select). */
  get canvasDeviceOptions(): SelectOption[] {
    return this.canvasDevices.map(d => ({ value: d.id, label: d.label }));
  }
  /** Dispositivo activo resuelto (COMPUTED: reactivo a canvasDevice desde el primer render). */
  private activeDeviceSig = computed(() =>
    this.canvasDevices.find(d => d.id === this.canvasDevice()) || this.canvasDevices[0]
  );
  /** Ancho/alto CSS del marco del canvas mobile según el dispositivo elegido. Métodos que leen el
      computed → el binding [style.width/height.px] se recalcula correctamente ya en el 1er render
      (antes eran getters sobre un plain getter y el ancho no se aplicaba hasta cambiar de dispositivo). */
  canvasDeviceWidth(): number { return this.activeDeviceSig().w; }
  canvasDeviceHeight(): number { return this.activeDeviceSig().h; }
  /** Cambia el dispositivo del marco mobile. */
  setCanvasDevice(id: string) {
    this.canvasDevice.set(id);
    // Re-medir el alto visible del canvas tras cambiar el marco (el ResizeObserver también lo hace,
    // pero esto garantiza el refresh inmediato).
    requestAnimationFrame(() => this._applyCanvasHeight?.());
  }

  /** Ancho del viewport, reactivo para recalcular el layout de paneles al redimensionar. */
  viewportWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1280);
  /** Umbral a partir del cual ambos paneles pueden estar abiertos a la vez (pantalla amplia). */
  private readonly WIDE_BREAKPOINT = 1280;

  isMobileView(): boolean {
    return this.viewportWidth() <= 768;
  }
  /** True cuando hay ancho suficiente para mostrar ambos paneles simultáneamente. */
  isWide(): boolean {
    return this.viewportWidth() >= this.WIDE_BREAKPOINT;
  }

  @HostListener('window:resize')
  onWindowResize() {
    const w = window.innerWidth;
    if (w === this.viewportWidth()) return;
    const wasWide = this.isWide();
    this.viewportWidth.set(w);
    const nowWide = this.isWide();
    if (this.canvasMode() !== 'canvas') return;

    if (!wasWide && nowWide) {
      // Paso a pantalla amplia: ambos paneles pueden convivir. Abre secciones y,
      // si hay una seccion seleccionada, tambien propiedades.
      this.panelVisible.set(true);
      if (this.canvasState.selectedSection()) {
        this.showProps.set(true);
      }
    } else if (wasWide && !nowWide) {
      // Salio de pantalla amplia con ambos paneles abiertos: aplica exclusion mutua
      // automatica para que los overlays no tapen el canvas. Prioriza propiedades si
      // hay una seccion seleccionada; si no, deja secciones.
      if (this.showProps() && this.panelVisible()) {
        if (this.canvasState.selectedSection()) {
          this.panelVisible.set(false);
          this.showLeftPanel.set(false);
        } else {
          this.showProps.set(false);
        }
      }
    }
  }
  canvasMode = signal<'canvas' | 'preview'>('canvas');
  viewMode = signal<'edit' | 'preview'>('edit');
  saving = signal(false);
  saveStatus = signal<'idle' | 'saved'>('idle');
  showProps = signal(false);
  showLeftPanel = signal(false);
  panelVisible = signal(false);
  eventData = signal<any>({ name: '', event_date: '', slug: '' });
  previewGuest: any = {
    id: 0, event_id: 0, unique_code: 'preview-mock',
    guest_type: 'family', family_name: 'Familia García',
    guest_names: 'Carlos García, María López, Sofía García, Diego García',
    max_companions: 0, confirmed: 0
  };
  guests = signal<any[]>([]);
  previewGuestCode = signal<string>('');
  previewKey = signal(0);
  previewUrl = computed<SafeResourceUrl>(() => {
    const slug = this.eventData()?.slug || '';
    const baseUrl = window.location.origin;
    const key = this.previewKey();
    const guestCode = this.previewGuestCode();
    const guestParam = guestCode ? `&t=${guestCode}` : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}/invitacion/${slug}?preview=1${guestParam}&_=${key}`);
  });
  currentSection = signal<string | null>(null);
  currentConfig = signal<any>(null);
  private autoSaveTimer: any = null;

  /** Shortcut to active element for template */
  activeEl = this.canvasState.activeElement;

  hasUnsavedChanges(): boolean { return this.canvasState.isDirty(); }

  /** Open sections panel. En pantalla amplia NO cierra propiedades (ambos abiertos). */
  openSections() {
    this.panelVisible.set(true);
    this.showLeftPanel.set(true);
    if (!this.isWide()) {
      this.showProps.set(false);
    }
  }

  isSectionsPanelOpen(): boolean {
    if (this.isMobileView()) {
      return this.showLeftPanel();
    }
    return this.panelVisible();
  }

  toggleSectionsPanel() {
    if (this.isSectionsPanelOpen()) {
      this.panelVisible.set(false);
      this.showLeftPanel.set(false);
    } else {
      this.openSections();
    }
  }

  /** Toggle props panel. En pantalla amplia NO cierra secciones (ambos abiertos). */
  toggleProps() {
    const opening = !this.showProps();
    this.showProps.set(opening);
    // Exclusion mutua solo en pantallas no amplias
    if (opening && !this.isWide()) {
      this.panelVisible.set(false);
      this.showLeftPanel.set(false);
    }
  }

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    // Lock all parent scrolling while builder is open
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const pageContent = document.querySelector('.page-content') as HTMLElement;
    if (pageContent) pageContent.style.overflow = 'hidden';
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) mainContent.style.overflow = 'hidden';

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
      // En pantalla amplia, abrir el panel de secciones por defecto para aprovechar el espacio.
      if (this.isWide()) {
        this.panelVisible.set(true);
      }
      // FIX primer render: el canvas se monta recién ahora (tras cargar la config). Reafirmamos el
      // dispositivo activo y re-medimos el alto en el siguiente frame, para que el marco tome el
      // ancho×alto del dispositivo por defecto de inmediato (antes solo se aplicaba al cambiar de
      // dispositivo manualmente, porque el viewport aún no existía en el primer ciclo).
      requestAnimationFrame(() => {
        this.canvasDevice.set(this.canvasDevice());
        this._applyCanvasHeight?.();
      });
      // Precargar medios de fondo (intro + hero) para que estén decodificados en el
      // primer render del canvas. Sin esto, la intro salía sin fondo hasta reiniciar.
      this.preloadCanvasMedia(v2?.intro?.background);
      this.preloadCanvasMedia(v2?.hero?.backgroundGif);
    });
    // Register auto-save so props-panel changes trigger save
    this.canvasState.registerAutoSave(() => this.scheduleAutoSave());
    // Load related data
    this.loadItinerary();
    this.loadPhotos();
    this.loadGuests();
  }

  private canvasResizeObserver?: ResizeObserver;
  /** Referencia a la función que re-mide --canvas-vh, para forzarla al volver a modo canvas. */
  private _applyCanvasHeight?: () => void;

  /** Precarga una imagen/GIF/video de fondo para que esté lista en el primer render del canvas. */
  private preloadCanvasMedia(url?: string | null) {
    if (!url) return;
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'webm', 'ogg'].includes(ext)) {
      const video = document.createElement('video');
      video.preload = 'auto'; video.muted = true; video.src = url; video.load();
    } else {
      const img = new Image();
      img.src = url;
    }
  }

  ngAfterViewInit() {
    // Medir la altura visible del viewport del canvas y exponerla como --canvas-vh,
    // para que el fondo fijo (.canvas-bg-sticky) cubra exactamente esa altura y se
    // adapte al tamaño del canvas (como el 100vh de la landing).
    this.installCanvasHeightObserver();
  }

  private installCanvasHeightObserver() {
    const apply = () => {
      const viewport = document.querySelector('.builder-canvas-viewport') as HTMLElement | null;
      const canvas = document.querySelector('.preview-mode-canvas') as HTMLElement | null;
      if (viewport && canvas) {
        // En MOBILE el marco tiene un alto FIJO = alto del dispositivo seleccionado
        // (canvasDeviceHeight). Ese es el "100svh" real del teléfono simulado, así que
        // --canvas-vh debe valer EXACTAMENTE ese alto, NO el clientHeight del viewport
        // (que `max-height:100%` y el alto del área del canvas distorsionan: en monitores
        // altos quedaba mayor que el dispositivo → las mini-secciones nacían más largas que
        // la ventana y el contenido parecía cortarse). En DESKTOP sí usamos el clientHeight
        // del viewport (el canvas desktop se estira al área y scrollea).
        let h: number;
        if (this.previewDevice() === 'mobile') {
          h = this.canvasDeviceHeight();
        } else {
          h = viewport.clientHeight;
        }
        // Ignorar medidas de 0 (p. ej. cuando el canvas está oculto en modo preview):
        // conservaríamos el último alto válido para no colapsar la altura del hero/intro
        // al volver al modo canvas.
        if (h <= 0) return;
        // Solo actualizar si cambió, para no forzar reflows innecesarios que rompan
        // el primer render de secciones como la intro (que pinta su fondo absolute).
        const prev = canvas.style.getPropertyValue('--canvas-vh');
        if (prev !== h + 'px') {
          canvas.style.setProperty('--canvas-vh', h + 'px');
        }
      }
    };
    this._applyCanvasHeight = apply;
    // Reintentar hasta que el viewport exista (el canvas se renderiza tras cargar config).
    // Aplicamos en rAF (antes del paint) para evitar setear --canvas-vh DESPUÉS del primer
    // paint, lo que provocaba un reflow tardío que dejaba la intro sin fondo hasta reiniciar.
    const trySetup = () => {
      const viewport = document.querySelector('.builder-canvas-viewport') as HTMLElement | null;
      if (!viewport) { requestAnimationFrame(trySetup); return; }
      apply();
      // Segundo apply en el siguiente frame por si la altura definitiva del grid
      // aún no estaba resuelta en el primer frame.
      requestAnimationFrame(apply);
      this.canvasResizeObserver?.disconnect();
      this.canvasResizeObserver = new ResizeObserver(() => apply());
      this.canvasResizeObserver.observe(viewport);
    };
    requestAnimationFrame(trySetup);
  }

  ngOnDestroy() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.canvasResizeObserver?.disconnect();
    // Restore scroll when leaving builder
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    const pageContent = document.querySelector('.page-content') as HTMLElement;
    if (pageContent) pageContent.style.overflow = '';
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) mainContent.style.overflow = '';
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
    if (this.canvasMode() === 'preview') return;
    this.canvasState.selectSection(key);
    // Al seleccionar el grupo o cualquier otra sección, deseleccionar la sub-entrada activa de
    // Detalles/Lugares (se re-selecciona solo al clickear "Detalle N" / "Lugar N").
    this.canvasState.selectedDetailIndex.set(-1);
    this.canvasState.selectedVenueIndex.set(-1);
    this.canvasState.selectedDresscodeIndex.set(-1);
    this.currentSection.set(key);
    // On mobile, don't auto-open props panel (user can tap FAB to open it)
    if (!this.isMobileView()) {
      this.showProps.set(true);
    }
    // En pantalla amplia se mantiene el panel de secciones abierto (ambos visibles).
    // En pantallas menores se cierra para dar espacio al canvas.
    if (!this.isWide()) {
      this.panelVisible.set(false);
      this.showLeftPanel.set(false);
    }
    this.scrollToSection(key);
    this.updateSectionGlow(key);
  }

  // Section glow indicators
  sectionGlowTopValue = signal(0);
  sectionGlowHeightValue = signal(0);
  sectionGlowLeftValue = signal(0);
  sectionGlowRightValue = signal(0);
  sectionGlowTop(): number { return this.sectionGlowTopValue(); }
  sectionGlowHeight(): number { return this.sectionGlowHeightValue(); }
  sectionGlowLeftPos(): number { return this.sectionGlowLeftValue(); }
  sectionGlowRightPos(): number { return this.sectionGlowRightValue(); }

  private updateSectionGlow(key: string) {
    setTimeout(() => {
      const section = document.querySelector(`.preview-section-click[data-section="${key}"]`) as HTMLElement;
      const area = document.querySelector('.builder-canvas-area') as HTMLElement;
      const viewport = document.querySelector('.builder-canvas-viewport') as HTMLElement;
      if (section && area && viewport) {
        const areaRect = area.getBoundingClientRect();
        const secRect = section.getBoundingClientRect();
        const vpRect = viewport.getBoundingClientRect();
        // El scroll ahora vive en el viewport, no en el area.
        this.sectionGlowTopValue.set(secRect.top - areaRect.top + viewport.scrollTop);
        this.sectionGlowHeightValue.set(secRect.height);
        // Position glows at the edges of the viewport
        this.sectionGlowLeftValue.set(vpRect.left - areaRect.left - 16);
        this.sectionGlowRightValue.set(vpRect.right - areaRect.left);
      }
    }, 100);
  }

  /** data-section de la sección/mini-sección actualmente seleccionada en el canvas (para re-navegar
      tras cambiar de dispositivo). Para Detalles/Lugares/Vestimenta devuelve "key:<id>" de la card/
      ítem activo; para el resto, la propia key. null si no hay selección útil. */
  private activeSectionDataAttr(): string | null {
    const key = this.canvasState.selectedSection();
    if (!key || key === '_theme') return null;
    if (key === 'details') {
      const i = this.canvasState.selectedDetailIndex();
      const c = i >= 0 ? this.detailCards()[i] : null;
      return c ? 'details:' + c.id : null;
    }
    if (key === 'venues') {
      const i = this.canvasState.selectedVenueIndex();
      const v = i >= 0 ? this.venueItems()[i] : null;
      return v ? 'venues:' + v.id : null;
    }
    if (key === 'dresscode') {
      const i = this.canvasState.selectedDresscodeIndex();
      const d = i >= 0 ? this.dresscodeCards()[i] : null;
      return d ? 'dresscode:' + d.id : null;
    }
    return key;
  }

  /** Cambia el dispositivo del canvas (mobile/desktop) MANTENIENDO la sección/mini-sección en la que
      el usuario está editando: captura la sección activa antes de cambiar y re-navega a ella tras el
      re-render (el viewport cambia de tamaño y el scroll se perdía → saltaba a otra sección). */
  setPreviewDevice(device: 'mobile' | 'desktop') {
    if (this.previewDevice() === device) return;
    const target = this.activeSectionDataAttr();
    this.previewDevice.set(device);
    // --canvas-vh depende del dispositivo (mobile = alto del teléfono; desktop = alto del viewport).
    // Recalcularlo YA para que el relayout de las secciones use el valor correcto antes del scroll.
    requestAnimationFrame(() => this._applyCanvasHeight?.());
    if (!target) return;
    // El cambio de dispositivo recalcula el min-height de TODAS las secciones a la vez, así que la
    // posición en px de la sección objetivo cambia (y el desfase se acumula cuanto más abajo esté).
    // Para aterrizar EXACTO: esperar a que el relayout termine (doble rAF + un tick extra) y hacer el
    // scroll SIN animación (instantáneo y preciso) midiendo con las alturas ya finales. Se reintenta
    // un par de veces por si el relayout tarda más (imágenes/fuentes).
    // Un solo salto tras el relayout (doble rAF). Los reintentos solo RE-posicionan si el objetivo
    // se movió >2px (p.ej. si imágenes/fuentes tardaron en acomodar las alturas) → si el primer
    // salto ya acertó, no hay parpadeo. Se hace sin animación (instantáneo y preciso).
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this.scrollToSectionInstant(target);
      setTimeout(() => this.scrollToSectionInstant(target, 2), 150);
      setTimeout(() => this.scrollToSectionInstant(target, 2), 350);
    }));
  }

  /** Scroll INSTANTÁNEO (sin animación) a una sección por su data-section. Se usa al cambiar de
      dispositivo, donde el smooth + el relayout producían un aterrizaje impreciso. `threshold` evita
      re-scrollear si ya está en el punto (quita el parpadeo de los reintentos). */
  private scrollToSectionInstant(key: string, threshold = 0) {
    const el = document.querySelector(`.preview-section-click[data-section="${key}"]`);
    const container = document.querySelector('.builder-canvas-viewport');
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const offset = elRect.top - containerRect.top + container.scrollTop;
    // Si ya estamos prácticamente en el objetivo, no re-scrollear (evita el salto/parpadeo).
    if (Math.abs(container.scrollTop - offset) <= threshold) return;
    container.scrollTo({ top: offset, behavior: 'auto' });
  }

  private scrollToSection(key: string) {
    setTimeout(() => {
      const el = document.querySelector(`.preview-section-click[data-section="${key}"]`);
      // El scroll ahora ocurre en el viewport del mockup, no en el area.
      const container = document.querySelector('.builder-canvas-viewport');
      if (el && container) {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = elRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({ top: offset, behavior: 'smooth' });
      }
    }, 50);
  }

  async toggleCanvasMode() {
    if (this.canvasMode() === 'canvas') {
      // Switching to preview
      if (this.canvasState.isDirty()) {
        const result = await this.dialog.unsavedChanges(
          'Cambios sin guardar',
          'Tienes cambios pendientes. ¿Deseas guardar antes de previsualizar?',
          'Continuar'
        );
        if (result === 'cancel') return;
        if (result === 'save') {
          this.saving.set(true);
          const cfg = this.canvasState.getConfig();
          if (!cfg) { this.saving.set(false); return; }
          const s = this.sections();
          for (const sec of s) {
            if ((cfg as any)[sec.key] && typeof (cfg as any)[sec.key] === 'object') {
              (cfg as any)[sec.key].enabled = sec.enabled;
            }
          }
          this.api.saveConfig(this.eventId, cfg).subscribe({
            next: () => {
              this.saving.set(false);
              this.saveStatus.set('saved');
              this.canvasState.isDirty.set(false);
              setTimeout(() => this.saveStatus.set('idle'), 2500);
              this.canvasMode.set('preview');
              this.reloadPreview();
              this.canvasState.selectSection(null);
              this.currentSection.set(null);
            },
            error: () => { this.saving.set(false); }
          });
          return;
        }
        // result === 'discard' — show preview with BD data, keep canvas changes in memory
      }
      this.canvasMode.set('preview');
      this.reloadPreview();
      this.canvasState.selectSection(null);
      this.currentSection.set(null);
    } else {
      this.canvasMode.set('canvas');
      const envelopeEl = document.querySelector('.preview-mode-canvas .envelope-overlay');
      if (envelopeEl) {
        envelopeEl.classList.remove('opened');
      }
      // Al volver a modo canvas el viewport vuelve a ser visible: re-medir --canvas-vh
      // para que el hero/intro recuperen el alto de pantalla (antes quedaba colapsado).
      requestAnimationFrame(() => {
        this._applyCanvasHeight?.();
        requestAnimationFrame(() => this._applyCanvasHeight?.());
      });
    }
  }

  reloadPreview() {
    this.previewKey.set(Date.now());
  }

  selectTheme() {
    this.canvasState.selectSection('_theme');
    this.currentSection.set('_theme');
    this.showProps.set(true);
    this.panelVisible.set(false);
    this.showLeftPanel.set(false);
  }

  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'edit' ? 'preview' : 'edit');
  }

  getNavBarBg(): string {
    const theme = this.canvasState.config()?.theme;
    if (!theme) return 'rgba(13,17,23,0.85)';
    const c1 = theme.navBarBg1 || '#0d1117';
    const c2 = theme.navBarBg2 || '';
    const opacity = (theme.navBarOpacity ?? 85) / 100;
    const toRgba = (hex: string, a: number): string => {
      if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      return `rgba(${r},${g},${b},${a})`;
    };
    if (c2) return `linear-gradient(135deg, ${toRgba(c1, opacity)}, ${toRgba(c2, opacity)})`;
    return toRgba(c1, opacity);
  }

  getCanvasLandingBg(): string {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return '#0d1117';
    const theme = cfg.theme;
    const c1 = theme.landingBgColor1 || '#0d1117';
    const c2 = theme.landingBgColor2 || '#1a1a2e';
    const type = theme.landingBgType || 'solid';
    const angle = theme.landingBgAngle || 135;
    const intensity = theme.landingBgIntensity ?? 50;

    // Replicar EXACTAMENTE la lógica de la landing real (getLandingBg) para que el canvas
    // muestre el mismo degradado con intensidad.
    let colorBg = c1;
    switch (type) {
      case 'solid': colorBg = c1; break;
      case 'linear': colorBg = this.buildLinearGradient(angle, c1, c2, intensity); break;
      case 'radial': colorBg = `radial-gradient(ellipse at center, ${c1} ${intensity}%, ${c2})`; break;
      case 'mesh': colorBg = this.buildLinearGradient(angle, c1, c2, intensity); break;
      default: colorBg = c1;
    }

    // If there's a non-video background image, use color only (image rendered via absolute div)
    const bgGif = cfg.hero?.backgroundGif;
    // Image backgrounds are handled by the canvas-bg-media element, not CSS background
    return colorBg;
  }

  /** True si el dispositivo activo del canvas es escritorio (para resolver override desktop). */
  private isCanvasDesktop(): boolean {
    return this.previewDevice() !== 'mobile';
  }

  /** Fondo GLOBAL del canvas resuelto (theme.landingBg con fallback a hero.backgroundGif). */
  canvasGlobalBg(): ResolvedMedia {
    const cfg = this.canvasState.getConfig();
    const mb = resolveGlobalBackground(cfg?.theme?.landingBg, cfg?.hero?.backgroundGif);
    return resolveMedia(mb, this.isCanvasDesktop());
  }

  isCanvasBgVideo(): boolean {
    return this.canvasGlobalBg().isVideo;
  }

  /** Media resuelta del fondo de una sección en el canvas (nuevo modelo + fallback legacy). */
  canvasSectionMedia(sectionKey: string): ResolvedMedia {
    const ss = (this.canvasState.getConfig() as any)?.[sectionKey]?.sectionStyle as SectionStyle | undefined;
    return resolveMedia(sectionStyleToMedia(ss), this.isCanvasDesktop());
  }

  /** Degradado lineal de 2 colores con intensidad 0-100:
      0 = predomina color1, 100 = predomina color2, 50 = mitad. El punto de mezcla se
      desplaza con la intensidad usando un "color hint" central. */
  private buildLinearGradient(angle: number, c1: string, c2: string, intensity: number): string {
    const v = Math.max(0, Math.min(100, intensity ?? 50));
    // mid = posicion del punto medio del degradado. v=0 -> 100% (todo c1); v=100 -> 0% (todo c2).
    const mid = 100 - v;
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c1} ${Math.max(0, mid - 25)}%, ${c2} ${Math.min(100, mid + 25)}%, ${c2} 100%)`;
  }

  getSectionBgStyle(sectionKey: string): string {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return '';
    const ss = (cfg as any)[sectionKey]?.sectionStyle;
    if (!ss) return '';
    let css = '';
    if (ss.bgType && ss.bgType !== 'inherit') {
      switch (ss.bgType) {
        case 'solid': css = `background: ${ss.bgColor1 || '#1a1a2e'}`; break;
        case 'linear': css = `background: ${this.buildLinearGradient(ss.bgAngle ?? 180, ss.bgColor1 || '#1a1a2e', ss.bgColor2 || '#0d1117', ss.bgIntensity ?? 50)}`; break;
        case 'radial': css = `background: radial-gradient(ellipse at center, ${ss.bgColor1 || '#1a1a2e'} ${(ss.bgIntensity ?? 50)}%, ${ss.bgColor2 || '#0d1117'})`; break;
        case 'image': {
          const m = this.canvasSectionMedia(sectionKey);
          // Si no hay media o es VIDEO, no se pinta background (el <video> lo renderiza el
          // template del canvas via canvasSectionMedia). Para imagen/gif, se pinta.
          if (!m.hasMedia || m.isVideo) { css = ''; break; }
          // Oscurecido (overlay) replicado como capa de gradiente sobre la imagen, para que
          // el canvas se vea igual que la landing (que usa un div .section-bg-overlay).
          const ov = Math.max(0, Math.min(100, m.overlay)) / 100;
          const dark = ov > 0 ? `linear-gradient(rgba(0,0,0,${ov}), rgba(0,0,0,${ov})), ` : '';
          if (m.fit === 'banner') {
            const isMobile = this.previewDevice() === 'mobile';
            if (isMobile) {
              // Mobile (REGLA R3 del steering): la imagen se dimensiona por el ALTO (auto 100%) y su
              // ancho va a PROPORCIÓN, CENTRADA, SIN deformar. Verticales llenan; horizontales se ven
              // como banner con franjas laterales. Es responsivo al cambiar de dispositivo (el alto
              // sigue el marco y el ancho recalcula). Se pinta en el wrapper (que llena el marco).
              css = `background: ${dark}url(${m.url}) center / auto 100% no-repeat; min-height: var(--canvas-vh, 640px)`;
            } else {
              // Desktop: COLUMNA CENTRADA del ancho --sec-banner-w, imagen a auto 100% (ver R3). Se
              // emiten variables que consume la regla ::before de .preview-section-click; el slider
              // define el ANCHO de la franja. El overlay va en la capa ::after via --sec-ov.
              css = `--sec-bg-image: url(${m.url}); --sec-banner-w: ${m.bannerWidth}%; --sec-ov: ${ov}`;
            }
          } else {
            // Pantalla completa (fit explícito 'cover'): cover.
            css = `background: ${dark}url(${m.url}) ${m.position || 'center'}/cover no-repeat`;
          }
          break;
        }
      }
    }
    // Overrides de texto por sección (paridad con la landing getSectionBg). Se inyectan las
    // mismas variables CSS --section-* para que el canvas refleje el estilo de texto editado.
    // Las reglas ::ng-deep que las consumen están en los styles de este componente,
    // scopeadas a .preview-section-click[style*="--section-..."].
    // Si hay color2 (H2 bicolor), NO inyectar --section-h2-color: el componente pinta el gradiente
    // inline y la regla ::ng-deep con !important lo anularía (igual que en la landing).
    if (ss.sectionHeadingColor && !ss.sectionHeadingColor2) css += `; --section-h2-color: ${ss.sectionHeadingColor}`;
    if (ss.sectionHeadingFont) css += `; --section-h2-font: ${this.getCanvasFont(ss.sectionHeadingFont)}`;
    if (ss.sectionHeadingSize) css += `; --section-h2-size: ${ss.sectionHeadingSize}px`;
    if (ss.headingColor) css += `; --section-heading-color: ${ss.headingColor}`;
    if (ss.headingColor2) css += `; --section-heading-color2: ${ss.headingColor2}`;
    if (ss.headingGradientAngle) css += `; --section-heading-angle: ${ss.headingGradientAngle}deg`;
    if (ss.headingGradientIntensity != null) { const v = Math.max(0, Math.min(100, ss.headingGradientIntensity)); const mid = 100 - v; css += `; --section-heading-mid-a: ${Math.max(0, mid - 25)}%; --section-heading-mid-b: ${Math.min(100, mid + 25)}%`; }
    if (ss.headingFontWeight) css += `; --section-heading-weight: ${ss.headingFontWeight}`;
    if (ss.headingFontSize) css += `; --section-heading-size: ${ss.headingFontSize}px`;
    if (ss.headingFont) css += `; --section-heading-font: ${this.getCanvasFont(ss.headingFont)}`;
    if (ss.contentColor) css += `; --section-content-color: ${ss.contentColor}`;
    if (ss.contentFontSize) css += `; --section-content-size: ${ss.contentFontSize}px`;
    if (ss.contentFont) css += `; --section-content-font: ${this.getCanvasFont(ss.contentFont)}`;

    // Apply clip-path for section transitions — keep outline visible by using overflow visible
    if (ss.dividerType && ss.dividerType !== 'none') {
      const h = ss.dividerHeight || 50;
      const flip = ss.dividerFlip || false;
      const clipValue = this.getBuilderClipPath(ss.dividerType, h, flip);
      if (clipValue) {
        css += `; margin-top: -${h}px; clip-path: ${clipValue}; padding-top: ${h + 20}px`;
      }
    }
    return css;
  }

  /** Mapea la clave de fuente del tema a su variable CSS (paridad con landing.getThemeFont).
      Devuelve 'inherit' si no hay clave o no está mapeada. */
  private getCanvasFont(key?: string): string {
    if (!key) return 'inherit';
    const map: Record<string, string> = {
      'sans': 'var(--font-sans)', 'serif': 'var(--font-serif)', 'script': 'var(--font-script)',
      'cormorant': 'var(--font-cormorant)', 'spumoni': 'var(--font-spumoni)', 'dancing': 'var(--font-dancing)',
      'montserrat': 'var(--font-montserrat)', 'raleway': 'var(--font-raleway)', 'cinzel': 'var(--font-cinzel)',
      'sacramento': 'var(--font-sacramento)', 'tangerine': 'var(--font-tangerine)', 'alexbrush': 'var(--font-alexbrush)',
      'pinyon': 'var(--font-pinyon)', 'aura': 'var(--font-aura)', 'allura': 'var(--font-allura)', 'josefin': 'var(--font-josefin)', 'baskerville': 'var(--font-baskerville)'
    };
    return map[key] || 'inherit';
  }

  private getBuilderClipPath(type: string, h: number, flip: boolean): string {
    switch (type) {
      case 'slant':
        return flip ? `polygon(0% 0px, 100% ${h}px, 100% 100%, 0% 100%)` : `polygon(0% ${h}px, 100% 0px, 100% 100%, 0% 100%)`;
      case 'arrow':
        return flip ? `polygon(0% 0px, 50% ${h}px, 100% 0px, 100% 100%, 0% 100%)` : `polygon(0% ${h}px, 50% 0px, 100% ${h}px, 100% 100%, 0% 100%)`;
      case 'zigzag': {
        const pts: string[] = [];
        for (let i = 0; i <= 12; i++) {
          const x = (i / 12) * 100;
          const y = i % 2 === 0 ? (flip ? 0 : h) : (flip ? h : 0);
          pts.push(`${x.toFixed(1)}% ${y}px`);
        }
        pts.push('100% 100%', '0% 100%');
        return `polygon(${pts.join(', ')})`;
      }
      case 'mountains': {
        const mPts = [[0,1],[12.5,0.3],[25,0.7],[42,0],[58,0.6],[75,0.2],[87.5,0.5],[100,0.15]];
        const pts = mPts.map(([x, ratio]) => `${x}% ${(flip ? h*(1-ratio) : h*ratio).toFixed(1)}px`);
        pts.push('100% 100%', '0% 100%');
        return `polygon(${pts.join(', ')})`;
      }
      case 'wave': {
        const pts: string[] = [];
        for (let i = 0; i <= 40; i++) { const x = (i/40)*100; let y = (Math.sin((i/40)*Math.PI*2)+1)/2*h; if(flip) y=h-y; pts.push(`${x.toFixed(1)}% ${y.toFixed(1)}px`); }
        return `polygon(${pts.join(', ')}, 100% 100%, 0% 100%)`;
      }
      case 'curve': {
        const pts: string[] = [];
        for (let i = 0; i <= 30; i++) { const x = (i/30)*100; let y = (Math.cos((i/30)*Math.PI)*0.5+0.5)*h; if(flip) y=h-y; pts.push(`${x.toFixed(1)}% ${y.toFixed(1)}px`); }
        return `polygon(${pts.join(', ')}, 100% 100%, 0% 100%)`;
      }
      case 'drops': {
        const pts: string[] = [];
        for (let i = 0; i <= 60; i++) { const x = (i/60)*100; let y = (Math.cos((i/60)*6*Math.PI*2)+1)/2*h; if(flip) y=h-y; pts.push(`${x.toFixed(1)}% ${y.toFixed(1)}px`); }
        return `polygon(${pts.join(', ')}, 100% 100%, 0% 100%)`;
      }
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

  /** Persiste las posiciones del template Plano tras arrastrar un elemento. */
  onEnvelopePositionsChange(positions: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    (cfg.envelope as any).plainPositions = positions;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  /** Persiste las posiciones de la carátula (hero) tras arrastrar un elemento. */
  onHeroPositionsChange(positions: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    (cfg.hero as any).positions = positions;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  /** Persiste las posiciones de la intro tras arrastrar la frase. */
  onIntroPositionsChange(positions: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    (cfg.intro as any).positions = positions;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  /** Persiste las posiciones de la sección Regalos (encabezado + cards) tras arrastrar. */
  onGiftsPositionsChange(positions: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    (cfg.gifts as any).positions = positions;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  /** Persiste las posiciones de la invitación tras arrastrar un objeto. */
  onInvitationPositionsChange(positions: any) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    (cfg.invitation as any).positions = positions;
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  /** Persiste las posiciones de UNA card de Detalles (drag) en esa card. */
  onDetailPositionsChange(ev: { cardId: string; positions: any }) {
    const cfg = this.canvasState.getConfig();
    if (!cfg) return;
    const card = (cfg as any).details?.cards?.find((c: any) => c.id === ev.cardId);
    if (!card) return;
    card.positions = ev.positions;
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  /** Secciones permanentes que no se pueden ocultar (siempre visibles en la invitación). */
  isPermanentSection(key: string): boolean {
    return key === 'hero' || key === 'invitation';
  }

  toggleSection(key: string) {
    // La Carátula (y la Invitación) son secciones principales: no se pueden ocultar.
    if (this.isPermanentSection(key)) return;
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

  // ===== DETALLES como mini-secciones (sub-entradas del menú) =====

  /** Estado de colapso de los grupos del menú (Detalles/Lugares). Independientes: expandir/colapsar
      uno NO afecta al otro. Ambos arrancan EXPANDIDOS. */
  groupExpanded = signal<{ details: boolean; venues: boolean; dresscode: boolean }>({ details: true, venues: true, dresscode: true });

  /** Alterna el colapso de un grupo del menú sin tocar el otro. */
  toggleGroup(key: 'details' | 'venues' | 'dresscode') {
    this.groupExpanded.update((g) => ({ ...g, [key]: !g[key] }));
  }

  /** Cards de Detalles para el menú (sub-entradas "Detalle N"). */
  detailCards(): any[] {
    return (this.canvasState.config() as any)?.details?.cards || [];
  }

  /** Selecciona una card de Detalles (la marca activa y abre sus propiedades). */
  selectDetail(index: number) {
    if (this.canvasMode() === 'preview') return;
    this.canvasState.selectSection('details');
    this.canvasState.selectedDetailIndex.set(index);
    this.currentSection.set('details');
    if (!this.isMobileView()) this.showProps.set(true);
    if (!this.isWide()) { this.panelVisible.set(false); this.showLeftPanel.set(false); }
    // Desplazar el canvas a esa mini-sección (data-section="details:<id>").
    const card = this.detailCards()[index];
    if (card) this.scrollToSection('details:' + card.id);
  }

  /** Agrega una nueva card de Detalles y la selecciona. */
  addDetail() {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const d = (cfg as any).details;
    if (!d.cards) d.cards = [];
    d.cards.push({
      id: 'c-' + Date.now(),
      iconType: 'none', icon: '', iconUrl: '',
      title: '', content: '', textAlign: 'center',
    });
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
    this.selectDetail(d.cards.length - 1);
  }

  /** Elimina una card de Detalles, con confirmación. */
  async removeDetail(index: number) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const d = (cfg as any).details;
    const card = d?.cards?.[index];
    if (!card) return;
    const name = card.label || ('Detalle ' + (index + 1));
    const ok = await this.dialog.confirm(
      'Eliminar detalle',
      `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
      'Eliminar'
    );
    if (!ok) return;
    d.cards.splice(index, 1);
    // Ajustar la selección actual.
    const sel = this.canvasState.selectedDetailIndex();
    if (sel === index) this.canvasState.selectedDetailIndex.set(-1);
    else if (sel > index) this.canvasState.selectedDetailIndex.set(sel - 1);
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
  }

  /** Reordena las cards de Detalles (drag dentro del grupo). */
  onDetailDrop(event: CdkDragDrop<any[]>) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const cards = (cfg as any).details?.cards; if (!cards) return;
    moveItemInArray(cards, event.previousIndex, event.currentIndex);
    // Mantener seleccionada la misma card tras el reordenamiento.
    const sel = this.canvasState.selectedDetailIndex();
    if (sel === event.previousIndex) this.canvasState.selectedDetailIndex.set(event.currentIndex);
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  // ===== LUGARES como mini-secciones (espejo de Detalles) =====

  venueItems(): any[] { return (this.canvasState.config() as any)?.venues?.items || []; }

  selectVenue(index: number) {
    if (this.canvasMode() === 'preview') return;
    this.canvasState.selectSection('venues');
    this.canvasState.selectedVenueIndex.set(index);
    this.currentSection.set('venues');
    if (!this.isMobileView()) this.showProps.set(true);
    if (!this.isWide()) { this.panelVisible.set(false); this.showLeftPanel.set(false); }
    const v = this.venueItems()[index];
    if (v) this.scrollToSection('venues:' + v.id);
  }

  addVenueMini() {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const vz = (cfg as any).venues;
    if (!vz.items) vz.items = [];
    vz.items.push({
      id: 'v-' + Date.now(), title: '', icon: '', iconType: 'none', iconEmoji: '',
      name: '', address: '', time: '', mapsUrl: '',
    });
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
    this.selectVenue(vz.items.length - 1);
  }

  async removeVenueMini(index: number) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const vz = (cfg as any).venues;
    const v = vz?.items?.[index];
    if (!v) return;
    const name = v.label || ('Lugar ' + (index + 1));
    const ok = await this.dialog.confirm('Eliminar lugar', `¿Eliminar "${name}"? Esta acción no se puede deshacer.`, 'Eliminar');
    if (!ok) return;
    vz.items.splice(index, 1);
    const sel = this.canvasState.selectedVenueIndex();
    if (sel === index) this.canvasState.selectedVenueIndex.set(-1);
    else if (sel > index) this.canvasState.selectedVenueIndex.set(sel - 1);
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
  }

  onVenueDrop(event: CdkDragDrop<any[]>) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const items = (cfg as any).venues?.items; if (!items) return;
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    const sel = this.canvasState.selectedVenueIndex();
    if (sel === event.previousIndex) this.canvasState.selectedVenueIndex.set(event.currentIndex);
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  /** Persiste las posiciones (drag) de UN venue en ese venue. */
  onVenuePositionsChange(ev: { venueId: string; positions: any }) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const v = (cfg as any).venues?.items?.find((x: any) => x.id === ev.venueId);
    if (!v) return;
    v.positions = ev.positions;
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  // ===== VESTIMENTA como mini-secciones (espejo de Detalles/Lugares) =====

  dresscodeCards(): any[] { return (this.canvasState.config() as any)?.dresscode?.cards || []; }

  selectDresscode(index: number) {
    if (this.canvasMode() === 'preview') return;
    this.canvasState.selectSection('dresscode');
    this.canvasState.selectedDresscodeIndex.set(index);
    this.currentSection.set('dresscode');
    if (!this.isMobileView()) this.showProps.set(true);
    if (!this.isWide()) { this.panelVisible.set(false); this.showLeftPanel.set(false); }
    const d = this.dresscodeCards()[index];
    if (d) this.scrollToSection('dresscode:' + d.id);
  }

  addDresscodeMini() {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const dz = (cfg as any).dresscode;
    if (!dz.cards) dz.cards = [];
    dz.cards.push({ id: 'd-' + Date.now(), title: '', description: '', images: [] });
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
    this.selectDresscode(dz.cards.length - 1);
  }

  async removeDresscodeMini(index: number) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const dz = (cfg as any).dresscode;
    const d = dz?.cards?.[index];
    if (!d) return;
    const name = d.label || ('Vestimenta ' + (index + 1));
    const ok = await this.dialog.confirm('Eliminar vestimenta', `¿Eliminar "${name}"? Esta acción no se puede deshacer.`, 'Eliminar');
    if (!ok) return;
    dz.cards.splice(index, 1);
    const sel = this.canvasState.selectedDresscodeIndex();
    if (sel === index) this.canvasState.selectedDresscodeIndex.set(-1);
    else if (sel > index) this.canvasState.selectedDresscodeIndex.set(sel - 1);
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
  }

  onDresscodeDrop(event: CdkDragDrop<any[]>) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const cards = (cfg as any).dresscode?.cards; if (!cards) return;
    moveItemInArray(cards, event.previousIndex, event.currentIndex);
    const sel = this.canvasState.selectedDresscodeIndex();
    if (sel === event.previousIndex) this.canvasState.selectedDresscodeIndex.set(event.currentIndex);
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  /** Persiste las posiciones (drag) de UNA card de vestimenta en esa card. */
  onDresscodePositionsChange(ev: { cardId: string; positions: any }) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const c = (cfg as any).dresscode?.cards?.find((x: any) => x.id === ev.cardId);
    if (!c) return;
    c.positions = ev.positions;
    this.canvasState.notifyChange();
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
  cachedPhotos: any[] = [];
  galleryPreviewIndex = signal(0);
  private galleryPreviewTimer: any;

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
    this.api.getPhotos(this.eventId).subscribe(p => { this.photos.set(p); this.cachedPhotos = p; this.startGalleryPreview(); });
  }

  private startGalleryPreview() {
    clearInterval(this.galleryPreviewTimer);
    if (this.cachedPhotos.length > 1) {
      this.galleryPreviewTimer = setInterval(() => {
        this.galleryPreviewIndex.set((this.galleryPreviewIndex() + 1) % Math.min(this.cachedPhotos.length, 5));
      }, 2500);
    }
  }

  private loadGuests() {
    this.api.getGuests(this.eventId).subscribe(g => this.guests.set(g));
  }

  selectPreviewGuest(code: string) {
    this.previewGuestCode.set(code);
    this.previewKey.update(k => k + 1);
  }

  getPreviewGuestOptions(): SelectOption[] {
    const opts: SelectOption[] = [{ value: '', label: 'Vista genérica', icon: '👁' }];
    for (const g of this.guests()) {
      opts.push({ value: g.unique_code, label: g.family_name || g.guest_names, icon: '👤' });
    }
    return opts;
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
    // Auto-save disabled — save is manual only (button or before preview)
  }
}

