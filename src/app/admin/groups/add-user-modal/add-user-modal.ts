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
import { UserService } from '@app/core/services/user.service';
import { firstValueFrom } from 'rxjs';
import type { User } from '../../../core/models/user/User.model';
import type { Group } from '../../../core/interfaces/groups/group.interface';
import { GroupService } from '@app/core/services/group.service';

@Component({
    selector: 'app-add-user-modal',
    imports: [],
    templateUrl: './add-user-modal.html',
    styleUrls: ['./add-user-modal.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserModal {
    // Services
    private readonly userService = inject(UserService);
    private readonly groupService = inject(GroupService);

    // Inputs
    readonly group = input.required<Group>();

    // Outputs
    readonly added = output<void>();
    readonly cancelled = output<void>();

    // Signals
    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly searchQuery = signal('');
    readonly selectedUserIds = signal<number[]>([]);



    readonly usersResource = resource<User[], undefined>({
        loader: () => firstValueFrom(this.userService.getUsersByGroup(this.group().id)),
    });

    readonly availableUsersResource = resource<User[], undefined>({
        loader: () => firstValueFrom(this.userService.getUsers()),
    });

    readonly users = computed(() => this.usersResource.value() ?? []);
    readonly availableUsers = computed(() => {
        const currentMemberIds = new Set(this.users().map((user) => user.id));
        const query = this.searchQuery().trim().toLowerCase();

        return (this.availableUsersResource.value() ?? []).filter((user) => {
            if (currentMemberIds.has(user.id)) return false;
            if (!query) return true;
            return `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query);
        });
    });





    readonly selectedCount = computed(() => this.selectedUserIds().length);

    toggleUser(userId: number): void {
        this.selectedUserIds.update((selectedIds) =>
            selectedIds.includes(userId)
                ? selectedIds.filter((id) => id !== userId)
                : [...selectedIds, userId],
        );
    }

    async removeUser(userId: number): Promise<void> {
        if (this.isLoading()) return;

        this.errorMessage.set(null);
        this.isLoading.set(true);

        try {
            await firstValueFrom(this.groupService.updateGroupRemoveUser(this.group().id, userId));
            this.selectedUserIds.update((selectedIds) => selectedIds.filter((id) => id !== userId));
            this.usersResource.reload();
            this.availableUsersResource.reload();
        } catch {
            this.errorMessage.set('No se pudo quitar el usuario. Intenta de nuevo.');
        } finally {
            this.isLoading.set(false);
        }
    }

    async onSubmit(event: SubmitEvent): Promise<void> {
        event.preventDefault();
        const selectedIds = this.selectedUserIds();

        if (!selectedIds.length || this.isLoading()) return;

        this.errorMessage.set(null);
        this.isLoading.set(true);

        try {
            await firstValueFrom(this.groupService.updateGroupAddUsers(this.group().id, { users: selectedIds }));
            this.selectedUserIds.set([]);
            this.usersResource.reload();
            this.availableUsersResource.reload();
            this.added.emit();
        } catch {
            this.errorMessage.set('No se pudieron añadir los usuarios. Intenta de nuevo.');
        } finally {
            this.isLoading.set(false);
        }
    }

    onCancel(): void {
        this.errorMessage.set(null);
        this.selectedUserIds.set([]);
        this.cancelled.emit();
    }
}