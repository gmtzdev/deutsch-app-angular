import {
    Component,
    ChangeDetectionStrategy,
    inject,
    input,
    resource,
    signal,
    computed,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CurriculumService } from '../../core/services/curriculum.service';
import { TopicWithSubtopics } from '../../core/models/topic.model';
import { SubtopicWithLessons } from '../../core/models/subtopic.models';
import { ElementTypeObj } from '../../core/types';
import { UnorderedList } from '../../core/models/elements/unorderedlist.model';
import { Table } from '../../core/models/elements/table.model';
import { Tip } from '../../core/models/elements/tip.model';
import { LessonTitle } from './elements/lesson-title';
import { LessonSubtitle } from './elements/lesson-subtitle';
import { LessonParagraph } from './elements/lesson-paragraph';
import { LessonUnorderedList } from './elements/lesson-unordered-list';
import { LessonTable } from './elements/lesson-table';
import { LessonTip } from './elements/lesson-tip';
import { LessonEditor } from './lesson-editor/lesson-editor';

@Component({
    selector: 'app-topic-view',
    imports: [LessonTitle, LessonSubtitle, LessonParagraph, LessonUnorderedList, LessonTable, LessonTip, LessonEditor],
    templateUrl: './topic-view.html',
    styleUrls: ['./topic-view.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicView {
    readonly topicId = input.required<string>();
    readonly subtopicId = input.required<string>();

    private readonly curriculumService = inject(CurriculumService);


    /***** Variables to Pending Elements *****/
    protected readonly editMode = signal(false);
    protected readonly pendingElements = signal<ElementTypeObj[]>([]);
    protected readonly confirming = signal(false);
    protected readonly hasPending = computed(() => this.pendingElements().length > 0);

    protected enableEditMode(): void {
        this.editMode.set(!this.editMode())
        this.pendingElements.set(this.subtopicResource.value()?.lesson?.elements ?? []);
    }




    protected readonly topicResource = resource<TopicWithSubtopics, string>({
        params: () => this.topicId(),
        loader: ({ params }) => firstValueFrom(this.curriculumService.getTopicWithSubtopics(params)),
    });

    protected readonly subtopicResource = resource<SubtopicWithLessons, string>({
        params: () => this.subtopicId(),
        loader: ({ params }) => firstValueFrom(this.curriculumService.getSubtopicWithLessons(params)),
    });

    protected onElementAdded(element: ElementTypeObj): void {
        this.pendingElements.update((prev) => [...prev, element]);
    }

    protected onElementEdited(event: { index: number; element: ElementTypeObj }): void {
        this.pendingElements.update((elements) => {
            const next = [...elements];
            next[event.index] = event.element;
            return next;
        });
    }

    protected onElementRemoved(index: number): void {
        this.pendingElements.update((elements) => elements.filter((_, i) => i !== index));
    }

    protected discardChanges(): void {
        this.pendingElements.set([]);
    }

    protected async confirmChanges(): Promise<void> {
        const lessonId = this.subtopicResource.value()?.lesson?.id;
        if (!lessonId || this.confirming()) return;

        this.confirming.set(true);
        try {
            const response = await firstValueFrom(this.curriculumService.createLesson(lessonId, this.pendingElements()));
            // for (const el of this.pendingElements()) {
            // if (el.type === 'unorderedList') {
            //     const items = (el as unknown as UnorderedList).list?.map((i) => i.text) ?? [];
            //     await firstValueFrom(this.curriculumService.createUnorderedList(lessonId, items));
            // } else if (el.type === 'table') {
            //     const table = el as unknown as Table;
            //     await firstValueFrom(this.curriculumService.createTable(lessonId, table.headers, table.rows));
            // } else if (el.type === 'tip') {
            //     const tip = el as unknown as Tip;
            //     await firstValueFrom(this.curriculumService.createTip(lessonId, tip.tipTitle, tip.text, tip.style));
            // } else {
            //     await firstValueFrom(
            //         this.curriculumService.createElement(lessonId, el.type as 'title' | 'subtitle' | 'element', el.text)
            //     );
            // }
            // }
            this.pendingElements.set([]);
            this.subtopicResource.reload();
        } catch {
            // keep pending on error so user can retry
        } finally {
            this.confirming.set(false);
        }
    }
}
