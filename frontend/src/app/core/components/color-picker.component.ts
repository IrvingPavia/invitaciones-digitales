import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="color-picker-wrapper">
      <div class="color-picker-row">
        <div class="color-swatch" [style.background]="value" (click)="togglePicker($event)"></div>
        <input type="text" class="color-hex-input" [ngModel]="hexColor" (ngModelChange)="onHexType($event)" (blur)="onHexType(hexColor)" spellcheck="false" maxlength="7">
        @if (showOpacity) {
          <span class="color-opacity-label">{{ opacityPercent }}%</span>
        }
      </div>

      @if (pickerOpen) {
        <div class="picker-overlay" (click)="closePicker()"></div>
        <div class="picker-popup" (click)="$event.stopPropagation()">
            <!-- 2D Saturation/Lightness area -->
            <div class="picker-saturation" #satArea
                 [style.background]="'hsl(' + hue + ', 100%, 50%)'"
                 (mousedown)="onSatMouseDown($event)"
                 (touchstart)="onSatTouchStart($event)">
            <div class="sat-white"></div>
            <div class="sat-black"></div>
            <div class="sat-pointer" [style.left.%]="saturation" [style.top.%]="100 - lightness"></div>
          </div>

          <!-- Opacity slider -->
          <div class="picker-opacity-section">
            <span class="opacity-value">{{ opacityPercent }}</span>
            <div class="picker-opacity-track" #opacityTrack
                 (mousedown)="onOpacityMouseDown($event)"
                 (touchstart)="onOpacityTouchStart($event)">
              <div class="opacity-checker"></div>
              <div class="opacity-gradient" [style.background]="'linear-gradient(to right, ' + hexColor + ', transparent)'"></div>
              <div class="opacity-thumb" [style.left.%]="100 - opacityPercent"></div>
            </div>
          </div>

          <!-- Presets + Hex + Add -->
          <div class="picker-bottom-row">
            <div class="picker-presets-btn" (click)="showPresets = !showPresets; $event.stopPropagation()">
              <span class="preset-dot" [style.background]="presets[0] || '#fff'"></span>
              <span class="preset-dot" [style.background]="presets[1] || '#ccc'"></span>
              <span class="preset-dot" [style.background]="presets[2] || '#888'"></span>
              <span class="preset-dot" [style.background]="presets[3] || '#444'"></span>
            </div>
            <input type="text" class="picker-hex-input" [ngModel]="hexDisplay" (ngModelChange)="onPickerHexType($event)" spellcheck="false" maxlength="6" (click)="$event.stopPropagation()">
            <button class="picker-add-btn" (click)="addToPresets(); $event.stopPropagation()" title="Guardar color">
              <span class="material-icons">add</span>
            </button>
          </div>

          <!-- Presets panel -->
          @if (showPresets) {
            <div class="picker-presets-grid" (click)="$event.stopPropagation()">
              @for (p of presets; track $index) {
                <div class="preset-swatch" [style.background]="p" (click)="applyPreset(p)"></div>
              }
            </div>
          }

          <!-- Hue slider -->
          <div class="picker-hue-track" #hueTrack
               (mousedown)="onHueMouseDown($event)"
               (touchstart)="onHueTouchStart($event)">
            <div class="hue-thumb" [style.left.%]="hue / 360 * 100"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .color-picker-wrapper { position: relative; display: inline-block; }
    .color-picker-row { display: flex; align-items: center; gap: 8px; }
    .color-swatch {
      width: 36px; height: 36px; border-radius: 8px;
      border: 2px solid rgba(255,255,255,0.2); cursor: pointer;
      transition: border-color 0.2s; flex-shrink: 0;
      &:hover { border-color: var(--gold); }
    }
    .color-hex-input {
      width: 80px; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;
      padding: 6px 10px; color: white; font-size: 13px;
      font-family: 'Courier New', monospace; letter-spacing: 0.5px;
      &:focus { outline: none; border-color: var(--gold); }
    }
    .color-opacity-label { font-size: 11px; color: rgba(255,255,255,0.5); min-width: 32px; }

    .picker-overlay {
      position: fixed; inset: 0; z-index: 99998;
      background: transparent;
    }
    .picker-popup {
      position: fixed; top: 100px; right: 292px; z-index: 99999;
      width: 260px; border-radius: 12px;
      background: #111; box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08);
      display: flex; flex-direction: column;
    }
    @media (max-width: 900px) {
      .picker-popup { right: 50%; transform: translateX(50%); }
    }

    /* Saturation area */
    .picker-saturation {
      position: relative; width: 100%; height: 180px; cursor: crosshair;
      border-radius: 10px 10px 0 0; overflow: hidden;
      touch-action: none;
    }
    .sat-white {
      position: absolute; inset: 0;
      background: linear-gradient(to right, #fff, transparent);
    }
    .sat-black {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent, #000);
    }
    .sat-pointer {
      position: absolute; width: 18px; height: 18px;
      border: 2px solid white; border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 1px 4px rgba(0,0,0,0.5);
      pointer-events: none;
    }

    /* Opacity */
    .picker-opacity-section {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px 6px;
    }
    .opacity-value {
      font-size: 12px; color: rgba(255,255,255,0.6); min-width: 24px; text-align: right;
    }
    .picker-opacity-track {
      flex: 1; height: 18px; border-radius: 9px;
      position: relative; cursor: pointer; overflow: hidden;
      touch-action: none;
    }
    .opacity-checker {
      position: absolute; inset: 0; border-radius: 9px;
      background-image: repeating-conic-gradient(#444 0% 25%, #666 0% 50%);
      background-size: 8px 8px;
    }
    .opacity-gradient {
      position: absolute; inset: 0; border-radius: 9px;
    }
    .opacity-thumb {
      position: absolute; top: 50%; transform: translate(-50%, -50%);
      width: 20px; height: 20px; border-radius: 50%;
      border: 2px solid white; background: transparent;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      pointer-events: none;
    }

    /* Bottom row */
    .picker-bottom-row {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px;
    }
    .picker-presets-btn {
      display: grid; grid-template-columns: 1fr 1fr; gap: 3px;
      cursor: pointer; padding: 4px; border-radius: 6px;
      transition: background 0.15s; flex-shrink: 0;
      &:hover { background: rgba(255,255,255,0.1); }
    }
    .preset-dot {
      width: 11px; height: 11px; border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.3);
    }
    .picker-hex-input {
      flex: 1; background: transparent; border: none;
      color: white; font-size: 15px; font-weight: 600;
      font-family: 'Courier New', monospace;
      text-align: center; letter-spacing: 1.5px;
      min-width: 0;
      &:focus { outline: none; }
    }
    .picker-add-btn {
      width: 30px; height: 30px; min-width: 30px; border-radius: 50%;
      background: white; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.15s; flex-shrink: 0; padding: 0;
      .material-icons { font-size: 18px; color: #111; line-height: 1; }
      &:hover { transform: scale(1.1); }
    }

    /* Presets grid */
    .picker-presets-grid {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding: 6px 12px 10px;
    }
    .preset-swatch {
      width: 24px; height: 24px; border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.2); cursor: pointer;
      transition: transform 0.15s, border-color 0.15s;
      &:hover { transform: scale(1.15); border-color: white; }
    }

    /* Hue slider */
    .picker-hue-track {
      height: 14px; margin: 0 12px 10px;
      border-radius: 7px; position: relative; cursor: pointer;
      background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
      touch-action: none;
    }
    .hue-thumb {
      position: absolute; top: 50%; transform: translate(-50%, -50%);
      width: 4px; height: 18px; border-radius: 2px;
      background: rgba(0,0,0,0.7); border: 1px solid white;
      pointer-events: none;
    }

    /* Light mode */
    :host-context(body.light-mode) .color-hex-input { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.15); color: #333; }
    :host-context(body.light-mode) .color-swatch { border-color: rgba(0,0,0,0.2); }
    :host-context(body.light-mode) .color-opacity-label { color: rgba(0,0,0,0.5); }
    :host-context(body.light-mode) .picker-popup { background: #1a1a1a; }
  `]
})
export class ColorPickerComponent implements OnInit, OnChanges {
  @Input() value = '#d4a017';
  @Input() showOpacity = false;
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('satArea') satAreaRef!: ElementRef<HTMLElement>;
  @ViewChild('hueTrack') hueTrackRef!: ElementRef<HTMLElement>;
  @ViewChild('opacityTrack') opacityTrackRef!: ElementRef<HTMLElement>;
  @ViewChild('pickerPopup') pickerPopupRef!: ElementRef<HTMLElement>;

  hexColor = '#d4a017';
  opacityPercent = 100;
  pickerOpen = false;
  showPresets = false;

  // HSL values
  hue = 0;
  saturation = 100;
  lightness = 50;

  // Presets (session-based)
  presets: string[] = ['#d4a017', '#ffffff', '#000000', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#f59e0b'];

  private dragging: 'sat' | 'hue' | 'opacity' | null = null;
  private preserveHue = false;

  get hexDisplay(): string {
    return this.hexColor.replace('#', '').toUpperCase();
  }

  ngOnInit() { this.parseValue(); }
  ngOnChanges() { if (!this.dragging) this.parseValue(); }

  private parseValue() {
    if (!this.value) { this.hexColor = '#d4a017'; this.opacityPercent = 100; this.hexToHsl(); return; }
    const v = this.value.trim();
    if (v.startsWith('#')) {
      this.hexColor = v.length === 9 ? v.slice(0, 7) : v;
      this.opacityPercent = v.length === 9 ? Math.round(parseInt(v.slice(7), 16) / 255 * 100) : 100;
    } else if (v.startsWith('rgba')) {
      const m = v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (m) {
        this.hexColor = '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
        this.opacityPercent = m[4] ? Math.round(parseFloat(m[4]) * 100) : 100;
      }
    } else if (v.startsWith('rgb')) {
      const m = v.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (m) {
        this.hexColor = '#' + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
        this.opacityPercent = 100;
      }
    }
    this.hexToHsl();
  }

  togglePicker(event: Event) {
    event.stopPropagation();
    if (this.pickerOpen) { this.closePicker(); return; }
    this.pickerOpen = true;
    this.showPresets = false;
  }

  private _resizeListener: (() => void) | null = null;

  closePicker() {
    this.pickerOpen = false;
    this.showPresets = false;
  }

  // === Saturation/Lightness 2D area ===
  onSatMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.dragging = 'sat';
    this.updateSatFromEvent(e.clientX, e.clientY);
    const onMove = (ev: MouseEvent) => this.updateSatFromEvent(ev.clientX, ev.clientY);
    const onUp = () => { this.dragging = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  onSatTouchStart(e: TouchEvent) {
    e.preventDefault();
    this.dragging = 'sat';
    const t = e.touches[0];
    this.updateSatFromEvent(t.clientX, t.clientY);
    const onMove = (ev: TouchEvent) => { const tc = ev.touches[0]; this.updateSatFromEvent(tc.clientX, tc.clientY); };
    const onEnd = () => { this.dragging = null; window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  private updateSatFromEvent(clientX: number, clientY: number) {
    if (!this.satAreaRef) return;
    const rect = this.satAreaRef.nativeElement.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    this.saturation = x * 100;
    this.lightness = (1 - y) * 100;
    this.preserveHue = true;
    this.hslToHex();
    this.preserveHue = false;
    this.emit();
  }

  // === Hue slider ===
  onHueMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.dragging = 'hue';
    this.updateHueFromEvent(e.clientX);
    const onMove = (ev: MouseEvent) => this.updateHueFromEvent(ev.clientX);
    const onUp = () => { this.dragging = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  onHueTouchStart(e: TouchEvent) {
    e.preventDefault();
    this.dragging = 'hue';
    this.updateHueFromEvent(e.touches[0].clientX);
    const onMove = (ev: TouchEvent) => this.updateHueFromEvent(ev.touches[0].clientX);
    const onEnd = () => { this.dragging = null; window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  private updateHueFromEvent(clientX: number) {
    if (!this.hueTrackRef) return;
    const rect = this.hueTrackRef.nativeElement.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    this.hue = Math.round(x * 360);
    this.hslToHex();
    this.emit();
  }

  // === Opacity slider ===
  onOpacityMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.dragging = 'opacity';
    this.updateOpacityFromEvent(e.clientX);
    const onMove = (ev: MouseEvent) => this.updateOpacityFromEvent(ev.clientX);
    const onUp = () => { this.dragging = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  onOpacityTouchStart(e: TouchEvent) {
    e.preventDefault();
    this.dragging = 'opacity';
    this.updateOpacityFromEvent(e.touches[0].clientX);
    const onMove = (ev: TouchEvent) => this.updateOpacityFromEvent(ev.touches[0].clientX);
    const onEnd = () => { this.dragging = null; window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  private updateOpacityFromEvent(clientX: number) {
    if (!this.opacityTrackRef) return;
    const rect = this.opacityTrackRef.nativeElement.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    // Left = full opacity, Right = transparent
    this.opacityPercent = Math.round((1 - x) * 100);
    this.emit();
  }

  // === Hex input in picker ===
  onPickerHexType(val: string) {
    const clean = val.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    if (clean.length === 6) {
      this.hexColor = '#' + clean;
      this.hexToHsl();
      this.emit();
    }
  }

  onHexType(val: string) {
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      this.hexColor = val;
      this.hexToHsl();
      this.emit();
    }
  }

  // === Presets ===
  addToPresets() {
    if (!this.presets.includes(this.hexColor)) {
      this.presets = [this.hexColor, ...this.presets.slice(0, 7)];
    }
  }

  applyPreset(color: string) {
    this.hexColor = color;
    this.hexToHsl();
    this.emit();
  }

  // === Color conversion ===
  private hexToHsl() {
    const r = parseInt(this.hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(this.hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(this.hexColor.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    // Convert to HSB/HSV
    const v = max;
    const sv = max === 0 ? 0 : (max - min) / max;
    // Only update hue if NOT preserving it (i.e., not dragging in sat area)
    if (!this.preserveHue) {
      if (max !== min) {
        let h = 0;
        const d = max - min;
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
        this.hue = Math.round(h * 360);
      }
      // If max === min (gray/black/white), keep existing hue
    }
    this.saturation = Math.round(sv * 100);
    this.lightness = Math.round(v * 100);
  }

  private hslToHex() {
    // HSB/HSV to RGB
    const s = this.saturation / 100;
    const v = this.lightness / 100;
    const h = this.hue / 360;
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    const hex = '#' + [r, g, b].map(c => {
      const val = Math.max(0, Math.min(255, Math.round(c * 255)));
      return val.toString(16).padStart(2, '0');
    }).join('');
    // Validate: must be exactly #RRGGBB
    if (/^#[0-9a-f]{6}$/.test(hex)) {
      this.hexColor = hex;
    }
  }

  private emit() {
    // Validate hex is proper format before emitting
    if (!/^#[0-9a-fA-F]{6}$/.test(this.hexColor)) return;
    if (!this.showOpacity || this.opacityPercent === 100) {
      this.valueChange.emit(this.hexColor);
    } else {
      const r = parseInt(this.hexColor.slice(1, 3), 16);
      const g = parseInt(this.hexColor.slice(3, 5), 16);
      const b = parseInt(this.hexColor.slice(5, 7), 16);
      const a = (this.opacityPercent / 100).toFixed(2).replace(/\.?0+$/, '');
      this.valueChange.emit(`rgba(${r},${g},${b},${a})`);
    }
  }
}
