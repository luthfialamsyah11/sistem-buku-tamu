import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, roomGuard } from './core/guards';

export const routes: Routes = [
  { path: '', redirectTo: 'tabs/beranda', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
  },
  {
    path: 'tabs/:tab',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'ruangan',
    canActivate: [authGuard, roomGuard],
    loadComponent: () => import('./pages/rooms/rooms.page').then((m) => m.RoomsPage),
  },
  {
    path: 'pengguna',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/users/users.page').then((m) => m.UsersPage),
  },
  {
    path: 'it-support',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./pages/it-support/it-support.page').then((m) => m.ItSupportPage),
  },
  { path: '**', redirectTo: 'tabs/beranda' },
];
