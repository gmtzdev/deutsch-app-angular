import { ElementTypeObj } from "../types";


export class Lesson {
    id: number;
    type: string;
    completed?: boolean;
    elements: ElementTypeObj[];

    constructor(lesson: Lesson) {
        this.id = lesson.id;
        this.type = lesson.type;
        this.completed = lesson.completed;
        this.elements = lesson.elements;
    }
}
