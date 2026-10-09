import { Component, Input, Output, EventEmitter, OnInit, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wheel-date-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wheel-date-row">
      <div class="wheel-col" (wheel)="onWheel($event,'day')" (touchstart)="onTouchStart($event,'day')" (touchmove)="onTouchMove($event,'day')" (touchend)="onTouchEnd()">
        <button class="wheel-arrow" (click)="changeDay(1)"><span class="material-icons">expand_less</span></button>
        <input class="wheel-value" [value]="day()" (focus)="onFocus($event)" (keydown)="onDayKey($event)" (blur)="onDayBlur($event)" inputmode="numeric">
        <button class="wheel-arrow" (click)="changeDay(-1)"><span class="material-icons">expand_more</span></button>
        <span class="wheel-label">DIA</span>
      </div>
      <div class="wheel-col month-col" (wheel)="onWheel($event,'month')" (touchstart)="onTouchStart($event,'month')" (touchmove)="onTouchMove($event,'month')" (touchend)="onTouchEnd()">
        <button class="wheel-arrow" (click)="changeMonth(1)"><span class="material-icons">expand_less</span></button>
        <span class="wheel-value month-name">{{ monthName() }}</span>
        <button class="wheel-arrow" (click)="changeMonth(-1)"><span class="material-icons">expand_more</span></button>
        <span class="wheel-label">MES</span>
      </div>
      <div class="wheel-col" (wheel)="onWheel($event,'year')" (touchstart)="onTouchStart($event,'year')" (touchmove)="onTouchMove($event,'year')" (touchend)="onTouchEnd()">
        <button class="wheel-arrow" (click)="changeYear(1)"><span class="material-icons">expand_less</span></button>
        <input class="wheel-value" [value]="year()" (focus)="onFocus($event)" (keydown)="onYearKey($event)" (blur)="onYearBlur($event)" inputmode="numeric">
        <button class="wheel-arrow" (click)="changeYear(-1)"><span class="material-icons">expand_more</span></button>
        <span class="wheel-label">AÑO</span>
      </div>
    </div>
  `,
  styles: [`
    .wheel-date-row { display: flex; align-items: stretch; gap: 6px; }
    .wheel-col {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; padding: 6px 12px; min-width: 56px;
      touch-action: none; user-select: none; flex: 1;
    }
    .month-col { min-width: 100px; flex: 2; }
    .wheel-arrow {
      background: none; border: none; cursor: pointer; color: var(--gold, #8b5cf6);
      padding: 0; display: flex; align-items: center; line-height: 1;
      .material-icons { font-size: 18px; }
      &:hover { color: var(--gold-light, #a78bfa); }
    }
    .wheel-value {
      font-size: 20px; font-weight: 700; color: white; text-align: center;
      width: 100%; background: transparent; border: none; outline: none;
      font-family: inherit; padding: 2px 0;
      &:focus { color: var(--gold, #8b5cf6); }
    }
    .month-name {
      font-size: 13px; font-weight: 600; white-space: nowrap;
      cursor: default; padding: 4px 0;
    }
    .wheel-label { font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin-top: 2px; }
    :host-context(body.light-mode) .wheel-col { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.12); }
    :host-context(body.light-mode) .wheel-value { color: #333; }
    :host-context(body.light-mode) .wheel-label { color: rgba(0,0,0,0.4); }
  `]
})
export class WheelDatePickerComponent implements OnInit, OnChanges {
  @Input() value = '';  // format: YYYY-MM-DD
  @Output() valueChange = new EventEmitter<string>();

  day = signal(1);
  month = signal(1);
  year = signal(2026);

  private months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  private touchStartY = 0;
  private touchField: 'day' | 'month' | 'year' | null = null;
  private touchAccum = 0;

  monthName = () => this.months[this.month() - 1] || 'Enero';

  ngOnInit() { this.parseValue(); }
  ngOnChanges() { this.parseValue(); }

  private parseValue() {
    if (!this.value) { this.day.set(1); this.month.set(1); this.year.set(new Date().getFullYear()); return; }
    const parts = this.value.split('-');
    if (parts.length === 3) {
      this.year.set(parseInt(parts[0]) || 2026);
      this.month.set(parseInt(parts[1]) || 1);
      this.day.set(parseInt(parts[2]) || 1);
    }
  }

  changeDay(delta: number) {
    const maxDay = this.daysInMonth();
    let d = this.day() + delta;
    if (d > maxDay) d = 1;
    if (d < 1) d = maxDay;
    this.day.set(d);
    this.emit();
  }

  changeMonth(delta: number) {
    let m = this.month() + delta;
    if (m > 12) m = 1;
    if (m < 1) m = 12;
    this.month.set(m);
    // Clamp day
    const maxDay = this.daysInMonth();
    if (this.day() > maxDay) this.day.set(maxDay);
    this.emit();
  }

  changeYear(delta: number) {
    this.year.set(this.year() + delta);
    const maxDay = this.daysInMonth();
    if (this.day() > maxDay) this.day.set(maxDay);
    this.emit();
  }

  private daysInMonth(): number {
    return new Date(this.year(), this.month(), 0).getDate();
  }

  // Wheel scroll
  onWheel(e: WheelEvent, field: 'day' | 'month' | 'year') {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    if (field === 'day') this.changeDay(delta);
    else if (field === 'month') this.changeMonth(delta);
    else this.changeYear(delta);
  }

  // Touch swipe
  onTouchStart(e: TouchEvent, field: 'day' | 'month' | 'year') {
    this.touchStartY = e.touches[0].clientY;
    this.touchField = field;
    this.touchAccum = 0;
  }

  onTouchMove(e: TouchEvent, field: 'day' | 'month' | 'year') {
    if (this.touchField !== field) return;
    e.preventDefault();
    const diff = this.touchStartY - e.touches[0].clientY;
    this.touchAccum += diff;
    this.touchStartY = e.touches[0].clientY;
    const threshold = 25;
    while (this.touchAccum > threshold) { this.touchAccum -= threshold; if (field === 'day') this.changeDay(1); else if (field === 'month') this.changeMonth(1); else this.changeYear(1); }
    while (this.touchAccum < -threshold) { this.touchAccum += threshold; if (field === 'day') this.changeDay(-1); else if (field === 'month') this.changeMonth(-1); else this.changeYear(-1); }
  }

  onTouchEnd() { this.touchField = null; }

  // Keyboard
  onFocus(e: Event) { (e.target as HTMLInputElement).select(); }

  onDayKey(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') { e.preventDefault(); this.changeDay(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); this.changeDay(-1); }
    else if (e.key === 'Enter' || e.key === 'Tab') { (e.target as HTMLInputElement).blur(); }
    else if (!/[0-9]/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); }
  }

  onDayBlur(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value) || 1;
    const max = this.daysInMonth();
    this.day.set(Math.max(1, Math.min(max, val)));
    this.emit();
  }

  onYearKey(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') { e.preventDefault(); this.changeYear(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); this.changeYear(-1); }
    else if (e.key === 'Enter' || e.key === 'Tab') { (e.target as HTMLInputElement).blur(); }
    else if (!/[0-9]/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); }
  }

  onYearBlur(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value) || new Date().getFullYear();
    this.year.set(Math.max(2020, Math.min(2100, val)));
    this.emit();
  }

  private emit() {
    const y = this.year();
    const m = this.month().toString().padStart(2, '0');
    const d = this.day().toString().padStart(2, '0');
    this.valueChange.emit(`${y}-${m}-${d}`);
  }
}
