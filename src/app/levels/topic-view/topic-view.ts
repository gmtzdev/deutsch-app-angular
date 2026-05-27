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
import { CurriculumService } from '../../core/services/curriculum.service';
import { HasUnsavedChanges } from '../../core/guards/unsaved-changes.guard';
import { TopicWithSubtopics } from '../../core/models/topic.model';
import { SubtopicWithLessons } from '../../core/models/subtopic.models';
import { ElementTypeObj } from '../../core/types';



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
import { UnorderedList } from '../../core/models/elements/unorderedlist.model';
import { Table } from '../../core/models/elements/table.model';
import { Tip } from '../../core/models/elements/tip.model';
import { LessonTitle } from './elements/lesson-title';
import { LessonSubtitle } from './elements/lesson-subtitle';
import { LessonParagraph } from './elements/lesson-paragraph';
import { LessonUnorderedList } from './elements/lesson-unordered-list';
import { LessonTable } from './elements/lesson-table';
import { LessonTip } from './elements/lesson-tip';
import { LessonTag } from './elements/lesson-tag';
import { LessonConjugation } from './elements/lesson-conjugation';
import { LessonQuiz } from './elements/lesson-quiz';
import { LessonImage } from './elements/lesson-image';
import { LessonDragDrop } from './elements/lesson-drag-drop';
import { LessonAlphabet } from './elements/lesson-alphabet';
import { LessonPronunciation } from './elements/lesson-pronunciation';
import { LessonFillBlank } from './elements/lesson-fill-blank';
import { LessonFillBlankTable } from './elements/lesson-fill-blank-table-simple';
import { LessonEditor } from './lesson-editor/lesson-editor';
import { ChatMessage } from '../../core/dto/ai/chat-message.dto';

