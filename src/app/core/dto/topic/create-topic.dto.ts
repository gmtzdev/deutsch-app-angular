import { Level } from "../../models/level.model";



export interface CreateTopicDto {
    title: string;
    subtitle: string;
    level: Level;
}
