import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
    id: string;
    username: string;
    role: string;
}

interface LoginAttemptState {
    count: number;
    lockedUntil: number | null;
    lastAttempt: number;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 min
const ATTEMPT_RESET_MS = 30 * 60 * 1000; // 30 min

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly router = inject(Router);

    // Token stored in memory only — avoids XSS via localStorage/sessionStorage
    private readonly _token = signal<string | null>(null);
    private readonly _user = signal<AuthUser | null>(null);
    private readonly _attemptState = signal<LoginAttemptState>({
        count: 0,
        lockedUntil: null,
        lastAttempt: 0,
    });

    readonly isAuthenticated = computed(() => this._token() !== null);
    readonly currentUser = computed(() => this._user());

    readonly isLocked = computed(() => {
        const state = this._attemptState();
        return state.lockedUntil !== null && Date.now() < state.lockedUntil;
    });

    readonly lockoutRemainingMs = computed(() => {
        const state = this._attemptState();
        if (state.lockedUntil === null) return 0;
        return Math.max(0, state.lockedUntil - Date.now());
    });

    readonly remainingAttempts = computed(() =>
        Math.max(0, MAX_LOGIN_ATTEMPTS - this._attemptState().count),
    );

    async login(
        username: string,
        password: string,
    ): Promise<{ success: boolean; error?: string }> {
        if (this.isLocked()) {
            const remaining = Math.ceil(this.lockoutRemainingMs() / 60_000);
            return {
                success: false,
                error: `Cuenta bloqueada. Intenta de nuevo en ${remaining} minuto(s).`,
            };
        }

        // Reset counter if the reset window has elapsed
        const state = this._attemptState();
        if (state.lastAttempt > 0 && Date.now() - state.lastAttempt > ATTEMPT_RESET_MS) {
            this._attemptState.set({ count: 0, lockedUntil: null, lastAttempt: 0 });
        }

        try {
            const result = await this.authenticateWithServer(username, password);

            if (result.success && result.token && result.user) {
                this._token.set(result.token);
                this._user.set(result.user);
                this._attemptState.set({ count: 0, lockedUntil: null, lastAttempt: 0 });
                return { success: true };
            }

            this.recordFailedAttempt();
            return { success: false, error: 'Credenciales inválidas.' };
        } catch {
            this.recordFailedAttempt();
            return { success: false, error: 'Servicio de autenticación no disponible.' };
        }
    }

    logout(): void {
        this._token.set(null);
        this._user.set(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return this._token();
    }

    private recordFailedAttempt(): void {
        this._attemptState.update((state) => {
            const newCount = state.count + 1;
            const lockedUntil =
                newCount >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null;
            return { count: newCount, lockedUntil, lastAttempt: Date.now() };
        });
    }

    /**
     * Simulated server authentication.
     * Replace with a real HttpClient POST to your backend over HTTPS.
     * In production: the server validates credentials, issues a signed JWT,
     * and optionally sets a httpOnly refresh-token cookie.
     */
    private async authenticateWithServer(
        username: string,
        password: string,
    ): Promise<{ success: boolean; token?: string; user?: AuthUser }> {
        // Randomised delay mitigates timing-based username enumeration
        await new Promise((resolve) =>
            setTimeout(resolve, 600 + Math.random() * 400),
        );

        // DEMO ONLY — replace with real API call
        if (username === 'admin@gmail.com' && password === 'Admin@1234') {
            return {
                success: true,
                token: this.buildDemoToken('1'),
                user: { id: '1', username: 'admin', role: 'admin' },
            };
        }

        return { success: false };
    }

    /** DEMO ONLY — JWT issuing is always the server's responsibility in production */
    private buildDemoToken(userId: string): string {
        const now = Math.floor(Date.now() / 1000);
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(
            JSON.stringify({ sub: userId, iat: now, exp: now + 3600 }),
        );
        return `${header}.${payload}.DEMO_SIGNATURE_NOT_FOR_PRODUCTION`;
    }
}
