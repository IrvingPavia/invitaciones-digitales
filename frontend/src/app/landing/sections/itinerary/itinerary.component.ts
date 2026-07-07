import { Component, Input, AfterViewInit, OnDestroy, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItineraryConfig, ItineraryItem, GlobalTextStyles, SectionStyle } from '../../../core/models/models';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';

@Component({
  selector: 'app-landing-itinerary',
  standalone: true,
  imports: [CommonModule, HeadingOrnamentComponent],
  template: `
    <section id="itinerary" class="landing-section itinerary-section">
      <div class="section-container">
        @if (hasOrnament() && getOrnamentPosition() !== 'sides') {
          <div class="section-header-block">
            @if (getOrnamentPosition() === 'above' || getOrnamentPosition() === 'both') {
              <app-heading-ornament [type]="getOrnamentType()" [color]="getOrnamentColor()" [size]="getOrnamentSize()" />
            }
            <h2 class="section-heading"
                [style.font-family]="getFontFamily(styles?.sectionHeadingStyle?.fontFamily)"
                [style.font-size.px]="styles?.sectionHeadingStyle?.fontSize || 36"
                [style.color]="styles?.sectionHeadingStyle?.color || '#d4a017'"
            >{{ config.title || 'Itinerario' }}</h2>
            @if (getOrnamentPosition() === 'below' || getOrnamentPosition() === 'both') {
              <app-heading-ornament [type]="getOrnamentType()" [color]="getOrnamentColor()" [size]="getOrnamentSize()" />
            }
          </div>
        } @else {
          <div class="section-header">
            <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
            <h2 class="section-heading"
                [style.font-family]="getFontFamily(styles?.sectionHeadingStyle?.fontFamily)"
                [style.font-size.px]="styles?.sectionHeadingStyle?.fontSize || 36"
                [style.color]="styles?.sectionHeadingStyle?.color || '#d4a017'"
            >{{ config.title || 'Itinerario' }}</h2>
            <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
          </div>
        }

        <div class="timeline" [attr.data-align]="config.timelineAlign || 'center'" [attr.data-line]="config.lineStyle || 'solid'">
          @for (item of items; track item.id; let i = $index) {
            <div class="timeline-item" [class.right]="config.timelineAlign === 'center' && i % 2 !== 0" [style.transition-delay.ms]="i * 100">
              <div class="timeline-content reveal" [class.no-bg]="config.showCardBg === false" [style.border-radius.px]="config.cardBorderRadius ?? 12" [style.text-align]="config.textAlign || 'left'">
                <div class="timeline-body">
                  @if (formatTime(item.time)) {
                    <span class="timeline-time" [style.font-size.px]="config.timeFontSize || 12">{{ formatTime(item.time) }}</span>
                  }
                  <h4 class="timeline-title"
                      [style.font-family]="getFontFamily(styles?.subtitleStyle?.fontFamily)"
                      [style.font-size.px]="config.titleFontSize || styles?.subtitleStyle?.fontSize || 16"
                      [style.font-weight]="styles?.subtitleStyle?.fontWeight || 500"
                      [style.color]="styles?.subtitleStyle?.color || 'white'"
                  >{{ item.title }}</h4>
                  @if (item.description) {
                    <p class="timeline-desc"
                       [style.font-family]="getFontFamily(styles?.contentStyle?.fontFamily)"
                       [style.font-size.px]="config.descFontSize || styles?.contentStyle?.fontSize || 13"
                       [style.color]="styles?.contentStyle?.color || 'rgba(255,255,255,0.6)'"
                    >{{ item.description }}</p>
                  }
                </div>
              </div>
              <!-- Icon on the line -->
              @if (item.iconType !== 'none' && config.showIcons !== false) {
                <div class="timeline-dot timeline-dot-icon">
                  @if (item.iconType === 'custom' && item.iconUrl) {
                    <img [src]="item.iconUrl" style="width:100%;height:100%;object-fit:cover;border-radius:50%">
                  } @else if (item.iconType === 'emoji' && item.icon) {
                    <span class="emoji-icon">{{ item.icon }}</span>
                  } @else {
                    <span class="material-icons">{{ item.icon || 'event' }}</span>
                  }
                </div>
              } @else {
                <div class="timeline-dot">&#x2666;</div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .itinerary-section { padding: 80px 20px; }
    .section-container { max-width: 900px; margin: 0 auto; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 48px; }
    .section-header-block { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 48px; text-align: center; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); text-align: center; }

    .timeline { position: relative; padding: 0 20px; }
    .timeline::before {
      content: ''; position: absolute; left: 50%; top: 0; bottom: 0;
      width: 2px; background: linear-gradient(to bottom, transparent, var(--theme-card-border, rgba(212,160,23,0.5)), transparent);
      transform: translateX(-50%);
    }
    /* Line styles */
    .timeline[data-line="dashed"]::before { background: none; border-left: 2px dashed var(--theme-card-border, rgba(212,160,23,0.5)); }
    .timeline[data-line="dotted"]::before { background: none; border-left: 2px dotted var(--theme-card-border, rgba(212,160,23,0.5)); }
    .timeline[data-line="none"]::before { display: none; }
    /* Alignment */
    .timeline[data-align="left"]::before { left: 20px; }
    .timeline[data-align="right"]::before { left: auto; right: 20px; }
    .timeline-item {
      display: flex; justify-content: flex-end;
      padding-right: calc(50% + 30px); margin-bottom: 32px; position: relative;
      opacity: 0; transform: translateY(30px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .timeline-item.visible { opacity: 1; transform: translateY(0); }
    .timeline-item.right { justify-content: flex-start; padding-right: 0; padding-left: calc(50% + 30px); }
    /* Left aligned */
    .timeline[data-align="left"] .timeline-item { padding-right: 0; padding-left: 50px; justify-content: flex-start; }
    .timeline[data-align="left"] .timeline-item.right { padding-left: 50px; }
    .timeline[data-align="left"] .timeline-dot { left: 20px; }
    /* Right aligned */
    .timeline[data-align="right"] .timeline-item { padding-left: 0; padding-right: 50px; justify-content: flex-end; }
    .timeline[data-align="right"] .timeline-item.right { padding-right: 50px; justify-content: flex-end; }
    .timeline[data-align="right"] .timeline-dot { left: auto; right: 20px; transform: translateX(50%); }
    .timeline-dot {
      position: absolute; left: 50%; top: 12px;
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; color: var(--theme-text-primary, var(--gold));
      transform: translateX(-50%);
      background: var(--bg-solid, #0d1117);
      border: 2px solid var(--theme-card-border, rgba(212,160,23,0.5));
      opacity: 0;
      animation: none;
      z-index: 2;
    }
    .timeline-dot-icon { width: 40px; height: 40px; }
    .timeline-dot-icon .emoji-icon { font-size: 18px; }
    .timeline-dot-icon .material-icons { font-size: 18px; }
    .timeline-dot-icon img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .timeline-item.visible .timeline-dot {
      animation: diamondAppear 0.6s ease forwards;
    }
    .timeline-content {
      display: flex; gap: 12px; align-items: flex-start;
      background: var(--theme-card-bg, rgba(0,0,0,0.45)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.2));
      padding: 14px 16px; border-radius: 12px; width: fit-content; max-width: 100%;
      word-break: break-word;
      &.no-bg { background: transparent; border-color: transparent; }
    }
    .timeline-body { flex: 1; min-width: 0; }
    .timeline-time { font-size: 12px; color: var(--theme-text-primary, var(--gold)); font-weight: 600; letter-spacing: 0.5px; }
    .timeline-title { font-family: var(--font-serif); font-size: 16px; color: white; margin: 4px 0; }
    .timeline-desc { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; }
    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes diamondAppear {
      0% { opacity: 0; transform: translateX(-50%) scale(0); }
      60% { opacity: 1; transform: translateX(-50%) scale(1.3); text-shadow: 0 0 16px currentColor; }
      100% { opacity: 1; transform: translateX(-50%) scale(1); text-shadow: 0 0 8px currentColor; }
    }

    @media (max-width: 640px) {
      .timeline::before { left: 20px; }
      .timeline-item, .timeline-item.right { padding: 0 0 0 52px; justify-content: flex-start; }
      .timeline-dot { left: 20px; }
    }
  `]
})
export class LandingItineraryComponent implements AfterViewInit, OnDestroy {
  @Input() config!: ItineraryConfig;
  @Input() items: ItineraryItem[] = [];
  @Input() styles?: GlobalTextStyles;
  @Input() sectionStyle?: SectionStyle;
  private el = inject(ElementRef);
  private observer!: IntersectionObserver;

