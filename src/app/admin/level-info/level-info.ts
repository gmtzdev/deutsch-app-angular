import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    resource,
    signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AccordionModule } from 'primeng/accordion';
import { CurriculumService } from '../../core/services/curriculum.service';
import { Level, LevelWithTopics } from '../../core/models/level.model';
import { Topic } from '../../core/models/topic.model';

@Component({
    selector: 'app-level-info',
    imports: [RouterLink, AccordionModule],
    templateUrl: './level-info.html',
    styleUrl: './level-info.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelInfo {
    readonly levelId = input.required<string>();

    private readonly curriculumService = inject(CurriculumService);

    readonly levelResource = resource<LevelWithTopics, string>({
        params: () => this.levelId(),
        loader: ({ params }) => firstValueFrom(this.curriculumService.getAllLevelWithTopics(params)),
    });

    readonly topicCount = computed(() => this.levelResource.value()?.topics?.length ?? 0);

    readonly subtopicCount = computed(() => {
        const topics = this.levelResource.value()?.topics ?? [];
        return topics.reduce((acc, topic) => acc + (topic.subtopics?.length ?? 0), 0);
    });

    readonly lessonCount = computed(() => {
        const topics = this.levelResource.value()?.topics ?? [];
        return topics.reduce(
            (acc, topic) => acc + (topic.subtopics?.filter((subtopic) => !!subtopic.lesson).length ?? 0),
            0,
        );
    });

    readonly topicVisibilityLoading = signal<number[]>([]);
    readonly subtopicVisibilityLoading = signal<number[]>([]);

    refresh(): void {
        this.levelResource.reload();
    }

    isTopicVisible(topic: LevelWithTopics['topics'][number]): boolean {
        return topic.visible ?? true;
    }

    isSubtopicVisible(subtopic: LevelWithTopics['topics'][number]['subtopics'][number]): boolean {
        return subtopic.visible ?? true;
    }

    isTopicVisibilityLoading(topicId: number): boolean {
        return this.topicVisibilityLoading().includes(topicId);
    }

    isSubtopicVisibilityLoading(subtopicId: number): boolean {
        return this.subtopicVisibilityLoading().includes(subtopicId);
    }

    async toggleTopicVisibility(topic: LevelWithTopics['topics'][number], event: Event): Promise<void> {
        event.stopPropagation();
        if (this.isTopicVisibilityLoading(topic.id)) return;

        const checked = (event.target as HTMLInputElement).checked;
        this.topicVisibilityLoading.update((ids) => [...ids, topic.id]);

        try {
            const updated = await firstValueFrom(
                this.curriculumService.updateTopic(topic.id, {
                    title: topic.title,
                    subtitle: topic.subtitle ?? '',
                    visible: checked,
                    level: { id: Number(this.levelId()) } as Level,
                }),
            );

            this.levelResource.value.update((level) => {
                if (!level) return level;
                return {
                    ...level,
                    topics: level.topics.map((currentTopic) =>
                        currentTopic.id === topic.id
                            ? { ...currentTopic, ...updated, visible: checked }
                            : currentTopic,
                    ),
                };
            });
        } catch {
            (event.target as HTMLInputElement).checked = this.isTopicVisible(topic);
        } finally {
            this.topicVisibilityLoading.update((ids) => ids.filter((id) => id !== topic.id));
        }
    }

    async toggleSubtopicVisibility(
        topicId: number,
        subtopic: LevelWithTopics['topics'][number]['subtopics'][number],
        event: Event,
    ): Promise<void> {
        event.stopPropagation();
        if (this.isSubtopicVisibilityLoading(subtopic.id)) return;

        const checked = (event.target as HTMLInputElement).checked;
        this.subtopicVisibilityLoading.update((ids) => [...ids, subtopic.id]);

        try {
            const updated = await firstValueFrom(
                this.curriculumService.updateSubtopic(subtopic.id, {
                    title: subtopic.title,
                    icon: subtopic.icon,
                    path: subtopic.path,
                    visible: checked,
                    topic: { id: topicId } as Topic,
                }),
            );

            this.levelResource.value.update((level) => {
                if (!level) return level;
                return {
                    ...level,
                    topics: level.topics.map((topic) =>
                        topic.id !== topicId
                            ? topic
                            : {
                                ...topic,
                                subtopics: topic.subtopics.map((currentSubtopic) =>
                                    currentSubtopic.id === subtopic.id
                                        ? { ...currentSubtopic, ...updated, visible: checked }
                                        : currentSubtopic,
                                ),
                            },
                    ),
                };
            });
        } catch {
            (event.target as HTMLInputElement).checked = this.isSubtopicVisible(subtopic);
        } finally {
            this.subtopicVisibilityLoading.update((ids) => ids.filter((id) => id !== subtopic.id));
        }
    }
}