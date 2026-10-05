import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ColorPickerComponent } from './color-picker.component';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, ColorPickerComponent],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RichTextEditorComponent),
    multi: true,
  }],
  template: `
    <div class="rte-wrapper">
      <div class="rte-toolbar">
        <!-- Fila 1: acciones de formato agrupadas -->
        <div class="rte-row">
          <div class="rte-group">
            <button type="button" (mousedown)="exec($event, 'bold')" title="Negrita"><b>B</b></button>
            <button type="button" (mousedown)="exec($event, 'italic')" title="Cursiva"><i>I</i></button>
            <button type="button" (mousedown)="exec($event, 'underline')" title="Subrayado"><u>U</u></button>
          </div>
          <div class="rte-group">
            <button type="button" (mousedown)="exec($event, 'justifyLeft')" title="Alinear a la izquierda"><span class="material-icons">format_align_left</span></button>
            <button type="button" (mousedown)="exec($event, 'justifyCenter')" title="Centrar"><span class="material-icons">format_align_center</span></button>
            <button type="button" (mousedown)="exec($event, 'justifyRight')" title="Alinear a la derecha"><span class="material-icons">format_align_right</span></button>
          </div>
          <button type="button" class="rte-color-btn" [class.active]="colorPickerOpen" title="Color de texto"
                  (mousedown)="onColorBtnMouseDown($event)">
            <span class="material-icons">format_color_text</span>
            <span class="rte-color-bar" [style.background]="currentColor"></span>
          </button>
        </div>
        <!-- Fila 2: selectores de fuente y tamaño -->
        <div class="rte-row">
          <div class="rte-select-wrap" title="Fuente">
            <select (change)="execFont($event)" aria-label="Fuente">
              <option value="">Fuente</option>
              <option value="Lato, sans-serif">Lato</option>
              <option value="Montserrat, sans-serif">Montserrat</option>
              <option value="Raleway, sans-serif">Raleway</option>
              <option value="Josefin Sans, sans-serif">Josefin Sans</option>
              <option value="Playfair Display, serif">Playfair Display</option>
              <option value="Cormorant Garamond, serif">Cormorant</option>
              <option value="Cinzel, serif">Cinzel</option>
              <option value="Libre Baskerville, serif">Baskerville</option>
              <option value="Great Vibes, cursive">Great Vibes</option>
              <option value="Dancing Script, cursive">Dancing Script</option>
              <option value="Sacramento, cursive">Sacramento</option>
              <option value="Tangerine, cursive">Tangerine</option>
              <option value="Alex Brush, cursive">Alex Brush</option>
              <option value="Pinyon Script, cursive">Pinyon Script</option>
              <option value="Aura, cursive">Aura</option>
              <option value="Allura, cursive">Allura</option>
            </select>
            <span class="material-icons rte-select-caret">expand_more</span>
          </div>
          <div class="rte-select-wrap rte-select-sm" title="Tamaño">
            <select (change)="execSize($event)" aria-label="Tamaño">
              <option value="">Tamaño</option>
              <option value="1">Pequeño</option>
              <option value="3">Normal</option>
              <option value="5">Grande</option>
              <option value="7">Muy grande</option>
            </select>
            <span class="material-icons rte-select-caret">expand_more</span>
          </div>
        </div>
        <!-- Fila 3: color picker incrustado (en flujo, empuja el contenido; no flota) -->
        @if (colorPickerOpen) {
          <div class="rte-color-row">
            <span class="rte-color-label">Color de texto</span>
            <app-color-picker [value]="currentColor" (valueChange)="onColorPicked($event)"></app-color-picker>
          </div>
        }
      </div>
      <div #editor class="rte-content" contenteditable="true"
           (input)="onInput()" (blur)="onBlur()" [style]="contentStyles">
      </div>
    </div>
  `,
  styles: [`
    .rte-wrapper {
      border: 1px solid rgba(124,92,191,0.35);
      border-radius: 10px;
      overflow: hidden;
      background: rgba(18,18,32,0.6);
    }
    /* === TOOLBAR (dos filas ordenadas) === */
    .rte-toolbar {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
      background: rgba(26,26,46,0.9);
      border-bottom: 1px solid rgba(124,92,191,0.2);
    }
    .rte-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    /* Grupos segmentados de botones (estilo botonera) */
    .rte-group {
      display: inline-flex;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(124,92,191,0.22);
      border-radius: 8px;
      overflow: hidden;
    }
    .rte-group button {
      background: transparent;
      border: none;
      border-right: 1px solid rgba(124,92,191,0.18);
      color: rgba(255,255,255,0.75);
      width: 32px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 13px;
      transition: background 0.15s, color 0.15s;
    }
    .rte-group button:last-child { border-right: none; }
    .rte-group button:hover {
      background: rgba(124,92,191,0.25);
      color: #fff;
    }
    .rte-group button:active {
      background: rgba(124,92,191,0.45);
    }
    .rte-group button .material-icons { font-size: 17px; }
    .rte-group button b, .rte-group button i, .rte-group button u { font-size: 14px; line-height: 1; }

    /* Botón de color con barra indicadora */
    .rte-color-btn {
      position: relative;
      width: 36px; height: 30px;
      display: inline-flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 3px; padding: 0;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(124,92,191,0.22);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }
    .rte-color-btn:hover {
      background: rgba(124,92,191,0.25);
      border-color: rgba(124,92,191,0.5);
    }
    .rte-color-btn.active {
      background: rgba(124,92,191,0.3);
      border-color: rgba(157,110,231,0.6);
    }
    .rte-color-btn .material-icons {
      font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1;
      display: block;
    }
    .rte-color-bar {
      display: block;
      width: 16px; height: 3px; border-radius: 2px;
      background: #ffffff;
    }
    /* Fila del color picker: incrustada en la toolbar, en flujo normal (no flota). */
    .rte-color-row {
      display: flex; flex-direction: column; gap: 6px;
      padding: 8px; border-radius: 8px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,92,191,0.18);
      animation: rteColorRowIn 0.2s ease;
    }
    .rte-color-label {
      font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
      color: rgba(255,255,255,0.5); font-weight: 600;
    }
    @keyframes rteColorRowIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Selectores de fuente y tamaño a ancho completo */
    .rte-select-wrap {
      position: relative;
      flex: 1;
      min-width: 0;
    }
    .rte-select-wrap.rte-select-sm { flex: 0 0 96px; }
    .rte-select-wrap select {
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(124,92,191,0.22);
      border-radius: 8px;
      color: rgba(255,255,255,0.85);
      padding: 6px 26px 6px 10px;
      font-size: 12px;
      cursor: pointer;
      height: 32px;
      text-overflow: ellipsis;
      transition: background 0.15s, border-color 0.15s;
    }
    .rte-select-wrap select:hover {
      background: rgba(124,92,191,0.15);
      border-color: rgba(124,92,191,0.45);
    }
    .rte-select-wrap select:focus {
      outline: none;
      border-color: rgba(157,110,231,0.7);
      box-shadow: 0 0 0 2px rgba(124,92,191,0.2);
    }
    .rte-select-wrap select option { background: #1a1a2e; color: #fff; }
    .rte-select-caret {
      position: absolute;
      right: 6px; top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: rgba(255,255,255,0.5);
      pointer-events: none;
    }

    /* === ÁREA DE CONTENIDO === */
    .rte-content {
      min-height: 120px;
      padding: 12px 14px;
      color: white;
      font-size: 14px;
      line-height: 1.7;
      outline: none;
    }
    .rte-content:empty::before {
      content: attr(data-placeholder);
      color: rgba(255,255,255,0.3);
    }
    .rte-content p { margin: 0 0 8px; }
    .rte-content p:last-child { margin-bottom: 0; }

    /* === LIGHT MODE === */
    :host-context(body.light-mode) .rte-wrapper { border-color: #e0e0e8; background: #fff; }
    :host-context(body.light-mode) .rte-toolbar { background: #f6f6fb; border-bottom-color: #e6e6ee; }
    :host-context(body.light-mode) .rte-group,
    :host-context(body.light-mode) .rte-color-btn,
    :host-context(body.light-mode) .rte-select-wrap select { background: #fff; border-color: #e0e0e8; }
    :host-context(body.light-mode) .rte-group button { color: #555; border-right-color: #eee; }
    :host-context(body.light-mode) .rte-group button:hover,
    :host-context(body.light-mode) .rte-color-btn:hover { background: rgba(124,92,191,0.12); color: #7c5cbf; }
    :host-context(body.light-mode) .rte-color-btn .material-icons { color: #555; }
    :host-context(body.light-mode) .rte-select-wrap select { color: #333; }
    :host-context(body.light-mode) .rte-select-caret { color: #999; }
    :host-context(body.light-mode) .rte-content { color: #222; }
    :host-context(body.light-mode) .rte-content:empty::before { color: rgba(0,0,0,0.3); }
  `]
})
export class RichTextEditorComponent implements AfterViewInit, OnChanges, ControlValueAccessor {
  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;
  @Input() placeholder = 'Escribe el contenido...';
  @Input() contentStyles: Record<string, string> = {};

