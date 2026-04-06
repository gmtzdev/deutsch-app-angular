import { Lesson } from "./lesson.model";
import { Topic } from "./topic.model";


export class Subtopic {
    id: number;
    title: string;
    icon: string;
    path: string;
    topic: Topic;

    constructor(subtopic: Subtopic) {
        this.id = subtopic.id;
        this.title = subtopic.title;
        this.icon = subtopic.icon;
        this.path = subtopic.path;
        this.topic = subtopic.topic;
    }
}


export interface SubtopicWithLessons extends Subtopic {
    lesson: Lesson;
}
