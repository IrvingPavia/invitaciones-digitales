import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ColorPickerComponent } from '../../../../../core/components/color-picker.component';
import { CanvasStateService } from '../../services/canvas-state.service';
import { ApiService } from '../../../../../core/services/api.service';

@Component({
  selector: 'app-builder-props-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ColorPickerComponent],
  template: `
    <div class="props-panel-content">
      <!-- Section badge -->
      @if (canvasState.selectedSection() && canvasState.selectedSection() !== '_theme') {
        <div class="props-badge">
          <span class="material-icons">{{ sectionIcon }}</span>
          <span>{{ sectionLabel }}</span>
        </div>
      }
      @if (canvasState.selectedSection() === '_theme') {
        <div class="props-badge"><span class="material-icons">palette</span><span>Tema Global</span></div>
      }

      <!-- ===== THEME GLOBAL ===== -->
      @if (canvasState.selectedSection() === '_theme' && cfg()) {
        <div class="accordion" [class.open]="expanded['tpl']" (click)="toggle('tpl')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['tpl'] ? 'expand_more' : 'chevron_right' }}</span><span>Aplicar Template</span></div>
        </div>
        @if (expanded['tpl']) {
          <div class="accordion-body">
            <div class="tpl-grid">
              <button class="tpl-btn" (click)="applyTemplate('elegante')">🌙 Elegante</button>
              <button class="tpl-btn" (click)="applyTemplate('moderno')">💜 Moderno</button>
              <button class="tpl-btn" (click)="applyTemplate('romantico')">💕 Romántico</button>
              <button class="tpl-btn" (click)="applyTemplate('festivo')">🎉 Festivo</button>
              <button class="tpl-btn" (click)="applyTemplate('corporativo')">🏢 Corporativo</button>
            </div>
          </div>
        }

        <div class="accordion" [class.open]="expanded['colors']" (click)="toggle('colors')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['colors'] ? 'expand_more' : 'chevron_right' }}</span><span>Colores del Tema</span></div>
        </div>
        @if (expanded['colors']) {
          <div class="accordion-body">
            <div class="pf"><label>Texto primario</label><app-color-picker [value]="cfg()!.theme.textPrimary || '#fff'" (valueChange)="setTheme('textPrimary', $event)"></app-color-picker></div>
            <div class="pf"><label>Texto secundario</label><app-color-picker [value]="cfg()!.theme.textSecondary || 'rgba(255,255,255,0.7)'" (valueChange)="setTheme('textSecondary', $event)"></app-color-picker></div>
            <div class="pf"><label>Acento (nav/footer)</label><app-color-picker [value]="cfg()!.theme.navFooterText || '#d4a017'" (valueChange)="setTheme('navFooterText', $event)"></app-color-picker></div>
            <div class="pf"><label>Botones fondo</label><app-color-picker [value]="cfg()!.theme.buttonBg || '#d4a017'" (valueChange)="setTheme('buttonBg', $event)"></app-color-picker></div>
            <div class="pf"><label>Botones texto</label><app-color-picker [value]="cfg()!.theme.buttonText || '#1a1a2e'" (valueChange)="setTheme('buttonText', $event)"></app-color-picker></div>
            <div class="pf"><label>Fondo cards</label><app-color-picker [value]="cfg()!.theme.cardBg || 'rgba(255,255,255,0.05)'" (valueChange)="setTheme('cardBg', $event)"></app-color-picker></div>
            <div class="pf"><label>Borde cards</label><app-color-picker [value]="cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="setTheme('cardBorder', $event)"></app-color-picker></div>
          </div>
        }

        <div class="accordion" [class.open]="expanded['bg']" (click)="toggle('bg')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['bg'] ? 'expand_more' : 'chevron_right' }}</span><span>Fondo de la Landing</span></div>
        </div>
        @if (expanded['bg']) {
          <div class="accordion-body">
            <div class="pf"><label>Color 1</label><app-color-picker [value]="cfg()!.theme.landingBgColor1 || '#0d1117'" (valueChange)="setTheme('landingBgColor1', $event)"></app-color-picker></div>
            <div class="pf"><label>Color 2</label><app-color-picker [value]="cfg()!.theme.landingBgColor2 || '#1a1a2e'" (valueChange)="setTheme('landingBgColor2', $event)"></app-color-picker></div>
            <div class="pf"><label>Tipo</label>
              <select class="pinput" [ngModel]="cfg()!.theme.landingBgType || 'solid'" (ngModelChange)="setTheme('landingBgType', $event)">
                <option value="solid">Sólido</option><option value="linear">Lineal</option><option value="radial">Radial</option><option value="mesh">Difuminado</option>
              </select>
            </div>
            <div class="pf"><label>Textura</label>
              <select class="pinput" [ngModel]="cfg()!.theme.landingBgTexture || 'none'" (ngModelChange)="setTheme('landingBgTexture', $event)">
                <option value="none">Ninguna</option><option value="noise">Noise</option><option value="grain">Grain</option><option value="dots">Dots</option><option value="lines">Lines</option><option value="cross">Cross</option><option value="paper">Paper</option><option value="linen">Linen</option><option value="stars">Stars</option>
              </select>
            </div>
          </div>
        }

        <div class="accordion" [class.open]="expanded['anim']" (click)="toggle('anim')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['anim'] ? 'expand_more' : 'chevron_right' }}</span><span>Animación Global</span></div>
        </div>
        @if (expanded['anim']) {
          <div class="accordion-body">
            <div class="btn-row">
              <button class="chip" [class.active]="!cfg()!.theme.scrollAnimation || cfg()!.theme.scrollAnimation === 'fade-up'" (click)="setTheme('scrollAnimation','fade-up');$event.stopPropagation()">↑ Fade Up</button>
              <button class="chip" [class.active]="cfg()!.theme.scrollAnimation === 'fade-in'" (click)="setTheme('scrollAnimation','fade-in');$event.stopPropagation()">◉ Fade In</button>
              <button class="chip" [class.active]="cfg()!.theme.scrollAnimation === 'scale'" (click)="setTheme('scrollAnimation','scale');$event.stopPropagation()">⊕ Scale</button>
              <button class="chip" [class.active]="cfg()!.theme.scrollAnimation === 'none'" (click)="setTheme('scrollAnimation','none');$event.stopPropagation()">✕ Ninguna</button>
            </div>
          </div>
        }
      }

      <!-- ===== SECTION PROPERTIES ===== -->
      @if (canvasState.selectedSection() && canvasState.selectedSection() !== '_theme' && cfg()) {

        <!-- Section-specific content -->
        @if (canvasState.selectedSection() === 'hero') {
          <div class="accordion" [class.open]="expanded['hero-names']" (click)="toggle('hero-names')"><div class="accordion-header"><span class="material-icons">{{ expanded['hero-names'] ? 'expand_more' : 'chevron_right' }}</span><span>Nombres y Textos</span></div></div>
          @if (expanded['hero-names']) {
            <div class="accordion-body">
              <div class="pf"><label>Nombres</label><input class="pinput" [ngModel]="sec('hero')?.celebrantNames" (ngModelChange)="setSec('hero','celebrantNames',$event)"></div>
              <div class="pf"><label>Descripción</label><input class="pinput" [ngModel]="sec('hero')?.eventDescription" (ngModelChange)="setSec('hero','eventDescription',$event)"></div>
              <div class="pf"><label>Frase</label><input class="pinput" [ngModel]="sec('hero')?.heroPhrase" (ngModelChange)="setSec('hero','heroPhrase',$event)"></div>
              <div class="pf"><label>Countdown fecha</label><input type="datetime-local" class="pinput" [ngModel]="sec('hero')?.countdownDate" (ngModelChange)="setSec('hero','countdownDate',$event)"></div>
            </div>
          }
          <div class="accordion" [class.open]="expanded['hero-media']" (click)="toggle('hero-media')"><div class="accordion-header"><span class="material-icons">{{ expanded['hero-media'] ? 'expand_more' : 'chevron_right' }}</span><span>Fondo y Audio</span></div></div>
          @if (expanded['hero-media']) {
            <div class="accordion-body">
              <div class="pf"><label>Fondo</label><div class="upload-row">@if(sec('hero')?.backgroundGif){<span class="upload-ok">✔</span><button class="sm-btn danger" (click)="setSec('hero','backgroundGif','');$event.stopPropagation()">Quitar</button>}@else{<button class="sm-btn" (click)="upload('hero','backgroundGif','gifs');$event.stopPropagation()">Subir</button>}</div></div>
              <div class="pf"><label>Audio</label><div class="upload-row">@if(sec('hero')?.audioUrl){<span class="upload-ok">✔</span><button class="sm-btn danger" (click)="setSec('hero','audioUrl','');$event.stopPropagation()">Quitar</button>}@else{<button class="sm-btn" (click)="upload('hero','audioUrl','audio');$event.stopPropagation()">Subir</button>}</div></div>
            </div>
          }
        }

        @if (canvasState.selectedSection() === 'envelope') {
          <div class="accordion" [class.open]="expanded['env']" (click)="toggle('env')"><div class="accordion-header"><span class="material-icons">{{ expanded['env'] ? 'expand_more' : 'chevron_right' }}</span><span>Pantalla de Inicio</span></div></div>
          @if (expanded['env']) {
            <div class="accordion-body">
              <div class="pf"><label>Template</label><select class="pinput" [ngModel]="sec('envelope')?.template||'envelope'" (ngModelChange)="setSec('envelope','template',$event)"><option value="envelope">Sobre</option><option value="ticket">Ticket</option><option value="minimal-splash">Splash</option><option value="plain">Plano</option></select></div>
              <div class="pf"><label>Instrucción</label><input class="pinput" [ngModel]="sec('envelope')?.instructionText" (ngModelChange)="setSec('envelope','instructionText',$event)"></div>
              <div class="pf"><label>Texto sello</label><input class="pinput" [ngModel]="sec('envelope')?.sealText" (ngModelChange)="setSec('envelope','sealText',$event)"></div>
              <div class="pf"><label>Color sobre</label><app-color-picker [value]="sec('envelope')?.envelopeColor||'#1a1a2e'" (valueChange)="setSec('envelope','envelopeColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Color sello</label><app-color-picker [value]="sec('envelope')?.sealColor||'#8b0000'" (valueChange)="setSec('envelope','sealColor',$event)"></app-color-picker></div>
            </div>
          }
        }

        @if (canvasState.selectedSection() === 'intro') {
          <div class="accordion" [class.open]="expanded['intro']" (click)="toggle('intro')"><div class="accordion-header"><span class="material-icons">{{ expanded['intro'] ? 'expand_more' : 'chevron_right' }}</span><span>Intro</span></div></div>
          @if (expanded['intro']) {
            <div class="accordion-body">
              <div class="pf"><label>Frase</label><textarea class="pinput" style="min-height:50px" [ngModel]="sec('intro')?.phrase" (ngModelChange)="setSec('intro','phrase',$event)"></textarea></div>
              <div class="pf"><label>Duración (seg)</label><input type="number" class="pinput" [ngModel]="sec('intro')?.duration" (ngModelChange)="setSec('intro','duration',+$event)" min="1" max="15"></div>
              <div class="pf"><label>Fondo</label><div class="upload-row">@if(sec('intro')?.background){<span class="upload-ok">✔</span><button class="sm-btn danger" (click)="setSec('intro','background','');$event.stopPropagation()">Quitar</button>}@else{<button class="sm-btn" (click)="upload('intro','background','gifs');$event.stopPropagation()">Subir</button>}</div></div>
            </div>
          }
        }

        @if (canvasState.selectedSection() === 'invitation') {
          <div class="accordion" [class.open]="expanded['inv']" (click)="toggle('inv')"><div class="accordion-header"><span class="material-icons">{{ expanded['inv'] ? 'expand_more' : 'chevron_right' }}</span><span>Invitación</span></div></div>
          @if (expanded['inv']) {
            <div class="accordion-body">
              <div class="pf"><label>Título</label><input class="pinput" [ngModel]="sec('invitation')?.title" (ngModelChange)="setSec('invitation','title',$event)"></div>
              <div class="pf"><label>Subtítulo</label><textarea class="pinput" style="min-height:50px" [ngModel]="sec('invitation')?.subtitle" (ngModelChange)="setSec('invitation','subtitle',$event)"></textarea></div>
            </div>
          }
        }

        @if (canvasState.selectedSection() === 'details') {
          <div class="accordion" [class.open]="expanded['det']" (click)="toggle('det')"><div class="accordion-header"><span class="material-icons">{{ expanded['det'] ? 'expand_more' : 'chevron_right' }}</span><span>Detalles</span></div></div>
          @if (expanded['det']) {
            <div class="accordion-body">
              <div class="pf"><label>Título</label><input class="pinput" [ngModel]="sec('details')?.title" (ngModelChange)="setSec('details','title',$event)"></div>
              <div class="items-header"><span>Cards ({{sec('details')?.cards?.length||0}})</span><button class="sm-btn" (click)="addCard('details');$event.stopPropagation()">+</button></div>
              @for (card of sec('details')?.cards||[]; track card.id; let i=$index) {
                <div class="item-card"><div class="item-head"><span>{{i+1}}</span><button class="x-btn" (click)="removeCard('details',i);$event.stopPropagation()">✕</button></div>
                  <input class="pinput" [ngModel]="card.title" (ngModelChange)="updateCard('details',i,'title',$event)" placeholder="Título">
                  <textarea class="pinput sm" [ngModel]="card.content" (ngModelChange)="updateCard('details',i,'content',$event)" placeholder="Contenido"></textarea>
                </div>
              }
            </div>
          }
        }

        @if (canvasState.selectedSection() === 'venues') {
          <div class="accordion" [class.open]="expanded['ven']" (click)="toggle('ven')"><div class="accordion-header"><span class="material-icons">{{ expanded['ven'] ? 'expand_more' : 'chevron_right' }}</span><span>Lugares</span></div></div>
          @if (expanded['ven']) {
            <div class="accordion-body">
              <div class="items-header"><span>Venues ({{sec('venues')?.items?.length||0}})</span><button class="sm-btn" (click)="addVenue();$event.stopPropagation()">+</button></div>
              @for (item of sec('venues')?.items||[]; track item.id; let i=$index) {
                <div class="item-card"><div class="item-head"><span>{{i+1}}</span><button class="x-btn" (click)="removeVenue(i);$event.stopPropagation()">✕</button></div>
                  <input class="pinput" [ngModel]="item.name" (ngModelChange)="updateVenue(i,'name',$event)" placeholder="Nombre">
                  <input class="pinput" [ngModel]="item.address" (ngModelChange)="updateVenue(i,'address',$event)" placeholder="Dirección">
                  <input class="pinput" [ngModel]="item.time" (ngModelChange)="updateVenue(i,'time',$event)" placeholder="Hora">
                  <input class="pinput" [ngModel]="item.mapsUrl" (ngModelChange)="updateVenue(i,'mapsUrl',$event)" placeholder="Link Maps">
                </div>
              }
            </div>
          }
        }

        @if (canvasState.selectedSection() === 'itinerary') {
          <div class="accordion" [class.open]="expanded['itin']" (click)="toggle('itin')"><div class="accordion-header"><span class="material-icons">{{ expanded['itin'] ? 'expand_more' : 'chevron_right' }}</span><span>Itinerario</span></div></div>
          @if (expanded['itin']) {
            <div class="accordion-body">
              <div class="pf"><label>Título</label><input class="pinput" [ngModel]="sec('itinerary')?.title" (ngModelChange)="setSec('itinerary','title',$event)"></div>
              <p class="hint">Las actividades se gestionan desde Configuración avanzada.</p>
            </div>
          }
        }

        @if (canvasState.selectedSection() === 'gallery') {
          <div class="accordion" [class.open]="expanded['gal']" (click)="toggle('gal')"><div class="accordion-header"><span class="material-icons">{{ expanded['gal'] ? 'expand_more' : 'chevron_right' }}</span><span>Galería</span></div></div>
          @if (expanded['gal']) {
            <div class="accordion-body">
              <div class="pf"><label>Estilo</label><select class="pinput" [ngModel]="sec('gallery')?.displayStyle||'carousel-3d'" (ngModelChange)="setSec('gallery','displayStyle',$event)"><option value="carousel-3d">Carrusel 3D</option><option value="carousel-vertical">Vertical</option><option value="coverflow">Coverflow</option><option value="stack">Stack</option><option value="flip">Flip</option><option value="polaroid">Polaroid</option><option value="grid">Mosaico</option><option value="slideshow">Slideshow</option></select></div>
              <div class="items-header"><span>Fotos ({{photos().length}})</span><button class="sm-btn" (click)="uploadPhotos();$event.stopPropagation()">+ Subir</button></div>
              <div class="photo-grid">@for(p of photos();track p.id){<div class="photo-thumb"><img [src]="p.url"><button class="x-btn mini" (click)="deletePhoto(p.id);$event.stopPropagation()">✕</button></div>}</div>
            </div>
          }
        }

        @if (canvasState.selectedSection() === 'dresscode') {
          <div class="accordion" [class.open]="expanded['dress']" (click)="toggle('dress')"><div class="accordion-header"><span class="material-icons">{{ expanded['dress'] ? 'expand_more' : 'chevron_right' }}</span><span>Vestimenta</span></div></div>
          @if (expanded['dress']) {
            <div class="accordion-body">
              <div class="pf"><label>Título</label><input class="pinput" [ngModel]="sec('dresscode')?.title" (ngModelChange)="setSec('dresscode','title',$event)"></div>
              <div class="items-header"><span>Cards ({{sec('dresscode')?.cards?.length||0}})</span><button class="sm-btn" (click)="addDresscode();$event.stopPropagation()">+</button></div>
              @for (card of sec('dresscode')?.cards||[]; track card.id; let i=$index) {
                <div class="item-card"><div class="item-head"><span>{{i+1}}</span><button class="x-btn" (click)="removeDresscode(i);$event.stopPropagation()">✕</button></div>
                  <input class="pinput" [ngModel]="card.title" (ngModelChange)="updateDresscode(i,'title',$event)" placeholder="Título">
                  <textarea class="pinput sm" [ngModel]="card.description" (ngModelChange)="updateDresscode(i,'description',$event)" placeholder="Descripción"></textarea>
                </div>
              }
            </div>
          }
        }

        @if (canvasState.selectedSection() === 'gifts') {
          <div class="accordion" [class.open]="expanded['gifts']" (click)="toggle('gifts')"><div class="accordion-header"><span class="material-icons">{{ expanded['gifts'] ? 'expand_more' : 'chevron_right' }}</span><span>Regalos</span></div></div>
          @if (expanded['gifts']) {
            <div class="accordion-body">
              <div class="pf"><label>Título</label><input class="pinput" [ngModel]="sec('gifts')?.title" (ngModelChange)="setSec('gifts','title',$event)"></div>
              <div class="pf"><label>Descripción</label><textarea class="pinput sm" [ngModel]="sec('gifts')?.description" (ngModelChange)="setSec('gifts','description',$event)"></textarea></div>
              <div class="pf"><label>Link</label><input class="pinput" [ngModel]="sec('gifts')?.link" (ngModelChange)="setSec('gifts','link',$event)" placeholder="https://..."></div>
              <div class="pf"><label>Texto botón</label><input class="pinput" [ngModel]="sec('gifts')?.buttonText" (ngModelChange)="setSec('gifts','buttonText',$event)"></div>
            </div>
          }
        }

        @if (canvasState.selectedSection() === 'rsvp') {
          <div class="accordion" [class.open]="expanded['rsvp']" (click)="toggle('rsvp')"><div class="accordion-header"><span class="material-icons">{{ expanded['rsvp'] ? 'expand_more' : 'chevron_right' }}</span><span>Confirmación</span></div></div>
          @if (expanded['rsvp']) {
            <div class="accordion-body">
              <div class="pf"><label>Título</label><input class="pinput" [ngModel]="sec('rsvp')?.title" (ngModelChange)="setSec('rsvp','title',$event)"></div>
            </div>
          }
        }

        <!-- Common section style accordions -->
        <div class="accordion" [class.open]="expanded['sec-bg']" (click)="toggle('sec-bg')"><div class="accordion-header"><span class="material-icons">{{ expanded['sec-bg'] ? 'expand_more' : 'chevron_right' }}</span><span>Fondo de Sección</span></div></div>
        @if (expanded['sec-bg']) {
          <div class="accordion-body">
            <div class="btn-row">
              <button class="chip" [class.active]="!ss('bgType')||ss('bgType')==='inherit'" (click)="setSS('bgType','inherit');$event.stopPropagation()">Hereda</button>
              <button class="chip" [class.active]="ss('bgType')==='solid'" (click)="setSS('bgType','solid');$event.stopPropagation()">Sólido</button>
              <button class="chip" [class.active]="ss('bgType')==='linear'" (click)="setSS('bgType','linear');$event.stopPropagation()">Degradado</button>
              <button class="chip" [class.active]="ss('bgType')==='image'" (click)="setSS('bgType','image');$event.stopPropagation()">Imagen</button>
            </div>
            @if(ss('bgType')==='solid'||ss('bgType')==='linear'){<div class="pf"><label>Color 1</label><app-color-picker [value]="ss('bgColor1')||'#fff'" (valueChange)="setSS('bgColor1',$event)"></app-color-picker></div>}
            @if(ss('bgType')==='linear'){<div class="pf"><label>Color 2</label><app-color-picker [value]="ss('bgColor2')||'#eee'" (valueChange)="setSS('bgColor2',$event)"></app-color-picker></div>}
          </div>
        }

        <div class="accordion" [class.open]="expanded['sec-div']" (click)="toggle('sec-div')"><div class="accordion-header"><span class="material-icons">{{ expanded['sec-div'] ? 'expand_more' : 'chevron_right' }}</span><span>Transición Superior</span></div></div>
        @if (expanded['sec-div']) {
          <div class="accordion-body">
            <div class="btn-row">
              <button class="chip" [class.active]="!ss('dividerType')||ss('dividerType')==='none'" (click)="setSS('dividerType','none');$event.stopPropagation()">Ninguna</button>
              <button class="chip" [class.active]="ss('dividerType')==='wave'" (click)="setSS('dividerType','wave');$event.stopPropagation()">∿ Onda</button>
              <button class="chip" [class.active]="ss('dividerType')==='curve'" (click)="setSS('dividerType','curve');$event.stopPropagation()">⌒ Curva</button>
              <button class="chip" [class.active]="ss('dividerType')==='slant'" (click)="setSS('dividerType','slant');$event.stopPropagation()">╱ Diagonal</button>
              <button class="chip" [class.active]="ss('dividerType')==='zigzag'" (click)="setSS('dividerType','zigzag');$event.stopPropagation()">∧∧ Zigzag</button>
            </div>
          </div>
        }

        <div class="accordion" [class.open]="expanded['sec-txt']" (click)="toggle('sec-txt')"><div class="accordion-header"><span class="material-icons">{{ expanded['sec-txt'] ? 'expand_more' : 'chevron_right' }}</span><span>Colores de Texto</span></div></div>
        @if (expanded['sec-txt']) {
          <div class="accordion-body">
            <div class="pf"><label>Títulos</label><app-color-picker [value]="ss('headingColor')||''" (valueChange)="setSS('headingColor',$event)"></app-color-picker></div>
            <div class="pf"><label>Contenido</label><app-color-picker [value]="ss('contentColor')||''" (valueChange)="setSS('contentColor',$event)"></app-color-picker></div>
            <button class="sm-btn" (click)="clearColors();$event.stopPropagation()">Limpiar</button>
          </div>
        }

        <div class="accordion" [class.open]="expanded['sec-anim']" (click)="toggle('sec-anim')"><div class="accordion-header"><span class="material-icons">{{ expanded['sec-anim'] ? 'expand_more' : 'chevron_right' }}</span><span>Animación</span></div></div>
        @if (expanded['sec-anim']) {
          <div class="accordion-body">
            <div class="btn-row">
              <button class="chip" [class.active]="!ss('animation')||ss('animation')==='inherit'" (click)="setSS('animation','inherit');$event.stopPropagation()">Hereda</button>
              <button class="chip" [class.active]="ss('animation')==='fade-up'" (click)="setSS('animation','fade-up');$event.stopPropagation()">↑ Fade</button>
              <button class="chip" [class.active]="ss('animation')==='scale'" (click)="setSS('animation','scale');$event.stopPropagation()">⊕ Scale</button>
              <button class="chip" [class.active]="ss('animation')==='none'" (click)="setSS('animation','none');$event.stopPropagation()">✕ Ninguna</button>
            </div>
          </div>
        }
      }

      @if (!canvasState.selectedSection()) {
        <div class="empty-state">
          <span class="material-icons">touch_app</span>
          <p>Selecciona una sección</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .props-panel-content { padding: 0; }
    .props-badge { display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(139,92,246,0.06);border-bottom:1px solid rgba(139,92,246,0.1); .material-icons{font-size:16px;color:var(--gold-light)} span:last-child{font-size:13px;font-weight:600;color:white} }
    .accordion { cursor:pointer; }
    .accordion-header { display:flex;align-items:center;gap:6px;padding:9px 14px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.75);border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s; .material-icons{font-size:16px;color:rgba(255,255,255,0.35)} }
    .accordion-header:hover { background:rgba(139,92,246,0.04); }
    .accordion.open .accordion-header { color:white;background:rgba(139,92,246,0.06); .material-icons{color:var(--gold-light)} }
    .accordion-body { padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.04); }
    .pf { margin-bottom:10px; label{display:block;font-size:10px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px} }
    .pinput { width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(139,92,246,0.15);border-radius:6px;padding:7px 10px;color:white;font-size:12px;font-family:var(--font-sans); &:focus{outline:none;border-color:rgba(139,92,246,0.4)} }
    textarea.pinput { resize:vertical; }
    textarea.pinput.sm { min-height:40px; }
    select.pinput { cursor:pointer; }
    .btn-row { display:flex;flex-wrap:wrap;gap:4px; }
    .chip { padding:5px 9px;border-radius:5px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);color:rgba(255,255,255,0.6);font-size:10px;cursor:pointer;transition:all 0.15s;white-space:nowrap; &:hover{background:rgba(139,92,246,0.08);color:white} &.active{background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.4);color:#c084fc;font-weight:600} }
    .upload-row { display:flex;align-items:center;gap:8px; }
    .upload-ok { font-size:11px;color:#10b981; }
    .sm-btn { padding:4px 10px;border-radius:5px;border:1px solid rgba(139,92,246,0.2);background:rgba(139,92,246,0.06);color:rgba(255,255,255,0.7);font-size:10px;cursor:pointer;transition:all 0.15s; &:hover{background:rgba(139,92,246,0.12)} &.danger{border-color:rgba(239,68,68,0.2);color:#ef4444} }
    .tpl-grid { display:grid;grid-template-columns:1fr 1fr;gap:4px; }
    .tpl-btn { padding:8px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:rgba(255,255,255,0.7);font-size:11px;cursor:pointer;transition:all 0.15s; &:hover{background:rgba(139,92,246,0.08);border-color:rgba(139,92,246,0.2)} }
    .items-header { display:flex;justify-content:space-between;align-items:center;margin:8px 0 6px; span{font-size:10px;color:rgba(139,92,246,0.7);text-transform:uppercase;font-weight:700} }
    .item-card { padding:8px;margin-bottom:6px;border-radius:5px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);display:flex;flex-direction:column;gap:4px; }
    .item-head { display:flex;justify-content:space-between;align-items:center;margin-bottom:2px; span{font-size:9px;color:rgba(255,255,255,0.3)} }
    .x-btn { background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:12px;padding:2px; &:hover{color:#ef4444} &.mini{position:absolute;top:2px;right:2px;font-size:10px;background:rgba(0,0,0,0.6);border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center} }
    .photo-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:3px;margin-top:6px; }
    .photo-thumb { position:relative;aspect-ratio:1;border-radius:4px;overflow:hidden; img{width:100%;height:100%;object-fit:cover} }
    .hint { font-size:11px;color:rgba(255,255,255,0.35);margin-top:6px; }
    .empty-state { padding:40px 14px;text-align:center; .material-icons{font-size:32px;color:rgba(139,92,246,0.2);margin-bottom:8px} p{font-size:12px;color:rgba(255,255,255,0.3)} }
  `]
})
export class BuilderPropsPanelComponent {
  canvasState = inject(CanvasStateService);
  private api = inject(ApiService);
  @Input() eventId = 0;
  @Input() photos = signal<any[]>([]);

