// import { Level } from "../../levels/entities/level.entity";
// import { Subtopic } from "../../subtopics/entities/subtopic.entity";

import { SubtopicWithLessons } from "./subtopic.models";

export class Topic {
    id: number;
    title: string;
    subtitle: string;

    // level: Level;

    // subtopics: Subtopic[];

    constructor(
        topic: Topic
        // partial: Partial<Topic>
    ) {
        // Object.assign(this, partial);
        this.id = topic.id;
        this.title = topic.title;
        this.subtitle = topic.subtitle;
        // this.level = topic.level;
        // this.subtopics = topic.subtopics;
    }
}

export interface TopicWithSubtopics extends Topic {
    subtopics: SubtopicWithLessons[];
}