  /** Color actual del selector, refleja el último color aplicado en la barra indicadora */
  currentColor = '#ffffff';
  /** Controla la visibilidad del popup del color picker personalizado */
  colorPickerOpen = false;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};
  private innerValue = '';
  private skipNextUpdate = false;

  writeValue(value: string): void {
    this.innerValue = value || '';
    if (this.editorRef?.nativeElement) {
      this.editorRef.nativeElement.innerHTML = this.innerValue;
    }
  }

  registerOnChange(fn: (val: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  ngAfterViewInit() {
    const el = this.editorRef.nativeElement;
    el.setAttribute('data-placeholder', this.placeholder);
    if (this.innerValue) {
      el.innerHTML = this.innerValue;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['placeholder'] && this.editorRef?.nativeElement) {
      this.editorRef.nativeElement.setAttribute('data-placeholder', this.placeholder);
    }
  }

  exec(e: MouseEvent, cmd: string) {
    e.preventDefault();
    document.execCommand(cmd, false);
    this.emitChange();
  }

  execFont(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    if (!val) return;
    document.execCommand('fontName', false, val);
    (e.target as HTMLSelectElement).value = '';
    this.emitChange();
  }

  execSize(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    if (!val) return;
    document.execCommand('fontSize', false, val);
    (e.target as HTMLSelectElement).value = '';
    this.emitChange();
  }

  /** Rango de seleccion guardado antes de abrir el color picker (para restaurarlo al aplicar). */
  private savedRange: Range | null = null;

  /** Al presionar el boton de color, guarda la seleccion actual y alterna el picker. */
  onColorBtnMouseDown(e: MouseEvent) {
    // Evita que el contenteditable pierda el foco/seleccion al hacer click en el boton
    e.preventDefault();
    this.saveSelection();
    this.colorPickerOpen = !this.colorPickerOpen;
  }

  /** Guarda el Range de seleccion actual si esta dentro del editor. */
  private saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (this.editorRef.nativeElement.contains(range.commonAncestorContainer)) {
        this.savedRange = range.cloneRange();
        return;
      }
    }
    this.savedRange = null;
  }

  /** Restaura la seleccion previamente guardada dentro del editor. */
  private restoreSelection() {
    if (!this.savedRange) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(this.savedRange);
    }
  }

  /** Cuando el usuario elige un color en el picker personalizado, aplica foreColor. */
  onColorPicked(color: string) {
    this.currentColor = color;
    this.editorRef.nativeElement.focus();
    this.restoreSelection();
    document.execCommand('foreColor', false, color);
    this.emitChange();
  }

  closeColorPicker(e?: Event) {
    e?.preventDefault();
    this.colorPickerOpen = false;
  }

  onInput() {
    this.emitChange();
  }

  onBlur() {
    this.onTouched();
  }

  private emitChange() {
    const html = this.editorRef.nativeElement.innerHTML;
    if (html !== this.innerValue) {
      this.innerValue = html;
      this.onChange(html);
    }
  }
}
