import {
    Component,
    inject,
    signal,
    computed,
    effect,
    ChangeDetectionStrategy,
    OnDestroy,
} from '@angular/core';
import {
    ReactiveFormsModule,
    FormBuilder,
    Validators,
    AbstractControl,
    ValidationErrors,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { LoginResponse } from '../../core/dto/auth/login-res.dto';
import { UserAlertComponent } from '../../components/user-alert/user-alert';
import { UserAlert } from '../../components/user-alert/UserAlert';
import { AlertTone } from '../../components/user-alert/AlertTone.enum';


@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, InputText, Password, RouterLink, UserAlertComponent],
    templateUrl: './login.html',
    styleUrl: './login.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnDestroy {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    private lockoutTimer: ReturnType<typeof setInterval> | null = null;

    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly lockoutRemaining = signal(0);

    readonly isLocked = computed(() => this.authService.isLocked());
    readonly remainingAttempts = computed(() => this.authService.remainingAttempts());
    readonly showAttemptsWarning = computed(
        () => this.remainingAttempts() < 5 && this.remainingAttempts() > 0 && !this.isLocked(),
    );

    readonly openAlert = signal(false);
    readonly userAlert = signal<UserAlert>({
        title: '',
        message: '',
        tone: AlertTone.Info,
        eyebrow: '',
        actionLabel: '',
    });

    readonly form = this.fb.nonNullable.group({
        email: [
            '',
            [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(50)],
        ],
        password: [
            '',
            [Validators.required]
        ],
    });

    constructor() {
        effect(() => {
            if (this.isLocked()) {
                this.form.disable();
                this.startLockoutTimer();
            } else if (this.form.disabled) {
                this.form.enable();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.lockoutTimer !== null) {
            clearInterval(this.lockoutTimer);
        }
    }

    async onSubmit(): Promise<void> {
        if (this.form.invalid || this.isLoading() || this.isLocked()) return;

        this.errorMessage.set(null);
        this.isLoading.set(true);

        const { email, password } = this.form.getRawValue();

        try {
            this.authService.login(email, password).subscribe({
                next: async (result: LoginResponse) => {
                    if (result.success) {
                        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
                        // Prevent open redirect: only allow same-origin relative paths
                        const safeUrl = returnUrl.startsWith('/') && !returnUrl.startsWith('//')
                            ? returnUrl : '/dashboard';
                        await this.router.navigateByUrl(safeUrl);
                    } else {
                        if (result.error === 'INVALID_CREDENTIALS') {
                            this.errorMessage.set('Correo o contraseña incorrectos.');
                        } else if (result.error === 'ACCOUNT_LOCKED') {
                            this.errorMessage.set('Cuenta bloqueada debido a múltiples intentos fallidos. Intenta de nuevo más tarde.');
                        } else if (result.error === 'USER_NOT_VERIFIED') {
                            this.errorMessage.set('Usuario no verificado. Por favor, verifica tu correo electrónico.');
                            this.userAlert.set({
                                title: 'Usuario no verificado',
                                message: 'Tu cuenta aún no ha sido verificada por un administrador. Por favor, espera a que se complete el proceso de verificación.',
                                tone: AlertTone.Warning,
                                eyebrow: 'Acceso denegado',
                                actionLabel: 'Aceptar',
                            });
                            this.openAlert.set(true);
                        } else {
                            this.errorMessage.set(result.error ?? 'Error de autenticación.');
                        }
                        // Clear password field on every failure to prevent accidental exposure
                        this.form.controls.password.reset();
                    }
                },
                error: (err) => {
                    console.error('Login error:', err);
                    this.errorMessage.set('Error de conexión. Inténtalo de nuevo más tarde.');
                    this.isLoading.set(false);
                }
            })
        } finally {
            this.isLoading.set(false);
        }
    }

    private startLockoutTimer(): void {
        if (this.lockoutTimer !== null) return;
        this.lockoutTimer = setInterval(() => {
            const remaining = this.authService.lockoutRemainingMs();
            this.lockoutRemaining.set(Math.ceil(remaining / 1000));
            if (remaining <= 0) {
                clearInterval(this.lockoutTimer!);
                this.lockoutTimer = null;
                this.errorMessage.set(null);
                this.lockoutRemaining.set(0);
            }
        }, 1_000);
    }

    onAlertAction(): void {
        if (this.userAlert().tone === AlertTone.Warning) {
            this.openAlert.set(false);
            return;
        }

        this.openAlert.set(false);
    }
}
