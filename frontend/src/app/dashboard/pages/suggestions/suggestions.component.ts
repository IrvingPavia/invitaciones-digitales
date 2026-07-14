import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { DialogService } from '../../../core/services/dialog.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div>
  <div class="flex-between mb-24">
    <div>
      <h2 class="section-title">Sugerencias</h2>
      <p class="section-subtitle">{{ isAdmin ? 'Retroalimentación de los clientes' : 'Comparte tus ideas para mejorar tu invitación' }}</p>
    </div>
  </div>

  <!-- Form to submit suggestion -->
  <div class="card mb-16">
    <h4 style="color:var(--gold-light);margin-bottom:12px;">
      <span class="material-icons" style="vertical-align:middle;margin-right:6px;">lightbulb</span>
      Nueva sugerencia
    </h4>
    <div class="form-group">
      <label>Categoría</label>
      <select [(ngModel)]="newCategory">
        <option value="general">💡 General</option>
        <option value="landing">🌐 Landing Page</option>
        <option value="tarjetas">🎨 Tarjetas</option>
        <option value="invitados">👥 Invitados</option>
      </select>
    </div>
    <div class="form-group">
      <label>¿Qué te gustaría ver o mejorar?</label>
      <textarea [(ngModel)]="newText" rows="3" placeholder="Describe tu idea o sugerencia..." style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:10px;color:white;font-size:14px;width:100%;resize:vertical;"></textarea>
    </div>
    <button class="btn btn-primary" (click)="submit()" [disabled]="sending() || !newText.trim()">
      <span class="material-icons">send</span>
      {{ sending() ? 'Enviando...' : 'Enviar sugerencia' }}
    </button>
  </div>

  <!-- Filter (admin only) -->
  @if (isAdmin) {
    <div class="flex gap-8 mb-16" style="flex-wrap:wrap;">
      <button class="btn btn-sm" [class.btn-primary]="!filterStatus" (click)="filterStatus = ''">Todas</button>
      <button class="btn btn-sm" [class.btn-info]="filterStatus === 'nueva'" [class.btn-secondary]="filterStatus !== 'nueva'" (click)="filterStatus = 'nueva'">Nuevas</button>
      <button class="btn btn-sm" [class.btn-warning]="filterStatus === 'leida'" [class.btn-secondary]="filterStatus !== 'leida'" (click)="filterStatus = 'leida'">Leídas</button>
      <button class="btn btn-sm" [class.btn-success]="filterStatus === 'implementada'" [class.btn-secondary]="filterStatus !== 'implementada'" (click)="filterStatus = 'implementada'">Implementadas</button>
      <button class="btn btn-sm" [class.btn-danger]="filterStatus === 'descartada'" [class.btn-secondary]="filterStatus !== 'descartada'" (click)="filterStatus = 'descartada'">Descartadas</button>
    </div>
  }

  <!-- Suggestions list -->
  @if (loading()) {
    <div class="card text-center" style="padding:40px"><div class="spinner" style="margin:0 auto"></div></div>
  } @else if (filtered.length === 0) {
    <div class="card text-center" style="padding:40px">
      <span class="material-icons" style="font-size:48px;color:rgba(124,92,191,0.3)">forum</span>
      <p class="text-muted" style="margin-top:12px;">No hay sugerencias {{ filterStatus ? 'con este filtro' : 'aún' }}</p>
    </div>
  } @else {
    @for (s of filtered; track s.id) {
      <div class="suggestion-card">
        <div class="suggestion-header">
          <span class="suggestion-category">{{ getCategoryLabel(s.category) }}</span>
          <span class="badge" [ngClass]="getStatusBadge(s.status)">{{ s.status }}</span>
          @if (isAdmin) {
            <span class="suggestion-user">{{ s.username }}</span>
          }
          <span class="suggestion-date">{{ s.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <p class="suggestion-text">{{ s.text }}</p>
        @if (s.admin_note) {
          <div class="suggestion-note">
            <span class="material-icons" style="font-size:14px;color:var(--gold);">reply</span>
            <span>{{ s.admin_note }}</span>
          </div>
        }
        @if (isAdmin && editingId !== s.id) {
          <div class="suggestion-actions">
            <button class="btn btn-secondary btn-sm" (click)="startEdit(s)"><span class="material-icons" style="font-size:14px">edit</span> Gestionar</button>
            <button class="btn btn-danger btn-sm" (click)="deleteSuggestion(s.id)"><span class="material-icons" style="font-size:14px">delete</span></button>
          </div>
        }
        @if (editingId === s.id) {
          <div class="suggestion-edit">
            <div class="prop-row">
              <div class="form-group" style="flex:1;">
                <label>Estado</label>
                <select [(ngModel)]="editStatus">
                  <option value="nueva">Nueva</option>
                  <option value="leida">Leída</option>
                  <option value="implementada">Implementada</option>
                  <option value="descartada">Descartada</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Nota / Respuesta</label>
              <textarea [(ngModel)]="editNote" rows="2" placeholder="Respuesta para el cliente..." style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:8px;color:white;font-size:13px;width:100%;resize:vertical;"></textarea>
            </div>
            <div class="flex gap-8">
              <button class="btn btn-primary btn-sm" (click)="saveEdit()">Guardar</button>
              <button class="btn btn-secondary btn-sm" (click)="cancelEdit()">Cancelar</button>
            </div>
          </div>
        }
      </div>
    }
  }
</div>
`,
  styles: [`.suggestion-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(124,92,191,0.15);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}
.suggestion-card:hover { border-color: rgba(124,92,191,0.3); }
.suggestion-header {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-bottom: 10px; font-size: 12px;
}
.suggestion-category { color: var(--gold-light); font-weight: 600; }
.suggestion-user { color: rgba(255,255,255,0.5); }
.suggestion-date { color: rgba(255,255,255,0.3); margin-left: auto; }
.suggestion-text { color: rgba(255,255,255,0.85); font-size: 14px; line-height: 1.5; margin-bottom: 8px; }
.suggestion-note {
  display: flex; align-items: flex-start; gap: 8px;
  background: rgba(124,92,191,0.08);
  border-left: 3px solid rgba(124,92,191,0.4);
  border-radius: 0 8px 8px 0;
  padding: 10px 12px; margin-top: 10px;
  font-size: 13px; color: rgba(255,255,255,0.7);
}
.suggestion-actions { display: flex; gap: 8px; margin-top: 10px; }
.suggestion-edit {
  margin-top: 12px; padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
}`]
})
export class SuggestionsComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(DialogService);
  private auth = inject(AuthService);
  user = this.auth.getUser();
  suggestions = signal<any[]>([]);
  loading = signal(true);
  sending = signal(false);

  // Form
  newText = '';
  newCategory = 'general';
  filterStatus = '';

  // Admin edit
  editingId: number | null = null;
  editNote = '';
  editStatus = '';

  get isAdmin() { return this.user?.role === 'root' || this.user?.role === 'admin'; }

  get filtered() {
    if (!this.filterStatus) return this.suggestions();
    return this.suggestions().filter(s => s.status === this.filterStatus);
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getSuggestions().subscribe({
      next: (data) => { this.suggestions.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  submit() {
    if (!this.newText.trim()) return;
    this.sending.set(true);
    this.api.createSuggestion({ text: this.newText, category: this.newCategory }).subscribe({
      next: () => { this.newText = ''; this.newCategory = 'general'; this.sending.set(false); this.load(); },
      error: () => this.sending.set(false)
    });
  }

  startEdit(s: any) {
    this.editingId = s.id;
    this.editNote = s.admin_note || '';
    this.editStatus = s.status;
  }

  cancelEdit() { this.editingId = null; }

  saveEdit() {
    if (this.editingId === null) return;
    this.api.updateSuggestion(this.editingId, { status: this.editStatus, admin_note: this.editNote }).subscribe(() => {
      this.editingId = null;
      this.load();
    });
  }

  async deleteSuggestion(id: number) {
    const ok = await this.dialog.confirm('Eliminar sugerencia', '¿Eliminar esta sugerencia?');
    if (!ok) return;
    this.api.deleteSuggestion(id).subscribe(() => this.load());
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = { nueva: 'badge-info', leida: 'badge-warning', implementada: 'badge-success', descartada: 'badge-danger' };
    return map[status] || 'badge-info';
  }

  getCategoryLabel(cat: string): string {
    const map: Record<string, string> = { landing: '🌐 Landing', tarjetas: '🎨 Tarjetas', invitados: '👥 Invitados', general: '💡 General' };
    return map[cat] || cat;
  }
}
