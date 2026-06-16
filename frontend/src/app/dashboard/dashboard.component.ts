import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-layout">
      <!-- Mobile overlay -->
      @if (mobileOpen()) {
        <div class="sidebar-overlay" (click)="mobileOpen.set(false)"></div>
      }

      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="collapsed()" [class.mobile-open]="mobileOpen()">
        <div class="sidebar-logo">
          @if (!collapsed()) { <img src="assets/icons/vitely-logo.png" class="logo-text-img" alt="Vitely"> }
          @else { <img src="assets/icons/vitely-favicon.ico" class="logo-icon-img" alt="V"> }
        </div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="closeMobile()">
            <span class="material-icons">dashboard</span>
            @if (!collapsed()) { <span>Dashboard</span> }
          </a>
          @if (user?.role !== 'client') {
            <a routerLink="/dashboard/events" routerLinkActive="active" (click)="closeMobile()">
              <span class="material-icons">event</span>
              @if (!collapsed()) { <span>Eventos</span> }
            </a>
          }
          @if (user?.role === 'client' && clientEventId) {
            <a [routerLink]="['/dashboard/guests', clientEventId]" routerLinkActive="active" (click)="closeMobile()">
              <span class="material-icons">people</span>
              @if (!collapsed()) { <span>Invitados</span> }
            </a>
            <a [routerLink]="['/dashboard/config', clientEventId]" routerLinkActive="active" (click)="closeMobile()">
              <span class="material-icons">settings</span>
              @if (!collapsed()) { <span>Configurar</span> }
            </a>
            <a [routerLink]="['/dashboard/cards', clientEventId]" routerLinkActive="active" (click)="closeMobile()">
              <span class="material-icons">style</span>
              @if (!collapsed()) { <span>Tarjetas</span> }
            </a>
          }
          @if (user?.role === 'root' || user?.can_manage_users) {
            <a routerLink="/dashboard/users" routerLinkActive="active" (click)="closeMobile()">
              <span class="material-icons">people</span>
              @if (!collapsed()) { <span>Usuarios</span> }
            </a>
          }
          <a routerLink="/dashboard/suggestions" routerLinkActive="active" (click)="closeMobile()">
            <span class="material-icons">lightbulb</span>
            @if (!collapsed()) { <span>Sugerencias</span> }
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <span class="material-icons" style="color:var(--gold)">account_circle</span>
            @if (!collapsed()) { <span>{{ user?.username }}</span> }
          </div>
          <button class="btn btn-secondary btn-sm" style="justify-content:center;" (click)="toggleTheme()">
            <span class="material-icons">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</span>
            @if (!collapsed()) { <span>{{ isDarkMode ? 'Modo claro' : 'Modo oscuro' }}</span> }
          </button>
          <button class="btn btn-secondary btn-sm" (click)="logout()">
            <span class="material-icons">logout</span>
            @if (!collapsed()) { <span>Salir</span> }
          </button>
        </div>

        <!-- Collapse/expand toggle arrow -->
        <button class="sidebar-toggle" (click)="collapsed.set(!collapsed())">
          <span class="material-icons">{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</span>
        </button>
      </aside>

      <!-- Main -->
      <div class="main-content" [class.expanded]="collapsed()">
        <div class="page-content">
          <!-- Mobile menu button -->
          <button class="mobile-menu-btn" (click)="mobileOpen.set(true)">
            <span class="material-icons">chevron_right</span>
          </button>
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .logo-icon-img {
      width: 32px; height: 32px; object-fit: contain; flex-shrink: 0;
    }
    .logo-text-img {
      height: 32px; object-fit: contain;
    }
    .sidebar-footer {
      padding: 16px; padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      border-top: 1px solid rgba(124,92,191,0.2);
      display: flex; flex-direction: column; gap: 12px;
    }
    .sidebar-user {
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; color: rgba(255,255,255,0.7);
    }
    .sidebar-overlay {
      display: none;
      position: fixed; inset: 0; z-index: 99;
      background: rgba(0,0,0,0.6);
    }
    .sidebar-toggle {
      position: absolute; top: 50%; right: 8px;
      transform: translateY(-50%);
      width: 28px; height: 40px;
      background: rgba(124, 92, 191, 0.1);
      border: 1px solid rgba(124, 92, 191, 0.25);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--gold-light); transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { background: rgba(124, 92, 191, 0.2); border-color: rgba(139, 92, 246, 0.5); box-shadow: 0 0 8px rgba(139, 92, 246, 0.2); }
    }
    .mobile-menu-btn {
      display: none;
      position: fixed; top: 50%; left: 0; z-index: 50;
      transform: translateY(-50%);
      width: 24px; height: 56px;
      background: linear-gradient(180deg, #1a1a2a, #12121a);
      border: 1px solid rgba(124,92,191,0.3);
      border-left: none;
      border-radius: 0 8px 8px 0;
      align-items: center; justify-content: center;
      cursor: pointer; color: var(--gold);
      .material-icons { font-size: 18px; }
    }

    @media (max-width: 768px) {
      .sidebar-overlay { display: block; }
      .sidebar-toggle { display: none; }
      .mobile-menu-btn { display: flex; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  collapsed = signal(false);
  mobileOpen = signal(false);
  user = this.auth.getUser();
  clientEventId: number | null = null;
  isDarkMode = true;

  ngOnInit() {
    // Load theme preference
    const saved = localStorage.getItem('vitely-theme');
    this.isDarkMode = saved !== 'light';
    this.applyTheme();

    // For client users with a single event, load their event ID for direct sidebar links
    if (this.user?.role === 'client') {
      this.api.getEvents().subscribe(events => {
        if (events.length === 1) {
          this.clientEventId = events[0].id;
        }
      });
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('vitely-theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }

  closeMobile() { this.mobileOpen.set(false); }
  logout() { this.auth.logout(); }
}
