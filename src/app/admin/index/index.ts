import { Component, ChangeDetectionStrategy, signal, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../components/header/header';
import { SidebarAdmin } from '../../components/sidebar-admin/sidebar-admin';
import { AuthService } from '../../core/services/auth.service';
import { CurriculumService } from '../../core/services/curriculum.service';
import { Level } from '../../core/models/level.model';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-admin-index',
    templateUrl: './index.html',
    styleUrls: ['./index.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, Header, SidebarAdmin],
})
export class AdminIndex {
    private readonly authService = inject(AuthService);
    private readonly curriculumService = inject(CurriculumService);

    readonly currentUser = this.authService.currentUser;
    readonly sidebarCollapsed = signal(false);

    readonly levelsResource = resource<Level[], undefined>({
        loader: () => firstValueFrom(this.curriculumService.getLevels()),
    });

    // ── Delete level ──────────────────────────────────────────────

    readonly deletingLevelId = signal<number | null>(null);
    readonly deleteError = signal<string | null>(null);



    async deleteLevel(id: number): Promise<void> {
        if (this.deletingLevelId() !== null) return;
        this.deletingLevelId.set(id);
        this.deleteError.set(null);
        try {
            await firstValueFrom(this.curriculumService.deleteTopic(id));
            this.levelsResource.reload();
        } catch {
            this.deleteError.set('No se pudo eliminar el nivel. Intenta de nuevo.');
        } finally {
            this.deletingLevelId.set(null);
        }
    }

    totalTopics(): number {
        return (this.levelsResource.value() ?? []).reduce(
            (acc, l) => acc + (l.topics?.length ?? 0),
            0,
        );
    }

}