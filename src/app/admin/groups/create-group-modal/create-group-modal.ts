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
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CreateUserDto } from '../../../core/dto/user/create-user.dto';
import { GroupStatus } from '@app/core/types/groups.types';
import type { CreateGroupDto } from '@app/core/dto/groups/create-group.dto';
import { GroupService } from '@app/core/services/group.service';

const STATUS_OPTIONS: GroupStatus[] = ['active', 'paused', 'archived'];
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value ?? '';
    if (!value) return null;
    const valid =
        value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[0-9]/.test(value)
    // && /[!@#$%^&*()\-_=+[\]{};':",.<>/?\\|`~]/.test(value);
    return valid ? null : { weakPassword: true };
}

interface GroupStatusOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-create-group-modal',
    imports: [ReactiveFormsModule, InputText, TextareaModule, Select],
    templateUrl: './create-group-modal.html',
    styleUrls: ['./create-group-modal.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateGroupModal {
    private readonly groupService = inject(GroupService);
    private readonly fb = inject(FormBuilder);

    readonly roles = Object.values(UserRole);

    readonly created = output<void>();
    readonly cancelled = output<void>();

    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly createError = signal<string | null>(null);




    readonly statusOptions: GroupStatusOption[] = [
        { label: 'Activo', value: 'active' },
        { label: 'Pausado', value: 'paused' },
        { label: 'Archivado', value: 'archived' }
    ];
    selectedLanguage: string | undefined;




    readonly form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
        teacherName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
        level: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
        description: ['', [Validators.maxLength(200)]],
        status: ['active' as GroupStatus, Validators.required],
    });

    async onSubmit(): Promise<void> {
        this.form.markAllAsTouched();
        if (this.form.invalid || this.isLoading()) return;

        this.errorMessage.set(null);
        this.isLoading.set(true);

        const { name, teacherName, level, description, status } = this.form.getRawValue();
        const dto: CreateGroupDto = { name, teacherName, level, description, status };
        try {
            await firstValueFrom(this.groupService.createGroup(dto));
            this.form.reset();
            this.created.emit();
        } catch {
            this.errorMessage.set('No se pudo crear el grupo. Verifica los datos e intenta de nuevo.');
        } finally {
            this.isLoading.set(false);
        }
    }

    onCancel(): void {
        this.form.reset();
        this.errorMessage.set(null);
        this.cancelled.emit();
    }

    statusLabel(status: GroupStatus): string {
        switch (status) {
            case 'active': return 'Activo';
            case 'paused': return 'Pausado';
            case 'archived': return 'Archivado';
        }
    }
}