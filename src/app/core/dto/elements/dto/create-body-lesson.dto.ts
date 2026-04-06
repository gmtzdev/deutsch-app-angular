import { Lesson } from "../../../models/lesson.model";
import { LessonElementDto } from "../../../types";


export class CreateBodyLessonDto {
    elements: LessonElementDto[];
    lesson: Lesson;

    constructor(elements: LessonElementDto[], lesson: Lesson) {
        this.elements = elements;
        this.lesson = lesson;
    }
}