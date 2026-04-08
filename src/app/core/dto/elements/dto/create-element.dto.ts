import { Lesson } from "../../../models/lesson.model";
import { ElementType } from "../../../types";


export interface CreateElementDto {
    id: number;
    text?: string;
    style?: string;
    type: ElementType;
    order: number;
    lesson: Lesson;
    delete: boolean;
}