  hasOrnament(): boolean {
    return !!this.sectionStyle?.headingOrnament && this.sectionStyle.headingOrnament.type !== 'none';
  }
  getOrnamentType(): string { return this.sectionStyle?.headingOrnament?.type || 'none'; }
  getOrnamentPosition(): string { return this.sectionStyle?.headingOrnament?.position || 'below'; }
  getOrnamentColor(): string { return this.sectionStyle?.headingOrnament?.color || this.styles?.separatorStyle?.color || '#d4a017'; }
  getOrnamentSize(): number { return this.sectionStyle?.headingOrnament?.size || 1; }

  ngAfterViewInit() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });
    const items = this.el.nativeElement.querySelectorAll('.timeline-item');
    items.forEach((item: Element) => this.observer.observe(item));
  }

  ngOnDestroy() { this.observer?.disconnect(); }

  formatTime(time: string): string {
    if (!time || time.includes('AM') || time.includes('PM')) return time;
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr) || 0;
    const m = parseInt(mStr) || 0;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  getFontFamily(key?: string): string {
    const map: Record<string, string> = {
      'sans': 'var(--font-sans)', 'serif': 'var(--font-serif)', 'script': 'var(--font-script)',
      'cormorant': 'var(--font-cormorant)', 'spumoni': 'var(--font-spumoni)', 'dancing': 'var(--font-dancing)',
      'montserrat': 'var(--font-montserrat)', 'raleway': 'var(--font-raleway)', 'cinzel': 'var(--font-cinzel)',
      'sacramento': 'var(--font-sacramento)', 'tangerine': 'var(--font-tangerine)', 'alexbrush': 'var(--font-alexbrush)',
      'pinyon': 'var(--font-pinyon)', 'josefin': 'var(--font-josefin)', 'baskerville': 'var(--font-baskerville)'
    };
    return map[key || 'sans'] || 'var(--font-sans)';
  }

  getSeparatorBg(): string {
    const c = this.styles?.separatorStyle?.color || '#d4a017';
    const t = this.styles?.separatorStyle?.type || 'elegant';
    switch (t) {
      case 'formal': return c;
      case 'executive': return `linear-gradient(180deg, ${c}, transparent 40%, transparent 60%, ${c})`;
      case 'festive': return `repeating-linear-gradient(90deg, ${c} 0px, ${c} 4px, transparent 4px, transparent 10px)`;
      case 'animated': return `linear-gradient(90deg, transparent, ${c}, transparent)`;
      case 'minimal': return `${c}40`;
      case 'ornamental': return `linear-gradient(90deg, transparent, ${c}60, ${c}, ${c}60, transparent)`;
      default: return `linear-gradient(90deg, transparent, ${c}80, transparent)`;
    }
  }

  getSeparatorHeight(): string {
    const t = this.styles?.separatorStyle?.type || 'elegant';
    switch (t) { case 'executive': return '4px'; case 'festive': return '3px'; case 'ornamental': return '2px'; default: return '1px'; }
  }
}
