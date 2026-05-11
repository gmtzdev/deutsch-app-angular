import { Element } from './element.model';
import { PronunciationItem } from './pronunciation-item.model';

export class PronunciationBlock extends Element {
    items: PronunciationItem[];

    constructor(data: PronunciationBlock) {
        super(data);
        this.items = data.items ?? [];
    }
}
