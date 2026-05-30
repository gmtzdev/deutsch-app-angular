import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { AuthService } from '../../core/services/auth.service';
import { RegisterResponse } from '../../core/dto/auth/register-res.dto';
import { UserAlertComponent } from '../../components/user-alert/user-alert';
import { UserAlert } from '../../components/user-alert/UserAlert';
import { AlertTone } from '../../components/user-alert/AlertTone.enum';

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

function passwordsMatchValidator(
    group: AbstractControl,
): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
}

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, InputText, Password, RouterLink, UserAlertComponent],
    templateUrl: './register.html',
    styleUrl: './register.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly successMessage = signal<string | null>(null);
    readonly openAlert = signal(false);

    public userAlert: UserAlert = {
        title: '',
        message: '',
        tone: AlertTone.Info,
        eyebrow: '',
    };

    readonly form = this.fb.nonNullable.group(
        {
            name: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(30),
                    Validators.pattern(/^[a-zA-Z0-9_ áéíóúàèìòùäëïöüñÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÑ]+$/),
                ],
            ],
            email: [
                '',
                [Validators.required, Validators.email, Validators.maxLength(100)],
            ],
            password: [
                '',
                [Validators.required, Validators.minLength(8)], //passwordStrengthValidator
            ],
            confirmPassword: ['', [Validators.required]],
        },
        { validators: passwordsMatchValidator },
    );

    async onSubmit(): Promise<void> {
        this.form.markAllAsTouched();
        if (this.form.invalid || this.isLoading()) return;

        this.errorMessage.set(null);
        this.isLoading.set(true);

        const { name, email, password } = this.form.getRawValue();

        try {
            this.authService.register(name, email, password).subscribe({
                next: (response: RegisterResponse) => {
                    if (response.success) {
                        this.successMessage.set('¡Cuenta creada con éxito! Redirigiendo...');
                        this.userAlert = {
                            title: '¡Cuenta creada con éxito!',
                            message: 'Haz clic en "Continuar" para ir al inicio de sesión. Puedes iniciar sesión una vez que tu cuenta haya sido verificada por un administrador.',
                            tone: AlertTone.Success,
                            eyebrow: 'Registro exitoso',
                            actionLabel: 'Continuar',
                        };
                        this.openAlert.set(true);
                    } else {
                        this.errorMessage.set(response.error ?? 'Error al crear la cuenta.');
                        this.userAlert = {
                            title: 'Error al crear la cuenta',
                            message: response.error ?? 'Ocurrió un error desconocido.',
                            tone: AlertTone.Error,
                            eyebrow: 'Acceso denegado',
                            actionLabel: 'Entendido',
                        };
                        this.openAlert.set(true);
                    }
                },
                error: (err) => {
                    this.userAlert = {
                        title: 'Error al crear la cuenta',
                        message: err?.error?.message ?? 'Error al crear la cuenta.',
                        tone: AlertTone.Error,
                        eyebrow: 'Acceso denegado',
                        actionLabel: 'Entendido',
                    };
                    this.openAlert.set(true);
                }
            });
        } finally {
            this.isLoading.set(false);
        }
    }

    onAlertAction(): void {
        if (this.userAlert.tone === AlertTone.Success) {
            this.openAlert.set(false);
            this.router.navigate(['/login']);
            return;
        }

        this.openAlert.set(false);
    }

    get confirmMismatch(): boolean {
        return (
            this.form.hasError('passwordsMismatch') &&
            (this.form.controls.confirmPassword.dirty ||
                this.form.controls.confirmPassword.touched)
        );
    }
}
