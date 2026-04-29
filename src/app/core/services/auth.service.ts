import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthUser, LoginResponse } from '../dto/auth/login-res.dto';
import { Observable } from 'rxjs';
import { RegisterResponse } from '../dto/auth/register-res.dto';



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
    private readonly http = inject(HttpClient);

    private readonly url = environment.apiUrl;

    private static readonly TOKEN_KEY = 'auth_token';
    private static readonly USER_KEY = 'auth_user';

    private readonly _token = signal<string | null>(localStorage.getItem(AuthService.TOKEN_KEY));
    private readonly _user = signal<AuthUser | null>(
        JSON.parse(localStorage.getItem(AuthService.USER_KEY) ?? 'null'),
    );
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

    login(
        email: string,
        password: string,
    ): Observable<{ success: boolean; error?: string }> {
        return new Observable<{ success: boolean; error?: string }>((observer) => {

            if (this.isLocked()) {
                const remaining = Math.ceil(this.lockoutRemainingMs() / 60_000);
                observer.next({
                    success: false,
                    error: `Cuenta bloqueada. Intenta de nuevo en ${remaining} minuto(s).`,
                });
                observer.complete();
                return;
            }

            // Reset counter if the reset window has elapsed
            const state = this._attemptState();
            if (state.lastAttempt > 0 && Date.now() - state.lastAttempt > ATTEMPT_RESET_MS) {
                this._attemptState.set({ count: 0, lockedUntil: null, lastAttempt: 0 });
            }


            try {
                this.authenticateWithServer(email, password).subscribe({
                    next: (result: LoginResponse) => {
                        if (result.success && result.token && result.user) {
                            localStorage.setItem(AuthService.TOKEN_KEY, result.token);
                            localStorage.setItem(AuthService.USER_KEY, JSON.stringify(result.user));
                            this._token.set(result.token);
                            this._user.set(result.user);
                            this._attemptState.set({ count: 0, lockedUntil: null, lastAttempt: 0 });
                            observer.next({ success: true });
                        } else {
                            this.recordFailedAttempt();
                            observer.next({ success: false, error: 'Credenciales inválidas.' });
                        }
                        observer.complete();
                    },
                    error: () => {
                        this.recordFailedAttempt();
                        observer.next({ success: false, error: 'Servicio de autenticación no disponible.' });
                        observer.complete();
                    }
                });
            } catch {
                this.recordFailedAttempt();
                observer.next({ success: false, error: 'Servicio de autenticación no disponible.' });
                observer.complete();
            }
        });
    }

    logout(): void {
        localStorage.removeItem(AuthService.TOKEN_KEY);
        localStorage.removeItem(AuthService.USER_KEY);
        this._token.set(null);
        this._user.set(null);
        this.router.navigate(['/login']);
    }

    /**
     * DEMO stub — replace with a real HttpClient POST to your backend.
     * The server should hash the password (bcrypt/argon2) and return a success/error.
     */
    register(
        name: string,
        email: string,
        password: string,
    ): Observable<RegisterResponse> {
        // Randomised delay mitigates timing-based enumeration
        // await new Promise((resolve) =>
        //     setTimeout(resolve, 600 + Math.random() * 400),
        // );
        // DEMO ONLY — replace with real API call
        if (name && email && password) {
            return this.http.post<RegisterResponse>(`${this.url}/auth/register`, { name, email, password });
        }
        return new Observable<RegisterResponse>((observer) => {
            observer.next({ success: false, error: 'No se pudo crear la cuenta.' });
            observer.complete();
        });
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
    private authenticateWithServer(
        email: string,
        password: string,
    ): Observable<LoginResponse> {
        // Randomised delay mitigates timing-based username enumeration
        // await new Promise((resolve) =>
        //     setTimeout(resolve, 600 + Math.random() * 400),
        // );
        return this.http.post<LoginResponse>(`${this.url}/auth/login`, { email, password });
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
