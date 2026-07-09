import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
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
          @if (!collapsed()) {
            <img src="assets/icons/vitely-logo.png" class="logo-text-img" alt="Vitely">
            <button class="sidebar-collapse-btn" (click)="collapsed.set(true)" title="Contraer menú">
              <span class="material-icons">chevron_left</span>
            </button>
          } @else {
            <img src="assets/icons/vitely-favicon.ico" class="logo-icon-img" alt="V" (click)="collapsed.set(false)" style="cursor:pointer;" title="Expandir menú">
          }
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
      </aside>

      <!-- Main -->
      <div class="main-content" [class.expanded]="collapsed()">
        <!-- Top Bar -->
        <div class="topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn-inline" (click)="mobileOpen.set(true)">
              <span class="material-icons">menu</span>
            </button>
          </div>
          <div class="topbar-right">
            <button class="topbar-theme-btn" (click)="toggleTheme()" title="Cambiar tema">
              <span class="material-icons">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</span>
            </button>
            <div class="topbar-user" (click)="userMenuOpen.set(!userMenuOpen())">
              <span class="topbar-user-name">{{ user?.username }}</span>
              <div class="topbar-avatar">
                <span class="material-icons">person</span>
              </div>
              @if (userMenuOpen()) {
                <div class="topbar-user-menu">
                  <button (click)="logout()">
                    <span class="material-icons">logout</span>
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
        <div class="page-content">
          <!-- Mobile menu button (left edge) -->
          <button class="mobile-menu-btn" (click)="mobileOpen.set(true)">
            <span class="material-icons">chevron_right</span>
          </button>
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Top Bar */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      border-bottom: 1px solid rgba(124, 92, 191, 0.08);
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(10, 10, 20, 0.6);
      backdrop-filter: blur(12px);
      border-radius: 20px 20px 0 0;
    }
    .topbar-left { display: flex; align-items: center; gap: 12px; }
    .topbar-right { display: flex; align-items: center; gap: 16px; }
    .topbar-theme-btn {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 10px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      cursor: pointer; color: rgba(255,255,255,0.7); transition: all 0.2s;
      .material-icons { font-size: 18px; }
      &:hover { background: rgba(124, 92, 191, 0.15); color: #c084fc; border-color: rgba(139, 92, 246, 0.3); }
    }
    .topbar-user {
      display: flex; align-items: center; gap: 10px;
      padding: 4px 4px 4px 14px;
      border-radius: 24px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
      &:hover { border-color: rgba(139, 92, 246, 0.3); }
    }
    .topbar-user-name {
      font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.8);
    }
    .topbar-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      display: flex; align-items: center; justify-content: center;
      .material-icons { font-size: 18px; color: white; }
    }
    .topbar-user-menu {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: rgba(12, 12, 24, 0.95);
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: 12px;
      padding: 6px;
      min-width: 160px;
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 12px rgba(139, 92, 246, 0.1);
      animation: modalIn 0.2s ease;
      z-index: 100;
      button {
        display: flex; align-items: center; gap: 10px;
        width: 100%; padding: 10px 14px;
        background: none; border: none; border-radius: 8px;
        color: rgba(255,255,255,0.8); font-size: 13px;
        cursor: pointer; transition: all 0.2s;
        .material-icons { font-size: 18px; color: rgba(255,255,255,0.5); }
        &:hover { background: rgba(139, 92, 246, 0.12); color: white; .material-icons { color: #c084fc; } }
      }
    }
    .mobile-menu-btn-inline {
      display: none;
      align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 10px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      cursor: pointer; color: rgba(255,255,255,0.7);
      .material-icons { font-size: 20px; }
    }
    @media (max-width: 768px) {
      .mobile-menu-btn-inline { display: flex; }
    }

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
      display: none;
    }
    .sidebar-collapse-btn {
      margin-left: auto;
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 8px;
      background: rgba(124, 92, 191, 0.1); border: 1px solid rgba(124, 92, 191, 0.2);
      cursor: pointer; color: rgba(255,255,255,0.5); transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { background: rgba(124, 92, 191, 0.2); color: #c084fc; border-color: rgba(139, 92, 246, 0.4); }
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
  userMenuOpen = signal(false);
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

    // Animated transition with clip-path circle
    const btn = document.querySelector('.topbar-theme-btn') as HTMLElement;
    if (btn && (document as any).startViewTransition) {
      const rect = btn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      const transition = (document as any).startViewTransition(() => {
        this.applyTheme();
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
          { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
        );
      });
    } else {
      this.applyTheme();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.topbar-user')) {
      this.userMenuOpen.set(false);
    }
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
