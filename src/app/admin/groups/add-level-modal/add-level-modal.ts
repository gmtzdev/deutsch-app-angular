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
import { firstValueFrom } from 'rxjs';
import type { Group } from '../../../core/interfaces/groups/group.interface';
import type { Level } from '../../../core/models/level.model';
import { CurriculumService } from '../../../core/services/curriculum.service';
import { GroupService } from '../../../core/services/group.service';

@Component({
    selector: 'app-add-level-modal',
    imports: [],
    templateUrl: './add-level-modal.html',
    styleUrls: ['../add-user-modal/add-user-modal.scss', './add-level-modal.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLevelModal {
    private readonly curriculumService = inject(CurriculumService);
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
    readonly selectedLevelIds = signal<number[]>([]);
    private readonly managedLevels = signal<Level[]>([]);

    constructor() {
        effect(() => {
            this.managedLevels.set(this.group().levels ?? []);
        });
    }

    readonly levelsResource = resource<Level[], undefined>({
        loader: () => firstValueFrom(this.curriculumService.getAllLevels()),
    });

    readonly levels = computed(() => this.managedLevels());
    readonly availableLevels = computed(() => {
        const currentLevelIds = new Set(this.levels().map((level) => level.id));
        const query = this.searchQuery().trim().toLowerCase();

        return (this.levelsResource.value() ?? []).filter((level) => {
            if (currentLevelIds.has(level.id)) return false;
            if (!query) return true;
            return `${level.title} ${level.tag} ${level.description}`.toLowerCase().includes(query);
        });
    });

    readonly selectedCount = computed(() => this.selectedLevelIds().length);

    toggleLevel(levelId: number): void {
        this.selectedLevelIds.update((selectedIds) =>
            selectedIds.includes(levelId)
                ? selectedIds.filter((id) => id !== levelId)
                : [...selectedIds, levelId],
        );
    }

    async onSubmit(event: SubmitEvent): Promise<void> {
        event.preventDefault();
        const selectedIds = this.selectedLevelIds();
        if (!selectedIds.length || this.isLoading()) return;

        this.errorMessage.set(null);
        this.isLoading.set(true);

        try {
            const updatedGroup = await firstValueFrom(
                this.groupService.updateGroupAddLevels(this.group().id, { levelIds: selectedIds }),
            );
            const selectedLevels = (this.levelsResource.value() ?? [])
                .filter((level) => selectedIds.includes(level.id));
            this.managedLevels.set(
                updatedGroup.levels ?? [
                    ...this.levels(),
                    ...selectedLevels.filter((level) => !this.levels().some((current) => current.id === level.id)),
                ],
            );
            this.selectedLevelIds.set([]);
            this.levelsResource.reload();
            this.added.emit();
        } catch {
            this.errorMessage.set('No se pudieron añadir los niveles. Intenta de nuevo.');
        } finally {
            this.isLoading.set(false);
        }
    }

    async removeLevel(levelId: number): Promise<void> {
        if (this.isLoading()) return;

        this.errorMessage.set(null);
        this.isLoading.set(true);

        try {
            const levels = this.levels().filter((level) => level.id !== levelId);
            await firstValueFrom(this.groupService.updateGroup(this.group().id, { levels }));
            this.managedLevels.set(levels);
            this.selectedLevelIds.update((selectedIds) => selectedIds.filter((id) => id !== levelId));
            this.levelsResource.reload();

            this.added.emit();
        } catch {
            this.errorMessage.set('No se pudo quitar el nivel. Intenta de nuevo.');
        } finally {
            this.isLoading.set(false);
        }
    }

    onCancel(): void {
        this.errorMessage.set(null);
        this.selectedLevelIds.set([]);
        this.cancelled.emit();
    }
}
