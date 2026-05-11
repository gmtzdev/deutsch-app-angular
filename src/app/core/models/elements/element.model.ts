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
    /** ID compartido entre elementos del mismo grid. null = elemento independiente. */
    gridId?: string | null;
    /** Número de columnas del grid (1 = sin grid, 2–5 con grid). */
    gridCols?: number;

    constructor(element: Element) {
        this.id = element.id;
        this.text = element.text;
        this.style = element.style;
        this.type = element.type;
        this.order = element.order;
        this.lesson = element.lesson;
        this.gridId = element.gridId ?? null;
        this.gridCols = element.gridCols ?? 1;
    }
}
