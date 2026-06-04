import { Routes } from '@angular/router';
import { authGuard, adminGuard, publicOnlyGuard } from './auth/auth.guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

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
        path: 'register',
        loadComponent: () => import('./auth/register/register').then((m) => m.Register),
        canActivate: [publicOnlyGuard],
        title: 'Crear cuenta — DeutschApp',
    },
    {
        path: 'admin',
        loadComponent: () => import('./admin/admin').then((m) => m.Admin),
        canActivate: [adminGuard],
        title: 'Administración — DeutschApp',
        children: [
            {
                path: '',
                loadComponent: () => import('./admin/index/index').then((m) => m.AdminIndex),
                canActivate: [adminGuard],
                title: 'Usuarios — DeutschApp',
            },
            {
                path: 'users',
                loadComponent: () => import('./admin/users/users').then((m) => m.AdminUsers),
                canActivate: [adminGuard],
                title: 'Usuarios — DeutschApp',
            },
            {
                path: 'pending-users',
                loadComponent: () => import('./admin/pending-users/pending-users').then((m) => m.AdminPendingUsers),
                canActivate: [adminGuard],
                title: 'Pendientes por verificar — DeutschApp',
            },
        ]
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./dashboard/dashboard').then((m) => m.Dashboard),
        canActivate: [authGuard],
        title: 'Dashboard — DeutschApp',
    },
    {
        path: 'levels/:levelId',
        loadComponent: () =>
            import('./levels/level-shell/level-shell').then((m) => m.LevelShell),
        canActivate: [authGuard],
        title: 'Nivel — DeutschApp',
        children: [
            {
                path: 'topics/:topicId/:subtopicId',
                loadComponent: () =>
                    import('./levels/topic-view/topic-view').then((m) => m.TopicView),
                canDeactivate: [unsavedChangesGuard],
                title: 'Tema — DeutschApp',
            },
        ],
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];
