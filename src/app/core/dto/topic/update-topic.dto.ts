import { Level } from "../../models/level.model";

export interface UpdateTopicDto {
    title: string;
    subtitle: string;
    level: Level;
}
