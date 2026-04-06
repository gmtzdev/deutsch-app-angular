import { Topic, TopicWithSubtopics } from "./topic.model";

export class Level {

    id: number;
    title: string;
    description: string;
    icon: string;
    tag: string;

    lessonNumber: number;
    color: string;

    topics: Topic[];


    constructor(level: Level) {
        this.id = level.id;
        this.title = level.title;
        this.description = level.description;
        this.icon = level.icon;
        this.tag = level.tag;
        this.lessonNumber = level.lessonNumber;
        this.color = level.color;
        this.topics = level.topics;
    }
}


export interface LevelWithTopics extends Level {
    topics: TopicWithSubtopics[];
}