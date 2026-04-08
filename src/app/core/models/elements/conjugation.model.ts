import { Element } from './element.model';
import { VerbData } from './verb-data.model';

export class Conjugation extends Element {
    verbs: VerbData[];

    constructor(conjugation: Conjugation) {
        super(conjugation);
        this.verbs = conjugation.verbs ?? [];
    }
}
