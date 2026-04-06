import {
    Component,
    ChangeDetectionStrategy,
    inject,
    input,
    resource,
    effect,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CurriculumService } from '../../core/services/curriculum.service';
import { TopicWithSubtopics } from '../../core/models/topic.model';
import { SubtopicWithLessons } from '../../core/models/subtopic.models';
import { LessonTitle } from './elements/lesson-title';
import { LessonSubtitle } from './elements/lesson-subtitle';
import { LessonParagraph } from './elements/lesson-paragraph';
import { LessonUnorderedList } from './elements/lesson-unordered-list';

@Component({
    selector: 'app-topic-view',
    imports: [LessonTitle, LessonSubtitle, LessonParagraph, LessonUnorderedList],
    templateUrl: './topic-view.html',
    styleUrls: ['./topic-view.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicView {
    readonly topicId = input.required<string>();
    readonly subtopicId = input.required<string>();

    private readonly curriculumService = inject(CurriculumService);

    protected readonly topicResource = resource<TopicWithSubtopics, string>({
        params: () => this.topicId(),
        loader: ({ params }) => firstValueFrom(this.curriculumService.getTopicWithSubtopics(params)),
    });

    protected readonly subtopicResource = resource<SubtopicWithLessons, string>({
        params: () => this.subtopicId(),
        loader: ({ params }) => firstValueFrom(this.curriculumService.getSubtopicWithLessons(params)),

    });

    constructor() {
        effect(() => {
            const subtopicId = this.subtopicResource.value();
            console.log('Subtopic changed:', subtopicId);
        });
    }
}
