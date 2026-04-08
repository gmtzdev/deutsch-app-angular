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
import { CurriculumService } from '../../core/services/curriculum.service';
import { LevelWithTopics } from '../../core/models/level.model';
import { Topic } from '../../core/models/topic.model';
import { Subtopic } from '../../core/models/subtopic.models';
import { Header } from '../../components/header/header';
import { CreateTopicForm } from './create-topic-form/create-topic-form';
import { CreateSubtopicForm } from "./create-subtopic-form/create-subtopic-form";



@Component({
    selector: 'app-level-shell',
    imports: [Header, RouterLink, RouterOutlet, CreateTopicForm, CreateSubtopicForm],
    templateUrl: './level-shell.html',
    styleUrl: './level-shell.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelShell {
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

    protected readonly expandedTopics = signal<Set<number>>(new Set());

    // ── Topic edit/delete state ───────────────────────────────
    protected readonly editingTopicId = signal<number | null>(null);
    protected readonly editTitle = signal('');
    protected readonly editSubtitle = signal('');
    protected readonly editSaving = signal(false);

    // ── Subtopic edit/delete state ────────────────────────────
    protected readonly editingSubtopicId = signal<number | null>(null);
    protected readonly editSubtopicTitle = signal('');
    protected readonly editSubtopicIcon = signal('');
    protected readonly editSubtopicSaving = signal(false);



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





    protected onTopicSubmited(topic: Topic): void {
        this.levelResource.value.update((level) => {
            if (!level) return level;
            return {
                ...level,
                topics: [...level.topics, { ...topic, subtopics: [] }],
            };
        });
    }

    protected startEditTopic(topic: Topic): void {
        this.editingTopicId.set(topic.id);
        this.editTitle.set(topic.title);
        this.editSubtitle.set(topic.subtitle ?? '');
    }

    protected cancelEditTopic(): void {
        this.editingTopicId.set(null);
        this.editTitle.set('');
        this.editSubtitle.set('');
    }

    protected async confirmEditTopic(event: Event, topicId: number): Promise<void> {
        event.preventDefault();
        const title = this.editTitle().trim();
        if (!title || this.editSaving()) return;
        this.editSaving.set(true);
        try {
            const updated = await firstValueFrom(
                this.curriculumService.updateTopic(topicId, title, this.editSubtitle().trim())
            );
            this.levelResource.value.update((level) => {
                if (!level) return level;
                return {
                    ...level,
                    topics: level.topics.map((t) => t.id === topicId ? { ...t, ...updated } : t),
                };
            });
            this.cancelEditTopic();
        } catch {
            // keep form open on error
        } finally {
            this.editSaving.set(false);
        }
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

    protected startEditSubtopic(subtopic: Subtopic): void {
        this.editingSubtopicId.set(subtopic.id);
        this.editSubtopicTitle.set(subtopic.title);
        this.editSubtopicIcon.set(subtopic.icon ?? '');
    }

    protected cancelEditSubtopic(): void {
        this.editingSubtopicId.set(null);
        this.editSubtopicTitle.set('');
        this.editSubtopicIcon.set('');
    }

    protected async confirmEditSubtopic(event: Event, topicId: number, subtopicId: number): Promise<void> {
        event.preventDefault();
        const title = this.editSubtopicTitle().trim();
        if (!title || this.editSubtopicSaving()) return;
        this.editSubtopicSaving.set(true);
        try {
            const updated = await firstValueFrom(
                this.curriculumService.updateSubtopic(subtopicId, title, this.editSubtopicIcon().trim())
            );
            this.levelResource.value.update((level) => {
                if (!level) return level;
                return {
                    ...level,
                    topics: level.topics.map((t) =>
                        t.id === topicId
                            ? { ...t, subtopics: t.subtopics.map((s) => s.id === subtopicId ? { ...s, ...updated } : s) }
                            : t
                    ),
                };
            });
            this.cancelEditSubtopic();
        } catch {
            // keep form open on error
        } finally {
            this.editSubtopicSaving.set(false);
        }
    }

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

}
