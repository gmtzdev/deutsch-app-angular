import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    output,
    signal,
} from '@angular/core';
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
    private readonly groupService = inject(GroupService);

    readonly group = input.required<Group>();
    readonly users = input.required<User[]>();

    readonly added = output<void>();
    readonly cancelled = output<void>();

    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);
    readonly searchQuery = signal('');
    readonly selectedUserIds = signal<number[]>([]);

    readonly availableUsers = computed(() => {
        const currentMemberIds = new Set(this.group().users.map((user) => user.id));
        const query = this.searchQuery().trim().toLowerCase();

        return this.users().filter((user) => {
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

    async onSubmit(): Promise<void> {
        const selectedIds = this.selectedUserIds();
        if (!selectedIds.length || this.isLoading()) return;

        this.errorMessage.set(null);
        this.isLoading.set(true);

        const selectedUsers = this.users().filter((user) => selectedIds.includes(user.id));
        const users = [...this.group().users, ...selectedUsers];
        try {
            await firstValueFrom(this.groupService.updateGroup(this.group().id, { users }));
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