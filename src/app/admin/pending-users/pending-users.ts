import { DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    resource,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { User } from '../../core/models/user/User.model';
import { UserService } from '../../core/services/user.service';

type PendingVerificationUser = User & {
    verified?: boolean;
    isVerified?: boolean;
    verificationStatus?: string;
    status?: string;
    verifiedAt?: string | Date | null;
};

@Component({
    selector: 'app-admin-pending-users',
    imports: [RouterLink, TableModule, TagModule, DatePipe, Button, ToastModule],
    templateUrl: './pending-users.html',
    styleUrl: './pending-users.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
})
export class AdminPendingUsers {
    private readonly userService = inject(UserService);
    private messageService = inject(MessageService);

    readonly usersResource = resource<PendingVerificationUser[], undefined>({
        loader: async () => {
            const users = await firstValueFrom(this.userService.getPendingVerificationUsers());
            console.log('Pending verification users:', users);
            return users;
        },
    });

    readonly pendingUsers = computed(() => this.usersResource.value() ?? []);

    readonly pendingCount = computed(() => this.pendingUsers().length);

    refresh(): void {
        this.usersResource.reload();
    }

    trackById(_: number, user: PendingVerificationUser): number {
        return user.id;
    }

    async verifyUser(id: number): Promise<void> {
        const result = await firstValueFrom(this.userService.verifyUser(id));
        if (result) {
            this.messageService.add({ severity: 'success', summary: 'Operación exitosa', detail: 'Usuario verificado correctamente' });
            this.refresh();
        }
    }
}