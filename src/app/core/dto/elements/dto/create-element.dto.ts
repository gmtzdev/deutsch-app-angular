import { Lesson } from "../../../models/lesson.model";
import { ElementType } from "../../../types";


export interface CreateElementDto {
    text?: string;
    style?: string;
    type: ElementType;
    lesson: Lesson;
}
