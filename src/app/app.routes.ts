import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './auth/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then((m) => m.Login),
        canActivate: [publicOnlyGuard],
        title: 'Iniciar sesión — DeutschApp',
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./dashboard/dashboard').then((m) => m.Dashboard),
        canActivate: [authGuard],
        title: 'Dashboard — DeutschApp',
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];
