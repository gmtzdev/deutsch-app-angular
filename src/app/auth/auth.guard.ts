import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Protects routes that require authentication.
 * Unauthenticated users are redirected to /login with the original URL
 * preserved in the `returnUrl` query param for post-login redirect.
 */
export const authGuard: CanActivateFn = (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated()) return true;

    return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
    });
};

/**
 * Prevents already-authenticated users from reaching public-only routes
 * such as the login page. Redirects to /dashboard instead.
 */
export const publicOnlyGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) return true;

    return router.createUrlTree(['/dashboard']);
};
