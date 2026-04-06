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


    protected readonly levelResource = resource<LevelWithTopics, string>({
        params: () => this.levelId(),
        loader: ({ params }) =>
            firstValueFrom(this.curriculumService.getLevelWithTopics(params)),
    });

    protected readonly expandedTopics = signal<Set<number>>(new Set());



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



}
