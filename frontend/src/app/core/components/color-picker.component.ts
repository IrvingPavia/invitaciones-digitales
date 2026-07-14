import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="color-picker-row">
      <div class="color-swatch" [style.background]="value" (click)="colorInput.click()"></div>
      <input #colorInput type="color" [ngModel]="hexColor" (ngModelChange)="onHexPick($event)" class="color-hidden-input">
      <input type="text" class="color-hex-input" [ngModel]="hexColor" (ngModelChange)="onHexType($event)" (blur)="onHexType(hexColor)" spellcheck="false" maxlength="7">
      @if (showOpacity) {
        <input type="range" class="color-opacity-slider" min="0" max="100" [ngModel]="opacityPercent" (ngModelChange)="onOpacityChange($event)">
        <span class="color-opacity-label">{{ opacityPercent }}%</span>
      }
      <button class="color-copy-btn" (click)="copyValue()" [title]="'Copiar ' + value">
        <span class="material-icons">{{ copied ? 'check' : 'content_copy' }}</span>
      </button>
    </div>
  `,
  styles: [`
    .color-picker-row {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .color-swatch {
      width: 36px; height: 36px; border-radius: 8px;
      border: 2px solid rgba(255,255,255,0.2); cursor: pointer;
      transition: border-color 0.2s; flex-shrink: 0;
      &:hover { border-color: var(--gold); }
    }
    .color-hidden-input {
      position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none;
    }
    .color-hex-input {
      width: 80px; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;
      padding: 6px 10px; color: white; font-size: 13px;
      font-family: 'Courier New', monospace; letter-spacing: 0.5px;
      &:focus { outline: none; border-color: var(--gold); }
    }
    .color-opacity-slider {
      width: 60px; accent-color: var(--gold); cursor: pointer;
    }
    .color-opacity-label {
      font-size: 11px; color: rgba(255,255,255,0.5); min-width: 32px;
    }
    .color-copy-btn {
      background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.4); padding: 4px; display: flex;
      align-items: center; transition: color 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { color: var(--gold); }
    }
  `]
})
export class ColorPickerComponent implements OnInit, OnChanges {
  @Input() value = '#d4a017';
  @Input() showOpacity = false;
  @Output() valueChange = new EventEmitter<string>();

  hexColor = '#d4a017';
  opacityPercent = 100;
  copied = false;

  ngOnInit() { this.parseValue(); }
  ngOnChanges() { this.parseValue(); }

  private parseValue() {
    if (!this.value) { this.hexColor = '#d4a017'; this.opacityPercent = 100; return; }
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
  }

  onHexPick(hex: string) {
    this.hexColor = hex;
    this.emit();
  }

  onHexType(val: string) {
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      this.hexColor = val;
      this.emit();
    }
  }

  onOpacityChange(pct: number) {
    this.opacityPercent = pct;
    this.emit();
  }

  private emit() {
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

  copyValue() {
    navigator.clipboard.writeText(this.value || this.hexColor);
    this.copied = true;
    setTimeout(() => this.copied = false, 1500);
  }
}
