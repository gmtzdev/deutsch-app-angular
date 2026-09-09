import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    resource,
    signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../../core/models/user/User.model';
import { UserService } from '../../core/services/user.service';
import type { CreateGroupDto } from '../../core/dto/groups/create-group.dto';
import { GroupService } from '../../core/services/group.service';
import type { GroupStatus } from '../../core/types/groups.types';
import type { Group } from '../../core/interfaces/groups/group.interface';
import { CreateGroupModal } from './create-group-modal/create-group-modal';
import { AddUserModal } from './add-user-modal/add-user-modal';


const STATUS_OPTIONS: GroupStatus[] = ['active', 'paused', 'archived'];

@Component({
    selector: 'app-admin-groups',
    imports: [RouterLink, ReactiveFormsModule, CreateGroupModal, AddUserModal],
    templateUrl: './groups.html',
    styleUrl: './groups.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGroups {
    private readonly fb = inject(FormBuilder);
    private readonly groupService = inject(GroupService);
    private readonly userService = inject(UserService);

    readonly statusOptions = STATUS_OPTIONS;

    readonly searchForm = this.fb.nonNullable.group({
        query: ['', Validators.maxLength(100)],
    });

    readonly createForm = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
        teacherName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
        level: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
        description: ['', [Validators.maxLength(200)]],
        status: ['active' as GroupStatus, Validators.required],
    });

    readonly searchQuery = signal('');
    readonly memberSearchQuery = signal('');
    readonly isCreateFormOpen = signal(false);
    readonly selectedGroupId = signal<number | null>(null);
    readonly deletingGroupId = signal<number | null>(null);
    readonly updatingStatusId = signal<number | null>(null);
    readonly updatingMembersId = signal<number | null>(null);
    readonly confirmDeleteId = signal<number | null>(null);
    readonly createError = signal<string | null>(null);
    readonly deleteError = signal<string | null>(null);

    readonly groupsResource = resource<Group[], undefined>({
        loader: () => firstValueFrom(this.groupService.getGroups()),
    });

    readonly usersResource = resource<User[], undefined>({
        loader: () => firstValueFrom(this.userService.getUsers()),
    });

    readonly filteredGroups = computed(() => {
        const q = this.searchQuery().trim().toLowerCase();
        const groups = this.groupsResource.value() ?? [];

        if (!q) return groups;

        return groups.filter((group) =>
            [group.name, group.teacherName, group.level, group.status, group.description]
                .join(' ')
                .toLowerCase()
                .includes(q),
        );
    });

    readonly selectedGroup = computed(() => {
        const selectedGroupId = this.selectedGroupId();
        if (selectedGroupId === null) return null;
        return (this.groupsResource.value() ?? []).find((group) => group.id === selectedGroupId) ?? null;
    });

    readonly selectedGroupMembers = computed(() => {
        const selectedGroup = this.selectedGroup();
        const users = this.usersResource.value() ?? [];
        if (!selectedGroup) return [];
        return users.filter((user) => selectedGroup.users.some((member) => member.id === user.id));
    });

    readonly availableGroupMembers = computed(() => {
        const selectedGroup = this.selectedGroup();
        const users = this.usersResource.value() ?? [];
        const query = this.memberSearchQuery().trim().toLowerCase();
        if (!selectedGroup) return [];

        const available = users.filter((user) => !selectedGroup.users.some((member) => member.id === user.id));
        if (!query) return available;

        return available.filter((user) =>
            `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query),
        );
    });

    onSearch(): void {
        this.searchQuery.set(this.searchForm.getRawValue().query.trim().toLowerCase());
    }

    clearSearch(): void {
        this.searchForm.reset();
        this.searchQuery.set('');
    }

    toggleCreateForm(): void {
        this.isCreateFormOpen.update((value) => !value);
        if (!this.isCreateFormOpen()) {
            this.createForm.reset({ status: 'active' as GroupStatus });
            this.createError.set(null);
        }
    }

    async submitCreate(): Promise<void> {
        this.createForm.markAllAsTouched();
        if (this.createForm.invalid) return;

        this.createError.set(null);

        const formValue = this.createForm.getRawValue();
        const dto: CreateGroupDto = {
            name: formValue.name,
            description: formValue.description,
            teacherName: formValue.teacherName,
            level: formValue.level,
            status: formValue.status,
        };

        try {
            await firstValueFrom(this.groupService.createGroup(dto));
            this.createForm.reset({ status: 'active' as GroupStatus });
            this.isCreateFormOpen.set(false);
            this.groupsResource.reload();
        } catch {
            this.createError.set('No se pudo crear el grupo. Intenta de nuevo.');
        }
    }

    requestDelete(id: number): void {
        this.confirmDeleteId.set(id);
    }

    cancelDelete(): void {
        this.confirmDeleteId.set(null);
    }

    async confirmDelete(id: number): Promise<void> {
        if (this.deletingGroupId()) return;

        this.deletingGroupId.set(id);
        this.deleteError.set(null);
        this.confirmDeleteId.set(null);

        try {
            await firstValueFrom(this.groupService.deleteGroup(id));
            this.groupsResource.reload();
        } catch {
            this.deleteError.set('No se pudo eliminar el grupo. Intenta de nuevo.');
        } finally {
            this.deletingGroupId.set(null);
        }
    }

    async changeStatus(group: Group, status: GroupStatus): Promise<void> {
        if (this.updatingStatusId() || group.status === status) return;

        this.updatingStatusId.set(group.id);
        this.deleteError.set(null);

        try {
            await firstValueFrom(this.groupService.updateGroup(group.id, { status }));
            this.groupsResource.reload();
        } catch {
            this.deleteError.set(`No se pudo cambiar el estado de "${group.name}".`);
        } finally {
            this.updatingStatusId.set(null);
        }
    }

    statusLabel(status: GroupStatus): string {
        switch (status) {
            case 'active': return 'Activo';
            case 'paused': return 'Pausado';
            case 'archived': return 'Archivado';
        }
    }

    closeMembersManager(): void {
        this.selectedGroupId.set(null);
        this.memberSearchQuery.set('');
    }

    async addMemberToGroup(userId: number): Promise<void> {
        const group = this.selectedGroup();
        if (!group || this.updatingMembersId() !== null) return;

        // this.updatingMembersId.set(group.id);
        // try {
        //     const users = Array.from(new Set([...group.users, { id: userId }]));
        //     await firstValueFrom(this.groupService.updateGroup(group.id, { users }));
        //     this.groupsResource.reload();
        // } catch {
        //     this.deleteError.set('No se pudo añadir el miembro al grupo.');
        // } finally {
        //     this.updatingMembersId.set(null);
        // }
    }

    async removeMemberFromGroup(userId: number): Promise<void> {
        const group = this.selectedGroup();
        if (!group || this.updatingMembersId() !== null) return;

        this.updatingMembersId.set(group.id);
        try {
            const users = group.users.filter((member) => member.id !== userId);
            await firstValueFrom(this.groupService.updateGroup(group.id, { users }));
            this.groupsResource.reload();
        } catch {
            this.deleteError.set('No se pudo quitar el miembro del grupo.');
        } finally {
            this.updatingMembersId.set(null);
        }
    }




    readonly isCreateModalOpen = signal(false);
    openCreateModal(): void { this.isCreateModalOpen.set(true); }
    closeCreateModal(): void { this.isCreateModalOpen.set(false); }

    readonly isAddUserModalOpen = signal(false);
    readonly addUserGroup = signal<Group | null>(null);
    openAddUserModal(group: Group): void {
        this.addUserGroup.set(group);
        this.isAddUserModalOpen.set(true);
    }
    closeAddUserModal(): void { this.isAddUserModalOpen.set(false); }

    onUsersAdded(): void {
        this.closeAddUserModal();
        this.addUserGroup.set(null);
        this.groupsResource.reload();
    }

    onGroupCreated(): void {
        this.closeCreateModal();
        this.groupsResource.reload();
    }
}
