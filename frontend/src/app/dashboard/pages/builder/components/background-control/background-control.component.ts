import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomSelectComponent, SelectOption } from '../../../../../core/components/custom-select.component';
import { MediaBackground } from '../../../../../core/models/models';
import { ApiService } from '../../../../../core/services/api.service';
import { isVideoUrl } from '../../../../../core/utils/media-background.util';

/**
 * Control reutilizable para configurar un fondo de media (imagen/gif/video) homologado.
 * Trabaja sobre un objeto MediaBackground: emite (modelChange) con el objeto actualizado para
 * que el padre lo persista donde corresponda (theme.landingBg, hero.heroBackground,
 * sectionStyle.media).
 *
 * Soporta: media base, toggle "imagen distinta para escritorio" + media alterna, ajuste
 * (fit/position/bannerWidth), oscurecido (overlay), y validación de tamaño por tipo con tooltip.
 */
@Component({
  selector: 'app-background-control',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  template: `
    <!-- Media BASE -->
    <div class="pf">
      <label>Fondo (imagen / GIF / video)</label>
      <div class="upload-row">
        @if (model?.url) {
          <span class="file-name">{{ fileName(model?.url || '') }}</span>
          <button class="sm-btn" (click)="pickFile(false); $event.stopPropagation()">Cambiar</button>
          <button class="sm-btn danger" (click)="setProp('url', ''); $event.stopPropagation()">X</button>
        } @else {
          <button class="sm-btn" (click)="pickFile(false); $event.stopPropagation()">Subir</button>
        }
      </div>
      <p class="pf-hint"><span class="material-icons">info</span> {{ hintText }}</p>
      @if (errorMsg) { <p class="pf-error">{{ errorMsg }}</p> }
    </div>

    @if (model?.url) {
      <!-- Override DESKTOP -->
      <div class="toggle-row">
        <span class="toggle-title">Imagen distinta para escritorio</span>
        <label class="toggle-switch"><input type="checkbox" [ngModel]="model?.desktopOverride === true" (ngModelChange)="setProp('desktopOverride', $event)"><span class="slider"></span></label>
      </div>
      @if (model?.desktopOverride) {
        <div class="pf">
          <label>Fondo escritorio (imagen / GIF / video)</label>
          <div class="upload-row">
            @if (model?.urlDesktop) {
              <span class="file-name">{{ fileName(model?.urlDesktop || '') }}</span>
              <button class="sm-btn" (click)="pickFile(true); $event.stopPropagation()">Cambiar</button>
              <button class="sm-btn danger" (click)="setProp('urlDesktop', ''); $event.stopPropagation()">X</button>
            } @else {
              <button class="sm-btn" (click)="pickFile(true); $event.stopPropagation()">Subir</button>
            }
          </div>
          <p class="pf-hint">Se usa solo en escritorio; en móvil se mantiene la imagen base.</p>
        </div>
      }

      <!-- Ajuste -->
      <div class="pf"><label>Ajuste en escritorio</label>
        <app-custom-select [options]="fitOptions" [value]="model?.fit || 'cover'" (valueChange)="setProp('fit', $event)"></app-custom-select>
      </div>
      @if (model?.fit === 'banner') {
        <div class="pf"><label>Ancho del banner ({{ model?.bannerWidth || 70 }}%)</label><input type="range" class="pinput-range" min="10" max="100" step="5" [ngModel]="model?.bannerWidth || 70" (ngModelChange)="setProp('bannerWidth', +$event)"></div>
        <p class="pf-hint">En "banner centrado" la imagen mantiene su proporción en una columna centrada; el slider define su ancho. Solo aplica en escritorio; en móvil ocupa todo el ancho.</p>
      }
      <div class="pf"><label>Posición</label>
        <app-custom-select [options]="positionOptions" [value]="model?.position || 'center center'" (valueChange)="setProp('position', $event)"></app-custom-select>
      </div>
      <div class="pf"><label>Oscurecer fondo ({{ model?.overlay ?? 0 }}%)</label><input type="range" class="pinput-range" min="0" max="100" [ngModel]="model?.overlay ?? 0" (ngModelChange)="setProp('overlay', +$event)"></div>
    }
  `,
  styles: [`
    .pf { margin-bottom: 10px; }
    .pf label { display:block; font-size:10px; color:rgba(255,255,255,0.45); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
    .upload-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .file-name { font-size:11px; color:rgba(255,255,255,0.6); max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .sm-btn { background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.3); color:#fff; border-radius:6px; padding:5px 10px; font-size:11px; cursor:pointer; }
    .sm-btn:hover { background:rgba(139,92,246,0.28); }
    .sm-btn.danger { background:rgba(239,68,68,0.15); border-color:rgba(239,68,68,0.35); }
    .pf-hint { display:flex; align-items:flex-start; gap:4px; font-size:10px; color:rgba(255,255,255,0.4); line-height:1.4; margin:4px 0 0; }
    .pf-hint .material-icons { font-size:13px; margin-top:1px; }
    .pf-error { font-size:11px; color:#f87171; margin:4px 0 0; }
    .toggle-row { display:flex; align-items:center; justify-content:space-between; margin:6px 0 10px; }
    .toggle-title { font-size:12px; color:rgba(255,255,255,0.8); }
    .toggle-switch { position:relative; display:inline-block; width:38px; height:20px; }
    .toggle-switch input { opacity:0; width:0; height:0; }
    .toggle-switch .slider { position:absolute; inset:0; background:rgba(255,255,255,0.15); border-radius:20px; transition:0.2s; cursor:pointer; }
    .toggle-switch .slider:before { content:''; position:absolute; width:14px; height:14px; left:3px; top:3px; background:#fff; border-radius:50%; transition:0.2s; }
    .toggle-switch input:checked + .slider { background:#8b5cf6; }
    .toggle-switch input:checked + .slider:before { transform:translateX(18px); }
    .pinput-range { width:100%; }
  `]
})
export class BackgroundControlComponent {
  private api = inject(ApiService);

