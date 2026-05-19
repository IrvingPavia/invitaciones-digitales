import { Component, inject, OnInit, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Guest } from '../../../core/models/models';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div>
      <div class="flex-between mb-24">
        <div>
          <a routerLink="/dashboard/events" class="back-link">
            <span class="material-icons">arrow_back</span> Volver a Eventos
          </a>
          <h2 class="section-title">Diseño de Tarjetas</h2>
          <p class="section-subtitle">Configura el diseño para impresión de invitaciones físicas</p>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-secondary" (click)="save()" [disabled]="saving()">
            <span class="material-icons">save</span> Guardar
          </button>
          <button class="btn btn-primary" (click)="downloadPDF()" [disabled]="downloading()">
            <span class="material-icons">picture_as_pdf</span> {{ downloading() ? 'Generando...' : 'Exportar PDF' }}
          </button>
        </div>
      </div>

      <div class="grid-2">
        <!-- Config Panel -->
        <div>
          <div class="tabs">
            <div class="tab" [class.active]="side === 'front'" (click)="side = 'front'">Frente</div>
            <div class="tab" [class.active]="side === 'back'" (click)="side = 'back'">Reverso</div>
          </div>

          @if (side === 'front') {
            <div class="card">
              <h4 class="text-gold mb-16">Configuración del Frente</h4>
              <div class="form-group">
                <label>Color de fondo</label>
                <div class="flex gap-8">
                  <input type="color" [(ngModel)]="front.bgColor">
                  <input type="text" [(ngModel)]="front.bgColor">
                </div>
              </div>
              <div class="form-group">
                <label>Color de texto</label>
                <div class="flex gap-8">
                  <input type="color" [(ngModel)]="front.textColor">
                  <input type="text" [(ngModel)]="front.textColor">
                </div>
              </div>
              <div class="form-group">
                <label>Color de borde</label>
                <div class="flex gap-8">
                  <input type="color" [(ngModel)]="front.borderColor">
                  <input type="text" [(ngModel)]="front.borderColor">
                </div>
              </div>
              <div class="form-group">
                <label>Imagen de fondo (opcional)</label>
                <div class="flex gap-8">
                  <input type="text" [(ngModel)]="front.bgImage" placeholder="URL imagen">
                  <label class="btn btn-secondary btn-sm" style="cursor:pointer;white-space:nowrap">
                    <span class="material-icons">upload</span>
                    <input type="file" accept="image/*" (change)="uploadBg($event,'front')" style="display:none">
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label>Texto adicional (pie de tarjeta)</label>
                <input type="text" [(ngModel)]="front.footerText" placeholder="¡Te esperamos!">
              </div>
            </div>
          }

          @if (side === 'back') {
            <div class="card">
              <h4 class="text-gold mb-16">Configuración del Reverso</h4>
              <p class="text-muted" style="font-size:13px;margin-bottom:16px">El reverso mostrará automáticamente el código QR de cada invitado con el código único.</p>
              <div class="form-group">
                <label>Color de fondo</label>
                <div class="flex gap-8">
                  <input type="color" [(ngModel)]="back.bgColor">
                  <input type="text" [(ngModel)]="back.bgColor">
                </div>
              </div>
              <div class="form-group">
                <label>Color de borde</label>
                <div class="flex gap-8">
                  <input type="color" [(ngModel)]="back.borderColor">
                  <input type="text" [(ngModel)]="back.borderColor">
                </div>
              </div>
              <div class="form-group">
                <label>Texto sobre el QR</label>
                <input type="text" [(ngModel)]="back.topText" placeholder="Escanea para ver tu invitación">
              </div>
            </div>
          }
        </div>

        <!-- Preview -->
        <div>
          <div class="card">
            <h4 class="text-gold mb-16">Vista Previa</h4>
            <p class="text-muted" style="font-size:12px;margin-bottom:16px">Invitado de muestra: {{ previewGuest()?.family_name || previewGuest()?.guest_names || 'Sin invitados' }}</p>

            <!-- Front preview -->
            <div style="margin-bottom:16px">
              <p style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Frente</p>
              <div [style.background]="front.bgImage ? 'url('+front.bgImage+') center/cover' : front.bgColor"
                   [style.border]="'2px solid ' + front.borderColor"
                   [style.color]="front.textColor"
                   style="width:100%;max-width:280px;height:160px;border-radius:8px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
                @if (front.bgImage) {
                  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.4)"></div>
                }
                <div style="position:relative;z-index:1">
                  <div style="font-size:11px;opacity:0.7;text-transform:uppercase;letter-spacing:1px">{{ eventName }}</div>
                  <div style="font-size:16px;font-weight:700;margin-top:4px">{{ previewGuest()?.family_name || previewGuest()?.guest_names || 'Familia García' }}</div>
                  <div style="font-size:11px;margin-top:4px;opacity:0.8">{{ guestCount(previewGuest()) }} asistente(s)</div>
                </div>
                <div style="position:relative;z-index:1;font-size:10px;opacity:0.7">{{ front.footerText }}</div>
              </div>
            </div>

            <!-- Back preview -->
            <div>
              <p style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Reverso</p>
              <div [style.background]="back.bgColor" [style.border]="'2px solid ' + back.borderColor"
                   style="width:100%;max-width:280px;height:160px;border-radius:8px;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
                <div style="font-size:11px;color:#666;text-align:center">{{ back.topText }}</div>
                <div style="width:80px;height:80px;background:#f0f0f0;border-radius:4px;display:flex;align-items:center;justify-content:center">
                  <span class="material-icons" style="color:#999;font-size:40px">qr_code_2</span>
                </div>
                <div style="font-size:10px;color:#999">CÓDIGO-ÚNICO</div>
              </div>
            </div>
          </div>

          <!-- Guest selector for preview -->
          @if (guests().length > 0) {
            <div class="card mt-16">
              <label style="font-size:13px;color:rgba(255,255,255,0.7);display:block;margin-bottom:8px">Previsualizar con invitado:</label>
              <select (change)="selectPreview($event)" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(212,160,23,0.3);border-radius:8px;padding:8px;color:white">
                @for (g of guests(); track g.id) {
                  <option [value]="g.id">{{ g.family_name || g.guest_names }}</option>
                }
              </select>
            </div>
          }
        </div>
      </div>

      <div class="card mt-24">
        <h4 class="text-gold mb-8">Información del PDF</h4>
        <p class="text-muted" style="font-size:13px">El PDF generará <strong style="color:white">5 invitaciones por página</strong> en 2 columnas: frente (izquierda) y reverso con QR (derecha). Total de invitados: <strong style="color:var(--gold)">{{ guests().length }}</strong> → <strong style="color:var(--gold)">{{ Math.ceil(guests().length / 5) }}</strong> páginas.</p>
      </div>
    </div>
  `
})
export class CardsComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  Math = Math;
  eventId = 0; eventName = '';
  guests = signal<Guest[]>([]);
  previewGuest = signal<Guest | null>(null);
  saving = signal(false); downloading = signal(false);
  side = 'front';

  front: any = { bgColor: '#fff8f0', textColor: '#333333', borderColor: '#d4a017', bgImage: '', footerText: '¡Te esperamos!' };
  back: any = { bgColor: '#ffffff', borderColor: '#d4a017', topText: 'Escanea para ver tu invitación' };

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    this.api.getEvent(this.eventId).subscribe(e => this.eventName = e.name);
    this.api.getGuests(this.eventId).subscribe(g => { this.guests.set(g); if (g.length) this.previewGuest.set(g[0]); });
    this.api.getCardTemplate(this.eventId).subscribe(t => {
      if (t.front_config && Object.keys(t.front_config).length) this.front = { ...this.front, ...t.front_config };
      if (t.back_config && Object.keys(t.back_config).length) this.back = { ...this.back, ...t.back_config };
    });
  }

  selectPreview(e: any) {
    const g = this.guests().find(x => x.id === +e.target.value);
    if (g) this.previewGuest.set(g);
  }

  guestCount(g: Guest | null) {
    if (!g) return 0;
    return g.guest_type === 'family' ? g.guest_names.split(',').length : g.max_companions + 1;
  }

  save() {
    this.saving.set(true);
    this.api.saveCardTemplate(this.eventId, { front_config: this.front, back_config: this.back }).subscribe({
      next: () => this.saving.set(false), error: () => this.saving.set(false)
    });
  }

  downloadPDF() {
    this.downloading.set(true);
    this.api.downloadCardsPDF(this.eventId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `invitaciones_${this.eventId}.pdf`; a.click();
        this.downloading.set(false);
      },
      error: () => this.downloading.set(false)
    });
  }

  uploadBg(event: any, side: string) {
    const file = event.target.files[0]; if (!file) return;
    this.api.uploadFile('images', file).subscribe(r => {
      if (side === 'front') this.front.bgImage = r.url;
    });
  }
}
