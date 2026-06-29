import {
    ChangeDetectionStrategy,
    Component,
    inject,
    output,
    signal,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { UserRole } from '../../../core/enum/user/user-rol.enum';
import { Password } from 'primeng/password';
import { InputText } from 'primeng/inputtext';
import { CreateUserDto } from '../../../core/dto/user/create-user.dto';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
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
    selector: 'app-create-user-modal',
    imports: [ReactiveFormsModule, InputText, Password],
    templateUrl: './create-user-modal.html',
    styleUrl: './create-user-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserModal {
    private readonly userService = inject(UserService);
    private readonly fb = inject(FormBuilder);

    readonly roles = Object.values(UserRole);

    readonly created = output<void>();
    readonly cancelled = output<void>();

    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);

    readonly form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
        role: [UserRole.USER, [Validators.required]],
    });

    async onSubmit(): Promise<void> {
        this.form.markAllAsTouched();
        if (this.form.invalid || this.isLoading()) return;

        this.errorMessage.set(null);
        this.isLoading.set(true);

        const { name, email, password, role } = this.form.getRawValue();
        const dto: CreateUserDto = { name, email, password, role };
        try {
            await firstValueFrom(this.userService.createUser(dto));
            this.form.reset();
            this.created.emit();
        } catch {
            this.errorMessage.set('No se pudo crear el usuario. Verifica los datos e intenta de nuevo.');
        } finally {
            this.isLoading.set(false);
        }
    }

    onCancel(): void {
        this.form.reset();
        this.errorMessage.set(null);
        this.cancelled.emit();
    }
}