import { Component, ChangeDetectionStrategy, signal, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CurriculumService } from '../../core/services/curriculum.service';
import { Level } from '../../core/models/level.model';
import { firstValueFrom } from 'rxjs';
import { CardInfoAdminComponent } from "../../components/admin/card-info-adim/card-info-admin.component";
import { UserService } from '../../core/services/user.service';

@Component({
    selector: 'app-admin-index',
    templateUrl: './index.html',
    styleUrls: ['./index.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, CardInfoAdminComponent],
})
export class AdminIndex {
    private readonly authService = inject(AuthService);
    private readonly curriculumService = inject(CurriculumService);
    private readonly userService = inject(UserService);

    readonly currentUser = this.authService.currentUser;
    readonly sidebarCollapsed = signal(false);

    readonly levelsResource = resource<Level[], undefined>({
        loader: () => firstValueFrom(this.curriculumService.getAllLevels()),
    });

    readonly userInfo = resource<{ students: number; teachers: number }, undefined>({
        loader: () =>
            firstValueFrom(
                this.userService.getUserStats(),
            ),
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