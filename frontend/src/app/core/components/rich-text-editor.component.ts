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

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RichTextEditorComponent),
    multi: true,
  }],
  template: `
    <div class="rte-wrapper">
      <div class="rte-toolbar">
        <button type="button" (mousedown)="exec($event, 'bold')" title="Negrita"><b>B</b></button>
        <button type="button" (mousedown)="exec($event, 'italic')" title="Cursiva"><i>I</i></button>
        <button type="button" (mousedown)="exec($event, 'underline')" title="Subrayado"><u>U</u></button>
        <span class="rte-sep"></span>
        <button type="button" (mousedown)="exec($event, 'justifyLeft')" title="Izquierda"><span class="material-icons">format_align_left</span></button>
        <button type="button" (mousedown)="exec($event, 'justifyCenter')" title="Centro"><span class="material-icons">format_align_center</span></button>
        <button type="button" (mousedown)="exec($event, 'justifyRight')" title="Derecha"><span class="material-icons">format_align_right</span></button>
        <span class="rte-sep"></span>
        <select (change)="execFont($event)" title="Fuente">
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
        </select>
        <select (change)="execSize($event)" title="Tamaño">
          <option value="">Tamaño</option>
          <option value="1">Pequeño</option>
          <option value="3">Normal</option>
          <option value="5">Grande</option>
          <option value="7">Muy grande</option>
        </select>
        <span class="rte-sep"></span>
        <label class="rte-color-btn" title="Color de texto">
          <span class="material-icons">format_color_text</span>
          <input type="color" (input)="execColor($event)" value="#ffffff">
        </label>
      </div>
      <div #editor class="rte-content" contenteditable="true"
           (input)="onInput()" (blur)="onBlur()" [style]="contentStyles">
      </div>
    </div>
  `,
  styles: [`
    .rte-wrapper {
      border: 1px solid rgba(212,160,23,0.3);
      border-radius: 8px;
      overflow: hidden;
    }
    .rte-toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 8px;
      background: #1a1a2e;
      border-bottom: 1px solid rgba(212,160,23,0.2);
      flex-wrap: wrap;
    }
    .rte-toolbar button {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 4px;
      color: rgba(255,255,255,0.8);
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 13px;
      transition: all 0.2s;
    }
    .rte-toolbar button:hover {
      background: rgba(212,160,23,0.2);
      border-color: rgba(212,160,23,0.5);
    }
    .rte-toolbar button .material-icons { font-size: 16px; }
    .rte-toolbar select {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 4px;
      color: rgba(255,255,255,0.8);
      padding: 4px 6px;
      font-size: 11px;
      cursor: pointer;
      max-width: 110px;
    }
    .rte-toolbar select option { background: #1a1a2e; color: white; }
    .rte-sep {
      width: 1px; height: 20px;
      background: rgba(255,255,255,0.1);
      margin: 0 4px;
    }
    .rte-color-btn {
      position: relative;
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .rte-color-btn:hover {
      background: rgba(212,160,23,0.2);
      border-color: rgba(212,160,23,0.5);
    }
    .rte-color-btn .material-icons { font-size: 16px; color: rgba(255,255,255,0.8); }
    .rte-color-btn input {
      position: absolute; inset: 0;
      opacity: 0; cursor: pointer;
      width: 100%; height: 100%;
    }
    .rte-content {
      min-height: 120px;
      padding: 12px 16px;
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
  `]
})
export class RichTextEditorComponent implements AfterViewInit, OnChanges, ControlValueAccessor {
  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;
  @Input() placeholder = 'Escribe el contenido...';
  @Input() contentStyles: Record<string, string> = {};

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

  execColor(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    document.execCommand('foreColor', false, val);
    this.emitChange();
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
