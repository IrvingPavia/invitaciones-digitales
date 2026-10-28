import { Component, inject, Input, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ColorPickerComponent } from '../../../../../core/components/color-picker.component';
import { CustomSelectComponent, SelectOption } from '../../../../../core/components/custom-select.component';
import { WheelTimePickerComponent } from '../../../../../core/components/wheel-time-picker.component';
import { WheelDatePickerComponent } from '../../../../../core/components/wheel-date-picker.component';
import { RichTextEditorComponent } from '../../../../../core/components/rich-text-editor.component';
import { BackgroundControlComponent } from '../background-control/background-control.component';
import { AudioControlComponent } from '../audio-control/audio-control.component';
import { MediaBackground } from '../../../../../core/models/models';
import { CanvasStateService } from '../../services/canvas-state.service';
import { ApiService } from '../../../../../core/services/api.service';

@Component({
  selector: 'app-builder-props-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ColorPickerComponent, CustomSelectComponent, WheelTimePickerComponent, WheelDatePickerComponent, RichTextEditorComponent, BackgroundControlComponent, AudioControlComponent],
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
            <p class="tpl-hint">Selecciona un template para reemplazar todos los colores y fuentes. Los contenidos no se modifican.</p>
            <div class="tpl-grid-preview">
              <div class="tpl-preview-card" (click)="applyTemplate('elegante');$event.stopPropagation()">
                <div class="tpl-preview-swatch" style="background:linear-gradient(135deg, #0d1117, #1a1a2e); border-color:rgba(212,160,23,0.3)"><span style="color:#d4a017">Aa</span></div>
                <span class="tpl-preview-label">Elegante</span>
              </div>
              <div class="tpl-preview-card" (click)="applyTemplate('moderno');$event.stopPropagation()">
                <div class="tpl-preview-swatch" style="background:linear-gradient(135deg, #1e1e32, #2d2d44); border-color:rgba(167,139,250,0.3)"><span style="color:#a78bfa">Aa</span></div>
                <span class="tpl-preview-label">Moderno</span>
              </div>
              <div class="tpl-preview-card" (click)="applyTemplate('romantico');$event.stopPropagation()">
                <div class="tpl-preview-swatch" style="background:linear-gradient(135deg, #2d1525, #1a0a14); border-color:rgba(244,167,193,0.3)"><span style="color:#f4a7c1">Aa</span></div>
                <span class="tpl-preview-label">Romántico</span>
              </div>
              <div class="tpl-preview-card" (click)="applyTemplate('festivo');$event.stopPropagation()">
                <div class="tpl-preview-swatch" style="background:linear-gradient(135deg, #1a1a2e, #2d2200); border-color:rgba(251,191,36,0.3)"><span style="color:#fbbf24">Aa</span></div>
                <span class="tpl-preview-label">Festivo</span>
              </div>
              <div class="tpl-preview-card" (click)="applyTemplate('corporativo');$event.stopPropagation()">
                <div class="tpl-preview-swatch" style="background:linear-gradient(135deg, #0f172a, #1e293b); border-color:rgba(96,165,250,0.3)"><span style="color:#60a5fa">Aa</span></div>
                <span class="tpl-preview-label">Corporativo</span>
              </div>
            </div>
          </div>
        }

        <div class="accordion" [class.open]="expanded['colors']" (click)="toggle('colors')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['colors'] ? 'expand_more' : 'chevron_right' }}</span><span>Colores del Tema</span></div>
        </div>
        @if (expanded['colors']) {
          <div class="accordion-body">
            <div class="pf"><label>Texto primario</label><app-color-picker [value]="cfg()!.theme.textPrimary || '#fff'" (valueChange)="setTheme('textPrimary', $event)"></app-color-picker></div>
            <div class="pf"><label>Fuente primaria</label>
              <app-custom-select [options]="themeFontOptions" [value]="cfg()!.theme.textPrimaryFont || ''" (valueChange)="setTheme('textPrimaryFont', $event)"></app-custom-select>
            </div>
            <div class="pf"><label>Texto secundario</label><app-color-picker [value]="cfg()!.theme.textSecondary || 'rgba(255,255,255,0.7)'" (valueChange)="setTheme('textSecondary', $event)"></app-color-picker></div>
            <div class="pf"><label>Fuente secundaria</label>
              <app-custom-select [options]="themeFontOptions" [value]="cfg()!.theme.textSecondaryFont || ''" (valueChange)="setTheme('textSecondaryFont', $event)"></app-custom-select>
            </div>
            <div class="pf"><label>Acento (nav/footer)</label><app-color-picker [value]="cfg()!.theme.navFooterText || '#d4a017'" (valueChange)="setTheme('navFooterText', $event)"></app-color-picker></div>
            <div class="pf"><label>Fuente nav/footer</label>
              <app-custom-select [options]="themeFontOptions" [value]="cfg()!.theme.navFooterFont || ''" (valueChange)="setTheme('navFooterFont', $event)"></app-custom-select>
            </div>
            <div class="pf"><label>Botones fondo</label><app-color-picker [value]="cfg()!.theme.buttonBg || '#d4a017'" (valueChange)="setTheme('buttonBg', $event)"></app-color-picker></div>
            <div class="pf"><label>Botones texto</label><app-color-picker [value]="cfg()!.theme.buttonText || '#1a1a2e'" (valueChange)="setTheme('buttonText', $event)"></app-color-picker></div>
            <div class="pf"><label>Fuente botones</label>
              <app-custom-select [options]="themeFontOptions" [value]="cfg()!.theme.buttonFont || ''" (valueChange)="setTheme('buttonFont', $event)"></app-custom-select>
            </div>
            <div class="pf"><label>Fondo cards</label><app-color-picker [value]="cfg()!.theme.cardBg || 'rgba(255,255,255,0.05)'" (valueChange)="setTheme('cardBg', $event)"></app-color-picker></div>
            <div class="pf"><label>Borde cards</label><app-color-picker [value]="cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="setTheme('cardBorder', $event)"></app-color-picker></div>
          </div>
        }

        <div class="accordion" [class.open]="expanded['bg']" (click)="toggle('bg')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['bg'] ? 'expand_more' : 'chevron_right' }}</span><span>Fondo de la Landing</span></div>
        </div>
        @if (expanded['bg']) {
          <div class="accordion-body">
            <span class="pf-section-title">Imagen de fondo (fija)</span>
            <app-background-control [model]="themeLandingBg()" (modelChange)="setThemeLandingBg($event)"></app-background-control>
            <span class="pf-section-title" style="margin-top:12px">Color / Textura de ambientación</span>
            <div class="pf"><label>Color 1</label><app-color-picker [value]="cfg()!.theme.landingBgColor1 || '#0d1117'" (valueChange)="setTheme('landingBgColor1', $event)"></app-color-picker></div>
            <div class="pf"><label>Color 2</label><app-color-picker [value]="cfg()!.theme.landingBgColor2 || '#1a1a2e'" (valueChange)="setTheme('landingBgColor2', $event)"></app-color-picker></div>
            <div class="pf"><label>Tipo</label>
              <app-custom-select [options]="landingBgTypeOptions" [value]="cfg()!.theme.landingBgType || 'solid'" (valueChange)="setTheme('landingBgType', $event)"></app-custom-select>
            </div>
            @if (cfg()!.theme.landingBgType === 'linear' || cfg()!.theme.landingBgType === 'mesh') {
              <div class="pf"><label>Angulo ({{cfg()!.theme.landingBgAngle ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="cfg()!.theme.landingBgAngle ?? 135" (ngModelChange)="setTheme('landingBgAngle', +$event)"></div>
            }
            @if (cfg()!.theme.landingBgType === 'linear') {
              <div class="pf"><label>Intensidad ({{cfg()!.theme.landingBgIntensity ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="cfg()!.theme.landingBgIntensity ?? 50" (ngModelChange)="setTheme('landingBgIntensity', +$event)"></div>
            }
            @if (cfg()!.theme.landingBgType === 'radial' || cfg()!.theme.landingBgType === 'mesh') {
              <div class="pf"><label>Intensidad ({{cfg()!.theme.landingBgIntensity ?? 50}}%)</label><input type="range" class="pinput-range" min="10" max="100" [ngModel]="cfg()!.theme.landingBgIntensity ?? 50" (ngModelChange)="setTheme('landingBgIntensity', +$event)"></div>
            }
            <div class="pf"><label>Textura</label>
              <app-custom-select [options]="landingBgTextureOptions" [value]="cfg()!.theme.landingBgTexture || 'none'" (valueChange)="setTheme('landingBgTexture', $event)"></app-custom-select>
            </div>
            @if (cfg()!.theme.landingBgTexture && cfg()!.theme.landingBgTexture !== 'none') {
              <div class="pf"><label>Intensidad textura ({{cfg()!.theme.landingBgTextureOpacity || 5}}%)</label><input type="range" class="pinput-range" min="1" max="30" [ngModel]="cfg()!.theme.landingBgTextureOpacity || 5" (ngModelChange)="setTheme('landingBgTextureOpacity', +$event)"></div>
            }
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
              <button class="chip" [class.active]="cfg()!.theme.scrollAnimation === 'slide-left'" (click)="setTheme('scrollAnimation','slide-left');$event.stopPropagation()">Slide Left</button>
              <button class="chip" [class.active]="cfg()!.theme.scrollAnimation === 'slide-right'" (click)="setTheme('scrollAnimation','slide-right');$event.stopPropagation()">Slide Right</button>
              <button class="chip" [class.active]="cfg()!.theme.scrollAnimation === 'scale'" (click)="setTheme('scrollAnimation','scale');$event.stopPropagation()">Scale</button>
              <button class="chip" [class.active]="cfg()!.theme.scrollAnimation === 'none'" (click)="setTheme('scrollAnimation','none');$event.stopPropagation()">Ninguna</button>
            </div>
          </div>
        }

        <div class="accordion" [class.open]="expanded['section-nav']" (click)="toggle('section-nav')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['section-nav'] ? 'expand_more' : 'chevron_right' }}</span><span>Navegacion entre secciones</span></div>
        </div>
        @if (expanded['section-nav']) {
          <div class="accordion-body">
            <p class="pf-hint">Define cómo se desplaza el visitante entre secciones al hacer scroll (desde la Carátula). Configurable por dispositivo.</p>
            <ul class="pf-hint-list">
              <li><b>Libre:</b> scroll normal, el visitante se mueve a su ritmo.</li>
              <li><b>Guiado suave:</b> la página acompaña el scroll hacia la siguiente sección de forma fluida. Las secciones largas se ven completas antes de avanzar.</li>
              <li><b>Guiado firme:</b> cada desplazamiento avanza una sección completa, de forma más marcada.</li>
            </ul>
            <span class="pf-section-title">Móvil</span>
            <div class="btn-row">
              <button class="chip" [class.active]="(cfg()!.theme.sectionTransitionMobile || 'free') === 'free'" (click)="setTheme('sectionTransitionMobile','free');$event.stopPropagation()">Libre</button>
              <button class="chip" [class.active]="cfg()!.theme.sectionTransitionMobile === 'auto-soft'" (click)="setTheme('sectionTransitionMobile','auto-soft');$event.stopPropagation()">Guiado suave</button>
              <button class="chip" [class.active]="cfg()!.theme.sectionTransitionMobile === 'auto-strict'" (click)="setTheme('sectionTransitionMobile','auto-strict');$event.stopPropagation()">Guiado firme</button>
            </div>
            <span class="pf-section-title" style="margin-top:12px">Escritorio</span>
            <div class="btn-row">
              <button class="chip" [class.active]="(cfg()!.theme.sectionTransitionDesktop || 'free') === 'free'" (click)="setTheme('sectionTransitionDesktop','free');$event.stopPropagation()">Libre</button>
              <button class="chip" [class.active]="cfg()!.theme.sectionTransitionDesktop === 'auto-soft'" (click)="setTheme('sectionTransitionDesktop','auto-soft');$event.stopPropagation()">Guiado suave</button>
              <button class="chip" [class.active]="cfg()!.theme.sectionTransitionDesktop === 'auto-strict'" (click)="setTheme('sectionTransitionDesktop','auto-strict');$event.stopPropagation()">Guiado firme</button>
            </div>
          </div>
        }

        <div class="accordion" [class.open]="expanded['nav']" (click)="toggle('nav')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['nav'] ? 'expand_more' : 'chevron_right' }}</span><span>Navbar y Menu</span></div>
        </div>
        @if (expanded['nav']) {
          <div class="accordion-body">
            <span class="pf-section-title">Barra de Titulo</span>
            <div class="pf"><label>Color fondo 1</label><app-color-picker [value]="cfg()!.theme.navBarBg1 || '#0d1117'" (valueChange)="setTheme('navBarBg1', $event)"></app-color-picker></div>
            <div class="pf"><label>Color fondo 2 (degradado)</label><app-color-picker [value]="cfg()!.theme.navBarBg2 || ''" (valueChange)="setTheme('navBarBg2', $event)"></app-color-picker></div>
            <div class="pf"><label>Opacidad fondo ({{cfg()!.theme.navBarOpacity ?? 85}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="cfg()!.theme.navBarOpacity ?? 85" (ngModelChange)="setTheme('navBarOpacity', +$event)"></div>
            <div class="pf"><label>Desenfoque de fondo ({{cfg()!.theme.navBarBlur ?? 12}}px)</label><input type="range" class="pinput-range" min="0" max="30" [ngModel]="cfg()!.theme.navBarBlur ?? 12" (ngModelChange)="setTheme('navBarBlur', +$event)"></div>
            <div class="pf"><label>Color texto titulo</label><app-color-picker [value]="cfg()!.theme.navFooterText || '#d4a017'" (valueChange)="setTheme('navFooterText', $event)"></app-color-picker></div>
            <div class="pf"><label>Color linea inferior</label><app-color-picker [value]="cfg()!.theme.navBarBorder || 'rgba(212,160,23,0.2)'" (valueChange)="setTheme('navBarBorder', $event)"></app-color-picker></div>

            <span class="pf-section-title" style="margin-top:12px">Menu de Navegacion</span>
            <div class="pf"><label>Fondo menu</label><app-color-picker [value]="cfg()!.theme.navMenuBg || 'rgba(13,17,23,0.95)'" (valueChange)="setTheme('navMenuBg', $event)"></app-color-picker></div>
            <div class="pf"><label>Blur menu ({{cfg()!.theme.navMenuBlur ?? 12}}px)</label><input type="range" class="pinput-range" min="0" max="30" [ngModel]="cfg()!.theme.navMenuBlur ?? 12" (ngModelChange)="setTheme('navMenuBlur', +$event)"></div>
            <div class="pf"><label>Color texto menu</label><app-color-picker [value]="cfg()!.theme.navMenuText || 'rgba(255,255,255,0.8)'" (valueChange)="setTheme('navMenuText', $event)"></app-color-picker></div>
            <div class="pf"><label>Fondo botones</label><app-color-picker [value]="cfg()!.theme.navBtnBg || 'rgba(255,255,255,0.1)'" (valueChange)="setTheme('navBtnBg', $event)"></app-color-picker></div>
            <div class="pf"><label>Borde botones</label><app-color-picker [value]="cfg()!.theme.navBtnBorder || 'rgba(255,255,255,0.2)'" (valueChange)="setTheme('navBtnBorder', $event)"></app-color-picker></div>
            <div class="pf"><label>Color icono botones</label><app-color-picker [value]="cfg()!.theme.navBtnIcon || '#ffffff'" (valueChange)="setTheme('navBtnIcon', $event)"></app-color-picker></div>
          </div>
        }

        <div class="accordion" [class.open]="expanded['global-styles']" (click)="toggle('global-styles')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['global-styles'] ? 'expand_more' : 'chevron_right' }}</span><span>Estilos Globales</span></div>
        </div>
        @if (expanded['global-styles']) {
          <div class="accordion-body">
            <span class="pf-section-title">Encabezados de Seccion</span>
            <div class="pf"><label>Fuente</label>
              <app-custom-select [options]="fontOptions" [value]="cfg()!.globalStyles.sectionHeadingStyle.fontFamily||'script'" (valueChange)="setGlobalStyle('sectionHeadingStyle','fontFamily',$event)"></app-custom-select>
            </div>
            <div class="pf"><label>Tamano ({{cfg()!.globalStyles.sectionHeadingStyle.fontSize||36}}px)</label><input type="range" class="pinput-range" min="12" max="72" [ngModel]="cfg()!.globalStyles.sectionHeadingStyle.fontSize||36" (ngModelChange)="setGlobalStyle('sectionHeadingStyle','fontSize',+$event)"></div>
            <div class="pf"><label>Color</label><app-color-picker [value]="cfg()!.globalStyles.sectionHeadingStyle.color||'#d4a017'" (valueChange)="setGlobalStyle('sectionHeadingStyle','color',$event)"></app-color-picker></div>

            <span class="pf-section-title" style="margin-top:12px">Titulos (Degradado)</span>
            <div class="pf"><label>Fuente</label>
              <app-custom-select [options]="fontOptions" [value]="cfg()!.globalStyles.titleStyle.fontFamily||'script'" (valueChange)="setGlobalStyle('titleStyle','fontFamily',$event)"></app-custom-select>
            </div>
            <div class="pf"><label>Tamano ({{cfg()!.globalStyles.titleStyle.fontSize||42}}px)</label><input type="range" class="pinput-range" min="12" max="96" [ngModel]="cfg()!.globalStyles.titleStyle.fontSize||42" (ngModelChange)="setGlobalStyle('titleStyle','fontSize',+$event)"></div>
            <div class="pf"><label>Color 1</label><app-color-picker [value]="cfg()!.globalStyles.titleStyle.color||'#d4a017'" (valueChange)="setGlobalStyle('titleStyle','color',$event)"></app-color-picker></div>
            <div class="pf"><label>Color 2</label><app-color-picker [value]="cfg()!.globalStyles.titleStyle.color2||'#f0c040'" (valueChange)="setGlobalStyle('titleStyle','color2',$event)"></app-color-picker></div>
            <div class="pf"><label>Angulo ({{cfg()!.globalStyles.titleStyle.gradientAngle ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="cfg()!.globalStyles.titleStyle.gradientAngle ?? 135" (ngModelChange)="setGlobalStyle('titleStyle','gradientAngle',+$event)"></div>
            <div class="pf"><label>Intensidad ({{cfg()!.globalStyles.titleStyle.gradientIntensity ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="cfg()!.globalStyles.titleStyle.gradientIntensity ?? 50" (ngModelChange)="setGlobalStyle('titleStyle','gradientIntensity',+$event)"></div>
            <div class="pf"><label>Grosor ({{cfg()!.globalStyles.titleStyle.fontWeight ?? 400}})</label><input type="range" class="pinput-range" min="100" max="900" step="100" [ngModel]="cfg()!.globalStyles.titleStyle.fontWeight ?? 400" (ngModelChange)="setGlobalStyle('titleStyle','fontWeight',+$event)"></div>

            <span class="pf-section-title" style="margin-top:12px">Subtitulos</span>
            <div class="pf"><label>Fuente</label>
              <app-custom-select [options]="fontOptions" [value]="cfg()!.globalStyles.subtitleStyle.fontFamily||'sans'" (valueChange)="setGlobalStyle('subtitleStyle','fontFamily',$event)"></app-custom-select>
            </div>
            <div class="pf"><label>Tamano ({{cfg()!.globalStyles.subtitleStyle.fontSize||16}}px)</label><input type="range" class="pinput-range" min="10" max="48" [ngModel]="cfg()!.globalStyles.subtitleStyle.fontSize||16" (ngModelChange)="setGlobalStyle('subtitleStyle','fontSize',+$event)"></div>
            <div class="pf"><label>Color</label><app-color-picker [value]="cfg()!.globalStyles.subtitleStyle.color||'#ffffffb3'" (valueChange)="setGlobalStyle('subtitleStyle','color',$event)"></app-color-picker></div>

            <span class="pf-section-title" style="margin-top:12px">Contenido</span>
            <div class="pf"><label>Fuente</label>
              <app-custom-select [options]="fontOptions" [value]="cfg()!.globalStyles.contentStyle.fontFamily||'sans'" (valueChange)="setGlobalStyle('contentStyle','fontFamily',$event)"></app-custom-select>
            </div>
            <div class="pf"><label>Tamano ({{cfg()!.globalStyles.contentStyle.fontSize||14}}px)</label><input type="range" class="pinput-range" min="10" max="36" [ngModel]="cfg()!.globalStyles.contentStyle.fontSize||14" (ngModelChange)="setGlobalStyle('contentStyle','fontSize',+$event)"></div>
            <div class="pf"><label>Color</label><app-color-picker [value]="cfg()!.globalStyles.contentStyle.color||'#ffffffb3'" (valueChange)="setGlobalStyle('contentStyle','color',$event)"></app-color-picker></div>

            <span class="pf-section-title" style="margin-top:12px">Separadores</span>
            <div class="pf"><label>Estilo</label>
              <app-custom-select [options]="separatorStyleOptions" [value]="cfg()!.globalStyles.separatorStyle.type||'elegant'" (valueChange)="setGlobalSeparator('type',$event)"></app-custom-select>
            </div>
            <div class="pf"><label>Color</label><app-color-picker [value]="cfg()!.globalStyles.separatorStyle.color||'#d4a017'" (valueChange)="setGlobalSeparator('color',$event)"></app-color-picker></div>
          </div>
        }

        <div class="accordion" [class.open]="expanded['favicon']" (click)="toggle('favicon')">
          <div class="accordion-header"><span class="material-icons">{{ expanded['favicon'] ? 'expand_more' : 'chevron_right' }}</span><span>Favicon de la Landing</span></div>
        </div>
        @if (expanded['favicon']) {
          <div class="accordion-body">
            <p class="hint">Icono que aparece en la pestaña del navegador cuando el invitado abre la landing. Si no se configura, se usa el icono de Vitely.</p>
            <div class="upload-row" style="margin-top:8px;">
              @if (cfg()!.favicon) {
                <img [src]="cfg()!.favicon" style="width:28px;height:28px;border-radius:4px;object-fit:cover;border:1px solid rgba(139,92,246,0.3);">
                <span class="file-name">{{ getFileName(cfg()!.favicon || '') }}</span>
                <button class="sm-btn" (click)="upload('_favicon','favicon','images');$event.stopPropagation()">Cambiar</button>
                <button class="sm-btn danger" (click)="setFavicon('');$event.stopPropagation()">X</button>
              } @else {
                <button class="sm-btn" (click)="upload('_favicon','favicon','images');$event.stopPropagation()">Subir icono</button>
              }
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
                <div class="tpl-preview-card" [class.active]="sec('envelope')?.template==='envelope'" (click)="setSec('envelope','template','envelope');$event.stopPropagation()">
                  <div class="tpl-preview-swatch env-swatch"><span style="font-size:24px">💌</span></div>
                  <span class="tpl-preview-label">✉ Sobre</span>
                </div>
                <div class="tpl-preview-card" [class.active]="sec('envelope')?.template==='ticket'" (click)="setSec('envelope','template','ticket');$event.stopPropagation()">
                  <div class="tpl-preview-swatch env-swatch"><span style="font-size:24px">🎫</span></div>
                  <span class="tpl-preview-label">🎟 Ticket</span>
                </div>
                <div class="tpl-preview-card" [class.active]="sec('envelope')?.template==='minimal-splash'" (click)="setSec('envelope','template','minimal-splash');$event.stopPropagation()">
                  <div class="tpl-preview-swatch env-swatch"><span style="font-size:24px">✨</span></div>
                  <span class="tpl-preview-label">✨ Splash</span>
                </div>
                <div class="tpl-preview-card" [class.active]="sec('envelope')?.template==='plain'" (click)="setSec('envelope','template','plain');$event.stopPropagation()">
                  <div class="tpl-preview-swatch env-swatch"><span style="font-size:20px;color:rgba(255,255,255,0.4)">━━</span></div>
                  <span class="tpl-preview-label">📄 Plano</span>
                </div>
              </div>
            </div>
          }

          <!-- === ENVELOPE-type only properties === -->
          @if (sec('envelope')?.template === 'envelope') {
          <div class="accordion" [class.open]="expanded['env-style']" (click)="toggle('env-style')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-style'] ? 'expand_more' : 'chevron_right' }}</span><span>Estilo de Sobre</span></div>
          </div>
          @if (expanded['env-style']) {
            <div class="accordion-body">
              <div class="pf"><label>Estilo</label>
                <app-custom-select [options]="envelopeStyleOptions" [value]="sec('envelope')?.style||'classic'" (valueChange)="setSec('envelope','style',$event)"></app-custom-select>
              </div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['env-seal']" (click)="toggle('env-seal')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-seal'] ? 'expand_more' : 'chevron_right' }}</span><span>Estilo de Sello</span></div>
          </div>
          @if (expanded['env-seal']) {
            <div class="accordion-body">
              <div class="pf"><label>Forma</label>
                <app-custom-select [options]="sealStyleOptions" [value]="sec('envelope')?.sealStyle||'wax-circle'" (valueChange)="setSec('envelope','sealStyle',$event)"></app-custom-select>
              </div>
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
              @if (getSealType() === 'emoji') {
                <div class="pf"><label>Emoji / Texto sello</label><input class="pinput" [ngModel]="sec('envelope')?.sealText" (ngModelChange)="setSec('envelope','sealText',$event)" placeholder="💍"></div>
              }
              @if (getSealType() === 'icon') {
                <div class="pf"><label>Imagen del sello</label>
                  @if(sec('envelope')?.sealImage){
                    <div class="media-preview-row">
                      <div class="media-thumb"><img [src]="sec('envelope')?.sealImage" alt="sello"></div>
                      <div class="media-meta"><span class="media-badge">{{thumbKind(sec('envelope')?.sealImage)}}</span><span class="file-name">{{getFileName(sec('envelope')?.sealImage)}}</span></div>
                      <div class="media-actions"><button class="sm-btn" (click)="upload('envelope','sealImage','images');$event.stopPropagation()">Cambiar</button><button class="sm-btn danger" (click)="setSec('envelope','sealImage','');$event.stopPropagation()">X</button></div>
                    </div>
                  } @else {<div class="upload-row"><button class="sm-btn" (click)="upload('envelope','sealImage','images');$event.stopPropagation()">Subir</button></div>}
                </div>
              }
            </div>
          }
          }

          <!-- === Instruction (all templates) === -->
          <div class="accordion" [class.open]="expanded['env-instr']" (click)="toggle('env-instr')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-instr'] ? 'expand_more' : 'chevron_right' }}</span><span>Instruccion</span></div>
          </div>
          @if (expanded['env-instr']) {
            <div class="accordion-body">
              <div class="pf"><label>Texto</label><input class="pinput" [ngModel]="sec('envelope')?.instructionText||'Toca para abrir'" (ngModelChange)="setSec('envelope','instructionText',$event)"></div>
              <div class="pf"><label>Animacion</label>
                <app-custom-select [options]="instructionAnimOptions" [value]="sec('envelope')?.instructionAnimation||'pulse'" (valueChange)="setSec('envelope','instructionAnimation',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Color instruccion</label><app-color-picker [value]="sec('envelope')?.instructionColor||'#ffffff'" (valueChange)="setSec('envelope','instructionColor',$event)"></app-color-picker></div>
            </div>
          }

          <!-- === Common properties for all envelope templates === -->
          <div class="accordion" [class.open]="expanded['env-colors']" (click)="toggle('env-colors')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-colors'] ? 'expand_more' : 'chevron_right' }}</span><span>Colores</span></div>
          </div>
          @if (expanded['env-colors']) {
            <div class="accordion-body">
              <div class="pf"><label>Color fondo</label><app-color-picker [value]="sec('envelope')?.bgColor||'#0d1117'" (valueChange)="setSec('envelope','bgColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Color fondo 2</label><app-color-picker [value]="sec('envelope')?.bgColor2||'#1a1a2e'" (valueChange)="setSec('envelope','bgColor2',$event)"></app-color-picker></div>
              <div class="pf"><label>Color texto</label><app-color-picker [value]="sec('envelope')?.textColor||'#ffffff'" (valueChange)="setSec('envelope','textColor',$event)"></app-color-picker></div>
              @if (sec('envelope')?.template === 'envelope') {
                <div class="pf"><label>Color sobre</label><app-color-picker [value]="sec('envelope')?.envelopeColor||'#1a1a2e'" (valueChange)="setSec('envelope','envelopeColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Color sello</label><app-color-picker [value]="sec('envelope')?.sealColor||'#8b0000'" (valueChange)="setSec('envelope','sealColor',$event)"></app-color-picker></div>
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['env-bg']" (click)="toggle('env-bg')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['env-bg'] ? 'expand_more' : 'chevron_right' }}</span><span>Fondo</span></div>
          </div>
          @if (expanded['env-bg']) {
            <div class="accordion-body">
              <div class="pf"><label>Imagen/GIF de fondo</label>
                @if(sec('envelope')?.splashImage){
                  <div class="media-preview-row">
                    <div class="media-thumb">
                      @if(thumbIsVideo(sec('envelope')?.splashImage)){<span class="material-icons media-type-icon">movie</span>}
                      @else{<img [src]="sec('envelope')?.splashImage" alt="fondo">}
                    </div>
                    <div class="media-meta"><span class="media-badge">{{thumbKind(sec('envelope')?.splashImage)}}</span><span class="file-name">{{getFileName(sec('envelope')?.splashImage)}}</span></div>
                    <div class="media-actions"><button class="sm-btn" (click)="upload('envelope','splashImage','gifs');$event.stopPropagation()">Cambiar</button><button class="sm-btn danger" (click)="setSec('envelope','splashImage','');$event.stopPropagation()">X</button></div>
                  </div>
                } @else {<div class="upload-row"><button class="sm-btn" (click)="upload('envelope','splashImage','gifs');$event.stopPropagation()">Subir</button></div>}
              </div>
              @if (sec('envelope')?.splashImage) {
                <div class="pf"><label>Ajuste en escritorio</label>
                  <app-custom-select [options]="bgFitOptions" [value]="sec('envelope')?.splashBgFit || 'cover'" (valueChange)="setSec('envelope','splashBgFit',$event)"></app-custom-select>
                </div>
                @if (sec('envelope')?.splashBgFit === 'banner') {
                  <div class="pf"><label>Ancho del banner ({{sec('envelope')?.splashBgBannerWidth || 70}}%)</label><input type="range" class="pinput-range" min="10" max="100" step="5" [ngModel]="sec('envelope')?.splashBgBannerWidth || 70" (ngModelChange)="setSec('envelope','splashBgBannerWidth',+$event)"></div>
                }
              }
              @if (!sec('envelope')?.splashImage) {
                <div class="pf"><label>Tipo de fondo</label>
                  <app-custom-select [options]="envBgTypeOptions" [value]="sec('envelope')?.bgType||'linear'" (valueChange)="setSec('envelope','bgType',$event)"></app-custom-select>
                </div>
              }
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
                <!-- ENCABEZADO (campo interno plainTitle) + su estilo (fuente/tamaño/color). -->
                <div class="pf"><label>Encabezado</label><input class="pinput" [ngModel]="sec('envelope')?.plainTitle" (ngModelChange)="setSec('envelope','plainTitle',$event)"></div>
                @if (sec('envelope')?.plainTitle) {
                  <span class="pf-section-title">Estilo del encabezado</span>
                  <p class="pf-hint">Deja vacío para heredar del Tema Global.</p>
                  <div class="pf"><label>Fuente</label>
                    <app-custom-select [options]="themeFontOptions" [value]="sec('envelope')?.plainTitleFont||''" (valueChange)="setSec('envelope','plainTitleFont',$event)"></app-custom-select>
                  </div>
                  <div class="pf"><label>Tamaño ({{sec('envelope')?.plainTitleSize || ''}}px)</label><input type="number" class="pinput" [ngModel]="sec('envelope')?.plainTitleSize||''" (ngModelChange)="setSec('envelope','plainTitleSize',$event ? +$event : null)" min="12" max="96" placeholder="Hereda"></div>
                  <div class="pf"><label>Color</label><app-color-picker [value]="sec('envelope')?.plainTitleColor||''" (valueChange)="setSec('envelope','plainTitleColor',$event)"></app-color-picker></div>
                }

                <!-- TÍTULO (campo interno plainSubtitle) + su estilo con BICOLOR. -->
                <div class="pf" style="margin-top:10px"><label>Título</label><input class="pinput" [ngModel]="sec('envelope')?.plainSubtitle" (ngModelChange)="setSec('envelope','plainSubtitle',$event)"></div>
                @if (sec('envelope')?.plainSubtitle) {
                  <span class="pf-section-title">Estilo del título</span>
                  <p class="pf-hint">Deja vacío para heredar del Tema Global. Define dos colores para un título bicolor (degradado).</p>
                  <div class="pf"><label>Fuente</label>
                    <app-custom-select [options]="themeFontOptions" [value]="sec('envelope')?.plainSubtitleFont||''" (valueChange)="setSec('envelope','plainSubtitleFont',$event)"></app-custom-select>
                  </div>
                  <div class="pf"><label>Tamaño ({{sec('envelope')?.plainSubtitleSize || ''}}px)</label><input type="number" class="pinput" [ngModel]="sec('envelope')?.plainSubtitleSize||''" (ngModelChange)="setSec('envelope','plainSubtitleSize',$event ? +$event : null)" min="10" max="96" placeholder="Hereda"></div>
                  <div class="pf"><label>Color 1</label><app-color-picker [value]="sec('envelope')?.plainSubtitleColor||''" (valueChange)="setSec('envelope','plainSubtitleColor',$event)"></app-color-picker></div>
                  <div class="pf"><label>Color 2 (degradado)</label><app-color-picker [value]="sec('envelope')?.plainSubtitleColor2||''" (valueChange)="setSec('envelope','plainSubtitleColor2',$event)"></app-color-picker></div>
                  <div class="pf"><label>Ángulo ({{sec('envelope')?.plainSubtitleGradientAngle ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="sec('envelope')?.plainSubtitleGradientAngle ?? 135" (ngModelChange)="setSec('envelope','plainSubtitleGradientAngle',+$event)"></div>
                  <div class="pf"><label>Intensidad ({{sec('envelope')?.plainSubtitleGradientIntensity ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="sec('envelope')?.plainSubtitleGradientIntensity ?? 50" (ngModelChange)="setSec('envelope','plainSubtitleGradientIntensity',+$event)"></div>
                  <div class="pf"><label>Grosor ({{sec('envelope')?.plainSubtitleFontWeight ?? 400}})</label><input type="range" class="pinput-range" min="100" max="900" step="100" [ngModel]="sec('envelope')?.plainSubtitleFontWeight ?? 400" (ngModelChange)="setSec('envelope','plainSubtitleFontWeight',+$event)"></div>
                }

                <div class="pf" style="margin-top:10px"><label>Contenido</label>
                  <app-rich-text-editor [ngModel]="sec('envelope')?.plainContent" (ngModelChange)="setSec('envelope','plainContent',$event)" [placeholder]="'Escribe el contenido...'"></app-rich-text-editor>
                </div>
                <div class="pf"><label>Animacion de salida</label>
                  <app-custom-select [options]="plainExitAnimOptions" [value]="sec('envelope')?.plainExitAnimation||'fade'" (valueChange)="setSec('envelope','plainExitAnimation',$event)"></app-custom-select>
                </div>
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
              <div class="pf"><label>Frase</label>
                <app-rich-text-editor [ngModel]="introPhraseHtml()" (ngModelChange)="setSec('intro','phraseHtml',$event)" [placeholder]="'Escribe la frase de la intro...'"></app-rich-text-editor>
              </div>
              <p class="pf-hint">Arrastra la frase en el lienzo para posicionarla.</p>
            </div>
          }

          <div class="accordion" [class.open]="expanded['intro-bg']" (click)="toggle('intro-bg')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['intro-bg'] ? 'expand_more' : 'chevron_right' }}</span><span>Fondo Multimedia</span></div>
          </div>
          @if (expanded['intro-bg']) {
            <div class="accordion-body">
              <!-- Fondo homologado con las secciones: imagen/gif/video + banner/cover en
                   escritorio + override desktop + overlay. Mismo control reutilizable. -->
              <app-background-control [model]="introMediaModel()" (modelChange)="setIntroMediaModel($event)"></app-background-control>
              @if (sec('intro')?.background && isVideoFile(sec('intro')?.background)) {
                <div class="media-info" style="margin-top:8px">
                  <span class="media-badge">Video</span>
                  @if (sec('intro')?.videoDuration) {
                    <span class="media-duration">{{sec('intro')?.videoDuration}}s</span>
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
                @if (!sec('intro')?.useVideoDuration) {
                  <!-- Video Trimmer -->
                  <div class="video-trimmer">
                    <label class="trim-label">Recortar video (max {{maxIntroDuration}}s)</label>
                    <div class="trimmer-container">
                      <div class="trimmer-track" #trimmerTrack (click)="onTrimTrackClick($event)" (touchstart)="onTrimTrackTouch($event)">
                        <div class="trimmer-selected" [style.left.%]="getTrimLeft()" [style.width.%]="getTrimWidth()"></div>
                        <div class="trimmer-handle handle-start" [style.left.%]="getTrimLeft()" (mousedown)="startTrimDrag('start',$event)" (touchstart)="startTrimDrag('start',$event)"></div>
                        <div class="trimmer-handle handle-end" [style.left.%]="getTrimRight()" (mousedown)="startTrimDrag('end',$event)" (touchstart)="startTrimDrag('end',$event)"></div>
                      </div>
                      <div class="trimmer-labels">
                        <span>{{formatTrimTime(sec('intro')?.videoStart || 0)}}</span>
                        <span class="trim-duration">{{getSelectedDuration()}}s</span>
                        <span>{{formatTrimTime(sec('intro')?.videoEnd || sec('intro')?.videoDuration || 5)}}</span>
                      </div>
                    </div>
                    <button class="trim-preview-btn" (click)="previewTrim();$event.stopPropagation()">
                      <span class="material-icons">play_arrow</span> Previsualizar
                    </button>
                    <video #introTrimVideo [src]="sec('intro')?.background" style="display:none" preload="metadata"></video>
                  </div>
                }
              }
              @if (sec('intro')?.useVideoDuration || !isVideoFile(sec('intro')?.background)) {
                <div class="pf"><label>Duracion</label>
                  <div class="stepper-row">
                    <button class="stepper-btn" (click)="adjustDuration(-1);$event.stopPropagation()">-</button>
                    <span class="stepper-value">{{sec('intro')?.duration || 5}} seg</span>
                    <button class="stepper-btn" (click)="adjustDuration(1);$event.stopPropagation()">+</button>
                  </div>
                </div>
              }
              <div class="pf"><label>Transicion de salida</label>
                <app-custom-select [options]="introTransitionOptions" [value]="sec('intro')?.transition||'fade'" (valueChange)="setSec('intro','transition',$event)"></app-custom-select>
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
                  <app-custom-select [options]="introParticleTypeOptions" [value]="getParticlesProp('type')||'sparkles'" (valueChange)="setSecNested('intro','particles','type',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Direccion</label>
                  <app-custom-select [options]="introParticleDirectionOptions" [value]="getParticlesProp('direction')||'up'" (valueChange)="setSecNested('intro','particles','direction',$event)"></app-custom-select>
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

          <!-- ===== Linea de carga ===== -->
          <div class="accordion" [class.open]="expanded['intro-progress']" (click)="toggle('intro-progress')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['intro-progress'] ? 'expand_more' : 'chevron_right' }}</span><span>Linea de carga</span></div>
          </div>
          @if (expanded['intro-progress']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Mostrar linea de carga</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('intro')?.progressBar?.enabled !== false" (ngModelChange)="setSecNested('intro','progressBar','enabled',$event)"><span class="slider"></span></label>
              </div>
              @if (sec('intro')?.progressBar?.enabled !== false) {
                <div class="pf"><label>Estilo</label>
                  <app-custom-select [options]="introProgressStyleOptions" [value]="sec('intro')?.progressBar?.style||'solid'" (valueChange)="setSecNested('intro','progressBar','style',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Color</label><app-color-picker [value]="sec('intro')?.progressBar?.color||'#d4a017'" (valueChange)="setSecNested('intro','progressBar','color',$event)"></app-color-picker></div>
                <div class="pf"><label>Grosor ({{sec('intro')?.progressBar?.thickness||2}}px)</label><input type="range" class="pinput-range" min="1" max="12" [ngModel]="sec('intro')?.progressBar?.thickness||2" (ngModelChange)="setSecNested('intro','progressBar','thickness',+$event)"></div>
                <div class="pf"><label>Ancho ({{sec('intro')?.progressBar?.width||200}}px)</label><input type="range" class="pinput-range" min="80" max="400" step="10" [ngModel]="sec('intro')?.progressBar?.width||200" (ngModelChange)="setSecNested('intro','progressBar','width',+$event)"></div>
              }
            </div>
          }
        }

        <!-- ===== HERO ===== -->
        @if (canvasState.selectedSection() === 'hero') {
          <div class="accordion" [class.open]="expanded['hero-event']" (click)="toggle('hero-event')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-event'] ? 'expand_more' : 'chevron_right' }}</span><span>Tipo de Evento</span></div>
          </div>
          @if (expanded['hero-event']) {
            <div class="accordion-body">
              <div class="pf"><label>Descripcion del evento</label><input class="pinput" [ngModel]="sec('hero')?.eventDescription" (ngModelChange)="setSec('hero','eventDescription',$event)"></div>
              <div class="pf"><label>Fuente</label>
                <app-custom-select [options]="fontOptions" [value]="sec('hero')?.eventDescriptionStyle?.fontFamily||'montserrat'" (valueChange)="setSecNested('hero','eventDescriptionStyle','fontFamily',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Tamano ({{sec('hero')?.eventDescriptionStyle?.fontSize||18}}px)</label>
                <div class="stepper-row">
                  <button class="stepper-btn" (click)="adjustHeroFont('eventDescriptionStyle',-1);$event.stopPropagation()">-</button>
                  <span class="stepper-value">{{sec('hero')?.eventDescriptionStyle?.fontSize||18}}px</span>
                  <button class="stepper-btn" (click)="adjustHeroFont('eventDescriptionStyle',1);$event.stopPropagation()">+</button>
                </div>
              </div>
              <div class="pf"><label>Color 1</label><app-color-picker [value]="sec('hero')?.eventDescriptionStyle?.color1||'#d4a017'" (valueChange)="setSecNested('hero','eventDescriptionStyle','color1',$event)"></app-color-picker></div>
              <div class="pf"><label>Color 2</label><app-color-picker [value]="sec('hero')?.eventDescriptionStyle?.color2||'#f4e4a0'" (valueChange)="setSecNested('hero','eventDescriptionStyle','color2',$event)"></app-color-picker></div>
              <div class="pf"><label>Angulo degradado ({{sec('hero')?.eventDescriptionStyle?.gradientAngle ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="sec('hero')?.eventDescriptionStyle?.gradientAngle ?? 135" (ngModelChange)="setSecNested('hero','eventDescriptionStyle','gradientAngle',+$event)"></div>
              <div class="pf"><label>Intensidad ({{sec('hero')?.eventDescriptionStyle?.gradientIntensity ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="sec('hero')?.eventDescriptionStyle?.gradientIntensity ?? 50" (ngModelChange)="setSecNested('hero','eventDescriptionStyle','gradientIntensity',+$event)"></div>
              <div class="pf"><label>Grosor ({{sec('hero')?.eventDescriptionStyle?.fontWeight ?? 400}})</label><input type="range" class="pinput-range" min="100" max="900" step="100" [ngModel]="sec('hero')?.eventDescriptionStyle?.fontWeight ?? 400" (ngModelChange)="setSecNested('hero','eventDescriptionStyle','fontWeight',+$event)"></div>
            </div>
          }

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
                <app-custom-select [options]="fontOptions" [value]="sec('hero')?.celebrantNamesStyle?.fontFamily||'script'" (valueChange)="setSecNested('hero','celebrantNamesStyle','fontFamily',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Tamano ({{sec('hero')?.celebrantNamesStyle?.fontSize||48}}px)</label>
                <div class="stepper-row">
                  <button class="stepper-btn" (click)="adjustHeroFont('celebrantNamesStyle',-2);$event.stopPropagation()">-</button>
                  <span class="stepper-value">{{sec('hero')?.celebrantNamesStyle?.fontSize||48}}px</span>
                  <button class="stepper-btn" (click)="adjustHeroFont('celebrantNamesStyle',2);$event.stopPropagation()">+</button>
                </div>
              </div>
              <div class="pf"><label>Color 1</label><app-color-picker [value]="sec('hero')?.celebrantNamesStyle?.color1||'#ffffff'" (valueChange)="setSecNested('hero','celebrantNamesStyle','color1',$event)"></app-color-picker></div>
              <div class="pf"><label>Color 2</label><app-color-picker [value]="sec('hero')?.celebrantNamesStyle?.color2||'#d4a017'" (valueChange)="setSecNested('hero','celebrantNamesStyle','color2',$event)"></app-color-picker></div>
              <div class="pf"><label>Angulo degradado ({{sec('hero')?.celebrantNamesStyle?.gradientAngle ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="sec('hero')?.celebrantNamesStyle?.gradientAngle ?? 135" (ngModelChange)="setSecNested('hero','celebrantNamesStyle','gradientAngle',+$event)"></div>
              <div class="pf"><label>Intensidad ({{sec('hero')?.celebrantNamesStyle?.gradientIntensity ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="sec('hero')?.celebrantNamesStyle?.gradientIntensity ?? 50" (ngModelChange)="setSecNested('hero','celebrantNamesStyle','gradientIntensity',+$event)"></div>
              <div class="pf"><label>Grosor ({{sec('hero')?.celebrantNamesStyle?.fontWeight ?? 400}})</label><input type="range" class="pinput-range" min="100" max="900" step="100" [ngModel]="sec('hero')?.celebrantNamesStyle?.fontWeight ?? 400" (ngModelChange)="setSecNested('hero','celebrantNamesStyle','fontWeight',+$event)"></div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['hero-phrase']" (click)="toggle('hero-phrase')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-phrase'] ? 'expand_more' : 'chevron_right' }}</span><span>Frase</span></div>
          </div>
          @if (expanded['hero-phrase']) {
            <div class="accordion-body">
              <div class="pf"><label>Frase</label>
                <app-rich-text-editor [ngModel]="sec('hero')?.heroPhrase" (ngModelChange)="setSec('hero','heroPhrase',$event)" [placeholder]="'Escribe la frase...'"></app-rich-text-editor>
              </div>
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
                <div class="pf"><label>Texto</label>
                  <app-rich-text-editor [ngModel]="sec('hero')?.description" (ngModelChange)="setSec('hero','description',$event)" [placeholder]="'Escribe la descripción...'"></app-rich-text-editor>
                </div>
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['hero-countdown']" (click)="toggle('hero-countdown')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-countdown'] ? 'expand_more' : 'chevron_right' }}</span><span>Countdown</span></div>
          </div>
          @if (expanded['hero-countdown']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Mostrar cuenta regresiva</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('hero')?.showCountdown !== false" (ngModelChange)="setSec('hero','showCountdown',$event)"><span class="slider"></span></label>
              </div>
              @if (sec('hero')?.showCountdown !== false) {
              <div class="pf"><label>Fecha del countdown</label>
                <app-wheel-date-picker [value]="getCountdownDate()" (valueChange)="setCountdownDate($event)"></app-wheel-date-picker>
              </div>
              <div class="pf"><label>Hora del countdown</label>
                <app-wheel-time-picker [value]="getCountdownTime()" (valueChange)="setCountdownTime($event)"></app-wheel-time-picker>
              </div>
              <!-- Colores del texto -->
              <div class="pf"><label>Color de los números</label><app-color-picker [value]="sec('hero')?.countdownValueColor || cfg()!.theme.navFooterText || '#d4a017'" (valueChange)="setSec('hero','countdownValueColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Color de las etiquetas</label><app-color-picker [value]="sec('hero')?.countdownLabelColor || 'rgba(255,255,255,0.5)'" (valueChange)="setSec('hero','countdownLabelColor',$event)"></app-color-picker></div>
              <!-- Fondo de las cards -->
              <div class="toggle-row">
                <span class="toggle-title">Fondo cards</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('hero')?.countdownShowCardBg !== false" (ngModelChange)="setSec('hero','countdownShowCardBg',$event)"><span class="slider"></span></label>
              </div>
              @if (sec('hero')?.countdownShowCardBg !== false) {
                <div class="pf"><label>Color de fondo</label><app-color-picker [value]="sec('hero')?.countdownCardBgColor || cfg()!.theme.cardBg || 'rgba(0,0,0,0.85)'" (valueChange)="setSec('hero','countdownCardBgColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Radio borde ({{sec('hero')?.countdownCardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('hero')?.countdownCardBorderRadius||8" (ngModelChange)="setSec('hero','countdownCardBorderRadius',+$event)"></div>
                <div class="pf"><label>Estilo borde</label>
                  <app-custom-select [options]="borderStyleOptions" [value]="sec('hero')?.countdownCardBorderStyle || 'none'" (valueChange)="setSec('hero','countdownCardBorderStyle',$event)"></app-custom-select>
                </div>
                @if (sec('hero')?.countdownCardBorderStyle !== 'none') {
                  <div class="pf"><label>Grosor borde ({{sec('hero')?.countdownCardBorderWidth ?? 1}}px)</label><input type="range" class="pinput-range" min="1" max="5" [ngModel]="sec('hero')?.countdownCardBorderWidth ?? 1" (ngModelChange)="setSec('hero','countdownCardBorderWidth',+$event)"></div>
                  <div class="pf"><label>Color de borde</label><app-color-picker [value]="sec('hero')?.countdownCardBorderColor || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="setSec('hero','countdownCardBorderColor',$event)"></app-color-picker></div>
                }
                @if (sec('hero')?.countdownCardBorderStyle === 'glow' || sec('hero')?.countdownCardBorderStyle === 'neon') {
                  <div class="pf"><label>Color sombra</label><app-color-picker [value]="sec('hero')?.countdownCardGlowColor || '#d4a017'" (valueChange)="setSec('hero','countdownCardGlowColor',$event)"></app-color-picker></div>
                }
                <div class="pf"><label>Forma de card</label>
                  <app-custom-select [options]="cardShapeOptions" [value]="sec('hero')?.countdownCardShape || 'standard'" (valueChange)="setSec('hero','countdownCardShape',$event)"></app-custom-select>
                </div>
              }
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['hero-media']" (click)="toggle('hero-media')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-media'] ? 'expand_more' : 'chevron_right' }}</span><span>Multimedia</span></div>
          </div>
          @if (expanded['hero-media']) {
            <div class="accordion-body">
              <span class="pf-section-title">Fondo propio de la carátula</span>
              <p class="pf-hint">Esta imagen/video es exclusiva de la carátula y SCROLLEA con ella. Si la dejas vacía, la carátula muestra el fondo global de la landing (Tema Global → Fondo de la Landing).</p>
              <app-background-control [model]="heroBgModel()" (modelChange)="setHeroBgModel($event)"></app-background-control>
              <span class="pf-section-title" style="margin-top:12px">Audio</span>
              <div class="pf"><label>Música de fondo</label>
                <app-audio-control [url]="sec('hero')?.audioUrl || ''" (urlChange)="setSec('hero','audioUrl',$event)"></app-audio-control>
              </div>
            </div>
          }

          <!-- Indicador de scroll (flechas al pie de la caratula) -->
          <div class="accordion" [class.open]="expanded['hero-scroll']" (click)="toggle('hero-scroll')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['hero-scroll'] ? 'expand_more' : 'chevron_right' }}</span><span>Indicador de scroll</span></div>
          </div>
          @if (expanded['hero-scroll']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Mostrar indicador</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="si('show') !== false" (ngModelChange)="setSI('show',$event)"><span class="slider"></span></label>
              </div>
              @if (si('show') !== false) {
                <div class="pf"><label>Tipo</label>
                  <app-custom-select [options]="scrollIndicatorTypeOptions" [value]="si('type')||'double-chevron'" (valueChange)="setSI('type',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Color</label><app-color-picker [value]="si('color')||cfg()!.theme.textPrimary||'#ffffff'" (valueChange)="setSI('color',$event)"></app-color-picker></div>
                <div class="pf"><label>Tamaño ({{si('size')||32}}px)</label><input type="range" class="pinput-range" min="16" max="64" [ngModel]="si('size')||32" (ngModelChange)="setSI('size',+$event)"></div>
                <div class="pf"><label>Animación</label>
                  <app-custom-select [options]="scrollIndicatorAnimOptions" [value]="si('animation')||'bounce'" (valueChange)="setSI('animation',$event)"></app-custom-select>
                </div>
              }
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
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('invitation')?.showCardBg !== false" (ngModelChange)="setSec('invitation','showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Color de fondo</label><app-color-picker [value]="sec('invitation')?.cardBgColor || cfg()!.theme.cardBg || 'rgba(0,0,0,0.85)'" (valueChange)="setSec('invitation','cardBgColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Radio borde ({{sec('invitation')?.cardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('invitation')?.cardBorderRadius||8" (ngModelChange)="setSec('invitation','cardBorderRadius',+$event)"></div>
              <div class="pf"><label>Estilo borde</label>
                <app-custom-select [options]="borderStyleOptions" [value]="sec('invitation')?.cardBorderStyle || 'none'" (valueChange)="setSec('invitation','cardBorderStyle',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Grosor borde ({{sec('invitation')?.cardBorderWidth ?? 1}}px)</label><input type="range" class="pinput-range" min="1" max="5" [ngModel]="sec('invitation')?.cardBorderWidth ?? 1" (ngModelChange)="setSec('invitation','cardBorderWidth',+$event)"></div>
              <div class="pf"><label>Color de borde</label><app-color-picker [value]="sec('invitation')?.cardBorderColor || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="setSec('invitation','cardBorderColor',$event)"></app-color-picker></div>
              @if (sec('invitation')?.cardBorderStyle === 'glow' || sec('invitation')?.cardBorderStyle === 'neon') {
                <div class="pf"><label>Color sombra</label><app-color-picker [value]="sec('invitation')?.cardGlowColor || '#d4a017'" (valueChange)="setSec('invitation','cardGlowColor',$event)"></app-color-picker></div>
              }
              <div class="pf"><label>Forma de card</label>
                <app-custom-select [options]="cardShapeOptions" [value]="sec('invitation')?.cardShape || 'standard'" (valueChange)="setSec('invitation','cardShape',$event)"></app-custom-select>
              </div>
            </div>
          }

          <div class="accordion" [class.open]="expanded['inv-guests']" (click)="toggle('inv-guests')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['inv-guests'] ? 'expand_more' : 'chevron_right' }}</span><span>Invitados y Asistentes</span></div>
          </div>
          @if (expanded['inv-guests']) {
            <div class="accordion-body">
              <span class="pf-section-title">Chips de invitados</span>
              <div class="pf"><label>Color de fondo</label><app-color-picker [value]="sec('invitation')?.guestChipBg || cfg()!.theme.cardBg || 'rgba(212,160,23,0.15)'" (valueChange)="setSec('invitation','guestChipBg',$event)"></app-color-picker></div>
              <div class="pf"><label>Color de texto</label><app-color-picker [value]="sec('invitation')?.guestChipText || cfg()!.theme.textPrimary || '#ffffff'" (valueChange)="setSec('invitation','guestChipText',$event)"></app-color-picker></div>
              <div class="pf"><label>Color de borde</label><app-color-picker [value]="sec('invitation')?.guestChipBorder || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="setSec('invitation','guestChipBorder',$event)"></app-color-picker></div>
              <span class="pf-section-title" style="margin-top:8px">Contador de asistentes</span>
              <div class="pf"><label>Color de fondo</label><app-color-picker [value]="sec('invitation')?.countBg || cfg()!.theme.cardBg || 'rgba(212,160,23,0.1)'" (valueChange)="setSec('invitation','countBg',$event)"></app-color-picker></div>
              <div class="pf"><label>Color de texto</label><app-color-picker [value]="sec('invitation')?.countText || cfg()!.theme.navFooterText || '#d4a017'" (valueChange)="setSec('invitation','countText',$event)"></app-color-picker></div>
              <div class="pf"><label>Color de borde</label><app-color-picker [value]="sec('invitation')?.countBorder || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="setSec('invitation','countBorder',$event)"></app-color-picker></div>
            </div>
          }
        }

        <!-- ===== DETAILS ===== -->
        @if (canvasState.selectedSection() === 'details') {
          <!-- Modelo mini-secciones: se edita la card (Detalle N) seleccionada en el menú. -->
          @if (dcard(); as dc) {
            <!-- Acordeón "Encabezado de la sección" para TODAS las cards. En la 1ª edita el título
                 general (details.title); en las demás, el encabezado propio opcional (card.heading).
                 El estilo del encabezado va dentro del acordeón en ambos casos. -->
            <div class="accordion" [class.open]="expanded['det-general']" (click)="toggle('det-general')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['det-general'] ? 'expand_more' : 'chevron_right' }}</span><span>Encabezado de la sección</span></div>
            </div>
            @if (expanded['det-general']) {
              <div class="accordion-body">
                @if (dIdx() === 0) {
                  <p class="pf-hint">Encabezado general de la sección Detalles (se muestra arriba del primer detalle).</p>
                  <div class="pf"><label>Encabezado</label><input class="pinput" [ngModel]="sec('details')?.title" (ngModelChange)="setSec('details','title',$event)"></div>
                } @else {
                  <p class="pf-hint">Encabezado opcional de este detalle. Déjalo vacío si no quieres mostrar encabezado.</p>
                  <div class="pf"><label>Encabezado (opcional)</label><input class="pinput" [ngModel]="dc.heading || ''" (ngModelChange)="updateDCard('heading',$event)" placeholder="Vacío = sin encabezado"></div>
                }
                <!-- Estilo del encabezado (solo útil si hay encabezado visible). -->
                @if (dIdx() === 0 || dc.heading) {
                  <span class="pf-section-title" style="margin-top:10px">Estilo del encabezado</span>
                  <p class="pf-hint">Deja vacío para heredar del Tema Global.</p>
                  <div class="pf"><label>Fuente</label>
                    <app-custom-select [options]="themeFontOptions" [value]="ss('sectionHeadingFont')||''" (valueChange)="setSS('sectionHeadingFont',$event)"></app-custom-select>
                  </div>
                  <div class="pf"><label>Tamaño ({{ss('sectionHeadingSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('sectionHeadingSize')||''" (ngModelChange)="setSS('sectionHeadingSize',$event ? +$event : '')" min="12" max="72" placeholder="Hereda"></div>
                  <div class="pf"><label>Color</label><app-color-picker [value]="ss('sectionHeadingColor')||''" (valueChange)="setSS('sectionHeadingColor',$event)"></app-color-picker></div>
                }
              </div>
            }

            <div class="accordion" [class.open]="expanded['det-content']" (click)="toggle('det-content')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['det-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido</span></div>
            </div>
            @if (expanded['det-content']) {
              <div class="accordion-body">
                <div class="pf"><label>Nombre en el menú</label><input class="pinput" [ngModel]="dc.label || ''" (ngModelChange)="updateDCard('label',$event)" [placeholder]="'Detalle ' + (dIdx()+1)"></div>

                <!-- TÍTULO de la card + su estilo, juntos. -->
                <div class="pf"><label>Título de la card</label><input class="pinput" [ngModel]="dc.title" (ngModelChange)="updateDCard('title',$event)" placeholder="Título"></div>
                @if (dc.title) {
                  <span class="pf-section-title">Estilo del título</span>
                  <p class="pf-hint">Deja vacío para heredar del Tema Global.</p>
                  <div class="pf"><label>Fuente</label>
                    <app-custom-select [options]="themeFontOptions" [value]="ss('headingFont')||''" (valueChange)="setSS('headingFont',$event)"></app-custom-select>
                  </div>
                  <div class="pf"><label>Tamaño ({{ss('headingFontSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('headingFontSize')||''" (ngModelChange)="setSS('headingFontSize',$event ? +$event : '')" min="12" max="96" placeholder="Hereda"></div>
                  <div class="pf"><label>Color 1</label><app-color-picker [value]="ss('headingColor')||''" (valueChange)="setSS('headingColor',$event)"></app-color-picker></div>
                  <div class="pf"><label>Color 2 (degradado)</label><app-color-picker [value]="ss('headingColor2')||''" (valueChange)="setSS('headingColor2',$event)"></app-color-picker></div>
                  <div class="pf"><label>Ángulo ({{ss('headingGradientAngle') ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="ss('headingGradientAngle') ?? 135" (ngModelChange)="setSS('headingGradientAngle',+$event)"></div>
                  <div class="pf"><label>Intensidad ({{ss('headingGradientIntensity') ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="ss('headingGradientIntensity') ?? 50" (ngModelChange)="setSS('headingGradientIntensity',+$event)"></div>
                  <div class="pf"><label>Grosor ({{ss('headingFontWeight') ?? 400}})</label><input type="range" class="pinput-range" min="100" max="900" step="100" [ngModel]="ss('headingFontWeight') ?? 400" (ngModelChange)="setSS('headingFontWeight',+$event)"></div>
                }

                <!-- CONTENIDO: su estilo (fuente/color/tamaño) se configura DENTRO del editor
                     enriquecido, por eso aquí no hay controles de texto adicionales. -->
                <div class="pf"><label>Contenido</label>
                  <app-rich-text-editor [ngModel]="dc.content" (ngModelChange)="updateDCard('content',$event)" [placeholder]="'Escribe el contenido...'"></app-rich-text-editor>
                </div>
                <p class="pf-hint">El color, la fuente y el tamaño del contenido se ajustan desde la barra del editor de texto de arriba.</p>

                <!-- ICONO y ALINEACIÓN al final. -->
                <div class="pf" style="margin-top:10px"><label>Tipo de icono</label>
                  <div class="btn-row">
                    <button class="chip" [class.active]="dc.iconType === 'none' || !dc.iconType" (click)="updateDCard('iconType','none');$event.stopPropagation()">Sin icono</button>
                    <button class="chip" [class.active]="dc.iconType === 'emoji'" (click)="updateDCard('iconType','emoji');$event.stopPropagation()">Emoji</button>
                    <button class="chip" [class.active]="dc.iconType === 'image'" (click)="updateDCard('iconType','image');$event.stopPropagation()">Imagen</button>
                  </div>
                </div>
                @if (dc.iconType === 'emoji') {
                  <div class="pf"><label>Emoji</label>
                    <div class="emoji-grid">
                      @for (e of detailEmojis; track e) {
                        <button class="emoji-btn" [class.active]="dc.icon === e" (click)="updateDCard('icon',e);$event.stopPropagation()">{{e}}</button>
                      }
                    </div>
                  </div>
                }
                @if (dc.iconType === 'image') {
                  <div class="pf"><label>Imagen de icono</label>
                    @if (dc.iconUrl) {
                      <div class="icon-img-row">
                        <div class="icon-img-preview"><img [src]="dc.iconUrl" alt="icono"></div>
                        <button class="sm-btn" (click)="uploadDetailIcon(dIdx());$event.stopPropagation()">Cambiar</button>
                        <button class="delete-btn" (click)="updateDCard('iconUrl','');$event.stopPropagation()"><span class="material-icons">close</span></button>
                      </div>
                    } @else {
                      <button class="sm-btn" (click)="uploadDetailIcon(dIdx());$event.stopPropagation()"><span class="material-icons" style="font-size:14px;vertical-align:middle;margin-right:4px">upload</span>Subir imagen</button>
                    }
                    <p class="upload-hint"><span class="material-icons">info</span> Usa PNG, SVG o WebP con fondo transparente para mejores resultados.</p>
                  </div>
                }
                <button class="sm-btn" style="margin-top:10px" (click)="clearColors();$event.stopPropagation()">Limpiar estilos de texto</button>
              </div>
            }
          } @else {
            <div class="accordion-body">
              <p class="pf-hint">Selecciona un <b>Detalle</b> en el menú de secciones (izquierda) para editar su contenido y estilo, o usa <b>“+ Agregar Detalle”</b> para crear uno nuevo.</p>
            </div>
          }

          <div class="accordion" [class.open]="expanded['det-appear']" (click)="toggle('det-appear')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['det-appear'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
          </div>
          @if (expanded['det-appear'] && dcard()) {
            <div class="accordion-body">
              <p class="pf-hint">Apariencia de la card de este detalle (propia de "{{ dcard()?.label || ('Detalle ' + (dIdx()+1)) }}").</p>
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="dCardStyle('showCardBg') !== false" (ngModelChange)="updateDCardStyle('showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Color de fondo</label><app-color-picker [value]="dCardStyle('cardBgColor') || cfg()!.theme.cardBg || 'rgba(0,0,0,0.85)'" (valueChange)="updateDCardStyle('cardBgColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Radio borde ({{dCardStyle('cardBorderRadius') ?? 16}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="dCardStyle('cardBorderRadius') ?? 16" (ngModelChange)="updateDCardStyle('cardBorderRadius',+$event)"></div>
              <div class="pf"><label>Estilo borde</label>
                <app-custom-select [options]="borderStyleOptions" [value]="dCardStyle('cardBorderStyle') || 'none'" (valueChange)="updateDCardStyle('cardBorderStyle',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Grosor borde ({{dCardStyle('cardBorderWidth') ?? 1}}px)</label><input type="range" class="pinput-range" min="1" max="5" [ngModel]="dCardStyle('cardBorderWidth') ?? 1" (ngModelChange)="updateDCardStyle('cardBorderWidth',+$event)"></div>
              <div class="pf"><label>Color de borde</label><app-color-picker [value]="dCardStyle('cardBorderColor') || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="updateDCardStyle('cardBorderColor',$event)"></app-color-picker></div>
              @if (dCardStyle('cardBorderStyle') === 'glow' || dCardStyle('cardBorderStyle') === 'neon') {
                <div class="pf"><label>Color sombra</label><app-color-picker [value]="dCardStyle('cardGlowColor') || '#d4a017'" (valueChange)="updateDCardStyle('cardGlowColor',$event)"></app-color-picker></div>
              }
              <div class="pf"><label>Forma de card</label>
                <app-custom-select [options]="cardShapeOptions" [value]="dCardStyle('cardShape') || 'standard'" (valueChange)="updateDCardStyle('cardShape',$event)"></app-custom-select>
              </div>
            </div>
          }
        }

        <!-- ===== VENUES ===== -->
        @if (canvasState.selectedSection() === 'venues') {
          <!-- Modelo mini-secciones: se edita el Lugar (Lugar N) seleccionado en el menú. -->
          @if (vcard(); as vc) {
            <!-- Encabezado de la sección (todas las cards: 1ª=título general, resto=heading opcional) -->
            <div class="accordion" [class.open]="expanded['ven-general']" (click)="toggle('ven-general')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['ven-general'] ? 'expand_more' : 'chevron_right' }}</span><span>Encabezado de la sección</span></div>
            </div>
            @if (expanded['ven-general']) {
              <div class="accordion-body">
                @if (vIdx() === 0) {
                  <p class="pf-hint">Encabezado general de la sección Lugares (arriba del primer lugar).</p>
                  <div class="pf"><label>Encabezado</label><input class="pinput" [ngModel]="sec('venues')?.title || ''" (ngModelChange)="setSec('venues','title',$event)" placeholder="Lugares del Evento"></div>
                } @else {
                  <p class="pf-hint">Encabezado opcional de este lugar. Vacío = sin encabezado.</p>
                  <div class="pf"><label>Encabezado (opcional)</label><input class="pinput" [ngModel]="vc.heading || ''" (ngModelChange)="updateVCard('heading',$event)" placeholder="Vacío = sin encabezado"></div>
                }
                @if (vIdx() === 0 || vc.heading) {
                  <span class="pf-section-title" style="margin-top:10px">Estilo del encabezado</span>
                  <p class="pf-hint">Deja vacío para heredar del Tema Global.</p>
                  <div class="pf"><label>Fuente</label><app-custom-select [options]="themeFontOptions" [value]="ss('sectionHeadingFont')||''" (valueChange)="setSS('sectionHeadingFont',$event)"></app-custom-select></div>
                  <div class="pf"><label>Tamaño ({{ss('sectionHeadingSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('sectionHeadingSize')||''" (ngModelChange)="setSS('sectionHeadingSize',$event ? +$event : '')" min="12" max="72" placeholder="Hereda"></div>
                  <div class="pf"><label>Color</label><app-color-picker [value]="ss('sectionHeadingColor')||''" (valueChange)="setSS('sectionHeadingColor',$event)"></app-color-picker></div>
                }
              </div>
            }

            <!-- Contenido -->
            <div class="accordion" [class.open]="expanded['ven-content']" (click)="toggle('ven-content')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['ven-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido</span></div>
            </div>
            @if (expanded['ven-content']) {
              <div class="accordion-body">
                <div class="pf"><label>Nombre en el menú</label><input class="pinput" [ngModel]="vc.label || ''" (ngModelChange)="updateVCard('label',$event)" [placeholder]="'Lugar ' + (vIdx()+1)"></div>

                <!-- Título + estilo (con bicolor) -->
                <div class="pf"><label>Título</label><input class="pinput" [ngModel]="vc.title" (ngModelChange)="updateVCard('title',$event)" placeholder="Ej: Ceremonia religiosa"></div>
                @if (vc.title) {
                  <span class="pf-section-title">Estilo del título</span>
                  <p class="pf-hint">Deja vacío para heredar del Tema Global.</p>
                  <div class="pf"><label>Fuente</label><app-custom-select [options]="themeFontOptions" [value]="ss('headingFont')||''" (valueChange)="setSS('headingFont',$event)"></app-custom-select></div>
                  <div class="pf"><label>Tamaño ({{ss('headingFontSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('headingFontSize')||''" (ngModelChange)="setSS('headingFontSize',$event ? +$event : '')" min="12" max="96" placeholder="Hereda"></div>
                  <div class="pf"><label>Color 1</label><app-color-picker [value]="ss('headingColor')||''" (valueChange)="setSS('headingColor',$event)"></app-color-picker></div>
                  <div class="pf"><label>Color 2 (degradado)</label><app-color-picker [value]="ss('headingColor2')||''" (valueChange)="setSS('headingColor2',$event)"></app-color-picker></div>
                  <div class="pf"><label>Ángulo ({{ss('headingGradientAngle') ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="ss('headingGradientAngle') ?? 135" (ngModelChange)="setSS('headingGradientAngle',+$event)"></div>
                  <div class="pf"><label>Intensidad ({{ss('headingGradientIntensity') ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="ss('headingGradientIntensity') ?? 50" (ngModelChange)="setSS('headingGradientIntensity',+$event)"></div>
                  <div class="pf"><label>Grosor ({{ss('headingFontWeight') ?? 400}})</label><input type="range" class="pinput-range" min="100" max="900" step="100" [ngModel]="ss('headingFontWeight') ?? 400" (ngModelChange)="setSS('headingFontWeight',+$event)"></div>
                }

                <!-- Nombre del lugar = contenido (editor enriquecido) -->
                <div class="pf"><label>Nombre del lugar (contenido)</label>
                  <app-rich-text-editor [ngModel]="vc.nameHtml || vc.name || ''" (ngModelChange)="updateVCard('nameHtml',$event)" [placeholder]="'Nombre del recinto...'"></app-rich-text-editor>
                </div>
                <p class="pf-hint">El color, la fuente y el tamaño del nombre se ajustan desde la barra del editor.</p>
              </div>
            }

            <!-- Horario (control de hora + estilo del horario) -->
            <div class="accordion" [class.open]="expanded['ven-time']" (click)="toggle('ven-time')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['ven-time'] ? 'expand_more' : 'chevron_right' }}</span><span>Horario</span></div>
            </div>
            @if (expanded['ven-time']) {
              <div class="accordion-body">
                <div class="pf"><label>Hora</label>
                  <app-wheel-time-picker [value]="vc.time" (valueChange)="updateVCard('time',$event)"></app-wheel-time-picker>
                </div>
                <div class="pf"><label>Icono de reloj</label>
                  <app-custom-select [options]="venueTimeIconOptions" [value]="vTime('icon')||'schedule'" (valueChange)="setVTime('icon',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Fuente</label>
                  <app-custom-select [options]="themeFontOptions" [value]="vTime('font')||''" (valueChange)="setVTime('font',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Tamaño ({{vTime('fontSize') || 14}}px)</label><input type="range" class="pinput-range" min="10" max="32" [ngModel]="vTime('fontSize') || 14" (ngModelChange)="setVTime('fontSize',+$event)"></div>
                <div class="pf"><label>Color (icono y texto)</label><app-color-picker [value]="vTime('color') || cfg()!.theme.textSecondary || 'rgba(255,255,255,0.7)'" (valueChange)="setVTime('color',$event)"></app-color-picker></div>
              </div>
            }

            <!-- Ubicación: dirección + URL de Maps + botón "Cómo llegar" -->
            <div class="accordion" [class.open]="expanded['ven-btn']" (click)="toggle('ven-btn')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['ven-btn'] ? 'expand_more' : 'chevron_right' }}</span><span>Ubicación</span></div>
            </div>
            @if (expanded['ven-btn']) {
              <div class="accordion-body">
                <div class="pf"><label>Dirección</label>
                  <app-rich-text-editor [ngModel]="vc.addressHtml || vc.address || ''" (ngModelChange)="updateVCard('addressHtml',$event)" [placeholder]="'Calle, número, colonia...'"></app-rich-text-editor>
                </div>
                <div class="pf"><label>URL Google Maps</label><input class="pinput" [ngModel]="vc.mapsUrl" (ngModelChange)="updateVCard('mapsUrl',$event)" placeholder="https://maps.google.com/..."></div>
                <span class="pf-section-title" style="margin-top:10px">Botón "Cómo llegar"</span>
                <p class="pf-hint">Hereda del Tema Global; si configuras aquí, lo sustituye para este lugar.</p>
                <div class="pf"><label>Texto del botón</label><input class="pinput" [ngModel]="vBtn('text') || ''" (ngModelChange)="setVBtn('text',$event)" placeholder="Cómo llegar"></div>
                <div class="pf"><label>Icono</label>
                  <app-custom-select [options]="venueBtnIconOptions" [value]="vBtn('icon')||'map'" (valueChange)="setVBtn('icon',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Color de fondo</label><app-color-picker [value]="vBtn('bgColor') || cfg()!.theme.buttonBg || '#d4a017'" (valueChange)="setVBtn('bgColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Color de texto</label><app-color-picker [value]="vBtn('textColor') || cfg()!.theme.buttonText || '#1a1a2e'" (valueChange)="setVBtn('textColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Color de borde</label><app-color-picker [value]="vBtn('borderColor') || ''" (valueChange)="setVBtn('borderColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Radio borde ({{vBtn('borderRadius') ?? 24}}px)</label><input type="range" class="pinput-range" min="0" max="40" [ngModel]="vBtn('borderRadius') ?? 24" (ngModelChange)="setVBtn('borderRadius',+$event)"></div>
                <div class="pf"><label>Fuente</label>
                  <app-custom-select [options]="themeFontOptions" [value]="vBtn('font')||''" (valueChange)="setVBtn('font',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Tamaño ({{vBtn('fontSize') || 13}}px)</label><input type="range" class="pinput-range" min="10" max="24" [ngModel]="vBtn('fontSize') || 13" (ngModelChange)="setVBtn('fontSize',+$event)"></div>
              </div>
            }

            <!-- Apariencia de la card (por lugar) + icono del lugar -->
            <div class="accordion" [class.open]="expanded['ven-appear']" (click)="toggle('ven-appear')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['ven-appear'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
            </div>
            @if (expanded['ven-appear']) {
              <div class="accordion-body">
                <p class="pf-hint">Apariencia de la card de este lugar (propia de "{{ vc.label || ('Lugar ' + (vIdx()+1)) }}").</p>
                <!-- Icono del lugar (elección emoji/imagen/ninguno + estilo del contenedor del icono) -->
                <div class="pf"><label>Icono del lugar</label>
                  <div class="btn-row">
                    <button class="chip" [class.active]="vc.iconType === 'none' || !vc.iconType" (click)="updateVCard('iconType','none');$event.stopPropagation()">Sin icono</button>
                    <button class="chip" [class.active]="vc.iconType === 'emoji'" (click)="updateVCard('iconType','emoji');$event.stopPropagation()">Emoji</button>
                    <button class="chip" [class.active]="vc.iconType === 'image'" (click)="updateVCard('iconType','image');$event.stopPropagation()">Imagen</button>
                  </div>
                </div>
                @if (vc.iconType === 'emoji') {
                  <div class="pf"><label>Emoji</label>
                    <div class="emoji-grid">
                      @for (e of venueEmojis; track e) {
                        <button class="emoji-btn" [class.active]="vc.iconEmoji === e" (click)="updateVCard('iconEmoji',e);$event.stopPropagation()">{{e}}</button>
                      }
                    </div>
                  </div>
                }
                @if (vc.iconType === 'image') {
                  <div class="pf"><label>Imagen de icono</label>
                    @if (vc.icon) {
                      <div class="icon-img-row">
                        <div class="icon-img-preview"><img [src]="vc.icon" alt="icono"></div>
                        <button class="sm-btn" (click)="uploadVenueIcon(vIdx());$event.stopPropagation()">Cambiar</button>
                        <button class="delete-btn" (click)="updateVCard('icon','');$event.stopPropagation()"><span class="material-icons">close</span></button>
                      </div>
                    } @else {
                      <button class="sm-btn" (click)="uploadVenueIcon(vIdx());$event.stopPropagation()"><span class="material-icons" style="font-size:14px;vertical-align:middle;margin-right:4px">upload</span>Subir imagen</button>
                    }
                  </div>
                }
                @if (vc.iconType !== 'none') {
                  <div class="pf"><label>Estilo de icono</label>
                    <app-custom-select [options]="iconStyleOptions" [value]="sec('venues')?.iconStyle||'circle'" (valueChange)="setSec('venues','iconStyle',$event)"></app-custom-select>
                  </div>
                  <div class="pf"><label>Tamaño de icono</label>
                    <div class="btn-row">
                      <button class="chip" [class.active]="(vc.iconSize || 'small') === 'small'" (click)="updateVCard('iconSize','small');$event.stopPropagation()">Pequeño</button>
                      <button class="chip" [class.active]="vc.iconSize === 'medium'" (click)="updateVCard('iconSize','medium');$event.stopPropagation()">Mediano</button>
                      <button class="chip" [class.active]="vc.iconSize === 'large'" (click)="updateVCard('iconSize','large');$event.stopPropagation()">Grande</button>
                    </div>
                  </div>
                }
                <div class="toggle-row">
                  <span class="toggle-title">Fondo de card</span>
                  <label class="toggle-switch"><input type="checkbox" [ngModel]="vCardStyle('showCardBg') !== false" (ngModelChange)="updateVCardStyle('showCardBg',$event)"><span class="slider"></span></label>
                </div>
                <div class="pf"><label>Color de fondo</label><app-color-picker [value]="vCardStyle('cardBgColor') || cfg()!.theme.cardBg || 'rgba(0,0,0,0.85)'" (valueChange)="updateVCardStyle('cardBgColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Radio borde ({{vCardStyle('cardBorderRadius') ?? 16}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="vCardStyle('cardBorderRadius') ?? 16" (ngModelChange)="updateVCardStyle('cardBorderRadius',+$event)"></div>
                <div class="pf"><label>Estilo borde</label>
                  <app-custom-select [options]="borderStyleOptions" [value]="vCardStyle('cardBorderStyle') || 'none'" (valueChange)="updateVCardStyle('cardBorderStyle',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Grosor borde ({{vCardStyle('cardBorderWidth') ?? 1}}px)</label><input type="range" class="pinput-range" min="1" max="5" [ngModel]="vCardStyle('cardBorderWidth') ?? 1" (ngModelChange)="updateVCardStyle('cardBorderWidth',+$event)"></div>
                <div class="pf"><label>Color de borde</label><app-color-picker [value]="vCardStyle('cardBorderColor') || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="updateVCardStyle('cardBorderColor',$event)"></app-color-picker></div>
                @if (vCardStyle('cardBorderStyle') === 'glow' || vCardStyle('cardBorderStyle') === 'neon') {
                  <div class="pf"><label>Color sombra</label><app-color-picker [value]="vCardStyle('cardGlowColor') || '#d4a017'" (valueChange)="updateVCardStyle('cardGlowColor',$event)"></app-color-picker></div>
                }
                <div class="pf"><label>Forma de card</label>
                  <app-custom-select [options]="cardShapeOptions" [value]="vCardStyle('cardShape') || 'standard'" (valueChange)="updateVCardStyle('cardShape',$event)"></app-custom-select>
                </div>
              </div>
            }
          } @else {
            <div class="accordion-body">
              <p class="pf-hint">Selecciona un <b>Lugar</b> en el menú de secciones (izquierda) para editar su contenido y estilo, o usa <b>“+ Agregar Lugar”</b> para crear uno nuevo.</p>
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
                  <div class="item-head"><button class="delete-btn" (click)="removeItineraryItem(i);$event.stopPropagation()"><span class="material-icons">close</span></button></div>
                  <div class="pf"><label>Hora</label>
                    <app-wheel-time-picker [value]="item.time" (valueChange)="updateItineraryItem(i,'time',$event)"></app-wheel-time-picker>
                  </div>
                  <input class="pinput" [ngModel]="item.title" (ngModelChange)="updateItineraryItem(i,'title',$event)" placeholder="Titulo de actividad">
                  <textarea class="pinput sm" [ngModel]="item.description" (ngModelChange)="updateItineraryItem(i,'description',$event)" placeholder="Descripcion"></textarea>
                  <div class="pf"><label>Icono</label>
                    <div class="btn-row" style="margin-bottom:6px">
                      <button class="chip" [class.active]="item.iconType==='none'" (click)="updateItineraryItem(i,'iconType','none');$event.stopPropagation()">Sin icono</button>
                      <button class="chip" [class.active]="item.iconType==='emoji'||!item.iconType" (click)="updateItineraryItem(i,'iconType','emoji');$event.stopPropagation()">Emoji</button>
                      <button class="chip" [class.active]="item.iconType==='custom'" (click)="updateItineraryItem(i,'iconType','custom');$event.stopPropagation()">Imagen</button>
                    </div>
                    @if (item.iconType === 'emoji' || !item.iconType) {
                      <div class="emoji-grid">
                        @for (e of emojiOptions; track e) {
                          <button class="emoji-btn" [class.active]="item.icon === e" (click)="updateItineraryItem(i,'icon',e);$event.stopPropagation()">{{e}}</button>
                        }
                      </div>
                    }
                    @if (item.iconType === 'custom') {
                      @if (item.iconUrl) {
                        <div class="icon-img-row">
                          <div class="icon-img-preview"><img [src]="item.iconUrl" alt="icono"></div>
                          <button class="sm-btn" (click)="uploadItineraryIcon(i);$event.stopPropagation()">Cambiar</button>
                          <button class="delete-btn" (click)="updateItineraryItem(i,'iconUrl','');$event.stopPropagation()"><span class="material-icons">close</span></button>
                        </div>
                      } @else {
                        <button class="sm-btn" (click)="uploadItineraryIcon(i);$event.stopPropagation()"><span class="material-icons" style="font-size:14px;vertical-align:middle;margin-right:4px">upload</span>Subir imagen</button>
                      }
                      <p class="upload-hint"><span class="material-icons">info</span> Usa PNG, SVG o WebP con fondo transparente para mejores resultados. El JPG no admite transparencia.</p>
                    }
                  </div>
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
                <span class="toggle-title">Mostrar iconos</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('itinerary')?.showIcons !== false" (ngModelChange)="setSec('itinerary','showIcons',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Alineacion de linea</label>
                <div class="btn-row">
                  <button class="chip" [class.active]="sec('itinerary')?.timelineAlign==='left'" (click)="setSec('itinerary','timelineAlign','left');$event.stopPropagation()">Izquierda</button>
                  <button class="chip" [class.active]="!sec('itinerary')?.timelineAlign||sec('itinerary')?.timelineAlign==='center'" (click)="setSec('itinerary','timelineAlign','center');$event.stopPropagation()">Centro</button>
                  <button class="chip" [class.active]="sec('itinerary')?.timelineAlign==='right'" (click)="setSec('itinerary','timelineAlign','right');$event.stopPropagation()">Derecha</button>
                </div>
              </div>
              <div class="pf"><label>Estilo de linea</label>
                <div class="btn-row">
                  <button class="chip" [class.active]="!sec('itinerary')?.lineStyle||sec('itinerary')?.lineStyle==='solid'" (click)="setSec('itinerary','lineStyle','solid');$event.stopPropagation()">Aguja</button>
                  <button class="chip" [class.active]="sec('itinerary')?.lineStyle==='beam'" (click)="setSec('itinerary','lineStyle','beam');$event.stopPropagation()">Haz (glow)</button>
                  <button class="chip" [class.active]="sec('itinerary')?.lineStyle==='wave'" (click)="setSec('itinerary','lineStyle','wave');$event.stopPropagation()">Ondeada</button>
                  <button class="chip" [class.active]="sec('itinerary')?.lineStyle==='zigzag'" (click)="setSec('itinerary','lineStyle','zigzag');$event.stopPropagation()">Zigzag</button>
                  <button class="chip" [class.active]="sec('itinerary')?.lineStyle==='none'" (click)="setSec('itinerary','lineStyle','none');$event.stopPropagation()">Sin linea</button>
                </div>
              </div>
              <div class="pf"><label>Color de linea</label><app-color-picker [value]="sec('itinerary')?.lineColor || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.6)'" (valueChange)="setSec('itinerary','lineColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Relleno del circulo</label><app-color-picker [value]="sec('itinerary')?.dotBgColor || 'rgba(0,0,0,0)'" [showOpacity]="true" (valueChange)="setSec('itinerary','dotBgColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Borde del circulo</label><app-color-picker [value]="sec('itinerary')?.dotBorderColor || sec('itinerary')?.lineColor || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.5)'" (valueChange)="setSec('itinerary','dotBorderColor',$event)"></app-color-picker></div>
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('itinerary')?.showCardBg !== false" (ngModelChange)="setSec('itinerary','showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Color de fondo</label><app-color-picker [value]="sec('itinerary')?.cardBgColor || cfg()!.theme.cardBg || 'rgba(0,0,0,0.85)'" (valueChange)="setSec('itinerary','cardBgColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Radio borde ({{sec('itinerary')?.cardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('itinerary')?.cardBorderRadius||8" (ngModelChange)="setSec('itinerary','cardBorderRadius',+$event)"></div>
              <div class="pf"><label>Estilo borde</label>
                <app-custom-select [options]="borderStyleOptions" [value]="sec('itinerary')?.cardBorderStyle || 'none'" (valueChange)="setSec('itinerary','cardBorderStyle',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Grosor borde ({{sec('itinerary')?.cardBorderWidth ?? 1}}px)</label><input type="range" class="pinput-range" min="1" max="5" [ngModel]="sec('itinerary')?.cardBorderWidth ?? 1" (ngModelChange)="setSec('itinerary','cardBorderWidth',+$event)"></div>
              <div class="pf"><label>Color de borde</label><app-color-picker [value]="sec('itinerary')?.cardBorderColor || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="setSec('itinerary','cardBorderColor',$event)"></app-color-picker></div>
              @if (sec('itinerary')?.cardBorderStyle === 'glow' || sec('itinerary')?.cardBorderStyle === 'neon') {
                <div class="pf"><label>Color sombra</label><app-color-picker [value]="sec('itinerary')?.cardGlowColor || '#d4a017'" (valueChange)="setSec('itinerary','cardGlowColor',$event)"></app-color-picker></div>
              }
              <div class="pf"><label>Forma de card</label>
                <app-custom-select [options]="cardShapeOptions" [value]="sec('itinerary')?.cardShape || 'standard'" (valueChange)="setSec('itinerary','cardShape',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Tamano titulo ({{sec('itinerary')?.titleFontSize||16}}px)</label><input type="range" class="pinput-range" min="12" max="28" [ngModel]="sec('itinerary')?.titleFontSize||16" (ngModelChange)="setSec('itinerary','titleFontSize',+$event)"></div>
              <div class="pf"><label>Tamano descripcion ({{sec('itinerary')?.descFontSize||13}}px)</label><input type="range" class="pinput-range" min="10" max="20" [ngModel]="sec('itinerary')?.descFontSize||13" (ngModelChange)="setSec('itinerary','descFontSize',+$event)"></div>
              <div class="pf"><label>Tamano horario ({{sec('itinerary')?.timeFontSize||12}}px)</label><input type="range" class="pinput-range" min="9" max="16" [ngModel]="sec('itinerary')?.timeFontSize||12" (ngModelChange)="setSec('itinerary','timeFontSize',+$event)"></div>
              <div class="pf"><label>Orientacion del texto</label>
                <div class="btn-row">
                  <button class="chip" [class.active]="!sec('itinerary')?.textAlign||sec('itinerary')?.textAlign==='left'" (click)="setSec('itinerary','textAlign','left');$event.stopPropagation()">Izquierda</button>
                  <button class="chip" [class.active]="sec('itinerary')?.textAlign==='center'" (click)="setSec('itinerary','textAlign','center');$event.stopPropagation()">Centro</button>
                  <button class="chip" [class.active]="sec('itinerary')?.textAlign==='right'" (click)="setSec('itinerary','textAlign','right');$event.stopPropagation()">Derecha</button>
                </div>
              </div>
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
              @if (sec('gallery')?.title) {
                <span class="pf-section-title">Estilo del título</span>
                <p class="pf-hint">Deja vacío para heredar del Tema Global. Define dos colores para un título bicolor (degradado).</p>
                <div class="pf"><label>Fuente</label>
                  <app-custom-select [options]="themeFontOptions" [value]="ss('sectionHeadingFont')||''" (valueChange)="setSS('sectionHeadingFont',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Tamaño ({{ss('sectionHeadingSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('sectionHeadingSize')||''" (ngModelChange)="setSS('sectionHeadingSize',$event ? +$event : '')" min="12" max="96" placeholder="Hereda"></div>
                <div class="pf"><label>Color 1</label><app-color-picker [value]="ss('sectionHeadingColor')||''" (valueChange)="setSS('sectionHeadingColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Color 2 (degradado)</label><app-color-picker [value]="ss('sectionHeadingColor2')||''" (valueChange)="setSS('sectionHeadingColor2',$event)"></app-color-picker></div>
                <div class="pf"><label>Ángulo ({{ss('sectionHeadingGradientAngle') ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="ss('sectionHeadingGradientAngle') ?? 135" (ngModelChange)="setSS('sectionHeadingGradientAngle',+$event)"></div>
                <div class="pf"><label>Intensidad ({{ss('sectionHeadingGradientIntensity') ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="ss('sectionHeadingGradientIntensity') ?? 50" (ngModelChange)="setSS('sectionHeadingGradientIntensity',+$event)"></div>
              }
              <div class="pf" style="margin-top:8px"><label>Descripcion</label>
                <app-rich-text-editor [ngModel]="sec('gallery')?.descriptionHtml || sec('gallery')?.description || ''" (ngModelChange)="setSec('gallery','descriptionHtml',$event)" [placeholder]="'Descripción de la galería...'"></app-rich-text-editor>
              </div>
              <p class="pf-hint">El color, la fuente y el tamaño de la descripción se ajustan desde la barra del editor de texto de arriba.</p>
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
              <p class="hint">Max. 20 fotos, 10MB c/u. JPG, PNG, WebP.</p>
              <div class="items-header">
                <span>Fotos ({{photos().length}}/20)</span>
                @if (selectedPhotos.size > 0) {
                  <button class="photo-upload-btn delete" (click)="deleteSelectedPhotos();$event.stopPropagation()">Eliminar ({{selectedPhotos.size}})</button>
                } @else {
                  <button class="photo-upload-btn upload" [disabled]="uploadingPhotos || photos().length >= 20" (click)="uploadPhotos();$event.stopPropagation()">{{ uploadingPhotos ? 'Subiendo...' : '+ Subir' }}</button>
                }
              </div>
              <div class="photo-slots-grid">
                @for(p of photos();track p.id; let i = $index){
                  <div class="photo-slot filled" [class.selected]="selectedPhotos.has(p.id)" (click)="togglePhotoSelect(p.id);$event.stopPropagation()">
                    <img [src]="p.thumb_url || p.url" loading="lazy" decoding="async" width="52" height="52" (load)="onPhotoLoad($event)">
                    @if (selectedPhotos.has(p.id)) { <span class="slot-check"><span class="material-icons">check</span></span> }
                  </div>
                }
                @for(slot of getLoadingSlots(); track $index) {
                  <div class="photo-slot loading">
                    <div class="slot-spinner"></div>
                  </div>
                }
                @for(slot of getRemainingEmptySlots(); track $index) {
                  <div class="photo-slot empty" [class.disabled]="uploadingPhotos" (click)="!uploadingPhotos && uploadPhotos();$event.stopPropagation()">
                    <span class="material-icons">add_photo_alternate</span>
                  </div>
                }
              </div>
            </div>
          }
        }

        <!-- ===== DRESSCODE (mini-secciones por card, espejo de Detalles/Lugares) ===== -->
        @if (canvasState.selectedSection() === 'dresscode') {
          @if (dcard2(); as dc) {
            <!-- Encabezado de la sección (todas las cards: 1ª=título general, resto=heading opcional) -->
            <div class="accordion" [class.open]="expanded['dress-general']" (click)="toggle('dress-general')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['dress-general'] ? 'expand_more' : 'chevron_right' }}</span><span>Encabezado de la sección</span></div>
            </div>
            @if (expanded['dress-general']) {
              <div class="accordion-body">
                @if (dIdx2() === 0) {
                  <p class="pf-hint">Encabezado general de la sección Vestimenta (arriba de la primera vestimenta).</p>
                  <div class="pf"><label>Encabezado</label><input class="pinput" [ngModel]="sec('dresscode')?.title || ''" (ngModelChange)="setSec('dresscode','title',$event)" placeholder="Código de Vestimenta"></div>
                } @else {
                  <p class="pf-hint">Encabezado opcional de esta vestimenta. Vacío = sin encabezado.</p>
                  <div class="pf"><label>Encabezado (opcional)</label><input class="pinput" [ngModel]="dc.heading || ''" (ngModelChange)="updateDCard2('heading',$event)" placeholder="Vacío = sin encabezado"></div>
                }
                @if (dIdx2() === 0 || dc.heading) {
                  <span class="pf-section-title" style="margin-top:10px">Estilo del encabezado</span>
                  <p class="pf-hint">Deja vacío para heredar del Tema Global.</p>
                  <div class="pf"><label>Fuente</label>
                    <app-custom-select [options]="themeFontOptions" [value]="ss('sectionHeadingFont')||''" (valueChange)="setSS('sectionHeadingFont',$event)"></app-custom-select>
                  </div>
                  <div class="pf"><label>Tamaño ({{ss('sectionHeadingSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('sectionHeadingSize')||''" (ngModelChange)="setSS('sectionHeadingSize',$event ? +$event : '')" min="12" max="72" placeholder="Hereda"></div>
                  <div class="pf"><label>Color</label><app-color-picker [value]="ss('sectionHeadingColor')||''" (valueChange)="setSS('sectionHeadingColor',$event)"></app-color-picker></div>
                }
              </div>
            }

            <!-- Contenido de la card de vestimenta -->
            <div class="accordion" [class.open]="expanded['dress-content']" (click)="toggle('dress-content')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['dress-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido</span></div>
            </div>
            @if (expanded['dress-content']) {
              <div class="accordion-body">
                <div class="pf"><label>Nombre en el menú</label><input class="pinput" [ngModel]="dc.label || ''" (ngModelChange)="updateDCard2('label',$event)" [placeholder]="'Vestimenta ' + (dIdx2()+1)"></div>

                <!-- TÍTULO de la card + su estilo, juntos. -->
                <div class="pf"><label>Título de la card</label><input class="pinput" [ngModel]="dc.title" (ngModelChange)="updateDCard2('title',$event)" placeholder="Título"></div>
                @if (dc.title) {
                  <span class="pf-section-title">Estilo del título</span>
                  <p class="pf-hint">Deja vacío para heredar del Tema Global.</p>
                  <div class="pf"><label>Fuente</label>
                    <app-custom-select [options]="themeFontOptions" [value]="ss('headingFont')||''" (valueChange)="setSS('headingFont',$event)"></app-custom-select>
                  </div>
                  <div class="pf"><label>Tamaño ({{ss('headingFontSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('headingFontSize')||''" (ngModelChange)="setSS('headingFontSize',$event ? +$event : '')" min="12" max="96" placeholder="Hereda"></div>
                  <div class="pf"><label>Color 1</label><app-color-picker [value]="ss('headingColor')||''" (valueChange)="setSS('headingColor',$event)"></app-color-picker></div>
                  <div class="pf"><label>Color 2 (degradado)</label><app-color-picker [value]="ss('headingColor2')||''" (valueChange)="setSS('headingColor2',$event)"></app-color-picker></div>
                  <div class="pf"><label>Ángulo ({{ss('headingGradientAngle') ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="ss('headingGradientAngle') ?? 135" (ngModelChange)="setSS('headingGradientAngle',+$event)"></div>
                  <div class="pf"><label>Intensidad ({{ss('headingGradientIntensity') ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="ss('headingGradientIntensity') ?? 50" (ngModelChange)="setSS('headingGradientIntensity',+$event)"></div>
                  <div class="pf"><label>Grosor ({{ss('headingFontWeight') ?? 400}})</label><input type="range" class="pinput-range" min="100" max="900" step="100" [ngModel]="ss('headingFontWeight') ?? 400" (ngModelChange)="setSS('headingFontWeight',+$event)"></div>
                }

                <!-- DESCRIPCIÓN (editor enriquecido). -->
                <div class="pf"><label>Descripción</label>
                  <app-rich-text-editor [ngModel]="dc.descriptionHtml || dc.description || ''" (ngModelChange)="updateDCard2('descriptionHtml',$event)" [placeholder]="'Descripción de la vestimenta...'"></app-rich-text-editor>
                </div>
                <p class="pf-hint">El color, la fuente y el tamaño de la descripción se ajustan desde la barra del editor de texto de arriba.</p>

                <!-- IMÁGENES de ejemplo (de la card activa). -->
                <div class="pf" style="margin-top:10px">
                  <!-- Imágenes de ejemplo (hasta 4). Mismo estilo que Galería: header con botón
                       +Subir / Eliminar(N) y cuadrícula de slots compactos. Subir acepta multi-selección. -->
                  <div class="items-header">
                    <span>Imágenes ({{dc.images?.length || 0}}/4)</span>
                    @if (getSelectedDressImages(dIdx2()).length > 0) {
                      <button class="photo-upload-btn delete" (click)="deleteSelectedDressImages(dIdx2());$event.stopPropagation()">Eliminar ({{getSelectedDressImages(dIdx2()).length}})</button>
                    } @else {
                      <button class="photo-upload-btn upload" [disabled]="(dc.images?.length || 0) >= 4" (click)="uploadDresscodeImage(dIdx2());$event.stopPropagation()">+ Subir</button>
                    }
                  </div>
                  <div class="photo-slots-grid">
                    @for (img of dc.images || []; track img; let j=$index) {
                      <div class="photo-slot filled" [class.selected]="isDressImageSelected(dIdx2(), j)" (click)="toggleDressImageSelect(dIdx2(), j);$event.stopPropagation()">
                        <img [src]="img" alt="" loading="lazy">
                        @if (isDressImageSelected(dIdx2(), j)) { <span class="slot-check"><span class="material-icons">check</span></span> }
                      </div>
                    }
                    @for (slot of getDressEmptySlots(dIdx2()); track $index) {
                      <div class="photo-slot empty" (click)="uploadDresscodeImage(dIdx2());$event.stopPropagation()">
                        <span class="material-icons">add_photo_alternate</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Tamaño de imágenes. -->
                <div class="pf" style="margin-top:10px"><label>Tamaño de imágenes</label>
                  <div class="btn-row">
                    <button class="chip" [class.active]="(dc.imageSize || 'small') === 'small'" (click)="updateDCard2('imageSize','small');$event.stopPropagation()">Pequeño</button>
                    <button class="chip" [class.active]="dc.imageSize === 'medium'" (click)="updateDCard2('imageSize','medium');$event.stopPropagation()">Mediano</button>
                    <button class="chip" [class.active]="dc.imageSize === 'large'" (click)="updateDCard2('imageSize','large');$event.stopPropagation()">Grande</button>
                  </div>
                </div>
              </div>
            }
          } @else {
            <div class="accordion-body">
              <p class="pf-hint">Selecciona una <b>Vestimenta</b> en el menú de secciones, o usa <b>“+ Agregar Vestimenta”</b> para crear una.</p>
            </div>
          }

          <div class="accordion" [class.open]="expanded['dress-appear']" (click)="toggle('dress-appear')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['dress-appear'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
          </div>
          @if (expanded['dress-appear'] && dcard2()) {
            <div class="accordion-body">
              <p class="pf-hint">Apariencia de la card de esta vestimenta (propia de "{{ dcard2()?.label || ('Vestimenta ' + (dIdx2()+1)) }}").</p>
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="dcStyle2('showCardBg') !== false" (ngModelChange)="updateDCStyle2('showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Color de fondo</label><app-color-picker [value]="dcStyle2('cardBgColor') || cfg()!.theme.cardBg || 'rgba(0,0,0,0.85)'" (valueChange)="updateDCStyle2('cardBgColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Radio borde ({{dcStyle2('cardBorderRadius') ?? 16}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="dcStyle2('cardBorderRadius') ?? 16" (ngModelChange)="updateDCStyle2('cardBorderRadius',+$event)"></div>
              <div class="pf"><label>Estilo borde</label>
                <app-custom-select [options]="borderStyleOptions" [value]="dcStyle2('cardBorderStyle') || 'none'" (valueChange)="updateDCStyle2('cardBorderStyle',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Grosor borde ({{dcStyle2('cardBorderWidth') ?? 1}}px)</label><input type="range" class="pinput-range" min="1" max="5" [ngModel]="dcStyle2('cardBorderWidth') ?? 1" (ngModelChange)="updateDCStyle2('cardBorderWidth',+$event)"></div>
              <div class="pf"><label>Color de borde</label><app-color-picker [value]="dcStyle2('cardBorderColor') || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="updateDCStyle2('cardBorderColor',$event)"></app-color-picker></div>
              @if (dcStyle2('cardBorderStyle') === 'glow' || dcStyle2('cardBorderStyle') === 'neon') {
                <div class="pf"><label>Color sombra</label><app-color-picker [value]="dcStyle2('cardGlowColor') || '#d4a017'" (valueChange)="updateDCStyle2('cardGlowColor',$event)"></app-color-picker></div>
              }
              <div class="pf"><label>Forma de card</label>
                <app-custom-select [options]="cardShapeOptions" [value]="dcStyle2('cardShape') || 'standard'" (valueChange)="updateDCStyle2('cardShape',$event)"></app-custom-select>
              </div>
            </div>
          }
        }

        <!-- ===== GIFTS ===== -->
        @if (canvasState.selectedSection() === 'gifts') {
          <!-- ===== ENCABEZADO DE LA SECCIÓN ===== -->
          <div class="accordion" [class.open]="expanded['gifts-heading']" (click)="toggle('gifts-heading')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['gifts-heading'] ? 'expand_more' : 'chevron_right' }}</span><span>Encabezado de la sección</span></div>
          </div>
          @if (expanded['gifts-heading']) {
            <div class="accordion-body">
              <div class="pf"><label>Encabezado</label><input class="pinput" [ngModel]="sec('gifts')?.title" (ngModelChange)="setSec('gifts','title',$event)" placeholder="Vacío = sin encabezado"></div>
              @if (sec('gifts')?.title) {
                <span class="pf-section-title">Estilo del encabezado</span>
                <p class="pf-hint">Deja vacío para heredar del Tema Global. Define dos colores para bicolor.</p>
                <div class="pf"><label>Fuente</label>
                  <app-custom-select [options]="themeFontOptions" [value]="ss('sectionHeadingFont')||''" (valueChange)="setSS('sectionHeadingFont',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Tamaño ({{ss('sectionHeadingSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('sectionHeadingSize')||''" (ngModelChange)="setSS('sectionHeadingSize',$event ? +$event : '')" min="12" max="96" placeholder="Hereda"></div>
                <div class="pf"><label>Color 1</label><app-color-picker [value]="ss('sectionHeadingColor')||''" (valueChange)="setSS('sectionHeadingColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Color 2 (degradado)</label><app-color-picker [value]="ss('sectionHeadingColor2')||''" (valueChange)="setSS('sectionHeadingColor2',$event)"></app-color-picker></div>
                <div class="pf"><label>Ángulo ({{ss('sectionHeadingGradientAngle') ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="ss('sectionHeadingGradientAngle') ?? 135" (ngModelChange)="setSS('sectionHeadingGradientAngle',+$event)"></div>
                <div class="pf"><label>Intensidad ({{ss('sectionHeadingGradientIntensity') ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="ss('sectionHeadingGradientIntensity') ?? 50" (ngModelChange)="setSS('sectionHeadingGradientIntensity',+$event)"></div>
              }
              <!-- Descripción ÚNICA de la sección (va debajo del encabezado; ya no en las cards). -->
              <div class="pf" style="margin-top:10px"><label>Descripción de la sección</label>
                <app-rich-text-editor [ngModel]="sec('gifts')?.descriptionHtml || sec('gifts')?.description || ''" (ngModelChange)="setSec('gifts','descriptionHtml',$event)" [placeholder]="'Descripción de la sección de regalos...'"></app-rich-text-editor>
              </div>
            </div>
          }

          <!-- ===== CARD MESA DE REGALOS ===== -->
          <div class="accordion" [class.open]="expanded['gifts-list']" (click)="toggle('gifts-list')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['gifts-list'] ? 'expand_more' : 'chevron_right' }}</span><span>Mesa de Regalos</span></div>
          </div>
          @if (expanded['gifts-list']) {
            <div class="accordion-body">
              <!-- Título de la card + estilo (bicolor) -->
              <div class="pf"><label>Título de la card</label><input class="pinput" [ngModel]="sec('gifts')?.cardTitle" (ngModelChange)="setSec('gifts','cardTitle',$event)" placeholder="Ej. Tu presencia es mi mayor regalo"></div>
              <span class="pf-section-title">Estilo del título</span>
              <p class="pf-hint">Deja vacío para heredar del Tema Global. Define dos colores para bicolor.</p>
              <div class="pf"><label>Fuente</label>
                <app-custom-select [options]="themeFontOptions" [value]="ss('headingFont')||''" (valueChange)="setSS('headingFont',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Tamaño ({{ss('headingFontSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('headingFontSize')||''" (ngModelChange)="setSS('headingFontSize',$event ? +$event : '')" min="12" max="96" placeholder="Hereda"></div>
              <div class="pf"><label>Color 1</label><app-color-picker [value]="ss('headingColor')||''" (valueChange)="setSS('headingColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Color 2 (degradado)</label><app-color-picker [value]="ss('headingColor2')||''" (valueChange)="setSS('headingColor2',$event)"></app-color-picker></div>
              <div class="pf"><label>Ángulo ({{ss('headingGradientAngle') ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="ss('headingGradientAngle') ?? 135" (ngModelChange)="setSS('headingGradientAngle',+$event)"></div>
              <div class="pf"><label>Intensidad ({{ss('headingGradientIntensity') ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="ss('headingGradientIntensity') ?? 50" (ngModelChange)="setSS('headingGradientIntensity',+$event)"></div>
              <div class="pf"><label>Grosor ({{ss('headingFontWeight') ?? 400}})</label><input type="range" class="pinput-range" min="100" max="900" step="100" [ngModel]="ss('headingFontWeight') ?? 400" (ngModelChange)="setSS('headingFontWeight',+$event)"></div>

              <div class="pf" style="margin-top:8px"><label>Link de la lista</label><input class="pinput" [ngModel]="sec('gifts')?.link" (ngModelChange)="setSec('gifts','link',$event)" placeholder="https://..."></div>
              <div class="pf"><label>Texto del botón</label><input class="pinput" [ngModel]="sec('gifts')?.buttonText" (ngModelChange)="setSec('gifts','buttonText',$event)" placeholder="Ver Lista de Regalos"></div>
              <span class="pf-section-title">Estilo del botón</span>
              <p class="pf-hint">Deja vacío para usar el estilo del Tema Global.</p>
              <div class="pf"><label>Color de fondo</label><app-color-picker [value]="giftsBtn('bgColor') || cfg()!.theme.buttonBg || '#d4a017'" (valueChange)="setGiftsBtn('bgColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Color de texto</label><app-color-picker [value]="giftsBtn('textColor') || cfg()!.theme.buttonText || '#1a1a2e'" (valueChange)="setGiftsBtn('textColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Color de borde</label><app-color-picker [value]="giftsBtn('borderColor') || ''" (valueChange)="setGiftsBtn('borderColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Radio borde ({{giftsBtn('borderRadius') ?? 30}}px)</label><input type="range" class="pinput-range" min="0" max="40" [ngModel]="giftsBtn('borderRadius') ?? 30" (ngModelChange)="setGiftsBtn('borderRadius',+$event)"></div>

              <!-- Icono (estilo Lugares) -->
              <div class="pf"><label>Icono</label>
                <div class="btn-row">
                  <button class="chip" [class.active]="!sec('gifts')?.sectionIcon?.iconType || sec('gifts')?.sectionIcon?.iconType==='material'" (click)="setSectionIcon('gifts','material');$event.stopPropagation()">Default</button>
                  <button class="chip" [class.active]="sec('gifts')?.sectionIcon?.iconType==='emoji'" (click)="setSectionIcon('gifts','emoji');$event.stopPropagation()">Emoji</button>
                  <button class="chip" [class.active]="sec('gifts')?.sectionIcon?.iconType==='image'" (click)="setSectionIcon('gifts','image');$event.stopPropagation()">Imagen</button>
                  <button class="chip" [class.active]="sec('gifts')?.sectionIcon?.iconType==='none'" (click)="setSectionIcon('gifts','none');$event.stopPropagation()">Sin icono</button>
                </div>
              </div>
              @if (sec('gifts')?.sectionIcon?.iconType === 'emoji') {
                <div class="pf"><label>Emoji</label>
                  <div class="emoji-grid">
                    @for (e of giftEmojis; track e) {
                      <button class="emoji-btn" [class.active]="sec('gifts')?.sectionIcon?.icon === e" (click)="setSectionIconProp('gifts','icon',e);$event.stopPropagation()">{{e}}</button>
                    }
                  </div>
                </div>
              }
              @if (sec('gifts')?.sectionIcon?.iconType === 'image') {
                <div class="pf"><label>Imagen de icono</label>
                  @if (sec('gifts')?.sectionIcon?.iconUrl) {
                    <div class="icon-img-row">
                      <div class="icon-img-preview"><img [src]="sec('gifts')?.sectionIcon?.iconUrl" alt="icono"></div>
                      <button class="sm-btn" (click)="uploadGiftsIconImage('gifts');$event.stopPropagation()">Cambiar</button>
                      <button class="delete-btn" (click)="setSectionIconProp('gifts','iconUrl','');$event.stopPropagation()"><span class="material-icons">close</span></button>
                    </div>
                  } @else {
                    <button class="sm-btn" (click)="uploadGiftsIconImage('gifts');$event.stopPropagation()"><span class="material-icons" style="font-size:14px;vertical-align:middle;margin-right:4px">upload</span>Subir imagen</button>
                  }
                </div>
              }
              @if (sec('gifts')?.sectionIcon?.iconType !== 'none') {
                <div class="pf"><label>Tamaño de icono</label>
                  <div class="btn-row">
                    <button class="chip" [class.active]="(sec('gifts')?.iconSize || 'small') === 'small'" (click)="setSec('gifts','iconSize','small');$event.stopPropagation()">Pequeño</button>
                    <button class="chip" [class.active]="sec('gifts')?.iconSize === 'medium'" (click)="setSec('gifts','iconSize','medium');$event.stopPropagation()">Mediano</button>
                    <button class="chip" [class.active]="sec('gifts')?.iconSize === 'large'" (click)="setSec('gifts','iconSize','large');$event.stopPropagation()">Grande</button>
                  </div>
                </div>
              }

              <!-- Apariencia de la card (tipada cardStyle) -->
              <span class="pf-section-title" style="margin-top:10px">Apariencia de la card</span>
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="giftsCS('showCardBg') !== false" (ngModelChange)="setGiftsCS('showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Color de fondo</label><app-color-picker [value]="giftsCS('cardBgColor') || cfg()!.theme.cardBg || 'rgba(0,0,0,0.85)'" (valueChange)="setGiftsCS('cardBgColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Radio borde ({{giftsCS('cardBorderRadius') ?? 16}}px)</label><input type="range" class="pinput-range" min="0" max="50" [ngModel]="giftsCS('cardBorderRadius') ?? 16" (ngModelChange)="setGiftsCS('cardBorderRadius',+$event)"></div>
              <div class="pf"><label>Estilo borde</label>
                <app-custom-select [options]="borderStyleOptions" [value]="giftsCS('cardBorderStyle') || 'none'" (valueChange)="setGiftsCS('cardBorderStyle',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Grosor borde ({{giftsCS('cardBorderWidth') ?? 1}}px)</label><input type="range" class="pinput-range" min="1" max="5" [ngModel]="giftsCS('cardBorderWidth') ?? 1" (ngModelChange)="setGiftsCS('cardBorderWidth',+$event)"></div>
              <div class="pf"><label>Color de borde</label><app-color-picker [value]="giftsCS('cardBorderColor') || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="setGiftsCS('cardBorderColor',$event)"></app-color-picker></div>
              @if (giftsCS('cardBorderStyle') === 'glow' || giftsCS('cardBorderStyle') === 'neon') {
                <div class="pf"><label>Color sombra</label><app-color-picker [value]="giftsCS('cardGlowColor') || '#d4a017'" (valueChange)="setGiftsCS('cardGlowColor',$event)"></app-color-picker></div>
              }
              <div class="pf"><label>Forma de card</label>
                <app-custom-select [options]="cardShapeOptions" [value]="giftsCS('cardShape') || 'standard'" (valueChange)="setGiftsCS('cardShape',$event)"></app-custom-select>
              </div>
            </div>
          }

          <!-- ===== CARD DATOS BANCARIOS (TRANSFERENCIA) ===== -->
          <div class="accordion" [class.open]="expanded['gifts-transfer']" (click)="toggle('gifts-transfer')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['gifts-transfer'] ? 'expand_more' : 'chevron_right' }}</span><span>Datos Bancarios</span></div>
          </div>
          @if (expanded['gifts-transfer']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Activar transferencia</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('gifts')?.transfer?.enabled" (ngModelChange)="setSecNested('gifts','transfer','enabled',$event)"><span class="slider"></span></label>
              </div>
              @if (sec('gifts')?.transfer?.enabled) {
                <p class="pf-hint">La card muestra icono + descripción + botón. Los datos bancarios se ven en un popup al pulsar el botón.</p>

                <!-- Título de la card + su estilo PROPIO (bicolor) -->
                <div class="pf"><label>Título de la card</label><input class="pinput" [ngModel]="sec('gifts')?.transfer?.title" (ngModelChange)="setSecNested('gifts','transfer','title',$event)" placeholder="Ej. Transferencia bancaria"></div>
                @if (sec('gifts')?.transfer?.title) {
                  <span class="pf-section-title">Estilo del título</span>
                  <p class="pf-hint">Deja vacío para heredar del Tema Global. Define dos colores para bicolor.</p>
                  <div class="pf"><label>Fuente</label>
                    <app-custom-select [options]="themeFontOptions" [value]="transferTS('font')||''" (valueChange)="setTransferTS('font',$event)"></app-custom-select>
                  </div>
                  <div class="pf"><label>Tamaño ({{transferTS('size') || ''}}px)</label><input type="number" class="pinput" [ngModel]="transferTS('size')||''" (ngModelChange)="setTransferTS('size',$event ? +$event : null)" min="12" max="96" placeholder="Hereda"></div>
                  <div class="pf"><label>Color 1</label><app-color-picker [value]="transferTS('color')||''" (valueChange)="setTransferTS('color',$event)"></app-color-picker></div>
                  <div class="pf"><label>Color 2 (degradado)</label><app-color-picker [value]="transferTS('color2')||''" (valueChange)="setTransferTS('color2',$event)"></app-color-picker></div>
                  <div class="pf"><label>Ángulo ({{transferTS('gradientAngle') ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="transferTS('gradientAngle') ?? 135" (ngModelChange)="setTransferTS('gradientAngle',+$event)"></div>
                  <div class="pf"><label>Intensidad ({{transferTS('gradientIntensity') ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="transferTS('gradientIntensity') ?? 50" (ngModelChange)="setTransferTS('gradientIntensity',+$event)"></div>
                  <div class="pf"><label>Grosor ({{transferTS('fontWeight') ?? 400}})</label><input type="range" class="pinput-range" min="100" max="900" step="100" [ngModel]="transferTS('fontWeight') ?? 400" (ngModelChange)="setTransferTS('fontWeight',+$event)"></div>
                }
                <div class="pf" style="margin-top:8px"><label>Texto del botón</label><input class="pinput" [ngModel]="sec('gifts')?.transfer?.buttonText" (ngModelChange)="setSecNested('gifts','transfer','buttonText',$event)" placeholder="Ver datos bancarios"></div>
                <span class="pf-section-title">Estilo del botón</span>
                <p class="pf-hint">Deja vacío para usar el estilo del Tema Global.</p>
                <div class="pf"><label>Color de fondo</label><app-color-picker [value]="transferBtn('bgColor') || cfg()!.theme.buttonBg || '#d4a017'" (valueChange)="setTransferBtn('bgColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Color de texto</label><app-color-picker [value]="transferBtn('textColor') || cfg()!.theme.buttonText || '#1a1a2e'" (valueChange)="setTransferBtn('textColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Color de borde</label><app-color-picker [value]="transferBtn('borderColor') || ''" (valueChange)="setTransferBtn('borderColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Radio borde ({{transferBtn('borderRadius') ?? 30}}px)</label><input type="range" class="pinput-range" min="0" max="40" [ngModel]="transferBtn('borderRadius') ?? 30" (ngModelChange)="setTransferBtn('borderRadius',+$event)"></div>

                <!-- Icono (estilo Lugares) -->
                <div class="pf"><label>Icono</label>
                  <div class="btn-row">
                    <button class="chip" [class.active]="!sec('gifts')?.transfer?.sectionIcon?.iconType || sec('gifts')?.transfer?.sectionIcon?.iconType==='material'" (click)="setTransferIcon('material');$event.stopPropagation()">Default</button>
                    <button class="chip" [class.active]="sec('gifts')?.transfer?.sectionIcon?.iconType==='emoji'" (click)="setTransferIcon('emoji');$event.stopPropagation()">Emoji</button>
                    <button class="chip" [class.active]="sec('gifts')?.transfer?.sectionIcon?.iconType==='image'" (click)="setTransferIcon('image');$event.stopPropagation()">Imagen</button>
                    <button class="chip" [class.active]="sec('gifts')?.transfer?.sectionIcon?.iconType==='none'" (click)="setTransferIcon('none');$event.stopPropagation()">Sin icono</button>
                  </div>
                </div>
                @if (sec('gifts')?.transfer?.sectionIcon?.iconType === 'emoji') {
                  <div class="pf"><label>Emoji</label>
                    <div class="emoji-grid">
                      @for (e of giftEmojis; track e) {
                        <button class="emoji-btn" [class.active]="sec('gifts')?.transfer?.sectionIcon?.icon === e" (click)="setTransferIconProp('icon',e);$event.stopPropagation()">{{e}}</button>
                      }
                    </div>
                  </div>
                }
                @if (sec('gifts')?.transfer?.sectionIcon?.iconType === 'image') {
                  <div class="pf"><label>Imagen de icono</label>
                    @if (sec('gifts')?.transfer?.sectionIcon?.iconUrl) {
                      <div class="icon-img-row">
                        <div class="icon-img-preview"><img [src]="sec('gifts')?.transfer?.sectionIcon?.iconUrl" alt="icono"></div>
                        <button class="sm-btn" (click)="uploadGiftsIconImage('transfer');$event.stopPropagation()">Cambiar</button>
                        <button class="delete-btn" (click)="setTransferIconProp('iconUrl','');$event.stopPropagation()"><span class="material-icons">close</span></button>
                      </div>
                    } @else {
                      <button class="sm-btn" (click)="uploadGiftsIconImage('transfer');$event.stopPropagation()"><span class="material-icons" style="font-size:14px;vertical-align:middle;margin-right:4px">upload</span>Subir imagen</button>
                    }
                  </div>
                }
                @if (sec('gifts')?.transfer?.sectionIcon?.iconType !== 'none') {
                  <div class="pf"><label>Tamaño de icono</label>
                    <div class="btn-row">
                      <button class="chip" [class.active]="(sec('gifts')?.transfer?.iconSize || 'small') === 'small'" (click)="setSecNested('gifts','transfer','iconSize','small');$event.stopPropagation()">Pequeño</button>
                      <button class="chip" [class.active]="sec('gifts')?.transfer?.iconSize === 'medium'" (click)="setSecNested('gifts','transfer','iconSize','medium');$event.stopPropagation()">Mediano</button>
                      <button class="chip" [class.active]="sec('gifts')?.transfer?.iconSize === 'large'" (click)="setSecNested('gifts','transfer','iconSize','large');$event.stopPropagation()">Grande</button>
                    </div>
                  </div>
                }

                <!-- Datos bancarios -->
                <span class="pf-section-title" style="margin-top:10px">Datos de la cuenta</span>
                <div class="pf"><label>Titular</label><input class="pinput" [ngModel]="sec('gifts')?.transfer?.accountName" (ngModelChange)="setSecNested('gifts','transfer','accountName',$event)"></div>
                <div class="pf"><label>Banco</label><input class="pinput" [ngModel]="sec('gifts')?.transfer?.bank" (ngModelChange)="setSecNested('gifts','transfer','bank',$event)"></div>
                <div class="pf"><label>Tipo de cuenta</label>
                  <app-custom-select [options]="accountTypeOptions" [value]="sec('gifts')?.transfer?.accountType||'cuenta'" (valueChange)="setSecNested('gifts','transfer','accountType',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Número</label><input class="pinput" [ngModel]="sec('gifts')?.transfer?.accountNumber" (ngModelChange)="setSecNested('gifts','transfer','accountNumber',$event)"></div>

                <!-- Apariencia de la card/modal de transferencia -->
                <span class="pf-section-title" style="margin-top:10px">Apariencia de la card / popup</span>
                <div class="toggle-row">
                  <span class="toggle-title">Fondo de card</span>
                  <label class="toggle-switch"><input type="checkbox" [ngModel]="transferCS('showCardBg') !== false" (ngModelChange)="setTransferCS('showCardBg',$event)"><span class="slider"></span></label>
                </div>
                <div class="pf"><label>Color de fondo</label><app-color-picker [value]="transferCS('cardBgColor') || cfg()!.theme.cardBg || 'rgba(0,0,0,0.85)'" (valueChange)="setTransferCS('cardBgColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Radio borde ({{transferCS('cardBorderRadius') ?? 16}}px)</label><input type="range" class="pinput-range" min="0" max="50" [ngModel]="transferCS('cardBorderRadius') ?? 16" (ngModelChange)="setTransferCS('cardBorderRadius',+$event)"></div>
                <div class="pf"><label>Estilo borde</label>
                  <app-custom-select [options]="borderStyleOptions" [value]="transferCS('cardBorderStyle') || 'none'" (valueChange)="setTransferCS('cardBorderStyle',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Grosor borde ({{transferCS('cardBorderWidth') ?? 1}}px)</label><input type="range" class="pinput-range" min="1" max="5" [ngModel]="transferCS('cardBorderWidth') ?? 1" (ngModelChange)="setTransferCS('cardBorderWidth',+$event)"></div>
                <div class="pf"><label>Color de borde</label><app-color-picker [value]="transferCS('cardBorderColor') || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="setTransferCS('cardBorderColor',$event)"></app-color-picker></div>
                @if (transferCS('cardBorderStyle') === 'glow' || transferCS('cardBorderStyle') === 'neon') {
                  <div class="pf"><label>Color sombra</label><app-color-picker [value]="transferCS('cardGlowColor') || '#d4a017'" (valueChange)="setTransferCS('cardGlowColor',$event)"></app-color-picker></div>
                }
                <div class="pf"><label>Forma de card</label>
                  <app-custom-select [options]="cardShapeOptions" [value]="transferCS('cardShape') || 'standard'" (valueChange)="setTransferCS('cardShape',$event)"></app-custom-select>
                </div>
              }
            </div>
          }

          <!-- ===== PARTÍCULAS DE LA SECCIÓN ===== -->
          <div class="accordion" [class.open]="expanded['gifts-particles']" (click)="toggle('gifts-particles')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['gifts-particles'] ? 'expand_more' : 'chevron_right' }}</span><span>Partículas</span></div>
          </div>
          @if (expanded['gifts-particles']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Activar partículas</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="giftsParticlesProp('enabled')" (ngModelChange)="setSecNested('gifts','particles','enabled',$event)"><span class="slider"></span></label>
              </div>
              @if (giftsParticlesProp('enabled')) {
                <div class="pf"><label>Tipo</label>
                  <app-custom-select [options]="giftsParticleTypeOptions" [value]="giftsParticlesProp('type')||'sparkles'" (valueChange)="setSecNested('gifts','particles','type',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Dirección</label>
                  <app-custom-select [options]="introParticleDirectionOptions" [value]="giftsParticlesProp('direction')||'up'" (valueChange)="setSecNested('gifts','particles','direction',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Color 1</label><app-color-picker [value]="giftsParticlesProp('color1')||'#d4a017'" (valueChange)="setSecNested('gifts','particles','color1',$event)"></app-color-picker></div>
                <div class="pf"><label>Color 2</label><app-color-picker [value]="giftsParticlesProp('color2')||'#ffffff'" (valueChange)="setSecNested('gifts','particles','color2',$event)"></app-color-picker></div>
                <p class="pf-hint">Los colores aplican a las partículas de formas; los tipos temáticos (🌸🎁🎀💖💵🪙) usan su emoji.</p>
                <div class="pf"><label>Cantidad ({{giftsParticlesProp('quantity')||20}})</label><input type="range" class="pinput-range" min="5" max="80" [ngModel]="giftsParticlesProp('quantity')||20" (ngModelChange)="setSecNested('gifts','particles','quantity',+$event)"></div>
                <div class="pf"><label>Velocidad ({{giftsParticlesProp('speed')||5}})</label><input type="range" class="pinput-range" min="1" max="10" [ngModel]="giftsParticlesProp('speed')||5" (ngModelChange)="setSecNested('gifts','particles','speed',+$event)"></div>
                <div class="pf"><label>Tamaño ({{giftsParticlesProp('size')||4}})</label><input type="range" class="pinput-range" min="1" max="20" [ngModel]="giftsParticlesProp('size')||4" (ngModelChange)="setSecNested('gifts','particles','size',+$event)"></div>
                <div class="pf"><label>Opacidad ({{giftsParticlesProp('opacity')||0.8}})</label><input type="range" class="pinput-range" min="0.1" max="1" step="0.1" [ngModel]="giftsParticlesProp('opacity')||0.8" (ngModelChange)="setSecNested('gifts','particles','opacity',+$event)"></div>
              }
            </div>
          }

          <!-- Toggle "Estilo de Sección" genérico (fondo/transición/animación/ornamento) sigue abajo. -->
        }

        <!-- ===== RSVP ===== -->
        @if (canvasState.selectedSection() === 'rsvp') {
          <div class="accordion" [class.open]="expanded['rsvp-content']" (click)="toggle('rsvp-content')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['rsvp-content'] ? 'expand_more' : 'chevron_right' }}</span><span>Contenido</span></div>
          </div>
          @if (expanded['rsvp-content']) {
            <div class="accordion-body">
              <div class="pf"><label>Titulo</label><input class="pinput" [ngModel]="sec('rsvp')?.title" (ngModelChange)="setSec('rsvp','title',$event)"></div>
              <div class="pf"><label>Icono de seccion</label>
                <div class="btn-row">
                  <button class="chip" [class.active]="!sec('rsvp')?.sectionIcon?.iconType || sec('rsvp')?.sectionIcon?.iconType==='material'" (click)="setSectionIcon('rsvp','material');$event.stopPropagation()">Default</button>
                  <button class="chip" [class.active]="sec('rsvp')?.sectionIcon?.iconType==='emoji'" (click)="setSectionIcon('rsvp','emoji');$event.stopPropagation()">Emoji</button>
                  <button class="chip" [class.active]="sec('rsvp')?.sectionIcon?.iconType==='none'" (click)="setSectionIcon('rsvp','none');$event.stopPropagation()">Sin icono</button>
                </div>
              </div>
              @if (sec('rsvp')?.sectionIcon?.iconType === 'emoji') {
                <div class="pf"><label>Emoji</label>
                  <div class="emoji-grid">
                    @for (e of rsvpEmojis; track e) {
                      <button class="emoji-btn" [class.active]="sec('rsvp')?.sectionIcon?.icon === e" (click)="setSectionIconProp('rsvp','icon',e);$event.stopPropagation()">{{e}}</button>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <div class="accordion" [class.open]="expanded['rsvp-fields']" (click)="toggle('rsvp-fields')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['rsvp-fields'] ? 'expand_more' : 'chevron_right' }}</span><span>Campos de Registro</span></div>
          </div>
          @if (expanded['rsvp-fields']) {
            <div class="accordion-body">
              <p class="hint">Configura los campos del formulario. Nombre siempre es obligatorio.</p>
              @for (field of getRegFields(); track field.key; let i=$index) {
                <div class="item-card" style="flex-direction:row;align-items:center;gap:6px;">
                  <span style="font-size:10px;color:rgba(255,255,255,0.5);min-width:50px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{field.label}}</span>
                  <button class="chip" [class.active]="field.required" (click)="toggleRegFieldRequired(i);$event.stopPropagation()" style="font-size:9px;padding:3px 6px">{{field.required ? 'Oblig.' : 'Opc.'}}</button>
                  @if (field.key !== 'name') {
                    <button class="delete-btn" (click)="removeRegField(i);$event.stopPropagation()"><span class="material-icons">close</span></button>
                  }
                </div>
              }
              <button class="sm-btn" style="margin-top:6px;" (click)="addRegField();$event.stopPropagation()">+ Agregar campo</button>
            </div>
          }

          <div class="accordion" [class.open]="expanded['rsvp-appear']" (click)="toggle('rsvp-appear')">
            <div class="accordion-header"><span class="material-icons">{{ expanded['rsvp-appear'] ? 'expand_more' : 'chevron_right' }}</span><span>Apariencia de Cards</span></div>
          </div>
          @if (expanded['rsvp-appear']) {
            <div class="accordion-body">
              <div class="toggle-row">
                <span class="toggle-title">Fondo de card</span>
                <label class="toggle-switch"><input type="checkbox" [ngModel]="sec('rsvp')?.showCardBg !== false" (ngModelChange)="setSec('rsvp','showCardBg',$event)"><span class="slider"></span></label>
              </div>
              <div class="pf"><label>Color de fondo</label><app-color-picker [value]="sec('rsvp')?.cardBgColor || cfg()!.theme.cardBg || 'rgba(0,0,0,0.85)'" (valueChange)="setSec('rsvp','cardBgColor',$event)"></app-color-picker></div>
              <div class="pf"><label>Radio borde ({{sec('rsvp')?.cardBorderRadius||8}}px)</label><input type="range" class="pinput-range" min="0" max="24" [ngModel]="sec('rsvp')?.cardBorderRadius||8" (ngModelChange)="setSec('rsvp','cardBorderRadius',+$event)"></div>
              <div class="pf"><label>Estilo borde</label>
                <app-custom-select [options]="borderStyleOptions" [value]="sec('rsvp')?.cardBorderStyle || 'none'" (valueChange)="setSec('rsvp','cardBorderStyle',$event)"></app-custom-select>
              </div>
              <div class="pf"><label>Grosor borde ({{sec('rsvp')?.cardBorderWidth ?? 1}}px)</label><input type="range" class="pinput-range" min="1" max="5" [ngModel]="sec('rsvp')?.cardBorderWidth ?? 1" (ngModelChange)="setSec('rsvp','cardBorderWidth',+$event)"></div>
              <div class="pf"><label>Color de borde</label><app-color-picker [value]="sec('rsvp')?.cardBorderColor || cfg()!.theme.cardBorder || 'rgba(212,160,23,0.3)'" (valueChange)="setSec('rsvp','cardBorderColor',$event)"></app-color-picker></div>
              @if (sec('rsvp')?.cardBorderStyle === 'glow' || sec('rsvp')?.cardBorderStyle === 'neon') {
                <div class="pf"><label>Color sombra</label><app-color-picker [value]="sec('rsvp')?.cardGlowColor || '#d4a017'" (valueChange)="setSec('rsvp','cardGlowColor',$event)"></app-color-picker></div>
              }
              <div class="pf"><label>Forma de card</label>
                <app-custom-select [options]="cardShapeOptions" [value]="sec('rsvp')?.cardShape || 'standard'" (valueChange)="setSec('rsvp','cardShape',$event)"></app-custom-select>
              </div>
            </div>
          }
        }

        <!-- ===== COMMON SECTION STYLE (excluido para envelope/intro/hero; en details/venues requiere ítem seleccionado) ===== -->
        @if (canvasState.selectedSection() !== 'envelope' && canvasState.selectedSection() !== 'intro' && canvasState.selectedSection() !== 'hero' && !(canvasState.selectedSection() === 'details' && dIdx() < 0) && !(canvasState.selectedSection() === 'venues' && vIdx() < 0) && !(canvasState.selectedSection() === 'dresscode' && dIdx2() < 0)) {
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
                @if(ss('bgType')==='linear'){
                  <div class="pf"><label>Color 2</label><app-color-picker [value]="ss('bgColor2')||'#eee'" (valueChange)="setSS('bgColor2',$event)"></app-color-picker></div>
                  <div class="pf"><label>Angulo ({{ss('bgAngle') ?? 180}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="ss('bgAngle') ?? 180" (ngModelChange)="setSS('bgAngle',+$event)"></div>
                  <div class="pf"><label>Intensidad ({{ss('bgIntensity') ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="ss('bgIntensity') ?? 50" (ngModelChange)="setSS('bgIntensity',+$event)"></div>
                }
                @if(ss('bgType')==='image'){
                  <app-background-control [model]="sectionMediaModel()" (modelChange)="setSectionMediaModel($event)"></app-background-control>
                }
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
                  <button class="chip" [class.active]="ss('dividerType')==='mountains'" (click)="setSS('dividerType','mountains');$event.stopPropagation()">Montañas</button>
                  <button class="chip" [class.active]="ss('dividerType')==='drops'" (click)="setSS('dividerType','drops');$event.stopPropagation()">Gotas</button>
                  <button class="chip" [class.active]="ss('dividerType')==='arrow'" (click)="setSS('dividerType','arrow');$event.stopPropagation()">Flecha</button>
                </div>
                @if (ss('dividerType') && ss('dividerType') !== 'none') {
                  <div class="toggle-row" style="margin-top:8px">
                    <span class="toggle-title">Invertir</span>
                    <label class="toggle-switch"><input type="checkbox" [ngModel]="ss('dividerFlip')" (ngModelChange)="setSS('dividerFlip',$event)"><span class="slider"></span></label>
                  </div>
                  <div class="pf"><label>Alto ({{ss('dividerHeight') || 50}}px)</label><input type="range" class="pinput-range" min="20" max="100" [ngModel]="ss('dividerHeight') || 50" (ngModelChange)="setSS('dividerHeight',+$event)"></div>
                  <div class="pf"><label>Borde grosor ({{ss('dividerStrokeWidth') || 0}}px)</label><input type="range" class="pinput-range" min="0" max="5" step="0.5" [ngModel]="ss('dividerStrokeWidth') || 0" (ngModelChange)="setSS('dividerStrokeWidth',+$event)"></div>
                  @if (ss('dividerStrokeWidth') > 0) {
                    <div class="pf"><label>Color borde</label><app-color-picker [value]="ss('dividerStrokeColor')||'#ffffff'" (valueChange)="setSS('dividerStrokeColor',$event)"></app-color-picker></div>
                    <div class="pf"><label>Opacidad borde ({{(ss('dividerStrokeOpacity') ?? 1) * 100}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="(ss('dividerStrokeOpacity') ?? 1) * 100" (ngModelChange)="setSS('dividerStrokeOpacity',$event / 100)"></div>
                  }
                }
              </div>
            }

            <!-- "Texto de Sección" NO se muestra en Detalles/Lugares/Vestimenta/Galería: sus
                 controles de texto (Encabezado/Título/Contenido) ya viven en el acordeón "Contenido"
                 de cada sección, así que el acordeón genérico sería redundante. -->
            @if (canvasState.selectedSection() !== 'details' && canvasState.selectedSection() !== 'venues' && canvasState.selectedSection() !== 'dresscode' && canvasState.selectedSection() !== 'gallery') {
            <div class="accordion" [class.open]="expanded['sec-txt']" (click)="toggle('sec-txt')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['sec-txt'] ? 'expand_more' : 'chevron_right' }}</span><span>Texto de Seccion</span></div>
            </div>
            @if (expanded['sec-txt']) {
              <div class="accordion-body">
                <span class="pf-section-title">Encabezado</span>
                <div class="pf"><label>Fuente</label>
                  <app-custom-select [options]="themeFontOptions" [value]="ss('sectionHeadingFont')||''" (valueChange)="setSS('sectionHeadingFont',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Tamano ({{ss('sectionHeadingSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('sectionHeadingSize')||''" (ngModelChange)="setSS('sectionHeadingSize',$event ? +$event : '')" min="12" max="72" placeholder="Hereda"></div>
                <div class="pf"><label>Color</label><app-color-picker [value]="ss('sectionHeadingColor')||''" (valueChange)="setSS('sectionHeadingColor',$event)"></app-color-picker></div>

                <span class="pf-section-title" style="margin-top:8px">Titulos</span>
                <div class="pf"><label>Fuente</label>
                  <app-custom-select [options]="themeFontOptions" [value]="ss('headingFont')||''" (valueChange)="setSS('headingFont',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Tamano ({{ss('headingFontSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('headingFontSize')||''" (ngModelChange)="setSS('headingFontSize',$event ? +$event : '')" min="12" max="96" placeholder="Hereda"></div>
                <div class="pf"><label>Color 1</label><app-color-picker [value]="ss('headingColor')||''" (valueChange)="setSS('headingColor',$event)"></app-color-picker></div>
                <div class="pf"><label>Color 2</label><app-color-picker [value]="ss('headingColor2')||''" (valueChange)="setSS('headingColor2',$event)"></app-color-picker></div>
                <div class="pf"><label>Angulo ({{ss('headingGradientAngle') ?? 135}}°)</label><input type="range" class="pinput-range" min="0" max="360" [ngModel]="ss('headingGradientAngle') ?? 135" (ngModelChange)="setSS('headingGradientAngle',+$event)"></div>
                <div class="pf"><label>Intensidad ({{ss('headingGradientIntensity') ?? 50}}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="ss('headingGradientIntensity') ?? 50" (ngModelChange)="setSS('headingGradientIntensity',+$event)"></div>
                <div class="pf"><label>Grosor ({{ss('headingFontWeight') ?? 400}})</label><input type="range" class="pinput-range" min="100" max="900" step="100" [ngModel]="ss('headingFontWeight') ?? 400" (ngModelChange)="setSS('headingFontWeight',+$event)"></div>

                <span class="pf-section-title" style="margin-top:8px">Contenido</span>
                <div class="pf"><label>Fuente</label>
                  <app-custom-select [options]="themeFontOptions" [value]="ss('contentFont')||''" (valueChange)="setSS('contentFont',$event)"></app-custom-select>
                </div>
                <div class="pf"><label>Tamano ({{ss('contentFontSize') || ''}}px)</label><input type="number" class="pinput" [ngModel]="ss('contentFontSize')||''" (ngModelChange)="setSS('contentFontSize',$event ? +$event : '')" min="10" max="36" placeholder="Hereda"></div>
                <div class="pf"><label>Color</label><app-color-picker [value]="ss('contentColor')||''" (valueChange)="setSS('contentColor',$event)"></app-color-picker></div>
                <button class="sm-btn" (click)="clearColors();$event.stopPropagation()">Limpiar todo</button>
              </div>
            }
            }

            <div class="accordion" [class.open]="expanded['sec-anim']" (click)="toggle('sec-anim')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['sec-anim'] ? 'expand_more' : 'chevron_right' }}</span><span>Animacion</span></div>
            </div>
            @if (expanded['sec-anim']) {
              <div class="accordion-body">
                <div class="btn-row">
                  <button class="chip" [class.active]="!ss('animation')||ss('animation')==='inherit'" (click)="setSS('animation','inherit');$event.stopPropagation()">Hereda</button>
                  <button class="chip" [class.active]="ss('animation')==='fade-up'" (click)="setSS('animation','fade-up');$event.stopPropagation()">Fade Up</button>
                  <button class="chip" [class.active]="ss('animation')==='fade-in'" (click)="setSS('animation','fade-in');$event.stopPropagation()">Fade In</button>
                  <button class="chip" [class.active]="ss('animation')==='slide-left'" (click)="setSS('animation','slide-left');$event.stopPropagation()">Slide Left</button>
                  <button class="chip" [class.active]="ss('animation')==='slide-right'" (click)="setSS('animation','slide-right');$event.stopPropagation()">Slide Right</button>
                  <button class="chip" [class.active]="ss('animation')==='scale'" (click)="setSS('animation','scale');$event.stopPropagation()">Scale</button>
                  <button class="chip" [class.active]="ss('animation')==='none'" (click)="setSS('animation','none');$event.stopPropagation()">Ninguna</button>
                </div>
              </div>
            }

            <div class="accordion" [class.open]="expanded['sec-presets']" (click)="toggle('sec-presets')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['sec-presets'] ? 'expand_more' : 'chevron_right' }}</span><span>Presets Rapidos</span></div>
            </div>
            @if (expanded['sec-presets']) {
              <div class="accordion-body">
                <div class="btn-row">
                  <button class="chip" (click)="applySectionPreset('light');$event.stopPropagation()">☀ Claro</button>
                  <button class="chip" (click)="applySectionPreset('dark');$event.stopPropagation()">🌙 Oscuro</button>
                  <button class="chip" (click)="applySectionPreset('wine');$event.stopPropagation()">🍷 Vino</button>
                  <button class="chip" (click)="applySectionPreset('transparent');$event.stopPropagation()">◻ Transparente</button>
                </div>
              </div>
            }

            <div class="accordion" [class.open]="expanded['sec-ornament']" (click)="toggle('sec-ornament')">
              <div class="accordion-header"><span class="material-icons">{{ expanded['sec-ornament'] ? 'expand_more' : 'chevron_right' }}</span><span>Adorno de Titulo</span></div>
            </div>
            @if (expanded['sec-ornament']) {
              <div class="accordion-body">
                <div class="pf"><label>Tipo</label>
                  <div class="btn-row">
                    <button class="chip" [class.active]="getOrnamentType()==='none'" (click)="setOrnament('type','none');$event.stopPropagation()">Ninguno</button>
                    <button class="chip" [class.active]="getOrnamentType()==='line'" (click)="setOrnament('type','line');$event.stopPropagation()">Linea</button>
                    <button class="chip" [class.active]="getOrnamentType()==='dots'" (click)="setOrnament('type','dots');$event.stopPropagation()">Puntos</button>
                    <button class="chip" [class.active]="getOrnamentType()==='sparkles'" (click)="setOrnament('type','sparkles');$event.stopPropagation()">Destellos</button>
                    <button class="chip" [class.active]="getOrnamentType()==='flourish'" (click)="setOrnament('type','flourish');$event.stopPropagation()">Floritura</button>
                    <button class="chip" [class.active]="getOrnamentType()==='dash'" (click)="setOrnament('type','dash');$event.stopPropagation()">Guion</button>
                    <button class="chip" [class.active]="getOrnamentType()==='arrows'" (click)="setOrnament('type','arrows');$event.stopPropagation()">Flechas</button>
                    <button class="chip" [class.active]="getOrnamentType()==='wave'" (click)="setOrnament('type','wave');$event.stopPropagation()">Onda</button>
                    <button class="chip" [class.active]="getOrnamentType()==='stars'" (click)="setOrnament('type','stars');$event.stopPropagation()">Estrellas ✦</button>
                    <button class="chip" [class.active]="getOrnamentType()==='hearts'" (click)="setOrnament('type','hearts');$event.stopPropagation()">Corazones ♥</button>
                    <button class="chip" [class.active]="getOrnamentType()==='diamonds'" (click)="setOrnament('type','diamonds');$event.stopPropagation()">Diamantes ◆</button>
                    <button class="chip" [class.active]="getOrnamentType()==='leaves'" (click)="setOrnament('type','leaves');$event.stopPropagation()">Hojas ❧</button>
                  </div>
                </div>
                @if (getOrnamentType() !== 'none') {
                  @if (canvasState.selectedSection() !== 'invitation') {
                    <div class="pf"><label>Posicion</label>
                      <app-custom-select [options]="ornamentPositionOptions" [value]="getOrnamentProp('position')||'below'" (valueChange)="setOrnament('position',$event)"></app-custom-select>
                    </div>
                  }
                  <div class="pf"><label>Color</label><app-color-picker [value]="getOrnamentProp('color')||'#d4a017'" (valueChange)="setOrnament('color',$event)"></app-color-picker></div>
                  <div class="pf"><label>Tamano ({{getOrnamentProp('size') || 1}}x)</label><input type="range" class="pinput-range" min="0.5" max="2" step="0.1" [ngModel]="getOrnamentProp('size') || 1" (ngModelChange)="setOrnament('size',+$event)"></div>
                }
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
    :host { display: block; height: 100%; overflow-y: auto; will-change: transform; transform: translate3d(0,0,0); }
    .props-panel-content { padding: 0; padding-bottom: 60px; contain: layout style; }
    .props-badge { display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(139,92,246,0.06);border-bottom:1px solid rgba(139,92,246,0.1); .material-icons{font-size:16px;color:var(--gold-light)} span:last-child{font-size:13px;font-weight:600;color:white} }
    .section-desc { font-size:11px;color:rgba(255,255,255,0.4);padding:4px 14px 8px;margin:0;border-bottom:1px solid rgba(255,255,255,0.04); }
    .accordion { cursor:pointer; }
    .accordion-header { display:flex;align-items:center;gap:6px;padding:9px 14px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.75);border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s; .material-icons{font-size:16px;color:rgba(255,255,255,0.35);transition:transform 0.2s} }
    .accordion-header:hover { background:rgba(139,92,246,0.04); }
    .accordion.open .accordion-header { color:white;background:rgba(139,92,246,0.06); .material-icons{color:var(--gold-light)} }
    .accordion-body { padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.04);animation:accordionOpen 0.25s ease-out; }
    @keyframes accordionOpen { from { opacity:0; max-height:0; transform:translateY(-6px); } to { opacity:1; max-height:1000px; transform:translateY(0); } }
    .pf { margin-bottom:10px; label{display:block;font-size:10px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px} }
    .pf-section-title { display:block;font-size:11px;font-weight:600;color:rgba(139,92,246,0.8);margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid rgba(139,92,246,0.15); }
    .pf-hint { font-size:10px;color:rgba(255,255,255,0.4);line-height:1.4;margin:2px 0 10px; }
    .pf-hint-list { list-style:none; margin:0 0 12px; padding:0; display:flex; flex-direction:column; gap:6px; }
    .pf-hint-list li { font-size:10px;color:rgba(255,255,255,0.45);line-height:1.4;padding-left:10px;border-left:2px solid rgba(139,92,246,0.3); }
    .pf-hint-list li b { color:rgba(255,255,255,0.75);font-weight:600; }
    .pf-row { display:flex;gap:8px;margin-bottom:10px; }
    .pf-half { flex:1; label{display:block;font-size:10px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px} }
    .pinput { width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(139,92,246,0.15);border-radius:6px;padding:7px 10px;color:white;font-size:12px;font-family:var(--font-sans); &:focus{outline:none;border-color:rgba(139,92,246,0.4)} }
    .pinput-range { width:100%;accent-color:#8b5cf6;cursor:pointer; }
    textarea.pinput { resize:vertical; }
    textarea.pinput.sm { min-height:40px; }
    select.pinput { cursor:pointer; appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b5cf6' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; padding-right:28px; color:#c084fc; }
    select.pinput option { background:#0a0a18; color:#c084fc; padding:8px; }
    select.pinput option:checked { background:rgba(139,92,246,0.25); color:#fff; }
    select.pinput option:hover { background:rgba(139,92,246,0.2); color:#fff; }
    :host-context(body.light-mode) select.pinput { color:#5a3d8a; background-color:#fff; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237c5cbf' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); }
    :host-context(body.light-mode) select.pinput option { background:#fff; color:#5a3d8a; }
    :host-context(body.light-mode) select.pinput option:checked { background:#7c5cbf; color:#fff; }
    .btn-row { display:flex;flex-wrap:wrap;gap:4px; }
    .chip { padding:5px 9px;border-radius:5px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);color:rgba(255,255,255,0.6);font-size:10px;cursor:pointer;transition:all 0.15s;white-space:nowrap; &:hover{background:rgba(139,92,246,0.08);color:white} &.active{background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.4);color:#c084fc;font-weight:600} }
    .upload-row { display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
    .upload-ok { font-size:11px;color:#10b981; }
    /* Fila de imagen de icono: preview + cambiar + quitar (mismo estilo que venues) */
    .icon-img-row { display:flex;align-items:center;gap:8px; }
    .icon-img-preview {
      width:44px;height:44px;border-radius:8px;overflow:hidden;flex-shrink:0;
      border:1px solid rgba(139,92,246,0.2);
      display:flex;align-items:center;justify-content:center;
      /* Tablero de ajedrez para que se note la transparencia del icono */
      background-color:rgba(255,255,255,0.06);
      background-image:
        linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.08) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.08) 75%);
      background-size:10px 10px;
      background-position:0 0, 0 5px, 5px -5px, -5px 0;
      img { width:100%;height:100%;object-fit:contain;display:block; }
    }
    .upload-hint {
      display:flex;align-items:flex-start;gap:5px;
      margin:8px 0 0;font-size:10px;line-height:1.4;
      color:rgba(255,255,255,0.4);
      .material-icons { font-size:13px;color:rgba(139,92,246,0.7);flex-shrink:0;margin-top:1px; }
    }
    .file-name { font-size:10px;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.05);padding:4px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
    /* Preview homologado de media (imagen/gif/video) en uploads sueltos. */
    .media-preview-row { display:flex;align-items:center;gap:8px; }
    .media-thumb { width:44px;height:44px;border-radius:8px;flex-shrink:0;overflow:hidden;background:rgba(255,255,255,0.06);border:1px solid rgba(139,92,246,0.3);display:flex;align-items:center;justify-content:center; }
    .media-thumb img { width:100%;height:100%;object-fit:cover; }
    .media-type-icon { font-size:24px;color:rgba(255,255,255,0.6); }
    .media-meta { display:flex;flex-direction:column;gap:2px;min-width:0;flex:1; }
    .media-badge { align-self:flex-start;font-size:9px;font-weight:700;letter-spacing:0.5px;color:#c084fc;background:rgba(139,92,246,0.15);border-radius:4px;padding:1px 6px; }
    .media-actions { display:flex;gap:6px;flex-shrink:0; }
    .sm-btn { padding:4px 10px;border-radius:5px;border:1px solid rgba(139,92,246,0.2);background:rgba(139,92,246,0.06);color:rgba(255,255,255,0.7);font-size:10px;cursor:pointer;transition:all 0.15s; &:hover{background:rgba(139,92,246,0.12)} &.danger{border-color:rgba(239,68,68,0.2);color:#ef4444} }
    .tpl-grid-2x2 { display:grid;grid-template-columns:1fr 1fr;gap:4px; }
    .tpl-card { padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:rgba(255,255,255,0.7);font-size:11px;cursor:pointer;transition:all 0.15s;text-align:center; &:hover{background:rgba(139,92,246,0.08);border-color:rgba(139,92,246,0.2)} &.active{background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.4);color:#c084fc;font-weight:600} }
    .tpl-hint { font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:12px;line-height:1.5; }
    .tpl-grid-preview { display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px; }
    .tpl-preview-card { display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:transform 0.2s; &:hover{transform:translateY(-2px)} &:active{transform:scale(0.95)} }
    .tpl-preview-swatch { width:100%;aspect-ratio:3/4;border-radius:10px;border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;font-family:var(--font-serif);transition:border-color 0.2s,box-shadow 0.2s; &:hover{box-shadow:0 4px 16px rgba(0,0,0,0.3)} }
    .tpl-preview-label { font-size:10px;color:rgba(255,255,255,0.6); }
    .tpl-preview-card.active .tpl-preview-swatch { border-color:rgba(139,92,246,0.7);box-shadow:0 0 12px rgba(139,92,246,0.3); }
    .tpl-preview-card.active .tpl-preview-label { color:#c084fc;font-weight:600; }
    .env-swatch { background:rgba(20,20,40,0.8) !important; }
    .toggle-row { display:flex;justify-content:space-between;align-items:center;padding:6px 0;margin-bottom:8px; }
    .toggle-title { font-size:11px;color:rgba(255,255,255,0.7);font-weight:500; }
    .toggle-switch { position:relative;display:inline-block;width:34px;height:18px;cursor:pointer; input{opacity:0;width:0;height:0} .slider{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.15);border-radius:9px;transition:0.2s} .slider::before{content:'';position:absolute;height:14px;width:14px;left:2px;bottom:2px;background:white;border-radius:50%;transition:0.2s} input:checked+.slider{background:#8b5cf6} input:checked+.slider::before{transform:translateX(16px)} }
    .section-style-toggle { padding:12px 14px;border-top:1px solid rgba(139,92,246,0.1);margin-top:8px; }
    .items-header { display:flex;justify-content:space-between;align-items:center;margin:8px 0 6px; span{font-size:10px;color:rgba(139,92,246,0.7);text-transform:uppercase;font-weight:700} }
    .item-card { padding:8px;margin-bottom:6px;border-radius:5px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);display:flex;flex-direction:column;gap:4px; }
    .item-head { display:flex;justify-content:flex-end;align-items:center;margin-bottom:2px; span{font-size:9px;color:rgba(255,255,255,0.3)} }
    .x-btn { background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:12px;padding:2px; &:hover{color:#ef4444} &.mini{position:absolute;top:2px;right:2px;font-size:10px;background:rgba(0,0,0,0.6);border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center} }
    .item-title { font-size:13px;color:white;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
    .delete-btn { width:24px;height:24px;border-radius:6px;border:none;background:rgba(239,68,68,0.85);color:#ffffff !important;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity 0.15s;flex-shrink:0; .material-icons{font-size:14px;color:#ffffff !important;opacity:1 !important} &:hover{opacity:0.75} }
    .dress-images-grid { display:flex;gap:6px;margin-top:4px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;-webkit-overflow-scrolling:touch; &::-webkit-scrollbar{display:none} }
    .dress-img-thumb { position:relative;width:56px;height:68px;border-radius:8px;overflow:hidden;border:1px solid rgba(139,92,246,0.2);flex-shrink:0; img{width:100%;height:100%;object-fit:cover} }
    .dress-img-remove { position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:50%;border:none;background:rgba(239,64,87,0.9);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.15s; .material-icons{font-size:11px} }
    .dress-img-thumb:hover .dress-img-remove { opacity:1; }
    .dress-img-add { width:56px;height:68px;border-radius:8px;border:2px dashed rgba(139,92,246,0.3);background:none;color:rgba(139,92,246,0.5);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0; .material-icons{font-size:22px} &:hover{border-color:rgba(139,92,246,0.6);color:rgba(139,92,246,0.8);background:rgba(139,92,246,0.05)} }
    .dress-slots-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:6px; }
    .dress-slot { width:100%;aspect-ratio:3/4;border-radius:8px;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;overflow:hidden; }
    .dress-slot.filled { border:2px solid transparent;transition:border-color 0.15s; img{width:100%;height:100%;object-fit:cover;display:block;border-radius:6px} }
    .dress-slot.filled:hover { border-color:rgba(139,92,246,0.5); }
    .dress-slot.filled.selected { border-color:#8b5cf6;box-shadow:0 0 0 2px #8b5cf6; }
    .dress-slot.empty { border:2px dashed rgba(139,92,246,0.4);background:rgba(139,92,246,0.08);border-radius:8px; .material-icons{font-size:20px;color:white;opacity:0.7} }
    .dress-slot.empty:hover { border-color:rgba(139,92,246,0.7);background:rgba(139,92,246,0.12); }
    .photo-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:3px;margin-top:6px;contain:layout;max-height:200px;overflow-y:auto;overflow-x:hidden; }
    .photo-thumb { position:relative;width:44px;height:44px;border-radius:4px;overflow:hidden;background:rgba(139,92,246,0.1);contain:strict; img{width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity 0.2s} img.loaded{opacity:1} }
    .photo-list-item { display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04); }
    .photo-list-name { flex:1;font-size:10px;color:rgba(255,255,255,0.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
    .photo-slots-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:8px;max-height:280px;overflow-y:auto; }
    .photo-slot { width:100%;aspect-ratio:1;border-radius:8px;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;overflow:hidden; }
    .photo-slot.filled { border:2px solid transparent;transition:border-color 0.15s; img{width:100%;height:100%;object-fit:cover;display:block;border-radius:6px} }
    .photo-slot.filled:hover { border-color:rgba(139,92,246,0.5); }
    .photo-slot.filled.selected { border-color:#8b5cf6;box-shadow:0 0 0 2px #8b5cf6; }
    .slot-check { position:absolute;top:4px;right:4px;font-size:18px;color:white;background:#8b5cf6;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.4); }
    .slot-check .material-icons { font-size:14px; }
    .photo-slot.empty { border:2px dashed rgba(139,92,246,0.4);background:rgba(139,92,246,0.08);border-radius:8px; .material-icons{font-size:20px;color:white;opacity:0.7} }
    .photo-slot.empty:hover { border-color:rgba(139,92,246,0.7);background:rgba(139,92,246,0.12); }
    .photo-slot.empty.disabled { opacity:0.3;pointer-events:none;cursor:not-allowed; }
    .photo-slot.loading { border:2px solid rgba(139,92,246,0.5);background:rgba(139,92,246,0.12);border-radius:8px; }
    .slot-spinner { width:20px;height:20px;border:2px solid rgba(139,92,246,0.3);border-top-color:#8b5cf6;border-radius:50%;animation:spin 0.8s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    :host-context(body.light-mode) .photo-slot.empty { border-color:rgba(124,92,191,0.3);background:rgba(124,92,191,0.06); .material-icons{color:#7c5cbf} }
    .photo-upload-btn { padding:8px 16px;border-radius:8px;border:none;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s; }
    .photo-upload-btn.upload { background:#8b5cf6;color:white; &:hover{background:#7c3aed} &:disabled{opacity:0.5;cursor:not-allowed} }
    .photo-upload-btn.delete { background:#ef4444;color:white; &:hover{background:#dc2626} }
    :host-context(body.light-mode) .photo-upload-btn.upload { background:rgba(124,92,191,0.15);color:#7c5cbf;border:1px solid rgba(124,92,191,0.3); }
    .hint { font-size:11px;color:rgba(255,255,255,0.35);margin-top:6px; }
    .empty-state { padding:40px 14px;text-align:center; .material-icons{font-size:32px;color:rgba(255,255,255,0.15)} p{font-size:12px;color:rgba(255,255,255,0.3);margin-top:8px} }
    .stepper-row { display:flex;align-items:center;gap:0;border:1px solid rgba(139,92,246,0.2);border-radius:6px;overflow:hidden; }
    .stepper-btn { width:36px;height:34px;border:none;background:rgba(139,92,246,0.1);color:white;font-size:16px;font-weight:700;cursor:pointer;transition:background 0.15s; &:hover{background:rgba(139,92,246,0.25)} &:active{background:rgba(139,92,246,0.35)} }
    .stepper-value { flex:1;text-align:center;font-size:13px;font-weight:600;color:white;padding:6px 8px;background:rgba(255,255,255,0.03); }
    .time-picker-row { display:flex;align-items:center;gap:4px; }
    .time-select { width:auto !important;flex:1;padding:6px 24px 6px 4px !important;text-align:center;font-size:13px; }
    .time-sep { color:rgba(255,255,255,0.5);font-weight:700;font-size:14px; }
    .ampm { flex:0 0 56px !important; }

    /* Video Trimmer */
    .video-trimmer { padding:10px;background:rgba(0,0,0,0.2);border-radius:8px;margin-bottom:10px; }
    .trim-label { display:block;font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px; }
    .trimmer-container { position:relative; }
    .trimmer-track { position:relative;height:28px;background:rgba(255,255,255,0.08);border-radius:4px;cursor:pointer;overflow:visible; }
    .trimmer-selected { position:absolute;top:0;bottom:0;background:rgba(139,92,246,0.3);border:1px solid rgba(139,92,246,0.6);border-radius:4px;pointer-events:none; }
    .trimmer-handle { position:absolute;top:-3px;bottom:-3px;width:12px;background:var(--gold-light,#a78bfa);border-radius:3px;cursor:ew-resize;z-index:2;transform:translateX(-50%);transition:background 0.15s; }
    .trimmer-handle:hover { background:#c084fc; }
    .trimmer-handle::after { content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:2px;height:12px;background:rgba(0,0,0,0.4);border-radius:1px; }
    .trimmer-labels { display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:10px;color:rgba(255,255,255,0.5); }
    .trim-duration { color:#c084fc;font-weight:600;font-size:11px; }
    .trim-preview-btn { display:flex;align-items:center;gap:4px;margin-top:8px;padding:6px 12px;border-radius:6px;border:1px solid rgba(139,92,246,0.3);background:rgba(139,92,246,0.08);color:#c084fc;font-size:11px;cursor:pointer;transition:all 0.15s; }
    .trim-preview-btn:hover { background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.5); }
    .trim-preview-btn .material-icons { font-size:16px; }
    :host-context(body.light-mode) .video-trimmer { background:rgba(124,92,191,0.04); }
    :host-context(body.light-mode) .trimmer-track { background:rgba(124,92,191,0.1); }
    :host-context(body.light-mode) .trimmer-selected { background:rgba(124,92,191,0.15);border-color:rgba(124,92,191,0.4); }
    :host-context(body.light-mode) .trimmer-handle { background:#7c5cbf; }
    :host-context(body.light-mode) .trimmer-labels { color:#666; }
    :host-context(body.light-mode) .trim-duration { color:#7c5cbf; }
    :host-context(body.light-mode) .trim-label { color:#7c5cbf; }
    :host-context(body.light-mode) .trim-preview-btn { background:rgba(124,92,191,0.06);border-color:rgba(124,92,191,0.25);color:#7c5cbf; }
    .emoji-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(32px,1fr));gap:3px;max-height:120px;overflow-y:auto;padding:4px;background:rgba(255,255,255,0.02);border:1px solid rgba(139,92,246,0.15);border-radius:6px; }
    .emoji-btn { width:32px;height:32px;border:none;background:transparent;border-radius:4px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s; &:hover{background:rgba(139,92,246,0.15)} &.active{background:rgba(139,92,246,0.25);outline:1px solid rgba(139,92,246,0.5)} }
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

  toggle(key: string) {
    const wasOpen = this.expanded[key];
    // Close all other accordions
    Object.keys(this.expanded).forEach(k => this.expanded[k] = false);
    // Toggle the clicked one
    this.expanded[key] = !wasOpen;
  }

  sec(key: string): any { return (this.cfg() as any)?.[key] || null; }

  /** Lee una propiedad del indicador de scroll de la caratula (hero.scrollIndicator.<prop>). */
  si(prop: string): any { return (this.cfg() as any)?.hero?.scrollIndicator?.[prop]; }
  /** Escribe una propiedad del indicador de scroll de la caratula. */
  setSI(prop: string, value: any) { this.setSecNested('hero', 'scrollIndicator', prop, value); }

  setSec(secKey: string, prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!(cfg as any)[secKey]) (cfg as any)[secKey] = {};
    (cfg as any)[secKey][prop] = value;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  setSecNested(secKey: string, nestedKey: string, prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!(cfg as any)[secKey]) (cfg as any)[secKey] = {};
    if (!(cfg as any)[secKey][nestedKey]) (cfg as any)[secKey][nestedKey] = {};
    (cfg as any)[secKey][nestedKey][prop] = value;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  ss(prop: string): any {
    // Detalles/Lugares con sub-ítem seleccionado: el estilo de sección es PROPIO del ítem.
    const h = this.styleHolder();
    return h?.sectionStyle?.[prop] ?? null;
  }

  setSS(prop: string, value: any) {
    const h = this.styleHolder(); if (!h) return;
    if (!h.sectionStyle) h.sectionStyle = { bgType:'inherit', dividerType:'none' };
    h.sectionStyle[prop] = value;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  clearColors() { this.setSS('headingColor',''); this.setSS('headingColor2',''); this.setSS('contentColor',''); this.setSS('sectionHeadingColor',''); this.setSS('sectionHeadingFont',''); this.setSS('headingFont',''); this.setSS('contentFont',''); }

  hasSectionStyle(): boolean {
    const s = this.styleHolder(); if (!s) return false;
    return !!s.sectionStyle;
  }

  toggleSectionStyle() {
    const s = this.styleHolder(); if (!s) return;
    if (s.sectionStyle) {
      delete s.sectionStyle;
    } else {
      s.sectionStyle = { bgType: 'inherit', dividerType: 'none' };
    }
    this.canvasState.notifyChange();
    this.canvasState.isDirty.set(true);
  }

  setTheme(prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    (cfg.theme as any)[prop] = value;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  // ===== Fondos homologados (MediaBackground) — spec fondos-independientes =====

  /** Media del fondo GLOBAL de la landing (theme.landingBg). */
  themeLandingBg(): MediaBackground | null {
    return (this.cfg() as any)?.theme?.landingBg ?? null;
  }
  setThemeLandingBg(media: MediaBackground) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    (cfg.theme as any).landingBg = media;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  /** Media del fondo propio de la CARÁTULA (hero.heroBackground). */
  heroBgModel(): MediaBackground | null {
    return (this.cfg() as any)?.hero?.heroBackground ?? null;
  }
  setHeroBgModel(media: MediaBackground) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!(cfg as any).hero) (cfg as any).hero = {};
    (cfg as any).hero.heroBackground = media;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  /** Media del fondo de la SECCIÓN activa (sectionStyle.media). Con fallback retrocompatible:
      si no hay `media` pero sí campos legacy (bgImage/bgFit/bgBannerWidth/bgOverlay), los expone
      como MediaBackground para que el control los muestre y el usuario pueda editarlos. */
  sectionMediaModel(): MediaBackground | null {
    const key = this.canvasState.selectedSection(); if (!key) return null;
    // Detalles/Lugares con ítem seleccionado: el fondo es el del ítem (styleHolder).
    const ss = this.styleHolder()?.sectionStyle;
    if (!ss) return null;
    if (ss.media && ss.media.url) return ss.media;
    if (ss.bgImage) {
      return {
        url: ss.bgImage,
        fit: ss.bgFit || 'cover',
        bannerWidth: ss.bgBannerWidth ?? 70,
        overlay: ss.bgOverlay ?? 0,
        position: 'center center',
      };
    }
    return ss.media ?? null;
  }
  setSectionMediaModel(media: MediaBackground) {
    // Detalles/Lugares con ítem seleccionado: escribir en el sectionStyle del ítem (styleHolder).
    const s = this.styleHolder(); if (!s) return;
    if (!s.sectionStyle) s.sectionStyle = { bgType: 'image', dividerType: 'none' };
    s.sectionStyle.media = media;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  /** Media del fondo de la INTRO (intro.media). Fallback retrocompatible al legacy
      intro.background (string) para que el control muestre lo ya configurado. */
  introMediaModel(): MediaBackground | null {
    const intro = (this.cfg() as any)?.intro;
    if (!intro) return null;
    if (intro.media && intro.media.url) return intro.media;
    if (intro.background) {
      return { url: intro.background, fit: 'cover', overlay: 0, position: 'center center' };
    }
    return intro.media ?? null;
  }
  setIntroMediaModel(media: MediaBackground) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!(cfg as any).intro) (cfg as any).intro = {};
    (cfg as any).intro.media = media;
    // Sincronizar el legacy `background` con la URL BASE para que el trimmer de video y la
    // detección de duración (que leen intro.background) sigan funcionando. En override desktop,
    // el trimmer usa la base; el desktop alterno se recorta con el mismo segmento.
    const baseUrl = media?.url || '';
    (cfg as any).intro.background = baseUrl;
    if (baseUrl && this.isVideoFile(baseUrl)) {
      this.detectVideoDuration(baseUrl);
    } else {
      this.clearMediaDuration();
    }
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  setGlobalStyle(styleKey: string, prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    (cfg.globalStyles as any)[styleKey][prop] = value;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  setGlobalSeparator(prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    (cfg.globalStyles.separatorStyle as any)[prop] = value;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  setSectionIcon(secKey: string, iconType: string) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const sec = (cfg as any)[secKey];
    if (!sec.sectionIcon) sec.sectionIcon = { iconType: 'material', icon: '', iconUrl: '' };
    sec.sectionIcon.iconType = iconType;
    if (iconType === 'none') { sec.sectionIcon.icon = ''; sec.sectionIcon.iconUrl = ''; }
    this.canvasState.isDirty.set(true);
    this.canvasState.notifyChange();
  }

  setSectionIconProp(secKey: string, prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const sec = (cfg as any)[secKey];
    if (!sec.sectionIcon) sec.sectionIcon = { iconType: 'emoji', icon: '', iconUrl: '' };
    (sec.sectionIcon as any)[prop] = value;
    this.canvasState.isDirty.set(true);
    this.canvasState.notifyChange();
  }

  // ===== Icono de la card de TRANSFERENCIA (sectionIcon anidado en gifts.transfer) =====
  setTransferIcon(iconType: string) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const t = (cfg as any).gifts?.transfer; if (!t) return;
    if (!t.sectionIcon) t.sectionIcon = { iconType: 'material', icon: '', iconUrl: '' };
    t.sectionIcon.iconType = iconType;
    if (iconType === 'none') { t.sectionIcon.icon = ''; t.sectionIcon.iconUrl = ''; }
    this.canvasState.isDirty.set(true); this.canvasState.notifyChange();
  }
  setTransferIconProp(prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const t = (cfg as any).gifts?.transfer; if (!t) return;
    if (!t.sectionIcon) t.sectionIcon = { iconType: 'emoji', icon: '', iconUrl: '' };
    (t.sectionIcon as any)[prop] = value;
    this.canvasState.isDirty.set(true); this.canvasState.notifyChange();
  }
  /** Sube una imagen como icono de la card de Regalos o de Transferencia. */
  uploadGiftsIconImage(target: 'gifts' | 'transfer') {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = () => {
      const f = input.files?.[0]; if (!f) return;
      this.api.uploadFile('images', f).subscribe({ next: (r) => {
        const cfg = this.canvasState.getConfig(); if (!cfg) return;
        const holder = target === 'transfer' ? (cfg as any).gifts?.transfer : (cfg as any).gifts;
        if (!holder) return;
        if (!holder.sectionIcon) holder.sectionIcon = { iconType: 'image', icon: '', iconUrl: '' };
        holder.sectionIcon.iconType = 'image';
        holder.sectionIcon.iconUrl = r.url;
        this.canvasState.notifyChange(); this.canvasState.triggerAutoSave();
      }});
    };
    input.click();
  }

  // ===== Estilo de card tipado (cardStyle) para gifts y gifts.transfer =====
  giftsCS(prop: string): any { return (this.sec('gifts')?.cardStyle || {})[prop] ?? null; }
  setGiftsCS(prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!(cfg as any).gifts.cardStyle) (cfg as any).gifts.cardStyle = {};
    (cfg as any).gifts.cardStyle[prop] = value;
    this.canvasState.notifyChange(); this.canvasState.triggerAutoSave();
  }
  transferCS(prop: string): any { return (this.sec('gifts')?.transfer?.cardStyle || {})[prop] ?? null; }
  setTransferCS(prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const t = (cfg as any).gifts?.transfer; if (!t) return;
    if (!t.cardStyle) t.cardStyle = {};
    t.cardStyle[prop] = value;
    this.canvasState.notifyChange(); this.canvasState.triggerAutoSave();
  }

  // ===== Estilo del título de la card de Transferencia (titleStyle propio) =====
  transferTS(prop: string): any { return (this.sec('gifts')?.transfer?.titleStyle || {})[prop] ?? null; }
  setTransferTS(prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const t = (cfg as any).gifts?.transfer; if (!t) return;
    if (!t.titleStyle) t.titleStyle = {};
    t.titleStyle[prop] = value;
    this.canvasState.notifyChange(); this.canvasState.triggerAutoSave();
  }

  // ===== Estilo de botones (buttonStyle) de Mesa de Regalos y Transferencia =====
  giftsBtn(prop: string): any { return (this.sec('gifts')?.buttonStyle || {})[prop] ?? null; }
  setGiftsBtn(prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!(cfg as any).gifts.buttonStyle) (cfg as any).gifts.buttonStyle = {};
    (cfg as any).gifts.buttonStyle[prop] = value;
    this.canvasState.notifyChange(); this.canvasState.triggerAutoSave();
  }
  transferBtn(prop: string): any { return (this.sec('gifts')?.transfer?.buttonStyle || {})[prop] ?? null; }
  setTransferBtn(prop: string, value: any) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const t = (cfg as any).gifts?.transfer; if (!t) return;
    if (!t.buttonStyle) t.buttonStyle = {};
    t.buttonStyle[prop] = value;
    this.canvasState.notifyChange(); this.canvasState.triggerAutoSave();
  }

  // ===== Partículas de la sección Regalos (lectura/escritura) =====
  giftsParticlesProp(prop: string): any { return (this.sec('gifts')?.particles as any)?.[prop] ?? null; }

  applySectionPreset(preset: string) {
    const presets: Record<string, any> = {
      light: { bgType: 'solid', bgColor1: '#ffffff', headingColor: '#1a1a2e', contentColor: '#333333', dividerType: 'wave' },
      dark: { bgType: 'solid', bgColor1: '#0d1117', headingColor: '#ffffff', contentColor: 'rgba(255,255,255,0.8)', dividerType: 'curve' },
      wine: { bgType: 'linear', bgColor1: '#2d1525', bgColor2: '#1a0a14', headingColor: '#f4a7c1', contentColor: 'rgba(255,255,255,0.7)', dividerType: 'slant' },
      transparent: { bgType: 'inherit', headingColor: '', contentColor: '', dividerType: 'none' }
    };
    const p = presets[preset]; if (!p) return;
    Object.keys(p).forEach(k => this.setSS(k, p[k]));
  }

  // Ornament helpers
  getOrnamentType(): string {
    const sec = this.canvasState.selectedSection();
    if (!sec) return 'none';
    const s = this.styleHolder()?.sectionStyle?.headingOrnament;
    // Invitación trae 'stars' (✦ ✦ ✦) por defecto; las demás 'none'.
    const fallback = sec === 'invitation' ? 'stars' : 'none';
    return s?.type || fallback;
  }

  getOrnamentProp(prop: string): any {
    const s = this.styleHolder()?.sectionStyle?.headingOrnament;
    return s ? (s as any)[prop] : null;
  }

  setOrnament(prop: string, value: any) {
    const section = this.styleHolder();
    if (!section) return;
    if (!section.sectionStyle) section.sectionStyle = { bgType: 'inherit', dividerType: 'none' };
    if (!section.sectionStyle.headingOrnament) section.sectionStyle.headingOrnament = { type: 'none', position: 'below', color: '#d4a017', size: 1 };
    (section.sectionStyle.headingOrnament as any)[prop] = value;
    this.canvasState.isDirty.set(true);
    this.canvasState.notifyChange();
  }

  // Registration fields helpers
  getRegFields(): any[] {
    const cfg = this.canvasState.getConfig(); if (!cfg) return [];
    return cfg.rsvp?.registrationFields || [{ key: 'name', label: 'Nombre', type: 'text', enabled: true, required: true }];
  }

  toggleRegFieldRequired(index: number) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!cfg.rsvp.registrationFields) cfg.rsvp.registrationFields = [{ key: 'name', label: 'Nombre', type: 'text', enabled: true, required: true }];
    const field = cfg.rsvp.registrationFields[index];
    if (field && field.key !== 'name') { field.required = !field.required; }
    this.canvasState.isDirty.set(true);
    this.canvasState.notifyChange();
  }

  removeRegField(index: number) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!cfg.rsvp.registrationFields) return;
    if (cfg.rsvp.registrationFields[index]?.key === 'name') return;
    cfg.rsvp.registrationFields.splice(index, 1);
    this.canvasState.isDirty.set(true);
    this.canvasState.notifyChange();
  }

  addRegField() {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    if (!cfg.rsvp.registrationFields) cfg.rsvp.registrationFields = [{ key: 'name', label: 'Nombre', type: 'text', enabled: true, required: true }];
    const key = 'field_' + Date.now();
    cfg.rsvp.registrationFields.push({ key, label: 'Nuevo campo', type: 'text', enabled: true, required: false });
    this.canvasState.isDirty.set(true);
    this.canvasState.notifyChange();
  }

  // Countdown date/time helpers
  getCountdownDate(): string {
    const dt = this.sec('hero')?.countdownDate;
    if (!dt) return '';
    return dt.slice(0, 10); // YYYY-MM-DD
  }

  getCountdownTime(): string {
    const dt = this.sec('hero')?.countdownDate;
    if (!dt || dt.length < 16) return '7:00 PM';
    const h = parseInt(dt.slice(11, 13)) || 0;
    const m = parseInt(dt.slice(14, 16)) || 0;
    const h12 = h % 12 || 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  setCountdownDate(dateStr: string) {
    const time = this.sec('hero')?.countdownDate?.slice(11) || '19:00:00';
    this.setSec('hero', 'countdownDate', `${dateStr}T${time}`);
  }

  setCountdownTime(timeStr: string) {
    const date = this.getCountdownDate() || new Date().toISOString().slice(0, 10);
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ap = match[3].toUpperCase();
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    this.setSec('hero', 'countdownDate', `${date}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`);
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

  /** Sube una imagen y la asigna como fondo de la SECCIÓN activa (sectionStyle.bgImage). */
  uploadSectionBg() {
    const input = document.createElement('input'); input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const f = input.files?.[0]; if (!f) return;
      this.api.uploadFile('images', f).subscribe({
        next: (r: any) => {
          this.setSS('bgImage', r.url);
          this.canvasState.notifyChange();
        }
      });
    };
    input.click();
  }

  upload(secKey: string, prop: string, type: 'images'|'audio'|'gifs') {
    const input = document.createElement('input'); input.type='file';
    input.accept = type==='audio'?'audio/*':type==='gifs'?'image/*,video/*,.gif,.mp4,.webm':'image/*,image/x-icon,image/svg+xml';
    input.onchange = () => { const f=input.files?.[0]; if(!f)return;
      this.api.uploadFile(type,f).subscribe({next:r=>{
        if(secKey === '_favicon') {
          const cfg = this.canvasState.getConfig(); if(!cfg)return;
          (cfg as any).favicon = r.url;
          this.canvasState.isDirty.set(true);
        } else {
          this.setSec(secKey,prop,r.url);
        }
        this.canvasState.notifyChange();
      }});
    };
    input.click();
  }

  setFavicon(url: string) {
    const cfg = this.canvasState.getConfig(); if(!cfg)return;
    (cfg as any).favicon = url;
    this.canvasState.isDirty.set(true);
    this.canvasState.notifyChange();
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

  // ===== DETALLES: card activa (modelo mini-secciones) =====

  /** Índice de la card de Detalles seleccionada (del canvasState). */
  dIdx(): number { return this.canvasState.selectedDetailIndex(); }

  /** Card de Detalles seleccionada, o null si ninguna. */
  dcard(): any | null {
    const i = this.dIdx();
    if (i < 0) return null;
    return (this.cfg() as any)?.details?.cards?.[i] || null;
  }

  /** Actualiza una propiedad plana de la card de Detalles activa (title/content/label/heading/…). */
  updateDCard(prop: string, val: any) {
    const i = this.dIdx(); if (i < 0) return;
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const card = (cfg as any).details?.cards?.[i]; if (!card) return;
    card[prop] = val;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  /** Actualiza una propiedad del cardStyle de la card de Detalles activa. */
  updateDCardStyle(prop: string, val: any) {
    const i = this.dIdx(); if (i < 0) return;
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const card = (cfg as any).details?.cards?.[i]; if (!card) return;
    if (!card.cardStyle) card.cardStyle = {};
    card.cardStyle[prop] = val;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }
  /** Lee una propiedad del cardStyle de la card activa (con fallback a los campos sueltos de la card). */
  dCardStyle(prop: string): any {
    const card = this.dcard(); if (!card) return undefined;
    return card.cardStyle?.[prop];
  }

  /** Objeto que ALOJA el `sectionStyle` activo: la card de Detalles / el Lugar seleccionado
      (mini-sección) o, en el resto de secciones, la sección misma. Centraliza la redirección. */
  styleHolder(): any | null {
    const key = this.canvasState.selectedSection(); if (!key) return null;
    const cfg = this.canvasState.getConfig(); if (!cfg) return null;
    if (key === 'details' && this.dIdx() >= 0) return (cfg as any).details?.cards?.[this.dIdx()] || null;
    if (key === 'venues' && this.vIdx() >= 0) return (cfg as any).venues?.items?.[this.vIdx()] || null;
    if (key === 'dresscode' && this.dIdx2() >= 0) return (cfg as any).dresscode?.cards?.[this.dIdx2()] || null;
    return (cfg as any)[key] || null;
  }

  // ===== LUGARES: venue activo (modelo mini-secciones) =====
  vIdx(): number { return this.canvasState.selectedVenueIndex(); }
  vcard(): any | null {
    const i = this.vIdx();
    if (i < 0) return null;
    return (this.cfg() as any)?.venues?.items?.[i] || null;
  }
  updateVCard(prop: string, val: any) {
    const i = this.vIdx(); if (i < 0) return;
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const v = (cfg as any).venues?.items?.[i]; if (!v) return;
    v[prop] = val;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }
  vCardStyle(prop: string): any { return this.vcard()?.cardStyle?.[prop]; }
  updateVCardStyle(prop: string, val: any) {
    const i = this.vIdx(); if (i < 0) return;
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const v = (cfg as any).venues?.items?.[i]; if (!v) return;
    if (!v.cardStyle) v.cardStyle = {};
    v.cardStyle[prop] = val;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }
  vTime(prop: string): any { return this.vcard()?.timeStyle?.[prop]; }
  setVTime(prop: string, val: any) {
    const i = this.vIdx(); if (i < 0) return;
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const v = (cfg as any).venues?.items?.[i]; if (!v) return;
    if (!v.timeStyle) v.timeStyle = {};
    v.timeStyle[prop] = val;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }
  vBtn(prop: string): any { return this.vcard()?.buttonStyle?.[prop]; }
  setVBtn(prop: string, val: any) {
    const i = this.vIdx(); if (i < 0) return;
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const v = (cfg as any).venues?.items?.[i]; if (!v) return;
    if (!v.buttonStyle) v.buttonStyle = {};
    v.buttonStyle[prop] = val;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  // ===== VESTIMENTA: card activa (modelo mini-secciones, espejo de Detalles/Lugares) =====
  dIdx2(): number { return this.canvasState.selectedDresscodeIndex(); }
  dcard2(): any | null {
    const i = this.dIdx2();
    if (i < 0) return null;
    return (this.cfg() as any)?.dresscode?.cards?.[i] || null;
  }
  updateDCard2(prop: string, val: any) {
    const i = this.dIdx2(); if (i < 0) return;
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const c = (cfg as any).dresscode?.cards?.[i]; if (!c) return;
    c[prop] = val;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }
  dcStyle2(prop: string): any { return this.dcard2()?.cardStyle?.[prop]; }
  updateDCStyle2(prop: string, val: any) {
    const i = this.dIdx2(); if (i < 0) return;
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const c = (cfg as any).dresscode?.cards?.[i]; if (!c) return;
    if (!c.cardStyle) c.cardStyle = {};
    c.cardStyle[prop] = val;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
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
    this.canvasState.notifyChange();
  }

  uploadVenueIcon(i: number) {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = () => {
      const f = input.files?.[0]; if (!f) return;
      this.api.uploadFile('images', f).subscribe({ next: (r) => {
        const cfg = this.canvasState.getConfig(); if (!cfg) return;
        (cfg.venues.items[i] as any).icon = r.url;
        this.canvasState.notifyChange();
      }});
    };
    input.click();
  }

  uploadDetailIcon(i: number) {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = () => {
      const f = input.files?.[0]; if (!f) return;
      this.api.uploadFile('images', f).subscribe({ next: (r) => {
        const cfg = this.canvasState.getConfig(); if (!cfg) return;
        (cfg as any).details.cards[i].iconUrl = r.url;
        this.canvasState.notifyChange();
      }});
    };
    input.click();
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
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  updateDresscode(i: number, prop: string, val: any) {
    const cfg=this.canvasState.getConfig();if(!cfg||!cfg.dresscode.cards?.[i])return;
    (cfg.dresscode.cards[i] as any)[prop]=val;
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  uploadDresscodeImage(cardIndex: number) {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.multiple = true;
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      if (!files.length) return;
      const cfg0 = this.canvasState.getConfig(); if (!cfg0 || !cfg0.dresscode.cards?.[cardIndex]) return;
      if (!cfg0.dresscode.cards[cardIndex].images) cfg0.dresscode.cards[cardIndex].images = [];
      // Subir sólo hasta completar 4 (límite por card). Se suben en paralelo y se agregan al llegar.
      const libres = Math.max(0, 4 - cfg0.dresscode.cards[cardIndex].images.length);
      files.slice(0, libres).forEach((f) => {
        this.api.uploadFile('images', f).subscribe({ next: (r) => {
          const cfg = this.canvasState.getConfig(); if (!cfg || !cfg.dresscode.cards?.[cardIndex]) return;
          if (!cfg.dresscode.cards[cardIndex].images) cfg.dresscode.cards[cardIndex].images = [];
          if (cfg.dresscode.cards[cardIndex].images.length < 4) {
            cfg.dresscode.cards[cardIndex].images.push(r.url);
            this.canvasState.notifyChange();
            this.canvasState.triggerAutoSave();
          }
        }});
      });
    };
    input.click();
  }

  removeDresscodeImage(cardIndex: number, imgIndex: number) {
    const cfg = this.canvasState.getConfig(); if (!cfg || !cfg.dresscode.cards?.[cardIndex]) return;
    cfg.dresscode.cards[cardIndex].images?.splice(imgIndex, 1);
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  /** Dress code 4-slot grid: selection state */
  selectedDressImages = new Map<number, Set<number>>();

  getDressEmptySlots(cardIndex: number): number[] {
    const cfg = this.canvasState.getConfig();
    const count = Math.max(0, 4 - (cfg?.dresscode?.cards?.[cardIndex]?.images?.length || 0));
    return new Array(count);
  }

  isDressImageSelected(cardIndex: number, imgIndex: number): boolean {
    return this.selectedDressImages.get(cardIndex)?.has(imgIndex) || false;
  }

  toggleDressImageSelect(cardIndex: number, imgIndex: number) {
    if (!this.selectedDressImages.has(cardIndex)) {
      this.selectedDressImages.set(cardIndex, new Set());
    }
    const set = this.selectedDressImages.get(cardIndex)!;
    if (set.has(imgIndex)) set.delete(imgIndex);
    else set.add(imgIndex);
  }

  getSelectedDressImages(cardIndex: number): number[] {
    const set = this.selectedDressImages.get(cardIndex);
    return set ? Array.from(set) : [];
  }

  deleteSelectedDressImages(cardIndex: number) {
    const cfg = this.canvasState.getConfig();
    if (!cfg || !cfg.dresscode.cards?.[cardIndex]?.images) return;
    const indices = this.getSelectedDressImages(cardIndex).sort((a, b) => b - a);
    for (const idx of indices) {
      cfg.dresscode.cards[cardIndex].images.splice(idx, 1);
    }
    this.selectedDressImages.delete(cardIndex);
    this.canvasState.notifyChange();
    this.canvasState.triggerAutoSave();
  }

  uploadingPhotos = false;
  uploadingCount = 0;
  selectedPhotos = new Set<number>();

  getEmptySlots(): number[] {
    const count = Math.max(0, 20 - this.photos().length);
    return new Array(count);
  }

  /** Returns how many empty slots should show as "loading" */
  getLoadingSlots(): number[] {
    if (!this.uploadingPhotos) return [];
    return new Array(this.uploadingCount);
  }

  /** Returns remaining empty slots (not loading) */
  getRemainingEmptySlots(): number[] {
    const total = Math.max(0, 20 - this.photos().length);
    const loading = this.uploadingPhotos ? this.uploadingCount : 0;
    const remaining = Math.max(0, total - loading);
    return new Array(remaining);
  }

  togglePhotoSelect(id: number) {
    if (this.selectedPhotos.has(id)) this.selectedPhotos.delete(id);
    else this.selectedPhotos.add(id);
  }

  deleteSelectedPhotos() {
    const ids = Array.from(this.selectedPhotos);
    ids.forEach(id => this.api.deletePhoto(this.eventId, id).subscribe());
    this.selectedPhotos.clear();
    setTimeout(() => this.api.getPhotos(this.eventId).subscribe(p => this.photos.set(p)), 500);
  }

  uploadPhotos() {
    const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;
    input.onchange=()=>{
      if(!input.files?.length)return;
      const fileCount = Math.min(input.files.length, 20 - this.photos().length);
      this.uploadingPhotos = true;
      this.uploadingCount = fileCount;
      this.api.uploadPhotos(this.eventId,input.files).subscribe({
        next: ()=>{this.api.getPhotos(this.eventId).subscribe(p=>{this.photos.set(p);this.uploadingPhotos=false;this.uploadingCount=0;})},
        error: ()=>{this.uploadingPhotos=false;this.uploadingCount=0;}
      });
    };
    input.click();
  }

  deletePhoto(id: number) {
    this.api.deletePhoto(this.eventId,id).subscribe(()=>{this.api.getPhotos(this.eventId).subscribe(p=>this.photos.set(p))});
  }

  onPhotoLoad(e: Event) {
    (e.target as HTMLElement)?.classList.add('loaded');
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
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
    this.api.updateItineraryItem(this.eventId, item.id, item).subscribe();
  }

  loadItinerary() {
    this.api.getItinerary(this.eventId).subscribe(items => this.itineraryItems.set(items));
  }

  // Time picker helpers
  hours = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  minutes = ['00','15','30','45'];

  // Emoji picker options for itinerary
  emojiOptions = [
    '⛪','🏛️','👰','✝️','🤝','⏰','🎥','🍰','🎬','🍸','🍾','🎵','🍷','🍺','🖼️','🎶','🎸','💃',
    '🏇','🎠','🌟','🌙','🚌','🍽️','🚕','🏃','✈️','🌹','🌸','🌿',
    '🎁','👑','🏆','❤️','💕','🎲','🎨','🧩','🏃','🕯️','🌅','🌄'
  ];

  venueEmojis = [
    '📍','⛪','💒','🏛️','🏰','🎪','🏖️','🏞️',
    '🍽️','🥂','🎉','🎊','🎶','💃','🕺','🌟',
    '🏨','🏡','🌳','🌊','⛰️','🌅','🎭','🎬'
  ];

  detailEmojis = [
    '💒','⛪','🏛️','💍','👰','🤵','👪','🙏',
    '✝️','🕊️','💐','🌹','🎊','🎉','💝','❤️',
    '🥂','🍾','🎂','🎵','📸','🌟','👑','🦋'
  ];

  giftEmojis = [
    '🎁','💝','🛍️','💐','🎀','💳','💵','🏦',
    '🪙','💎','🧧','🎊','✨','🛒','📦','❤️'
  ];

  rsvpEmojis = [
    '✅','📝','💌','✉️','📩','🖊️','🗓️','📌',
    '🙋','👍','🎉','🥂','💃','🕺','⭐','❤️'
  ];

  // Custom select option arrays
  fontOptions: SelectOption[] = [
    {value:'sans',label:'Lato (Sans)'},{value:'montserrat',label:'Montserrat'},{value:'raleway',label:'Raleway'},
    {value:'josefin',label:'Josefin Sans'},{value:'serif',label:'Playfair Display'},{value:'cormorant',label:'Cormorant Garamond'},
    {value:'cinzel',label:'Cinzel'},{value:'baskerville',label:'Libre Baskerville'},{value:'script',label:'Great Vibes'},
    {value:'spumoni',label:'Spumoni'},{value:'dancing',label:'Dancing Script'},{value:'sacramento',label:'Sacramento'},
    {value:'tangerine',label:'Tangerine'},{value:'alexbrush',label:'Alex Brush'},{value:'pinyon',label:'Pinyon Script'},
    {value:'aura',label:'Aura'},{value:'allura',label:'Allura'}
  ];

  themeFontOptions: SelectOption[] = [
    {value:'',label:'Hereda (default)'},
    {value:'sans',label:'Lato (Sans)'},{value:'montserrat',label:'Montserrat'},{value:'raleway',label:'Raleway'},
    {value:'josefin',label:'Josefin Sans'},{value:'serif',label:'Playfair Display'},{value:'cormorant',label:'Cormorant Garamond'},
    {value:'cinzel',label:'Cinzel'},{value:'baskerville',label:'Libre Baskerville'},{value:'script',label:'Great Vibes'},
    {value:'spumoni',label:'Spumoni'},{value:'dancing',label:'Dancing Script'},{value:'sacramento',label:'Sacramento'},
    {value:'tangerine',label:'Tangerine'},{value:'alexbrush',label:'Alex Brush'},{value:'pinyon',label:'Pinyon Script'},
    {value:'aura',label:'Aura'},{value:'allura',label:'Allura'}
  ];

  separatorStyleOptions: SelectOption[] = [
    {value:'elegant',label:'Elegante'},{value:'formal',label:'Formal'},{value:'executive',label:'Ejecutivo'},
    {value:'festive',label:'Festivo'},{value:'animated',label:'Animado'},{value:'minimal',label:'Minimal'},
    {value:'ornamental',label:'Ornamental'}
  ];

  ornamentPositionOptions: SelectOption[] = [
    {value:'above',label:'Arriba'},{value:'below',label:'Abajo'},{value:'both',label:'Ambos'},{value:'sides',label:'A los lados'}
  ];

  borderStyleOptions: SelectOption[] = [
    {value:'none',label:'Sin borde'},{value:'solid',label:'Solido'},{value:'dotted',label:'Punteado'},
    {value:'dashed',label:'Discontinuo'},{value:'double',label:'Doble'},{value:'glow',label:'Luminoso'},{value:'neon',label:'Neon'}
  ];

  cardShapeOptions: SelectOption[] = [
    {value:'standard',label:'Estandar'},{value:'ticket',label:'Ticket'},{value:'wave',label:'Ondulado'},
    {value:'hexagon',label:'Hexagonal'},{value:'diamond',label:'Diamante'},{value:'cloud',label:'Nube'},{value:'scroll',label:'Pergamino'}
  ];

  envelopeStyleOptions: SelectOption[] = [
    {value:'classic',label:'Clasico'},{value:'elegant',label:'Elegante'},{value:'vertical',label:'Vertical'},{value:'minimal',label:'Minimal'},{value:'wax',label:'Lacre'}
  ];

  sealStyleOptions: SelectOption[] = [
    {value:'wax-circle',label:'Circulo Lacre'},{value:'wax-heart',label:'Corazon Lacre'},{value:'ribbon',label:'Cinta'},{value:'stamp',label:'Estampa'},{value:'monogram',label:'Monograma'}
  ];

  landingBgTypeOptions: SelectOption[] = [
    {value:'solid',label:'Solido'},{value:'linear',label:'Lineal'},{value:'radial',label:'Radial'},{value:'mesh',label:'Difuminado'}
  ];

  bgFitOptions: SelectOption[] = [
    {value:'cover',label:'Pantalla completa'},{value:'banner',label:'Banner centrado'}
  ];

  landingBgTextureOptions: SelectOption[] = [
    {value:'none',label:'Ninguna'},{value:'noise',label:'Noise'},{value:'grain',label:'Grain'},{value:'dots',label:'Dots'},
    {value:'lines',label:'Lines'},{value:'cross',label:'Cross'},{value:'paper',label:'Paper'},{value:'linen',label:'Linen'},{value:'stars',label:'Stars'}
  ];

  introTransitionOptions: SelectOption[] = [
    {value:'fade',label:'Desvanecer'},{value:'slide-up',label:'Deslizar arriba'},{value:'slide-down',label:'Deslizar abajo'},
    {value:'zoom-in',label:'Zoom acercar'},{value:'zoom-out',label:'Zoom alejar'},{value:'blur',label:'Desenfoque'},{value:'none',label:'Sin transicion'}
  ];

  introParticleTypeOptions: SelectOption[] = [
    {value:'sparkles',label:'Destellos'},{value:'snow',label:'Nieve'},{value:'fireflies',label:'Luciernagas'},
    {value:'bubbles',label:'Burbujas'},{value:'stars',label:'Estrellas'},{value:'confetti',label:'Confeti'}
  ];

  /** Tipos de partículas de la sección Regalos: los de la Intro + temáticos (emoji). */
  giftsParticleTypeOptions: SelectOption[] = [
    {value:'sparkles',label:'Destellos'},{value:'snow',label:'Nieve'},{value:'fireflies',label:'Luciernagas'},
    {value:'bubbles',label:'Burbujas'},{value:'stars',label:'Estrellas'},{value:'confetti',label:'Confeti'},
    {value:'flowers',label:'Florecitas 🌸'},{value:'gifts',label:'Cajitas de regalo 🎁'},{value:'bows',label:'Moñitos 🎀'},
    {value:'hearts',label:'Corazoncitos 💖'},{value:'bills',label:'Billetitos 💵'},{value:'coins',label:'Moneditas 🪙'}
  ];

  introParticleDirectionOptions: SelectOption[] = [
    {value:'up',label:'Arriba'},{value:'down',label:'Abajo'},{value:'left',label:'Izquierda'},{value:'right',label:'Derecha'}
  ];

  iconStyleOptions: SelectOption[] = [
    {value:'circle',label:'Circulo'},{value:'plain',label:'Plano'},{value:'none',label:'Sin icono'}
  ];

  textAlignOptions: SelectOption[] = [
    {value:'left',label:'Izquierda'},{value:'center',label:'Centro'},{value:'right',label:'Derecha'}
  ];

  instructionAnimOptions: SelectOption[] = [
    {value:'pulse',label:'Pulso'},{value:'bounce',label:'Rebote'},{value:'fade',label:'Aparecer/Desaparecer'},
    {value:'slide-up',label:'Deslizar arriba'},{value:'glow',label:'Brillar'},{value:'none',label:'Sin animacion'}
  ];

  /** Catálogo de iconos de RELOJ (Material Icons, monocromáticos) para el horario de un lugar. */
  venueTimeIconOptions: SelectOption[] = [
    {value:'schedule',label:'Reloj (clásico)'},{value:'access_time',label:'Reloj (contorno)'},
    {value:'alarm',label:'Alarma'},{value:'watch_later',label:'Reloj (relleno)'},
    {value:'hourglass_empty',label:'Reloj de arena'},{value:'event',label:'Calendario'},
    {value:'none',label:'Sin icono'},
  ];
  /** Catálogo de iconos de MAPA/UBICACIÓN para el botón "Cómo llegar" de un lugar. */
  venueBtnIconOptions: SelectOption[] = [
    {value:'map',label:'Mapa'},{value:'place',label:'Pin de ubicación'},
    {value:'location_on',label:'Ubicación'},{value:'near_me',label:'Navegación'},
    {value:'directions',label:'Direcciones'},{value:'explore',label:'Brújula'},
    {value:'none',label:'Sin icono'},
  ];

  /** Opciones del indicador de scroll de la caratula (tipo de icono). */
  scrollIndicatorTypeOptions: SelectOption[] = [
    {value:'double-chevron',label:'Doble flecha (chevron)'},
    {value:'single-chevron',label:'Flecha simple (chevron)'},
    {value:'arrow-down',label:'Flecha hacia abajo'},
    {value:'chevron-circle',label:'Flecha en circulo'},
    {value:'mouse',label:'Mouse'},
    {value:'dot',label:'Punto'},
  ];
  /** Opciones de animacion del indicador de scroll. */
  scrollIndicatorAnimOptions: SelectOption[] = [
    {value:'bounce',label:'Rebote'},{value:'pulse',label:'Pulso'},{value:'fade',label:'Aparecer/Desaparecer'},
    {value:'slide-down',label:'Deslizar abajo'},{value:'none',label:'Sin animacion'}
  ];

  /** Opciones de animacion de SALIDA del template Plano (al tocar para continuar). */
  plainExitAnimOptions: SelectOption[] = [
    {value:'fade',label:'Desvanecer'},{value:'zoom-out',label:'Alejar (zoom out)'},
    {value:'zoom-in',label:'Acercar (zoom in)'},{value:'slide-up',label:'Deslizar arriba'},
    {value:'blur',label:'Desenfocar'},{value:'none',label:'Instantaneo'}
  ];

  envBgTypeOptions: SelectOption[] = [
    {value:'solid',label:'Solido'},{value:'linear',label:'Lineal'},{value:'radial',label:'Radial'}
  ];

  iconTypeOptions: SelectOption[] = [
    {value:'emoji',label:'Emoji'},{value:'image',label:'Imagen'},{value:'none',label:'Ninguno'}
  ];

  accountTypeOptions: SelectOption[] = [
    {value:'tarjeta',label:'Tarjeta'},{value:'cuenta',label:'Cuenta'},{value:'clabe',label:'CLABE'}
  ];

  transferAnimOptions: SelectOption[] = [
    {value:'coins',label:'Monedas'},{value:'bills',label:'Billetes'},{value:'none',label:'Ninguna'}
  ];

  getHour(time: string): string {
    if (!time) return '12';
    const match = time.match(/(\d+)/);
    if (!match) return '12';
    let h = parseInt(match[1]);
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return h.toString();
  }

  getMinute(time: string): string {
    if (!time) return '00';
    const match = time.match(/:(\d+)/);
    return match ? match[1] : '00';
  }

  getAmPm(time: string): string {
    if (!time) return 'PM';
    return time.toUpperCase().includes('AM') ? 'AM' : 'PM';
  }

  setTime(index: number, hour: string, minute: string, ampm: string) {
    const timeStr = `${hour}:${minute} ${ampm}`;
    this.updateItineraryItem(index, 'time', timeStr);
  }

  uploadItineraryIcon(index: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      this.api.uploadFile('images', f).subscribe({
        next: (r) => this.updateItineraryItem(index, 'iconUrl', r.url)
      });
    };
    input.click();
  }

  getParticlesProp(prop: string): any {
    return this.sec('intro')?.particles?.[prop] ?? null;
  }

  /** Opciones de estilo de la línea de carga de la intro. */
  introProgressStyleOptions = [
    { value: 'solid', label: 'Sólida' },
    { value: 'glow', label: 'Resplandor' },
    { value: 'gradient', label: 'Degradado' },
    { value: 'dashed', label: 'Punteada' },
  ];

  /** Contenido inicial del editor enriquecido de la frase. Si ya hay HTML, lo usa; si no,
      migra el texto plano `phrase` (envuelto en <p>) la primera vez para no perderlo. */
  introPhraseHtml(): string {
    const intro = this.sec('intro');
    if (!intro) return '';
    if (intro.phraseHtml) return intro.phraseHtml;
    const plain = (intro.phrase || '').trim();
    return plain ? `<p>${plain}</p>` : '';
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

  // === Video Trimmer ===
  maxIntroDuration = 5;
  private trimDragging: 'start' | 'end' | null = null;
  @ViewChild('trimmerTrack') trimmerTrack?: ElementRef<HTMLElement>;
  @ViewChild('introTrimVideo') introTrimVideo?: ElementRef<HTMLVideoElement>;

  getTrimLeft(): number {
    const dur = this.sec('intro')?.videoDuration || 5;
    return ((this.sec('intro')?.videoStart || 0) / dur) * 100;
  }

  getTrimRight(): number {
    const dur = this.sec('intro')?.videoDuration || 5;
    return ((this.sec('intro')?.videoEnd || dur) / dur) * 100;
  }

  getTrimWidth(): number {
    return this.getTrimRight() - this.getTrimLeft();
  }

  getSelectedDuration(): number {
    const start = this.sec('intro')?.videoStart || 0;
    const end = this.sec('intro')?.videoEnd || (this.sec('intro')?.videoDuration || 5);
    return Math.round((end - start) * 10) / 10;
  }

  formatTrimTime(seconds: number): string {
    const s = Math.round(seconds * 10) / 10;
    return s.toFixed(1) + 's';
  }

  startTrimDrag(handle: 'start' | 'end', e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.trimDragging = handle;
    const onMove = (ev: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      this.onTrimMove(clientX);
    };
    const onEnd = () => {
      this.trimDragging = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      this.updateIntroDurationFromTrim();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onEnd);
  }

  onTrimTrackClick(event: MouseEvent) {
    if (!this.trimmerTrack) return;
    const rect = this.trimmerTrack.nativeElement.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const dur = this.sec('intro')?.videoDuration || 5;
    const time = percent * dur;
    const start = this.sec('intro')?.videoStart || 0;
    const end = this.sec('intro')?.videoEnd || dur;
    if (Math.abs(time - start) < Math.abs(time - end)) {
      this.setSec('intro', 'videoStart', Math.round(time * 10) / 10);
    } else {
      this.setSec('intro', 'videoEnd', Math.round(time * 10) / 10);
    }
    this.updateIntroDurationFromTrim();
  }

  onTrimTrackTouch(event: TouchEvent) {
    const touch = event.touches[0];
    if (!this.trimmerTrack) return;
    const rect = this.trimmerTrack.nativeElement.getBoundingClientRect();
    const percent = (touch.clientX - rect.left) / rect.width;
    const dur = this.sec('intro')?.videoDuration || 5;
    const time = percent * dur;
    const start = this.sec('intro')?.videoStart || 0;
    const end = this.sec('intro')?.videoEnd || dur;
    if (Math.abs(time - start) < Math.abs(time - end)) {
      this.setSec('intro', 'videoStart', Math.round(time * 10) / 10);
    } else {
      this.setSec('intro', 'videoEnd', Math.round(time * 10) / 10);
    }
    this.startTrimDrag(Math.abs(time - start) < Math.abs(time - end) ? 'start' : 'end', event);
  }

  private onTrimMove(clientX: number) {
    if (!this.trimDragging || !this.trimmerTrack) return;
    const rect = this.trimmerTrack.nativeElement.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const dur = this.sec('intro')?.videoDuration || 5;
    const time = Math.round(percent * dur * 10) / 10;
    if (this.trimDragging === 'start') {
      const end = this.sec('intro')?.videoEnd || dur;
      this.setSec('intro', 'videoStart', Math.min(time, end - 0.5));
    } else {
      const start = this.sec('intro')?.videoStart || 0;
      this.setSec('intro', 'videoEnd', Math.max(time, start + 0.5));
    }
    // Enforce max duration
    const start = this.sec('intro')?.videoStart || 0;
    const end = this.sec('intro')?.videoEnd || dur;
    if (end - start > this.maxIntroDuration) {
      if (this.trimDragging === 'start') {
        this.setSec('intro', 'videoStart', end - this.maxIntroDuration);
      } else {
        this.setSec('intro', 'videoEnd', start + this.maxIntroDuration);
      }
    }
  }

  private updateIntroDurationFromTrim() {
    const start = this.sec('intro')?.videoStart || 0;
    const end = this.sec('intro')?.videoEnd || 5;
    this.setSec('intro', 'duration', Math.min(Math.round((end - start) * 10) / 10, this.maxIntroDuration));
  }

  previewTrim() {
    if (!this.introTrimVideo?.nativeElement) return;
    const video = this.introTrimVideo.nativeElement;
    video.currentTime = this.sec('intro')?.videoStart || 0;
    video.play();
    const checkEnd = () => {
      if (video.currentTime >= (this.sec('intro')?.videoEnd || video.duration)) {
        video.pause();
        video.removeEventListener('timeupdate', checkEnd);
      }
    };
    video.addEventListener('timeupdate', checkEnd);
  }

  adjustHeroFont(styleProp: string, delta: number) {
    const cfg = this.canvasState.getConfig(); if (!cfg) return;
    const style = (cfg.hero as any)[styleProp] || {};
    const defaults: Record<string, number> = { celebrantNamesStyle: 48, eventDescriptionStyle: 18, heroPhraseStyle: 14 };
    const mins: Record<string, number> = { celebrantNamesStyle: 16, eventDescriptionStyle: 10, heroPhraseStyle: 10 };
    const maxs: Record<string, number> = { celebrantNamesStyle: 120, eventDescriptionStyle: 60, heroPhraseStyle: 40 };
    const current = style.fontSize || defaults[styleProp] || 16;
    const next = Math.max(mins[styleProp] || 10, Math.min(maxs[styleProp] || 120, current + delta));
    style.fontSize = next;
    (cfg.hero as any)[styleProp] = style;
    this.canvasState.isDirty.set(true);
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

  /** True si la url apunta a un video (para mostrar ícono en vez de miniatura en los previews). */
  thumbIsVideo(url?: string | null): boolean {
    if (!url) return false;
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'ogg'].includes(ext);
  }

  /** Etiqueta de tipo (IMG / GIF / VIDEO) para el badge de los previews de media. */
  thumbKind(url?: string | null): string {
    if (!url) return '';
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'VIDEO';
    if (ext === 'gif') return 'GIF';
    return 'IMG';
  }
}
