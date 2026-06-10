import {
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { RichTextEditorComponent } from "../../../core/components/rich-text-editor.component";
import { ApiService } from "../../../core/services/api.service";
import { ColorPickerComponent } from "../../../core/components/color-picker.component";
import {
  EventConfig,
  ItineraryItem,
  DetailCard,
  DetailTextStyle,
  GlobalTextStyles,
  ThemeConfig,
  SectionIconConfig,
  SectionStyle,
  IntroParticlesConfig,
  EnvelopeConfig,
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
  imports: [CommonModule, DecimalPipe, FormsModule, RouterLink, ColorPickerComponent, RichTextEditorComponent],
  styles: [
    `
      .preview-phone {
        position: relative;
        width: 320px; height: 580px;
        border: 3px solid #333;
        border-radius: 32px;
        overflow: hidden;
        background: #000;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 2px #1a1a1a;
      }
      .preview-phone-notch {
        position: absolute;
        top: 0; left: 50%;
        transform: translateX(-50%);
        width: 120px; height: 22px;
        background: #000;
        border-radius: 0 0 14px 14px;
        z-index: 2;
      }
      .preview-iframe {
        width: 100%; height: 100%;
        border: none;
        border-radius: 28px;
      }
      .help-box {
        background: rgba(124,92,191,0.1); border: 1px solid rgba(124,92,191,0.3);
        border-radius: 8px; padding: 10px 14px; margin: 8px 0;
        font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.6;
      }
      .help-box strong { color: rgba(255,255,255,0.9); }
      .start-tpl-card {
        border: 2px solid rgba(124,92,191,0.2); border-radius: 12px;
        overflow: hidden; cursor: pointer; transition: all 0.2s;
        &:hover { border-color: rgba(124,92,191,0.5); transform: translateY(-2px); }
        &.active { border-color: var(--gold); box-shadow: 0 0 12px rgba(212,160,23,0.3); }
      }
      .start-tpl-preview {
        height: 80px; display: flex; align-items: center; justify-content: center;
      }
      .start-tpl-name {
        display: block; padding: 8px; text-align: center;
        font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.8);
        background: rgba(255,255,255,0.02);
      }
      .video-trimmer { padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; }
      .landing-bg-preview {
        height: 80px; border-radius: 8px; margin-top: 8px; position: relative; overflow: hidden;
        border: 1px solid rgba(124,92,191,0.2);
      }
      .landing-bg-texture-overlay {
        position: absolute; inset: 0; pointer-events: none;
      }
      .landing-bg-texture-overlay[data-texture="noise"] {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      }
      .landing-bg-texture-overlay[data-texture="grain"] {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
      }
      .landing-bg-texture-overlay[data-texture="dots"] {
        background-image: radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px);
        background-size: 8px 8px;
      }
      .landing-bg-texture-overlay[data-texture="lines"] {
        background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 5px);
      }
      .landing-bg-texture-overlay[data-texture="cross"] {
        background-image: repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px),
                          repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px);
      }
      .landing-bg-texture-overlay[data-texture="paper"] {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E");
      }
      .landing-bg-texture-overlay[data-texture="linen"] {
        background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px),
                          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px);
      }
      .landing-bg-texture-overlay[data-texture="stars"] {
        background-image: radial-gradient(circle, rgba(255,255,255,0.8) 0.5px, transparent 0.5px);
        background-size: 20px 20px;
        background-position: 0 0, 10px 10px;
      }
      .trimmer-container { position: relative; }
      .trimmer-track {
        position: relative; height: 32px; background: rgba(255,255,255,0.1);
        border-radius: 4px; cursor: pointer; overflow: visible;
      }
      .trimmer-selected {
        position: absolute; top: 0; bottom: 0;
        background: rgba(124,92,191,0.4); border: 2px solid rgba(124,92,191,0.8);
        border-radius: 4px; pointer-events: none;
      }
      .trimmer-handle {
        position: absolute; top: -4px; bottom: -4px; width: 14px;
        background: var(--gold); border-radius: 4px; cursor: ew-resize;
        transform: translateX(-50%); z-index: 2;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        &:hover { background: #e6b800; }
      }
      .trimmer-labels {
        display: flex; justify-content: space-between; margin-top: 6px;
        font-size: 11px; color: rgba(255,255,255,0.6);
      }
      .trimmer-preview { display: flex; gap: 8px; align-items: center; }
      .venue-card {
        border: 1px solid rgba(124, 92, 191, 0.2);
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
        background: rgba(124, 92, 191, 0.1);
        border: 1px solid rgba(124, 92, 191, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
      }
      .dresscode-images-grid {
        display: flex; gap: 10px; flex-wrap: wrap;
      }
      .dresscode-img-preview {
        width: 80px; height: 100px; border-radius: 10px; overflow: hidden; position: relative;
        border: 1px solid rgba(124, 92, 191, 0.3); background: rgba(124, 92, 191, 0.1);
        img { width: 100%; height: 100%; object-fit: cover; }
      }
      .dresscode-img-remove {
        position: absolute; top: 2px; right: 2px;
        background: rgba(0,0,0,0.7); border: none; border-radius: 50%;
        width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
        cursor: pointer; padding: 0;
        .material-icons { font-size: 14px; color: #ff6b6b; }
        &:hover { background: rgba(0,0,0,0.9); }
      }
      .dresscode-img-add {
        width: 80px; height: 100px; border-radius: 10px;
        border: 2px dashed rgba(124, 92, 191, 0.4); background: rgba(124, 92, 191, 0.05);
        display: flex; align-items: center; justify-content: center; cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
        .material-icons { font-size: 28px; color: rgba(124, 92, 191, 0.6); }
        &:hover { border-color: rgba(124, 92, 191, 0.7); background: rgba(124, 92, 191, 0.1); }
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
        border: 1px solid rgba(124, 92, 191, 0.2);
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
        background: rgba(124, 92, 191, 0.08);
        border: 1px solid rgba(124, 92, 191, 0.2);
        border-radius: 8px;
        padding: 10px 16px;
      }
      .config-header {
        margin-bottom: 16px;
        h2 {
          font-family: var(--font-montserrat);
          font-size: 24px;
          font-weight: 600;
          color: var(--gold);
        }
      }
      .config-toolbar {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 12px;
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
          background: rgba(124, 92, 191, 0.15);
          border-color: var(--gold);
        }
      }
      .tabs-wrapper .tabs {
        margin-bottom: 0;
        flex: 1;
        min-width: 0;
      }
      .tabs-wrapper .tabs .tab {
        border: none;
        border-bottom: 2px solid transparent;
        outline: none;
        background: transparent;
        &:focus, &:focus-visible {
          outline: none;
          border: none;
          border-bottom: 2px solid transparent;
        }
        &.active {
          border: none;
          border-bottom: 2px solid var(--gold);
        }
      }
      .itinerary-card {
        border: 1px solid rgba(124, 92, 191, 0.15);
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
        background: rgba(124, 92, 191, 0.1);
        border: 1px solid rgba(124, 92, 191, 0.3);
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
          background: rgba(124, 92, 191, 0.15);
          border-color: var(--gold);
        }
        &.active {
          background: rgba(124, 92, 191, 0.2);
          border-color: var(--gold);
          box-shadow: 0 0 8px rgba(124, 92, 191, 0.3);
        }
      }
      .style-block {
        border: 1px solid rgba(124, 92, 191, 0.15);
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
        border: 1px solid rgba(124, 92, 191, 0.15);
        border-radius: 12px;
        margin-bottom: 20px;
        overflow: visible;
        background: rgba(255, 255, 255, 0.02);
      }
      .section-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        background: rgba(124, 92, 191, 0.05);
        border-bottom: 1px solid rgba(124, 92, 191, 0.1);
        span {
          font-size: 14px;
          font-weight: 600;
          color: var(--gold-light);
        }
      }
      .section-card-body {
        padding: 20px;
        overflow: visible;
      }
      .preview-card {
        background: rgba(0, 0, 0, 0.2);
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 120px;
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
        flex-wrap: wrap;
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
        border: 1px solid rgba(124, 92, 191, 0.2);
      }
      .btn-remove-file {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 8px;
        background: rgba(220, 53, 69, 0.15);
        border: 1px solid rgba(220, 53, 69, 0.4);
        border-radius: 6px;
        padding: 4px 10px;
        font-size: 12px;
        color: #dc3545;
        cursor: pointer;
        transition: all 0.2s;
        width: auto;
        max-width: fit-content;
        &:hover {
          background: rgba(220, 53, 69, 0.3);
          border-color: #dc3545;
        }
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
        border-radius: 8px; padding: 8px 12px; font-size: 12px;
        color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.2s;
        white-space: nowrap;
        &.active { background: rgba(124,92,191,0.15); border-color: var(--gold); color: var(--gold); }
        &:hover:not(.active) { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.8); }
      }      .emoji-trigger {
        display: flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px; padding: 10px 16px; cursor: pointer;
        transition: all 0.2s; width: 100%;
        &:hover { border-color: var(--gold); background: rgba(124,92,191,0.05); }
      }
      .emoji-trigger-icon { font-size: 24px; }
      .emoji-trigger-text { flex: 1; font-size: 13px; color: rgba(255,255,255,0.5); text-align: left; }

      .emoji-dropdown {
        position: absolute; top: 100%; left: 0; right: 0; z-index: 100;
        background: #1a1a2e; border: 1px solid rgba(124,92,191,0.3);
        border-radius: 12px; padding: 12px; margin-top: 4px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        max-height: 220px; overflow-y: auto;
      }
      .particles-preview {
        position: relative;
        height: 200px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding-bottom: 30px;
        overflow: hidden;
      }
      .particles-preview-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
      }
      .particles-preview-container {
        position: absolute; inset: 0;
        pointer-events: none;
        overflow: hidden;
      }
      .preview-particle {
        position: absolute;
        border-radius: 50%;
        opacity: 0;
      }
      [data-type="sparkles"] .preview-particle { animation: pvUp linear infinite; }
      [data-type="snow"] .preview-particle { animation: pvDown linear infinite; }
      [data-type="fireflies"] .preview-particle { animation: pvFirefly ease-in-out infinite; }
      [data-type="bubbles"] .preview-particle { animation: pvBubble ease-in-out infinite; }
      [data-type="stars"] .preview-particle { animation: pvStar ease-in-out infinite; }
      [data-type="confetti"] .preview-particle { border-radius: 2px; animation: pvConfetti linear infinite; }
      [data-dir="down"][data-type="sparkles"] .preview-particle { animation-name: pvDown; }
      [data-dir="left"][data-type="sparkles"] .preview-particle { animation-name: pvLeft; }
      [data-dir="right"][data-type="sparkles"] .preview-particle { animation-name: pvRight; }
      [data-dir="left"][data-type="snow"] .preview-particle { animation-name: pvLeft; }
      [data-dir="right"][data-type="snow"] .preview-particle { animation-name: pvRight; }
      [data-dir="left"][data-type="bubbles"] .preview-particle { animation-name: pvLeft; }
      [data-dir="right"][data-type="bubbles"] .preview-particle { animation-name: pvRight; }
      [data-dir="down"][data-type="bubbles"] .preview-particle { animation-name: pvDown; }
      [data-dir="left"][data-type="confetti"] .preview-particle { animation-name: pvLeft; }
      [data-dir="right"][data-type="confetti"] .preview-particle { animation-name: pvRight; }
      .particles-preview-phrase {
        position: relative;
        z-index: 1;
        font-size: 20px;
        text-shadow: 0 0 20px rgba(124,92,191,0.4);
      }
      @keyframes pvUp {
        0% { opacity: 0; transform: translateY(0) scale(0.5); }
        5% { opacity: var(--particle-opacity, 0.8); }
        80% { opacity: calc(var(--particle-opacity, 0.8) * 0.6); }
        100% { opacity: 0; transform: translateY(-200px) translateX(var(--drift, 0px)) scale(1); }
      }
      @keyframes pvDown {
        0% { opacity: 0; transform: translateY(0) scale(0.5); }
        5% { opacity: var(--particle-opacity, 0.8); }
        80% { opacity: calc(var(--particle-opacity, 0.8) * 0.5); }
        100% { opacity: 0; transform: translateY(200px) translateX(var(--drift, 0px)) scale(1); }
      }
      @keyframes pvLeft {
        0% { opacity: 0; transform: translateX(0) scale(0.5); }
        5% { opacity: var(--particle-opacity, 0.8); }
        80% { opacity: calc(var(--particle-opacity, 0.8) * 0.5); }
        100% { opacity: 0; transform: translateX(-300px) translateY(var(--drift, 0px)) scale(1); }
      }
      @keyframes pvRight {
        0% { opacity: 0; transform: translateX(0) scale(0.5); }
        5% { opacity: var(--particle-opacity, 0.8); }
        80% { opacity: calc(var(--particle-opacity, 0.8) * 0.5); }
        100% { opacity: 0; transform: translateX(300px) translateY(var(--drift, 0px)) scale(1); }
      }
      @keyframes pvFirefly {
        0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
        10% { opacity: var(--particle-opacity, 0.8); }
        25% { transform: translate(var(--drift, 20px), -30px) scale(1); }
        50% { opacity: calc(var(--particle-opacity, 0.8) * 0.4); transform: translate(calc(var(--drift, 20px) * -1), -60px) scale(0.7); }
        75% { opacity: var(--particle-opacity, 0.8); transform: translate(var(--drift, 20px), -90px) scale(1); }
        100% { opacity: 0; transform: translate(0, -120px) scale(0.5); }
      }
      @keyframes pvBubble {
        0% { opacity: 0; transform: translateY(0) scale(0.4); }
        10% { opacity: var(--particle-opacity, 0.8); transform: translateY(-15px) translateX(var(--drift, 10px)) scale(0.8); }
        40% { opacity: var(--particle-opacity, 0.8); transform: translateY(-70px) translateX(calc(var(--drift, 10px) * -0.5)) scale(1); }
        70% { opacity: calc(var(--particle-opacity, 0.8) * 0.6); transform: translateY(-120px) translateX(var(--drift, 10px)) scale(0.9); }
        100% { opacity: 0; transform: translateY(-180px) translateX(calc(var(--drift, 10px) * -1)) scale(0.6); }
      }
      @keyframes pvStar {
        0%, 100% { opacity: 0; transform: scale(0.5); }
        50% { opacity: var(--particle-opacity, 0.8); transform: scale(1.2); }
      }
      @keyframes pvConfetti {
        0% { opacity: 0; transform: translateY(0) rotate(0deg); }
        10% { opacity: var(--particle-opacity, 0.8); }
        90% { opacity: calc(var(--particle-opacity, 0.8) * 0.6); }
        100% { opacity: 0; transform: translateY(200px) rotate(var(--rotation, 720deg)) scale(0.5); }
      }
    `,
  ],
  templateUrl: "./config.component.html",
})
export class ConfigComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  eventId = 0;
  config = signal<EventConfig | null>(null);
  itinerary = signal<ItineraryItem[]>([]);
  photos = signal<any[]>([]);
  saving = signal(false);
  activeTab = "theme";
  @ViewChild("tabsEl") tabsEl!: ElementRef<HTMLElement>;
  savedItems: Record<number, boolean> = {};
  emojiPickerOpen: number | null = null;

  isVideoFile(url: string): boolean {
    if (!url) return false;
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'ogg'].includes(ext);
  }

  heroMediaHelp = false;
  introMediaHelp = false;
  maxIntroDuration = 5;
  introVideoDurationLocal = 0;
  private trimDragging: 'start' | 'end' | null = null;
  @ViewChild('trimmerTrack') trimmerTrack?: ElementRef<HTMLElement>;
  @ViewChild('introTrimVideo') introTrimVideo?: ElementRef<HTMLVideoElement>;
  @ViewChild('introPreviewVideo') introPreviewVideo?: ElementRef<HTMLVideoElement>;

  ensureEnvelopeTemplate() {
    if (!this.config()?.envelope?.template) {
      this.config()!.envelope.template = 'envelope';
    }
  }

  getLandingBgPreview(): string {
    const c = this.config()!;
    const color1 = c.theme.landingBgColor1 || '#0d1117';
    const color2 = c.theme.landingBgColor2 || '#1a1a2e';
    const type = c.theme.landingBgType || 'solid';
    const angle = c.theme.landingBgAngle || 135;
    const intensity = c.theme.landingBgIntensity || 50;

    switch (type) {
      case 'solid': return color1;
      case 'linear': return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
      case 'radial': return `radial-gradient(ellipse ${intensity}% ${intensity}% at center, ${color2}, ${color1})`;
      case 'mesh': {
        const s1 = Math.max(0, 50 - intensity / 2);
        const s2 = Math.min(100, 50 + intensity / 2);
        return `linear-gradient(${angle}deg, ${color1} ${s1}%, ${color2} ${s2}%)`;
      }
      default: return color1;
    }
  }

  // --- Video Trimmer Methods ---
  uploadIntroMedia(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.api.uploadFile('gifs', file).subscribe(r => {
      const c = this.config()!;
      c.intro.background = r.url;
      c.intro.videoStart = undefined;
      c.intro.videoEnd = undefined;
      c.intro.videoDuration = undefined;
    });
  }

  onIntroVideoLoaded(event: Event) {
    const video = event.target as HTMLVideoElement;
    const duration = video.duration;
    const c = this.config()!;
    c.intro.videoDuration = Math.round(duration * 10) / 10;
    this.introVideoDurationLocal = c.intro.videoDuration;
    if (!c.intro.videoStart && c.intro.videoStart !== 0) c.intro.videoStart = 0;
    if (!c.intro.videoEnd) c.intro.videoEnd = Math.min(duration, this.maxIntroDuration);
    c.intro.duration = Math.min(Math.round(c.intro.videoEnd - c.intro.videoStart), this.maxIntroDuration);
  }

  getTrimLeftPercent(): number {
    const c = this.config()!;
    if (!c.intro.videoDuration) return 0;
    return ((c.intro.videoStart || 0) / c.intro.videoDuration) * 100;
  }

  getTrimRightPercent(): number {
    const c = this.config()!;
    if (!c.intro.videoDuration) return 100;
    return ((c.intro.videoEnd || c.intro.videoDuration) / c.intro.videoDuration) * 100;
  }

  getTrimWidthPercent(): number {
    return this.getTrimRightPercent() - this.getTrimLeftPercent();
  }

  getSelectedDuration(): number {
    const c = this.config()!;
    return Math.round(((c.intro.videoEnd || c.intro.videoDuration || 5) - (c.intro.videoStart || 0)) * 10) / 10;
  }

  formatTrimTime(seconds: number): string {
    const s = Math.round(seconds * 10) / 10;
    return s.toFixed(1);
  }

  onTrimHandleStart(event: MouseEvent, handle: 'start' | 'end') {
    event.preventDefault();
    event.stopPropagation();
    this.trimDragging = handle;
    const onMove = (e: MouseEvent) => this.onTrimMove(e.clientX);
    const onUp = () => { this.trimDragging = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); this.updateIntroDuration(); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  onTrimHandleTouchStart(event: TouchEvent, handle: 'start' | 'end') {
    event.preventDefault();
    event.stopPropagation();
    this.trimDragging = handle;
    const onMove = (e: TouchEvent) => { e.preventDefault(); this.onTrimMove(e.touches[0].clientX); };
    const onEnd = () => { this.trimDragging = null; document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); this.updateIntroDuration(); };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  onTrimmerTrackClick(event: MouseEvent) {
    // Click on track moves nearest handle
    if (!this.trimmerTrack) return;
    const rect = this.trimmerTrack.nativeElement.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const c = this.config()!;
    const dur = c.intro.videoDuration || 5;
    const time = percent * dur;
    const startDist = Math.abs(time - (c.intro.videoStart || 0));
    const endDist = Math.abs(time - (c.intro.videoEnd || dur));
    if (startDist < endDist) {
      c.intro.videoStart = Math.max(0, Math.min(time, (c.intro.videoEnd || dur) - 0.5));
    } else {
      c.intro.videoEnd = Math.min(dur, Math.max(time, (c.intro.videoStart || 0) + 0.5));
    }
    this.clampTrimDuration();
    this.updateIntroDuration();
  }

  onTrimmerTrackTouch(event: TouchEvent) {
    const touch = event.touches[0];
    if (!this.trimmerTrack) return;
    const rect = this.trimmerTrack.nativeElement.getBoundingClientRect();
    const percent = (touch.clientX - rect.left) / rect.width;
    const c = this.config()!;
    const dur = c.intro.videoDuration || 5;
    const time = percent * dur;
    const startDist = Math.abs(time - (c.intro.videoStart || 0));
    const endDist = Math.abs(time - (c.intro.videoEnd || dur));
    if (startDist < endDist) {
      c.intro.videoStart = Math.max(0, Math.min(time, (c.intro.videoEnd || dur) - 0.5));
    } else {
      c.intro.videoEnd = Math.min(dur, Math.max(time, (c.intro.videoStart || 0) + 0.5));
    }
    this.clampTrimDuration();
    this.updateIntroDuration();
  }

  private onTrimMove(clientX: number) {
    if (!this.trimDragging || !this.trimmerTrack) return;
    const rect = this.trimmerTrack.nativeElement.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const c = this.config()!;
    const dur = c.intro.videoDuration || 5;
    const time = Math.round(percent * dur * 10) / 10;

    if (this.trimDragging === 'start') {
      c.intro.videoStart = Math.max(0, Math.min(time, (c.intro.videoEnd || dur) - 0.5));
    } else {
      c.intro.videoEnd = Math.min(dur, Math.max(time, (c.intro.videoStart || 0) + 0.5));
    }
    this.clampTrimDuration();
  }

  private clampTrimDuration() {
    const c = this.config()!;
    const start = c.intro.videoStart || 0;
    const end = c.intro.videoEnd || (c.intro.videoDuration || 5);
    if (end - start > this.maxIntroDuration) {
      if (this.trimDragging === 'start') {
        c.intro.videoStart = end - this.maxIntroDuration;
      } else {
        c.intro.videoEnd = start + this.maxIntroDuration;
      }
    }
  }

  private updateIntroDuration() {
    const c = this.config()!;
    c.intro.duration = Math.min(Math.round((c.intro.videoEnd || 5) - (c.intro.videoStart || 0)), this.maxIntroDuration);
  }

  previewTrim() {
    if (!this.introTrimVideo?.nativeElement) return;
    const c = this.config()!;
    const video = this.introTrimVideo.nativeElement;
    video.currentTime = c.intro.videoStart || 0;
    video.play();
    const checkEnd = () => {
      if (video.currentTime >= (c.intro.videoEnd || video.duration)) {
        video.pause();
        video.removeEventListener('timeupdate', checkEnd);
      }
    };
    video.addEventListener('timeupdate', checkEnd);
  }

  onIntroPreviewVideoLoaded(event: Event) {
    const video = event.target as HTMLVideoElement;
    const c = this.config()!;
    if (c.intro.videoStart) {
      video.currentTime = c.intro.videoStart;
    }
    // Loop within trim range
    video.addEventListener('timeupdate', () => {
      if (c.intro.videoEnd && video.currentTime >= c.intro.videoEnd) {
        video.currentTime = c.intro.videoStart || 0;
      }
    });
  }

  emojiOptions = [
    // Ceremonia / Religión
    "\u26ea", "\ud83c\udfdb\ufe0f", "\ud83d\udc92", "\ud83d\ude4f", "\u271d\ufe0f", "\ud83d\udd4a\ufe0f", "\ud83d\udc8d", "\ud83d\udc70", "\ud83e\udd35",
    // Comida / Bebida
    "\ud83c\udf7d\ufe0f", "\ud83c\udf70", "\ud83c\udf82", "\ud83c\udf78", "\ud83c\udf7e", "\ud83e\udd42", "\ud83c\udf77", "\ud83c\udf7a", "\ud83e\udd43",
    // Música / Baile / Fiesta
    "\ud83c\udfb6", "\ud83c\udfb5", "\ud83c\udfa4", "\ud83d\udc83", "\ud83d\udd7a", "\ud83c\udf89", "\ud83c\udf8a", "\ud83c\udfa0", "\ud83c\udf86",
    // Fotos / Recuerdos
    "\ud83d\udcf8", "\ud83c\udfa5", "\ud83d\udcf7", "\ud83c\udf1f", "\u2728", "\ud83d\udcab",
    // Transporte / Llegada
    "\ud83d\ude97", "\ud83d\ude8c", "\ud83d\ude95", "\ud83d\udeb6", "\u2708\ufe0f", "\ud83d\udea2",
    // Naturaleza / Exterior
    "\ud83c\udf39", "\ud83c\udf3b", "\ud83c\udf3a", "\ud83c\udf38", "\ud83c\udf3f", "\ud83c\udf43", "\ud83c\udf1c", "\u2600\ufe0f",
    // Regalos / Especial
    "\ud83c\udf81", "\ud83d\udc51", "\ud83c\udfc6", "\ud83d\udc9d", "\u2764\ufe0f", "\ud83d\udc96",
    // Juegos / Actividades
    "\ud83c\udfb2", "\ud83c\udfaf", "\ud83c\udfa8", "\ud83c\udfad", "\ud83e\udde9", "\ud83c\udfc3",
    // Hora / Tiempo
    "\u23f0", "\ud83d\udd50", "\ud83c\udf05", "\ud83c\udf07", "\ud83c\udf03",
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
    { key: "theme", label: "Tema" },
    { key: "styles", label: "Estilos" },
    { key: "envelope", label: "Inicio" },
    { key: "intro", label: "Intro" },
    { key: "hero", label: "Carátula" },
    { key: "invitation", label: "Invitación" },
    { key: "details", label: "Detalles" },
    { key: "venues", label: "Eventos" },
    { key: "itinerary", label: "Itinerario" },
    { key: "gallery", label: "Galería" },
    { key: "dresscode", label: "Vestimenta" },
    { key: "gifts", label: "Regalos" },
    { key: "rsvp", label: "Confirmaciones" },
    { key: "preview", label: "📱 Preview" },
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
    this.api.getEvent(this.eventId).subscribe((e) => { this.eventSlug = e.slug; });
  }

  // === Preview ===
  private sanitizer = inject(DomSanitizer);
  eventSlug = '';
  private previewKey = signal(0);

  getPreviewUrl(): SafeResourceUrl {
    const k = this.previewKey();
    const url = window.location.origin + '/invitacion/' + this.eventSlug + (k ? '?_r=' + k : '');
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getLandingUrl(): string {
    return window.location.origin + '/invitacion/' + this.eventSlug;
  }

  refreshPreview() {
    this.previewKey.set(Date.now());
  }



  saveStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');

  save() {
    if (!this.config()) return;
    this.saving.set(true);
    this.saveStatus.set('saving');
    this.api.saveConfig(this.eventId, this.config()!).subscribe({
      next: () => { this.saving.set(false); this.saveStatus.set('saved'); setTimeout(() => this.saveStatus.set('idle'), 3000); },
      error: () => { this.saving.set(false); this.saveStatus.set('error'); setTimeout(() => this.saveStatus.set('idle'), 3000); },
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

  // Dresscode cards
  getDresscodeCards(): any[] {
    const cfg = this.config();
    if (!cfg) return [];
    if (!cfg.dresscode.cards) cfg.dresscode.cards = [];
    return cfg.dresscode.cards;
  }
  addDresscodeCard() {
    const cfg = this.config();
    if (!cfg) return;
    if (!cfg.dresscode.cards) cfg.dresscode.cards = [];
    cfg.dresscode.cards.push({
      id: Date.now().toString(),
      title: '',
      description: '',
      images: [],
      showCardBg: true,
      cardBorderRadius: 16,
    });
  }
  removeDresscodeCard(i: number) {
    this.config()!.dresscode.cards?.splice(i, 1);
  }
  uploadDresscodeImage(event: any, card: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.api.uploadFile('images', file).subscribe((r) => {
      if (!card.images) card.images = [];
      card.images.push(r.url);
    });
  }
  removeDresscodeImage(card: any, index: number) {
    card.images.splice(index, 1);
  }

  // Section Style helpers
  ensureSectionStyle(section: any): any {
    if (!section.sectionStyle) {
      section.sectionStyle = { bgType: 'inherit', dividerType: 'none' };
    }
    return section.sectionStyle;
  }
  toggleSectionStyle(section: any) {
    if (section.sectionStyle && section.sectionStyle.bgType !== 'inherit') {
      section.sectionStyle = { bgType: 'inherit', dividerType: 'none' };
    } else {
      section.sectionStyle = { bgType: 'solid', bgColor1: '#ffffff', dividerType: 'none', dividerHeight: 50 };
    }
  }
  hasSectionStyle(section: any): boolean {
    return section.sectionStyle && section.sectionStyle.bgType !== 'inherit';
  }
  sectionStyleExpanded: Record<string, boolean> = {};
  toggleSectionStyleExpand(key: string) {
    this.sectionStyleExpanded[key] = !this.sectionStyleExpanded[key];
  }
  uploadSectionBgImage(event: any, section: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.api.uploadFile('images', file).subscribe((r) => {
      this.ensureSectionStyle(section);
      section.sectionStyle.bgImage = r.url;
      section.sectionStyle.bgType = 'image';
    });
  }

  applySectionPreset(section: any, preset: string) {
    this.ensureSectionStyle(section);
    const s = section.sectionStyle;
    switch (preset) {
      case 'light':
        s.bgType = 'solid'; s.bgColor1 = '#f8f5f0'; s.bgColor2 = '';
        s.headingColor = '#2d2d2d'; s.contentColor = '#4a4a4a';
        s.dividerType = 'wave'; s.dividerColor = '#f8f5f0'; s.dividerHeight = 50;
        break;
      case 'dark':
        s.bgType = 'solid'; s.bgColor1 = '#1a1a2e'; s.bgColor2 = '';
        s.headingColor = '#d4a017'; s.contentColor = 'rgba(255,255,255,0.8)';
        s.dividerType = 'curve'; s.dividerColor = '#1a1a2e'; s.dividerHeight = 50;
        break;
      case 'wine':
        s.bgType = 'linear'; s.bgColor1 = '#6b1d1d'; s.bgColor2 = '#4a1515'; s.bgAngle = 180;
        s.headingColor = '#f5e6d3'; s.contentColor = 'rgba(245,230,211,0.85)';
        s.dividerType = 'slant'; s.dividerColor = '#6b1d1d'; s.dividerHeight = 60;
        break;
      case 'transparent':
        s.bgType = 'inherit'; s.bgColor1 = ''; s.bgColor2 = '';
        s.headingColor = ''; s.contentColor = '';
        s.dividerType = 'none'; s.dividerHeight = 50;
        break;
    }
  }

  getSectionStylePreviewBg(section: any): string {
    const s = section?.sectionStyle;
    if (!s || s.bgType === 'inherit') return this.getLandingBgPreview();
    switch (s.bgType) {
      case 'solid': return s.bgColor1 || '#ffffff';
      case 'linear': {
        const intensity = s.bgIntensity || 50;
        return `linear-gradient(${s.bgAngle || 180}deg, ${s.bgColor1 || '#ffffff'} ${50 - intensity / 2}%, ${s.bgColor2 || '#f0f0f0'} ${50 + intensity / 2}%)`;
      }
      case 'radial': return `radial-gradient(ellipse at center, ${s.bgColor2 || '#f0f0f0'}, ${s.bgColor1 || '#ffffff'})`;
      case 'image': return s.bgImage ? `url(${s.bgImage}) center/cover no-repeat` : '#333';
      default: return this.getLandingBgPreview();
    }
  }

  // Itinerary
  toggleEmojiPicker(item: ItineraryItem) {
    this.emojiPickerOpen = this.emojiPickerOpen === item.id! ? null : item.id!;
  }

  // Venues emoji
  venueEmojiPickerOpen: string | null = null;
  venueEmojiOptions = [
    '📍', '⛪', '💒', '🏛️', '🏰', '🎪', '🏖️', '🏞️',
    '🍽️', '🥂', '🎉', '🎊', '🎶', '💃', '🕺', '🌟',
    '🏨', '🏡', '🌳', '🌊', '⛰️', '🌅', '🎭', '🎬',
  ];

  toggleVenueEmojiPicker(venue: any) {
    this.venueEmojiPickerOpen = this.venueEmojiPickerOpen === venue.id ? null : venue.id;
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
      envelope: {
        enabled: false,
        style: 'classic',
        sealStyle: 'wax-circle',
        envelopeColor: '#1a1a2e',
        sealColor: '#8b0000',
        sealText: '♡',
        sealImage: '',
        instructionText: 'Toca para abrir',
        bgColor: '#0a0a14',
        bgColor2: '#1a1a2e',
        textColor: 'rgba(255,255,255,0.5)',
        ...(cfg?.envelope || {}),
      },
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
        particles: {
          enabled: true,
          type: 'sparkles',
          color1: '#d4a017',
          color2: '#ffffff',
          direction: 'up',
          quantity: 20,
          speed: 5,
          size: 4,
          opacity: 0.8,
          ...(cfg?.intro?.particles || {}),
        },
      },
      hero: {
        backgroundGif: cfg?.hero?.backgroundGif || "",
        audioUrl: cfg?.hero?.audioUrl || "",
        eventDescription: cfg?.hero?.eventDescription || "",
        celebrantNames: cfg?.hero?.celebrantNames || "",
        showCelebrantNames: cfg?.hero?.showCelebrantNames !== false,
        heroPhrase: cfg?.hero?.heroPhrase || "",
        showDescription: cfg?.hero?.showDescription || false,
        description: cfg?.hero?.description || "",
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
        showCardBg: cfg?.invitation?.showCardBg,
        cardBorderRadius: cfg?.invitation?.cardBorderRadius,
        sectionStyle: cfg?.invitation?.sectionStyle,
      },
      details: {
        enabled: cfg?.details?.enabled ?? true,
        title: cfg?.details?.title || "Detalles del Evento",
        showCardBg: cfg?.details?.showCardBg,
        cardBorderRadius: cfg?.details?.cardBorderRadius,
        sectionStyle: cfg?.details?.sectionStyle,
        cards: (cfg?.details?.cards || this.migrateDetails(cfg?.details)).map((c: any) => ({
          ...c,
          iconType: c.iconType || (c.iconUrl ? 'image' : 'emoji'),
          icon: c.icon || '',
          iconUrl: c.iconUrl || '',
          content: this.ensureHtmlContent(c.content || ''),
        })),
      },
      venues: { ...(cfg?.venues || { enabled: true, items: [] }), sectionStyle: cfg?.venues?.sectionStyle },
      itinerary: {
        ...(cfg?.itinerary || { enabled: true, title: "Itinerario", items: [] }),
        sectionStyle: cfg?.itinerary?.sectionStyle,
      },
      gallery: { ...(cfg?.gallery || { enabled: true, title: "Galería", description: "" }), sectionStyle: cfg?.gallery?.sectionStyle },
      dresscode: {
        enabled: cfg?.dresscode?.enabled ?? true,
        title: cfg?.dresscode?.title || "Código de Vestimenta",
        description: cfg?.dresscode?.description || "",
        showCardBg: cfg?.dresscode?.showCardBg,
        cardBorderRadius: cfg?.dresscode?.cardBorderRadius,
        sectionIcon: cfg?.dresscode?.sectionIcon,
        cards: cfg?.dresscode?.cards || [],
        sectionStyle: cfg?.dresscode?.sectionStyle,
      },
      gifts: {
        enabled: cfg?.gifts?.enabled ?? true,
        title: cfg?.gifts?.title || "Mesa de Regalos",
        description: cfg?.gifts?.description || "",
        link: cfg?.gifts?.link || "",
        buttonText: cfg?.gifts?.buttonText || "Ver Lista",
        sectionIcon: cfg?.gifts?.sectionIcon || undefined,
        sectionStyle: cfg?.gifts?.sectionStyle,
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
      rsvp: { ...(cfg?.rsvp || { enabled: true, title: "Confirmar Asistencia" }), sectionStyle: cfg?.rsvp?.sectionStyle },
      theme: {
        cardBg: 'rgba(255,255,255,0.05)',
        cardBorder: 'rgba(212,160,23,0.3)',
        textPrimary: '#ffffff',
        textPrimaryFont: '',
        textSecondary: 'rgba(255,255,255,0.7)',
        textSecondaryFont: '',
        navFooterText: '#d4a017',
        navFooterFont: '',
        buttonBg: '#d4a017',
        buttonText: '#1a1a2e',
        buttonFont: '',
        landingBgTexture: 'none',
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
    // Ya es HTML
    if (content.includes('<p>') || content.includes('<br>') || content.includes('<span>') || content.includes('<div>')) return content;
    // Texto plano: convertir \n literales y newlines reales a párrafos
    return content.split(/\\n|\n/).map(line => `<p>${line.trim() || '<br>'}</p>`).join('');
  }

  // Particles preview
  private _previewParticlesCache: { key: string; particles: string[] } = { key: '', particles: [] };

  getPreviewParticles(pc: IntroParticlesConfig): string[] {
    const key = `${pc.type}-${pc.direction}-${pc.color1}-${pc.color2}-${pc.quantity}-${pc.speed}-${pc.size}-${pc.opacity}`;
    if (this._previewParticlesCache.key === key) return this._previewParticlesCache.particles;

    const count = Math.min(pc.quantity || 15, 40);
    const baseSpeed = pc.speed || 5;
    const type = pc.type || 'sparkles';
    const dir = pc.direction || 'up';
    const baseSize = pc.size || 4;
    const baseOpacity = pc.opacity ?? 0.8;

    const particles = Array.from({ length: count }, () => {
      const color = Math.random() > 0.5 ? pc.color1 : pc.color2;
      const delay = Math.random() * 1.5;
      const dur = (4 - baseSpeed * 0.3) + Math.random() * 2;
      const sizeVariation = baseSize * (0.6 + Math.random() * 0.8);
      const drift = (Math.random() - 0.5) * 40;
      const rotation = 360 + Math.random() * 720;

      let position = '';
      if (type === 'stars' || type === 'fireflies') {
        position = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;`;
      } else {
        switch (dir) {
          case 'up': position = `left:${Math.random() * 100}%;bottom:-5%;`; break;
          case 'down': position = `left:${Math.random() * 100}%;top:-5%;`; break;
          case 'left': position = `top:${Math.random() * 100}%;right:-5%;`; break;
          case 'right': position = `top:${Math.random() * 100}%;left:-5%;`; break;
        }
      }

      let width = sizeVariation;
      let height = sizeVariation;
      let extra = '';

      if (type === 'confetti') {
        width = sizeVariation * 0.5;
        height = sizeVariation;
      } else if (type === 'bubbles') {
        const bubbleSize = sizeVariation * 2.5;
        width = bubbleSize;
        height = bubbleSize;
        extra = `;background:transparent;border:1px solid ${color};box-shadow:inset 0 0 ${bubbleSize * 0.3}px ${color}40, 0 0 ${bubbleSize * 0.5}px ${color}20`;
      } else if (type === 'sparkles' || type === 'stars') {
        const glowSize = sizeVariation * 1.5;
        extra = `;box-shadow:0 0 ${glowSize}px ${glowSize * 0.3}px ${color}, ${glowSize * 0.8}px 0 ${glowSize * 0.5}px 0 ${color}80, -${glowSize * 0.8}px 0 ${glowSize * 0.5}px 0 ${color}80, 0 ${glowSize * 0.8}px ${glowSize * 0.5}px 0 ${color}80, 0 -${glowSize * 0.8}px ${glowSize * 0.5}px 0 ${color}80`;
        width = sizeVariation * 0.4;
        height = sizeVariation * 0.4;
      } else if (type === 'fireflies') {
        extra = `;box-shadow:0 0 ${sizeVariation * 2}px ${color}`;
      }

      return `${position}width:${width}px;height:${height}px;background:${type === 'bubbles' ? 'transparent' : color};animation-duration:${dur}s;animation-delay:${delay}s;--drift:${drift}px;--rotation:${rotation}deg;--particle-opacity:${baseOpacity}${extra}`;
    });

    this._previewParticlesCache = { key, particles };
    return particles;
  }

  // Section Icons
  sectionEmojiPickerOpen: string | null = null;
  sectionEmojiOptions = [
    '\uD83D\uDC57', '\uD83D\uDC54', '\uD83C\uDFA9', '\uD83D\uDC60', '\uD83D\uDC83', '\uD83D\uDD7A', '\uD83E\uDD35', '\uD83D\uDC70',
    '\uD83C\uDF81', '\uD83D\uDC9D', '\uD83C\uDF80', '\uD83D\uDCB0', '\uD83C\uDFE6', '\uD83D\uDCB3', '\uD83E\uDE99', '\uD83D\uDCB5',
    '\u2705', '\uD83D\uDCCB', '\uD83D\uDC8C', '\uD83D\uDCE9', '\uD83D\uDE4B', '\uD83D\uDE4F', '\uD83C\uDF89', '\u2764\uFE0F',
  ];

  toggleSectionEmojiPicker(key: string) {
    this.sectionEmojiPickerOpen = this.sectionEmojiPickerOpen === key ? null : key;
  }

  ensureSectionIcon(obj: any): SectionIconConfig {
    if (!obj.sectionIcon) {
      obj.sectionIcon = { iconType: 'material', icon: '', iconUrl: '' };
    }
    return obj.sectionIcon;
  }

  uploadSectionIcon(event: any, obj: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.ensureSectionIcon(obj);
    this.api.uploadFile('images', file).subscribe(r => {
      obj.sectionIcon.iconUrl = r.url;
    });
  }

  getRegistrationFields(): any[] {
    const c = this.config();
    if (!c) return [];
    if (!c.rsvp.registrationFields || c.rsvp.registrationFields.length === 0) {
      c.rsvp.registrationFields = [
        { key: 'name', label: 'Nombre completo', type: 'text', enabled: true, required: true },
      ];
    }
    return c.rsvp.registrationFields;
  }

  // Returns only enabled fields (active = in list)
  getActiveRegistrationFields(): any[] {
    const fields = this.getRegistrationFields();
    return fields.filter(f => f.enabled);
  }

  // Add/remove field UI state
  showAddField = false;
  newField = { label: '', type: 'text', required: false };

  addRegistrationField() {
    if (!this.newField.label.trim()) return;
    const fields = this.getRegistrationFields();
    const key = 'custom_' + Date.now();
    fields.push({ key, label: this.newField.label.trim(), type: this.newField.type, enabled: true, required: this.newField.required });
    this.newField = { label: '', type: 'text', required: false };
    this.showAddField = false;
  }

  removeRegistrationField(index: number) {
    const fields = this.getRegistrationFields();
    const enabledFields = fields.filter(f => f.enabled);
    const field = enabledFields[index];
    if (!field || field.key === 'name') return;
    // Mark as disabled (remove from active view)
    field.enabled = false;
  }

  // Landing templates
  landingTemplates = [
    { key: 'elegante', name: 'Elegante', bg: 'linear-gradient(135deg, #1a1a2e, #0d1117)', accent: '#d4a017' },
    { key: 'moderno', name: 'Moderno', bg: 'linear-gradient(135deg, #1e1e32, #2d2d44)', accent: '#a78bfa' },
    { key: 'romantico', name: 'Romántico', bg: 'linear-gradient(135deg, #2d1525, #1a0a14)', accent: '#f4a7c1' },
    { key: 'festivo', name: 'Festivo', bg: 'linear-gradient(135deg, #1a1a2e, #2d2200)', accent: '#fbbf24' },
    { key: 'corporativo', name: 'Corporativo', bg: 'linear-gradient(135deg, #0f172a, #1e293b)', accent: '#60a5fa' },
  ];
  pendingTemplate: string | null = null;

  applyLandingTemplate() {
    if (!this.pendingTemplate || !this.config()) return;
    const templates: Record<string, any> = {
      elegante: {
        theme: { cardBg: 'rgba(0,0,0,0.5)', cardBorder: 'rgba(212,160,23,0.3)', textPrimary: '#ffffff', textPrimaryFont: 'serif', textSecondary: 'rgba(255,255,255,0.7)', textSecondaryFont: 'sans', navFooterText: '#d4a017', navFooterFont: 'script', buttonBg: '#d4a017', buttonText: '#1a1a2e', buttonFont: 'sans' },
        globalStyles: { sectionHeadingStyle: { fontFamily: 'script', fontSize: 36, color: '#d4a017' }, titleStyle: { fontFamily: 'serif', fontSize: 20, color: '#ffffff' }, subtitleStyle: { fontFamily: 'sans', fontSize: 14, color: 'rgba(255,255,255,0.7)' }, contentStyle: { fontFamily: 'sans', fontSize: 15, color: 'rgba(255,255,255,0.8)' }, separatorStyle: { type: 'elegant', color: '#d4a017' } }
      },
      moderno: {
        theme: { cardBg: 'rgba(255,255,255,0.03)', cardBorder: 'rgba(255,255,255,0.12)', textPrimary: '#ffffff', textPrimaryFont: 'montserrat', textSecondary: 'rgba(255,255,255,0.6)', textSecondaryFont: 'montserrat', navFooterText: '#a78bfa', navFooterFont: 'montserrat', buttonBg: '#a78bfa', buttonText: '#1a1a2e', buttonFont: 'montserrat' },
        globalStyles: { sectionHeadingStyle: { fontFamily: 'montserrat', fontSize: 32, color: '#a78bfa' }, titleStyle: { fontFamily: 'montserrat', fontSize: 18, color: '#ffffff' }, subtitleStyle: { fontFamily: 'montserrat', fontSize: 14, color: 'rgba(255,255,255,0.6)' }, contentStyle: { fontFamily: 'montserrat', fontSize: 15, color: 'rgba(255,255,255,0.7)' }, separatorStyle: { type: 'minimal', color: '#a78bfa' } }
      },
      romantico: {
        theme: { cardBg: 'rgba(30,10,20,0.6)', cardBorder: 'rgba(219,112,147,0.3)', textPrimary: '#fff0f5', textPrimaryFont: 'cormorant', textSecondary: 'rgba(255,240,245,0.7)', textSecondaryFont: 'sans', navFooterText: '#f4a7c1', navFooterFont: 'dancing', buttonBg: '#db7093', buttonText: '#ffffff', buttonFont: 'sans' },
        globalStyles: { sectionHeadingStyle: { fontFamily: 'dancing', fontSize: 38, color: '#f4a7c1' }, titleStyle: { fontFamily: 'cormorant', fontSize: 20, color: '#fff0f5' }, subtitleStyle: { fontFamily: 'sans', fontSize: 14, color: 'rgba(255,240,245,0.7)' }, contentStyle: { fontFamily: 'sans', fontSize: 15, color: 'rgba(255,240,245,0.8)' }, separatorStyle: { type: 'ornamental', color: '#f4a7c1' } }
      },
      festivo: {
        theme: { cardBg: 'rgba(0,0,0,0.4)', cardBorder: 'rgba(255,200,50,0.3)', textPrimary: '#ffffff', textPrimaryFont: 'raleway', textSecondary: 'rgba(255,255,255,0.7)', textSecondaryFont: 'raleway', navFooterText: '#fbbf24', navFooterFont: 'raleway', buttonBg: '#f59e0b', buttonText: '#1a1a2e', buttonFont: 'raleway' },
        globalStyles: { sectionHeadingStyle: { fontFamily: 'raleway', fontSize: 34, color: '#fbbf24' }, titleStyle: { fontFamily: 'raleway', fontSize: 18, color: '#ffffff' }, subtitleStyle: { fontFamily: 'raleway', fontSize: 14, color: 'rgba(255,255,255,0.7)' }, contentStyle: { fontFamily: 'raleway', fontSize: 15, color: 'rgba(255,255,255,0.8)' }, separatorStyle: { type: 'festive', color: '#fbbf24' } }
      },
      corporativo: {
        theme: { cardBg: 'rgba(15,23,42,0.7)', cardBorder: 'rgba(59,130,246,0.25)', textPrimary: '#f1f5f9', textPrimaryFont: 'josefin', textSecondary: 'rgba(241,245,249,0.6)', textSecondaryFont: 'josefin', navFooterText: '#60a5fa', navFooterFont: 'josefin', buttonBg: '#3b82f6', buttonText: '#ffffff', buttonFont: 'josefin' },
        globalStyles: { sectionHeadingStyle: { fontFamily: 'josefin', fontSize: 30, color: '#60a5fa' }, titleStyle: { fontFamily: 'josefin', fontSize: 18, color: '#f1f5f9' }, subtitleStyle: { fontFamily: 'josefin', fontSize: 14, color: 'rgba(241,245,249,0.6)' }, contentStyle: { fontFamily: 'josefin', fontSize: 15, color: 'rgba(241,245,249,0.7)' }, separatorStyle: { type: 'formal', color: '#60a5fa' } }
      }
    };
    const tpl = templates[this.pendingTemplate];
    if (!tpl) return;
    const c = this.config()!;
    Object.assign(c.theme, tpl.theme);
    Object.assign(c.globalStyles, tpl.globalStyles);
    this.pendingTemplate = null;
  }
}
