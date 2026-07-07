import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Guest } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .search-box {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(124,92,191,0.25);
      border-radius: 12px; padding: 10px 16px;
      transition: all 0.3s;
      &:focus-within {
        border-color: var(--gold);
        background: rgba(124,92,191,0.05);
        box-shadow: 0 0 0 3px rgba(124,92,191,0.1);
      }
    }
    .search-icon { color: rgba(124,92,191,0.6); font-size: 20px; flex-shrink: 0; }
    .search-input {
      flex: 1; background: none; border: none; outline: none;
      color: white; font-size: 14px; font-family: var(--font-sans);
      &::placeholder { color: rgba(255,255,255,0.3); }
    }
    .search-clear {
      background: none; border: none; cursor: pointer; padding: 2px;
      color: rgba(255,255,255,0.3); display: flex; align-items: center;
      border-radius: 50%; transition: all 0.2s; flex-shrink: 0;
      .material-icons { font-size: 16px; }
      &:hover { color: white; background: rgba(255,255,255,0.1); }
    }
    /* Mobile cards */
    .guest-cards { display: none; }
    .guest-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(124,92,191,0.2);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      transition: border-color 0.2s;
    }
    .guest-card:hover { border-color: rgba(124,92,191,0.4); }
    .guest-card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px; gap: 8px;
    }
    .guest-card-name {
      font-size: 15px; font-weight: 600; color: white;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      flex: 1; min-width: 0;
    }
    .guest-card-body {
      display: grid; grid-template-columns: auto 1fr; gap: 6px 12px;
      font-size: 13px; margin-bottom: 12px;
    }
    .guest-card-label { color: rgba(255,255,255,0.4); white-space: nowrap; }
    .guest-card-value { color: rgba(255,255,255,0.85); overflow: hidden; text-overflow: ellipsis; }
    .guest-card-actions {
      display: flex; gap: 8px; justify-content: flex-end;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .desktop-table { display: block; }
    @media (max-width: 768px) {
      .desktop-table { display: none; }
      .guest-cards { display: block; }
    }
  `],
  template: `
    <div>
      <div class="flex-between mb-16" style="flex-wrap:wrap;gap:12px">
        <div>
          <a routerLink="/dashboard/events" class="back-link">
            <span class="material-icons">arrow_back</span> Volver a Eventos
          </a>
          <h2 class="section-title">Invitados</h2>
          <p class="section-subtitle">{{ eventName ? eventName + ' — ' : '' }}{{ filtered().length }} de {{ guests().length }} invitados</p>
        </div>
        <div class="flex gap-8" style="flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" (click)="downloadTemplate()"><span class="material-icons">download</span> Plantilla</button>
          <label class="btn btn-secondary btn-sm" style="cursor:pointer">
            <span class="material-icons">upload_file</span> Importar Excel
            <input type="file" accept=".xlsx,.xls" (change)="importExcel($event)" style="display:none">
          </label>
          <button class="btn btn-secondary btn-sm" (click)="exportExcel()"><span class="material-icons">table_view</span> Exportar</button>
          <button class="btn btn-secondary btn-sm" (click)="shareAll()" [disabled]="!guestsWithPhone().length" title="Compartir invitaciones por WhatsApp (solo invitados con teléfono)"><span class="material-icons">send</span> Enviar invitaciones</button>
          <button class="btn btn-primary btn-sm" (click)="openModal()"><span class="material-icons">person_add</span> Agregar</button>
        </div>
      </div>

      <!-- Search -->
      <div class="card mb-16">
        <div class="search-box">
          <span class="material-icons search-icon">search</span>
          <input type="text" [(ngModel)]="search" (ngModelChange)="filterGuests()" placeholder="Buscar por nombre, familia o código..." class="search-input">
          @if (search) {
            <button class="search-clear" (click)="search=''; filterGuests()">
              <span class="material-icons">close</span>
            </button>
          }
        </div>
      </div>

      <div class="card desktop-table">
        <table class="data-table">
          <thead>
            <tr><th>Código</th><th>Tipo</th><th>Familia/Nombre</th><th>Teléfono</th><th>Estado</th><th>Enviado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            @for (g of filtered(); track g.id) {
              <tr>
                <td><code style="color:var(--gold);font-size:12px">{{ g.unique_code }}</code></td>
                <td><span class="badge" [class.badge-info]="g.guest_type==='family'" [class.badge-warning]="g.guest_type==='individual'">{{ g.guest_type === 'family' ? 'Familia' : 'Individual' }}</span></td>
                <td>
                  @if (g.family_name) { <strong>{{ g.family_name }}</strong><br> }
                  <small class="text-muted">{{ g.guest_names }}</small>
                </td>
                <td>
                  @if (g.phone) {
                    <span style="font-size:12px;color:rgba(255,255,255,0.7)">{{ g.phone }}</span>
                  } @else {
                    <span style="font-size:11px;color:rgba(255,255,255,0.3)">—</span>
                  }
                </td>
                <td>
                  @if (g.confirmed) {
                    <span class="badge badge-success">✓ Confirmado ({{ g.confirmed_count }})</span>
                  } @else {
                    <span class="badge badge-warning">Pendiente</span>
                  }
                </td>
                <td>
                  @if (g.invitation_sent) {
                    <span class="badge badge-success" style="font-size:11px">✓ Enviado</span>
                  } @else {
                    <span style="font-size:11px;color:rgba(255,255,255,0.3)">—</span>
                  }
                </td>
                <td>
                  <div class="action-menu-wrapper">
                    <button class="btn btn-secondary btn-sm btn-icon" (click)="toggleMenu(g.id); $event.stopPropagation()" title="Acciones"><span class="material-icons" style="font-size:18px">more_vert</span></button>
                    @if (openMenuId === g.id) {
                      <div class="action-dropdown" (click)="$event.stopPropagation()">
                        <button class="dropdown-item" (click)="shareGuest(g); closeMenu()"><span class="material-icons">share</span>Compartir</button>
                        <button class="dropdown-item" (click)="showQR(g); closeMenu()"><span class="material-icons">qr_code</span>Ver QR</button>
                        <button class="dropdown-item" (click)="editGuest(g); closeMenu()"><span class="material-icons">edit</span>Editar</button>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item danger" (click)="deleteGuest(g); closeMenu()"><span class="material-icons">delete</span>Eliminar</button>
                      </div>
                    }
                  </div>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="7" class="text-center text-muted" style="padding:40px">No hay invitados. Importa desde Excel o agrega manualmente.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="guest-cards">
        @for (g of filtered(); track g.id) {
          <div class="guest-card">
            <div class="guest-card-header">
              <span class="guest-card-name">
                @if (g.family_name) { {{ g.family_name }} } @else { {{ g.guest_names }} }
              </span>
              <span class="badge" [class.badge-info]="g.guest_type==='family'" [class.badge-warning]="g.guest_type==='individual'">{{ g.guest_type === 'family' ? 'Familia' : 'Individual' }}</span>
            </div>
            <div class="guest-card-body">
              <span class="guest-card-label">Código</span>
              <span class="guest-card-value"><code style="color:var(--gold);font-size:12px">{{ g.unique_code }}</code></span>
              @if (g.family_name) {
                <span class="guest-card-label">Invitados</span>
                <span class="guest-card-value">{{ g.guest_names }}</span>
              }
              <span class="guest-card-label">Total</span>
              <span class="guest-card-value">{{ guestCount(g) }} persona{{ guestCount(g) > 1 ? 's' : '' }}</span>
              @if (g.guest_type === 'individual' && g.max_companions > 0) {
                <span class="guest-card-label">Acompañantes</span>
                <span class="guest-card-value">{{ g.max_companions }}</span>
              }
              <span class="guest-card-label">Estado</span>
              <span class="guest-card-value">
                @if (g.confirmed) {
                  <span class="badge badge-success">✓ Confirmado ({{ g.confirmed_count }})</span>
                } @else {
                  <span class="badge badge-warning">Pendiente</span>
                }
              </span>
            </div>
            <div class="guest-card-actions">
              <button class="btn btn-secondary btn-sm btn-icon" (click)="shareGuest(g)" title="Compartir"><span class="material-icons" style="font-size:16px">share</span></button>
              <button class="btn btn-secondary btn-sm btn-icon" (click)="showQR(g)" title="QR"><span class="material-icons" style="font-size:16px">qr_code</span></button>
              <button class="btn btn-secondary btn-sm btn-icon" (click)="editGuest(g)" title="Editar"><span class="material-icons" style="font-size:16px">edit</span></button>
              <button class="btn btn-danger btn-sm btn-icon" (click)="deleteGuest(g)" title="Eliminar"><span class="material-icons" style="font-size:16px">delete</span></button>
            </div>
          </div>
        }
        @empty {
          <div class="card" style="padding:40px;text-align:center">
            <p class="text-muted">No hay invitados. Importa desde Excel o agrega manualmente.</p>
          </div>
        }
      </div>
    </div>

    <!-- Guest Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editing ? 'Editar Invitado' : 'Nuevo Invitado' }}</h3>
            <button class="btn btn-icon btn-secondary" (click)="closeModal()"><span class="material-icons">close</span></button>
          </div>
          <div class="form-group">
            <label>Tipo de Invitado</label>
            <select [(ngModel)]="form.guest_type">
              <option value="individual">Individual</option>
              <option value="family">Familia</option>
            </select>
          </div>
          @if (form.guest_type === 'family') {
            <div class="form-group">
              <label>Nombre de Familia</label>
              <input type="text" [(ngModel)]="form.family_name" placeholder="Familia García">
            </div>
          }
          <div class="form-group">
            <label>{{ form.guest_type === 'family' ? 'Nombres (separados por coma)' : 'Nombre del Invitado' }} *</label>
            <input type="text" [(ngModel)]="form.guest_names" [placeholder]="form.guest_type === 'family' ? 'Juan García, María García, Pedro García' : 'Juan Pérez'">
          </div>
          @if (form.guest_type === 'individual') {
            <div class="form-group">
              <label>Acompañantes permitidos</label>
              <input type="number" [(ngModel)]="form.max_companions" min="0" max="10">
            </div>
          }
          <div class="form-group">
            <label>Notas</label>
            <textarea [(ngModel)]="form.notes" placeholder="Mesa VIP, restricciones alimentarias..."></textarea>
          </div>
          <div class="form-group">
            <label>Teléfono (WhatsApp)</label>
            <input type="tel" [(ngModel)]="form.phone" placeholder="521XXXXXXXXXX (con lada, sin +)">
            <small style="color:rgba(255,255,255,0.4);font-size:11px;display:block;margin-top:4px;">Formato: código de país + número. Ej: 521234567890 (MX)</small>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="saving()">{{ saving() ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </div>
      </div>
    }

    <!-- QR Modal -->
    @if (qrData()) {
      <div class="modal-overlay" (click)="qrData.set(null)">
        <div class="modal" style="max-width:360px;text-align:center" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Código QR</h3>
            <button class="btn btn-icon btn-secondary" (click)="qrData.set(null)"><span class="material-icons">close</span></button>
          </div>
          <img [src]="qrData()!.qr" style="width:200px;height:200px;border-radius:8px;margin:16px auto;display:block">
          <p style="font-size:12px;color:rgba(255,255,255,0.5);word-break:break-all;margin-bottom:16px">{{ qrData()!.url }}</p>
          <a [href]="qrData()!.qr" download="qr.png" class="btn btn-primary btn-sm">
            <span class="material-icons">download</span> Descargar QR
          </a>
        </div>
      </div>
    }
  `
})
export class GuestsComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  eventId = 0;
  eventSlug = '';
  eventName = '';
  openMenuId: number | null = null;
  private menuListener: any = null;
  guests = signal<Guest[]>([]);
  filtered = signal<Guest[]>([]);
  showModal = signal(false);
  saving = signal(false);
  qrData = signal<{ qr: string; url: string } | null>(null);
  editing = false; editId = 0; search = '';
  form: any = { guest_type: 'individual', family_name: '', guest_names: '', max_companions: 0, phone: '', notes: '' };

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    this.api.getEvent(this.eventId).subscribe(e => { this.eventSlug = e.slug; this.eventName = e.name; });
    this.load();
    this.menuListener = () => { this.openMenuId = null; };
    document.addEventListener('click', this.menuListener);
  }

  ngOnDestroy() { if (this.menuListener) document.removeEventListener('click', this.menuListener); }
  toggleMenu(id: number) { this.openMenuId = this.openMenuId === id ? null : id; }
  closeMenu() { this.openMenuId = null; }

  load() {
    this.api.getGuests(this.eventId).subscribe(g => { this.guests.set(g); this.filterGuests(); });
  }

  filterGuests() {
    const s = this.search.toLowerCase();
    this.filtered.set(s ? this.guests().filter(g =>
      g.guest_names.toLowerCase().includes(s) ||
      (g.family_name || '').toLowerCase().includes(s) ||
      g.unique_code.toLowerCase().includes(s)
    ) : this.guests());
  }

  guestCount(g: Guest) {
    return g.guest_type === 'family' ? g.guest_names.split(',').length : g.max_companions + 1;
  }

  openModal() { this.editing = false; this.form = { guest_type: 'individual', family_name: '', guest_names: '', max_companions: 0, phone: '', notes: '' }; this.showModal.set(true); }
  closeModal() { this.showModal.set(false); }

  editGuest(g: Guest) {
    this.editing = true; this.editId = g.id;
    this.form = { guest_type: g.guest_type, family_name: g.family_name, guest_names: g.guest_names, max_companions: g.max_companions, phone: g.phone || '', notes: g.notes };
    this.showModal.set(true);
  }

  save() {
    if (!this.form.guest_names) return;
    this.saving.set(true);
    const data = { ...this.form, event_id: this.eventId };
    const obs = this.editing ? this.api.updateGuest(this.editId, data) : this.api.createGuest(data);
    obs.subscribe({ next: () => { this.load(); this.closeModal(); this.saving.set(false); }, error: () => this.saving.set(false) });
  }

  async deleteGuest(g: Guest) {
    const ok = await this.dialog.confirm('Eliminar invitado', '¿Eliminar este invitado?');
    if (!ok) return;
    this.api.deleteGuest(g.id).subscribe(() => this.load());
  }

  landingUrl(g: Guest) {
    const origin = environment.production ? window.location.origin : 'http://localhost';
    return `${origin}${environment.baseUrl}/invitacion/${this.eventSlug}?t=${g.unique_code}`;
  }

  showQR(g: Guest) { this.api.getGuestQR(g.id).subscribe(d => this.qrData.set(d)); }

  importExcel(e: any) {
    const file = e.target.files[0]; if (!file) return;
    this.api.importGuests(this.eventId, file).subscribe({
      next: (r) => { this.dialog.success('Importación exitosa', `${r.imported} invitados importados`); this.load(); e.target.value = ''; },
      error: () => this.dialog.alert('Error', 'Error al importar el archivo')
    });
  }

  exportExcel() {
    this.api.exportGuests(this.eventId).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'invitados.xlsx'; a.click();
    });
  }

  downloadTemplate() {
    this.api.downloadTemplate().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'plantilla_invitados.xlsx'; a.click();
    });
  }

  // === Share functionality ===
  private isMobile(): boolean {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  }

  guestsWithPhone(): Guest[] {
    return this.guests().filter(g => g.phone && !g.invitation_sent);
  }

  private buildMessage(g: Guest): string {
    const name = g.family_name || g.guest_names.split(',')[0].trim();
    const link = this.landingUrl(g);
    // Default message template
    let msg = `¡Hola ${name}! 🎉\nEstás cordialmente invitado(a) a nuestro evento.\nAquí tu invitación personal:\n${link}\n\n¡Te esperamos! 💕`;
    return msg;
  }

  shareGuest(g: Guest) {
    const url = this.landingUrl(g);
    if (this.isMobile() && g.phone) {
      // Open WhatsApp with pre-filled message
      const msg = encodeURIComponent(this.buildMessage(g));
      window.open(`https://wa.me/${g.phone}?text=${msg}`, '_blank');
      // Mark as sent
      this.api.markGuestSent(g.id).subscribe(() => {
        g.invitation_sent = 1;
        g.sent_at = new Date().toISOString();
      });
    } else if (this.isMobile() && !g.phone) {
      // Mobile without phone — use native share API or copy
      if (navigator.share) {
        navigator.share({ title: 'Invitación', text: this.buildMessage(g), url }).then(() => {
          this.api.markGuestSent(g.id).subscribe(() => { g.invitation_sent = 1; });
        }).catch(() => {});
      } else {
        this.copyToClipboard(url);
      }
    } else {
      // Desktop — copy link
      this.copyToClipboard(url);
    }
  }

  async shareAll() {
    const pending = this.guestsWithPhone();
    if (!pending.length) return;
    const ok = await this.dialog.confirm(
      'Enviar invitaciones',
      `Se abrirá WhatsApp para ${pending.length} invitado(s) con teléfono. En mobile se abrirá uno por uno. ¿Continuar?`
    );
    if (!ok) return;

    if (this.isMobile()) {
      // Open WhatsApp sequentially with short delay
      for (let i = 0; i < pending.length; i++) {
        const g = pending[i];
        const msg = encodeURIComponent(this.buildMessage(g));
        setTimeout(() => {
          window.open(`https://wa.me/${g.phone}?text=${msg}`, '_blank');
        }, i * 1500);
      }
      // Mark all as sent
      const ids = pending.map(g => g.id);
      this.api.bulkMarkSent(this.eventId, ids).subscribe(() => {
        pending.forEach(g => { g.invitation_sent = 1; g.sent_at = new Date().toISOString(); });
      });
    } else {
      // Desktop: copy all links as list
      const links = pending.map(g => {
        const name = g.family_name || g.guest_names.split(',')[0].trim();
        return `${name}: ${this.landingUrl(g)}`;
      }).join('\n');
      this.copyToClipboard(links);
      this.dialog.success('Links copiados', `${pending.length} links copiados al portapapeles. Pégalos manualmente en WhatsApp Web.`);
      // Mark as sent
      const ids = pending.map(g => g.id);
      this.api.bulkMarkSent(this.eventId, ids).subscribe(() => {
        pending.forEach(g => { g.invitation_sent = 1; g.sent_at = new Date().toISOString(); });
      });
    }
  }

  private copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.dialog.success('Copiado', 'Link copiado al portapapeles');
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.dialog.success('Copiado', 'Link copiado al portapapeles');
    });
  }
}
