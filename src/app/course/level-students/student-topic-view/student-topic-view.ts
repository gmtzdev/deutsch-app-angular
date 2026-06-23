import {
    Component,
    ChangeDetectionStrategy,
    inject,
    input,
    resource,
    signal,
    computed,
    ElementRef,
    viewChild,
} from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';

// Core
import { CurriculumService } from '@core/services/curriculum.service';
import { HasUnsavedChanges } from '@core/guards/unsaved-changes.guard';
import { TopicWithSubtopics } from '@core/models/topic.model';
import { SubtopicWithLessons } from '@core/models/subtopic.models';
import { ElementTypeObj } from '@core/types';
import { ChatMessage } from '@core/dto/ai/chat-message.dto';
import { UnorderedList } from '@core/models/elements/unorderedlist.model';
import { Table } from '@core/models/elements/table.model';
import { Tip } from '@core/models/elements/tip.model';




interface SingleGroup {
    kind: 'single';
    element: ElementTypeObj;
}

interface GridGroup {
    kind: 'grid';
    gridId: string;
    gridCols: number;
    elements: ElementTypeObj[];
}

type ElementGroup = SingleGroup | GridGroup;

function groupElements(elements: ElementTypeObj[]): ElementGroup[] {
    const groups: ElementGroup[] = [];
    const gridMap = new Map<string, number>();
    for (const el of elements) {
        if (!el.gridId) {
            groups.push({ kind: 'single', element: el });
        } else {
            const idx = gridMap.get(el.gridId);
            if (idx !== undefined) {
                (groups[idx] as GridGroup).elements.push(el);
            } else {
                gridMap.set(el.gridId, groups.length);
                groups.push({ kind: 'grid', gridId: el.gridId, gridCols: el.gridCols ?? 2, elements: [el] });
            }
        }
    }
    return groups;
}






import { LessonTitle } from '../../../levels/topic-view/elements/lesson-title';
import { LessonSubtitle } from '../../../levels/topic-view/elements/lesson-subtitle';
import { LessonParagraph } from '../../../levels/topic-view/elements/lesson-paragraph';
import { LessonUnorderedList } from '../../../levels/topic-view/elements/lesson-unordered-list';
import { LessonTable } from '../../../levels/topic-view/elements/lesson-table';
import { LessonTip } from '../../../levels/topic-view/elements/lesson-tip';
import { LessonTag } from '../../../levels/topic-view/elements/lesson-tag';
import { LessonConjugation } from '../../../levels/topic-view/elements/lesson-conjugation';
import { LessonQuiz } from '../../../levels/topic-view/elements/lesson-quiz';
import { LessonImage } from '../../../levels/topic-view/elements/lesson-image';
import { LessonDragDrop } from '../../../levels/topic-view/elements/lesson-drag-drop';
import { LessonAlphabet } from '../../../levels/topic-view/elements/lesson-alphabet';
import { LessonPronunciation } from '../../../levels/topic-view/elements/lesson-pronunciation';
import { LessonFillBlank } from '../../../levels/topic-view/elements/lesson-fill-blank';
import { LessonFillBlankTable } from '../../../levels/topic-view/elements/lesson-fill-blank-table-simple';
import { LessonTextQuestion } from '../../../levels/topic-view/elements/lesson-text-question';
import { LessonMultipleChoice } from '../../../levels/topic-view/elements/lesson-multiple-choice';


@Component({
    selector: 'app-student-topic-view',
    imports: [FormsModule, LessonTitle, LessonSubtitle, LessonParagraph, LessonUnorderedList, LessonTable, LessonTip, LessonTag, LessonConjugation, LessonQuiz, LessonImage, LessonDragDrop, LessonAlphabet, LessonPronunciation, LessonFillBlank, LessonFillBlankTable, LessonTextQuestion, LessonMultipleChoice],
    templateUrl: './student-topic-view.html',
    styleUrls: ['./student-topic-view.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentTopicView implements HasUnsavedChanges {
    readonly topicId = input.required<string>();
    readonly subtopicId = input.required<string>();

    private readonly curriculumService = inject(CurriculumService);

    private readonly chatMessagesEl = viewChild<ElementRef>('chatMessages');

    /***** Chat AI state *****/
    protected readonly chatHistory = signal<ChatMessage[]>([
        { role: 'assistant', content: 'Describe el contenido que quieres generar para esta lección y lo crearé automáticamente.' },
    ]);
    protected readonly userInput = signal('');
    protected readonly aiLoading = signal(false);
    private readonly apiChatHistory = signal<unknown[]>([]);



    private scrollChatToBottom(): void {
        setTimeout(() => {
            const el = this.chatMessagesEl();
            if (el) el.nativeElement.scrollTop = el.nativeElement.scrollHeight;
        }, 80);
    }

    /***** Variables to Pending Elements *****/

    protected readonly pendingElements = signal<ElementTypeObj[]>([]);
    protected readonly confirming = signal(false);
    protected readonly hasPending = computed(() => this.pendingElements().length > 0);

    protected readonly groupedElements = computed(() =>
        groupElements(this.subtopicResource.value()?.lesson?.elements ?? [])
    );



    protected readonly topicResource = resource<TopicWithSubtopics, string>({
        params: () => this.topicId(),
        loader: ({ params }) => firstValueFrom(this.curriculumService.getTopicWithSubtopics(params)),
    });

    protected readonly subtopicResource = resource<SubtopicWithLessons, string>({
        params: () => this.subtopicId(),
        loader: ({ params }) => firstValueFrom(this.curriculumService.getSubtopicWithLessons(params).pipe(
            tap(subtopic => { console.log(subtopic) })
        )),
    });

    protected onElementAdded(element: ElementTypeObj): void {
        this.pendingElements.update((prev) => [...prev, element]);
        console.log(this.pendingElements());
    }

    protected onElementEdited(event: { index: number; element: ElementTypeObj }): void {
        this.pendingElements.update((elements) => {
            const next = [...elements];
            const aux = next[event.index];
            event.element.id = aux.id; // preserve id for existing elements so they can be updated instead of created
            next[event.index] = event.element;
            return next;
        });
    }

    protected onElementRemoved(index: number): void {
        this.pendingElements.update((elements) => {
            const next = [...elements];
            const aux = next[index];
            aux.delete = true; // mark element for deletion
            next[index] = aux;
            return next;
        });
    }

    protected onElementReordered(event: { from: number; to: number }): void {
        this.pendingElements.update((elements) => {
            const next = [...elements];
            const [moved] = next.splice(event.from, 1);
            next.splice(event.to, 0, moved);
            return next;
        });
    }

    canDeactivate(): boolean {
        return !this.hasPending();
    }




}
