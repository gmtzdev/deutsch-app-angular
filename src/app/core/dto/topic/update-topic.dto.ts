import { Level } from "../../models/level.model";

export interface UpdateTopicDto {
    title: string;
    subtitle: string;
    visible?: boolean;
    level: Level;
}
