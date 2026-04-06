import { ElementType } from "../../types";
import { Lesson } from "../lesson.model";


export class Element {
    id: number;
    text: string;
    style: string;
    type: ElementType;
    lesson: Lesson;

    constructor(element: Element) {
        this.id = element.id;
        this.text = element.text;
        this.style = element.style;
        this.type = element.type;
        this.lesson = element.lesson;
    }
}
