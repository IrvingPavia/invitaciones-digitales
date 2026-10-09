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
            <select [value]="currentFont" (mousedown)="saveSelectionBeforeInput()" (change)="execFont($event)" aria-label="Fuente">
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
          <div class="rte-select-wrap rte-select-sm" title="Tamaño del texto">
            <select class="rte-size-select" [value]="currentSize ?? ''"
                    (mousedown)="saveSelectionBeforeInput()"
                    (change)="execSizeSelect($event)" aria-label="Tamaño del texto">
              <option value="">Tamaño</option>
              @for (s of sizeOptions; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
            <span class="material-icons rte-select-caret">expand_more</span>
          </div>
          <div class="rte-select-wrap rte-select-sm" title="Interlineado">
            <select class="rte-lh-select" [value]="currentLineHeight ?? ''"
                    (mousedown)="saveSelectionBeforeInput()"
                    (change)="execLineHeight($event)" aria-label="Interlineado">
              <option value="">Interlineado</option>
              @for (lh of lineHeightOptions; track lh) {
                <option [value]="lh">{{ lh }}</option>
              }
            </select>
            <span class="material-icons rte-select-caret">format_line_spacing</span>
          </div>
        </div>
        <!-- Fila 3: color picker incrustado (en flujo, empuja el contenido; no flota) -->
        @if (colorPickerOpen) {
          <div class="rte-color-row" (mousedown)="onColorRowMouseDown($event)" (touchstart)="saveSelection()">
            <span class="rte-color-label">Color de texto</span>
            <app-color-picker [value]="currentColor" (valueChange)="onColorPicked($event)"></app-color-picker>
          </div>
        }
      </div>
      <div #editor class="rte-content" contenteditable="true"
           (input)="onInput()" (blur)="onBlur()"
           (mouseup)="syncFromSelection()" (keyup)="syncFromSelection()"
           [style]="contentStyles">
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

    /* Input numerico de tamaño (px) */
    .rte-size-wrap {
      position: relative;
      flex: 0 0 92px;
      display: inline-flex;
      align-items: center;
    }
    .rte-size-input {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(124,92,191,0.22);
      border-radius: 8px;
      color: rgba(255,255,255,0.85);
      padding: 6px 24px 6px 10px;
      font-size: 12px;
      height: 32px;
      transition: background 0.15s, border-color 0.15s;
    }
    .rte-size-input:hover { background: rgba(124,92,191,0.15); border-color: rgba(124,92,191,0.45); }
    .rte-size-input:focus { outline: none; border-color: rgba(157,110,231,0.7); box-shadow: 0 0 0 2px rgba(124,92,191,0.2); }
    .rte-size-input::placeholder { color: rgba(255,255,255,0.4); }
    .rte-size-unit {
      position: absolute; right: 8px; top: 50%;
      transform: translateY(-50%);
      font-size: 10px; color: rgba(255,255,255,0.4);
      pointer-events: none;
    }
    :host-context(body.light-mode) .rte-size-input { color: #333; background: #fff; }
    :host-context(body.light-mode) .rte-size-unit { color: #999; }

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
    this.currentFont = val;
    this.applyStyleToSelection('fontFamily', val);
  }

  /** Fuente actual mostrada en el dropdown (familia CSS). */
  currentFont = '';

  /** Aplica una propiedad de estilo CSS a la selección actual envolviéndola en un
      <span style="prop:value">. Manipula el Range directamente (en vez de execCommand,
      que es inconsistente entre navegadores y a veces no genera estilos inline que el
      canvas respete). Soporta selecciones que cruzan varios nodos. */
  private applyStyleToSelection(prop: 'fontFamily' | 'fontSize' | 'color', value: string) {
    const el = this.editorRef.nativeElement;
    el.focus();
    this.restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    // Extraer el contenido seleccionado y envolverlo en un span con el estilo.
    const span = document.createElement('span');
    (span.style as any)[prop] = value;
    try {
      const contents = range.extractContents();
      // Limpiar la misma propiedad en descendientes para que el nuevo valor mande.
      const cssProp = prop === 'fontFamily' ? 'font-family' : prop === 'fontSize' ? 'font-size' : 'color';
      contents.querySelectorAll<HTMLElement>('[style]').forEach((n) => {
        n.style.removeProperty(cssProp);
        if (!n.getAttribute('style')) n.removeAttribute('style');
      });
      span.appendChild(contents);
      range.insertNode(span);
      // Re-seleccionar el span insertado para encadenar más cambios.
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(newRange);
      this.savedRange = newRange.cloneRange();
    } catch {
      // Si la selección es compleja y falla, no romper el editor.
      return;
    }
    this.emitChange();
  }

  /** Tamaño actual mostrado en el dropdown (px). Se refleja al aplicar. */
  currentSize: number | null = null;

  /** Tamaños predefinidos (estilo Word) para el dropdown. */
  readonly sizeOptions: number[] = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72];

  /** Opciones de interlineado (multiplicador de la altura de línea). */
  readonly lineHeightOptions: number[] = [1, 1.15, 1.3, 1.5, 1.8, 2, 2.5, 3];
  /** Interlineado actual reflejado en el dropdown. */
  currentLineHeight: number | null = null;

  /** Aplica el interlineado al bloque que contiene la selección (afecta todo el párrafo,
      como en Word). Si el contenido no tiene bloques, aplica al contenedor del editor. */
  execLineHeight(e: Event) {
    const sel = e.target as HTMLSelectElement;
    const lh = parseFloat(sel.value);
    if (!lh) return;
    this.currentLineHeight = lh;
    const el = this.editorRef.nativeElement;
    el.focus();
    this.restoreSelection();

    const range = window.getSelection()?.rangeCount ? window.getSelection()!.getRangeAt(0) : null;
    // Buscar los bloques (p/div) tocados por la selección.
    const blocks = this.getSelectedBlocks(range);
    if (blocks.length > 0) {
      blocks.forEach((b) => (b.style.lineHeight = String(lh)));
    } else {
      // No hay bloques: envolver TODO el contenido del editor en un div con el line-height,
      // para que se persista en el HTML (el interlineado afecta todo el párrafo/contenido).
      const wrapper = document.createElement('div');
      wrapper.style.lineHeight = String(lh);
      while (el.firstChild) wrapper.appendChild(el.firstChild);
      el.appendChild(wrapper);
    }
    this.emitChange();
  }

  /** Devuelve los elementos de bloque (p, div) que intersecta la selección. */
  private getSelectedBlocks(range: Range | null): HTMLElement[] {
    const el = this.editorRef.nativeElement;
    if (!range) return [];
    const result = new Set<HTMLElement>();
    const walkUpToBlock = (node: Node | null): HTMLElement | null => {
      let n: Node | null = node;
      while (n && n !== el) {
        if (n.nodeType === Node.ELEMENT_NODE) {
          const tag = (n as HTMLElement).tagName;
          if (tag === 'P' || tag === 'DIV') return n as HTMLElement;
        }
        n = n.parentNode;
      }
      return null;
    };
    const start = walkUpToBlock(range.startContainer);
    const end = walkUpToBlock(range.endContainer);
    if (start) result.add(start);
    if (end) result.add(end);
    // Bloques intermedios
    el.querySelectorAll<HTMLElement>('p, div').forEach((b) => {
      if (range.intersectsNode(b)) result.add(b);
    });
    return [...result];
  }

  /** Guarda la seleccion antes de que el dropdown robe el foco. */
  saveSelectionBeforeInput() {
    this.saveSelection();
  }

  /** Handler del dropdown de tamaño: lee el valor y lo aplica, luego resetea el select. */
  execSizeSelect(e: Event) {
    const sel = e.target as HTMLSelectElement;
    const px = parseInt(sel.value, 10);
    sel.value = ''; // volver al placeholder "Tamaño"
    if (!px || px < 1) return;
    this.applySizePx(px);
  }

  /** Aplica un tamaño de fuente en PX a la selección, envolviéndola en un span
      con font-size exacto (mismo mecanismo robusto que la fuente). */
  private applySizePx(px: number) {
    this.currentSize = px;
    this.applyStyleToSelection('fontSize', px + 'px');
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

  /** Al interactuar con CUALQUIER control del color picker (área, barra de hue, swatches),
      evitamos que el contenteditable pierda el foco/selección haciendo preventDefault.
      Se exceptúan los inputs de texto (hex) para permitir escribir en ellos. */
  onColorRowMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const isTextInput = target.tagName === 'INPUT' &&
      (target as HTMLInputElement).type !== 'range' &&
      (target as HTMLInputElement).type !== 'checkbox' &&
      (target as HTMLInputElement).type !== 'button';
    if (!isTextInput) {
      e.preventDefault();
    }
    // Guardar la selección actual por si acaso (el preventDefault la conserva, pero
    // si el usuario entra a un input de texto la respaldamos igualmente).
    this.saveSelection();
  }

  /** Guarda el Range de seleccion actual si esta dentro del editor. */
  saveSelection() {
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

  /** Cuando el usuario elige un color en el picker personalizado, aplica el color a la
      selección usando el mismo mecanismo robusto (span inline) que fuente y tamaño,
      para que se refleje correctamente en el canvas/landing. */
  onColorPicked(color: string) {
    this.currentColor = color;
    this.applyStyleToSelection('color', color);
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

  /** Lista de familias de fuente de las opciones del dropdown (para mapear la detectada). */
  private readonly fontOptions = [
    'Lato, sans-serif', 'Montserrat, sans-serif', 'Raleway, sans-serif',
    'Josefin Sans, sans-serif', 'Playfair Display, serif', 'Cormorant Garamond, serif',
    'Cinzel, serif', 'Libre Baskerville, serif', 'Great Vibes, cursive',
    'Dancing Script, cursive', 'Sacramento, cursive', 'Tangerine, cursive',
    'Alex Brush, cursive', 'Pinyon Script, cursive', 'Aura, cursive', 'Allura, cursive',
  ];

  /** Al seleccionar/mover el cursor, refleja en los dropdowns la fuente y el tamaño
      del texto donde está el cursor (como hace Word al posicionarte sobre un texto). */
  syncFromSelection() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    let node: Node | null = sel.focusNode;
    if (!node) return;
    // Subir al elemento contenedor si el foco está en un nodo de texto.
    const elNode: HTMLElement | null =
      node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
    if (!elNode || !this.editorRef.nativeElement.contains(elNode)) return;

    const cs = window.getComputedStyle(elNode);

    // --- Tamaño: redondear al valor más cercano del dropdown ---
    const sizePx = parseFloat(cs.fontSize);
    if (!isNaN(sizePx)) {
      let closest = this.sizeOptions[0];
      let minDiff = Infinity;
      for (const s of this.sizeOptions) {
        const d = Math.abs(s - sizePx);
        if (d < minDiff) { minDiff = d; closest = s; }
      }
      // Solo refleja si coincide razonablemente (<=1px) con una opción, si no deja placeholder.
      this.currentSize = minDiff <= 1 ? closest : null;
    }

    // --- Fuente: comparar la primera familia detectada con las opciones ---
    const detected = (cs.fontFamily || '').split(',')[0].replace(/["']/g, '').trim().toLowerCase();
    const match = this.fontOptions.find(
      (opt) => opt.split(',')[0].trim().toLowerCase() === detected
    );
    this.currentFont = match || '';

    // --- Color actual ---
    if (cs.color) this.currentColor = this.rgbToHex(cs.color);

    // --- Interlineado actual (line-height / font-size = multiplicador) ---
    const lhPx = parseFloat(cs.lineHeight);
    const fsPx = parseFloat(cs.fontSize);
    if (!isNaN(lhPx) && !isNaN(fsPx) && fsPx > 0) {
      const ratio = lhPx / fsPx;
      let closestLh = this.lineHeightOptions[0];
      let minLhDiff = Infinity;
      for (const o of this.lineHeightOptions) {
        const d = Math.abs(o - ratio);
        if (d < minLhDiff) { minLhDiff = d; closestLh = o; }
      }
      this.currentLineHeight = minLhDiff <= 0.12 ? closestLh : null;
    }
  }

  /** Convierte un color rgb(a) computado a hex para la barra indicadora. */
  private rgbToHex(rgb: string): string {
    const m = rgb.match(/\d+/g);
    if (!m || m.length < 3) return this.currentColor;
    const [r, g, b] = m.map(Number);
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  private emitChange() {
    const html = this.editorRef.nativeElement.innerHTML;
    if (html !== this.innerValue) {
      this.innerValue = html;
      this.onChange(html);
    }
  }
}
