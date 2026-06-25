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
        <p class="section-desc">{{ sectionDescription }}</p>
      }
      @if (canvasState.selectedSection() === '_theme') {
        <div class="props-badge"><span class="material-icons">palette</span><span>Tema Global</span></div>
        <p class="section-desc">Colores, fuentes y fondo que aplican a toda la invitacion</p>
      }

      <!-- ===== THEME GLOBAL ===== -->
      @if (canvasState.selectedSection() === '_theme' && cfg()) {
        <div class="accordion" [class.open]="expanded['tpl']" (click)="toggle('tpl')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['tpl'] ? 'expand_more' : 'chevron_right' }}</span><span>Aplicar Template</span></div>
        </div>
        @if (expanded['tpl']) {
          <div class="accordion-body">
            <div class="tpl-grid-2x2">
              <div class="tpl-card" (click)="applyTemplate('elegante');$event.stopPropagation()"><span>Elegante</span></div>
              <div class="tpl-card" (click)="applyTemplate('moderno');$event.stopPropagation()"><span>Moderno</span></div>
              <div class="tpl-card" (click)="applyTemplate('romantico');$event.stopPropagation()"><span>Romantico</span></div>
              <div class="tpl-card" (click)="applyTemplate('festivo');$event.stopPropagation()"><span>Festivo</span></div>
              <div class="tpl-card" (click)="applyTemplate('corporativo');$event.stopPropagation()"><span>Corporativo</span></div>
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
                <option value="solid">Solido</option><option value="linear">Lineal</option><option value="radial">Radial</option><option value="mesh">Difuminado</option>
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
          <div class="accordion-header"><span class="material-icons">{{ expanded['anim'] ? 'expand_more' : 'chevron_right' }}</span><span>Animacion Global</span></div>
        </div>
        @if (expanded['anim']) {
          <div class="accordion-body">
            <div class="btn-row">
              <button class="chip" [class.active]="!cfg()!.theme.scrollAnimation || cfg()!.theme.scrollAnimation === 'fade-up'" (click)="setTheme('scrollAnimation','fade-up');$event.stopPropagation()">Fade Up</button>
              <button class="chip" [class.active]="cfg()!.theme.scrollAnimation === 'fade-in'" (click)="setTheme('scrollAnimation','fade-in');$event.stopPropagation()">Fade In</button>
              <button class="chip" [class.active]="cfg()!.theme.scrollAnimation === 'scale'" (click)="setTheme('scrollAnimation','scale');$event.stopPropagation()">Scale</button>
              <button class="chip" [class.active]="cfg()!.theme.scrollAnimation === 'none'" (click)="setTheme('scrollAnimation','none');$event.stopPropagation()">Ninguna</button>
            </div>
          </div>
        }
      }

      <!-- ===== SECTION PROPERTIES ===== -->
      @if (canvasState.selectedSection() && canvasState.selectedSection() !== '_theme' && cfg()) {

        <!-- ===== ENVELOPE ===== -->
        @if (canvasState.selectedSection() === 'envelope') {
          <div class="accordion" [class.open]="expanded['env-tpl']" (click)="toggle('env-tpl')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-tpl'] ? 'expand_more' : 'chevron_right' }}</span><span>Template</span></div>
          </div>
          @if (expanded['env-tpl']) {
            <div class="accordion-body">
              <div class="tpl-grid-2x2">
                <div class="tpl-card" [class.active]="sec('envelope')?.template==='envelope'" (click)="setSec('envelope','template','envelope');$event.stopPropagation()"><span>Sobre</span></div>
                <div class="tpl-card" [class.active]="sec('envelope')?.template==='ticket'" (click)="setSec('envelope','template','ticket');$event.stopPropagation()"><span>Ticket</span></div>
                <div class="tpl-card" [class.active]="sec('envelope')?.template==='minimal-splash'" (click)="setSec('envelope','template','minimal-splash');$event.stopPropagation()"><span>Splash</span></div>
                <div class="tpl-card" [class.active]="sec('envelope')?.template==='plain'" (click)="setSec('envelope','template','plain');$event.stopPropagation()"><span>Plano</span></div>
              </div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['env-style']" (click)="toggle('env-style')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-style'] ? 'expand_more' : 'chevron_right' }}</span><span>Estilo de Sobre</span></div>
          </div>
          @if (expanded['env-style']) {
            <div class="accordion-body">
              <div class="pf"><label>Estilo</label>
                <select class="pinput" [ngModel]="sec('envelope')?.style||'classic'" (ngModelChange)="setSec('envelope','style',$event)">
                  <option value="classic">Clasico</option><option value="elegant">Elegante</option><option value="vertical">Vertical</option><option value="minimal">Minimal</option><option value="wax">Lacre</option>
                </select>
              </div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['env-seal']" (click)="toggle('env-seal')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-seal'] ? 'expand_more' : 'chevron_right' }}</span><span>Estilo de Sello</span></div>
          </div>
          @if (expanded['env-seal']) {
            <div class="accordion-body">
              <div class="pf"><label>Forma</label>
                <select class="pinput" [ngModel]="sec('envelope')?.sealStyle||'wax-circle'" (ngModelChange)="setSec('envelope','sealStyle',$event)">
                  <option value="wax-circle">Circulo Lacre</option><option value="wax-heart">Corazon Lacre</option><option value="ribbon">Cinta</option><option value="stamp">Estampa</option><option value="monogram">Monograma</option>
                </select>
              </div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['env-colors']" (click)="toggle('env-colors')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-colors'] ? 'expand_more' : 'chevron_right' }}</span><span>Colores</span></div>
          </div>
          @if (expanded['env-colors']) {
            <div class="accordion-body">
              <div class="pf"><label>Color sobre</label><app-color-picker [value]="sec('envelope')?.envelopeColor||'#1a1a2e'" (valueChange)="setSec('envelope','envelopeColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Color sello</label><app-color-picker [value]="sec('envelope')?.sealColor||'#8b0000'" (valueChange)="setSec('envelope','sealColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Color fondo</label><app-color-picker [value]="sec('envelope')?.bgColor||'#0d1117'" (valueChange)="setSec('envelope','bgColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Color fondo 2</label><app-color-picker [value]="sec('envelope')?.bgColor2||'#1a1a2e'" (valueChange)="setSec('envelope','bgColor2',$event)"></app-color-picker></div>
              <div class="pf"><label>Color texto</label><app-color-picker [value]="sec('envelope')?.textColor||'#ffffff'" (valueChange)="setSec('envelope','textColor',$event)"></app-color-picker></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['env-content']" (click)="toggle('env-content')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido del Sello</span></div>
          </div>
          @if (expanded['env-content']) {
            <div class="accordion-body">
              <div class="pf"><label>Tipo de contenido</label>
                <div class="btn-row">
                  <button class="chip" [class.active]="getSealType()==='emoji'" (click)="setSealType('emoji');$event.stopPropagation()">Emoji</button>
                  <button class="chip" [class.active]="getSealType()==='icon'" (click)="setSealType('icon');$event.stopPropagation()">Icono</button>
                  <button class="chip" [class.active]="getSealType()==='none'" (click)="setSealType('none');$event.stopPropagation()">Vacio</button>
                </div>
              </div>
              <div class="pf"><label>Texto sello</label><input class="pinput" [ngModel]="sec('envelope')?.sealText" (ngModelChange)="setSec('envelope','sealText',$event)"></div>
              <div class="pf"><label>Imagen del sello</label>
                <div class="upload-row">
                  @if(sec('envelope')?.sealImage){<span class="file-name">{{getFileName(sec('envelope')?.sealImage)}}</span><button class="sm-btn" (click)="upload('envelope','sealImage','images');$event.stopPropagation()">Cambiar</button><button class="sm-btn danger" (click)="setSec('envelope','sealImage','');$event.stopPropagation()">X</button>}
                  @else{<button class="sm-btn" (click)="upload('envelope','sealImage','images');$event.stopPropagation()">Subir</button>}
                </div>
              </div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['env-instr']" (click)="toggle('env-instr')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-instr'] ? 'expand_more' : 'chevron_right' }}</span><span>Instruccion</span></div>
          </div>
          @if (expanded['env-instr']) {
            <div class="accordion-body">
              <div class="pf"><label>Texto de instruccion</label><input class="pinput" [ngModel]="sec('envelope')?.instructionText" (ngModelChange)="setSec('envelope','instructionText',$event)"></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['env-bg']" (click)="toggle('env-bg')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-bg'] ? 'expand_more' : 'chevron_right' }}</span><span>Fondos</span></div>
          </div>
          @if (expanded['env-bg']) {
            <div class="accordion-body">
              <div class="pf"><label>Fondo (imagen/gif)</label>
                <div class="upload-row">
                  @if(sec('envelope')?.splashImage){<span class="file-name">{{getFileName(sec('envelope')?.splashImage)}}</span><button class="sm-btn" (click)="upload('envelope','splashImage','gifs');$event.stopPropagation()">Cambiar</button><button class="sm-btn danger" (click)="setSec('envelope','splashImage','');$event.stopPropagation()">X</button>}
                  @else{<button class="sm-btn" (click)="upload('envelope','splashImage','gifs');$event.stopPropagation()">Subir</button>}
                </div>
              </div>
            </div>
          }

          <!-- Conditional options per envelope template -->
          @if (sec('envelope')?.template === 'ticket') {
            <div class="accordion" [class.open]="expanded['env-ticket']" (click)="toggle('env-ticket')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['env-ticket'] ? 'expand_more' : 'chevron_right' }}</span><span>Opciones Ticket</span></div>
            </div>
            @if (expanded['env-ticket']) {
              <div class="accordion-body">
                <div class="pf"><label>Titulo ticket</label><input class="pinput" [ngModel]="sec('envelope')?.ticketTitle" (ngModelChange)="setSec('envelope','ticketTitle',$event)"></div>
                <div class="pf"><label>Subtitulo</label><input class="pinput" [ngModel]="sec('envelope')?.ticketSubtitle" (ngModelChange)="setSec('envelope','ticketSubtitle',$event)"></div>
                <div class="pf"><label>Fecha</label><input class="pinput" [ngModel]="sec('envelope')?.ticketDate" (ngModelChange)="setSec('envelope','ticketDate',$event)"></div>
                <div class="pf"><label>Color acento</label><app-color-picker [value]="sec('envelope')?.ticketAccentColor||'#d4a017'" (valueChange)="setSec('envelope','ticketAccentColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Color cuerpo</label><app-color-picker [value]="sec('envelope')?.ticketBodyColor||'#1a1a2e'" (valueChange)="setSec('envelope','ticketBodyColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Color texto</label><app-color-picker [value]="sec('envelope')?.ticketTextColor||'#ffffff'" (valueChange)="setSec('envelope','ticketTextColor',$event)"></app-color-picker></div>
              </div>
            }
          }

          @if (sec('envelope')?.template === 'minimal-splash') {
            <div class="accordion" [class.open]="expanded['env-splash']" (click)="toggle('env-splash')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['env-splash'] ? 'expand_more' : 'chevron_right' }}</span><span>Opciones Splash</span></div>
            </div>
            @if (expanded['env-splash']) {
              <div class="accordion-body">
                <div class="pf"><label>Titulo splash</label><input class="pinput" [ngModel]="sec('envelope')?.splashTitle" (ngModelChange)="setSec('envelope','splashTitle',$event)"></div>
                <div class="pf"><label>Subtitulo</label><input class="pinput" [ngModel]="sec('envelope')?.splashSubtitle" (ngModelChange)="setSec('envelope','splashSubtitle',$event)"></div>
                <div class="pf"><label>Texto boton</label><input class="pinput" [ngModel]="sec('envelope')?.splashButtonText" (ngModelChange)="setSec('envelope','splashButtonText',$event)"></div>
              </div>
            }
          }

          @if (sec('envelope')?.template === 'plain') {
            <div class="accordion" [class.open]="expanded['env-plain']" (click)="toggle('env-plain')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['env-plain'] ? 'expand_more' : 'chevron_right' }}</span><span>Opciones Plano</span></div>
            </div>
            @if (expanded['env-plain']) {
              <div class="accordion-body">
                <div class="pf"><label>Titulo</label><input class="pinput" [ngModel]="sec('envelope')?.plainTitle" (ngModelChange)="setSec('envelope','plainTitle',$event)"></div>
                <div class="pf"><label>Subtitulo</label><input class="pinput" [ngModel]="sec('envelope')?.plainSubtitle" (ngModelChange)="setSec('envelope','plainSubtitle',$event)"></div>
                <div class="pf"><label>Contenido</label><textarea class="pinput" style="min-height:50px" [ngModel]="sec('envelope')?.plainContent" (ngModelChange)="setSec('envelope','plainContent',$event)"></textarea></div>
              </div>
            }
          }
        }

        <!-- ===== INTRO ===== -->
        @if (canvasState.selectedSection() === 'intro') {
          <div class="accordion" [class.open]="expanded['intro-phrase']" (click)="toggle('intro-phrase')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['intro-phrase'] ? 'expand_more' : 'chevron_right' }}</span><span>Frase</span></div>
          </div>
          @if (expanded['intro-phrase']) {
            <div class="accordion-body">
              <div class="pf"><label>Frase</label><textarea class="pinput" style="min-height:50px" [ngModel]="sec('intro')?.phrase" (ngModelChange)="setSec('intro','phrase',$event)"></textarea></div>
              <div class="pf"><label>Fuente</label>
                <select class="pinput" [ngModel]="sec('intro')?.phraseStyle?.fontFamily||'Great Vibes'" (ngModelChange)="setSecNested('intro','phraseStyle','fontFamily',$event)">
                  <option value="Lato">Lato (Sans)</option><option value="Montserrat">Montserrat</option><option value="Raleway">Raleway</option><option value="Josefin Sans">Josefin Sans</option><option value="Playfair Display">Playfair Display</option><option value="Cormorant Garamond">Cormorant Garamond</option><option value="Cinzel">Cinzel</option><option value="Libre Baskerville">Libre Baskerville</option><option value="Great Vibes">Great Vibes</option><option value="Spumoni">Spumoni</option><option value="Dancing Script">Dancing Script</option><option value="Sacramento">Sacramento</option><option value="Tangerine">Tangerine</option><option value="Alex Brush">Alex Brush</option><option value="Pinyon Script">Pinyon Script</option>
                </select>
              </div>
              <div class="pf"><label>Tamano (px)</label><input type="number" class="pinput" [ngModel]="sec('intro')?.phraseStyle?.fontSize||32" (ngModelChange)="setSecNested('intro','phraseStyle','fontSize',+$event)" min="12" max="80"></div>
              <div class="pf"><label>Color</label><app-color-picker [value]="sec('intro')?.phraseStyle?.color||'#ffffff'" (valueChange)="setSecNested('intro','phraseStyle','color',$event)"></app-color-picker></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['intro-bg']" (click)="toggle('intro-bg')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['intro-bg'] ? 'expand_more' : 'chevron_right' }}</span><span>Fondo Multimedia</span></div>
          </div>
          @if (expanded['intro-bg']) {
            <div class="accordion-body">
              <div class="pf"><label>Fondo (imagen/video/gif)</label>
                <div class="upload-row">
                  @if(sec('intro')?.background){<span class="file-name">{{getFileName(sec('intro')?.background)}}</span><button class="sm-btn" (click)="uploadIntroMedia();$event.stopPropagation()">Cambiar</button><button class="sm-btn danger" (click)="setSec('intro','background','');clearMediaDuration();$event.stopPropagation()">X</button>}
                  @else{<button class="sm-btn" (click)="uploadIntroMedia();$event.stopPropagation()">Subir</button>}
                </div>
              </div>
              @if (sec('intro')?.background) {
                <div class="media-info">
                  @if (isVideoFile(sec('intro')?.background)) {
                    <span class="media-badge">Video</span>
                    @if (sec('intro')?.videoDuration) {
                      <span class="media-duration">{{sec('intro')?.videoDuration}}s</span>
                    }
                  } @else {
                    <span class="media-badge">GIF / Imagen (loop)</span>
                  }
                </div>
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['intro-dur']" (click)="toggle('intro-dur')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['intro-dur'] ? 'expand_more' : 'chevron_right' }}</span><span>Duracion y Transicion</span></div>
          </div>
          @if (expanded['intro-dur']) {
            <div class="accordion-body">
              @if (isVideoFile(sec('intro')?.background)) {
                <div class="pf">
                  <div class="toggle-row">
                    <span class="toggle-title">Usar duracion del video</span>
                    <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('intro')?.useVideoDuration" (ngModelChange)="setSec('intro','useVideoDuration',$event)"><span class="slider"></span></label>
                  </div>
                </div>
              }
              @if (!sec('intro')?.useVideoDuration || !isVideoFile(sec('intro')?.background)) {
                <div class="pf"><label>Duracion</label>
                  <div class="stepper-row">
                    <button class="stepper-btn" (click)="adjustDuration(-1);$event.stopPropagation()">-</button>
                    <span class="stepper-value">{{sec('intro')?.duration || 5}} seg</span>
                    <button class="stepper-btn" (click)="adjustDuration(1);$event.stopPropagation()">+</button>
                  </div>
                </div>
              }
              <div class="pf"><label>Transicion de salida</label>
                <select class="pinput" [ngModel]="sec('intro')?.transition||'fade'" (ngModelChange)="setSec('intro','transition',$event)">
                  <option value="fade">Desvanecer</option>
                  <option value="slide-up">Deslizar arriba</option>
                  <option value="slide-down">Deslizar abajo</option>
                  <option value="zoom-in">Zoom acercar</option>
                  <option value="zoom-out">Zoom alejar</option>
                  <option value="blur">Desenfoque</option>
                  <option value="none">Sin transicion</option>
                </select>
              </div>
              <div class="pf">
                <div class="toggle-row">
                  <span class="toggle-title">Boton "Saltar intro"</span>
                  <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('intro')?.showSkip !== false" (ngModelChange)="setSec('intro','showSkip',$event)"><span class="slider"></span></label>
                </div>
              </div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['intro-particles']" (click)="toggle('intro-particles')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['intro-particles'] ? 'expand_more' : 'chevron_right' }}</span><span>Particulas</span></div>
          </div>
          @if (expanded['intro-particles']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Activar particulas</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="getParticlesProp('enabled')" (ngModelChange)="setSecNested('intro','particles','enabled',$event)"><span class="slider"></span></label>
              </div>
              @if (getParticlesProp('enabled')) {
                <div class="pf"><label>Tipo</label>
                  <select class="pinput" [ngModel]="getParticlesProp('type')||'sparkles'" (ngModelChange)="setSecNested('intro','particles','type',$event)">
                    <option value="sparkles">Destellos</option><option value="snow">Nieve</option><option value="fireflies">Luciernagas</option><option value="bubbles">Burbujas</option><option value="stars">Estrellas</option><option value="confetti">Confeti</option>
                  </select>
                </div>
                <div class="pf"><label>Direccion</label>
                  <select class="pinput" [ngModel]="getParticlesProp('direction')||'up'" (ngModelChange)="setSecNested('intro','particles','direction',$event)">
                    <option value="up">Arriba</option><option value="down">Abajo</option><option value="left">Izquierda</option><option value="right">Derecha</option>
                  </select>
                </div>
                <div class="pf"><label>Color 1</label><app-color-picker [value]="getParticlesProp('color1')||'#ffffff'" (valueChange)="setSecNested('intro','particles','color1',$event)"></app-color-picker></div>
                <div class="pf"><label>Color 2</label><app-color-picker [value]="getParticlesProp('color2')||'#d4a017'" (valueChange)="setSecNested('intro','particles','color2',$event)"></app-color-picker></div>
                <div class="pf"><label>Cantidad ({{getParticlesProp('quantity')||30}})</label><input type="range" class="pinput-range" min="5" max="80" [ngModel]="getParticlesProp('quantity')||30" (ngModelChange)="setSecNested('intro','particles','quantity',+$event)"></div>
                <div class="pf"><label>Velocidad ({{getParticlesProp('speed')||5}})</label><input type="range" class="pinput-range" min="1" max="10" [ngModel]="getParticlesProp('speed')||5" (ngModelChange)="setSecNested('intro','particles','speed',+$event)"></div>
                <div class="pf"><label>Tamano ({{getParticlesProp('size')||8}})</label><input type="range" class="pinput-range" min="1" max="20" [ngModel]="getParticlesProp('size')||8" (ngModelChange)="setSecNested('intro','particles','size',+$event)"></div>
                <div class="pf"><label>Opacidad ({{getParticlesProp('opacity')||0.8}})</label><input type="range" class="pinput-range" min="0.1" max="1" step="0.1" [ngModel]="getParticlesProp('opacity')||0.8" (ngModelChange)="setSecNested('intro','particles','opacity',+$event)"></div>
              }
            </div>
          }
        }

        <!-- ===== HERO ===== -->
        @if (canvasState.selectedSection() === 'hero') {
          <div class="accordion" [class.open]="expanded['hero-names']" (click)="toggle('hero-names')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-names'] ? 'expand_more' : 'chevron_right' }}</span><span>Nombres</span></div>
          </div>
          @if (expanded['hero-names']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Mostrar nombres</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('hero')?.showCelebrantNames!==false" (ngModelChange)="setSec('hero','showCelebrantNames',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Nombres</label><input class="pinput" [ngModel]="sec('hero')?.celebrantNames" (ngModelChange)="setSec('hero','celebrantNames',$event)"></div>
              <div class="pf"><label>Fuente</label>
                <select class="pinput" [ngModel]="sec('hero')?.celebrantNamesStyle?.fontFamily||'Great Vibes'" (ngModelChange)="setSecNested('hero','celebrantNamesStyle','fontFamily',$event)">
                  <option value="Lato">Lato (Sans)</option><option value="Montserrat">Montserrat</option><option value="Raleway">Raleway</option><option value="Josefin Sans">Josefin Sans</option><option value="Playfair Display">Playfair Display</option><option value="Cormorant Garamond">Cormorant Garamond</option><option value="Cinzel">Cinzel</option><option value="Libre Baskerville">Libre Baskerville</option><option value="Great Vibes">Great Vibes</option><option value="Spumoni">Spumoni</option><option value="Dancing Script">Dancing Script</option><option value="Sacramento">Sacramento</option><option value="Tangerine">Tangerine</option><option value="Alex Brush">Alex Brush</option><option value="Pinyon Script">Pinyon Script</option>
                </select>
              </div>
              <div class="pf"><label>Tamano (px)</label><input type="number" class="pinput" [ngModel]="sec('hero')?.celebrantNamesStyle?.fontSize||48" (ngModelChange)="setSecNested('hero','celebrantNamesStyle','fontSize',+$event)" min="16" max="120"></div>
              <div class="pf-row">
                <div class="pf-half"><label>Color 1</label><app-color-picker [value]="sec('hero')?.celebrantNamesStyle?.color1||'#ffffff'" (valueChange)="setSecNested('hero','celebrantNamesStyle','color1',$event)"></app-color-picker></div>
                <div class="pf-half"><label>Color 2</label><app-color-picker [value]="sec('hero')?.celebrantNamesStyle?.color2||'#d4a017'" (valueChange)="setSecNested('hero','celebrantNamesStyle','color2',$event)"></app-color-picker></div>
              </div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['hero-event']" (click)="toggle('hero-event')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-event'] ? 'expand_more' : 'chevron_right' }}</span><span>Tipo de Evento</span></div>
          </div>
          @if (expanded['hero-event']) {
            <div class="accordion-body">
              <div class="pf"><label>Descripcion del evento</label><input class="pinput" [ngModel]="sec('hero')?.eventDescription" (ngModelChange)="setSec('hero','eventDescription',$event)"></div>
              <div class="pf"><label>Fuente</label>
                <select class="pinput" [ngModel]="sec('hero')?.eventDescriptionStyle?.fontFamily||'Montserrat'" (ngModelChange)="setSecNested('hero','eventDescriptionStyle','fontFamily',$event)">
                  <option value="Lato">Lato (Sans)</option><option value="Montserrat">Montserrat</option><option value="Raleway">Raleway</option><option value="Josefin Sans">Josefin Sans</option><option value="Playfair Display">Playfair Display</option><option value="Cormorant Garamond">Cormorant Garamond</option><option value="Cinzel">Cinzel</option><option value="Libre Baskerville">Libre Baskerville</option><option value="Great Vibes">Great Vibes</option><option value="Spumoni">Spumoni</option><option value="Dancing Script">Dancing Script</option><option value="Sacramento">Sacramento</option><option value="Tangerine">Tangerine</option><option value="Alex Brush">Alex Brush</option><option value="Pinyon Script">Pinyon Script</option>
                </select>
              </div>
              <div class="pf"><label>Tamano (px)</label><input type="number" class="pinput" [ngModel]="sec('hero')?.eventDescriptionStyle?.fontSize||18" (ngModelChange)="setSecNested('hero','eventDescriptionStyle','fontSize',+$event)" min="10" max="60"></div>
              <div class="pf-row">
                <div class="pf-half"><label>Color 1</label><app-color-picker [value]="sec('hero')?.eventDescriptionStyle?.color1||'#d4a017'" (valueChange)="setSecNested('hero','eventDescriptionStyle','color1',$event)"></app-color-picker></div>
                <div class="pf-half"><label>Color 2</label><app-color-picker [value]="sec('hero')?.eventDescriptionStyle?.color2||'#f4e4a0'" (valueChange)="setSecNested('hero','eventDescriptionStyle','color2',$event)"></app-color-picker></div>
              </div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['hero-phrase']" (click)="toggle('hero-phrase')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-phrase'] ? 'expand_more' : 'chevron_right' }}</span><span>Frase</span></div>
          </div>
          @if (expanded['hero-phrase']) {
            <div class="accordion-body">
              <div class="pf"><label>Frase</label><input class="pinput" [ngModel]="sec('hero')?.heroPhrase" (ngModelChange)="setSec('hero','heroPhrase',$event)"></div>
              <div class="pf"><label>Fuente</label>
                <select class="pinput" [ngModel]="sec('hero')?.heroPhraseStyle?.fontFamily||'Raleway'" (ngModelChange)="setSecNested('hero','heroPhraseStyle','fontFamily',$event)">
                  <option value="Lato">Lato (Sans)</option><option value="Montserrat">Montserrat</option><option value="Raleway">Raleway</option><option value="Josefin Sans">Josefin Sans</option><option value="Playfair Display">Playfair Display</option><option value="Cormorant Garamond">Cormorant Garamond</option><option value="Cinzel">Cinzel</option><option value="Libre Baskerville">Libre Baskerville</option><option value="Great Vibes">Great Vibes</option><option value="Spumoni">Spumoni</option><option value="Dancing Script">Dancing Script</option><option value="Sacramento">Sacramento</option><option value="Tangerine">Tangerine</option><option value="Alex Brush">Alex Brush</option><option value="Pinyon Script">Pinyon Script</option>
                </select>
              </div>
              <div class="pf"><label>Tamano (px)</label><input type="number" class="pinput" [ngModel]="sec('hero')?.heroPhraseStyle?.fontSize||14" (ngModelChange)="setSecNested('hero','heroPhraseStyle','fontSize',+$event)" min="10" max="40"></div>
              <div class="pf"><label>Color</label><app-color-picker [value]="sec('hero')?.heroPhraseStyle?.color||'rgba(255,255,255,0.7)'" (valueChange)="setSecNested('hero','heroPhraseStyle','color',$event)"></app-color-picker></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['hero-desc']" (click)="toggle('hero-desc')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-desc'] ? 'expand_more' : 'chevron_right' }}</span><span>Descripcion</span></div>
          </div>
          @if (expanded['hero-desc']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Mostrar descripcion</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('hero')?.showDescription!==false" (ngModelChange)="setSec('hero','showDescription',$event)"><span class="slider"></span></label>
              </div>
              @if (sec('hero')?.showDescription!==false) {
                <div class="pf"><label>Texto</label><textarea class="pinput" style="min-height:50px" [ngModel]="sec('hero')?.description" (ngModelChange)="setSec('hero','description',$event)"></textarea></div>
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['hero-countdown']" (click)="toggle('hero-countdown')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-countdown'] ? 'expand_more' : 'chevron_right' }}</span><span>Countdown</span></div>
          </div>
          @if (expanded['hero-countdown']) {
            <div class="accordion-body">
              <div class="pf"><label>Fecha</label><input type="datetime-local" class="pinput" [ngModel]="sec('hero')?.countdownDate" (ngModelChange)="setSec('hero','countdownDate',$event)"></div>
              <div class="toggle-row">
                <span class="toggle-title">Fondo cards</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('hero')?.countdownShowCardBg" (ngModelChange)="setSec('hero','countdownShowCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Radio borde ({{sec('hero')?.countdownCardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('hero')?.countdownCardBorderRadius||8" (ngModelChange)="setSec('hero','countdownCardBorderRadius',+$event)"></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['hero-media']" (click)="toggle('hero-media')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-media'] ? 'expand_more' : 'chevron_right' }}</span><span>Multimedia</span></div>
          </div>
          @if (expanded['hero-media']) {
            <div class="accordion-body">
              <div class="pf"><label>Fondo (imagen/video/gif)</label>
                <div class="upload-row">
                  @if(sec('hero')?.backgroundGif){<span class="file-name">{{getFileName(sec('hero')?.backgroundGif)}}</span><button class="sm-btn" (click)="upload('hero','backgroundGif','gifs');$event.stopPropagation()">Cambiar</button><button class="sm-btn danger" (click)="setSec('hero','backgroundGif','');$event.stopPropagation()">X</button>}
                  @else{<button class="sm-btn" (click)="upload('hero','backgroundGif','gifs');$event.stopPropagation()">Subir</button>}
                </div>
              </div>
              <div class="pf"><label>Audio</label>
                <div class="upload-row">
                  @if(sec('hero')?.audioUrl){<span class="file-name">{{getFileName(sec('hero')?.audioUrl)}}</span><button class="sm-btn" (click)="upload('hero','audioUrl','audio');$event.stopPropagation()">Cambiar</button><button class="sm-btn danger" (click)="setSec('hero','audioUrl','');$event.stopPropagation()">X</button>}
                  @else{<button class="sm-btn" (click)="upload('hero','audioUrl','audio');$event.stopPropagation()">Subir</button>}
                </div>
              </div>
            </div>
          }
        }

        <!-- ===== INVITATION ===== -->
        @if (canvasState.selectedSection() === 'invitation') {
          <div class="accordion" [class.open]="expanded['inv-content']" (click)="toggle('inv-content')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['inv-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido</span></div>
          </div>
          @if (expanded['inv-content']) {
            <div class="accordion-body">
              <div class="pf"><label>Titulo</label><input class="pinput" [ngModel]="sec('invitation')?.title" (ngModelChange)="setSec('invitation','title',$event)"></div>
              <div class="pf"><label>Subtitulo</label><textarea class="pinput" style="min-height:50px" [ngModel]="sec('invitation')?.subtitle" (ngModelChange)="setSec('invitation','subtitle',$event)"></textarea></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['inv-cards']" (click)="toggle('inv-cards')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['inv-cards'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
          </div>
          @if (expanded['inv-cards']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('invitation')?.showCardBg" (ngModelChange)="setSec('invitation','showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Radio borde ({{sec('invitation')?.cardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('invitation')?.cardBorderRadius||8" (ngModelChange)="setSec('invitation','cardBorderRadius',+$event)"></div>
            </div>
          }
        }

        <!-- ===== DETAILS ===== -->
        @if (canvasState.selectedSection() === 'details') {
          <div class="accordion" [class.open]="expanded['det-content']" (click)="toggle('det-content')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['det-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido</span></div>
          </div>
          @if (expanded['det-content']) {
            <div class="accordion-body">
              <div class="pf"><label>Titulo</label><input class="pinput" [ngModel]="sec('details')?.title" (ngModelChange)="setSec('details','title',$event)"></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['det-cards']" (click)="toggle('det-cards')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['det-cards'] ? 'expand_more' : 'chevron_right' }}</span><span>Cards de Detalles</span></div>
          </div>
          @if (expanded['det-cards']) {
            <div class="accordion-body">
              <div class="items-header"><span>Cards ({{sec('details')?.cards?.length||0}})</span><button class="sm-btn" (click)="addCard('details');$event.stopPropagation()">+ Agregar</button></div>
              @for (card of sec('details')?.cards||[]; track card.id; let i=$index) {
                <div class="item-card">
                  <div class="item-head"><span>Card {{i+1}}</span><button class="x-btn" (click)="removeCard('details',i);$event.stopPropagation()">X</button></div>
                  <input class="pinput" [ngModel]="card.title" (ngModelChange)="updateCard('details',i,'title',$event)" placeholder="Titulo">
                  <textarea class="pinput sm" [ngModel]="card.content" (ngModelChange)="updateCard('details',i,'content',$event)" placeholder="Contenido"></textarea>
                  <div class="pf"><label>Tipo icono</label>
                    <select class="pinput" [ngModel]="card.iconType||'none'" (ngModelChange)="updateCard('details',i,'iconType',$event)">
                      <option value="emoji">Emoji</option><option value="image">Imagen</option><option value="none">Ninguno</option>
                    </select>
                  </div>
                  @if (card.iconType === 'emoji') {
                    <div class="pf"><label>Emoji</label><input class="pinput" [ngModel]="card.icon" (ngModelChange)="updateCard('details',i,'icon',$event)" placeholder="Emoji"></div>
                  }
                  <div class="pf"><label>Alineacion</label>
                    <select class="pinput" [ngModel]="card.textAlign||'center'" (ngModelChange)="updateCard('details',i,'textAlign',$event)">
                      <option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option>
                    </select>
                  </div>
                </div>
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['det-appear']" (click)="toggle('det-appear')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['det-appear'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
          </div>
          @if (expanded['det-appear']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('details')?.showCardBg" (ngModelChange)="setSec('details','showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Radio borde ({{sec('details')?.cardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('details')?.cardBorderRadius||8" (ngModelChange)="setSec('details','cardBorderRadius',+$event)"></div>
            </div>
          }
        }

        <!-- ===== VENUES ===== -->
        @if (canvasState.selectedSection() === 'venues') {
          <div class="accordion" [class.open]="expanded['ven-list']" (click)="toggle('ven-list')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['ven-list'] ? 'expand_more' : 'chevron_right' }}</span><span>Lugares</span></div>
          </div>
          @if (expanded['ven-list']) {
            <div class="accordion-body">
              <div class="items-header"><span>Lugares ({{sec('venues')?.items?.length||0}})</span><button class="sm-btn" (click)="addVenue();$event.stopPropagation()">+ Agregar</button></div>
              @for (item of sec('venues')?.items||[]; track item.id; let i=$index) {
                <div class="item-card">
                  <div class="item-head"><span>Lugar {{i+1}}</span><button class="x-btn" (click)="removeVenue(i);$event.stopPropagation()">X</button></div>
                  <input class="pinput" [ngModel]="item.name" (ngModelChange)="updateVenue(i,'name',$event)" placeholder="Nombre">
                  <input class="pinput" [ngModel]="item.address" (ngModelChange)="updateVenue(i,'address',$event)" placeholder="Direccion">
                  <input class="pinput" [ngModel]="item.time" (ngModelChange)="updateVenue(i,'time',$event)" placeholder="Hora">
                  <input class="pinput" [ngModel]="item.mapsUrl" (ngModelChange)="updateVenue(i,'mapsUrl',$event)" placeholder="Link Google Maps">
                  <div class="pf"><label>Icono (emoji)</label><input class="pinput" [ngModel]="item.icon" (ngModelChange)="updateVenue(i,'icon',$event)" placeholder="Icono"></div>
                </div>
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['ven-appear']" (click)="toggle('ven-appear')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['ven-appear'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
          </div>
          @if (expanded['ven-appear']) {
            <div class="accordion-body">
              <div class="pf"><label>Estilo de icono</label>
                <select class="pinput" [ngModel]="sec('venues')?.iconStyle||'circle'" (ngModelChange)="setSec('venues','iconStyle',$event)">
                  <option value="circle">Circulo</option><option value="plain">Plano</option><option value="none">Sin icono</option>
                </select>
              </div>
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('venues')?.showCardBg" (ngModelChange)="setSec('venues','showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Radio borde ({{sec('venues')?.cardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('venues')?.cardBorderRadius||8" (ngModelChange)="setSec('venues','cardBorderRadius',+$event)"></div>
            </div>
          }
        }

        <!-- ===== ITINERARY ===== -->
        @if (canvasState.selectedSection() === 'itinerary') {
          <div class="accordion" [class.open]="expanded['itin-content']" (click)="toggle('itin-content')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['itin-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido</span></div>
          </div>
          @if (expanded['itin-content']) {
            <div class="accordion-body">
              <div class="pf"><label>Titulo</label><input class="pinput" [ngModel]="sec('itinerary')?.title" (ngModelChange)="setSec('itinerary','title',$event)"></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['itin-items']" (click)="toggle('itin-items')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['itin-items'] ? 'expand_more' : 'chevron_right' }}</span><span>Actividades</span></div>
          </div>
          @if (expanded['itin-items']) {
            <div class="accordion-body">
              <div class="items-header"><span>Actividades ({{itineraryItems().length}})</span><button class="sm-btn" (click)="addItineraryItem();$event.stopPropagation()">+ Agregar</button></div>
              @for (item of itineraryItems(); track item.id; let i=$index) {
                <div class="item-card">
                  <div class="item-head"><span>{{i+1}}</span><button class="x-btn" (click)="removeItineraryItem(i);$event.stopPropagation()">X</button></div>
                  <input class="pinput" [ngModel]="item.time" (ngModelChange)="updateItineraryItem(i,'time',$event)" placeholder="Hora">
                  <input class="pinput" [ngModel]="item.title" (ngModelChange)="updateItineraryItem(i,'title',$event)" placeholder="Titulo">
                  <textarea class="pinput sm" [ngModel]="item.description" (ngModelChange)="updateItineraryItem(i,'description',$event)" placeholder="Descripcion"></textarea>
                  <div class="pf"><label>Emoji</label><input class="pinput" [ngModel]="item.icon" (ngModelChange)="updateItineraryItem(i,'icon',$event)" placeholder="Emoji"></div>
                </div>
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['itin-appear']" (click)="toggle('itin-appear')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['itin-appear'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
          </div>
          @if (expanded['itin-appear']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('itinerary')?.showCardBg" (ngModelChange)="setSec('itinerary','showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Radio borde ({{sec('itinerary')?.cardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('itinerary')?.cardBorderRadius||8" (ngModelChange)="setSec('itinerary','cardBorderRadius',+$event)"></div>
            </div>
          }
        }

        <!-- ===== GALLERY ===== -->
        @if (canvasState.selectedSection() === 'gallery') {
          <div class="accordion" [class.open]="expanded['gal-content']" (click)="toggle('gal-content')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['gal-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido</span></div>
          </div>
          @if (expanded['gal-content']) {
            <div class="accordion-body">
              <div class="pf"><label>Titulo</label><input class="pinput" [ngModel]="sec('gallery')?.title" (ngModelChange)="setSec('gallery','title',$event)"></div>
              <div class="pf"><label>Descripcion</label><textarea class="pinput" style="min-height:40px" [ngModel]="sec('gallery')?.description" (ngModelChange)="setSec('gallery','description',$event)"></textarea></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['gal-style']" (click)="toggle('gal-style')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['gal-style'] ? 'expand_more' : 'chevron_right' }}</span><span>Estilo de Galeria</span></div>
          </div>
          @if (expanded['gal-style']) {
            <div class="accordion-body">
              <div class="btn-row">
                <button class="chip" [class.active]="sec('gallery')?.displayStyle==='carousel-3d'||!sec('gallery')?.displayStyle" (click)="setSec('gallery','displayStyle','carousel-3d');$event.stopPropagation()">Carrusel 3D</button>
                <button class="chip" [class.active]="sec('gallery')?.displayStyle==='carousel-vertical'" (click)="setSec('gallery','displayStyle','carousel-vertical');$event.stopPropagation()">Vertical</button>
                <button class="chip" [class.active]="sec('gallery')?.displayStyle==='coverflow'" (click)="setSec('gallery','displayStyle','coverflow');$event.stopPropagation()">Coverflow</button>
                <button class="chip" [class.active]="sec('gallery')?.displayStyle==='stack'" (click)="setSec('gallery','displayStyle','stack');$event.stopPropagation()">Stack</button>
                <button class="chip" [class.active]="sec('gallery')?.displayStyle==='flip'" (click)="setSec('gallery','displayStyle','flip');$event.stopPropagation()">Flip</button>
                <button class="chip" [class.active]="sec('gallery')?.displayStyle==='polaroid'" (click)="setSec('gallery','displayStyle','polaroid');$event.stopPropagation()">Polaroid</button>
                <button class="chip" [class.active]="sec('gallery')?.displayStyle==='grid'" (click)="setSec('gallery','displayStyle','grid');$event.stopPropagation()">Mosaico</button>
                <button class="chip" [class.active]="sec('gallery')?.displayStyle==='slideshow'" (click)="setSec('gallery','displayStyle','slideshow');$event.stopPropagation()">Slideshow</button>
              </div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['gal-photos']" (click)="toggle('gal-photos')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['gal-photos'] ? 'expand_more' : 'chevron_right' }}</span><span>Fotos</span></div>
          </div>
          @if (expanded['gal-photos']) {
            <div class="accordion-body">
              <div class="items-header"><span>Fotos ({{photos().length}})</span><button class="sm-btn" (click)="uploadPhotos();$event.stopPropagation()">+ Subir</button></div>
              <div class="photo-grid">
                @for(p of photos();track p.id){
                  <div class="photo-thumb"><img [src]="p.url"><button class="x-btn mini" (click)="deletePhoto(p.id);$event.stopPropagation()">X</button></div>
                }
              </div>
            </div>
          }
        }

        <!-- ===== DRESSCODE ===== -->
        @if (canvasState.selectedSection() === 'dresscode') {
          <div class="accordion" [class.open]="expanded['dress-content']" (click)="toggle('dress-content')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['dress-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido</span></div>
          </div>
          @if (expanded['dress-content']) {
            <div class="accordion-body">
              <div class="pf"><label>Titulo</label><input class="pinput" [ngModel]="sec('dresscode')?.title" (ngModelChange)="setSec('dresscode','title',$event)"></div>
              <div class="pf"><label>Descripcion</label><textarea class="pinput" style="min-height:40px" [ngModel]="sec('dresscode')?.description" (ngModelChange)="setSec('dresscode','description',$event)"></textarea></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['dress-cards']" (click)="toggle('dress-cards')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['dress-cards'] ? 'expand_more' : 'chevron_right' }}</span><span>Ejemplos</span></div>
          </div>
          @if (expanded['dress-cards']) {
            <div class="accordion-body">
              <div class="items-header"><span>Cards ({{sec('dresscode')?.cards?.length||0}})</span><button class="sm-btn" (click)="addDresscode();$event.stopPropagation()">+ Agregar</button></div>
              @for (card of sec('dresscode')?.cards||[]; track card.id; let i=$index) {
                <div class="item-card">
                  <div class="item-head"><span>{{i+1}}</span><button class="x-btn" (click)="removeDresscode(i);$event.stopPropagation()">X</button></div>
                  <input class="pinput" [ngModel]="card.title" (ngModelChange)="updateDresscode(i,'title',$event)" placeholder="Titulo">
                  <textarea class="pinput sm" [ngModel]="card.description" (ngModelChange)="updateDresscode(i,'description',$event)" placeholder="Descripcion"></textarea>
                </div>
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['dress-appear']" (click)="toggle('dress-appear')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['dress-appear'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
          </div>
          @if (expanded['dress-appear']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('dresscode')?.showCardBg" (ngModelChange)="setSec('dresscode','showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Radio borde ({{sec('dresscode')?.cardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('dresscode')?.cardBorderRadius||8" (ngModelChange)="setSec('dresscode','cardBorderRadius',+$event)"></div>
            </div>
          }
        }

        <!-- ===== GIFTS ===== -->
        @if (canvasState.selectedSection() === 'gifts') {
          <div class="accordion" [class.open]="expanded['gifts-list']" (click)="toggle('gifts-list')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['gifts-list'] ? 'expand_more' : 'chevron_right' }}</span><span>Lista de Regalos</span></div>
          </div>
          @if (expanded['gifts-list']) {
            <div class="accordion-body">
              <div class="pf"><label>Titulo</label><input class="pinput" [ngModel]="sec('gifts')?.title" (ngModelChange)="setSec('gifts','title',$event)"></div>
              <div class="pf"><label>Descripcion</label><textarea class="pinput" style="min-height:40px" [ngModel]="sec('gifts')?.description" (ngModelChange)="setSec('gifts','description',$event)"></textarea></div>
              <div class="pf"><label>Link</label><input class="pinput" [ngModel]="sec('gifts')?.link" (ngModelChange)="setSec('gifts','link',$event)" placeholder="https://..."></div>
              <div class="pf"><label>Texto del boton</label><input class="pinput" [ngModel]="sec('gifts')?.buttonText" (ngModelChange)="setSec('gifts','buttonText',$event)"></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['gifts-transfer']" (click)="toggle('gifts-transfer')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['gifts-transfer'] ? 'expand_more' : 'chevron_right' }}</span><span>Transferencia Bancaria</span></div>
          </div>
          @if (expanded['gifts-transfer']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Activar transferencia</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('gifts')?.transfer?.enabled" (ngModelChange)="setSecNested('gifts','transfer','enabled',$event)"><span class="slider"></span></label>
              </div>
              @if (sec('gifts')?.transfer?.enabled) {
                <div class="pf"><label>Titulo</label><input class="pinput" [ngModel]="sec('gifts')?.transfer?.title" (ngModelChange)="setSecNested('gifts','transfer','title',$event)"></div>
                <div class="pf"><label>Descripcion</label><textarea class="pinput sm" [ngModel]="sec('gifts')?.transfer?.description" (ngModelChange)="setSecNested('gifts','transfer','description',$event)"></textarea></div>
                <div class="pf"><label>Titular</label><input class="pinput" [ngModel]="sec('gifts')?.transfer?.accountName" (ngModelChange)="setSecNested('gifts','transfer','accountName',$event)"></div>
                <div class="pf"><label>Banco</label><input class="pinput" [ngModel]="sec('gifts')?.transfer?.bank" (ngModelChange)="setSecNested('gifts','transfer','bank',$event)"></div>
                <div class="pf"><label>Tipo de cuenta</label>
                  <select class="pinput" [ngModel]="sec('gifts')?.transfer?.accountType||'cuenta'" (ngModelChange)="setSecNested('gifts','transfer','accountType',$event)">
                    <option value="tarjeta">Tarjeta</option><option value="cuenta">Cuenta</option><option value="clabe">CLABE</option>
                  </select>
                </div>
                <div class="pf"><label>Numero</label><input class="pinput" [ngModel]="sec('gifts')?.transfer?.accountNumber" (ngModelChange)="setSecNested('gifts','transfer','accountNumber',$event)"></div>
                <div class="pf"><label>Animacion</label>
                  <select class="pinput" [ngModel]="sec('gifts')?.transfer?.animation||'none'" (ngModelChange)="setSecNested('gifts','transfer','animation',$event)">
                    <option value="coins">Monedas</option><option value="bills">Billetes</option><option value="none">Ninguna</option>
                  </select>
                </div>
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['gifts-appear']" (click)="toggle('gifts-appear')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['gifts-appear'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
          </div>
          @if (expanded['gifts-appear']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('gifts')?.showCardBg" (ngModelChange)="setSec('gifts','showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Radio borde ({{sec('gifts')?.cardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('gifts')?.cardBorderRadius||8" (ngModelChange)="setSec('gifts','cardBorderRadius',+$event)"></div>
            </div>
          }
        }

        <!-- ===== RSVP ===== -->
        @if (canvasState.selectedSection() === 'rsvp') {
          <div class="accordion" [class.open]="expanded['rsvp-content']" (click)="toggle('rsvp-content')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['rsvp-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido</span></div>
          </div>
          @if (expanded['rsvp-content']) {
            <div class="accordion-body">
              <div class="pf"><label>Titulo</label><input class="pinput" [ngModel]="sec('rsvp')?.title" (ngModelChange)="setSec('rsvp','title',$event)"></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['rsvp-appear']" (click)="toggle('rsvp-appear')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['rsvp-appear'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
          </div>
          @if (expanded['rsvp-appear']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('rsvp')?.showCardBg" (ngModelChange)="setSec('rsvp','showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Radio borde ({{sec('rsvp')?.cardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('rsvp')?.cardBorderRadius||8" (ngModelChange)="setSec('rsvp','cardBorderRadius',+$event)"></div>
            </div>
          }
        }

        <!-- ===== COMMON SECTION STYLE (excluded for envelope, intro, hero) ===== -->
        @if (canvasState.selectedSection() !== 'envelope' && canvasState.selectedSection() !== 'intro' && canvasState.selectedSection() !== 'hero') {
          <div class="section-style-toggle">
            <div class="toggle-row" (click)="toggleSectionStyle();$event.stopPropagation()">
              <span class="toggle-title">Estilo de Seccion</span>
              <label class="toggle-switch"><input type="checkbox" [ngModel]="hasSectionStyle()" (ngModelChange)="toggleSectionStyle()"><span class="slider"></span></label>
            </div>
          </div>

          @if (hasSectionStyle()) {
            <div class="accordion" [class.open]="expanded['sec-bg']" (click)="toggle('sec-bg')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['sec-bg'] ? 'expand_more' : 'chevron_right' }}</span><span>Fondo de Seccion</span></div>
            </div>
            @if (expanded['sec-bg']) {
              <div class="accordion-body">
                <div class="btn-row">
                  <button class="chip" [class.active]="!ss('bgType')||ss('bgType')==='inherit'" (click)="setSS('bgType','inherit');$event.stopPropagation()">Hereda</button>
                  <button class="chip" [class.active]="ss('bgType')==='solid'" (click)="setSS('bgType','solid');$event.stopPropagation()">Solido</button>
                  <button class="chip" [class.active]="ss('bgType')==='linear'" (click)="setSS('bgType','linear');$event.stopPropagation()">Degradado</button>
                  <button class="chip" [class.active]="ss('bgType')==='image'" (click)="setSS('bgType','image');$event.stopPropagation()">Imagen</button>
                </div>
                @if(ss('bgType')==='solid'||ss('bgType')==='linear'){<div class="pf"><label>Color 1</label><app-color-picker [value]="ss('bgColor1')||'#fff'" (valueChange)="setSS('bgColor1',$event)"></app-color-picker></div>}
                @if(ss('bgType')==='linear'){<div class="pf"><label>Color 2</label><app-color-picker [value]="ss('bgColor2')||'#eee'" (valueChange)="setSS('bgColor2',$event)"></app-color-picker></div>}
              </div>
            }

            <div class="accordion" [class.open]="expanded['sec-div']" (click)="toggle('sec-div')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['sec-div'] ? 'expand_more' : 'chevron_right' }}</span><span>Transicion Superior</span></div>
            </div>
            @if (expanded['sec-div']) {
              <div class="accordion-body">
                <div class="btn-row">
                  <button class="chip" [class.active]="!ss('dividerType')||ss('dividerType')==='none'" (click)="setSS('dividerType','none');$event.stopPropagation()">Ninguna</button>
                  <button class="chip" [class.active]="ss('dividerType')==='wave'" (click)="setSS('dividerType','wave');$event.stopPropagation()">Onda</button>
                  <button class="chip" [class.active]="ss('dividerType')==='curve'" (click)="setSS('dividerType','curve');$event.stopPropagation()">Curva</button>
                  <button class="chip" [class.active]="ss('dividerType')==='slant'" (click)="setSS('dividerType','slant');$event.stopPropagation()">Diagonal</button>
                  <button class="chip" [class.active]="ss('dividerType')==='zigzag'" (click)="setSS('dividerType','zigzag');$event.stopPropagation()">Zigzag</button>
                </div>
              </div>
            }

            <div class="accordion" [class.open]="expanded['sec-txt']" (click)="toggle('sec-txt')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['sec-txt'] ? 'expand_more' : 'chevron_right' }}</span><span>Colores de Texto</span></div>
            </div>
            @if (expanded['sec-txt']) {
              <div class="accordion-body">
                <div class="pf"><label>Titulos</label><app-color-picker [value]="ss('headingColor')||''" (valueChange)="setSS('headingColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Contenido</label><app-color-picker [value]="ss('contentColor')||''" (valueChange)="setSS('contentColor',$event)"></app-color-picker></div>
                <button class="sm-btn" (click)="clearColors();$event.stopPropagation()">Limpiar</button>
              </div>
            }

            <div class="accordion" [class.open]="expanded['sec-anim']" (click)="toggle('sec-anim')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['sec-anim'] ? 'expand_more' : 'chevron_right' }}</span><span>Animacion</span></div>
            </div>
            @if (expanded['sec-anim']) {
              <div class="accordion-body">
                <div class="btn-row">
                  <button class="chip" [class.active]="!ss('animation')||ss('animation')==='inherit'" (click)="setSS('animation','inherit');$event.stopPropagation()">Hereda</button>
                  <button class="chip" [class.active]="ss('animation')==='fade-up'" (click)="setSS('animation','fade-up');$event.stopPropagation()">Fade Up</button>
                  <button class="chip" [class.active]="ss('animation')==='scale'" (click)="setSS('animation','scale');$event.stopPropagation()">Scale</button>
                  <button class="chip" [class.active]="ss('animation')==='none'" (click)="setSS('animation','none');$event.stopPropagation()">Ninguna</button>
                </div>
              </div>
            }
          }
        }
      }

      @if (!canvasState.selectedSection()) {
        <div class="empty-state">
          <span class="material-icons">touch_app</span>
          <p>Selecciona una seccion</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; overflow-y: auto; }
    .props-panel-content { padding: 0; padding-bottom: 60px; }
    .props-badge { display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(139,92,246,0.06);border-bottom:1px solid rgba(139,92,246,0.1); .material-icons{font-size:16px;color:var(--gold-light)} span:last-child{font-size:13px;font-weight:600;color:white} }
    .section-desc { font-size:11px;color:rgba(255,255,255,0.4);padding:4px 14px 8px;margin:0;border-bottom:1px solid rgba(255,255,255,0.04); }
    .accordion { cursor:pointer; }
    .accordion-header { display:flex;align-items:center;gap:6px;padding:9px 14px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.75);border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s; .material-icons{font-size:16px;color:rgba(255,255,255,0.35)} }
    .accordion-header:hover { background:rgba(139,92,246,0.04); }
    .accordion.open .accordion-header { color:white;background:rgba(139,92,246,0.06); .material-icons{color:var(--gold-light)} }
    .accordion-body { padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.04); }
    .pf { margin-bottom:10px; label{display:block;font-size:10px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px} }
    .pf-row { display:flex;gap:8px;margin-bottom:10px; }
    .pf-half { flex:1; label{display:block;font-size:10px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px} }
    .pinput { width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(139,92,246,0.15);border-radius:6px;padding:7px 10px;color:white;font-size:12px;font-family:var(--font-sans); &:focus{outline:none;border-color:rgba(139,92,246,0.4)} }
    .pinput-range { width:100%;accent-color:#8b5cf6;cursor:pointer; }
    textarea.pinput { resize:vertical; }
    textarea.pinput.sm { min-height:40px; }
    select.pinput { cursor:pointer; }
    .btn-row { display:flex;flex-wrap:wrap;gap:4px; }
    .chip { padding:5px 9px;border-radius:5px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);color:rgba(255,255,255,0.6);font-size:10px;cursor:pointer;transition:all 0.15s;white-space:nowrap; &:hover{background:rgba(139,92,246,0.08);color:white} &.active{background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.4);color:#c084fc;font-weight:600} }
    .upload-row { display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
    .upload-ok { font-size:11px;color:#10b981; }
    .file-name { font-size:10px;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.05);padding:4px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
    .sm-btn { padding:4px 10px;border-radius:5px;border:1px solid rgba(139,92,246,0.2);background:rgba(139,92,246,0.06);color:rgba(255,255,255,0.7);font-size:10px;cursor:pointer;transition:all 0.15s; &:hover{background:rgba(139,92,246,0.12)} &.danger{border-color:rgba(239,68,68,0.2);color:#ef4444} }
    .tpl-grid-2x2 { display:grid;grid-template-columns:1fr 1fr;gap:4px; }
    .tpl-card { padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:rgba(255,255,255,0.7);font-size:11px;cursor:pointer;transition:all 0.15s;text-align:center; &:hover{background:rgba(139,92,246,0.08);border-color:rgba(139,92,246,0.2)} &.active{background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.4);color:#c084fc;font-weight:600} }
    .toggle-row { display:flex;justify-content:space-between;align-items:center;padding:6px 0;margin-bottom:8px; }
    .toggle-title { font-size:11px;color:rgba(255,255,255,0.7);font-weight:500; }
    .toggle-switch { position:relative;display:inline-block;width:34px;height:18px;cursor:pointer; input{opacity:0;width:0;height:0} .slider{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.15);border-radius:9px;transition:0.2s} .slider::before{content:'';position:absolute;height:14px;width:14px;left:2px;bottom:2px;background:white;border-radius:50%;transition:0.2s} input:checked+.slider{background:#8b5cf6} input:checked+.slider::before{transform:translateX(16px)} }
    .section-style-toggle { padding:12px 14px;border-top:1px solid rgba(139,92,246,0.1);margin-top:8px; }
    .items-header { display:flex;justify-content:space-between;align-items:center;margin:8px 0 6px; span{font-size:10px;color:rgba(139,92,246,0.7);text-transform:uppercase;font-weight:700} }
    .item-card { padding:8px;margin-bottom:6px;border-radius:5px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);display:flex;flex-direction:column;gap:4px; }
    .item-head { display:flex;justify-content:space-between;align-items:center;margin-bottom:2px; span{font-size:9px;color:rgba(255,255,255,0.3)} }
    .x-btn { background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:12px;padding:2px; &:hover{color:#ef4444} &.mini{position:absolute;top:2px;right:2px;font-size:10px;background:rgba(0,0,0,0.6);border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center} }
    .photo-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:3px;margin-top:6px; }
    .photo-thumb { position:relative;aspect-ratio:1;border-radius:4px;overflow:hidden; img{width:100%;height:100%;object-fit:cover} }
    .hint { font-size:11px;color:rgba(255,255,255,0.35);margin-top:6px; }
    .empty-state { padding:40px 14px;text-align:center; .material-icons{font-size:32px;color:rgba(255,255,255,0.15)} p{font-size:12px;color:rgba(255,255,255,0.3);margin-top:8px} }
    .stepper-row { display:flex;align-items:center;gap:0;border:1px solid rgba(139,92,246,0.2);border-radius:6px;overflow:hidden; }
    .stepper-btn { width:36px;height:34px;border:none;background:rgba(139,92,246,0.1);color:white;font-size:16px;font-weight:700;cursor:pointer;transition:background 0.15s; &:hover{background:rgba(139,92,246,0.25)} &:active{background:rgba(139,92,246,0.35)} }
    .stepper-value { flex:1;text-align:center;font-size:13px;font-weight:600;color:white;padding:6px 8px;background:rgba(255,255,255,0.03); }
    .media-info { display:flex;align-items:center;gap:8px;margin-top:8px;padding:6px 10px;background:rgba(139,92,246,0.06);border-radius:5px;border:1px solid rgba(139,92,246,0.1); }
    .media-badge { font-size:10px;color:rgba(139,92,246,0.9);font-weight:600;text-transform:uppercase;letter-spacing:0.3px; }
    .media-duration { font-size:11px;color:rgba(255,255,255,0.5);margin-left:auto; }
  `]
})
export class BuilderPropsPanelComponent {
  canvasState = inject(CanvasStateService);
  private api = inject(ApiService);
  @Input() eventId = 0;
  @Input() photos = signal<any[]>([]);
  @Input() itineraryItems = signal<any[]>([]);
  @Input() selectedSection: string | null = null;
  @Input() config: any = null;

  expanded: Record<string, boolean> = {};
  cfg = this.canvasState.config;

  readonly fontOptions = [
    'Lato','Montserrat','Raleway','Josefin Sans','Playfair Display',
    'Cormorant Garamond','Cinzel','Libre Baskerville','Great Vibes',
    'Spumoni','Dancing Script','Sacramento','Tangerine','Alex Brush','Pinyon Script'
  ];

  get sectionIcon(): string {
    const icons: Record<string,string> = { hero:'image',invitation:'card_giftcard',details:'info',venues:'place',itinerary:'schedule',gallery:'photo_library',dresscode:'checkroom',gifts:'redeem',rsvp:'how_to_reg',envelope:'mail',intro:'auto_awesome' };
    return icons[this.canvasState.selectedSection()||''] || 'layers';
  }

  get sectionLabel(): string {
    const labels: Record<string,string> = { hero:'Caratula',invitation:'Invitacion',details:'Detalles',venues:'Lugares',itinerary:'Itinerario',gallery:'Galeria',dresscode:'Vestimenta',gifts:'Regalos',rsvp:'Confirmacion',envelope:'Pantalla de Inicio',intro:'Intro' };
    return labels[this.canvasState.selectedSection()||''] || '';
  }

  get sectionDescription(): string {
    const descs: Record<string,string> = {
      hero:'Imagen principal, nombres y cuenta regresiva',
      invitation:'Texto de bienvenida e invitacion formal',
      details:'Cards con informacion adicional del evento',
      venues:'Lugares del evento con mapa y horario',
      itinerary:'Agenda de actividades del evento',
      gallery:'Fotos y estilo de presentacion',
      dresscode:'Codigo de vestimenta y ejemplos',
      gifts:'Mesa de regalos y datos bancarios',
      rsvp:'Formulario de confirmacion de asistencia',
      envelope:'Pantalla de apertura antes de la invitacion',
      intro:'Animacion introductoria con frase'
    };
    return descs[this.canvasState.selectedSection()||''] || '';
  }

  toggle(key: string) { this.expanded[key] = !this.expanded[key]; }

  sec(key: string): any { return (this.cfg() as any)?.[key] || null; }

  setSec(secKey: string, prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!(cfg as any)[secKey]) (cfg as any)[secKey] = {};
    (cfg as any)[secKey][prop] = value;
    this.canvasState.isDirty.set(true);
  }

  setSecNested(secKey: string, nestedKey: string, prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!(cfg as any)[secKey]) (cfg as any)[secKey] = {};
    if (!(cfg as any)[secKey][nestedKey]) (cfg as any)[secKey][nestedKey] = {};
    (cfg as any)[secKey][nestedKey][prop] = value;
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

  hasSectionStyle(): boolean {
    const key = this.canvasState.selectedSection(); if (!key) return false;
    return !!(this.cfg() as any)?.[key]?.sectionStyle;
  }

  toggleSectionStyle() {
    const key = this.canvasState.selectedSection(); if (!key) return;
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const s = (cfg as any)[key];
    if (s.sectionStyle) {
      delete s.sectionStyle;
    } else {
      s.sectionStyle = { bgType: 'inherit', dividerType: 'none' };
    }
    this.canvasState.isDirty.set(true);
  }

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

  removeVenue(i: number) {
    const cfg=this.canvasState.getConfig();if(!cfg)return;
    cfg.venues.items.splice(i,1);
    this.canvasState.isDirty.set(true);
  }

  updateVenue(i: number, prop: string, val: any) {
    const cfg=this.canvasState.getConfig();if(!cfg)return;
    (cfg.venues.items[i] as any)[prop]=val;
    this.canvasState.isDirty.set(true);
  }

  addDresscode() {
    const cfg=this.canvasState.getConfig();if(!cfg)return;
    if(!cfg.dresscode.cards)cfg.dresscode.cards=[];
    cfg.dresscode.cards.push({id:'d-'+Date.now(),title:'Nuevo',description:'',images:[]});
    this.canvasState.isDirty.set(true);
  }

  removeDresscode(i: number) {
    const cfg=this.canvasState.getConfig();if(!cfg||!cfg.dresscode.cards)return;
    cfg.dresscode.cards.splice(i,1);
    this.canvasState.isDirty.set(true);
  }

  updateDresscode(i: number, prop: string, val: any) {
    const cfg=this.canvasState.getConfig();if(!cfg||!cfg.dresscode.cards?.[i])return;
    (cfg.dresscode.cards[i] as any)[prop]=val;
    this.canvasState.isDirty.set(true);
  }

  uploadPhotos() {
    const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;
    input.onchange=()=>{if(!input.files?.length)return;this.api.uploadPhotos(this.eventId,input.files).subscribe(()=>{this.api.getPhotos(this.eventId).subscribe(p=>this.photos.set(p))})};
    input.click();
  }

  deletePhoto(id: number) {
    this.api.deletePhoto(this.eventId,id).subscribe(()=>{this.api.getPhotos(this.eventId).subscribe(p=>this.photos.set(p))});
  }

  addItineraryItem() {
    this.api.addItineraryItem(this.eventId, {
      time: '', title: 'Nueva actividad', description: '', icon: 'reloj', iconType: 'emoji', sort_order: this.itineraryItems().length
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
    this.api.updateItineraryItem(this.eventId, item.id, { [prop]: value }).subscribe();
  }

  loadItinerary() {
    this.api.getItinerary(this.eventId).subscribe(items => this.itineraryItems.set(items));
  }

  getParticlesProp(prop: string): any {
    return this.sec('intro')?.particles?.[prop] ?? null;
  }

  getSealType(): string {
    const seal = this.sec('envelope');
    if (!seal) return 'none';
    if (seal.sealImage) return 'icon';
    if (seal.sealText) return 'emoji';
    return 'none';
  }

  setSealType(type: string) {
    if (type === 'none') {
      this.setSec('envelope','sealText','');
      this.setSec('envelope','sealImage','');
    } else if (type === 'emoji') {
      this.setSec('envelope','sealImage','');
    } else if (type === 'icon') {
      this.setSec('envelope','sealText','');
    }
  }

  isVideoFile(url: string): boolean {
    if (!url) return false;
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'ogg'].includes(ext);
  }

  adjustDuration(delta: number) {
    const current = this.sec('intro')?.duration || 5;
    const next = Math.max(0.5, Math.min(30, Math.round((current + delta * 0.5) * 10) / 10));
    this.setSec('intro', 'duration', next);
  }

  uploadIntroMedia() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      this.api.uploadFile('gifs', f).subscribe({
        next: (r) => {
          this.setSec('intro', 'background', r.url);
          // If video, detect duration
          if (this.isVideoFile(r.url)) {
            this.detectVideoDuration(r.url);
          }
        }
      });
    };
    input.click();
  }

  private detectVideoDuration(url: string) {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration * 10) / 10;
      this.setSec('intro', 'videoDuration', duration);
      video.remove();
    };
    video.src = url;
  }

  clearMediaDuration() {
    this.setSec('intro', 'videoDuration', null);
    this.setSec('intro', 'useVideoDuration', false);
  }

  getFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    const name = parts[parts.length - 1].split('?')[0];
    return name.length > 20 ? name.substring(0, 17) + '...' : name;
  }
}