@Component({
    selector: 'app-topic-view',
    imports: [FormsModule, LessonTitle, LessonSubtitle, LessonParagraph, LessonUnorderedList, LessonTable, LessonTip, LessonTag, LessonConjugation, LessonQuiz, LessonImage, LessonDragDrop, LessonAlphabet, LessonPronunciation, LessonFillBlank, LessonFillBlankTable, LessonEditor],
    templateUrl: './topic-view.html',
    styleUrls: ['./topic-view.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicView implements HasUnsavedChanges {
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

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    protected sendMessage(): void {
        const prompt = this.userInput().trim();
        if (!prompt || this.aiLoading()) return;

        this.chatHistory.update(h => [...h, { role: 'user', content: prompt }]);
        this.userInput.set('');
        this.aiLoading.set(true);
        this.scrollChatToBottom();

        const current = this.pendingElements().length > 0
            ? this.pendingElements()
            : (this.subtopicResource.value()?.lesson?.elements ?? null);

        this.curriculumService.genAiLesson(prompt, current, this.apiChatHistory()).subscribe({
            next: (res) => {
                this.aiLoading.set(false);
                if (res.elements?.length) {
                    this.pendingElements.set(res.elements);
                    if (!this.editMode()) this.editMode.set(true);
                }
                if (res.message) {
                    this.chatHistory.update(h => [...h, { role: 'assistant', content: res.message }]);
                }
                if (res.chatHistory) {
                    this.apiChatHistory.set(res.chatHistory);
                }
                this.scrollChatToBottom();
            },
            error: () => {
                this.aiLoading.set(false);
                this.chatHistory.update(h => [...h, { role: 'assistant', content: 'Hubo un error al procesar tu solicitud. Intenta de nuevo.' }]);
                this.scrollChatToBottom();
            },
        });
    }

    private scrollChatToBottom(): void {
        setTimeout(() => {
            const el = this.chatMessagesEl();
            if (el) el.nativeElement.scrollTop = el.nativeElement.scrollHeight;
        }, 80);
    }

    /***** Variables to Pending Elements *****/
    protected readonly editMode = signal(false);
    protected readonly pendingElements = signal<ElementTypeObj[]>([]);
    protected readonly confirming = signal(false);
    protected readonly hasPending = computed(() => this.pendingElements().length > 0);

    protected readonly groupedElements = computed(() =>
        groupElements(this.subtopicResource.value()?.lesson?.elements ?? [])
        // groupElements([
        //     {
        //         "type": "title",
        //         "order": 1,
        //         "text": "Die Artikel",
        //         "baseStyle": "h1"
        //     },
        //     {
        //         "type": "element",
        //         "order": 2,
        //         "text": "Im Deutschen gibt es drei bestimmte Artikel: der, die und das. Sie werden verwendet, um bestimmte Personen, Dinge oder Konzepte zu identifizieren."
        //     },
        //     {
        //         "type": "tip",
        //         "order": 3,
        //         "text": "Die Artikel hängen vom Genus (grammatisches Geschlecht) des Substantivs ab. Es gibt Maskulinum, Femininum und Neutrum."
        //     },
        //     {
        //         "type": "table",
        //         "order": 4,
        //         "headers": [
        //             "Artikel",
        //             "Genus",
        //             "Beispiel"
        //         ],
        //         "rows": [
        //             {
        //                 "cells": [
        //                     "der",
        //                     "Maskulinum",
        //                     "der Mann"
        //                 ]
        //             },
        //             {
        //                 "cells": [
        //                     "die",
        //                     "Femininum",
        //                     "die Frau"
        //                 ]
        //             },
        //             {
        //                 "cells": [
        //                     "das",
        //                     "Neutrum",
        //                     "das Kind"
        //                 ]
        //             }
        //         ]
        //     },
        //     {
        //         "type": "quiz",
        //         "order": 5,
        //         "questions": [
        //             {
        //                 "question": "Welcher Artikel passt zu 'Auto'?",
        //                 "answer": "das",
        //                 "hint": "Das Auto ist Neutrum."
        //             },
        //             {
        //                 "question": "Welcher Artikel passt zu 'Tisch'?",
        //                 "answer": "der",
        //                 "hint": "Der Tisch ist Maskulinum."
        //             },
        //             {
        //                 "question": "Welcher Artikel passt zu 'Lampe'?",
        //                 "answer": "die",
        //                 "hint": "Die Lampe ist Femininum."
        //             }
        //         ]
        //     },
        //     {
        //         "type": "dragDrop",
        //         "order": 6,
        //         "rows": [
        //             {
        //                 "before": "___ Mann",
        //                 "answer": "der"
        //             },
        //             {
        //                 "before": "___ Frau",
        //                 "answer": "die"
        //             },
        //             {
        //                 "before": "___ Kind",
        //                 "answer": "das"
        //             }
        //         ],
        //         "words": [
        //             "der",
        //             "die",
        //             "das",
        //             "Kind",
        //             "Mann",
        //             "Frau"
        //         ]
        //     }
        // ] as ElementTypeObj[])
    );

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

    protected discardChanges(): void {
        // Ask for confirmation before discarding changes
        if (confirm('¿Estás seguro de que quieres descartar los cambios? Se perderán todos los cambios no guardados.')) {
            this.pendingElements.set([]);
            this.editMode.set(false);
        }
    }

    protected async confirmChanges(): Promise<void> {
        const lessonId = this.subtopicResource.value()?.lesson?.id;
        if (!lessonId || this.confirming()) return;

        this.confirming.set(true);
        try {
            this.pendingElements().forEach((element, index) => {
                element.order = index; // update order based on current position in array
            });
            console.log('Submitting elements:', this.pendingElements());
            console.log(this.pendingElements());

            const response = await firstValueFrom(this.curriculumService.createLesson(lessonId, this.pendingElements()));
            this.pendingElements.set([]);
            this.subtopicResource.reload();
        } catch {
            // keep pending on error so user can retry
        } finally {
            this.confirming.set(false);
            this.editMode.set(false);
        }
    }
}
