import { Element } from './element.model';

export class Tip extends Element {
    tipTitle: string;

    constructor(tip: Tip) {
        super(tip);
        this.tipTitle = tip.tipTitle ?? '';
    }
}
