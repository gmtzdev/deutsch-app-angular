import {
    Component,
    ChangeDetectionStrategy,
    inject,
    input,
    resource,
    effect,
    signal,
    DOCUMENT,
} from '@angular/core';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, filter, map, startWith } from 'rxjs';
import { CurriculumService } from '../../../core/services/curriculum.service';
import { Level, LevelWithTopics } from '../../../core/models/level.model';
import { Topic } from '../../../core/models/topic.model';
import { Subtopic, SubtopicWithLessons } from '../../../core/models/subtopic.models';
import { Header } from '../../../components/header/header';
import { Lesson } from '../../../core/models/lesson.model';



@Component({
    selector: 'app-student-level',
    imports: [Header, RouterLink, RouterOutlet],
    templateUrl: './student-level.html',
    styleUrls: ['./student-level.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentLevel {
    readonly levelId = input.required<string>();

    private readonly curriculumService = inject(CurriculumService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly doc = inject(DOCUMENT);


    protected readonly levelResource = resource<LevelWithTopics, string>({
        params: () => this.levelId(),
        loader: ({ params }) =>
            firstValueFrom(this.curriculumService.getLevelWithTopics(params)),
    });

    protected readonly sidebarCollapsed = signal(false);
    protected readonly expandedTopics = signal<Set<number>>(new Set());

    // ── Topic edit/delete state ───────────────────────────────
    protected readonly editTitle = signal('');
    protected readonly editSubtitle = signal('');
    protected readonly editSaving = signal(false);

    // ── Subtopic edit/delete state ────────────────────────────
    protected readonly editSubtopicTitle = signal('');
    protected readonly editSubtopicIcon = signal('');
    protected readonly editSubtopicSaving = signal(false);

    // ── Subtopic drag-and-drop state ──────────────────────────
    protected readonly dragTopicId = signal<number | null>(null);
    protected readonly dragFromIndex = signal<number | null>(null);
    protected readonly dragOverIndex = signal<number | null>(null);
    protected readonly dragOverTopicId = signal<number | null>(null);



    private readonly activeTopicId = toSignal(
        this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            startWith(null),
            map(() => {
                const child = this.route.firstChild;
                const id = child?.snapshot?.paramMap?.get('topicId') ?? null;
                return id ? Number(id) : null;
            }),
        ),
        { initialValue: null as number | null },
    );

    constructor() {
        effect(() => {
            const level = this.levelResource.value();
            if (!level?.topics?.length) return;
            if (!this.route.firstChild) {
                this.router.navigate(['topics', level.topics[0].id, level.topics[0].subtopics[0]?.id ?? 0], {
                    relativeTo: this.route,
                    replaceUrl: true,
                });
            }
        });

        effect(() => {
            const activeId = this.activeTopicId();
            if (activeId !== null) {
                this.expandedTopics.update((set) => new Set([...set, activeId]));
            }
        });
    }

    protected toggleTopic(topicId: number, event: Event): void {
        event.preventDefault();
        this.expandedTopics.update((set) => {
            const next = new Set(set);
            if (next.has(topicId)) next.delete(topicId);
            else next.add(topicId);
            return next;
        });
    }

    protected isExpanded(topicId: number): boolean {
        return this.expandedTopics().has(topicId);
    }

    protected isTopicActive(topicId: number): boolean {
        return this.activeTopicId() === topicId;
    }

    protected toggleSidebar(): void {
        this.sidebarCollapsed.update((value) => !value);
    }





    protected onTopicSubmited(topic: Topic): void {
        this.levelResource.value.update((level) => {
            if (!level) return level;
            return {
                ...level,
                topics: [...level.topics, { ...topic, subtopics: [] }],
            };
        });
    }




    protected async deleteTopicById(topicId: number): Promise<void> {
        const ok = this.doc.defaultView?.confirm('¿Eliminar este tema? Esta acción no se puede deshacer.');
        if (!ok) return;
        try {
            await firstValueFrom(this.curriculumService.deleteTopic(topicId));
            this.levelResource.value.update((level) => {
                if (!level) return level;
                return {
                    ...level,
                    topics: level.topics.filter((t) => t.id !== topicId),
                };
            });
        } catch {
            // silent
        }
    }

    // ── Subtopic edit/delete ──────────────────────────────────


    protected async deleteSubtopicById(topicId: number, subtopicId: number): Promise<void> {
        const ok = this.doc.defaultView?.confirm('¿Eliminar este subtema? Esta acción no se puede deshacer.');
        if (!ok) return;
        try {
            await firstValueFrom(this.curriculumService.deleteSubtopic(subtopicId));
            this.levelResource.value.update((level) => {
                if (!level) return level;
                return {
                    ...level,
                    topics: level.topics.map((t) =>
                        t.id === topicId
                            ? { ...t, subtopics: t.subtopics.filter((s) => s.id !== subtopicId) }
                            : t
                    ),
                };
            });
        } catch {
            // silent
        }
    }

    protected includeSubtopic(subtopic: Subtopic): void {
        this.levelResource.value.update((level) => {
            if (!level) return level;
            return {
                ...level,
                topics: level.topics.map((t) =>
                    t.id === subtopic.topic.id
                        ? { ...t, subtopics: [...t.subtopics, subtopic as any] }
                        : t
                ),
            };
        });
    }


    // ── Subtopic drag-and-drop handlers ──────────────────────

    protected onSubtopicDragStart(event: DragEvent, topicId: number, index: number): void {
        this.dragTopicId.set(topicId);
        this.dragFromIndex.set(index);
        event.dataTransfer!.effectAllowed = 'move';
    }

    protected onSubtopicDragOver(event: DragEvent, index: number): void {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';
        this.dragOverIndex.set(index);
    }

    protected onSubtopicDragLeave(index: number): void {
        if (this.dragOverIndex() === index) this.dragOverIndex.set(null);
    }

    protected onSubtopicDrop(event: DragEvent, toIndex: number, destinationTopicIndex: number): void {
        event.preventDefault();
        const topicId = this.dragTopicId();
        const from = this.dragFromIndex();


        if (from === null || topicId === null || destinationTopicIndex === null || toIndex === null) {
            this.clearSubtopicDrag();
            return;
        }

        if (topicId === destinationTopicIndex && from === toIndex) {
            this.clearSubtopicDrag();
            return;
        }

        // Optimistic reorder in local state
        let moved: SubtopicWithLessons | null = null;
        // Remove from original position
        this.levelResource.value.update((level) => {
            if (!level) return level;
            return {
                ...level,
                topics: level.topics.map((t, index) => {
                    if (t.id !== topicId) return t;
                    const reordered = [...t.subtopics];
                    const [m] = reordered.splice(from, 1);
                    moved = m;
                    return {
                        ...t,
                        subtopics: reordered.map((s, i) => ({ ...s, order: i })),
                    };
                }),
            };
        });

        if (moved === null) {
            this.clearSubtopicDrag();
            return;
        }

        // Insert into detination
        this.levelResource.value.update((level) => {
            if (!level) return level;
            return {
                ...level,
                topics: level.topics.map((t) => {
                    if (t.id !== destinationTopicIndex) return t;
                    const reordered = [...t.subtopics];
                    if (moved === null) return t;
                    reordered.splice(toIndex, 0, moved);
                    return {
                        ...t,
                        subtopics: reordered.map((s, i) => ({ ...s, order: i })),
                    };
                }),
            };
        });


        // Persist new order
        const topico = this.levelResource.value()?.topics.find((t) => t.id === topicId);
        if (topico) {
            const items = topico.subtopics.map((s) => ({ id: s.id, order: s.order, topicId: topico.id }));
            this.curriculumService.reorderSubtopics(items).subscribe();
        }

        const topicd = this.levelResource.value()?.topics.find((t) => t.id === destinationTopicIndex);
        if (topicd) {
            const items = topicd.subtopics.map((s) => ({ id: s.id, order: s.order, topicId: topicd.id }));
            this.curriculumService.reorderSubtopics(items).subscribe();
        }


        this.clearSubtopicDrag();
    }

    protected onSubtopicDragEnd(): void {
        this.clearSubtopicDrag();
    }

    private clearSubtopicDrag(): void {
        this.dragTopicId.set(null);
        this.dragFromIndex.set(null);
        this.dragOverIndex.set(null);
        this.dragOverTopicId.set(null);
    }

    protected onSubtopicListDragOver(event: DragEvent, toTopicId: number): void {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';
        this.dragOverTopicId.set(toTopicId);
    }
}
