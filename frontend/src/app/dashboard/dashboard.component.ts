import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

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
          <span class="material-icons logo-icon">auto_awesome</span>
          @if (!collapsed()) { <span class="logo-text">Invitaciones</span> }
        </div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="closeMobile()">
            <span class="material-icons">dashboard</span>
            @if (!collapsed()) { <span>Dashboard</span> }
          </a>
          <a routerLink="/dashboard/events" routerLinkActive="active" (click)="closeMobile()">
            <span class="material-icons">event</span>
            @if (!collapsed()) { <span>Eventos</span> }
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <span class="material-icons" style="color:var(--gold)">account_circle</span>
            @if (!collapsed()) { <span>{{ user?.username }}</span> }
          </div>
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
    .sidebar-footer {
      padding: 16px; border-top: 1px solid rgba(212,160,23,0.2);
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
      position: absolute; top: 50%; right: -14px;
      transform: translateY(-50%);
      width: 28px; height: 48px;
      background: linear-gradient(180deg, #1a1a2e, #16213e);
      border: 1px solid rgba(212,160,23,0.3);
      border-left: none;
      border-radius: 0 8px 8px 0;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--gold); transition: all 0.2s;
      .material-icons { font-size: 18px; }
      &:hover { background: rgba(212,160,23,0.15); }
    }
    .mobile-menu-btn {
      display: none;
      position: fixed; top: 50%; left: 0; z-index: 50;
      transform: translateY(-50%);
      width: 24px; height: 56px;
      background: linear-gradient(180deg, #1a1a2e, #16213e);
      border: 1px solid rgba(212,160,23,0.3);
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
export class DashboardComponent {
  private auth = inject(AuthService);
  collapsed = signal(false);
  mobileOpen = signal(false);
  user = this.auth.getUser();

  closeMobile() { this.mobileOpen.set(false); }
  logout() { this.auth.logout(); }
}
