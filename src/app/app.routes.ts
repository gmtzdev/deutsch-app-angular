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
        // canActivate: [authGuard],
        title: 'Dashboard — DeutschApp',
    },
    {
        path: 'levels/:levelId',
        loadComponent: () =>
            import('./levels/level-shell/level-shell').then((m) => m.LevelShell),
        // canActivate: [authGuard],
        title: 'Nivel — DeutschApp',
        children: [
            {
                path: 'topics/:topicId/:subtopicId',
                loadComponent: () =>
                    import('./levels/topic-view/topic-view').then((m) => m.TopicView),
                title: 'Tema — DeutschApp',
            },
        ],
    },
    {
        path: 'create',
        loadComponent: () =>
            import('./notion-page/notion-page').then((m) => m.NotionPage),
        // canActivate: [authGuard],
        title: 'Nueva página — DeutschApp',
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];
