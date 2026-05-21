import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'tickets',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tickets/ticket-list/ticket-list.component').then(m => m.TicketListComponent)
  },
  {
    path: 'tickets/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tickets/ticket-form/ticket-form.component').then(m => m.TicketFormComponent)
  },
  {
    path: 'tickets/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent)
  },
  {
    path: 'tickets/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tickets/ticket-form/ticket-form.component').then(m => m.TicketFormComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
