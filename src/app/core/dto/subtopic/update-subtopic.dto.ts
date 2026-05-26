import { Topic } from "../../models/topic.model";

export interface UpdateSubtopicDto {
    title: string
    icon?: string
    path?: string
    topic: Topic
}
