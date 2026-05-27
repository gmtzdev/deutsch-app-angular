import { Element } from './element.model';
import { FillBlankRow } from './fill-blank-row.model';

export class FillBlankExercise extends Element {
    rows: FillBlankRow[];

    constructor(ex: FillBlankExercise) {
        super(ex);
        this.rows = ex.rows ?? [];
    }
}
