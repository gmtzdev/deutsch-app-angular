import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    resource,
    signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { CreateUserModal } from './create-user-modal/create-user-modal';
import { User } from '../../core/models/user/User.model';
import { UserRole } from '../../core/enum/user/user-rol.enum';

const ROLES = Object.values(UserRole);
type Role = (typeof ROLES)[number];

@Component({
    selector: 'app-admin-users',
    imports: [RouterLink, ReactiveFormsModule, CreateUserModal],
    templateUrl: './users.html',
    styleUrl: './users.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsers {
    private readonly authService = inject(AuthService);
    private readonly userService = inject(UserService);
    private readonly fb = inject(FormBuilder);

    readonly currentUser = this.authService.currentUser;
    readonly roles = ROLES;

    // ── Search ────────────────────────────────────────────────────

    readonly searchForm = this.fb.nonNullable.group({
        query: ['', Validators.maxLength(100)],
    });

    readonly searchQuery = signal('');

    onSearch(): void {
        this.searchQuery.set(this.searchForm.getRawValue().query.trim().toLowerCase());
    }

    clearSearch(): void {
        this.searchForm.reset();
        this.searchQuery.set('');
    }

    // ── Users resource ────────────────────────────────────────────

    readonly usersResource = resource<User[], undefined>({
        loader: () => firstValueFrom(this.userService.getUsers()),
    });

    readonly filteredUsers = computed(() => {
        const q = this.searchQuery();
        const users = this.usersResource.value() ?? [];
        if (!q) return users;
        return users.filter(
            (u) =>
                u.name.toLowerCase().includes(q) ||
                u.role.toLowerCase().includes(q) ||
                u.id.toString().toLowerCase().includes(q),
        );
    });

    // ── Role change ───────────────────────────────────────────────

    readonly updatingRoleId = signal<number | null>(null);
    readonly roleError = signal<string | null>(null);

    async changeRole(user: User, role: Role): Promise<void> {
        if (this.updatingRoleId() || user.role === role) return;
        this.updatingRoleId.set(user.id);
        this.roleError.set(null);
        try {
            await firstValueFrom(this.userService.updateUserRole(user.id, role));
            this.usersResource.reload();
        } catch {
            this.roleError.set(`No se pudo actualizar el rol de "${user.name}".`);
        } finally {
            this.updatingRoleId.set(null);
        }
    }

    // ── Delete ────────────────────────────────────────────────────

    readonly deletingUserId = signal<number | null>(null);
    readonly deleteError = signal<string | null>(null);
    readonly confirmDeleteId = signal<number | null>(null);

    requestDelete(id: number): void {
        this.confirmDeleteId.set(id);
    }

    cancelDelete(): void {
        this.confirmDeleteId.set(null);
    }

    async confirmDelete(id: number): Promise<void> {
        if (this.deletingUserId()) return;
        this.deletingUserId.set(id);
        this.deleteError.set(null);
        this.confirmDeleteId.set(null);
        try {
            await firstValueFrom(this.userService.deleteUser(id));
            this.usersResource.reload();
        } catch {
            this.deleteError.set('No se pudo eliminar el usuario. Intenta de nuevo.');
        } finally {
            this.deletingUserId.set(null);
        }
    }




    readonly isCreateModalOpen = signal(false);

    openCreateModal(): void { this.isCreateModalOpen.set(true); }
    closeCreateModal(): void { this.isCreateModalOpen.set(false); }

    onUserCreated(): void {
        this.closeCreateModal();
        this.usersResource.reload();
    }
}
