import { Element } from './element.model';

/**
 * Represents an image block in a lesson.
 * - `text`  → image src URL
 * - `style` → alt text / caption
 */
export class ImageBlock extends Element {
    constructor(img: ImageBlock) {
        super(img);
    }
}
