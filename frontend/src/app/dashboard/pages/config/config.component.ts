import {
  Component,
  inject,
  OnInit,
  AfterViewChecked,
  signal,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { QuillModule } from 'ngx-quill';
import { ApiService } from "../../../core/services/api.service";
import { ColorPickerComponent } from "../../../core/components/color-picker.component";
import {
  EventConfig,
  ItineraryItem,
  DetailCard,
  DetailTextStyle,
  GlobalTextStyles,
  ThemeConfig,
} from "../../../core/models/models";

const FONT_OPTIONS = `
<option value="sans">Lato (Sans)</option>
<option value="montserrat">Montserrat</option>
<option value="raleway">Raleway</option>
<option value="josefin">Josefin Sans</option>
<option value="serif">Playfair Display</option>
<option value="cormorant">Cormorant Garamond</option>
<option value="cinzel">Cinzel</option>
<option value="baskerville">Libre Baskerville</option>
<option value="script">Great Vibes</option>
<option value="spumoni">Spumoni</option>
<option value="dancing">Dancing Script</option>
<option value="sacramento">Sacramento</option>
<option value="tangerine">Tangerine</option>
<option value="alexbrush">Alex Brush</option>
<option value="pinyon">Pinyon Script</option>`;

@Component({
  selector: "app-config",
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, RouterLink, ColorPickerComponent, QuillModule],
  styles: [
    `
      .venue-card {
        border: 1px solid rgba(212, 160, 23, 0.2);
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 16px;
        background: rgba(255, 255, 255, 0.02);
      }
      .venue-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .venue-icon-preview {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        background: rgba(212, 160, 23, 0.1);
        border: 1px solid rgba(212, 160, 23, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
      }
      .time-ampm {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-left: 4px;
        button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          padding: 4px 10px;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
          &.active {
            background: var(--gold);
            border-color: var(--gold);
            color: #1a1a2e;
          }
          &:hover:not(.active) {
            border-color: var(--gold);
            color: var(--gold);
          }
        }
      }
      .countdown-picker {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(212, 160, 23, 0.2);
        border-radius: 10px;
        padding: 20px;
      }
      .countdown-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 16px;
      }
      @media (max-width: 500px) {
        .countdown-grid {
          grid-template-columns: 1fr;
        }
      }
      .picker-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .picker-label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }
      .picker-input {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        padding: 10px 14px;
        color: white;
        font-size: 14px;
        width: 100%;
        &:focus {
          outline: none;
          border-color: var(--gold);
        }
      }
      .time-inputs {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .time-field {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        padding: 8px 14px;
        min-width: 60px;
        button {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--gold);
          padding: 0;
          display: flex;
          align-items: center;
          line-height: 1;
          .material-icons {
            font-size: 18px;
          }
          &:hover {
            color: var(--gold-light);
          }
        }
        small {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.3);
          letter-spacing: 1px;
        }
      }
      .time-val {
        font-size: 24px;
        font-weight: 700;
        color: white;
        font-family: var(--font-serif);
        line-height: 1.2;
        min-width: 32px;
        text-align: center;
      }
      .time-sep {
        font-size: 24px;
        font-weight: 700;
        color: var(--gold);
      }
      .picker-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
        background: rgba(212, 160, 23, 0.08);
        border: 1px solid rgba(212, 160, 23, 0.2);
        border-radius: 8px;
        padding: 10px 16px;
      }
      .config-header {
        margin-bottom: 16px;
        h2 {
          font-family: var(--font-serif);
          font-size: 24px;
          color: var(--gold);
        }
      }
      .config-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .tabs-wrapper {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 24px;
      }
      .tabs-arrow {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--gold);
        transition: all 0.2s;
        user-select: none;
        .material-icons {
          font-size: 20px;
        }
        &:hover {
          background: rgba(212, 160, 23, 0.15);
          border-color: var(--gold);
        }
      }
      .tabs-wrapper .tabs {
        margin-bottom: 0;
        flex: 1;
        min-width: 0;
      }
      .itinerary-card {
        border: 1px solid rgba(212, 160, 23, 0.15);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        transition: border-color 0.3s;
      }
      .itinerary-card.saved {
        border-color: rgba(92, 184, 92, 0.4);
      }
      .itinerary-icon-preview {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(212, 160, 23, 0.1);
        border: 1px solid rgba(212, 160, 23, 0.3);
        overflow: hidden;
      }
      .emoji-preview {
        font-size: 22px;
      }
      .emoji-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
      .emoji-btn {
        width: 38px;
        height: 38px;
        border-radius: 8px;
        font-size: 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          background: rgba(212, 160, 23, 0.15);
          border-color: var(--gold);
        }
        &.active {
          background: rgba(212, 160, 23, 0.2);
          border-color: var(--gold);
          box-shadow: 0 0 8px rgba(212, 160, 23, 0.3);
        }
      }
      .style-block {
        border: 1px solid rgba(212, 160, 23, 0.15);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
      }
      .style-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
        display: block;
        margin-bottom: 12px;
        font-weight: 600;
      }
      .style-desc {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
        margin-bottom: 12px;
      }
      .section-card {
        border: 1px solid rgba(212, 160, 23, 0.15);
        border-radius: 12px;
        margin-bottom: 20px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.02);
      }
      .section-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        background: rgba(212, 160, 23, 0.05);
        border-bottom: 1px solid rgba(212, 160, 23, 0.1);
        span {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }
      }
      .section-card-body {
        padding: 20px;
      }
      .preview-card {
        background: rgba(0, 0, 0, 0.2);
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
      }
      .field-sm {
        max-width: 100px;
        flex: 0 0 100px;
      }
      .field-xs {
        max-width: 200px;
        flex: 0 0 auto;
      }
      .field-row {
        display: flex;
        gap: 12px;
        align-items: flex-end;
      }
      .slider-field {
        max-width: 200px;
      }
      .toggle-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.5);
        user-select: none;
      }
      .toggle-pill-dot {
        width: 36px;
        height: 20px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.15);
        position: relative;
        transition: all 0.3s;
        &::after {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          top: 2px;
          left: 2px;
          transition: all 0.3s;
        }
        &.active {
          background: var(--gold);
          &::after {
            left: 18px;
            background: white;
          }
        }
      }
      .upload-preview {
        max-width: 200px;
        margin-top: 10px;
        border-radius: 10px;
        border: 1px solid rgba(212, 160, 23, 0.2);
      }
      .photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
      }
      .photo-item {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
        }
      }
      .photo-delete {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(220, 53, 69, 0.9);
        border: none;
        color: white;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .photo-item:hover .photo-delete {
        opacity: 1;
      }
      .theme-font-preview {
        font-size: 16px;
        opacity: 0.8;
        white-space: nowrap;
      }
      .radio-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
      }
      .icon-type-btn {
        display: flex; align-items: center; gap: 6px;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
        border-radius: 8px; padding: 8px 14px; font-size: 13px;
        color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.2s;
        &.active { background: rgba(212,160,23,0.15); border-color: var(--gold); color: var(--gold); }
        &:hover:not(.active) { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.8); }
      }
      .emoji-trigger {
        display: flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px; padding: 10px 16px; cursor: pointer;
        transition: all 0.2s; width: 100%;
        &:hover { border-color: var(--gold); background: rgba(212,160,23,0.05); }
      }
      .emoji-trigger-icon { font-size: 24px; }
      .emoji-trigger-text { flex: 1; font-size: 13px; color: rgba(255,255,255,0.5); text-align: left; }
      .emoji-dropdown {
        position: absolute; top: 100%; left: 0; right: 0; z-index: 100;
        background: #1a1a2e; border: 1px solid rgba(212,160,23,0.3);
        border-radius: 12px; padding: 12px; margin-top: 4px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      }
    `,
  ],
  templateUrl: "./config.component.html",
})
export class ConfigComponent implements OnInit, AfterViewChecked {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private quillCustomColorInjected = false;
  eventId = 0;
  config = signal<EventConfig | null>(null);
  itinerary = signal<ItineraryItem[]>([]);
  photos = signal<any[]>([]);
  saving = signal(false);
  activeTab = "styles";
  @ViewChild("tabsEl") tabsEl!: ElementRef<HTMLElement>;
  savedItems: Record<number, boolean> = {};
  emojiPickerOpen: number | null = null;
  quillModules = {
    toolbar: [
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': ['#ffffff','#f5f5f5','#c0c0c0','#9e9e9e','#607d8b','#000000','#d4a017','#f0c040','#b8860b','#ff0000','#e91e63','#9c27b0','#673ab7','#3f51b5','#2196f3','#00bcd4','#009688','#4caf50','#8bc34a','#ff9800','#ff5722','#795548'] },
       { 'background': ['transparent','#ffffff','#000000','#d4a017','#f0c040','#ff0000','#e91e63','#9c27b0','#3f51b5','#2196f3','#00bcd4','#4caf50','#ffeb3b','#ff9800','#ff5722','#795548'] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };
  emojiOptions = [
    "\u26ea",
    "\ud83c\udfdb\ufe0f",
    "\ud83c\udf7d\ufe0f",
    "\ud83c\udf82",
    "\ud83c\udfb6",
    "\ud83d\udc83",
    "\ud83c\udf78",
    "\ud83d\udcf8",
    "\ud83d\udc92",
    "\ud83c\udf89",
    "\ud83c\udf1f",
    "\ud83d\ude97",
    "\ud83c\udfa4",
    "\ud83c\udfb5",
    "\ud83e\udd42",
    "\ud83c\udf39",
    "\ud83d\udc8d",
    "\ud83c\udf70",
    "\ud83c\udf7e",
    "\ud83c\udfa0",
    "\ud83c\udf86",
    "\ud83d\udc51",
    "\ud83c\udfc6",
    "\ud83c\udf1c",
  ];

  countdownDate = "";
  countdownHour = 20;
  countdownMin = 0;

  get countdownPreview() {
    if (!this.countdownDate) return "Sin fecha";
    return `${this.countdownDate} ${String(this.countdownHour).padStart(
      2,
      "0"
    )}:${String(this.countdownMin).padStart(2, "0")}`;
  }

  adjustTime(unit: "h" | "m", delta: number) {
    if (unit === "h")
      this.countdownHour = (this.countdownHour + delta + 24) % 24;
    else this.countdownMin = (this.countdownMin + delta + 60) % 60;
    this.updateCountdown();
  }

  updateCountdown() {
    if (!this.countdownDate) return;
    this.config()!.hero.countdownDate = `${this.countdownDate}T${String(
      this.countdownHour
    ).padStart(2, "0")}:${String(this.countdownMin).padStart(2, "0")}:00`;
  }

  tabs = [
    { key: "styles", label: "Estilos" },
    { key: "theme", label: "Tema" },
    { key: "intro", label: "Intro" },
    { key: "hero", label: "Car\u00e1tula" },
    { key: "invitation", label: "Invitaci\u00f3n" },
    { key: "details", label: "Detalles" },
    { key: "venues", label: "Eventos" },
    { key: "itinerary", label: "Itinerario" },
    { key: "gallery", label: "Galer\u00eda" },
    { key: "dresscode", label: "Vestimenta" },
    { key: "gifts", label: "Regalos" },
    { key: "rsvp", label: "RSVP" },
  ];

  scrollTabs(delta: number) {
    this.tabsEl.nativeElement.scrollBy({ left: delta, behavior: "smooth" });
  }

  ngOnInit() {
    this.eventId = +this.route.snapshot.params["eventId"];
    this.api.getConfig(this.eventId).subscribe((c) => {
      const cfg = this.ensureDefaults(c.config_json);
      this.config.set(cfg);
      const dt = cfg.hero?.countdownDate;
      if (dt) {
        const d = new Date(dt);
        this.countdownDate = d.toISOString().slice(0, 10);
        this.countdownHour = d.getHours();
        this.countdownMin = d.getMinutes();
      }
    });
    this.api.getItinerary(this.eventId).subscribe((i) => this.itinerary.set(i));
    this.api.getPhotos(this.eventId).subscribe((p) => this.photos.set(p));
  }

  ngAfterViewChecked() {
    if (this.quillCustomColorInjected) return;
    const pickers = document.querySelectorAll('.ql-color-picker .ql-picker-options');
    if (!pickers.length) return;
    this.quillCustomColorInjected = true;
    pickers.forEach(picker => {
      if (picker.querySelector('.custom-color-input')) return;
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'width:100%;margin-top:6px;padding-top:6px;border-top:1px solid rgba(212,160,23,0.2);display:flex;align-items:center;gap:8px;';
      const input = document.createElement('input');
      input.type = 'color';
      input.value = '#d4a017';
      input.className = 'custom-color-input';
      input.style.cssText = 'width:28px;height:28px;border:1px solid rgba(255,255,255,0.2);border-radius:6px;cursor:pointer;background:none;padding:2px;';
      const label = document.createElement('span');
      label.textContent = 'Personalizado';
      label.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.5);';
      wrapper.appendChild(input);
      wrapper.appendChild(label);
      picker.appendChild(wrapper);

      const isBackground = picker.closest('.ql-background') !== null;
      input.addEventListener('input', () => {
        if (this.quillEditors.length > 0) {
          this.quillEditors.forEach(q => {
            const sel = q.getSelection();
            if (sel && sel.length > 0) {
              q.format(isBackground ? 'background' : 'color', input.value);
            }
          });
        }
      });
    });
  }

  quillEditors: any[] = [];
  onEditorCreated(editor: any) {
    this.quillEditors.push(editor);
    this.quillCustomColorInjected = false; // re-inject for new editors
  }

  save() {
    if (!this.config()) return;
    this.saving.set(true);
    this.api.saveConfig(this.eventId, this.config()!).subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false),
    });
  }

  uploadFile(event: any, type: "images" | "audio" | "gifs", path: string) {
    const file = event.target.files[0];
    if (!file) return;
    this.api.uploadFile(type, file).subscribe((r) => {
      const keys = path.split(".");
      let obj: any = this.config();
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = r.url;
    });
  }

  getFontPreview(key?: string): string {
    const map: Record<string, string> = {
      sans: "var(--font-sans)",
      serif: "var(--font-serif)",
      script: "var(--font-script)",
      cormorant: "var(--font-cormorant)",
      spumoni: "var(--font-spumoni)",
      dancing: "var(--font-dancing)",
      montserrat: "var(--font-montserrat)",
      raleway: "var(--font-raleway)",
      cinzel: "var(--font-cinzel)",
      sacramento: "var(--font-sacramento)",
      tangerine: "var(--font-tangerine)",
      alexbrush: "var(--font-alexbrush)",
      pinyon: "var(--font-pinyon)",
      josefin: "var(--font-josefin)",
      baskerville: "var(--font-baskerville)",
    };
    return map[key || "sans"] || "var(--font-sans)";
  }

  getSeparatorPreviewBg(): string {
    const c = this.config()?.globalStyles?.separatorStyle?.color || "#d4a017";
    const t = this.config()?.globalStyles?.separatorStyle?.type || "elegant";
    switch (t) {
      case "formal":
        return c;
      case "executive":
        return `linear-gradient(180deg,${c},transparent 40%,transparent 60%,${c})`;
      case "festive":
        return `repeating-linear-gradient(90deg,${c} 0px,${c} 4px,transparent 4px,transparent 10px)`;
      case "animated":
        return `linear-gradient(90deg,transparent,${c},transparent)`;
      case "minimal":
        return `${c}40`;
      case "ornamental":
        return `linear-gradient(90deg,transparent,${c}60,${c},${c}60,transparent)`;
      default:
        return `linear-gradient(90deg,transparent,${c}80,transparent)`;
    }
  }

  getSeparatorHeight(): string {
    const t = this.config()?.globalStyles?.separatorStyle?.type || "elegant";
    switch (t) {
      case "executive":
        return "4px";
      case "festive":
        return "3px";
      case "ornamental":
        return "2px";
      default:
        return "1px";
    }
  }

  getTitleGradient(): string {
    const s = this.config()?.globalStyles?.titleStyle;
    const c1 = s?.color || "#d4a017";
    const c2 = s?.color2 || c1;
    const angle = s?.gradientAngle ?? 135;
    const intensity = s?.gradientIntensity ?? 50;
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} ${intensity}%, ${c2} 100%)`;
  }

  getEventDescGradient(): string {
    const s = this.config()?.hero?.eventDescriptionStyle;
    const c1 = (s as any)?.color1 || '#ffffff';
    const c2 = (s as any)?.color2 || '';
    if (!c2) return `linear-gradient(0deg, ${c1}, ${c1})`;
    const angle = (s as any)?.gradientAngle ?? 135;
    const intensity = (s as any)?.gradientIntensity ?? 50;
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} ${intensity}%, ${c2} 100%)`;
  }

  getCelebrantGradient(): string {
    const s = this.config()?.hero?.celebrantNamesStyle;
    const c1 = (s as any)?.color1 || "#d4a017";
    const c2 = (s as any)?.color2 || c1;
    const angle = (s as any)?.gradientAngle ?? 135;
    const intensity = (s as any)?.gradientIntensity ?? 50;
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} ${intensity}%, ${c2} 100%)`;
  }

  // Venues
  addVenue() {
    this.config()!.venues.items.push({
      id: Date.now().toString(),
      title: "",
      icon: "",
      name: "",
      address: "",
      time: "20:00",
      mapsUrl: "",
    });
  }
  removeVenue(i: number) {
    this.config()!.venues.items.splice(i, 1);
  }
  uploadVenueIcon(event: any, venue: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.api.uploadFile("images", file).subscribe((r) => (venue.icon = r.url));
  }
  venueHour(venue: any): number {
    return parseInt((venue.time || "20:00").split(":")[0]) % 12 || 12;
  }
  venueMin(venue: any): number {
    return parseInt((venue.time || "20:00").split(":")[1]) || 0;
  }
  venueAmPm(venue: any): string {
    return parseInt((venue.time || "20:00").split(":")[0]) >= 12 ? "PM" : "AM";
  }
  adjustVenueTime(venue: any, unit: "h" | "m", delta: number) {
    let h = parseInt(venue.time?.split(":")[0] || "20");
    let m = parseInt(venue.time?.split(":")[1] || "0");
    if (unit === "h") h = (h + delta + 24) % 24;
    else m = (m + delta + 60) % 60;
    venue.time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  setAmPm(venue: any, ampm: string) {
    let h = parseInt(venue.time?.split(":")[0] || "20");
    const m = parseInt(venue.time?.split(":")[1] || "0");
    if (ampm === "AM" && h >= 12) h -= 12;
    if (ampm === "PM" && h < 12) h += 12;
    venue.time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Details
  detailEmojiPickerOpen: string | null = null;
  detailEmojiOptions = [
    '💒', '⛪', '🏛️', '💍', '👰', '🤵', '👪', '🙏',
    '✝️', '🕊️', '💐', '🌹', '🎊', '🎉', '💝', '❤️',
    '🥂', '🍾', '🎂', '🎵', '📸', '🌟', '👑', '🦋',
  ];

  toggleDetailEmojiPicker(card: DetailCard) {
    this.detailEmojiPickerOpen = this.detailEmojiPickerOpen === card.id ? null : card.id;
  }

  addDetailCard() {
    this.config()!.details.cards.push({
      id: Date.now().toString(),
      iconType: 'image',
      icon: '',
      iconUrl: "",
      title: "",
      content: "",
      textAlign: "center",
    });
  }
  removeDetailCard(i: number) {
    this.config()!.details.cards.splice(i, 1);
  }
  uploadDetailIcon(event: any, card: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.api
      .uploadFile("images", file)
      .subscribe((r) => (card.iconUrl = r.url));
  }

  // Itinerary
  toggleEmojiPicker(item: ItineraryItem) {
    this.emojiPickerOpen = this.emojiPickerOpen === item.id! ? null : item.id!;
  }
  uploadItineraryIcon(event: any, item: ItineraryItem) {
    const file = event.target.files[0];
    if (!file) return;
    this.api
      .uploadFile("images", file)
      .subscribe((r) => (item.iconUrl = r.url));
  }
  itineraryHour(item: ItineraryItem): number {
    return parseInt((item.time || "20:00").split(":")[0]) % 12 || 12;
  }
  itineraryMin(item: ItineraryItem): number {
    return parseInt((item.time || "20:00").split(":")[1]) || 0;
  }
  itineraryAmPm(item: ItineraryItem): string {
    return parseInt((item.time || "20:00").split(":")[0]) >= 12 ? "PM" : "AM";
  }
  adjustItineraryTime(item: ItineraryItem, unit: "h" | "m", delta: number) {
    let h = parseInt(item.time?.split(":")[0] || "20");
    let m = parseInt(item.time?.split(":")[1] || "0");
    if (unit === "h") h = (h + delta + 24) % 24;
    else m = (m + delta + 60) % 60;
    item.time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  setItineraryAmPm(item: ItineraryItem, ampm: string) {
    let h = parseInt(item.time?.split(":")[0] || "20");
    const m = parseInt(item.time?.split(":")[1] || "0");
    if (ampm === "AM" && h >= 12) h -= 12;
    if (ampm === "PM" && h < 12) h += 12;
    item.time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  addItinerary() {
    const item: ItineraryItem = {
      icon: "\ud83c\udf89",
      iconType: "emoji",
      time: "20:00",
      title: "",
      description: "",
      sort_order: this.itinerary().length,
    };
    this.api.addItineraryItem(this.eventId, item).subscribe((r) => {
      this.itinerary.update((list) => [...list, { ...item, id: r.id }]);
    });
  }
  saveItineraryItem(item: ItineraryItem) {
    if (!item.id) return;
    this.api.updateItineraryItem(this.eventId, item.id, item).subscribe(() => {
      this.savedItems[item.id!] = true;
      setTimeout(() => {
        this.savedItems[item.id!] = false;
      }, 2500);
    });
  }
  removeItinerary(item: ItineraryItem) {
    if (!item.id) return;
    this.api.deleteItineraryItem(this.eventId, item.id).subscribe(() => {
      this.itinerary.update((list) => list.filter((i) => i.id !== item.id));
    });
  }

  // Photos
  uploadPhotos(event: any) {
    const files = event.target.files;
    if (!files?.length) return;
    this.api.uploadPhotos(this.eventId, files).subscribe((r) => {
      this.photos.update((p) => [...p, ...r.photos]);
    });
  }
  deletePhoto(photo: any) {
    this.api.deletePhoto(this.eventId, photo.id).subscribe(() => {
      this.photos.update((p) => p.filter((x) => x.id !== photo.id));
    });
  }

  private ensureDefaults(cfg: any): EventConfig {
    return {
      intro: {
        enabled: cfg?.intro?.enabled ?? true,
        background: cfg?.intro?.background || '',
        phrase: cfg?.intro?.phrase || '',
        duration: cfg?.intro?.duration || 4,
        phraseStyle: {
          fontFamily: 'script',
          fontSize: 42,
          color: '#d4a017',
          fontWeight: 400,
          ...(cfg?.intro?.phraseStyle || {}),
        },
      },
      hero: {
        backgroundGif: cfg?.hero?.backgroundGif || "",
        audioUrl: cfg?.hero?.audioUrl || "",
        eventDescription: cfg?.hero?.eventDescription || "",
        celebrantNames: cfg?.hero?.celebrantNames || "",
        heroPhrase: cfg?.hero?.heroPhrase || "",
        countdownDate: cfg?.hero?.countdownDate || "",
        eventDescriptionStyle: {
          fontFamily: "sans",
          fontSize: 22,
          color1: "#ffffff",
          color2: "",
          gradientAngle: 135,
          gradientIntensity: 50,
          fontWeight: 400,
          ...(cfg?.hero?.eventDescriptionStyle || {}),
        },
        celebrantNamesStyle: {
          fontFamily: "script",
          fontSize: 80,
          color1: "#d4a017",
          color2: "#b8860b",
          gradientAngle: 135,
          gradientIntensity: 50,
          fontWeight: 400,
          ...(cfg?.hero?.celebrantNamesStyle || {}),
        },
        heroPhraseStyle: {
          fontFamily: "serif",
          fontSize: 16,
          color: "#ffffff",
          ...(cfg?.hero?.heroPhraseStyle || {}),
        },
      },
      invitation: {
        title: cfg?.invitation?.title || "Est\u00e1n cordialmente invitados",
        subtitle: cfg?.invitation?.subtitle || "",
      },
      details: {
        enabled: cfg?.details?.enabled ?? true,
        title: cfg?.details?.title || "Detalles del Evento",
        cards: (cfg?.details?.cards || this.migrateDetails(cfg?.details)).map((c: any) => ({
          ...c,
          iconType: c.iconType || (c.iconUrl ? 'image' : 'emoji'),
          icon: c.icon || '',
          iconUrl: c.iconUrl || '',
          content: this.ensureHtmlContent(c.content || ''),
        })),
      },
      venues: cfg?.venues || { enabled: true, items: [] },
      itinerary: cfg?.itinerary || {
        enabled: true,
        title: "Itinerario",
        items: [],
      },
      gallery: cfg?.gallery || {
        enabled: true,
        title: "Galer\u00eda",
        description: "",
      },
      dresscode: cfg?.dresscode || {
        enabled: true,
        title: "C\u00f3digo de Vestimenta",
        description: "",
      },
      gifts: {
        enabled: cfg?.gifts?.enabled ?? true,
        title: cfg?.gifts?.title || "Mesa de Regalos",
        description: cfg?.gifts?.description || "",
        link: cfg?.gifts?.link || "",
        buttonText: cfg?.gifts?.buttonText || "Ver Lista",
        transfer: {
          enabled: false,
          title: "\u00bfPrefieres hacer una transferencia?",
          description: "",
          accountName: "",
          bank: "",
          accountType: "tarjeta",
          accountNumber: "",
          animation: "coins",
          ...(cfg?.gifts?.transfer || {}),
        },
      },
      rsvp: cfg?.rsvp || { enabled: true, title: "Confirmar Asistencia" },
      theme: {
        cardBg: 'rgba(255,255,255,0.05)',
        cardBorder: 'rgba(212,160,23,0.3)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.7)',
        navFooterText: '#d4a017',
        buttonBg: '#d4a017',
        buttonText: '#1a1a2e',
        ...(cfg?.theme || {}),
      },
      globalStyles: {
        sectionHeadingStyle: {
          fontFamily: "script",
          fontSize: 36,
          color: "#d4a017",
          ...(cfg?.globalStyles?.sectionHeadingStyle || {}),
        },
        titleStyle: {
          fontFamily: "script",
          fontSize: 42,
          color: "#d4a017",
          color2: "#f0c040",
          gradientAngle: 135,
          gradientIntensity: 50,
          fontWeight: 400,
          ...(cfg?.globalStyles?.titleStyle ||
            cfg?.invitation?.titleStyle ||
            cfg?.details?.titleStyle ||
            {}),
        },
        subtitleStyle: {
          fontFamily: "sans",
          fontSize: 16,
          color: "#ffffffb3",
          ...(cfg?.globalStyles?.subtitleStyle ||
            cfg?.invitation?.subtitleStyle ||
            {}),
        },
        contentStyle: {
          fontFamily: "sans",
          fontSize: 14,
          color: "#ffffffb3",
          ...(cfg?.globalStyles?.contentStyle ||
            cfg?.details?.contentStyle ||
            {}),
        },
        separatorStyle: {
          type: "elegant",
          color: "#d4a017",
          ...(cfg?.globalStyles?.separatorStyle || {}),
        },
      },
    };
  }

  private migrateDetails(old: any): DetailCard[] {
    if (!old) return [];
    const cards: DetailCard[] = [];
    if (old.parents?.enabled && old.parents.content)
      cards.push({
        id: "1",
        iconType: 'image',
        icon: '',
        iconUrl: "",
        title: old.parents.title || "Padres",
        content: this.ensureHtmlContent(old.parents.content),
        textAlign: "center",
      });
    if (old.godparents?.enabled && old.godparents.content)
      cards.push({
        id: "2",
        iconType: 'image',
        icon: '',
        iconUrl: "",
        title: old.godparents.title || "Padrinos",
        content: this.ensureHtmlContent(old.godparents.content),
        textAlign: "center",
      });
    return cards;
  }

  private ensureHtmlContent(content: string): string {
    if (!content) return '';
    if (content.includes('<p>') || content.includes('<br>') || content.includes('<span>')) return content;
    return content.split(/\\n|\n/).map(line => `<p>${line.trim() || '<br>'}</p>`).join('');
  }
}
