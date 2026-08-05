import { Component, Input, Output, EventEmitter, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wheel-time-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wheel-picker">
      <div class="wheel-col">
        <button class="wheel-arrow" (click)="changeHour(1);$event.stopPropagation()"><span class="material-icons">expand_less</span></button>
        <input #hourInput class="wheel-value" [value]="displayHour()" (focus)="onFocus($event)" (blur)="onHourBlur($event)" (keydown)="onHourKey($event)" (wheel)="onHourWheel($event)" (touchstart)="onTouchStart($event,'hour')" (touchmove)="onTouchMove($event,'hour')" (touchend)="onTouchEnd()" inputmode="numeric" maxlength="2">
        <button class="wheel-arrow" (click)="changeHour(-1);$event.stopPropagation()"><span class="material-icons">expand_more</span></button>
        <span class="wheel-label">HR</span>
      </div>
      <span class="wheel-sep">:</span>
      <div class="wheel-col">
        <button class="wheel-arrow" (click)="changeMinute(1);$event.stopPropagation()"><span class="material-icons">expand_less</span></button>
        <input #minInput class="wheel-value" [value]="displayMinute()" (focus)="onFocus($event)" (blur)="onMinuteBlur($event)" (keydown)="onMinuteKey($event)" (wheel)="onMinuteWheel($event)" (touchstart)="onTouchStart($event,'minute')" (touchmove)="onTouchMove($event,'minute')" (touchend)="onTouchEnd()" inputmode="numeric" maxlength="2">
        <button class="wheel-arrow" (click)="changeMinute(-1);$event.stopPropagation()"><span class="material-icons">expand_more</span></button>
        <span class="wheel-label">MIN</span>
      </div>
      <div class="wheel-col ampm-col">
        <button class="wheel-ampm" [class.active]="ampm() === 'AM'" (click)="setAmPm('AM');$event.stopPropagation()">AM</button>
        <button class="wheel-ampm" [class.active]="ampm() === 'PM'" (click)="setAmPm('PM');$event.stopPropagation()">PM</button>
      </div>
    </div>
  `,
  styles: [`
    .wheel-picker { display: flex; align-items: center; gap: 4px; }
    .wheel-col { display: flex; flex-direction: column; align-items: center; gap: 0; }
    .wheel-arrow { background: none; border: none; color: rgba(139,92,246,0.6); cursor: pointer; padding: 0; line-height: 1; transition: color 0.15s; .material-icons { font-size: 20px; } }
    .wheel-arrow:hover { color: rgba(139,92,246,1); }
    .wheel-value {
      font-size: 20px; font-weight: 700; color: white; width: 40px; text-align: center;
      padding: 4px 6px; background: rgba(255,255,255,0.05); border-radius: 6px;
      border: 1px solid rgba(139,92,246,0.2); outline: none; cursor: ns-resize;
      transition: border-color 0.2s;
      -moz-appearance: textfield;
      &::-webkit-inner-spin-button, &::-webkit-outer-spin-button { -webkit-appearance: none; }
      &:focus { border-color: rgba(139,92,246,0.6); cursor: text; }
    }
    .wheel-sep { font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.4); padding: 0 2px; margin-top: -16px; }
    .wheel-label { font-size: 8px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .ampm-col { gap: 2px; margin-left: 6px; }
    .wheel-ampm { padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(139,92,246,0.2); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5); font-size: 10px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .wheel-ampm.active { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.5); color: #c084fc; }
    .wheel-ampm:hover { border-color: rgba(139,92,246,0.4); }

    :host-context(body.light-mode) .wheel-value { background: #faf8ff; border-color: rgba(124,92,191,0.25); color: #333; }
    :host-context(body.light-mode) .wheel-value:focus { border-color: rgba(124,92,191,0.5); }
    :host-context(body.light-mode) .wheel-arrow { color: rgba(124,92,191,0.5); }
    :host-context(body.light-mode) .wheel-arrow:hover { color: #7c5cbf; }
    :host-context(body.light-mode) .wheel-sep { color: rgba(0,0,0,0.3); }
    :host-context(body.light-mode) .wheel-ampm { background: #faf8ff; border-color: rgba(124,92,191,0.2); color: #666; }
    :host-context(body.light-mode) .wheel-ampm.active { background: rgba(124,92,191,0.1); border-color: rgba(124,92,191,0.4); color: #7c5cbf; }
  `]
})
export class WheelTimePickerComponent {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  hour = signal(12);
  minute = signal(0);
  ampm = signal<'AM' | 'PM'>('PM');

  private touchStartY = 0;
  private touchField: 'hour' | 'minute' | null = null;
  private touchAccum = 0;

  ngOnInit() { this.parseValue(); }
  ngOnChanges() { this.parseValue(); }

  private parseValue() {
    if (!this.value) { this.hour.set(12); this.minute.set(0); this.ampm.set('PM'); return; }
    const match = this.value.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1]) || 12;
      const m = parseInt(match[2]) || 0;
      const ap = match[3]?.toUpperCase() as 'AM' | 'PM';
      if (ap) {
        this.ampm.set(ap);
        this.hour.set(h > 12 ? h - 12 : h === 0 ? 12 : h);
      } else {
        this.ampm.set(h >= 12 ? 'PM' : 'AM');
        this.hour.set(h > 12 ? h - 12 : h === 0 ? 12 : h);
      }
      this.minute.set(m);
    } else {
      this.hour.set(12); this.minute.set(0); this.ampm.set('PM');
    }
  }

  displayHour(): string { return this.hour().toString(); }
  displayMinute(): string { return this.minute().toString().padStart(2, '0'); }

  changeHour(delta: number) {
    let h = this.hour() + delta;
    if (h > 12) h = 1;
    if (h < 1) h = 12;
    this.hour.set(h);
    this.emit();
  }

  changeMinute(delta: number) {
    let m = this.minute() + delta;
    if (m >= 60) m = 0;
    if (m < 0) m = 59;
    this.minute.set(m);
    this.emit();
  }

  setAmPm(v: 'AM' | 'PM') {
    this.ampm.set(v);
    this.emit();
  }

  // --- Keyboard input ---
  onFocus(e: Event) {
    (e.target as HTMLInputElement).select();
  }

  onHourKey(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') { e.preventDefault(); this.changeHour(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); this.changeHour(-1); }
    else if (e.key === 'Enter' || e.key === 'Tab') { (e.target as HTMLInputElement).blur(); }
    else if (!/[0-9]/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); }
  }

  onMinuteKey(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') { e.preventDefault(); this.changeMinute(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); this.changeMinute(-1); }
    else if (e.key === 'Enter' || e.key === 'Tab') { (e.target as HTMLInputElement).blur(); }
    else if (!/[0-9]/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); }
  }

  onHourBlur(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value);
    if (!isNaN(val) && val >= 1 && val <= 12) {
      this.hour.set(val);
      this.emit();
    }
    (e.target as HTMLInputElement).value = this.displayHour();
  }

  onMinuteBlur(e: Event) {
    let val = parseInt((e.target as HTMLInputElement).value);
    if (!isNaN(val) && val >= 0 && val <= 59) {
      this.minute.set(val);
      this.emit();
    }
    (e.target as HTMLInputElement).value = this.displayMinute();
  }

  // --- Mouse wheel ---
  onHourWheel(e: WheelEvent) {
    e.preventDefault();
    this.changeHour(e.deltaY < 0 ? 1 : -1);
  }

  onMinuteWheel(e: WheelEvent) {
    e.preventDefault();
    this.changeMinute(e.deltaY < 0 ? 1 : -1);
  }

  // --- Touch swipe (mobile) ---
  onTouchStart(e: TouchEvent, field: 'hour' | 'minute') {
    this.touchStartY = e.touches[0].clientY;
    this.touchField = field;
    this.touchAccum = 0;
  }

  onTouchMove(e: TouchEvent, field: 'hour' | 'minute') {
    if (this.touchField !== field) return;
    e.preventDefault();
    const deltaY = this.touchStartY - e.touches[0].clientY;
    const threshold = 20; // pixels per step
    const steps = Math.floor((deltaY - this.touchAccum) / threshold);
    if (steps !== 0) {
      this.touchAccum += steps * threshold;
      if (field === 'hour') this.changeHour(steps);
      else this.changeMinute(steps);
    }
  }

  onTouchEnd() {
    this.touchField = null;
    this.touchAccum = 0;
  }

  private emit() {
    const h = this.hour() || 12;
    const m = this.minute() || 0;
    const timeStr = `${h}:${m.toString().padStart(2, '0')} ${this.ampm()}`;
    this.valueChange.emit(timeStr);
  }
}
