import { Topic } from "../../models/topic.model";

export interface CreateSubtopicDto {
    title: string;

    icon: string;

    path: string;

    topic: Topic;
}
