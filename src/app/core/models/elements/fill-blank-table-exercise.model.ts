import { Element } from './element.model';
import { FillBlankRow } from './fill-blank-row.model';

export class FillBlankTableExercise extends Element {
    rows: FillBlankRow[];

    constructor(ex: FillBlankTableExercise) {
        super(ex);
        this.rows = ex.rows ?? [];
    }
}
