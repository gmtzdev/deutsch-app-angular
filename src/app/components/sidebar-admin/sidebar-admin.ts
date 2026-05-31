import { Component, output, signal } from "@angular/core";

@Component({
    selector: 'app-sidebar-admin',
    templateUrl: './sidebar-admin.html',
    styleUrls: ['./sidebar-admin.scss'],
})
export class SidebarAdmin {
    readonly sidebarCollapsed = signal(false);
    readonly onToggleSidebar = output<boolean>();

    toggleSidebar(): void {
        this.sidebarCollapsed.update((value) => !value);
        this.onToggleSidebar.emit(this.sidebarCollapsed());
    }
}
