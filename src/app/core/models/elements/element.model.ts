import { ElementType } from "../../types";
import { Lesson } from "../lesson.model";


export class Element {
    id: number;
    text: string;
    style: string;
    type: ElementType;
    order: number;
    lesson: Lesson;
    delete: boolean = false;

    constructor(element: Element) {
        this.id = element.id;
        this.text = element.text;
        this.style = element.style;
        this.type = element.type;
        this.order = element.order;
        this.lesson = element.lesson;
    }
}
