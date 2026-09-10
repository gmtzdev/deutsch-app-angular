import { Component, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserAvatarComponent } from "../user-avatar/user-avatar";
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-sidebar-admin',
    templateUrl: './sidebar-admin.html',
    styleUrls: ['./sidebar-admin.scss'],
    imports: [RouterLink, UserAvatarComponent],
})
export class SidebarAdmin {
    private readonly authService = inject(AuthService);

    readonly sidebarCollapsed = signal(false);
    readonly onToggleSidebar = output<boolean>();
    readonly currentUser = this.authService.currentUser;

    toggleSidebar(): void {
        this.sidebarCollapsed.update((value) => !value);
        this.onToggleSidebar.emit(this.sidebarCollapsed());
    }
}