  /** Objeto MediaBackground a editar (puede venir undefined; se crea al primer cambio). */
  @Input() model: MediaBackground | null = null;
  /** Emite el MediaBackground actualizado para que el padre lo persista. */
  @Output() modelChange = new EventEmitter<MediaBackground>();

  errorMsg = '';

  fitOptions: SelectOption[] = [
    { value: 'cover', label: 'Pantalla completa' },
    { value: 'contain', label: 'Imagen completa' },
    { value: 'banner', label: 'Banner centrado' },
  ];

  positionOptions: SelectOption[] = [
    { value: 'center center', label: 'Centro' },
    { value: 'top center', label: 'Arriba' },
    { value: 'bottom center', label: 'Abajo' },
    { value: 'center left', label: 'Izquierda' },
    { value: 'center right', label: 'Derecha' },
  ];

  /** Límites de tamaño por tipo (bytes). Imagen 10MB, GIF 15MB, Video 25MB. */
  private readonly LIMITS = { image: 10, gif: 15, video: 25 };

  hintText = 'Formatos: JPG/PNG/WebP (máx 10MB), GIF (máx 15MB), MP4/WebM (máx 25MB). ' +
    'Recomendado: imagen 300KB–2MB, vertical ~1080×1920 (móvil) u horizontal ~1920×1080 (escritorio).';

  fileName(url: string): string {
    if (!url) return '';
    const name = url.split('/').pop()?.split('?')[0] || '';
    return name.length > 20 ? name.substring(0, 17) + '...' : name;
  }

  /** Clasifica el archivo por tipo para elegir límite y carpeta de subida. */
  private classify(file: File): { kind: 'image' | 'gif' | 'video'; type: 'images' | 'gifs'; limitMb: number } {
    const name = file.name.toLowerCase();
    const ext = name.split('.').pop() || '';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return { kind: 'video', type: 'gifs', limitMb: this.LIMITS.video };
    if (ext === 'gif') return { kind: 'gif', type: 'gifs', limitMb: this.LIMITS.gif };
    return { kind: 'image', type: 'images', limitMb: this.LIMITS.image };
  }

  /** Abre el selector de archivo, valida tamaño por tipo y sube; asigna a url o urlDesktop. */
  pickFile(desktop: boolean) {
    this.errorMsg = '';
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/mp4,video/webm,.gif,.mp4,.webm';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const { kind, type, limitMb } = this.classify(f);
      const maxBytes = limitMb * 1024 * 1024;
      if (f.size > maxBytes) {
        const kindLabel = kind === 'video' ? 'video' : kind === 'gif' ? 'GIF' : 'imagen';
        this.errorMsg = `El ${kindLabel} pesa ${(f.size / 1024 / 1024).toFixed(1)}MB y supera el límite de ${limitMb}MB. Usa un archivo más ligero.`;
        return;
      }
      this.api.uploadFile(type, f).subscribe({
        next: (r) => {
          this.setProp(desktop ? 'urlDesktop' : 'url', r.url);
        },
        error: (e) => {
          this.errorMsg = e?.error?.error || 'No se pudo subir el archivo. Intenta de nuevo.';
        },
      });
    };
    input.click();
  }

  /** Actualiza una propiedad del modelo y emite el objeto completo (crea el objeto si no existe).
      value es `any` para permitir llamadas desde el template con uniones (fit) o strings. */
  setProp(prop: keyof MediaBackground, value: any) {
    const next: MediaBackground = { ...(this.model || {}) };
    (next as any)[prop] = value;
    this.model = next;
    this.modelChange.emit(next);
  }

  /** Expuesto por si el padre quiere saber si la base es video (no usado internamente aún). */
  isVideo(url?: string): boolean { return isVideoUrl(url); }
}
