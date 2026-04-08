import {
    Component,
    ChangeDetectionStrategy,
    input,
    output,
    signal,
    inject,
    DOCUMENT,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CurriculumService } from '../../../core/services/curriculum.service';
import { FormsModule } from '@angular/forms';
import { Topic } from '../../../core/models/topic.model';

@Component({
    selector: 'app-create-topic-form',
    templateUrl: './create-topic-form.html',
    styleUrl: './create-topic-form.scss',
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTopicForm {
    readonly levelId = input.required<string>();
    readonly submited = output<Topic>();

    protected readonly creating = signal<CreatingState>({ type: 'none' });
    protected readonly saving = signal(false);
    protected readonly title = signal('');
    protected readonly subtitle = signal('');

    private readonly doc = inject(DOCUMENT);
    private readonly curriculumService = inject(CurriculumService);





    protected onSubmit(event: Event): void {
        event.preventDefault();
        const value = this.title().trim();
        const subtitle = this.subtitle().trim();
        if (!value || this.saving()) return;
        this.submitTopic(value, subtitle);
        this.title.set('');
        this.subtitle.set('');
    }




    // ── Create topic ─────────────────────────────────────────

    protected startCreatingTopic(): void {
        this.creating.set({ type: 'topic' });
        console.log('Starting to create topic');
        // input is inside CreateTopicForm; focus handled by the component itself
        this.focusInput('new-topic-input');
    }

    protected isCreatingTopic(): boolean {
        const c = this.creating();
        return c.type === 'topic';
    }


    protected cancelCreating(): void {
        this.title.set('');
        this.subtitle.set('');
        this.creating.set({ type: 'none' });
    }

    protected async submitTopic(title: string, subtitle: string): Promise<void> {
        if (!title || this.saving()) return;

        this.saving.set(true);
        try {
            const topic = await firstValueFrom(
                this.curriculumService.createTopic(this.levelId(), title, subtitle)
            );
            this.submited.emit(topic);

            this.creating.set({ type: 'none' });
        } catch {
            // keep form open on error
        } finally {
            this.saving.set(false);
        }
    }






    private focusInput(id: string): void {
        setTimeout(() => (this.doc.getElementById(id) as HTMLInputElement | null)?.focus(), 0);
    }
}
