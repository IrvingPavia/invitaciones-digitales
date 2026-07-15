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
    path: 'registro',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verificar/:token',
    loadComponent: () => import('./pages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
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
      { path: 'builder/:eventId', loadComponent: () => import('./dashboard/pages/builder/builder.component').then(m => m.BuilderComponent), canDeactivate: [unsavedChangesGuard] },
      { path: 'cards/:eventId', loadComponent: () => import('./dashboard/pages/cards/cards.component').then(m => m.CardsComponent), canDeactivate: [unsavedChangesGuard] },
      { path: 'users', loadComponent: () => import('./dashboard/pages/users/users.component').then(m => m.UsersComponent) },
      { path: 'suggestions', loadComponent: () => import('./dashboard/pages/suggestions/suggestions.component').then(m => m.SuggestionsComponent) },
      { path: 'perfil', loadComponent: () => import('./dashboard/pages/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'mis-eventos', loadComponent: () => import('./dashboard/pages/my-events/my-events.component').then(m => m.MyEventsComponent) },
      { path: 'paquetes', loadComponent: () => import('./dashboard/pages/plans-catalog/plans-catalog.component').then(m => m.PlansCatalogComponent) },
      { path: 'checkout', loadComponent: () => import('./dashboard/pages/checkout/checkout.component').then(m => m.CheckoutComponent) },
      { path: 'admin/compras', loadComponent: () => import('./dashboard/pages/admin/purchases-admin/purchases-admin.component').then(m => m.PurchasesAdminComponent) },
      { path: 'admin/metricas', loadComponent: () => import('./dashboard/pages/admin/metrics/metrics.component').then(m => m.MetricsComponent) },
      { path: 'admin/eventos-expirados', loadComponent: () => import('./dashboard/pages/admin/expired-events/expired-events.component').then(m => m.ExpiredEventsComponent) },
      { path: 'admin/paquetes', loadComponent: () => import('./dashboard/pages/admin/plans-admin/plans-admin.component').then(m => m.PlansAdminComponent) }
    ]
  },
  {
    path: 'paquetes',
    loadComponent: () => import('./pages/pricing-public/pricing-public.component').then(m => m.PricingPublicComponent)
  },
  {
    path: 'invitacion/:slug',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
