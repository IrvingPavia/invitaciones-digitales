import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./public/landing-home.component').then(m => m.LandingHomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', loadComponent: () => import('./dashboard/pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'events', loadComponent: () => import('./dashboard/pages/events/events.component').then(m => m.EventsComponent) },
      { path: 'guests/:eventId', loadComponent: () => import('./dashboard/pages/guests/guests.component').then(m => m.GuestsComponent) },
      { path: 'registrations/:eventId', loadComponent: () => import('./dashboard/pages/registrations/registrations.component').then(m => m.RegistrationsComponent) },
      { path: 'config/:eventId', loadComponent: () => import('./dashboard/pages/config/config.component').then(m => m.ConfigComponent), canDeactivate: [unsavedChangesGuard] },
      { path: 'cards/:eventId', loadComponent: () => import('./dashboard/pages/cards/cards.component').then(m => m.CardsComponent), canDeactivate: [unsavedChangesGuard] },
      { path: 'users', loadComponent: () => import('./dashboard/pages/users/users.component').then(m => m.UsersComponent) },
      { path: 'suggestions', loadComponent: () => import('./dashboard/pages/suggestions/suggestions.component').then(m => m.SuggestionsComponent) }
    ]
  },
  {
    path: 'invitacion/:slug',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
