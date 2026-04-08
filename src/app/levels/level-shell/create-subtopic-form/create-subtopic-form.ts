import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CurriculumService } from "../../../core/services/curriculum.service";
import { firstValueFrom } from "rxjs";
import { Topic } from "../../../core/models/topic.model";

@Component({
    selector: 'app-create-subtopic-form',
    templateUrl: './create-subtopic-form.html',
    styleUrl: './create-subtopic-form.scss',
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSubtopicForm {
    readonly topic = input.required<Topic>();


    protected readonly creating = signal<CreatingState>({ type: 'none' });
    protected readonly saving = signal(false);
    protected readonly title = signal('');

    private readonly doc = inject(DOCUMENT);
    private readonly curriculumService = inject(CurriculumService);



    protected startCreatingSubtopic(topicId: number): void {
        this.creating.set({ type: 'subtopic', topicId: Number(topicId) });
        // this.expandedTopics.update((s) => new Set([...s, Number(topicId)]));
        this.focusInput(`new-subtopic-input-${topicId}`);
    }

    protected async submitSubtopic(event: Event, topicId: number): Promise<void> {
        event.preventDefault();
        const value = this.title().trim();
        if (!value || this.saving()) return;
        const title = value;


        this.saving.set(true);
        try {
            const subtopic = await firstValueFrom(
                this.curriculumService.createSubtopic(topicId, title)
            );
            // this.levelResource.value.update((level) => {
            //     if (!level) return level;
            //     return {
            //         ...level,
            //         topics: level.topics.map((t) =>
            //             t.id === topicId
            //                 ? { ...t, subtopics: [...(t.subtopics ?? []), { ...subtopic, lessons: [] }] }
            //                 : t
            //         ),
            //     };
            // });
            this.creating.set({ type: 'none' });
        } catch {
            // keep form open on error
        } finally {
            this.saving.set(false);
        }
    }

    protected cancelCreating(): void {
        this.title.set('');
        this.creating.set({ type: 'none' });
    }


    protected isCreatingSubtopic(topicId: number): boolean {
        const c = this.creating();
        return c.type === 'subtopic' && c.topicId === topicId;
    }

    private focusInput(id: string): void {
        setTimeout(() => (this.doc.getElementById(id) as HTMLInputElement | null)?.focus(), 0);
    }

}