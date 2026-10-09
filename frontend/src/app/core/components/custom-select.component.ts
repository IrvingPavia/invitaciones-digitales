import { Component, Input, Output, EventEmitter, signal, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="custom-select" [class.open]="isOpen()" [class.compact]="compact">
      <div class="select-trigger" (click)="toggle($event)">
        <span class="select-value">{{ getSelectedLabel() }}</span>
        <span class="material-icons select-arrow">expand_more</span>
      </div>
      @if (isOpen()) {
        <div class="select-dropdown">
          @for (opt of options; track opt.value) {
            <div class="select-option" [class.selected]="opt.value === value" (click)="select(opt, $event)">
              @if (opt.icon) {
                <span class="opt-icon">{{ opt.icon }}</span>
              }
              <span>{{ opt.label }}</span>
              @if (opt.value === value) {
                <span class="material-icons opt-check">check</span>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-select {
      position: relative; width: 100%;
    }
    .select-trigger {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; border-radius: 6px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(139,92,246,0.15);
      cursor: pointer; transition: border-color 0.2s, background 0.2s;
      min-height: 34px;
    }
    .select-trigger:hover { border-color: rgba(139,92,246,0.35); background: rgba(255,255,255,0.08); }
    .custom-select.open .select-trigger { border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.08); }
    .select-value { font-size: 12px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
    .select-arrow { font-size: 18px; color: rgba(139,92,246,0.7); transition: transform 0.2s; flex-shrink: 0; }
    .custom-select.open .select-arrow { transform: rotate(180deg); }
    .select-dropdown {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0;
      background: rgba(16,16,32,0.98); border: 1px solid rgba(139,92,246,0.25);
      border-radius: 8px; padding: 4px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 12px rgba(139,92,246,0.1);
      z-index: 100; max-height: 200px; overflow-y: auto;
      backdrop-filter: blur(12px);
      animation: dropIn 0.15s ease;
    }
    @keyframes dropIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .select-option {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; border-radius: 6px;
      font-size: 12px; color: rgba(255,255,255,0.7);
      cursor: pointer; transition: all 0.15s;
      border: 1px solid transparent; margin: 2px 0;
    }
    .select-option:hover { background: rgba(124,92,191,0.1); border-color: rgba(124,92,191,0.4); color: #fff; }
    .select-option.selected { background: rgba(124,92,191,0.12); border-color: rgba(124,92,191,0.5); color: #c084fc; font-weight: 500; }
    .opt-icon { font-size: 14px; flex-shrink: 0; }
    .opt-check { font-size: 14px; color: #8b5cf6; margin-left: auto; }
    .select-dropdown::-webkit-scrollbar { width: 4px; }
    .select-dropdown::-webkit-scrollbar-track { background: transparent; }
    .select-dropdown::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }

    /* Compact variant for toolbar use */
    .compact .select-trigger { padding: 6px 10px; min-height: 30px; background: rgba(20,20,40,0.9); border-color: rgba(139,92,246,0.3); }
    .compact .select-value { font-size: 13px; }

    /* Light mode support via host-context */
    :host-context(body.light-mode) .select-trigger { background: #ffffff; border-color: rgba(124,92,191,0.25); }
    :host-context(body.light-mode) .select-trigger:hover { border-color: rgba(124,92,191,0.4); background: #faf8ff; }
    :host-context(body.light-mode) .custom-select.open .select-trigger { border-color: rgba(124,92,191,0.5); background: #f5f0ff; }
    :host-context(body.light-mode) .select-value { color: #5a3d8a; }
    :host-context(body.light-mode) .select-arrow { color: #7c5cbf; }
    :host-context(body.light-mode) .select-dropdown { background: #fff; border-color: rgba(124,92,191,0.2); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    :host-context(body.light-mode) .select-option { color: #5a3d8a; border-color: transparent; }
    :host-context(body.light-mode) .select-option:hover { background: rgba(124,92,191,0.08); border-color: rgba(124,92,191,0.3); color: #4a2d7a; }
    :host-context(body.light-mode) .select-option.selected { background: rgba(124,92,191,0.1); border-color: rgba(124,92,191,0.4); color: #7c5cbf; }
    :host-context(body.light-mode) .opt-check { color: #7c5cbf; }
    :host-context(body.light-mode) .compact .select-trigger { background: #fff; border-color: rgba(124,92,191,0.3); }
  `]
})
export class CustomSelectComponent {
  @Input() options: SelectOption[] = [];
  @Input() value = '';
  @Input() placeholder = 'Seleccionar...';
  @Input() compact = false;
  @Output() valueChange = new EventEmitter<string>();

  isOpen = signal(false);
  private el = inject(ElementRef);

  getSelectedLabel(): string {
    const opt = this.options.find(o => o.value === this.value);
    return opt ? opt.label : this.placeholder;
  }

  toggle(e: Event) {
    e.stopPropagation();
    this.isOpen.update(v => !v);
  }

  select(opt: SelectOption, e: Event) {
    e.stopPropagation();
    this.value = opt.value;
    this.valueChange.emit(opt.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen.set(false);
    }
  }
}
