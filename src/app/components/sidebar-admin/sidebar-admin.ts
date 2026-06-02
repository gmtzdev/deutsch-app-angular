import { Component, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserAvatarComponent } from "../user-avatar/user-avatar";

@Component({
    selector: 'app-sidebar-admin',
    templateUrl: './sidebar-admin.html',
    styleUrls: ['./sidebar-admin.scss'],
    imports: [RouterLink, UserAvatarComponent],
})
export class SidebarAdmin {
    readonly sidebarCollapsed = signal(false);
    readonly onToggleSidebar = output<boolean>();

    toggleSidebar(): void {
        this.sidebarCollapsed.update((value) => !value);
        this.onToggleSidebar.emit(this.sidebarCollapsed());
    }
}
