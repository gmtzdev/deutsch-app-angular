import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    output,
    resource,
    signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { GroupStatus } from '@app/core/types/groups.types';
import type { CreateGroupDto } from '@app/core/dto/groups/create-group.dto';
import { GroupService } from '@app/core/services/group.service';
import type { Group } from '@app/core/interfaces/groups/group.interface';
import { UserService } from '@app/core/services/user.service';
import { UserRole } from '@app/core/enum/user/user-rol.enum';
import type { User } from '@app/core/models/user/User.model';

interface GroupStatusOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-group-modal',
    imports: [ReactiveFormsModule, InputText, TextareaModule, Select],
    templateUrl: './group-modal.html',
    styleUrls: ['./group-modal.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateGroupModal {
    private readonly groupService = inject(GroupService);
    private readonly userService = inject(UserService);
    private readonly fb = inject(FormBuilder);

    readonly group = input<Group | null>(null);

    readonly created = output<void>();
    readonly cancelled = output<void>();


    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly createError = signal<string | null>(null);

    readonly teachersResource = resource<User[], undefined>({
        loader: () => firstValueFrom(this.userService.getUsers()),
    });

    readonly teachers = computed(() =>
        (this.teachersResource.value() ?? []).filter((user) => user.role === UserRole.PROFESSOR),
    );

    readonly roles = Object.values(UserRole);
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

    private readonly syncGroupForm = effect(() => {
        const group = this.group();
        if (group) {
            this.form.reset({
                name: group.name,
                teacherName: group.teacherName,
                level: group.level,
                description: group.description ?? '',
                status: group.status,
            });
        } else {
            this.form.reset({ status: 'active' as GroupStatus });
        }
        this.errorMessage.set(null);
    });

    async onSubmit(): Promise<void> {
        this.form.markAllAsTouched();
        if (this.form.invalid || this.isLoading()) return;

        this.errorMessage.set(null);
        this.isLoading.set(true);

        const { name, teacherName, level, description, status } = this.form.getRawValue();
        const dto: CreateGroupDto = { name, teacherName, level, description, status };
        try {
            const group = this.group();
            if (group) {
                await firstValueFrom(this.groupService.updateGroup(group.id, dto));
            } else {
                await firstValueFrom(this.groupService.createGroup(dto));
            }
            this.form.reset();
            this.created.emit();
        } catch {
            this.errorMessage.set(`No se pudo ${this.group() ? 'actualizar' : 'crear'} el grupo. Verifica los datos e intenta de nuevo.`);
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