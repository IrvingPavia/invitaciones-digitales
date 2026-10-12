import { Component, Input, Output, EventEmitter, OnDestroy, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../../core/services/api.service';

/**
 * Control de audio reutilizable para el builder: muestra un ícono de audio, el nombre del
 * archivo, un botón reproducir/pausar, y permite subir/cambiar/quitar. Reglas:
 * - Reproduce/pausa con el botón.
 * - Si el usuario hace clic FUERA del control mientras suena, se pausa (no queda sonando
 *   infinitamente). También se pausa al destruir el componente.
 */
@Component({
  selector: 'app-audio-control',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (url) {
      <div class="audio-row">
        <span class="material-icons audio-icon">audiotrack</span>
        <div class="audio-meta">
          <span class="audio-badge">AUDIO</span>
          <span class="audio-name">{{ fileName(url) }}</span>
        </div>
        <button class="audio-play" (click)="togglePlay(); $event.stopPropagation()" [title]="playing ? 'Pausar' : 'Reproducir'">
          <span class="material-icons">{{ playing ? 'pause' : 'play_arrow' }}</span>
        </button>
        <button class="sm-btn" (click)="pick(); $event.stopPropagation()">Cambiar</button>
        <button class="sm-btn danger" (click)="clear(); $event.stopPropagation()">X</button>
      </div>
    } @else {
      <button class="sm-btn" (click)="pick(); $event.stopPropagation()">Subir</button>
    }
    @if (errorMsg) { <p class="pf-error">{{ errorMsg }}</p> }
  `,
  styles: [`
    .audio-row { display:flex; align-items:center; gap:8px; }
    .audio-icon { font-size:24px; color:#c084fc; flex-shrink:0; }
    .audio-meta { display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; }
    .audio-badge { align-self:flex-start; font-size:9px; font-weight:700; letter-spacing:0.5px; color:#c084fc; background:rgba(139,92,246,0.15); border-radius:4px; padding:1px 6px; }
    .audio-name { font-size:11px; color:rgba(255,255,255,0.6); max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .audio-play {
      width:32px; height:32px; flex-shrink:0; border-radius:50%; cursor:pointer;
      background:rgba(139,92,246,0.2); border:1px solid rgba(139,92,246,0.4);
      display:flex; align-items:center; justify-content:center; color:#fff;
      .material-icons { font-size:18px; }
    }
    .audio-play:hover { background:rgba(139,92,246,0.35); }
    .sm-btn { background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.3); color:#fff; border-radius:6px; padding:5px 10px; font-size:11px; cursor:pointer; flex-shrink:0; }
    .sm-btn:hover { background:rgba(139,92,246,0.28); }
    .sm-btn.danger { background:rgba(239,68,68,0.15); border-color:rgba(239,68,68,0.35); }
    .pf-error { font-size:11px; color:#f87171; margin:4px 0 0; }
  `]
})
export class AudioControlComponent implements OnDestroy {
  private api = inject(ApiService);
  private host = inject(ElementRef<HTMLElement>);

  /** URL del audio actual. */
  @Input() url = '';
  /** Emite la nueva URL al subir/cambiar/quitar. */
  @Output() urlChange = new EventEmitter<string>();

  playing = false;
  errorMsg = '';
  private audio?: HTMLAudioElement;
  private readonly LIMIT_MB = 15;

  fileName(u: string): string {
    if (!u) return '';
    const name = u.split('/').pop()?.split('?')[0] || '';
    return name.length > 18 ? name.substring(0, 15) + '...' : name;
  }

  togglePlay() {
    if (this.playing) { this.pause(); return; }
    if (!this.url) return;
    if (!this.audio) {
      this.audio = new Audio(this.url);
      this.audio.addEventListener('ended', () => { this.playing = false; });
    }
    this.audio.play().then(() => { this.playing = true; }).catch(() => { this.errorMsg = 'No se pudo reproducir el audio.'; });
  }

  private pause() {
    this.audio?.pause();
    this.playing = false;
  }

  /** Si el usuario hace clic fuera del control mientras suena, pausar. */
  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (this.playing && !this.host.nativeElement.contains(e.target as Node)) {
      this.pause();
    }
  }

  pick() {
    this.errorMsg = '';
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      if (f.size > this.LIMIT_MB * 1024 * 1024) {
        this.errorMsg = `El audio pesa ${(f.size / 1024 / 1024).toFixed(1)}MB y supera el límite de ${this.LIMIT_MB}MB.`;
        return;
      }
      this.api.uploadFile('audio', f).subscribe({
        next: (r) => {
          // Resetear el reproductor para que use el nuevo archivo.
          this.pause(); this.audio = undefined;
          this.url = r.url;
          this.urlChange.emit(r.url);
        },
        error: (e) => { this.errorMsg = e?.error?.error || 'No se pudo subir el audio.'; },
      });
    };
    input.click();
  }

  clear() {
    this.pause();
    this.audio = undefined;
    this.url = '';
    this.urlChange.emit('');
  }

  ngOnDestroy() {
    this.pause();
    this.audio = undefined;
  }
}
