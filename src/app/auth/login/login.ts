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
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

function passwordStrengthValidator(
    control: AbstractControl,
): ValidationErrors | null {
    const value: string = control.value ?? '';
    if (!value) return null;
    const valid =
        value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[0-9]/.test(value) &&
        /[!@#$%^&*()\-_=+[\]{};':",.<>/?\\|`~]/.test(value);
    return valid ? null : { weakPassword: true };
}

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, InputText, Password, Button, Card],
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

    readonly form = this.fb.nonNullable.group({
        email: [
            '',
            [Validators.required, Validators.email, Validators.minLength(3), Validators.maxLength(50)],
        ],
        password: [
            '',
            [Validators.required, Validators.minLength(8), passwordStrengthValidator],
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
            const result = await this.authService.login(email, password);

            if (result.success) {
                const returnUrl =
                    this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
                // Prevent open redirect: only allow same-origin relative paths
                const safeUrl =
                    returnUrl.startsWith('/') && !returnUrl.startsWith('//')
                        ? returnUrl
                        : '/dashboard';
                await this.router.navigateByUrl(safeUrl);
            } else {
                this.errorMessage.set(result.error ?? 'Error de autenticación.');
                // Clear password field on every failure to prevent accidental exposure
                this.form.controls.password.reset();
            }
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
}
