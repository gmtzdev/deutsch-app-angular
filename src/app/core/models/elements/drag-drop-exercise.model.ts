import { Element } from './element.model';
import { DragDropRow } from './drag-drop-row.model';

export class DragDropExercise extends Element {
    words: string[];
    rows: DragDropRow[];

    constructor(ex: DragDropExercise) {
        super(ex);
        this.words = ex.words ?? [];
        this.rows = ex.rows ?? [];
    }
}