  expanded: Record<string, boolean> = {};
  cfg = this.canvasState.config;

  get sectionIcon(): string {
    const icons: Record<string,string> = { hero:'image',invitation:'card_giftcard',details:'info',venues:'place',itinerary:'schedule',gallery:'photo_library',dresscode:'checkroom',gifts:'redeem',rsvp:'how_to_reg',envelope:'mail',intro:'auto_awesome' };
    return icons[this.canvasState.selectedSection()||''] || 'layers';
  }
  get sectionLabel(): string {
    const labels: Record<string,string> = { hero:'Carátula',invitation:'Invitación',details:'Detalles',venues:'Lugares',itinerary:'Itinerario',gallery:'Galería',dresscode:'Vestimenta',gifts:'Regalos',rsvp:'Confirmación',envelope:'Pantalla de Inicio',intro:'Intro' };
    return labels[this.canvasState.selectedSection()||''] || '';
  }

  toggle(key: string) { this.expanded[key] = !this.expanded[key]; }

  sec(key: string): any { return (this.cfg() as any)?.[key] || null; }
  setSec(secKey: string, prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    (cfg as any)[secKey][prop] = value;
    this.canvasState.isDirty.set(true);
  }
  ss(prop: string): any {
    const key = this.canvasState.selectedSection(); if (!key) return null;
    return (this.cfg() as any)?.[key]?.sectionStyle?.[prop] ?? null;
  }
  setSS(prop: string, value: any) {
    const key = this.canvasState.selectedSection(); if (!key) return;
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const s = (cfg as any)[key];
    if (!s.sectionStyle) s.sectionStyle = { bgType:'inherit', dividerType:'none' };
    s.sectionStyle[prop] = value;
    this.canvasState.isDirty.set(true);
  }
  clearColors() { this.setSS('headingColor',''); this.setSS('contentColor',''); }
  setTheme(prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    (cfg.theme as any)[prop] = value;
    this.canvasState.isDirty.set(true);
  }
  applyTemplate(key: string) {
    const tpls: Record<string,any> = {
      elegante:{landingBgColor1:'#0d1117',landingBgColor2:'#1a1a2e',landingBgType:'linear',textPrimary:'#ffffff',textSecondary:'rgba(255,255,255,0.7)',navFooterText:'#d4a017',buttonBg:'#d4a017',buttonText:'#1a1a2e',cardBg:'rgba(255,255,255,0.05)',cardBorder:'rgba(212,160,23,0.3)'},
      moderno:{landingBgColor1:'#1e1e32',landingBgColor2:'#2d2d44',landingBgType:'linear',textPrimary:'#ffffff',textSecondary:'rgba(255,255,255,0.7)',navFooterText:'#a78bfa',buttonBg:'#a78bfa',buttonText:'#1a1a2e',cardBg:'rgba(167,139,250,0.08)',cardBorder:'rgba(167,139,250,0.3)'},
      romantico:{landingBgColor1:'#2d1525',landingBgColor2:'#1a0a14',landingBgType:'linear',textPrimary:'#ffffff',textSecondary:'rgba(255,255,255,0.7)',navFooterText:'#f4a7c1',buttonBg:'#f4a7c1',buttonText:'#1a0a14',cardBg:'rgba(244,167,193,0.08)',cardBorder:'rgba(244,167,193,0.3)'},
      festivo:{landingBgColor1:'#1a1a2e',landingBgColor2:'#2d2200',landingBgType:'linear',textPrimary:'#ffffff',textSecondary:'rgba(255,255,255,0.7)',navFooterText:'#fbbf24',buttonBg:'#fbbf24',buttonText:'#1a1a2e',cardBg:'rgba(251,191,36,0.08)',cardBorder:'rgba(251,191,36,0.3)'},
      corporativo:{landingBgColor1:'#0f172a',landingBgColor2:'#1e293b',landingBgType:'linear',textPrimary:'#ffffff',textSecondary:'rgba(255,255,255,0.7)',navFooterText:'#60a5fa',buttonBg:'#60a5fa',buttonText:'#0f172a',cardBg:'rgba(96,165,250,0.08)',cardBorder:'rgba(96,165,250,0.3)'},
    };
    const t = tpls[key]; if(!t) return;
    const cfg = this.canvasState.getConfig(); if(!cfg) return;
    Object.assign(cfg.theme, t);
    this.canvasState.isDirty.set(true);
  }
  upload(secKey: string, prop: string, type: 'images'|'audio'|'gifs') {
    const input = document.createElement('input'); input.type='file';
    input.accept = type==='audio'?'audio/*':'image/*,video/*';
    input.onchange = () => { const f=input.files?.[0]; if(!f)return; this.api.uploadFile(type,f).subscribe({next:r=>this.setSec(secKey,prop,r.url)}); };
    input.click();
  }
  addCard(secKey: string) {
    const cfg = this.canvasState.getConfig(); if(!cfg) return;
    const s = (cfg as any)[secKey];
    if(!s.cards) s.cards=[];
    s.cards.push({id:'c-'+Date.now(),iconType:'none',icon:'',iconUrl:'',title:'Nuevo',content:'',textAlign:'center'});
    this.canvasState.isDirty.set(true);
  }
  removeCard(secKey: string, i: number) {
    const cfg = this.canvasState.getConfig(); if(!cfg) return;
    (cfg as any)[secKey].cards.splice(i,1);
    this.canvasState.isDirty.set(true);
  }
  updateCard(secKey: string, i: number, prop: string, val: any) {
    const cfg = this.canvasState.getConfig(); if(!cfg) return;
    (cfg as any)[secKey].cards[i][prop] = val;
    this.canvasState.isDirty.set(true);
  }
  addVenue() {
    const cfg = this.canvasState.getConfig(); if(!cfg) return;
    if(!cfg.venues.items) cfg.venues.items=[];
    cfg.venues.items.push({id:'v-'+Date.now(),title:'',icon:'place',name:'Nuevo lugar',address:'',time:'',mapsUrl:''});
    this.canvasState.isDirty.set(true);
  }
  removeVenue(i: number) { const cfg=this.canvasState.getConfig();if(!cfg)return;cfg.venues.items.splice(i,1);this.canvasState.isDirty.set(true); }
  updateVenue(i: number,prop: string,val: any) { const cfg=this.canvasState.getConfig();if(!cfg)return;(cfg.venues.items[i] as any)[prop]=val;this.canvasState.isDirty.set(true); }
  addDresscode() {
    const cfg=this.canvasState.getConfig();if(!cfg)return;
    if(!cfg.dresscode.cards)cfg.dresscode.cards=[];
    cfg.dresscode.cards.push({id:'d-'+Date.now(),title:'Nuevo',description:'',images:[]});
    this.canvasState.isDirty.set(true);
  }
  removeDresscode(i: number) { const cfg=this.canvasState.getConfig();if(!cfg||!cfg.dresscode.cards)return;cfg.dresscode.cards.splice(i,1);this.canvasState.isDirty.set(true); }
  updateDresscode(i: number,prop: string,val: any) { const cfg=this.canvasState.getConfig();if(!cfg||!cfg.dresscode.cards?.[i])return;(cfg.dresscode.cards[i] as any)[prop]=val;this.canvasState.isDirty.set(true); }
  uploadPhotos() {
    const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;
    input.onchange=()=>{if(!input.files?.length)return;this.api.uploadPhotos(this.eventId,input.files).subscribe(()=>{this.api.getPhotos(this.eventId).subscribe(p=>this.photos.set(p))})};
    input.click();
  }
  deletePhoto(id: number) { this.api.deletePhoto(this.eventId,id).subscribe(()=>{this.api.getPhotos(this.eventId).subscribe(p=>this.photos.set(p))}); }
}
