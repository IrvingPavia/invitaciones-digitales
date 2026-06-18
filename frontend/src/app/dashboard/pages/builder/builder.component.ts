import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '../../../core/services/api.service';
import { ColorPickerComponent } from '../../../core/components/color-picker.component';
import { EventConfig, ItineraryItem, Photo, Event as VitelyEvent } from '../../../core/models/models';
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
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, ColorPickerComponent,
    LandingHeroComponent, LandingInvitationComponent, LandingDetailsComponent,
    LandingVenuesComponent, LandingItineraryComponent, LandingGalleryComponent,
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
        <button class="builder-mobile-toggle" (click)="showLeftPanel.set(!showLeftPanel())">
          <span class="material-icons">view_list</span>
        </button>
        <button class="builder-mobile-toggle" (click)="showRightPanel.set(!showRightPanel())">
          <span class="material-icons">tune</span>
        </button>
        <button class="builder-save-btn" (click)="save()" [disabled]="saving()">
          <span class="material-icons">{{ saveStatus() === 'saved' ? 'check_circle' : 'save' }}</span>
          <span class="builder-save-text">{{ saving() ? 'Guardando...' : saveStatus() === 'saved' ? 'Guardado' : 'Guardar' }}</span>
        </button>
      </div>
    </div>

    <div class="builder-layout">
      <!-- Left Panel: Components -->
      <aside class="builder-panel builder-panel-left" [class.mobile-open]="showLeftPanel()">
        <div class="builder-panel-header">
          <span class="material-icons">widgets</span>
          <span>Secciones</span>
        </div>
        <!-- Theme button -->
        <div class="builder-theme-btn" [class.active]="selectedSection() === '_theme'" (click)="selectSection('_theme')">
          <span class="material-icons">palette</span>
          <span>Tema Global</span>
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

      <!-- Center: Canvas Preview -->
      <div class="builder-preview">
        <div class="builder-canvas-frame" [class.mobile]="previewDevice() === 'mobile'" [class.tablet]="previewDevice() === 'tablet'" [class.desktop]="previewDevice() === 'desktop'">
          <div class="builder-canvas" [style.--theme-card-bg]="config()?.theme?.cardBg || 'rgba(255,255,255,0.05)'" [style.--theme-card-border]="config()?.theme?.cardBorder || 'rgba(212,160,23,0.3)'" [style.--theme-text-primary]="config()?.theme?.textPrimary || '#ffffff'" [style.--theme-text-secondary]="config()?.theme?.textSecondary || 'rgba(255,255,255,0.7)'" [style.--theme-nav-text]="config()?.theme?.navFooterText || '#d4a017'" [style.--theme-btn-bg]="config()?.theme?.buttonBg || '#d4a017'" [style.--theme-btn-text]="config()?.theme?.buttonText || '#1a1a2e'" [style.background]="getCanvasBg()">
            @if (config()) {
              <!-- Hero section -->
              <div class="canvas-section" [class.selected]="selectedSection() === 'hero'" [class.ghost]="false" (click)="selectSection('hero'); $event.stopPropagation()">
                <div class="canvas-section-label">Carátula</div>
                <app-landing-hero [config]="config()!.hero" [event]="eventData()" [enabledSections]="getCanvasEnabledSections()" />
              </div>

              <!-- Invitation section -->
              <div class="canvas-section" [class.selected]="selectedSection() === 'invitation'" [class.ghost]="false" (click)="selectSection('invitation'); $event.stopPropagation()">
                <div class="canvas-section-label">Invitación</div>
                <app-landing-invitation [config]="config()!.invitation" [guest]="null" [styles]="config()!.globalStyles" />
              </div>

              <!-- Details section -->
              <div class="canvas-section" [class.selected]="selectedSection() === 'details'" [class.ghost]="!isSectionEnabled('details')" (click)="selectSection('details'); $event.stopPropagation()">
                <div class="canvas-section-label">Detalles</div>
                @if (isSectionEnabled('details') && config()!.details.cards.length > 0) {
                  <app-landing-details [config]="config()!.details" [styles]="config()!.globalStyles" />
                } @else {
                  <div class="canvas-empty-section">
                    <span class="material-icons">info</span>
                    <p>Sección vacía — agrega cards desde el panel</p>
                  </div>
                }
              </div>

              <!-- Venues section -->
              <div class="canvas-section" [class.selected]="selectedSection() === 'venues'" [class.ghost]="!isSectionEnabled('venues')" (click)="selectSection('venues'); $event.stopPropagation()">
                <div class="canvas-section-label">Lugares</div>
                @if (isSectionEnabled('venues') && config()!.venues.items.length > 0) {
                  <app-landing-venues [config]="config()!.venues" [styles]="config()!.globalStyles" />
                } @else {
                  <div class="canvas-empty-section">
                    <span class="material-icons">place</span>
                    <p>Sin lugares — agrega desde el panel</p>
                  </div>
                }
              </div>

              <!-- Itinerary section -->
              <div class="canvas-section" [class.selected]="selectedSection() === 'itinerary'" [class.ghost]="!isSectionEnabled('itinerary')" (click)="selectSection('itinerary'); $event.stopPropagation()">
                <div class="canvas-section-label">Itinerario</div>
                @if (isSectionEnabled('itinerary')) {
                  <app-landing-itinerary [config]="config()!.itinerary" [items]="itineraryItems()" [styles]="config()!.globalStyles" />
                } @else {
                  <div class="canvas-empty-section">
                    <span class="material-icons">schedule</span>
                    <p>Sección deshabilitada</p>
                  </div>
                }
              </div>

              <!-- Gallery section -->
              <div class="canvas-section" [class.selected]="selectedSection() === 'gallery'" [class.ghost]="!isSectionEnabled('gallery')" (click)="selectSection('gallery'); $event.stopPropagation()">
                <div class="canvas-section-label">Galería</div>
                @if (isSectionEnabled('gallery')) {
                  <app-landing-gallery [config]="config()!.gallery" [photos]="photos()" [styles]="config()!.globalStyles" />
                } @else {
                  <div class="canvas-empty-section">
                    <span class="material-icons">photo_library</span>
                    <p>Sección deshabilitada</p>
                  </div>
                }
              </div>

              <!-- Dresscode section -->
              <div class="canvas-section" [class.selected]="selectedSection() === 'dresscode'" [class.ghost]="!isSectionEnabled('dresscode')" (click)="selectSection('dresscode'); $event.stopPropagation()">
                <div class="canvas-section-label">Vestimenta</div>
                @if (isSectionEnabled('dresscode')) {
                  <app-landing-dresscode [config]="config()!.dresscode" [styles]="config()!.globalStyles" />
                } @else {
                  <div class="canvas-empty-section">
                    <span class="material-icons">checkroom</span>
                    <p>Sección deshabilitada</p>
                  </div>
                }
              </div>

              <!-- Gifts section -->
              <div class="canvas-section" [class.selected]="selectedSection() === 'gifts'" [class.ghost]="!isSectionEnabled('gifts')" (click)="selectSection('gifts'); $event.stopPropagation()">
                <div class="canvas-section-label">Regalos</div>
                @if (isSectionEnabled('gifts')) {
                  <app-landing-gifts [config]="config()!.gifts" [styles]="config()!.globalStyles" />
                } @else {
                  <div class="canvas-empty-section">
                    <span class="material-icons">redeem</span>
                    <p>Sección deshabilitada</p>
                  </div>
                }
              </div>

              <!-- RSVP section -->
              <div class="canvas-section" [class.selected]="selectedSection() === 'rsvp'" [class.ghost]="!isSectionEnabled('rsvp')" (click)="selectSection('rsvp'); $event.stopPropagation()">
                <div class="canvas-section-label">Confirmación</div>
                @if (isSectionEnabled('rsvp')) {
                  <div class="canvas-empty-section">
                    <span class="material-icons">how_to_reg</span>
                    <p>Formulario de confirmación</p>
                  </div>
                } @else {
                  <div class="canvas-empty-section">
                    <span class="material-icons">how_to_reg</span>
                    <p>Sección deshabilitada</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Right Panel: Properties -->
      <aside class="builder-panel builder-panel-right" [class.mobile-open]="showRightPanel()">
        <div class="builder-panel-header">
          <span class="material-icons">tune</span>
          <span>Propiedades</span>
        </div>
        @if (selectedSection() && config()) {
          <div class="builder-props">
            <!-- Theme global panel -->
            @if (selectedSection() === '_theme') {
              <div class="builder-section-badge">
                <span class="material-icons">palette</span>
                <span>Tema Global</span>
              </div>
              <div class="builder-prop-category">Colores principales</div>
              <div class="builder-prop-group">
                <label class="builder-prop-label">Texto primario</label>
                <app-color-picker [value]="config()!.theme.textPrimary || '#ffffff'" (valueChange)="updateThemeProp('textPrimary', $event)"></app-color-picker>
              </div>
              <div class="builder-prop-group">
                <label class="builder-prop-label">Texto secundario</label>
                <app-color-picker [value]="config()!.theme.textSecondary || 'rgba(255,255,255,0.7)'" (valueChange)="updateThemeProp('textSecondary', $event)"></app-color-picker>
              </div>
              <div class="builder-prop-group">
                <label class="builder-prop-label">Acento (nav/footer)</label>
                <app-color-picker [value]="config()!.theme.navFooterText || '#d4a017'" (valueChange)="updateThemeProp('navFooterText', $event)"></app-color-picker>
              </div>
              <div class="builder-prop-group">
                <label class="builder-prop-label">Botones (fondo)</label>
                <app-color-picker [value]="config()!.theme.buttonBg || '#d4a017'" (valueChange)="updateThemeProp('buttonBg', $event)"></app-color-picker>
              </div>
              <div class="builder-prop-group">
                <label class="builder-prop-label">Botones (texto)</label>
                <app-color-picker [value]="config()!.theme.buttonText || '#1a1a2e'" (valueChange)="updateThemeProp('buttonText', $event)"></app-color-picker>
              </div>
              <div class="builder-prop-group">
                <label class="builder-prop-label">Fondo cards</label>
                <app-color-picker [value]="config()!.theme.cardBg || 'rgba(255,255,255,0.05)'" (valueChange)="updateThemeProp('cardBg', $event)"></app-color-picker>
              </div>
              <div class="builder-prop-group">
                <label class="builder-prop-label">Borde cards</label>
                <app-color-picker [value]="config()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="updateThemeProp('cardBorder', $event)"></app-color-picker>
              </div>
              <div class="builder-prop-divider"></div>
              <div class="builder-prop-category">Fondo de la landing</div>
              <div class="builder-prop-group">
                <label class="builder-prop-label">Color principal</label>
                <app-color-picker [value]="config()!.theme.landingBgColor1 || '#0d1117'" (valueChange)="updateThemeProp('landingBgColor1', $event)"></app-color-picker>
              </div>
              <div class="builder-prop-group">
                <label class="builder-prop-label">Color secundario</label>
                <app-color-picker [value]="config()!.theme.landingBgColor2 || '#1a1a2e'" (valueChange)="updateThemeProp('landingBgColor2', $event)"></app-color-picker>
              </div>
              <div class="builder-prop-group">
                <label class="builder-prop-label">Tipo de fondo</label>
                <div class="builder-btn-row">
                  <button class="builder-btn-chip" [class.active]="config()!.theme.landingBgType === 'solid' || !config()!.theme.landingBgType" (click)="updateThemeProp('landingBgType', 'solid')">Sólido</button>
                  <button class="builder-btn-chip" [class.active]="config()!.theme.landingBgType === 'linear'" (click)="updateThemeProp('landingBgType', 'linear')">Lineal</button>
                  <button class="builder-btn-chip" [class.active]="config()!.theme.landingBgType === 'radial'" (click)="updateThemeProp('landingBgType', 'radial')">Radial</button>
                </div>
              </div>
              <div class="builder-prop-divider"></div>
              <div class="builder-prop-category">Animación de secciones</div>
              <div class="builder-prop-group">
                <div class="builder-btn-row">
                  <button class="builder-btn-chip" [class.active]="config()!.theme.scrollAnimation === 'fade-up' || !config()!.theme.scrollAnimation" (click)="updateThemeProp('scrollAnimation', 'fade-up')">Fade Up</button>
                  <button class="builder-btn-chip" [class.active]="config()!.theme.scrollAnimation === 'fade-in'" (click)="updateThemeProp('scrollAnimation', 'fade-in')">Fade In</button>
                  <button class="builder-btn-chip" [class.active]="config()!.theme.scrollAnimation === 'scale'" (click)="updateThemeProp('scrollAnimation', 'scale')">Scale</button>
                  <button class="builder-btn-chip" [class.active]="config()!.theme.scrollAnimation === 'none'" (click)="updateThemeProp('scrollAnimation', 'none')">Ninguna</button>
                </div>
              </div>
              <div class="builder-prop-divider"></div>
              <a [routerLink]="['/dashboard/config', eventId]" class="builder-advanced-link">
                <span class="material-icons">settings</span>
                Configuración avanzada
              </a>
            } @else {
            <!-- Section name badge -->
            <div class="builder-section-badge">
              <span class="material-icons">{{ getSelectedIcon() }}</span>
              <span>{{ getSelectedLabel() }}</span>
            </div>

            @if (getSelectedConfig(); as secCfg) {
              <!-- ===== HERO section ===== -->
              @if (selectedSection() === 'hero') {
                <div class="builder-prop-category">Carátula</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Nombres de celebrantes</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.celebrantNames" (ngModelChange)="updateConfigProp('hero', 'celebrantNames', $event)">
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Frase del hero</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.heroPhrase" (ngModelChange)="updateConfigProp('hero', 'heroPhrase', $event)">
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Descripción del evento</label>
                  <textarea class="builder-input builder-textarea" [ngModel]="secCfg.eventDescription" (ngModelChange)="updateConfigProp('hero', 'eventDescription', $event)"></textarea>
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Fecha del countdown</label>
                  <input type="datetime-local" class="builder-input" [ngModel]="secCfg.countdownDate" (ngModelChange)="updateConfigProp('hero', 'countdownDate', $event)">
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Fondo (imagen/video/GIF)</label>
                  <div class="builder-upload-row">
                    @if (secCfg.backgroundGif) {
                      <span class="builder-upload-ok">✔ Archivo cargado</span>
                      <button class="builder-btn-small danger" (click)="updateConfigProp('hero', 'backgroundGif', '')">Quitar</button>
                    } @else {
                      <button class="builder-btn-small" (click)="uploadFor('hero', 'backgroundGif', 'gifs')">Subir archivo</button>
                    }
                  </div>
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Audio de fondo</label>
                  <div class="builder-upload-row">
                    @if (secCfg.audioUrl) {
                      <span class="builder-upload-ok">✔ Audio cargado</span>
                      <button class="builder-btn-small danger" (click)="updateConfigProp('hero', 'audioUrl', '')">Quitar</button>
                    } @else {
                      <button class="builder-btn-small" (click)="uploadFor('hero', 'audioUrl', 'audio')">Subir audio</button>
                    }
                  </div>
                </div>
              }

              <!-- ===== INVITATION section ===== -->
              @if (selectedSection() === 'invitation') {
                <div class="builder-prop-category">Contenido</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Título</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.title" (ngModelChange)="updateConfigProp('invitation', 'title', $event)">
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Subtítulo</label>
                  <textarea class="builder-input builder-textarea" [ngModel]="secCfg.subtitle" (ngModelChange)="updateConfigProp('invitation', 'subtitle', $event)"></textarea>
                </div>
              }

              <!-- ===== DETAILS section ===== -->
              @if (selectedSection() === 'details') {
                <div class="builder-prop-category">Contenido</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Título de sección</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.title" (ngModelChange)="updateConfigProp('details', 'title', $event)">
                </div>
                <div class="builder-prop-category-row">
                  <span>Cards ({{ secCfg.cards?.length || 0 }})</span>
                  <button class="builder-btn-small" (click)="addDetailCard()">+ Agregar</button>
                </div>
                @for (card of secCfg.cards; track card.id; let i = $index) {
                  <div class="builder-card-item">
                    <div class="builder-card-header">
                      <span class="builder-card-num">{{ i + 1 }}</span>
                      <button class="builder-btn-icon danger" (click)="removeDetailCard(i)" title="Eliminar card">
                        <span class="material-icons">close</span>
                      </button>
                    </div>
                    <input type="text" class="builder-input" [ngModel]="card.title" (ngModelChange)="updateCardProp('details', i, 'title', $event)" placeholder="Título">
                    <textarea class="builder-input builder-textarea-sm" [ngModel]="card.content" (ngModelChange)="updateCardProp('details', i, 'content', $event)" placeholder="Contenido"></textarea>
                  </div>
                }
              }

              <!-- ===== VENUES section ===== -->
              @if (selectedSection() === 'venues') {
                <div class="builder-prop-category-row">
                  <span>Lugares ({{ secCfg.items?.length || 0 }})</span>
                  <button class="builder-btn-small" (click)="addVenue()">+ Agregar</button>
                </div>
                @for (item of secCfg.items; track item.id; let i = $index) {
                  <div class="builder-card-item">
                    <div class="builder-card-header">
                      <span class="builder-card-num">{{ i + 1 }}</span>
                      <button class="builder-btn-icon danger" (click)="removeVenue(i)" title="Eliminar lugar">
                        <span class="material-icons">close</span>
                      </button>
                    </div>
                    <input type="text" class="builder-input" [ngModel]="item.name" (ngModelChange)="updateVenueProp(i, 'name', $event)" placeholder="Nombre del lugar">
                    <input type="text" class="builder-input" [ngModel]="item.address" (ngModelChange)="updateVenueProp(i, 'address', $event)" placeholder="Dirección">
                    <input type="text" class="builder-input" [ngModel]="item.time" (ngModelChange)="updateVenueProp(i, 'time', $event)" placeholder="Hora">
                    <input type="text" class="builder-input" [ngModel]="item.mapsUrl" (ngModelChange)="updateVenueProp(i, 'mapsUrl', $event)" placeholder="Link de Google Maps">
                  </div>
                }
              }

              <!-- ===== ITINERARY section ===== -->
              @if (selectedSection() === 'itinerary') {
                <div class="builder-prop-category">Contenido</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Título</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.title" (ngModelChange)="updateConfigProp('itinerary', 'title', $event)">
                </div>
              }

              <!-- ===== GALLERY section ===== -->
              @if (selectedSection() === 'gallery') {
                <div class="builder-prop-category">Contenido</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Título</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.title" (ngModelChange)="updateConfigProp('gallery', 'title', $event)">
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Estilo de galería</label>
                  <select class="builder-input builder-select" [ngModel]="secCfg.displayStyle || 'carousel-3d'" (ngModelChange)="updateConfigProp('gallery', 'displayStyle', $event)">
                    <option value="carousel-3d">Carrusel 3D</option>
                    <option value="carousel-vertical">Carrusel Vertical</option>
                    <option value="coverflow">Coverflow</option>
                    <option value="stack">Stack/Abanico</option>
                    <option value="flip">Flip/Album</option>
                    <option value="polaroid">Polaroid</option>
                    <option value="grid">Mosaico</option>
                    <option value="slideshow">Slideshow</option>
                  </select>
                </div>
              }

              <!-- ===== DRESSCODE section ===== -->
              @if (selectedSection() === 'dresscode') {
                <div class="builder-prop-category">Contenido</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Título</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.title" (ngModelChange)="updateConfigProp('dresscode', 'title', $event)">
                </div>
                <div class="builder-prop-category-row">
                  <span>Cards ({{ secCfg.cards?.length || 0 }})</span>
                  <button class="builder-btn-small" (click)="addDresscodeCard()">+ Agregar</button>
                </div>
                @for (card of secCfg.cards; track card.id; let i = $index) {
                  <div class="builder-card-item">
                    <div class="builder-card-header">
                      <span class="builder-card-num">{{ i + 1 }}</span>
                      <button class="builder-btn-icon danger" (click)="removeDresscodeCard(i)" title="Eliminar card">
                        <span class="material-icons">close</span>
                      </button>
                    </div>
                    <input type="text" class="builder-input" [ngModel]="card.title" (ngModelChange)="updateDresscodeCard(i, 'title', $event)" placeholder="Título">
                    <textarea class="builder-input builder-textarea-sm" [ngModel]="card.description" (ngModelChange)="updateDresscodeCard(i, 'description', $event)" placeholder="Descripción"></textarea>
                  </div>
                }
              }

              <!-- ===== GIFTS section ===== -->
              @if (selectedSection() === 'gifts') {
                <div class="builder-prop-category">Mesa de regalos</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Título</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.title" (ngModelChange)="updateConfigProp('gifts', 'title', $event)">
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Descripción</label>
                  <textarea class="builder-input builder-textarea-sm" [ngModel]="secCfg.description" (ngModelChange)="updateConfigProp('gifts', 'description', $event)"></textarea>
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Link de mesa de regalos</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.link" (ngModelChange)="updateConfigProp('gifts', 'link', $event)" placeholder="https://...">
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Texto del botón</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.buttonText" (ngModelChange)="updateConfigProp('gifts', 'buttonText', $event)">
                </div>
              }

              <!-- ===== RSVP section ===== -->
              @if (selectedSection() === 'rsvp') {
                <div class="builder-prop-category">Confirmación</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Título</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.title" (ngModelChange)="updateConfigProp('rsvp', 'title', $event)">
                </div>
              }

              <!-- ===== ENVELOPE section ===== -->
              @if (selectedSection() === 'envelope') {
                <div class="builder-prop-category">Pantalla de Inicio</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Texto de instrucción</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.instructionText" (ngModelChange)="updateConfigProp('envelope', 'instructionText', $event)">
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Texto del sello</label>
                  <input type="text" class="builder-input" [ngModel]="secCfg.sealText" (ngModelChange)="updateConfigProp('envelope', 'sealText', $event)">
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Color del sobre</label>
                  <app-color-picker [value]="secCfg.envelopeColor || '#1a1a2e'" (valueChange)="updateConfigProp('envelope', 'envelopeColor', $event)"></app-color-picker>
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Color del sello</label>
                  <app-color-picker [value]="secCfg.sealColor || '#8b0000'" (valueChange)="updateConfigProp('envelope', 'sealColor', $event)"></app-color-picker>
                </div>
              }

              <!-- ===== INTRO section ===== -->
              @if (selectedSection() === 'intro') {
                <div class="builder-prop-category">Intro</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Frase</label>
                  <textarea class="builder-input builder-textarea" [ngModel]="secCfg.phrase" (ngModelChange)="updateConfigProp('intro', 'phrase', $event)"></textarea>
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Duración (segundos)</label>
                  <input type="number" class="builder-input" [ngModel]="secCfg.duration" (ngModelChange)="updateConfigProp('intro', 'duration', +$event)" min="1" max="15">
                </div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Fondo (imagen/video)</label>
                  <div class="builder-upload-row">
                    @if (secCfg.background) {
                      <span class="builder-upload-ok">✔ Archivo cargado</span>
                      <button class="builder-btn-small danger" (click)="updateConfigProp('intro', 'background', '')">Quitar</button>
                    } @else {
                      <button class="builder-btn-small" (click)="uploadFor('intro', 'background', 'gifs')">Subir archivo</button>
                    }
                  </div>
                </div>
              }

              <!-- ===== Section Style (shared for all with sectionStyle) ===== -->
              @if (hasSectionStyle()) {
                <div class="builder-prop-divider"></div>
                <div class="builder-prop-category">Estilo de fondo</div>
                <div class="builder-prop-group">
                  <label class="builder-prop-label">Tipo de fondo</label>
                  <div class="builder-btn-row">
                    <button class="builder-btn-chip" [class.active]="getSectionStyleProp('bgType') === 'inherit' || !getSectionStyleProp('bgType')" (click)="setSectionStyleProp('bgType', 'inherit')">Hereda</button>
                    <button class="builder-btn-chip" [class.active]="getSectionStyleProp('bgType') === 'solid'" (click)="setSectionStyleProp('bgType', 'solid')">Sólido</button>
                    <button class="builder-btn-chip" [class.active]="getSectionStyleProp('bgType') === 'linear'" (click)="setSectionStyleProp('bgType', 'linear')">Degradado</button>
                    <button class="builder-btn-chip" [class.active]="getSectionStyleProp('bgType') === 'image'" (click)="setSectionStyleProp('bgType', 'image')">Imagen</button>
                  </div>
                </div>
                @if (getSectionStyleProp('bgType') === 'solid' || getSectionStyleProp('bgType') === 'linear') {
                  <div class="builder-prop-group">
                    <label class="builder-prop-label">Color principal</label>
                    <app-color-picker [value]="getSectionStyleProp('bgColor1') || '#ffffff'" (valueChange)="setSectionStyleProp('bgColor1', $event)"></app-color-picker>
                  </div>
                }
                @if (getSectionStyleProp('bgType') === 'linear') {
                  <div class="builder-prop-group">
                    <label class="builder-prop-label">Color secundario</label>
                    <app-color-picker [value]="getSectionStyleProp('bgColor2') || '#f0f0f0'" (valueChange)="setSectionStyleProp('bgColor2', $event)"></app-color-picker>
                  </div>
                }
                @if (getSectionStyleProp('bgType') === 'image') {
                  <div class="builder-prop-group">
                    <label class="builder-prop-label">Imagen de fondo</label>
                    <div class="builder-upload-row">
                      @if (getSectionStyleProp('bgImage')) {
                        <span class="builder-upload-ok">✔ Imagen cargada</span>
                        <button class="builder-btn-small danger" (click)="setSectionStyleProp('bgImage', '')">Quitar</button>
                      } @else {
                        <button class="builder-btn-small" (click)="uploadSectionBg()">Subir imagen</button>
                      }
                    </div>
                  </div>
                }
              }
            }

            <div class="builder-prop-divider"></div>
            <a [routerLink]="['/dashboard/config', eventId]" class="builder-advanced-link">
              <span class="material-icons">settings</span>
              Configuración avanzada
            </a>
            }
          </div>
        } @else {
          <div class="builder-props-empty">
            <span class="material-icons">touch_app</span>
            <p>Selecciona una sección para editar sus propiedades</p>
          </div>
        }
      </aside>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 200;
      overflow: hidden;
      background: #0a0a14;
    }

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
      height: calc(100vh - 53px); overflow: hidden;
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
      display: flex; align-items: flex-start; justify-content: center;
      background: #06060e; padding: 20px; overflow-y: auto; overflow-x: hidden;
    }
    .builder-canvas-frame {
      background: #0d1117; border-radius: 24px; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.08);
      transition: width 0.3s;
      min-height: 100%;
      &.mobile { width: 375px; }
      &.tablet { width: 768px; }
      &.desktop { width: 100%; border-radius: 12px; }
    }
    .builder-canvas {
      min-height: 400px; position: relative;
      --font-sans: 'Lato', sans-serif;
      --font-serif: 'Playfair Display', serif;
      --font-script: 'Great Vibes', cursive;
      --gold: #d4a017; --gold-light: #e6c655;
    }
    /* Override landing nav to not be fixed inside builder canvas */
    .builder-canvas ::ng-deep .landing-nav {
      position: relative !important;
      z-index: 1 !important;
    }
    .builder-canvas ::ng-deep .landing-nav.scrolled {
      background: var(--theme-card-bg, rgba(13,17,23,0.85));
    }
    /* Override any fixed/absolute elements within sections */
    .builder-canvas ::ng-deep .back-to-top { display: none !important; }
    .canvas-section {
      position: relative; cursor: pointer;
      border: 2px solid transparent; transition: border-color 0.2s, opacity 0.2s;
      &:hover { border-color: rgba(139,92,246,0.3); }
      &.selected { border-color: rgba(139,92,246,0.7); background: rgba(139,92,246,0.02); }
      &.ghost { opacity: 0.4; }
    }
    .canvas-section-label {
      position: absolute; top: 4px; left: 4px; z-index: 10;
      font-size: 10px; padding: 2px 8px; border-radius: 4px;
      background: rgba(139,92,246,0.85); color: white; font-weight: 600;
      opacity: 0; transition: opacity 0.2s; pointer-events: none;
    }
    .canvas-section:hover .canvas-section-label,
    .canvas-section.selected .canvas-section-label { opacity: 1; }
    .canvas-empty-section {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 40px 20px; text-align: center; min-height: 120px;
      .material-icons { font-size: 32px; color: rgba(139,92,246,0.3); margin-bottom: 8px; }
      p { font-size: 12px; color: rgba(255,255,255,0.3); }
    }

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
    .builder-section-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; margin-bottom: 16px;
      background: rgba(139,92,246,0.08); border-radius: 10px;
      border: 1px solid rgba(139,92,246,0.2);
      .material-icons { font-size: 18px; color: var(--gold-light); }
      span:last-child { font-size: 14px; font-weight: 600; color: white; }
    }
    .builder-prop-category {
      font-size: 11px; color: rgba(139,92,246,0.8); text-transform: uppercase;
      letter-spacing: 1px; font-weight: 700; margin: 16px 0 10px; padding-left: 2px;
    }
    .builder-card-item {
      padding: 10px; margin-bottom: 8px;
      background: rgba(255,255,255,0.03); border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.06);
      display: flex; flex-direction: column; gap: 6px;
    }
    .builder-textarea-sm { min-height: 48px; resize: vertical; }
    .builder-select {
      appearance: none; cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 12px center;
      padding-right: 32px;
    }
    .builder-upload-row {
      display: flex; align-items: center; gap: 8px;
    }
    .builder-upload-ok {
      font-size: 12px; color: #10b981; font-weight: 500;
    }
    .builder-btn-small {
      padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(139,92,246,0.3);
      background: rgba(139,92,246,0.1); color: rgba(255,255,255,0.8);
      font-size: 12px; cursor: pointer; transition: all 0.2s; white-space: nowrap;
      &:hover { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.5); }
      &.danger { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); color: #ef4444; }
      &.danger:hover { background: rgba(239,68,68,0.2); }
    }
    .builder-btn-row {
      display: flex; flex-wrap: wrap; gap: 4px;
    }
    .builder-btn-chip {
      padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6);
      font-size: 11px; cursor: pointer; transition: all 0.2s;
      &:hover { background: rgba(139,92,246,0.1); color: white; }
      &.active { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.5); color: #c084fc; font-weight: 600; }
    }
    .builder-theme-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; margin: 8px 8px 4px;
      border-radius: 10px; cursor: pointer; transition: all 0.2s;
      border: 1px solid rgba(139,92,246,0.1);
      background: rgba(139,92,246,0.04);
      .material-icons { font-size: 18px; color: #c084fc; }
      span:last-child { font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 500; }
      &:hover { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.2); }
      &.active { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.4); }
      &.active span:last-child { color: white; }
    }
    .builder-prop-category-row {
      display: flex; align-items: center; justify-content: space-between;
      margin: 16px 0 10px; padding-left: 2px;
      span { font-size: 11px; color: rgba(139,92,246,0.8); text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
    }
    .builder-card-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;
    }
    .builder-card-num {
      font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 600;
      width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
      border-radius: 50%; background: rgba(139,92,246,0.1);
    }
    .builder-btn-icon {
      width: 22px; height: 22px; border-radius: 50%; border: none;
      background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      .material-icons { font-size: 14px; }
      &:hover { background: rgba(255,255,255,0.1); color: white; }
      &.danger:hover { background: rgba(239,68,68,0.2); color: #ef4444; }
    }

    /* CDK Drag styles */
    .cdk-drag-preview { border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .cdk-drag-placeholder { opacity: 0.3; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }

    @media (max-width: 900px) {
      .builder-layout { grid-template-columns: 1fr; }
      .builder-panel {
        display: none;
        position: fixed; top: 53px; bottom: 0; z-index: 100;
        width: 280px; box-shadow: 4px 0 24px rgba(0,0,0,0.5);
      }
      .builder-panel-left { left: 0; }
      .builder-panel-right { right: 0; box-shadow: -4px 0 24px rgba(0,0,0,0.5); }
      .builder-panel.mobile-open { display: block; }
      .builder-save-text { display: none; }
      .builder-preview-frame.mobile { width: 100%; border-radius: 0; }
      .builder-preview-frame.tablet { width: 100%; border-radius: 0; }
      .builder-preview { padding: 0; }
    }
    @media (min-width: 901px) {
      .builder-mobile-toggle { display: none !important; }
    }
    .builder-mobile-toggle {
      width: 32px; height: 32px; border-radius: 8px; border: none;
      background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      margin-right: 8px; transition: all 0.2s;
      .material-icons { font-size: 18px; }
      &:hover { background: rgba(139,92,246,0.15); color: white; }
    }
  `]
})
export class BuilderComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  eventId = 0;
  eventName = signal('');
  eventSlug = '';
  config = signal<EventConfig | null>(null);
  sections = signal<BuilderSection[]>([]);
  selectedSection = signal<string | null>(null);
  previewDevice = signal<'mobile' | 'tablet' | 'desktop'>('mobile');
  saving = signal(false);
  saveStatus = signal<'idle' | 'saved'>('idle');
  showLeftPanel = signal(false);
  showRightPanel = signal(false);
  eventData = signal<any>({ name: '', event_date: '', slug: '' });
  itineraryItems = signal<ItineraryItem[]>([]);
  photos = signal<Photo[]>([]);
  private isDirty = false;
  private autoSaveTimer: any = null;

  hasUnsavedChanges(): boolean { return this.isDirty; }

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    this.api.getEvent(this.eventId).subscribe(e => {
      this.eventName.set(e.name);
      this.eventSlug = e.slug;
      this.eventData.set(e);
    });
    this.api.getConfig(this.eventId).subscribe(c => {
      const cfg = c.config_json;
      this.config.set(cfg);
      this.buildSections(cfg);
    });
    // Load itinerary and photos for gallery preview
    this.api.getItinerary(this.eventId).subscribe(items => this.itineraryItems.set(items));
    this.api.getPhotos(this.eventId).subscribe(photos => this.photos.set(photos));
  }

  ngOnDestroy() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }

  /** Schedule auto-save after 3 seconds of inactivity */
  private scheduleAutoSave() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      if (this.isDirty && !this.saving()) {
        this.save();
      }
    }, 3000);
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
    const newKey = this.selectedSection() === key ? null : key;
    this.selectedSection.set(newKey);
  }

  /** Check if a section is enabled in config */
  isSectionEnabled(key: string): boolean {
    const cfg = this.config();
    if (!cfg) return false;
    return (cfg as any)[key]?.enabled ?? false;
  }

  /** Get the canvas background based on theme */
  getCanvasBg(): string {
    const theme = this.config()?.theme;
    if (!theme) return '#0d1117';
    const c1 = theme.landingBgColor1 || '#0d1117';
    const c2 = theme.landingBgColor2 || '#1a1a2e';
    const type = theme.landingBgType || 'solid';
    const angle = theme.landingBgAngle || 135;
    switch (type) {
      case 'solid': return c1;
      case 'linear': return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
      case 'radial': return `radial-gradient(ellipse at center, ${c2}, ${c1})`;
      default: return c1;
    }
  }

  /** Get enabled sections for hero nav */
  getCanvasEnabledSections(): string[] {
    const cfg = this.config();
    if (!cfg) return [];
    const s: string[] = ['invitation'];
    if (cfg.details.enabled) s.push('details');
    if (cfg.venues.enabled) s.push('venues');
    if (cfg.itinerary.enabled) s.push('itinerary');
    if (cfg.gallery.enabled) s.push('gallery');
    if (cfg.dresscode.enabled) s.push('dresscode');
    if (cfg.gifts.enabled) s.push('gifts');
    if (cfg.rsvp.enabled) s.push('rsvp');
    return s;
  }

  getSelectedLabel(): string {
    return this.sections().find(s => s.key === this.selectedSection())?.label || '';
  }

  getSelectedIcon(): string {
    return this.sections().find(s => s.key === this.selectedSection())?.icon || 'widgets';
  }

  getSelectedConfig(): any {
    const key = this.selectedSection();
    if (!key || !this.config()) return null;
    return (this.config() as any)[key] || null;
  }

  /** Update a top-level property of a section config */
  updateConfigProp(sectionKey: string, prop: string, value: any) {
    const cfg = this.config();
    if (!cfg) return;
    (cfg as any)[sectionKey][prop] = value;
    this.config.set({ ...cfg });
    this.isDirty = true;
    this.scheduleAutoSave();
  }

  /** Update a card property within details section */
  updateCardProp(sectionKey: string, index: number, prop: string, value: any) {
    const cfg = this.config();
    if (!cfg) return;
    const section = (cfg as any)[sectionKey];
    if (section?.cards?.[index]) {
      section.cards[index][prop] = value;
      this.config.set({ ...cfg });
      this.isDirty = true;
      this.scheduleAutoSave();
    }
  }

  /** Update venue item property */
  updateVenueProp(index: number, prop: string, value: any) {
    const cfg = this.config();
    if (!cfg) return;
    if (cfg.venues?.items?.[index]) {
      (cfg.venues.items[index] as any)[prop] = value;
      this.config.set({ ...cfg });
      this.isDirty = true;
      this.scheduleAutoSave();
    }
  }

  /** Update dresscode card property */
  updateDresscodeCard(index: number, prop: string, value: any) {
    const cfg = this.config();
    if (!cfg) return;
    if (cfg.dresscode?.cards?.[index]) {
      (cfg.dresscode.cards[index] as any)[prop] = value;
      this.config.set({ ...cfg });
      this.isDirty = true;
      this.scheduleAutoSave();
    }
  }

  /** Update theme property */
  updateThemeProp(prop: string, value: any) {
    const cfg = this.config();
    if (!cfg) return;
    (cfg.theme as any)[prop] = value;
    this.config.set({ ...cfg });
    this.isDirty = true;
    this.scheduleAutoSave();
  }

  /** Add a new detail card */
  addDetailCard() {
    const cfg = this.config();
    if (!cfg) return;
    if (!cfg.details.cards) cfg.details.cards = [];
    cfg.details.cards.push({
      id: 'card-' + Date.now(),
      iconType: 'none', icon: '', iconUrl: '',
      title: 'Nuevo detalle', content: '',
      textAlign: 'center'
    });
    this.config.set({ ...cfg });
    this.isDirty = true;
  }

  /** Remove a detail card */
  removeDetailCard(index: number) {
    const cfg = this.config();
    if (!cfg) return;
    cfg.details.cards.splice(index, 1);
    this.config.set({ ...cfg });
    this.isDirty = true;
  }

  /** Add a new venue */
  addVenue() {
    const cfg = this.config();
    if (!cfg) return;
    if (!cfg.venues.items) cfg.venues.items = [];
    cfg.venues.items.push({
      id: 'venue-' + Date.now(),
      title: '', icon: 'place', name: 'Nuevo lugar',
      address: '', time: '', mapsUrl: ''
    });
    this.config.set({ ...cfg });
    this.isDirty = true;
  }

  /** Remove a venue */
  removeVenue(index: number) {
    const cfg = this.config();
    if (!cfg) return;
    cfg.venues.items.splice(index, 1);
    this.config.set({ ...cfg });
    this.isDirty = true;
  }

  /** Add a new dresscode card */
  addDresscodeCard() {
    const cfg = this.config();
    if (!cfg) return;
    if (!cfg.dresscode.cards) cfg.dresscode.cards = [];
    cfg.dresscode.cards.push({
      id: 'dc-' + Date.now(),
      title: 'Nuevo ejemplo', description: '', images: []
    });
    this.config.set({ ...cfg });
    this.isDirty = true;
  }

  /** Remove a dresscode card */
  removeDresscodeCard(index: number) {
    const cfg = this.config();
    if (!cfg) return;
    if (cfg.dresscode.cards) {
      cfg.dresscode.cards.splice(index, 1);
      this.config.set({ ...cfg });
      this.isDirty = true;
    }
  }

  /** Check if the selected section has a sectionStyle property */
  hasSectionStyle(): boolean {
    const key = this.selectedSection();
    if (!key) return false;
    // Sections that support sectionStyle
    return ['invitation', 'details', 'venues', 'itinerary', 'gallery', 'dresscode', 'gifts', 'rsvp'].includes(key);
  }

  /** Get a property from the section's sectionStyle */
  getSectionStyleProp(prop: string): any {
    const key = this.selectedSection();
    if (!key || !this.config()) return null;
    const section = (this.config() as any)[key];
    return section?.sectionStyle?.[prop] ?? null;
  }

  /** Set a property on the section's sectionStyle (creates sectionStyle if it doesn't exist) */
  setSectionStyleProp(prop: string, value: any) {
    const key = this.selectedSection();
    if (!key) return;
    const cfg = this.config();
    if (!cfg) return;
    const section = (cfg as any)[key];
    if (!section.sectionStyle) {
      section.sectionStyle = { bgType: 'inherit', dividerType: 'none' };
    }
    section.sectionStyle[prop] = value;
    this.config.set({ ...cfg });
    this.isDirty = true;
    this.scheduleAutoSave();
  }

  /** Trigger file upload for a section property */
  uploadFor(sectionKey: string, prop: string, type: 'images' | 'audio' | 'gifs') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'audio' ? 'audio/*' : type === 'images' ? 'image/*' : 'image/*,video/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      this.api.uploadFile(type, file).subscribe({
        next: (res) => {
          this.updateConfigProp(sectionKey, prop, res.url);
        }
      });
    };
    input.click();
  }

  /** Upload background image for section style */
  uploadSectionBg() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      this.api.uploadFile('images', file).subscribe({
        next: (res) => {
          this.setSectionStyleProp('bgImage', res.url);
        }
      });
    };
    input.click();
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
      // Also update config so canvas reflects the change immediately
      const cfg = this.config();
      if (cfg && (cfg as any)[key] && typeof (cfg as any)[key] === 'object') {
        (cfg as any)[key].enabled = s[idx].enabled;
        this.config.set({ ...cfg });
      }
      this.isDirty = true;
      this.scheduleAutoSave();
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
      next: () => {
        this.saving.set(false);
        this.saveStatus.set('saved');
        this.isDirty = false;
        setTimeout(() => this.saveStatus.set('idle'), 3000);
      },
      error: () => { this.saving.set(false); }
    });
  }
}
